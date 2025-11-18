const Trip = require('../models/trip.model');

const createTrip = async (tripData) => {
  const {
    owner_id,
    lorry_id,
    driver_id,
    crusher_id,
    material_id,
    rate_per_unit,
    no_of_unit,
    crusher_amount,
    customer_id,
    location,
    customer_amount,
    trip_date,
    notes
  } = tripData;

  // Validate required fields
  if (!owner_id || !lorry_id || !driver_id || !crusher_id || !material_id || 
      !rate_per_unit || !no_of_unit || !crusher_amount || !customer_id || 
      !location || !customer_amount) {
    const err = new Error('All required fields must be provided');
    err.status = 400;
    throw err;
  }

  const newTrip = new Trip({
    owner_id,
    lorry_id,
    driver_id,
    crusher_id,
    material_id,
    rate_per_unit,
    no_of_unit,
    crusher_amount,
    customer_id,
    location,
    customer_amount,
    trip_date: trip_date || new Date(),
    notes
  });

  await newTrip.save();
  return newTrip;
};

const getAllTrips = async (owner_id, filterParams = {}) => {
  const { status, start_date, end_date } = filterParams;
  const query = { owner_id };
  
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

  return {
    period,
    total_trips: totalTrips,
    total_revenue: totalRevenue,
    total_cost: totalCost,
    total_profit: totalProfit,
    average_profit_per_trip: totalTrips > 0 ? totalProfit / totalTrips : 0
  };
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  getTripStats
};