const Trip = require('../models/trip.model');
const Customer = require('../models/customer.model');
const Driver = require('../models/driver.model');
const Crusher = require('../models/crusher.model');
const Lorry = require('../models/lorry.model');

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
    location,
    customer_amount,
    trip_date,
    dc_number,
    notes
  } = tripData;

  // Validate required fields
  if (!owner_id || !lorry_id || !driver_id || !crusher_id || !material_name || 
      !rate_per_unit || !no_of_unit_crusher || !no_of_unit_customer || !crusher_amount || !customer_id || 
      !location || !customer_amount) {
    const err = new Error('All required fields must be provided');
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

  const newTrip = new Trip({
    trip_number, // Add the generated trip number
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
    location,
    customer_amount,
    profit, // Add calculated profit
    dc_number,
    trip_date: trip_date || new Date(),
    notes
  });

  await newTrip.save();
  return newTrip;
};

const getAllTrips = async (owner_id, filterParams = {}) => {
  const { status, start_date, end_date, lorry_id, driver_id, customer_id, crusher_id  } = filterParams;
  const query = { owner_id };
  
  if (status) query.status = status;
  if (lorry_id) query.lorry_id = lorry_id;
  if (driver_id) query.driver_id = driver_id;
  if (customer_id) query.customer_id = customer_id;
  if (crusher_id) query.crusher_id = crusher_id; // Add this line

  
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
    .populate('customer_id', 'name phone address');

  if (!trip) {
    const err = new Error('Trip not found');
    err.status = 404;
    throw err;
  }
  return trip;
};

const updateTrip = async (id, owner_id, updateData) => {

  updateData.profit = updateData.customer_amount - updateData.crusher_amount; 
  const updatedTrip = await Trip.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('lorry_id', 'registration_number nick_name')
    .populate('driver_id', 'name phone')
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name phone');

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
    .populate('customer_id', 'name phone');

  if (!updatedTrip) {
    const err = new Error('Trip not found or status update failed');
    err.status = 404;
    throw err;
  }
  return updatedTrip;
};

// Get trip statistics
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
    total_revenue: totalRevenue,
    total_cost: totalCost,
    total_profit: totalProfit,
    total_crusher_units: totalCrusherUnits,
    total_customer_units: totalCustomerUnits,
    average_profit_per_trip: totalTrips > 0 ? totalProfit / totalTrips : 0,
    average_revenue_per_trip: totalTrips > 0 ? totalRevenue / totalTrips : 0
  };
};

// Get trips by date range with detailed analytics
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
    .sort({ trip_date: 1 });

  const analytics = {
    summary: {
      total_trips: trips.length,
      total_revenue: trips.reduce((sum, trip) => sum + trip.customer_amount, 0),
      total_cost: trips.reduce((sum, trip) => sum + trip.crusher_amount, 0),
      total_profit: trips.reduce((sum, trip) => sum + trip.profit, 0),
      total_crusher_units: trips.reduce((sum, trip) => sum + trip.no_of_unit_crusher, 0),
      total_customer_units: trips.reduce((sum, trip) => sum + trip.no_of_unit_customer, 0)
    },
    by_lorry: {},
    by_driver: {},
    by_customer: {},
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
    const customerName = trip.customer_id?.name || 'Unknown';
    if (!analytics.by_customer[customerName]) {
      analytics.by_customer[customerName] = { trips: 0, revenue: 0, profit: 0 };
    }
    analytics.by_customer[customerName].trips += 1;
    analytics.by_customer[customerName].revenue += trip.customer_amount;
    analytics.by_customer[customerName].profit += trip.profit;

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

// Get form data for creating/editing trips
const getTripFormData = async (owner_id) => {
  // Fetch all data in parallel for better performance
  const [customers, drivers, crushers, lorries] = await Promise.all([
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
      .sort({ registration_number: 1 })
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
    }))
  };

  return formData;
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  getTripStats,
  getTripsAnalytics,
  getTripFormData
};