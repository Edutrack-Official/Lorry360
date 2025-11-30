const Trip = require('../models/trip.model');
const Customer = require('../models/customer.model');
const Driver = require('../models/driver.model');
const Crusher = require('../models/crusher.model');
const Lorry = require('../models/lorry.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');

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
    notes
  };

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

  // Generate trip number with monthly reset
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Count trips for current month
  const count = await Trip.countDocuments({
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }
  });
  
  const trip_number = `TR${yearMonth}${String(count + 1).padStart(4, '0')}`;

  // Calculate profit
  const profit = customer_amount - crusher_amount;

  // Add generated fields to dbData
  dbData.trip_number = trip_number;
  dbData.profit = profit;

  const newTrip = new Trip(dbData);
  await newTrip.save();
  return newTrip;
};

const getAllTrips = async (owner_id, filterParams = {}) => {
  const { status, start_date, end_date, lorry_id, driver_id, customer_id, collab_owner_id, trip_type, crusher_id  } = filterParams;
  const query = { owner_id };
  
  if (status) query.status = status;
  if (lorry_id) query.lorry_id = lorry_id;
  if (driver_id) query.driver_id = driver_id;
  
  // Filter by destination type
  if (trip_type === 'customer') {
    query.customer_id = { $exists: true, $ne: null };
  } else if (trip_type === 'collaborative') {
    query.collab_owner_id = { $exists: true, $ne: null };
  }
  
  if (customer_id) query.customer_id = customer_id;
  if (collab_owner_id) query.collab_owner_id = collab_owner_id;
  
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
    .sort({ trip_date: -1, createdAt: -1 });

  return {
    count: trips.length,
    trips
  };
};

// Get trips where I am the collaborative owner (trips delivered to me)
const getCollaborativeTripsForMe = async (collab_owner_id, filterParams = {}) => {
  const { status, start_date, end_date, owner_id } = filterParams;
  const query = { collab_owner_id };
  
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

const getTripById = async (id, owner_id) => {
  const trip = await Trip.findOne({ _id: id, owner_id })
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
const getCollaborativeTripById = async (id, collab_owner_id) => {
  const trip = await Trip.findOne({ _id: id, collab_owner_id })
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
  // Handle empty strings for customer_id and collab_owner_id
  if (updateData.customer_id !== undefined) {
    if (updateData.customer_id === "") {
      delete updateData.customer_id;
      // If customer_id is being removed and collab_owner_id exists, keep it
      // If both are being handled, ensure at least one exists
    } else {
      // If setting a valid customer_id, remove collab_owner_id
      delete updateData.collab_owner_id;
    }
  }

  if (updateData.collab_owner_id !== undefined) {
    if (updateData.collab_owner_id === "") {
      delete updateData.collab_owner_id;
    } else {
      // If setting a valid collab_owner_id, remove customer_id
      delete updateData.customer_id;
    }
  }

  // Validate that at least one destination exists after updates
  const existingTrip = await Trip.findOne({ _id: id, owner_id });
  if (!existingTrip) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }

  // Check if the update would result in no destination
  const willHaveCustomer = updateData.customer_id !== undefined ? 
    (updateData.customer_id !== "" && updateData.customer_id !== null) : 
    (existingTrip.customer_id !== null && existingTrip.customer_id !== undefined);
  
  const willHaveCollabOwner = updateData.collab_owner_id !== undefined ? 
    (updateData.collab_owner_id !== "" && updateData.collab_owner_id !== null) : 
    (existingTrip.collab_owner_id !== null && existingTrip.collab_owner_id !== undefined);

  if (!willHaveCustomer && !willHaveCollabOwner) {
    const err = new Error('Either customer or collaborative owner must be specified');
    err.status = 400;
    throw err;
  }

  // Recalculate profit if customer_amount or crusher_amount is updated
  if (updateData.customer_amount || updateData.crusher_amount) {
    const newCustomerAmount = updateData.customer_amount || existingTrip.customer_amount;
    const newCrusherAmount = updateData.crusher_amount || existingTrip.crusher_amount;
    updateData.profit = newCustomerAmount - newCrusherAmount;
  }

  const updatedTrip = await Trip.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
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
  const deletedTrip = await Trip.findOneAndDelete({ _id: id, owner_id });

  if (!deletedTrip) {
    const err = new Error('Trip not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { message: 'Trip deleted successfully' };
};

const updateTripStatus = async (id, owner_id, status) => {
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
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone')
    .populate('collab_owner_id', 'name company_name phone');

  if (!updatedTrip) {
    const err = new Error('Trip not found or status update failed');
    err.status = 404;
    throw err;
  }
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
    trip_date: { $gte: startDate }
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
const getTripsAnalytics = async (owner_id, start_date, end_date) => {
  const query = { 
    owner_id,
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
      total_customer_units: trips.reduce((sum, trip) => sum + trip.no_of_unit_customer, 0)
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
    Crusher.find({ owner_id })
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
  const { status, start_date, end_date } = filterParams;
  const query = { 
    owner_id, // Security: Only show trips belonging to this owner
    customer_id 
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
  const { status, start_date, end_date } = filterParams;
  const query = { 
    owner_id, // Security: Only show trips belonging to this owner
    crusher_id 
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

// Updated function in trip.controller.js

const getInvoiceData = async (owner_id, customer_id, from_date, to_date) => {
  try {
    // 1. Get current user (owner) details for company header
    const owner = await User.findById(owner_id).select('name company_name address city state pincode phone');
    
    if (!owner) {
      const err = new Error('Owner not found');
      err.status = 404;
      throw err;
    }

    // 2. Get customer details
    const customer = await Customer.findOne({ 
      _id: customer_id, 
      owner_id 
    }).select('name phone address site_addresses');

    if (!customer) {
      const err = new Error('Customer not found');
      err.status = 404;
      throw err;
    }

    // 3. Get trips for the customer in the date range
    const trips = await Trip.find({
      owner_id,
      customer_id,
      trip_date: { 
        $gte: new Date(from_date), 
        $lte: new Date(to_date) 
      },
      status: { $in: ['delivered', 'completed'] }
    })
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
      payment_date: { 
        $gte: new Date(from_date), 
        $lte: new Date(to_date) 
      },
      isActive: true
    }).sort({ payment_date: 1 });

    // 5. Group trips by material, quantity, location, price AND customer_amount (exact match)
    const groupedTrips = {};
    
    trips.forEach(trip => {
      const tripDate = trip.trip_date.toISOString().split('T')[0];
      const groupKey = `${trip.material_name}_${trip.no_of_unit_customer}_${trip.location}_${trip.rate_per_unit}_${trip.customer_amount}`;
      
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
    const previousTrips = await Trip.find({
      owner_id,
      customer_id,
      trip_date: { $lt: new Date(from_date) },
      status: { $in: ['delivered', 'completed'] }
    });

    const previousPayments = await Payment.find({
      owner_id,
      customer_id,
      payment_type: 'from_customer',
      payment_date: { $lt: new Date(from_date) },
      isActive: true
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
      is_opening_balance: true
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
            date: trip.trip_date
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
        full_address: `${owner.address}, ${owner.city}, ${owner.state} - ${owner.pincode}`
      },
      
      // Customer Information
      customer: {
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        site_addresses: customer.site_addresses || []
      },
      
      // Invoice Details
      invoice_details: {
        invoice_number: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        from_date: from_date,
        to_date: to_date,
        period: `${new Date(from_date).toLocaleDateString('en-IN')} to ${new Date(to_date).toLocaleDateString('en-IN')}`,
        opening_balance_date: previousDay.toISOString().split('T')[0],
        closing_balance_date: to_date
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
          closing_balance: `₹${currentBalance.toLocaleString('en-IN')}`
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
        terms: 'Payment terms : weekly payment (7 days credit)'
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
          editable: true
        })),
        payments: payments.map(payment => ({
          id: payment._id,
          payment_number: payment.payment_number,
          date: payment.payment_date,
          amount: payment.amount,
          mode: payment.payment_mode,
          editable: true
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
  getInvoiceData
};