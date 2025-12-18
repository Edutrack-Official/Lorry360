const Attendance = require('../models/attendance.model');

const createAttendance = async (attendanceData) => {
  const {
    owner_id,
    driver_id,
    lorry_id,
    date,
    status,
    salary_amount,
    no_of_trips
  } = attendanceData;

  // Remove lorry_id from required fields when status is 'absent'
  if (!owner_id || !driver_id || !date || !status) {
    const err = new Error('Owner ID, driver ID, date, and status are required');
    err.status = 400;
    throw err;
  }

  // Only require lorry_id if status is not 'absent'
  if (status !== 'absent' && !lorry_id) {
    const err = new Error('Lorry ID is required for non-absent attendance');
    err.status = 400;
    throw err;
  }

  const newAttendance = new Attendance({
    owner_id,
    driver_id,
    lorry_id: status === 'absent' ? null : lorry_id,
    date,
    status,
    salary_amount: salary_amount || 0,
    no_of_trips: no_of_trips || 0
  });

  await newAttendance.save();
  return newAttendance;
};
const getAllAttendance = async (owner_id, filterParams = {}) => {
  const { driver_id, lorry_id, start_date, end_date, status } = filterParams;
  const query = { owner_id };
  
  
  if (driver_id) query.driver_id = driver_id;
  if (lorry_id) query.lorry_id = lorry_id;
  if (status) query.status = status;
  
  // Date range filter
  if (start_date || end_date) {
    query.date = {};
    if (start_date) query.date.$gte = new Date(start_date);
    if (end_date) query.date.$lte = new Date(end_date);
  }

  const attendance = await Attendance.find(query)
    .populate('driver_id', 'name phone salary_per_duty salary_per_trip')
    .populate('lorry_id', 'registration_number nick_name')
    .sort({ date: -1, createdAt: -1 });

  return {
    count: attendance.length,
    attendance
  };
};

const getAttendanceById = async (id, owner_id) => {
  const attendance = await Attendance.findOne({ _id: id, owner_id })
    .populate('driver_id', 'name phone salary_per_duty salary_per_trip')
    .populate('lorry_id', 'registration_number nick_name');

  if (!attendance) {
    const err = new Error('Attendance record not found');
    err.status = 404;
    throw err;
  }
  return attendance;
};

const updateAttendance = async (id, owner_id, updateData) => {

  const updateQuery = { ...updateData };

  // If status is 'absent', remove lorry_id
  if (updateData.status === 'absent') {
    updateQuery.$unset = { lorry_id: 1 };
    delete updateQuery.lorry_id;
  }

  // If status is non-absent, ensure lorry_id exists
  if (updateData.status && updateData.status !== 'absent') {
    if (!updateData.lorry_id) {
      const existing = await Attendance.findOne({ _id: id, owner_id });
      if (!existing?.lorry_id) {
        const err = new Error('Lorry ID is required for non-absent attendance');
        err.status = 400;
        throw err;
      }
    }
  }

  const updatedAttendance = await Attendance.findOneAndUpdate(
    { _id: id, owner_id },
    updateQuery,
    { new: true, runValidators: true }
  )
    .populate('driver_id', 'name phone salary_per_duty salary_per_trip');

  if (!updatedAttendance) {
    const err = new Error('Attendance record not found or update failed');
    err.status = 404;
    throw err;
  }

  return updatedAttendance;
};

const deleteAttendance = async (id, owner_id) => {
  const deletedAttendance = await Attendance.findOneAndDelete({ _id: id, owner_id });

  if (!deletedAttendance) {
    const err = new Error('Attendance record not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { message: 'Attendance record deleted successfully' };
};

// Get attendance statistics
const getAttendanceStats = async (owner_id, period = 'month') => {
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

  const attendance = await Attendance.find({
    owner_id,
    date: { $gte: startDate }
  }).populate('driver_id', 'name salary_per_duty salary_per_trip');

  const totalRecords = attendance.length;
  const fulldutyCount = attendance.filter(a => a.status === 'fullduty').length;
  const halfdutyCount = attendance.filter(a => a.status === 'halfduty').length;
  const doubledutyCount = attendance.filter(a => a.status === 'doubleduty').length;
  const tripdutyCount = attendance.filter(a => a.status === 'tripduty').length;
  const customCount = attendance.filter(a => a.status === 'custom').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  // Calculate total salary cost using salary_amount field
  const totalSalaryCost = attendance.reduce((sum, record) => {
    return sum + (record.salary_amount || 0);
  }, 0);

  // Calculate total trips for tripduty records
  const totalTrips = attendance.reduce((sum, record) => {
    return sum + (record.no_of_trips || 0);
  }, 0);

  return {
    period,
    total_records: totalRecords,
    fullduty_count: fulldutyCount,
    halfduty_count: halfdutyCount,
    doubleduty_count: doubledutyCount,
    tripduty_count: tripdutyCount,
    custom_count: customCount,
    absent_count: absentCount,
    total_salary_cost: totalSalaryCost,
    total_trips: totalTrips,
    attendance_by_status: {
      fullduty: fulldutyCount,
      halfduty: halfdutyCount,
      doubleduty: doubledutyCount,
      tripduty: tripdutyCount,
      custom: customCount,
      absent: absentCount
    }
  };
};

// Get attendance by driver
const getAttendanceByDriver = async (owner_id, driver_id, start_date, end_date) => {
  const query = { owner_id, driver_id };
  
  if (start_date || end_date) {
    query.date = {};
    if (start_date) query.date.$gte = new Date(start_date);
    if (end_date) query.date.$lte = new Date(end_date);
  }

  const attendance = await Attendance.find(query)
    .populate('driver_id', 'name salary_per_duty salary_per_trip')
    .populate('lorry_id', 'registration_number nick_name')
    .sort({ date: -1 });

  const totalDays = attendance.length;
  const fulldutyDays = attendance.filter(a => a.status === 'fullduty').length;
  const halfdutyDays = attendance.filter(a => a.status === 'halfduty').length;
  const doubledutyDays = attendance.filter(a => a.status === 'doubleduty').length;
  const tripdutyDays = attendance.filter(a => a.status === 'tripduty').length;
  const customDays = attendance.filter(a => a.status === 'custom').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;

  // Calculate total earnings using salary_amount field
  const totalEarnings = attendance.reduce((sum, record) => {
    return sum + (record.salary_amount || 0);
  }, 0);


  // Calculate total trips
  const totalTrips = attendance.reduce((sum, record) => {
    return sum + (record.no_of_trips || 0);
  }, 0);

  return {
    driver_id,
    total_days: totalDays,
    fullduty_days: fulldutyDays,
    halfduty_days: halfdutyDays,
    doubleduty_days: doubledutyDays,
    tripduty_days: tripdutyDays,
    custom_days: customDays,
    absent_days: absentDays,
    total_earnings: totalEarnings,
    total_trips: totalTrips,
    attendance
  };
};

module.exports = {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  getAttendanceByDriver
};