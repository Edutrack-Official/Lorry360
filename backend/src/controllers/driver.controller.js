const Driver = require('../models/driver.model');

const createDriver = async (driverData) => {
  const {
    owner_id,
    name,
    phone,
    address,
    salary_per_duty,
    salary_per_trip,
    status
  } = driverData;

  // Validate required fields
  if (!owner_id || !name || !phone || !address) {
    const err = new Error('Owner ID, name, phone, and address are required');
    err.status = 400;
    throw err;
  }

  // Validate that at least one salary type is provided
  if ((!salary_per_duty || salary_per_duty === 0) && (!salary_per_trip || salary_per_trip === 0)) {
    const err = new Error('At least one salary type (salary_per_duty or salary_per_trip) must be provided');
    err.status = 400;
    throw err;
  }

  const newDriver = new Driver({
    owner_id,
    name,
    phone,
    address,
    salary_per_duty: salary_per_duty || 0,
    salary_per_trip: salary_per_trip || 0,
    status: status || 'active'
  });

  await newDriver.save();
  return newDriver;
};

const getAllDrivers = async (owner_id, filterParams = {}) => {
  const { status } = filterParams;
  const query = { owner_id };
  
  if (status) query.status = status;

  const drivers = await Driver.find(query)
    .populate('owner_id', 'name company_name')
    .sort({ createdAt: -1 });

  return {
    count: drivers.length,
    drivers
  };
};

const getDriverById = async (id, owner_id) => {
  const driver = await Driver.findOne({ _id: id, owner_id })
    .populate('owner_id', 'name company_name');

  if (!driver) {
    const err = new Error('Driver not found');
    err.status = 404;
    throw err;
  }
  return driver;
};

const updateDriver = async (id, owner_id, updateData) => {
  // Validate that at least one salary type is provided when updating
  if (updateData.salary_per_duty !== undefined && updateData.salary_per_trip !== undefined) {
    if (updateData.salary_per_duty === 0 && updateData.salary_per_trip === 0) {
      const err = new Error('At least one salary type (salary_per_duty or salary_per_trip) must be provided');
      err.status = 400;
      throw err;
    }
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  ).populate('owner_id', 'name company_name');

  if (!updatedDriver) {
    const err = new Error('Driver not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedDriver;
};

const deleteDriver = async (id, owner_id) => {
  const deletedDriver = await Driver.findOneAndDelete({ _id: id, owner_id });

  if (!deletedDriver) {
    const err = new Error('Driver not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { message: 'Driver deleted successfully' };
};

const updateDriverStatus = async (id, owner_id, status) => {
  const updatedDriver = await Driver.findOneAndUpdate(
    { _id: id, owner_id },
    { status },
    { new: true, runValidators: true }
  ).populate('owner_id', 'name company_name');

  if (!updatedDriver) {
    const err = new Error('Driver not found or status update failed');
    err.status = 404;
    throw err;
  }
  return updatedDriver;
};

// Get driver statistics
const getDriverStats = async (owner_id) => {
  const drivers = await Driver.find({ owner_id });
  
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const inactiveDrivers = drivers.filter(d => d.status === 'inactive').length;
  
  const totalSalaryPerDuty = drivers.reduce((sum, driver) => sum + (driver.salary_per_duty || 0), 0);
  const totalSalaryPerTrip = drivers.reduce((sum, driver) => sum + (driver.salary_per_trip || 0), 0);
  const averageSalaryPerDuty = totalDrivers > 0 ? totalSalaryPerDuty / totalDrivers : 0;
  const averageSalaryPerTrip = totalDrivers > 0 ? totalSalaryPerTrip / totalDrivers : 0;

  // Count drivers by salary type
  const driversWithDutySalary = drivers.filter(d => d.salary_per_duty > 0).length;
  const driversWithTripSalary = drivers.filter(d => d.salary_per_trip > 0).length;
  const driversWithBothSalary = drivers.filter(d => d.salary_per_duty > 0 && d.salary_per_trip > 0).length;

  return {
    total_drivers: totalDrivers,
    active_drivers: activeDrivers,
    inactive_drivers: inactiveDrivers,
    total_salary_per_duty: totalSalaryPerDuty,
    total_salary_per_trip: totalSalaryPerTrip,
    average_salary_per_duty: averageSalaryPerDuty,
    average_salary_per_trip: averageSalaryPerTrip,
    salary_type_breakdown: {
      duty_only: driversWithDutySalary - driversWithBothSalary,
      trip_only: driversWithTripSalary - driversWithBothSalary,
      both: driversWithBothSalary
    }
  };
};

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  getDriverStats
};