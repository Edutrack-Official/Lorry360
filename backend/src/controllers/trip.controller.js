const Trip = require('../models/trip.model');
const Customer = require('../models/customer.model');
const Driver = require('../models/driver.model');
const Crusher = require('../models/crusher.model');
const Lorry = require('../models/lorry.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const Collaboration = require('../models/collaboration.model');

const createTrip = async (tripData) => {
  const {
    owner_id,
    lorry_id,
    driver_id,
    crusher_id,
    material_name,
    rate_per_unit,
    no_of_unit_crusher,
    no_of_unit_customer,
    crusher_amount,
    customer_id,
    collab_owner_id,
    location,
    customer_amount,
    include_gst,
    gst_values,
    is_customer_amount_inclusive_gst,
    customer_gst_percentage,
    trip_date,
    dc_number,
    notes
  } = tripData;

  // Prepare data for database - remove empty strings
  const dbData = {
    owner_id,
    lorry_id,
    driver_id,
    crusher_id,
    material_name,
    rate_per_unit,
    no_of_unit_crusher,
    no_of_unit_customer,
    crusher_amount,
    location,
    customer_amount,
    trip_date: trip_date || new Date(),
    dc_number,
    notes,
    isActive: true // Added: New trips are always active
  };

  // Add GST fields if provided
  if (include_gst !== undefined) {
    dbData.include_gst = include_gst;

    // If include_gst is true, set default GST values if not provided
    if (include_gst) {
      dbData.gst_values = {
        SGST: gst_values?.SGST || "2.5%",
        CGST: gst_values?.CGST || "2.5%",
        IGST: gst_values?.IGST || "0%"
      };
    }
  }

  // If gst_values is provided separately, use it
  if (gst_values) {
    dbData.gst_values = gst_values;
  }

  // Add GST fields if provided
  if (is_customer_amount_inclusive_gst !== undefined) {
    dbData.is_customer_amount_inclusive_gst = is_customer_amount_inclusive_gst;
  }

  if (customer_gst_percentage !== undefined) {
    dbData.customer_gst_percentage = customer_gst_percentage;
  }

  // Only include customer_id if it's not empty
  if (customer_id && customer_id !== "") {
    dbData.customer_id = customer_id;
  }

  // Only include collab_owner_id if it's not empty
  if (collab_owner_id && collab_owner_id !== "") {
    dbData.collab_owner_id = collab_owner_id;
  }

  // Validate required fields
  if (!owner_id || !lorry_id || !driver_id || !crusher_id || !material_name ||
    !rate_per_unit || !no_of_unit_crusher || !no_of_unit_customer || !crusher_amount ||
    !location || !customer_amount) {
    const err = new Error('All required fields must be provided');
    err.status = 400;
    throw err;
  }

  // Validate destination - either customer or collaborative owner must be provided (and not empty)
  if ((!customer_id || customer_id === "") && (!collab_owner_id || collab_owner_id === "")) {
    const err = new Error('Either customer or collaborative owner must be specified');
    err.status = 400;
    throw err;
  }

  // Generate trip number with monthly reset and retry logic for duplicates
  let newTrip;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Find the highest trip number for current month with retry-safe method
      const highestTrip = await Trip.findOne(
        {
          isActive: true,
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        },
        { trip_number: 1 },
        { sort: { trip_number: -1 } }
      );

      let nextNumber = 1;
      if (highestTrip && highestTrip.trip_number) {
        // Extract the sequential number from the trip number
        const match = highestTrip.trip_number.match(/TR\d{6}(\d{4})/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const trip_number = `TR${yearMonth}${String(nextNumber).padStart(4, '0')}`;

      // Calculate profit
      const profit = customer_amount - crusher_amount;

      // Add generated fields to dbData
      dbData.trip_number = trip_number;
      dbData.profit = profit;

      newTrip = new Trip(dbData);
      await newTrip.save();
      break; // Success - exit the retry loop

    } catch (error) {
      retryCount++;

      // If it's not a duplicate key error, or we've reached max retries, throw the error
      if (!error.message.includes('duplicate key') || retryCount >= maxRetries) {
        console.error(`Failed to create trip after ${retryCount} attempts:`, error.message);

        // Create a more user-friendly error message
        const err = new Error(retryCount >= maxRetries
          ? 'Unable to generate unique trip number. Please try again.'
          : error.message);
        err.status = error.status || 500;
        throw err;
      }

      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount)));
      console.log(`Retrying trip creation (attempt ${retryCount + 1}/${maxRetries})...`);
    }
  }

  return newTrip;
};

const getAllTrips = async (current_user_id, filterParams = {}) => {
  const {
    status,
    start_date,
    end_date,
    lorry_id,
    driver_id,
    customer_id,
    collab_owner_id,
    trip_type,
    crusher_id,
    fetch_mode = 'as_owner',
    include_inactive = false // Added: Optional parameter to include inactive trips
  } = filterParams;

  let query = {};

  if (fetch_mode === 'as_collaborator') {
    // When user is the collaborator (Partner Trips to Me)
    // Current user = collab_owner_id
    // Partner = owner_id (must be specified in collab_owner_id param)
    if (!collab_owner_id) {
      throw new Error('collab_owner_id is required when fetch_mode is "as_collaborator"');
    }

    query.collab_owner_id = current_user_id; // Current user is collaborator
    query.owner_id = collab_owner_id; // This is actually the partner (owner)

  } else {
    // Default: user is the owner (My Trips to Partner)
    // Current user = owner_id
    query.owner_id = current_user_id; // Current user is owner

    // If collab_owner_id is provided, filter by specific collaborator
    // If not provided and trip_type is collaborative, get all collaborative trips
    if (collab_owner_id) {
      query.collab_owner_id = collab_owner_id; // Specific partner
    }
  }

  // Only show ACTIVE trips by default (unless include_inactive is true)
  if (!include_inactive) {
    query.isActive = true; // Added: Filter by active trips
  }

  // Additional filters
  if (status) query.status = status;
  if (lorry_id) query.lorry_id = lorry_id;
  if (driver_id) query.driver_id = driver_id;
  if (crusher_id) query.crusher_id = crusher_id;

  // Filter by destination type
  if (trip_type === 'customer') {
    query.customer_id = { $exists: true, $ne: null };
    // For customer trips, collab_owner_id should be null
    query.collab_owner_id = null;
  } else if (trip_type === 'collaborative') {
    // For collaborative trips, collab_owner_id should exist
    if (!query.collab_owner_id) {
      // Only add this if collab_owner_id wasn't already set
      query.collab_owner_id = { $exists: true, $ne: null };
    }
  }

  if (customer_id) query.customer_id = customer_id;

  // Date range filter
  if (start_date || end_date) {
    query.trip_date = {};
    if (start_date) query.trip_date.$gte = new Date(start_date);
    if (end_date) query.trip_date.$lte = new Date(end_date);
  }

  const trips = await Trip.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('collab_owner_id', 'name company_name phone')
    .populate('owner_id', 'name company_name phone')
    .sort({ trip_date: -1, createdAt: -1 });

  return {
    count: trips.length,
    trips
  };
};

// Get trips where I am the collaborative owner (trips delivered to me)
const getCollaborativeTripsForMe = async (collab_owner_id, filterParams = {}) => {
  const { status, start_date, end_date, owner_id, include_inactive = false } = filterParams;
  const query = {
    collab_owner_id,
    isActive: !include_inactive ? true : { $exists: true } // Added: Filter by active trips
  };

  if (status) query.status = status;
  if (owner_id) query.owner_id = owner_id;

  // Date range filter
  if (start_date || end_date) {
    query.trip_date = {};
    if (start_date) query.trip_date.$gte = new Date(start_date);
    if (end_date) query.trip_date.$lte = new Date(end_date);
  }

  const trips = await Trip.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('owner_id', 'name company_name phone')
    .sort({ trip_date: -1, createdAt: -1 });

  return {
    count: trips.length,
    trips
  };
};

const getTripById = async (id, owner_id, include_inactive = false) => {
  const query = {
    _id: id,
    owner_id
  };

  // Only show ACTIVE trips by default (unless include_inactive is true)
  if (!include_inactive) {
    query.isActive = true; // Added: Filter by active trips
  }

  const trip = await Trip.findOne(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone address')
    .populate('collab_owner_id', 'name company_name phone email');

  if (!trip) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }
  return trip;
};

// Get trip by ID for collaborative owner (when I'm the destination)
const getCollaborativeTripById = async (id, collab_owner_id, include_inactive = false) => {
  const query = {
    _id: id,
    collab_owner_id
  };

  // Only show ACTIVE trips by default (unless include_inactive is true)
  if (!include_inactive) {
    query.isActive = true; // Added: Filter by active trips
  }

  const trip = await Trip.findOne(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('owner_id', 'name company_name phone email');

  if (!trip) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }
  return trip;
};

const updateTrip = async (id, owner_id, updateData) => {
  console.log("updateData:", updateData);

  // Make a copy to avoid mutating the original
  const processedData = { ...updateData };

  // Handle empty strings - convert to null
  if (processedData.customer_id === "") {
    processedData.customer_id = null;
  }

  if (processedData.collab_owner_id === "") {
    processedData.collab_owner_id = null;
  }

  // Determine which destination to keep
  // If collab_owner_id has value, nullify customer_id
  if (processedData.collab_owner_id) {
    processedData.customer_id = null;
  }

  // If customer_id has value, nullify collab_owner_id
  if (processedData.customer_id) {
    processedData.collab_owner_id = null;
  }

  // Handle GST values if include_gst is being updated
  if (processedData.include_gst !== undefined) {
    if (processedData.include_gst === true) {
      // If turning GST on, ensure gst_values exist with defaults
      if (!processedData.gst_values) {
        processedData.gst_values = {
          SGST: "2.5%",
          CGST: "2.5%",
          IGST: "0%"
        };
      }
    } else if (processedData.include_gst === false) {
      // If turning GST off, keep the values but they won't be used
      // Or you could reset them if you prefer
      // processedData.gst_values = {
      //   SGST: "0%",
      //   CGST: "0%",
      //   IGST: "0%"
      // };
    }
  }

  console.log("processedData:", processedData);

  // Check if trip exists and is ACTIVE
  const existingTrip = await Trip.findOne({
    _id: id,
    owner_id,
    isActive: true // Added: Only update active trips
  });



  if (!existingTrip) {
    const err = new Error('Trip not found or is inactive');
    err.status = 404;
    throw err;
  }

  if (existingTrip.collab_trip_status == 'approved') {
    const err = new Error('Cannot update an approved collaborative trip');
    err.status = 400;
    throw err;
  }


  // Check final state
  const finalCustomerId = processedData.customer_id !== undefined
    ? processedData.customer_id
    : existingTrip.customer_id;

  const finalCollabOwnerId = processedData.collab_owner_id !== undefined
    ? processedData.collab_owner_id
    : existingTrip.collab_owner_id;

  if (!finalCustomerId && !finalCollabOwnerId) {
    const err = new Error('Either customer or collaborative owner must be specified');
    err.status = 400;
    throw err;
  }

  // Recalculate profit
  if (processedData.customer_amount || processedData.crusher_amount) {
    const newCustomerAmount = processedData.customer_amount || existingTrip.customer_amount;
    const newCrusherAmount = processedData.crusher_amount || existingTrip.crusher_amount;
    processedData.profit = newCustomerAmount - newCrusherAmount;
  }

  const updatedTrip = await Trip.findOneAndUpdate(
    {
      _id: id,
      owner_id,
      isActive: true // Added: Only update active trips
    },
    processedData,
    { new: true, runValidators: true }
  )
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('collab_owner_id', 'name company_name phone');

  if (!updatedTrip) {
    const err = new Error('Trip not found or update failed');
    err.status = 404;
    throw err;
  }

  return updatedTrip;
};

const deleteTrip = async (id, owner_id) => {
  // Step 1: Check if trip exists and is ACTIVE
  const trip = await Trip.findOne({
    _id: id,
    owner_id,
    isActive: true // Added: Only delete active trips
  });

  if (!trip) {
    const err = new Error('Trip not found, is inactive, or delete failed');
    err.status = 404;
    throw err;
  }

  // Step 2: SOFT DELETE - Set isActive to false
  await Trip.findOneAndUpdate(
    { _id: id, owner_id },
    { $set: { isActive: false } }
  );

  return {
    message: 'Trip soft deleted successfully',
    trip_id: id,
    trip_number: trip.trip_number
  };
};

const updateTripStatus = async (id, owner_id, status) => {
  // First, find the existing trip to check its collab_trip_status
  const existingTrip = await Trip.findOne({
    _id: id,
    owner_id,
    isActive: true
  });

  if (!existingTrip) {
    const err = new Error('Trip not found or is inactive');
    err.status = 404;
    throw err;
  }

  // Check if it's an approved collaborative trip
  if (existingTrip.collab_trip_status === 'approved') {
    const err = new Error('Cannot update an approved collaborative trip');
    err.status = 400;
    throw err;
  }

  const updateData = { status };

  // Set timestamps based on status
  const now = new Date();
  switch (status) {
    case 'dispatched':
      updateData.dispatched_at = now;
      break;
    case 'loaded':
      updateData.loaded_at = now;
      break;
    case 'delivered':
      updateData.delivered_at = now;
      break;
    case 'completed':
      updateData.completed_at = now;
      break;
  }

  const updatedTrip = await Trip.findOneAndUpdate(
    {
      _id: id,
      owner_id,
      isActive: true
    },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('collab_owner_id', 'name company_name phone');

  return updatedTrip;
};
// Get trip statistics with collaborative support
const getTripStats = async (owner_id, period = 'month') => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const trips = await Trip.find({
    owner_id,
    isActive: true, // Added: Only count active trips
    trip_date: { $gte: startDate },
    $or: [
      { status: "completed" },
      { status: "delivered" }
    ]
  });

  const customerTrips = trips.filter(trip => trip.customer_id);
  const collaborativeTrips = trips.filter(trip => trip.collab_owner_id);

  const totalTrips = trips.length;
  const totalRevenue = trips.reduce((sum, trip) => sum + trip.customer_amount, 0);
  const totalCost = trips.reduce((sum, trip) => sum + trip.crusher_amount, 0);
  const totalProfit = trips.reduce((sum, trip) => sum + trip.profit, 0);

  // Calculate total units
  const totalCrusherUnits = trips.reduce((sum, trip) => sum + trip.no_of_unit_crusher, 0);
  const totalCustomerUnits = trips.reduce((sum, trip) => sum + trip.no_of_unit_customer, 0);

  return {
    period,
    total_trips: totalTrips,
    customer_trips: customerTrips.length,
    collaborative_trips: collaborativeTrips.length,
    total_revenue: totalRevenue,
    total_cost: totalCost,
    total_profit: totalProfit,
    total_crusher_units: totalCrusherUnits,
    total_customer_units: totalCustomerUnits,
    average_profit_per_trip: totalTrips > 0 ? totalProfit / totalTrips : 0,
    average_revenue_per_trip: totalTrips > 0 ? totalRevenue / totalTrips : 0
  };
};

// Get trips analytics with collaborative support
const getTripsAnalytics = async (owner_id, start_date, end_date, include_inactive = false) => {
  const query = {
    owner_id,
    isActive: !include_inactive ? true : { $exists: true }, // Added: Filter by active trips
    trip_date: {
      $gte: new Date(start_date),
      $lte: new Date(end_date)
    }
  };

  const trips = await Trip.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('collab_owner_id', 'name company_name phone')
    .sort({ trip_date: 1 });

  const analytics = {
    summary: {
      total_trips: trips.length,
      customer_trips: trips.filter(t => t.customer_id).length,
      collaborative_trips: trips.filter(t => t.collab_owner_id).length,
      total_revenue: trips.reduce((sum, trip) => sum + trip.customer_amount, 0),
      total_cost: trips.reduce((sum, trip) => sum + trip.crusher_amount, 0),
      total_profit: trips.reduce((sum, trip) => sum + trip.profit, 0),
      total_crusher_units: trips.reduce((sum, trip) => sum + trip.no_of_unit_crusher, 0),
      total_customer_units: trips.reduce((sum, trip) => sum + trip.no_of_unit_customer, 0),
      active_trips_only: !include_inactive // Added: Indicate if only active trips are included
    },
    by_lorry: {},
    by_driver: {},
    by_customer: {},
    by_collab_owner: {},
    by_status: {},
    daily_breakdown: {}
  };

  // Group by various criteria
  trips.forEach(trip => {
    // By lorry
    const lorryName = trip.lorry_id?.registration_number || 'Unknown';
    if (!analytics.by_lorry[lorryName]) {
      analytics.by_lorry[lorryName] = { trips: 0, revenue: 0, profit: 0 };
    }
    analytics.by_lorry[lorryName].trips += 1;
    analytics.by_lorry[lorryName].revenue += trip.customer_amount;
    analytics.by_lorry[lorryName].profit += trip.profit;

    // By driver
    const driverName = trip.driver_id?.name || 'Unknown';
    if (!analytics.by_driver[driverName]) {
      analytics.by_driver[driverName] = { trips: 0, revenue: 0, profit: 0 };
    }
    analytics.by_driver[driverName].trips += 1;
    analytics.by_driver[driverName].revenue += trip.customer_amount;
    analytics.by_driver[driverName].profit += trip.profit;

    // By customer
    if (trip.customer_id) {
      const customerName = trip.customer_id?.name || 'Unknown';
      if (!analytics.by_customer[customerName]) {
        analytics.by_customer[customerName] = { trips: 0, revenue: 0, profit: 0 };
      }
      analytics.by_customer[customerName].trips += 1;
      analytics.by_customer[customerName].revenue += trip.customer_amount;
      analytics.by_customer[customerName].profit += trip.profit;
    }

    // By collaborative owner
    if (trip.collab_owner_id) {
      const collabOwnerName = trip.collab_owner_id?.name || trip.collab_owner_id?.company_name || 'Unknown';
      if (!analytics.by_collab_owner[collabOwnerName]) {
        analytics.by_collab_owner[collabOwnerName] = { trips: 0, revenue: 0, profit: 0 };
      }
      analytics.by_collab_owner[collabOwnerName].trips += 1;
      analytics.by_collab_owner[collabOwnerName].revenue += trip.customer_amount;
      analytics.by_collab_owner[collabOwnerName].profit += trip.profit;
    }

    // By status
    if (!analytics.by_status[trip.status]) {
      analytics.by_status[trip.status] = 0;
    }
    analytics.by_status[trip.status] += 1;

    // Daily breakdown
    const dateStr = trip.trip_date.toISOString().split('T')[0];
    if (!analytics.daily_breakdown[dateStr]) {
      analytics.daily_breakdown[dateStr] = { trips: 0, revenue: 0, profit: 0 };
    }
    analytics.daily_breakdown[dateStr].trips += 1;
    analytics.daily_breakdown[dateStr].revenue += trip.customer_amount;
    analytics.daily_breakdown[dateStr].profit += trip.profit;
  });

  return {
    trips,
    analytics
  };
};

// Get form data for creating/editing trips with collaborative owners
const getTripFormData = async (owner_id) => {
  // Fetch all data in parallel for better performance
  const [customers, drivers, crushers, lorries, collaborativeOwners] = await Promise.all([
    // Customers with only name, address and site_addresses
    Customer.find({ owner_id, isActive: true })
      .select('name address site_addresses')
      .sort({ name: 1 }),

    // Drivers with only name
    Driver.find({ owner_id, status: 'active', isActive: true })
      .select('name')
      .sort({ name: 1 }),

    // Crushers with name and materials
    Crusher.find({ owner_id, isActive: true }) // Added: isActive filter
      .select('name materials')
      .sort({ name: 1 }),

    // Lorries with registration number and nick name
    Lorry.find({ owner_id, isActive: true })
      .select('registration_number nick_name')
      .sort({ registration_number: 1 }),

    // Collaborative owners (other users I collaborate with)
    User.find({
      _id: { $ne: owner_id },
      isActive: true
    })
      .select('name company_name phone email')
      .sort({ name: 1 })
  ]);

  // Prepare the response data with only required fields
  const formData = {
    customers: customers.map(customer => ({
      _id: customer._id,
      name: customer.name,
      address: customer.address,
      site_addresses: customer.site_addresses || []
    })),
    drivers: drivers.map(driver => ({
      _id: driver._id,
      name: driver.name
    })),
    crushers: crushers.map(crusher => ({
      _id: crusher._id,
      name: crusher.name,
      materials: crusher.materials
    })),
    lorries: lorries.map(lorry => ({
      _id: lorry._id,
      registration_number: lorry.registration_number,
      nick_name: lorry.nick_name
    })),
    collaborative_owners: collaborativeOwners.map(owner => ({
      _id: owner._id,
      name: owner.name,
      company_name: owner.company_name,
      phone: owner.phone,
      email: owner.email
    }))
  };

  return formData;
};

// Get all trips for a specific customer (with owner security)
const getTripsByCustomerId = async (owner_id, customer_id, filterParams = {}) => {
  const { status, start_date, end_date, include_inactive = false } = filterParams;
  const query = {
    owner_id, // Security: Only show trips belonging to this owner
    customer_id,
    isActive: !include_inactive ? true : { $exists: true } // Added: Filter by active trips
  };

  if (status) query.status = status;

  // Date range filter
  if (start_date || end_date) {
    query.trip_date = {};
    if (start_date) query.trip_date.$gte = new Date(start_date);
    if (end_date) query.trip_date.$lte = new Date(end_date);
  }

  const trips = await Trip.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('owner_id', 'name company_name phone')
    .sort({ trip_date: -1, createdAt: -1 });

  return {
    count: trips.length,
    trips
  };
};

// Get all trips for a specific crusher (with owner security)
const getTripsByCrusherId = async (owner_id, crusher_id, filterParams = {}) => {
  const { status, start_date, end_date, include_inactive = false } = filterParams;
  const query = {
    owner_id, // Security: Only show trips belonging to this owner
    crusher_id,
    isActive: !include_inactive ? true : { $exists: true } // Added: Filter by active trips
  };

  if (status) query.status = status;

  // Date range filter
  if (start_date || end_date) {
    query.trip_date = {};
    if (start_date) query.trip_date.$gte = new Date(start_date);
    if (end_date) query.trip_date.$lte = new Date(end_date);
  }

  const trips = await Trip.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('owner_id', 'name company_name phone')
    .populate('collab_owner_id', 'name company_name phone')
    .sort({ trip_date: -1, createdAt: -1 });

  return {
    count: trips.length,
    trips
  };
};

const getInvoiceData = async (owner_id, customer_id, from_date, to_date, include_inactive = false) => {
  try {
    // 1. Get current user (owner) details for company header
    const owner = await User.findById(owner_id).select('name company_name address city state pincode phone logo gst_number');

    console.log("Owner details:", owner);
    if (!owner) {
      const err = new Error('Owner not found');
      err.status = 404;
      throw err;
    }

    // 2. Get customer details
    const customer = await Customer.findOne({
      _id: customer_id,
      owner_id,
      isActive: true // Added: Only active customers
    }).select('name phone address site_addresses');

    if (!customer) {
      const err = new Error('Customer not found or is inactive');
      err.status = 404;
      throw err;
    }

    // 3. Get trips for the customer in the date range
    const tripsQuery = {
      owner_id,
      customer_id,
      isActive: !include_inactive ? true : { $exists: true }, // Added: Filter by active trips
      trip_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      },
      status: { $in: ['delivered', 'completed'] }
    };

    const trips = await Trip.find(tripsQuery)
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('crusher_id', 'name')
      .sort({ trip_date: 1 });

    if (trips.length === 0) {
      const err = new Error('No trips found for the selected customer in the specified date range');
      err.status = 404;
      throw err;
    }

    // 4. Get all payments within the date range
    const payments = await Payment.find({
      owner_id,
      customer_id,
      payment_type: 'from_customer',
      isActive: true, // Added: Only active payments
      payment_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      }
    }).sort({ payment_date: 1 });

    // 5. Group trips by material, quantity, location, price AND customer_amount (exact match)
    const groupedTrips = {};

    trips.forEach(trip => {
      const tripDate = trip.trip_date.toISOString().split('T')[0];
      const groupKey = `${tripDate}_${trip.material_name}_${trip.no_of_unit_customer}_${trip.location}_${trip.rate_per_unit}_${trip.customer_amount}`;

      if (!groupedTrips[groupKey]) {
        groupedTrips[groupKey] = {
          date: tripDate,
          material_name: trip.material_name,
          quantity: trip.no_of_unit_customer,
          location: trip.location,
          rate_per_unit: trip.rate_per_unit,
          customer_amount: trip.customer_amount,
          no_of_loads: 0,
          total_amount: 0,
          trips: []
        };
      }

      // Keep the same quantity (don't sum), just count loads and sum amounts
      groupedTrips[groupKey].no_of_loads += 1;
      groupedTrips[groupKey].total_amount += trip.customer_amount;
      groupedTrips[groupKey].trips.push(trip);

      // Keep the earliest date for the group
      if (new Date(tripDate) < new Date(groupedTrips[groupKey].date)) {
        groupedTrips[groupKey].date = tripDate;
      }
    });

    // Convert to array and sort by date
    const groupedTripArray = Object.values(groupedTrips).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // 6. Get running balance (sum of all customer_amount from previous trips minus payments)
    const previousTripsQuery = {
      owner_id,
      customer_id,
      isActive: !include_inactive ? true : { $exists: true }, // Added: Filter by active trips
      trip_date: { $lt: new Date(from_date) },
      status: { $in: ['delivered', 'completed'] }
    };

    const previousTrips = await Trip.find(previousTripsQuery);

    const previousPayments = await Payment.find({
      owner_id,
      customer_id,
      payment_type: 'from_customer',
      isActive: true, // Added: Only active payments
      payment_date: { $lt: new Date(from_date) }
    });

    const previousTripsAmount = previousTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
    const previousPaymentsAmount = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    let runningBalance = previousTripsAmount - previousPaymentsAmount;

    // 7. Create table rows combining grouped trips and payments
    const tableRows = [];
    let currentBalance = runningBalance;

    // Add "BALANCE AS OF [from_date - 1 day]" at the top
    const fromDateObj = new Date(from_date);
    const previousDay = new Date(fromDateObj);
    previousDay.setDate(fromDateObj.getDate() - 1);

    const openingBalanceRow = {
      s_no: '',
      date: '',
      particular: `BALANCE AS OF ${previousDay.toLocaleDateString('en-IN')}`,
      quantity: '',
      location: '',
      price: '',
      no_of_loads: '',
      total_amount: '',
      amount_received: '',
      balance: `₹${runningBalance.toLocaleString('en-IN')}`,
      is_balance_row: true,
      is_opening_balance: true,
      note: include_inactive ? 'Includes inactive trips' : 'Active trips only'
    };
    tableRows.push(openingBalanceRow);

    // Combine grouped trips and payments and sort by date
    const allTransactions = [
      ...groupedTripArray.map(group => ({
        type: 'grouped_trip',
        date: group.date,
        data: group,
        sortDate: new Date(group.date)
      })),
      ...payments.map(payment => ({
        type: 'payment',
        date: payment.payment_date,
        data: payment,
        sortDate: new Date(payment.payment_date)
      }))
    ].sort((a, b) => a.sortDate - b.sortDate);

    // Generate table rows with running balance
    allTransactions.forEach(transaction => {
      if (transaction.type === 'grouped_trip') {
        const group = transaction.data;

        const row = {
          s_no: tableRows.length,
          date: transaction.date,
          particular: group.material_name,
          quantity: `${group.quantity} Unit`,
          location: group.location,
          price: `₹${group.customer_amount.toLocaleString('en-IN')}`,
          no_of_loads: group.no_of_loads,
          total_amount: `₹${group.total_amount.toLocaleString('en-IN')}`,
          amount_received: '-',
          balance: `₹${(currentBalance + group.total_amount).toLocaleString('en-IN')}`,
          is_grouped: true,
          group_details: group.trips.map(trip => ({
            trip_id: trip._id,
            trip_number: trip.trip_number,
            units: trip.no_of_unit_customer,
            amount: trip.customer_amount,
            lorry: trip.lorry_id?.registration_number,
            driver: trip.driver_id?.name,
            date: trip.trip_date,
            is_active: trip.isActive
          }))
        };

        tableRows.push(row);
        currentBalance += group.total_amount;
      } else if (transaction.type === 'payment') {
        const payment = transaction.data;

        const row = {
          s_no: tableRows.length,
          date: transaction.date.toISOString().split('T')[0],
          particular: 'PAYMENT RECEIVED',
          quantity: '-',
          location: '-',
          price: '-',
          no_of_loads: '-',
          total_amount: '-',
          amount_received: `₹${payment.amount.toLocaleString('en-IN')}`,
          balance: `₹${(currentBalance - payment.amount).toLocaleString('en-IN')}`,
          is_payment: true,
          payment_id: payment._id
        };

        tableRows.push(row);
        currentBalance -= payment.amount;
      }
    });

    // Add "BALANCE AS OF [to_date]" at the bottom
    const closingBalanceRow = {
      s_no: '',
      date: '',
      particular: `BALANCE AS OF ${new Date(to_date).toLocaleDateString('en-IN')}`,
      quantity: '',
      location: '',
      price: '',
      no_of_loads: '',
      total_amount: '',
      amount_received: '',
      balance: `₹${currentBalance.toLocaleString('en-IN')}`,
      is_balance_row: true,
      is_closing_balance: true
    };
    tableRows.push(closingBalanceRow);

    // 8. Calculate totals
    const totalTripsAmount = trips.reduce((sum, trip) => sum + trip.customer_amount, 0);
    const totalPaymentsAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // 9. Prepare invoice data structure
    const invoiceData = {
      // Company/Supplier Information (from owner)
      supplier: {
        name: owner.company_name || owner.name,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode,
        phone: owner.phone,
        full_address: `${owner.address}, ${owner.city}, ${owner.state} - ${owner.pincode}`,
        logo: owner.logo || null,
        gst_number: owner.gst_number || null
      },

      // Customer Information
      customer: {
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        site_addresses: customer.site_addresses || [],
        is_active: customer.isActive
      },

      // Invoice Details
      invoice_details: {
        invoice_number: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        from_date: from_date,
        to_date: to_date,
        period: `${new Date(from_date).toLocaleDateString('en-IN')} to ${new Date(to_date).toLocaleDateString('en-IN')}`,
        opening_balance_date: previousDay.toISOString().split('T')[0],
        closing_balance_date: to_date,
        include_inactive_trips: include_inactive,
        note: include_inactive ? 'Invoice includes inactive trips' : 'Invoice includes active trips only'
      },

      // Table Data (formatted like your example)
      table_data: {
        headers: [
          'S.No', 'Date', 'Particular', 'Quantity', 'Location',
          'Price', 'No of Loads', 'Total Amount', 'Amount Received', 'Balance'
        ],
        rows: tableRows,
        summary: {
          opening_balance: `₹${runningBalance.toLocaleString('en-IN')}`,
          total_transactions: tableRows.length - 2, // Excluding balance rows
          total_trips: trips.length,
          total_grouped_entries: groupedTripArray.length,
          total_payments: payments.length,
          total_sales_amount: `₹${totalTripsAmount.toLocaleString('en-IN')}`,
          total_received: `₹${totalPaymentsAmount.toLocaleString('en-IN')}`,
          closing_balance: `₹${currentBalance.toLocaleString('en-IN')}`,
          active_trips_only: !include_inactive
        }
      },

      // Financial Summary
      financial_summary: {
        opening_balance: runningBalance,
        total_sales: totalTripsAmount,
        total_payments: totalPaymentsAmount,
        closing_balance: currentBalance,
        amount_payable: currentBalance
      },

      // Additional Information
      additional_info: {
        notes: 'All amounts in Indian Rupees',
        terms: 'Payment terms : weekly payment (7 days credit)',
        data_status: include_inactive ? 'Includes all trips (active and inactive)' : 'Active trips only'
      },

      // Raw data for reference
      raw_data: {
        trips: trips.map(trip => ({
          id: trip._id,
          trip_number: trip.trip_number,
          date: trip.trip_date,
          material: trip.material_name,
          units: trip.no_of_unit_customer,
          rate: trip.rate_per_unit,
          amount: trip.customer_amount,
          location: trip.location,
          is_active: trip.isActive,
          editable: trip.isActive
        })),
        payments: payments.map(payment => ({
          id: payment._id,
          payment_number: payment.payment_number,
          date: payment.payment_date,
          amount: payment.amount,
          mode: payment.payment_mode,
          is_active: payment.isActive,
          editable: payment.isActive
        })),
        grouped_trips: groupedTripArray
      }
    };

    return invoiceData;

  } catch (error) {
    console.error('Error fetching invoice data:', error);
    throw error;
  }
};


const cloneTrips = async (tripIds, owner_id, times = 1, options = {}) => {
  try {
    // Validate input
    if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
      throw new Error('tripIds must be a non-empty array');
    }

    if (!times || times < 1 || times > 100) {
      throw new Error('Number of clones must be between 1 and 100');
    }

    if (options.resetDate === true && !options.newTripDate) {
      throw new Error('newTripDate is required when resetDate is true');
    }

    // Process in batches to avoid memory issues
    const BATCH_SIZE = 20;
    const results = [];

    for (let i = 0; i < tripIds.length; i += BATCH_SIZE) {
      const batchTripIds = tripIds.slice(i, i + BATCH_SIZE);

      // Process this batch
      const batchResult = await processBatch(
        batchTripIds,
        owner_id,
        times,
        options
      );

      results.push(...batchResult);

      // Small delay between batches to avoid overwhelming the database
      if (i + BATCH_SIZE < tripIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Calculate summary
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    const totalClonesCreated = successfulResults.reduce((sum, result) =>
      sum + (result.cloned_trips ? result.cloned_trips.length : 0), 0);

    return {
      summary: {
        total_trips_requested: tripIds.length,
        total_clones_created: totalClonesCreated,
        successful_clones: successfulResults.length,
        failed_clones: failedResults.length,
        number_of_copies_per_trip: times,
        reset_status_applied: options.resetStatus || false,
        reset_date_applied: options.resetDate || false,
        new_trip_date: options.resetDate ? options.newTripDate : null
      },
      details: results,
      success_rate: `${((successfulResults.length / tripIds.length) * 100).toFixed(2)}%`
    };

  } catch (error) {
    console.error('Error in batch cloning:', error);
    throw error;
  }
};

// Helper function to process a batch
const processBatch = async (batchTripIds, owner_id, times, options) => {
  const session = await Trip.startSession();
  session.startTransaction();

  try {
    // Fetch original trips for this batch
    const originalTrips = await Trip.find({
      _id: { $in: batchTripIds },
      owner_id
    })
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('crusher_id', 'name')
      .populate('customer_id', 'name phone address')
      .populate('collab_owner_id', 'name company_name phone email');

    // Create map for quick lookup
    const tripMap = new Map();
    originalTrips.forEach(trip => tripMap.set(trip._id.toString(), trip));

    // Get sequence range
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Use a simple approach: get max and add batch size
    const lastTrip = await Trip.findOne({
      trip_number: new RegExp(`^TR${yearMonth}`)
    })
      .sort({ trip_number: -1 })
      .select('trip_number');

    let startSequence = 1;
    if (lastTrip && lastTrip.trip_number) {
      const lastNumber = parseInt(lastTrip.trip_number.replace(`TR${yearMonth}`, ''), 10);
      if (!isNaN(lastNumber)) {
        startSequence = lastNumber + 1;
      }
    }

    // Prepare bulk operations
    const bulkOps = [];
    const batchResults = [];
    let currentSequence = startSequence;

    for (const tripId of batchTripIds) {
      const originalTrip = tripMap.get(tripId);

      if (!originalTrip) {
        batchResults.push({
          tripId,
          success: false,
          error: 'Trip not found or access denied',
          cloned_trips: []
        });
        continue;
      }

      // Prepare trip data
      const tripDataObj = originalTrip.toObject();
      delete tripDataObj._id;
      delete tripDataObj.__v;
      delete tripDataObj.trip_number;
      delete tripDataObj.createdAt;
      delete tripDataObj.updatedAt;
      delete tripDataObj.collab_trip_status;

      // Handle status and timestamps
      if (options.resetStatus) {
        tripDataObj.status = 'scheduled';
        delete tripDataObj.dispatched_at;
        delete tripDataObj.loaded_at;
        delete tripDataObj.delivered_at;
        delete tripDataObj.completed_at;
      } else {
        delete tripDataObj.dispatched_at;
        delete tripDataObj.loaded_at;
        delete tripDataObj.delivered_at;
        delete tripDataObj.completed_at;

        if (tripDataObj.status === 'dispatched') {
          tripDataObj.dispatched_at = new Date();
        } else if (tripDataObj.status === 'loaded') {
          tripDataObj.loaded_at = new Date();
        } else if (tripDataObj.status === 'delivered') {
          tripDataObj.delivered_at = new Date();
        } else if (tripDataObj.status === 'completed') {
          tripDataObj.completed_at = new Date();
        }
      }

      // Determine trip date
      const tripDate = options.resetDate === true
        ? new Date(options.newTripDate)
        : tripDataObj.trip_date;

      const clonedTripNumbers = [];

      // Create clone operations
      for (let i = 0; i < times; i++) {
        const trip_number = `TR${yearMonth}${String(currentSequence).padStart(4, '0')}`;
        currentSequence++;
        clonedTripNumbers.push(trip_number);

        bulkOps.push({
          insertOne: {
            document: {
              ...tripDataObj,
              trip_number,
              trip_date: tripDate,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });
      }

      // Store for later population
      batchResults.push({
        tripId,
        originalTrip,
        tripDataObj,
        clonedTripNumbers,
        success: null // Will be updated after insertion
      });
    }

    // Execute bulk insert
    if (bulkOps.length > 0) {
      await Trip.bulkWrite(bulkOps, {
        ordered: false,
        session
      });
    }

    await session.commitTransaction();
    session.endSession();

    // Now populate the results
    for (const result of batchResults) {
      if (result.success === null) { // Only process those that were cloned
        try {
          const clonedTrips = await Trip.find({
            trip_number: { $in: result.clonedTripNumbers }
          })
            .populate('lorry_id', 'registration_number nick_name')
            .populate('driver_id', 'name phone')
            .populate('crusher_id', 'name')
            .populate('customer_id', 'name phone')
            .populate('collab_owner_id', 'name company_name phone')
            .populate('owner_id', 'name company_name phone');

          result.success = true;
          result.cloned_trips = clonedTrips;
          result.original_trip_number = result.originalTrip.trip_number;
          result.original_status = result.originalTrip.status;
          result.original_trip_date = result.originalTrip.trip_date;
          result.cloned_status = result.tripDataObj.status;
          result.cloned_trip_date = options.resetDate ? options.newTripDate : result.originalTrip.trip_date;
          result.reset_status_applied = options.resetStatus || false;
          result.reset_date_applied = options.resetDate || false;
          result.number_of_clones = times;

          // Clean up
          delete result.originalTrip;
          delete result.tripDataObj;

        } catch (error) {
          result.success = false;
          result.error = `Failed to fetch cloned trips: ${error.message}`;
          result.cloned_trips = [];
        }
      }
    }

    return batchResults;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const bulkSoftDeleteTrips = async (tripIds, owner_id) => {
  try {
    // Validate input
    if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
      throw new Error('tripIds must be a non-empty array');
    }

    // Update trips where: 
    // - ID is in the list
    // - Owner is current user
    // - isActive is true
    // - collab_trip_status is NOT "approved" (checking for null or other values)
    const result = await Trip.updateMany(
      {
        _id: { $in: tripIds },
        owner_id,
        isActive: true,
        $or: [
          { collab_trip_status: { $exists: false } }, // No collab_trip_status field
          { collab_trip_status: { $eq: null } }, // collab_trip_status is null
          { collab_trip_status: { $ne: 'approved' } } // collab_trip_status exists but not 'approved'
        ]
      },
      { $set: { isActive: false } }
    );

    // Get trips that couldn't be deleted (approved collaborative trips)
    const notDeletedTrips = await Trip.find({
      _id: { $in: tripIds },
      owner_id,
      isActive: true,
      collab_trip_status: 'approved'
    }).select('trip_number collab_trip_status');

    return {
      success: true,
      message: `Soft deleted ${result.modifiedCount} trip(s)`,
      modifiedCount: result.modifiedCount,
      notDeletedCount: notDeletedTrips.length,
      notDeletedTrips: notDeletedTrips.map(trip => ({
        trip_number: trip.trip_number,
        collab_trip_status: trip.collab_trip_status
      }))
    };

  } catch (error) {
    console.error('Error in bulk soft delete trips:', error);
    throw error;
  }
};

const updateTripPricesForMultipleTrips = async (owner_id, tripData) => {
  try {
    const { tripIds, update_customer_amount, extra_amount = 0 } = tripData;

    // -------------------- VALIDATION --------------------
    if (!owner_id || !Array.isArray(tripIds) || tripIds.length === 0) {
      throw new Error('owner_id and tripIds array are required');
    }

    if (typeof update_customer_amount !== 'boolean') {
      throw new Error('update_customer_amount must be boolean');
    }

    if (extra_amount && typeof extra_amount !== 'number') {
      throw new Error('extra_amount must be a number');
    }

    // -------------------- FETCH TRIPS --------------------
    const trips = await Trip.find({
      _id: { $in: tripIds },
      owner_id,
      isActive: true
    }).populate('crusher_id', 'materials');

    if (!trips.length) {
      return {
        success: false,
        message: 'No active trips found',
        updated_count: 0
      };
    }

    const updatedTrips = [];
    const failedTrips = [];

    const summary = {
      total_trips_processed: trips.length,
      total_trips_updated: 0,
      total_crusher_amount_change: 0,
      total_customer_amount_change: 0,
      total_extra_amount_added: 0,
      trips_by_status: {}
    };

    // -------------------- GROUP BY CRUSHER --------------------
    const tripsByCrusher = {};

    trips.forEach(trip => {
      if (!trip.crusher_id || !trip.crusher_id.materials?.length) {
        failedTrips.push({
          trip_id: trip._id,
          trip_number: trip.trip_number,
          reason: 'CRUSHER_OR_MATERIAL_MISSING'
        });
        return;
      }

      const crusherId = trip.crusher_id._id.toString();
      tripsByCrusher[crusherId] ??= { crusher: trip.crusher_id, trips: [] };
      tripsByCrusher[crusherId].trips.push(trip);
    });

    // -------------------- PROCESS TRIPS --------------------
    for (const { crusher, trips: crusherTrips } of Object.values(tripsByCrusher)) {
      const materialPriceMap = {};
      crusher.materials.forEach(m => {
        materialPriceMap[m.material_name.toLowerCase()] = m.price_per_unit;
      });

      for (const trip of crusherTrips) {
        try {
          const materialPrice =
            materialPriceMap[trip.material_name.toLowerCase()];

          if (!materialPrice) {
            failedTrips.push({
              trip_id: trip._id,
              trip_number: trip.trip_number,
              reason: 'MATERIAL_NOT_FOUND'
            });
            continue;
          }

          const isCollabApproved =
            trip.collab_trip_status?.toLowerCase() === 'approved';

          const hasCustomerOrCollab =
            !!(trip.customer_id || trip.collab_owner_id);

          const canUpdateCustomerAmount =
            update_customer_amount &&
            hasCustomerOrCollab &&
            !isCollabApproved;

          // -------------------- PRICE CALCULATION --------------------
          const oldCrusherAmount = trip.crusher_amount;
          const newCrusherAmount = trip.no_of_unit_crusher * materialPrice;
          const crusherAmountDiff = newCrusherAmount - oldCrusherAmount;

          let newCustomerAmount = trip.customer_amount;
          let customerAmountDiff = 0;
          let newProfit = trip.profit;
          let extraAmountApplied = 0;
          let customerUpdateApplied = false;

          if (canUpdateCustomerAmount) {
            customerAmountDiff = crusherAmountDiff + extra_amount;
            newCustomerAmount += customerAmountDiff;
            newProfit = newCustomerAmount - newCrusherAmount;
            extraAmountApplied = extra_amount;
            customerUpdateApplied = true;
          } else {
            newProfit = trip.customer_amount - newCrusherAmount;
          }

          const updateData = {
            rate_per_unit: materialPrice,
            crusher_amount: newCrusherAmount,
            profit: newProfit
          };

          if (canUpdateCustomerAmount) {
            updateData.customer_amount = newCustomerAmount;
          }

          await Trip.findByIdAndUpdate(trip._id, updateData, {
            new: true,
            runValidators: true
          });

          // -------------------- RESPONSE DATA --------------------
          updatedTrips.push({
            trip_id: trip._id,
            trip_number: trip.trip_number,
            material_name: trip.material_name,
            old_rate_per_unit: trip.rate_per_unit,
            new_rate_per_unit: materialPrice,
            crusher_amount_diff: crusherAmountDiff,
            customer_amount_diff: customerAmountDiff,
            customer_amount_updated: customerUpdateApplied,
            customer_amount_update_reason: customerUpdateApplied
              ? 'Customer amount updated'
              : !update_customer_amount
                ? 'Skipped: update_customer_amount is false'
                : isCollabApproved
                  ? 'Skipped: Collaboration trip approved'
                  : 'Skipped: No customer or collab owner',
            trip_type: trip.collab_owner_id
              ? (isCollabApproved ? 'collaboration-approved' : 'collaboration-pending')
              : 'regular'
          });

          summary.total_trips_updated++;
          summary.total_crusher_amount_change += crusherAmountDiff;
          summary.total_customer_amount_change += customerAmountDiff;
          summary.total_extra_amount_added += extraAmountApplied;

          summary.trips_by_status[trip.status] =
            (summary.trips_by_status[trip.status] || 0) + 1;

        } catch (err) {
          failedTrips.push({
            trip_id: trip._id,
            trip_number: trip.trip_number,
            error: err.message,
            reason: 'UPDATE_ERROR'
          });
        }
      }
    }

    // -------------------- FINAL RESPONSE --------------------
    return {
      success: true,
      summary,
      updated_trips: updatedTrips,
      failed_trips: failedTrips
    };

  } catch (error) {
    console.error('updateTripPricesForMultipleTrips error:', error);
    throw error;
  }
};


const bulkUpdateTripStatus = async (owner_id, statusData) => {
  try {
    const { tripIds, status } = statusData;

    // Validate inputs
    if (!owner_id || !tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
      throw new Error('owner_id and tripIds array are required');
    }

    if (!status || typeof status !== 'string') {
      throw new Error('status is required and must be a string');
    }

    // Validate status value
    const validStatuses = ['scheduled', 'dispatched', 'loaded', 'in_transit', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Prepare update data with timestamps
    const updateData = { status };
    const now = new Date();

    // Set timestamps based on status
    switch (status) {
      case 'dispatched':
        updateData.dispatched_at = now;
        break;
      case 'loaded':
        updateData.loaded_at = now;
        break;
      case 'delivered':
        updateData.delivered_at = now;
        break;
      case 'completed':
        updateData.completed_at = now;
        break;
    }

    // Clear timestamps for status changes that shouldn't have them
    if (status === 'scheduled') {
      updateData.dispatched_at = null;
      updateData.loaded_at = null;
      updateData.delivered_at = null;
      updateData.completed_at = null;
    }

    // Update trips where:
    // - ID is in the list
    // - Owner is current user
    // - isActive is true
    const result = await Trip.updateMany(
      {
        _id: { $in: tripIds },
        owner_id,
        isActive: true
      },
      { $set: updateData }
    );

    // If no trips were updated, check why
    if (result.modifiedCount === 0) {
      // Check if trips exist and are active
      const existingTrips = await Trip.find({
        _id: { $in: tripIds },
        owner_id
      }).select('_id trip_number isActive status');

      const existingTripIds = existingTrips.map(t => t._id.toString());
      const nonExistingTripIds = tripIds.filter(id => !existingTripIds.includes(id));

      const inactiveTrips = existingTrips.filter(t => !t.isActive);
      const alreadyInStatusTrips = existingTrips.filter(t => t.status === status);

      return {
        success: false,
        message: 'No trips were updated',
        details: {
          total_requested: tripIds.length,
          existing_trips: existingTrips.length,
          non_existing_trips: nonExistingTripIds,
          inactive_trips: inactiveTrips.map(t => ({
            id: t._id,
            trip_number: t.trip_number
          })),
          already_in_status: alreadyInStatusTrips.map(t => ({
            id: t._id,
            trip_number: t.trip_number
          })),
          modifiedCount: 0
        }
      };
    }

    // Get updated trips for response
    const updatedTrips = await Trip.find({
      _id: { $in: tripIds },
      owner_id,
      isActive: true
    })
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('crusher_id', 'name')
      .populate('customer_id', 'name phone')
      .populate('collab_owner_id', 'name company_name phone');

    // Calculate summary
    const tripsByMaterial = {};

    updatedTrips.forEach(trip => {
      // Group by material
      if (!tripsByMaterial[trip.material_name]) {
        tripsByMaterial[trip.material_name] = 0;
      }
      tripsByMaterial[trip.material_name]++;
    });

    // Calculate totals
    const totalAmount = updatedTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
    const totalProfit = updatedTrips.reduce((sum, trip) => sum + trip.profit, 0);

    return {
      success: true,
      message: `Successfully updated ${result.modifiedCount} trip${result.modifiedCount > 1 ? 's' : ''} to "${status}" status`,
      summary: {
        total_trips_requested: tripIds.length,
        trips_updated: result.modifiedCount,
        trips_skipped: tripIds.length - result.modifiedCount,
        new_status: status,
        trips_by_material: tripsByMaterial,
        total_amount_updated: totalAmount,
        total_profit_updated: totalProfit,
        timestamp_added: updateData.dispatched_at || updateData.loaded_at ||
          updateData.delivered_at || updateData.completed_at || null,
        updated_at: now
      },
      updated_trips: updatedTrips.map(trip => ({
        trip_id: trip._id,
        trip_number: trip.trip_number,
        material_name: trip.material_name,
        driver_name: trip.driver_id?.name || 'Unknown',
        customer_name: trip.customer_id?.name || trip.collab_owner_id?.name || 'Unknown',
        new_status: status,
        old_status: trip.status, // Note: this will show new status since we just updated
        amount: trip.customer_amount,
        profit: trip.profit,
        trip_date: trip.trip_date
      }))
    };

  } catch (error) {
    console.error('Error in bulkUpdateTripStatus:', error);
    throw error;
  }
};

const updateCollabTripStatus = async (tripId, collabOwnerId, requestingUserId, status) => {
  try {
    const Trip = require('../models/trip.model');

    // Find the trip - must have collab_owner_id (collaborative trip)
    const trip = await Trip.findOne({
      _id: tripId,
      isActive: true,
      collab_owner_id: { $exists: true, $ne: null }
    })
      .populate('owner_id', 'name company_name')
      .populate('collab_owner_id', 'name company_name')
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('crusher_id', 'name');

    if (!trip) {
      const error = new Error('Collaborative trip not found');
      error.status = 404;
      throw error;
    }

    // Security check: Only the collab_owner (receiving partner) can approve/reject
    if (trip.collab_owner_id._id.toString() !== requestingUserId) {
      const error = new Error('Access denied. Only the receiving partner can approve/reject this trip');
      error.status = 403;
      throw error;
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      const error = new Error('Invalid status. Must be "approved" or "rejected"');
      error.status = 400;
      throw error;
    }

    // Cannot change status if already approved or rejected
    if (trip.collab_trip_status && trip.collab_trip_status !== 'pending') {
      const error = new Error(`Trip is already ${trip.collab_trip_status}. Cannot change status.`);
      error.status = 400;
      throw error;
    }

    // Update the trip status
    trip.collab_trip_status = status;
    await trip.save();

    return {
      message: `Trip ${status} successfully`,
      trip
    };
  } catch (error) {
    throw error;
  }
};

const getCollaborationInvoiceData = async (owner_id, partner_owner_id, from_date, to_date) => {
  try {
    console.log("Fetching collaboration invoice data for:", {
      owner_id,
      partner_owner_id,
      from_date,
      to_date
    });

    // 1. Get current user (owner) details for company header
    const currentOwner = await User.findById(owner_id).select('name company_name address city state pincode phone logo gst_number');

    if (!currentOwner) {
      const err = new Error('Current owner not found');
      err.status = 404;
      throw err;
    }

    // 2. Get partner owner details
    const partnerOwner = await User.findById(partner_owner_id).select('name company_name address city state pincode phone logo gst_number');

    if (!partnerOwner) {
      const err = new Error('Partner owner not found');
      err.status = 404;
      throw err;
    }

    // 3. Check if collaboration exists and is active
    const collaboration = await Collaboration.findOne({
      $or: [
        { from_owner_id: owner_id, to_owner_id: partner_owner_id, status: 'active' },
        { from_owner_id: partner_owner_id, to_owner_id: owner_id, status: 'active' }
      ]
    });

    if (!collaboration) {
      const err = new Error('Active collaboration not found between the owners');
      err.status = 404;
      throw err;
    }

    // 4. Fetch trips done by CURRENT USER for PARTNER (I worked for partner)
    const myTrips = await Trip.find({
      owner_id: owner_id,
      collab_owner_id: partner_owner_id,
      isActive: true,
      status: 'completed',
      collab_trip_status: 'approved',
      trip_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      }
    })
      .populate('customer_id', 'name')
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('crusher_id', 'name')
      .sort({ trip_date: 1 });

    // 5. Fetch trips done by PARTNER for CURRENT USER (Partner worked for me)
    const partnerTrips = await Trip.find({
      owner_id: partner_owner_id,
      collab_owner_id: owner_id,
      isActive: true,
      status: 'completed',
      collab_trip_status: 'approved',
      trip_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      }
    })
      .populate('customer_id', 'name')
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('crusher_id', 'name')
      .sort({ trip_date: 1 });

    // 6. Fetch payments made by CURRENT USER to PARTNER (I paid partner)
    const myPayments = await Payment.find({
      owner_id: owner_id,
      payment_type: 'to_collab_owner',
      collab_owner_id: partner_owner_id,
      isActive: true,
      collab_payment_status: 'approved',
      payment_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      }
    })
      .populate('customer_id', 'name')
      .sort({ payment_date: 1 });

    // 7. Fetch payments made by PARTNER to CURRENT USER (Partner paid me)
    const partnerPayments = await Payment.find({
      owner_id: partner_owner_id,
      payment_type: 'to_collab_owner',
      collab_owner_id: owner_id,
      isActive: true,
      collab_payment_status: 'approved',
      payment_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      }
    })
      .populate('customer_id', 'name')
      .sort({ payment_date: 1 });

    // 8. Group trips by material, quantity, location, price AND customer_amount (exact match)
    const groupTrips = (trips) => {
      const grouped = {};

      trips.forEach(trip => {
        const tripDate = trip.trip_date.toISOString().split('T')[0];
        const groupKey = `${tripDate}_${trip.material_name}_${trip.no_of_unit_customer}_${trip.location}_${trip.rate_per_unit}_${trip.customer_amount}`;

        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            date: tripDate,
            material_name: trip.material_name,
            quantity: trip.no_of_unit_customer,
            location: trip.location,
            rate_per_unit: trip.rate_per_unit,
            customer_amount: trip.customer_amount,
            no_of_loads: 0,
            total_amount: 0,
            trips: []
          };
        }

        grouped[groupKey].no_of_loads += 1;
        grouped[groupKey].total_amount += trip.customer_amount;
        grouped[groupKey].trips.push(trip);

        if (new Date(tripDate) < new Date(grouped[groupKey].date)) {
          grouped[groupKey].date = tripDate;
        }
      });

      return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const myGroupedTrips = groupTrips(myTrips);
    const partnerGroupedTrips = groupTrips(partnerTrips);

    // 9. Calculate opening balance (all previous active trips and payments)
    const previousMyTrips = await Trip.find({
      owner_id: owner_id,
      collab_owner_id: partner_owner_id,
      isActive: true,
      status: 'completed',
      collab_trip_status: 'approved',
      trip_date: { $lt: new Date(from_date) }
    });

    const previousPartnerTrips = await Trip.find({
      owner_id: partner_owner_id,
      collab_owner_id: owner_id,
      isActive: true,
      status: 'completed',
      collab_trip_status: 'approved',
      trip_date: { $lt: new Date(from_date) }
    });

    const previousMyPayments = await Payment.find({
      owner_id: owner_id,
      payment_type: 'to_collab_owner',
      collab_owner_id: partner_owner_id,
      isActive: true,
      collab_payment_status: 'approved',
      payment_date: { $lt: new Date(from_date) }
    });

    const previousPartnerPayments = await Payment.find({
      owner_id: partner_owner_id,
      payment_type: 'to_collab_owner',
      collab_owner_id: owner_id,
      isActive: true,
      collab_payment_status: 'approved',
      payment_date: { $lt: new Date(from_date) }
    });

    // Calculate previous amounts
    const previousMyTripsAmount = previousMyTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const previousPartnerTripsAmount = previousPartnerTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const previousMyPaymentsAmount = previousMyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const previousPartnerPaymentsAmount = previousPartnerPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // CORRECTED: Opening Balance from CURRENT USER's perspective
    // What partner owes me = (My trips for partner) - (Partner trips for me)
    // Adjusted for payments = What partner owes me - (My payments to partner) + (Partner payments to me)
    const openingBalance = (previousMyTripsAmount - previousPartnerTripsAmount) -
      (previousMyPaymentsAmount - previousPartnerPaymentsAmount);

    // 10. Create table rows
    const tableRows = [];
    let currentBalance = openingBalance;

    // Add opening balance row
    const fromDateObj = new Date(from_date);
    const previousDay = new Date(fromDateObj);
    previousDay.setDate(fromDateObj.getDate() - 1);

    const openingBalanceRow = {
      s_no: '',
      date: '',
      particular: `BALANCE AS OF ${previousDay.toLocaleDateString('en-IN')}`,
      quantity: '',
      location: '',
      price: '',
      no_of_loads: '',
      total_amount: '',
      amount_received: '',
      balance: `₹${openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      is_balance_row: true,
      is_opening_balance: true
    };
    tableRows.push(openingBalanceRow);

    // Combine all transactions and sort by date
    const allTransactions = [];

    // My trips - Partner owes me (increases balance)
    myGroupedTrips.forEach(group => {
      allTransactions.push({
        type: 'my_trip',
        date: group.date,
        data: group,
        sortDate: new Date(group.date)
      });
    });

    // Partner trips - I owe partner (decreases balance)
    partnerGroupedTrips.forEach(group => {
      allTransactions.push({
        type: 'partner_trip',
        date: group.date,
        data: group,
        sortDate: new Date(group.date)
      });
    });

    // My payments to partner - I paid partner (decreases balance)
    myPayments.forEach(payment => {
      allTransactions.push({
        type: 'my_payment',
        date: payment.payment_date,
        data: payment,
        sortDate: new Date(payment.payment_date)
      });
    });

    // Partner payments to me - Partner paid me (increases balance)
    partnerPayments.forEach(payment => {
      allTransactions.push({
        type: 'partner_payment',
        date: payment.payment_date,
        data: payment,
        sortDate: new Date(payment.payment_date)
      });
    });

    // Sort all transactions by date
    allTransactions.sort((a, b) => a.sortDate - b.sortDate);

    // Generate table rows with running balance
    allTransactions.forEach((transaction, index) => {
      let row = {};

      if (transaction.type === 'my_trip') {
        const group = transaction.data;

        // My trip: Partner needs to pay me → Increases what partner owes me
        row = {
          s_no: tableRows.length,
          date: transaction.date,
          particular: `[TRIP TO ${partnerOwner.name}] ${group.material_name}`,
          quantity: `${group.quantity} Unit`,
          location: group.location,
          price: `₹${group.customer_amount.toLocaleString('en-IN')}`,
          no_of_loads: group.no_of_loads,
          total_amount: `₹${group.total_amount.toLocaleString('en-IN')}`,
          amount_received: '-',
          balance: `₹${(currentBalance + group.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          section: 'my_trips',
          transaction_type: 'my_trip',
          is_grouped: true
        };

        currentBalance += group.total_amount;

      } else if (transaction.type === 'partner_trip') {
        const group = transaction.data;

        // Partner trip: I need to pay partner → Decreases what partner owes me
        row = {
          s_no: tableRows.length,
          date: transaction.date,
          particular: `[TRIP FROM ${partnerOwner.name}] ${group.material_name}`,
          quantity: `${group.quantity} Unit`,
          location: group.location,
          price: `₹${group.customer_amount.toLocaleString('en-IN')}`,
          no_of_loads: group.no_of_loads,
          total_amount: `₹${group.total_amount.toLocaleString('en-IN')}`,
          amount_received: '-',
          balance: `₹${(currentBalance - group.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          section: 'partner_trips',
          transaction_type: 'partner_trip',
          is_grouped: true
        };

        currentBalance -= group.total_amount;

      }
      else
        if (transaction.type === 'my_payment') {
          const payment = transaction.data;

          // My payment: I paid partner → Reduces what I owe → INCREASES balance (+)
          row = {
            s_no: tableRows.length,
            date: transaction.date.toISOString().split('T')[0],
            particular: `[PAID TO ${partnerOwner.name}] ${payment.notes || 'Payment'}`,
            quantity: '-',
            location: '-',
            price: '-',
            no_of_loads: '-',
            total_amount: '-',
            amount_received: `₹${payment.amount.toLocaleString('en-IN')}`,
            balance: `₹${(currentBalance + payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            section: 'my_payments',
            transaction_type: 'my_payment',
            is_payment: true
          };

          currentBalance += payment.amount; // ADD payment amount (reduce my debt)

        } else if (transaction.type === 'partner_payment') {
          const payment = transaction.data;

          // Partner payment: Partner paid me → Reduces what partner owes me → DECREASES balance (-)
          row = {
            s_no: tableRows.length,
            date: transaction.date.toISOString().split('T')[0],
            particular: `[RECEIVED FROM ${partnerOwner.name}] ${payment.notes || 'Payment'}`,
            quantity: '-',
            location: '-',
            price: '-',
            no_of_loads: '-',
            total_amount: '-',
            amount_received: `₹${payment.amount.toLocaleString('en-IN')}`,
            balance: `₹${(currentBalance - payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            section: 'partner_payments',
            transaction_type: 'partner_payment',
            is_payment: true
          };

          currentBalance -= payment.amount; // SUBTRACT payment amount (reduce partner's debt)
        }

      tableRows.push(row);
    });

    // Add closing balance row
    const closingBalanceRow = {
      s_no: '',
      date: '',
      particular: `BALANCE AS OF ${new Date(to_date).toLocaleDateString('en-IN')}`,
      quantity: '',
      location: '',
      price: '',
      no_of_loads: '',
      total_amount: '',
      amount_received: '',
      balance: `₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      is_balance_row: true,
      is_closing_balance: true
    };
    tableRows.push(closingBalanceRow);

    // 11. Calculate totals
    const totalMyTripsAmount = myTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const totalPartnerTripsAmount = partnerTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const totalMyPaymentsAmount = myPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPartnerPaymentsAmount = partnerPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Calculate net amounts
    const netTripAmount = totalMyTripsAmount - totalPartnerTripsAmount;
    const netPaymentAmount = totalPartnerPaymentsAmount - totalMyPaymentsAmount; // Partner payments minus my payments

    // Determine who needs to pay based on FINAL balance
    let whoOwes = '';
    let amountOwed = Math.abs(currentBalance);

    if (currentBalance > 0) {
      // Positive balance means partner owes me
      whoOwes = `${partnerOwner.name} needs to pay ${currentOwner.name}`;
    } else if (currentBalance < 0) {
      // Negative balance means I owe partner
      whoOwes = `${currentOwner.name} needs to pay ${partnerOwner.name}`;
      amountOwed = Math.abs(currentBalance);
    } else {
      whoOwes = 'All settled up';
      amountOwed = 0;
    }

    // 12. Prepare invoice data structure
    const invoiceData = {
      supplier: {
        name: currentOwner.company_name || currentOwner.name,
        address: currentOwner.address,
        city: currentOwner.city,
        state: currentOwner.state,
        pincode: currentOwner.pincode,
        phone: currentOwner.phone,
        full_address: `${currentOwner.address}, ${currentOwner.city}, ${currentOwner.state} - ${currentOwner.pincode}`,
        logo: currentOwner.logo || null,
        gst_number: currentOwner.gst_number || null
      },

      partner: {
        name: partnerOwner.name,
        address: partnerOwner.address,
        city: partnerOwner.city,
        state: partnerOwner.state,
        pincode: partnerOwner.pincode,
        phone: partnerOwner.phone,
        full_address: `${partnerOwner.address}, ${partnerOwner.city}, ${partnerOwner.state} - ${partnerOwner.pincode}`,
        logo: partnerOwner.logo || null,
        gst_number: partnerOwner.gst_number || null,
        is_partner: true
      },

      invoice_details: {
        invoice_number: `COL-INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        from_date: from_date,
        to_date: to_date,
        period: `${new Date(from_date).toLocaleDateString('en-IN')} to ${new Date(to_date).toLocaleDateString('en-IN')}`,
        opening_balance_date: previousDay.toISOString().split('T')[0],
        closing_balance_date: to_date,
        is_collaboration: true,
        type: 'collaboration_statement'
      },

      table_data: {
        headers: [
          'S.No', 'Date', 'Particular', 'Quantity', 'Location',
          'Price', 'No of Loads', 'Total Amount', 'Transaction Amount', 'Balance'
        ],
        rows: tableRows,
        summary: {
          opening_balance: `₹${openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          total_my_trips: myTrips.length,
          total_partner_trips: partnerTrips.length,
          total_my_payments: myPayments.length,
          total_partner_payments: partnerPayments.length,
          total_my_trips_amount: `₹${totalMyTripsAmount.toLocaleString('en-IN')}`,
          total_partner_trips_amount: `₹${totalPartnerTripsAmount.toLocaleString('en-IN')}`,
          total_my_payments_amount: `₹${totalMyPaymentsAmount.toLocaleString('en-IN')}`,
          total_partner_payments_amount: `₹${totalPartnerPaymentsAmount.toLocaleString('en-IN')}`,
          net_trip_amount: `₹${netTripAmount.toLocaleString('en-IN')}`,
          net_payment_amount: `₹${netPaymentAmount.toLocaleString('en-IN')}`,
          closing_balance: `₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          who_needs_to_pay: whoOwes,
          amount_to_pay: `₹${amountOwed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      },

      financial_summary: {
        opening_balance: openingBalance,
        total_my_trips: totalMyTripsAmount,
        total_partner_trips: totalPartnerTripsAmount,
        total_my_payments: totalMyPaymentsAmount,
        total_partner_payments: totalPartnerPaymentsAmount,
        net_trip_amount: netTripAmount,
        net_payment_amount: netPaymentAmount,
        closing_balance: currentBalance,
        amount_payable: amountOwed,
        who_owes: currentBalance > 0 ? 'partner' : 'you'
      },

      additional_info: {
        notes: 'All amounts in Indian Rupees',
        calculation_note: `Balance = (Your trips - Partner trips) - (Your payments - Partner payments)`,
        positive_balance_note: 'Positive balance means partner needs to pay you',
        negative_balance_note: 'Negative balance means you need to pay partner'
      }
    };

    console.log("Collaboration invoice data generated successfully");
    console.log("Final balance:", currentBalance);
    console.log("Who owes:", whoOwes);
    console.log("Amount:", amountOwed);

    return invoiceData;

  } catch (error) {
    console.error('Error fetching collaboration invoice data:', error);
    throw error;
  }
};


const getCrusherInvoiceData = async (owner_id, crusher_id, from_date, to_date, include_inactive = false) => {
  try {
    // 1. Get current user (owner) details
    const owner = await User.findById(owner_id).select('name company_name address city state pincode phone logo gst_number');

    if (!owner) {
      const err = new Error('Owner not found');
      err.status = 404;
      throw err;
    }

    // 2. Get crusher details
    const crusher = await Crusher.findOne({
      _id: crusher_id,
      owner_id,
      isActive: true
    }).select('name phone address materials');

    if (!crusher) {
      const err = new Error('Crusher not found or is inactive');
      err.status = 404;
      throw err;
    }

    // 3. Get trips to this crusher in the date range
    const tripsQuery = {
      owner_id,
      crusher_id,
      isActive: !include_inactive ? true : { $exists: true },
      trip_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      },
      status: { $in: ['delivered', 'completed'] }
    };

    const trips = await Trip.find(tripsQuery)
      .populate('lorry_id', 'registration_number nick_name')
      .populate('driver_id', 'name phone')
      .populate('customer_id', 'name phone address')
      .populate('collab_owner_id', 'name company_name phone')
      .sort({ trip_date: 1 });

    if (trips.length === 0) {
      const err = new Error('No trips found for the selected crusher in the specified date range');
      err.status = 404;
      throw err;
    }

    // 4. Get all payments TO crusher within the date range
    const payments = await Payment.find({
      owner_id,
      crusher_id,
      payment_type: 'to_crusher',
      isActive: true,
      payment_date: {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      }
    }).sort({ payment_date: 1 });

    // 5. Group trips by material, customer, and rate (Crusher perspective)
    const groupedTrips = {};

    trips.forEach(trip => {
      const tripDate = trip.trip_date.toISOString().split('T')[0];
      // Group by material, customer, and rate (for crusher)
      const customerName = trip.customer_id?.name || trip.collab_owner_id?.name || 'Unknown';
      const groupKey = `${tripDate}_${trip.material_name}_${customerName}_${trip.rate_per_unit}`;

      if (!groupedTrips[groupKey]) {
        groupedTrips[groupKey] = {
          date: tripDate,
          material_name: trip.material_name,
          customer_name: customerName,
          rate_per_unit: trip.rate_per_unit,
          crusher_amount_per_unit: trip.rate_per_unit, // Same as rate for crusher
          no_of_loads: 0,
          total_units: 0,
          total_amount: 0,
          trips: []
        };
      }

      groupedTrips[groupKey].no_of_loads += 1;
      groupedTrips[groupKey].total_units += trip.no_of_unit_crusher; // Crusher units
      groupedTrips[groupKey].total_amount += trip.crusher_amount; // Amount paid to crusher
      groupedTrips[groupKey].trips.push(trip);

      // Keep the earliest date for the group
      if (new Date(tripDate) < new Date(groupedTrips[groupKey].date)) {
        groupedTrips[groupKey].date = tripDate;
      }
    });

    // Convert to array and sort by date
    const groupedTripArray = Object.values(groupedTrips).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // 6. Get running balance (total crusher_amount from previous trips minus payments to crusher)
    const previousTripsQuery = {
      owner_id,
      crusher_id,
      isActive: !include_inactive ? true : { $exists: true },
      trip_date: { $lt: new Date(from_date) },
      status: { $in: ['delivered', 'completed'] }
    };

    const previousTrips = await Trip.find(previousTripsQuery);
    const previousPayments = await Payment.find({
      owner_id,
      crusher_id,
      payment_type: 'to_crusher',
      isActive: true,
      payment_date: { $lt: new Date(from_date) }
    });

    const previousTripsAmount = previousTrips.reduce((sum, trip) => sum + trip.crusher_amount, 0);
    const previousPaymentsAmount = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    let runningBalance = previousTripsAmount - previousPaymentsAmount;

    // 7. Create table rows
    const tableRows = [];
    let currentBalance = runningBalance;

    // Add "BALANCE AS OF [from_date - 1 day]" at the top
    const fromDateObj = new Date(from_date);
    const previousDay = new Date(fromDateObj);
    previousDay.setDate(fromDateObj.getDate() - 1);

    const openingBalanceRow = {
      s_no: '',
      date: '',
      particular: `BALANCE AS OF ${previousDay.toLocaleDateString('en-IN')}`,
      customer: '',
      material: '',
      rate_per_unit: '',
      units: '',
      no_of_loads: '',
      total_amount: '',
      amount_paid: '',
      balance: `₹${runningBalance.toLocaleString('en-IN')}`,
      is_balance_row: true,
      is_opening_balance: true,
      note: `Amount due to ${crusher.name}`
    };
    tableRows.push(openingBalanceRow);

    // Combine trips and payments
    const allTransactions = [
      ...groupedTripArray.map(group => ({
        type: 'grouped_trip',
        date: group.date,
        data: group,
        sortDate: new Date(group.date)
      })),
      ...payments.map(payment => ({
        type: 'payment',
        date: payment.payment_date,
        data: payment,
        sortDate: new Date(payment.payment_date)
      }))
    ].sort((a, b) => a.sortDate - b.sortDate);

    // Generate table rows with running balance
    allTransactions.forEach(transaction => {
      if (transaction.type === 'grouped_trip') {
        const group = transaction.data;

        const row = {
          s_no: tableRows.length,
          date: transaction.date,
          particular: 'TRIP',
          customer: group.customer_name,
          material: group.material_name,
          rate_per_unit: `₹${group.rate_per_unit.toLocaleString('en-IN')}`,
          units: `${group.total_units} Unit(s)`,
          no_of_loads: group.no_of_loads,
          total_amount: `₹${group.total_amount.toLocaleString('en-IN')}`,
          amount_paid: '-',
          balance: `₹${(currentBalance + group.total_amount).toLocaleString('en-IN')}`,
          is_grouped: true,
          group_details: group.trips.map(trip => ({
            trip_id: trip._id,
            trip_number: trip.trip_number,
            customer: trip.customer_id?.name || trip.collab_owner_id?.name,
            units: trip.no_of_unit_crusher,
            amount: trip.crusher_amount,
            lorry: trip.lorry_id?.registration_number,
            driver: trip.driver_id?.name,
            date: trip.trip_date,
            is_active: trip.isActive
          }))
        };

        tableRows.push(row);
        currentBalance += group.total_amount;
      } else if (transaction.type === 'payment') {
        const payment = transaction.data;

        const row = {
          s_no: tableRows.length,
          date: transaction.date.toISOString().split('T')[0],
          particular: 'PAYMENT TO CRUSHER',
          customer: '-',
          material: '-',
          rate_per_unit: '-',
          units: '-',
          no_of_loads: '-',
          total_amount: '-',
          amount_paid: `₹${payment.amount.toLocaleString('en-IN')}`,
          balance: `₹${(currentBalance - payment.amount).toLocaleString('en-IN')}`,
          is_payment: true,
          payment_id: payment._id
        };

        tableRows.push(row);
        currentBalance -= payment.amount;
      }
    });

    // Add "BALANCE AS OF [to_date]" at the bottom
    const closingBalanceRow = {
      s_no: '',
      date: '',
      particular: `BALANCE AS OF ${new Date(to_date).toLocaleDateString('en-IN')}`,
      customer: '',
      material: '',
      rate_per_unit: '',
      units: '',
      no_of_loads: '',
      total_amount: '',
      amount_paid: '',
      balance: `₹${currentBalance.toLocaleString('en-IN')}`,
      is_balance_row: true,
      is_closing_balance: true,
      note: `Amount due to ${crusher.name}`
    };
    tableRows.push(closingBalanceRow);

    // 8. Calculate totals
    const totalCrusherAmount = trips.reduce((sum, trip) => sum + trip.crusher_amount, 0);
    const totalPaymentsAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // 9. Prepare crusher invoice data
    const invoiceData = {
      // Supplier Information (company)
      company: {
        name: owner.company_name || owner.name,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode,
        phone: owner.phone,
        full_address: `${owner.address}, ${owner.city}, ${owner.state} - ${owner.pincode}`,
        logo: owner.logo || null,
        gst_number: owner.gst_number || null
      },

      // Crusher Information
      crusher: {
        name: crusher.name,
        address: crusher.address,
        phone: crusher.phone,
        materials: crusher.materials || [],
        is_active: crusher.isActive
      },

      // Invoice Details
      invoice_details: {
        invoice_number: `CRU-INV-${Date.now()}`,
        invoice_type: 'CRUSHER_INVOICE',
        date: new Date().toISOString().split('T')[0],
        from_date: from_date,
        to_date: to_date,
        period: `${new Date(from_date).toLocaleDateString('en-IN')} to ${new Date(to_date).toLocaleDateString('en-IN')}`,
        opening_balance_date: previousDay.toISOString().split('T')[0],
        closing_balance_date: to_date,
        include_inactive_trips: include_inactive,
        note: include_inactive ? 'Includes inactive trips' : 'Active trips only'
      },

      // Table Data
      table_data: {
        headers: [
          'S.No', 'Date', 'Particular', 'Customer', 'Material',
          'Rate/Unit', 'Units', 'No of Loads', 'Total Amount', 'Amount Paid', 'Balance'
        ],
        rows: tableRows,
        summary: {
          opening_balance: `₹${runningBalance.toLocaleString('en-IN')}`,
          total_transactions: tableRows.length - 2,
          total_trips: trips.length,
          total_grouped_entries: groupedTripArray.length,
          total_payments: payments.length,
          total_crusher_amount: `₹${totalCrusherAmount.toLocaleString('en-IN')}`,
          total_paid: `₹${totalPaymentsAmount.toLocaleString('en-IN')}`,
          closing_balance: `₹${currentBalance.toLocaleString('en-IN')}`,
          balance_due: currentBalance > 0 ? `₹${currentBalance.toLocaleString('en-IN')}` : 'Paid in full',
          active_trips_only: !include_inactive
        }
      },

      // Financial Summary (Crusher perspective)
      financial_summary: {
        opening_balance: runningBalance,
        total_material_supplied: totalCrusherAmount,
        total_payments_made: totalPaymentsAmount,
        closing_balance: currentBalance,
        amount_due: currentBalance > 0 ? currentBalance : 0
      },

      // Additional Information
      additional_info: {
        notes: 'All amounts in Indian Rupees',
        terms: 'Payment is made against material supply',
        data_status: include_inactive ? 'Includes all trips (active and inactive)' : 'Active trips only',
        type: 'Crusher Payment Statement'
      },

      // Raw data for reference
      raw_data: {
        trips: trips.map(trip => ({
          id: trip._id,
          trip_number: trip.trip_number,
          date: trip.trip_date,
          material: trip.material_name,
          customer: trip.customer_id?.name || trip.collab_owner_id?.name || 'Unknown',
          crusher_units: trip.no_of_unit_crusher,
          rate: trip.rate_per_unit,
          crusher_amount: trip.crusher_amount,
          is_active: trip.isActive,
          editable: trip.isActive
        })),
        payments: payments.map(payment => ({
          id: payment._id,
          payment_number: payment.payment_number,
          date: payment.payment_date,
          amount: payment.amount,
          mode: payment.payment_mode,
          is_active: payment.isActive,
          editable: payment.isActive
        })),
        grouped_trips: groupedTripArray
      }
    };

    return invoiceData;

  } catch (error) {
    console.error('Error fetching crusher invoice data:', error);
    throw error;
  }
};

// const getGSTInvoiceData = async (owner_id, from_date, to_date, customer_id = null) => {
//   try {
//     // 1. Get owner details
//     const owner = await User.findById(owner_id).select('name company_name address city state pincode phone gst_number');

//     if (!owner) {
//       throw new Error('Owner not found');
//     }

//     // 2. Build query for GST trips
//     const tripsQuery = {
//       owner_id,
//       include_gst: true, // ONLY GST trips
//       isActive: true,
//       trip_date: {
//         $gte: new Date(from_date),
//         $lte: new Date(to_date)
//       },
//       status: { $in: ['delivered', 'completed'] }
//     };

//     // 3. If specific customer is provided, filter by that customer
//     if (customer_id) {
//       tripsQuery.customer_id = customer_id;
//     }

//     // 4. Get all GST trips in date range
//     const trips = await Trip.find(tripsQuery)
//       .populate('customer_id', 'name gst_number state address phone')
//       .populate('collab_owner_id', 'name gst_number state address phone')
//       .sort({ trip_date: 1 });

//     if (trips.length === 0) {
//       throw new Error('No GST trips found in the specified date range');
//     }

//     // 5. GROUP TRIPS BY CUSTOMER
//     const customersMap = {};

//     trips.forEach(trip => {
//       // Determine who is the customer
//       let customer;
//       let customerType;

//       if (trip.customer_id) {
//         customer = trip.customer_id;
//         customerType = 'customer';
//       } else if (trip.collab_owner_id) {
//         customer = trip.collab_owner_id;
//         customerType = 'collaborator';
//       } else {
//         return; // Skip if no customer
//       }

//       const customerId = customer._id.toString();

//       // Create customer entry if doesn't exist
//       if (!customersMap[customerId]) {
//         customersMap[customerId] = {
//           customer_id: customerId,
//           customer_name: customer.name,
//           customer_type: customerType,
//           gst_number: customer.gst_number || 'Not Provided',
//           state: customer.state,
//           address: customer.address,
//           phone: customer.phone,
//           total_trips: 0,
//           taxable_value: 0,
//           total_cgst: 0,
//           total_sgst: 0,
//           total_igst: 0,
//           total_gst: 0,
//           total_amount: 0,
//           trips_by_material: {},
//           trips: []
//         };
//       }

//       // Get GST values from trip
//       const sgstPercentage = parseFloat(trip.gst_values?.SGST?.replace('%', '') || '0');
//       const cgstPercentage = parseFloat(trip.gst_values?.CGST?.replace('%', '') || '0');
//       const igstPercentage = parseFloat(trip.gst_values?.IGST?.replace('%', '') || '0');
//       const gstRate = sgstPercentage + cgstPercentage + igstPercentage;

//       // IMPORTANT: trip.customer_amount is WITH GST (total amount)
//       const totalAmount = trip.customer_amount; // This is 6600 (with GST)
      
//       // Calculate taxable amount by removing GST
//       // Formula: Taxable Amount = Total Amount / (1 + GST Rate/100)
//       const taxableAmount = totalAmount / (1 + (gstRate / 100));
      
//       // Calculate GST amount
//       const gstAmount = totalAmount - taxableAmount;

//       // Calculate individual GST amounts proportionally
//       const sgstAmount = (gstAmount * sgstPercentage) / gstRate;
//       const cgstAmount = (gstAmount * cgstPercentage) / gstRate;
//       const igstAmount = (gstAmount * igstPercentage) / gstRate;

//       // Update customer totals
//       customersMap[customerId].total_trips += 1;
//       customersMap[customerId].taxable_value += taxableAmount;
//       customersMap[customerId].total_cgst += cgstAmount;
//       customersMap[customerId].total_sgst += sgstAmount;
//       customersMap[customerId].total_igst += igstAmount;
//       customersMap[customerId].total_gst += gstAmount;
//       customersMap[customerId].total_amount += totalAmount;

//       // Group by material within customer
//       const materialKey = trip.material_name;
//       if (!customersMap[customerId].trips_by_material[materialKey]) {
//         customersMap[customerId].trips_by_material[materialKey] = {
//           material_name: trip.material_name,
//           total_quantity: 0,
//           total_amount: 0,
//           trips: []
//         };
//       }

//       customersMap[customerId].trips_by_material[materialKey].total_quantity += trip.no_of_unit_customer;
//       customersMap[customerId].trips_by_material[materialKey].total_amount += totalAmount;

//       // Add individual GST amounts to each trip
//       customersMap[customerId].trips_by_material[materialKey].trips.push({
//         trip_id: trip._id,
//         trip_number: trip.trip_number,
//         date: trip.trip_date,
//         quantity: trip.no_of_unit_customer,
//         taxable_amount: taxableAmount,
//         cgst_amount: cgstAmount,
//         sgst_amount: sgstAmount,
//         igst_amount: igstAmount,
//         gst_amount: gstAmount,
//         total_amount: totalAmount,
//         gst_rate: `${gstRate}%`,
//         cgst_rate: `${cgstPercentage}%`,
//         sgst_rate: `${sgstPercentage}%`,
//         igst_rate: `${igstPercentage}%`
//       });

//       // Also keep all trips with individual GST breakdown
//       customersMap[customerId].trips.push({
//         trip_id: trip._id,
//         trip_number: trip.trip_number,
//         date: trip.trip_date,
//         material: trip.material_name,
//         quantity: trip.no_of_unit_customer,
//         taxable_amount: taxableAmount,
//         cgst_amount: cgstAmount,
//         sgst_amount: sgstAmount,
//         igst_amount: igstAmount,
//         gst_amount: gstAmount,
//         total_amount: totalAmount,
//         gst_rate: `${gstRate}%`,
//         cgst_rate: `${cgstPercentage}%`,
//         sgst_rate: `${sgstPercentage}%`,
//         igst_rate: `${igstPercentage}%`
//       });
//     });

//     // Convert to array
//     const customers = Object.values(customersMap);

//     // 6. Calculate overall totals
//     let overallTotals = {
//       total_customers: customers.length,
//       total_trips: trips.length,
//       total_taxable_value: 0,
//       total_cgst: 0,
//       total_sgst: 0,
//       total_igst: 0,
//       total_gst_amount: 0,
//       total_invoice_amount: 0
//     };

//     customers.forEach(cust => {
//       overallTotals.total_taxable_value += cust.taxable_value;
//       overallTotals.total_cgst += cust.total_cgst;
//       overallTotals.total_sgst += cust.total_sgst;
//       overallTotals.total_igst += cust.total_igst;
//       overallTotals.total_gst_amount += cust.total_gst;
//       overallTotals.total_invoice_amount += cust.total_amount;
//     });

//     // 7. Prepare the response
//     const gstInvoiceData = {
//       invoice_type: 'GST_SUMMARY_INVOICE',
//       invoice_number: `GST-SUMMARY-${Date.now().toString().slice(-6)}`,
//       invoice_date: new Date().toISOString().split('T')[0],
//       from_date: from_date,
//       to_date: to_date,
//       period: `${new Date(from_date).toLocaleDateString('en-IN')} to ${new Date(to_date).toLocaleDateString('en-IN')}`,

//       // Your company details
//       company: {
//         name: owner.company_name || owner.name,
//         address: owner.address,
//         city: owner.city,
//         state: owner.state,
//         pincode: owner.pincode,
//         phone: owner.phone,
//         gst_number: owner.gst_number || 'Not Provided'
//       },

//       // Customers grouped data with GST breakdown
//       customers: customers.map(cust => ({
//         customer_id: cust.customer_id,
//         customer_name: cust.customer_name,
//         customer_type: cust.customer_type,
//         gst_number: cust.gst_number,
//         state: cust.state,
//         address: cust.address,
//         phone: cust.phone,
//         summary: {
//           total_trips: cust.total_trips,
//           taxable_value: cust.taxable_value.toFixed(2),
//           cgst_amount: cust.total_cgst.toFixed(2),
//           sgst_amount: cust.total_sgst.toFixed(2),
//           igst_amount: cust.total_igst.toFixed(2),
//           gst_amount: cust.total_gst.toFixed(2),
//           total_amount: cust.total_amount.toFixed(2)
//         },
//         materials: Object.values(cust.trips_by_material).map(mat => ({
//           material_name: mat.material_name,
//           total_quantity: mat.total_quantity.toFixed(2),
//           total_amount: mat.total_amount.toFixed(2),
//           trip_count: mat.trips.length
//         })),
//         // For detailed view with GST breakdown
//         trips: cust.trips.slice(0, 10)
//       })),

//       // Overall summary with GST breakdown
//       summary: {
//         total_customers: overallTotals.total_customers,
//         total_trips: overallTotals.total_trips,
//         total_taxable_value: overallTotals.total_taxable_value.toFixed(2),
//         total_cgst: overallTotals.total_cgst.toFixed(2),
//         total_sgst: overallTotals.total_sgst.toFixed(2),
//         total_igst: overallTotals.total_igst.toFixed(2),
//         total_gst_amount: overallTotals.total_gst_amount.toFixed(2),
//         total_invoice_amount: overallTotals.total_invoice_amount.toFixed(2)
//       }
//     };

//     return gstInvoiceData;

//   } catch (error) {
//     console.error('Error generating GST invoice:', error);
//     throw error;
//   }
// };

const getGSTInvoiceData = async (owner_id, from_date, to_date, customer_id = null) => {
  try {
    // 1. Get owner details
    const owner = await User.findById(owner_id).select('name company_name address city state pincode phone gst_number logo');

    if (!owner) {
      throw new Error('Owner not found');
    }

    // 2. Get GST trips
    const trips = await Trip.find({
      owner_id,
      include_gst: true,
      isActive: true,
      trip_date: { $gte: new Date(from_date), $lte: new Date(to_date) },
      status: { $in: ['delivered', 'completed'] },
      ...(customer_id && { customer_id })
    })
      .populate('customer_id', 'name gst_number')  // Make sure gst_number is included
      .populate('collab_owner_id', 'name gst_number')
      .sort({ trip_date: 1 });

    if (trips.length === 0) {
      throw new Error('No GST trips found');
    }

    // Helper function to normalize material name for comparison
    const normalizeMaterial = (material) => {
      if (!material || typeof material !== 'string') return '';
      return material
        .toUpperCase()
        .trim()
        .replace(/\s+/g, ' ')      // Multiple spaces → single space
        .replace(/[^\w\s]/g, '')   // Remove special characters
        .trim();
    };

    // 3. GROUP BY CUSTOMER ONLY (not by material)
    const customerMap = {};
    let rowIndex = 1;

    trips.forEach(trip => {
      // Get customer
      const customer = trip.customer_id || trip.collab_owner_id;
      if (!customer) return;

      const customerId = customer._id.toString();
      const currentMaterial = trip.material_name || 'Material';
      const normalizedCurrentMaterial = normalizeMaterial(currentMaterial);
      
      // GST calculations
      const sgstPercent = parseFloat(trip.gst_values?.SGST?.replace('%', '') || '0');
      const cgstPercent = parseFloat(trip.gst_values?.CGST?.replace('%', '') || '0');
      const igstPercent = parseFloat(trip.gst_values?.IGST?.replace('%', '') || '0');
      const gstRate = sgstPercent + cgstPercent + igstPercent;

      const totalAmount = trip.customer_amount; // With GST
      const taxableAmount = totalAmount / (1 + (gstRate / 100));
      const gstAmount = totalAmount - taxableAmount;

      const cgstAmount = (gstAmount * cgstPercent) / gstRate || 0;
      const sgstAmount = (gstAmount * sgstPercent) / gstRate || 0;
      const igstAmount = (gstAmount * igstPercent) / gstRate || 0;

      // Create or update customer entry
      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          s_no: rowIndex++,
          customer_name: customer.name,
          customer_gstin: customer.gst_number || '',  // Store customer GSTIN
          materials: new Set(), // Store normalized material names
          original_materials: new Set(), // Store original material names for display
          quantity: 0, // Total trips for this customer
          taxable_value: 0,
          gst_rate: `${gstRate}%`,
          cgst_amount: 0,
          sgst_amount: 0,
          igst_amount: 0,
          total_amount: 0
        };
      }

      // Check if this material already exists (case-insensitive)
      let materialExists = false;
      const existingNormalizedMaterials = Array.from(customerMap[customerId].materials);
      
      for (const existingMaterial of existingNormalizedMaterials) {
        if (existingMaterial === normalizedCurrentMaterial) {
          materialExists = true;
          break;
        }
        
        // Also check without spaces for things like "MSAND" vs "M SAND"
        const noSpaceExisting = existingMaterial.replace(/\s/g, '');
        const noSpaceCurrent = normalizedCurrentMaterial.replace(/\s/g, '');
        
        if (noSpaceExisting === noSpaceCurrent) {
          materialExists = true;
          break;
        }
      }

      // If material doesn't exist, add it
      if (!materialExists) {
        customerMap[customerId].materials.add(normalizedCurrentMaterial);
        customerMap[customerId].original_materials.add(currentMaterial);
      }
      
      // Add to customer totals
      customerMap[customerId].quantity += 1;
      customerMap[customerId].taxable_value += taxableAmount;
      customerMap[customerId].cgst_amount += cgstAmount;
      customerMap[customerId].sgst_amount += sgstAmount;
      customerMap[customerId].igst_amount += igstAmount;
      customerMap[customerId].total_amount += totalAmount;
    });

    // 4. Convert to array and format description
    const gstRows = Object.values(customerMap).map(customer => {
      // Get original material names for display
      const originalMaterials = Array.from(customer.original_materials);
      
      // Build description with original material names
      let description = 'Goods Transport Service';
      if (originalMaterials.length > 0) {
        if (originalMaterials.length === 1) {
          description += ` - ${originalMaterials[0].toUpperCase()}`;
        } else {
          description += ` - ${originalMaterials.map(m => m.toUpperCase()).join(' + ')}`;
        }
      }
      
      // Format customer name with GSTIN
      let formattedCustomerName = customer.customer_name;
      if (customer.customer_gstin && customer.customer_gstin.trim() !== '') {
        // Format: Customer Name (GSTIN: XXXXXXXXXXXXXXX)
        formattedCustomerName = `${customer.customer_name} (GSTIN: ${customer.customer_gstin})`;
      }
      
      return {
        s_no: customer.s_no,
        customer_name: customer.customer_name, // Original name
        formatted_customer_name: formattedCustomerName, // Name with GSTIN
        customer_gstin: customer.customer_gstin || '', // GSTIN separately
        description: description,
        sac_code: "9965",
        quantity: customer.quantity, // Total trips for this customer
        taxable_value: customer.taxable_value,
        gst_rate: customer.gst_rate,
        cgst_amount: customer.cgst_amount,
        sgst_amount: customer.sgst_amount,
        igst_amount: customer.igst_amount,
        total_amount: customer.total_amount
      };
    });

    // 5. Calculate TOTALS
    const totals = gstRows.reduce((acc, row) => {
      return {
        total_taxable_value: acc.total_taxable_value + row.taxable_value,
        total_cgst: acc.total_cgst + row.cgst_amount,
        total_sgst: acc.total_sgst + row.sgst_amount,
        total_igst: acc.total_igst + row.igst_amount,
        total_gst: acc.total_gst + row.cgst_amount + row.sgst_amount + row.igst_amount,
        grand_total: acc.grand_total + row.total_amount
      };
    }, {
      total_taxable_value: 0,
      total_cgst: 0,
      total_sgst: 0,
      total_igst: 0,
      total_gst: 0,
      grand_total: 0
    });

    // 6. Return ONLY what's needed
    return {
      invoice_type: 'GST_INVOICE',
      invoice_number: `GST-${Date.now().toString().slice(-6)}`,
      from_date: from_date,
      to_date: to_date,
      
      company: {
        logo: owner.logo || null,
        name: owner.company_name || owner.name,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode,
        phone: owner.phone,
        gst_number: owner.gst_number || 'Not Provided'
      },

      // TABLE DATA - READY TO USE
      gst_table_rows: gstRows.map(row => ({
        s_no: row.s_no,
        customer_name: row.formatted_customer_name, // Use formatted name with GSTIN
        original_customer_name: row.customer_name, // Keep original for reference
        customer_gstin: row.customer_gstin, // GSTIN separately
        description: row.description,
        quantity: row.quantity,
        taxable_value: row.taxable_value.toFixed(2),
        gst_rate: row.gst_rate,
        cgst_amount: row.cgst_amount.toFixed(2),
        sgst_amount: row.sgst_amount.toFixed(2),
        igst_amount: row.igst_amount.toFixed(2),
        total_amount: row.total_amount.toFixed(2)
      })),

      // TOTALS - READY TO USE
      summary: {
        total_customers: new Set(gstRows.map(row => row.customer_name)).size,
        total_trips: trips.length,
        total_taxable_value: totals.total_taxable_value.toFixed(2),
        total_cgst: totals.total_cgst.toFixed(2),
        total_sgst: totals.total_sgst.toFixed(2),
        total_igst: totals.total_igst.toFixed(2),
        total_gst: totals.total_gst.toFixed(2),
        grand_total: totals.grand_total.toFixed(2)
      }
    };

  } catch (error) {
    console.error('Error generating GST invoice:', error);
    throw error;
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getCollaborativeTripsForMe,
  getTripById,
  getCollaborativeTripById,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  getTripStats,
  getTripsAnalytics,
  getTripFormData,
  getTripsByCrusherId,
  getTripsByCustomerId,
  getInvoiceData,
  cloneTrips,
  bulkSoftDeleteTrips,
  updateTripPricesForMultipleTrips,
  bulkUpdateTripStatus,
  updateCollabTripStatus,
  getCollaborationInvoiceData,
  getCrusherInvoiceData,
  getGSTInvoiceData
};