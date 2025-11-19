const Attendance = require('../models/attendance.model');

const createAttendance = async (attendanceData) => {
  const {
    owner_id,
    driver_id,
    lorry_id,
    date,
    status
  } = attendanceData;

  if (!owner_id || !driver_id || !lorry_id || !date || !status) {
    const err = new Error('Owner ID, driver ID, lorry ID, date, and status are required');
    err.status = 400;
    throw err;
  }

  const newAttendance = new Attendance({
    owner_id,
    driver_id,
    lorry_id,
    date,
    status
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
    .populate('driver_id', 'name phone')
    .populate('lorry_id', 'registration_number nick_name')
    .sort({ date: -1, createdAt: -1 });

  return {
    count: attendance.length,
    attendance
  };
};

const getAttendanceById = async (id, owner_id) => {
  const attendance = await Attendance.findOne({ _id: id, owner_id })
    .populate('driver_id', 'name phone')
    .populate('lorry_id', 'registration_number nick_name');

  if (!attendance) {
    const err = new Error('Attendance record not found');
    err.status = 404;
    throw err;
  }
  return attendance;
};

const updateAttendance = async (id, owner_id, updateData) => {
  const updatedAttendance = await Attendance.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('driver_id', 'name phone')
    .populate('lorry_id', 'registration_number nick_name');

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
  }).populate('driver_id', 'name salary_per_duty');

  const totalRecords = attendance.length;
  const fulldutyCount = attendance.filter(a => a.status === 'fullduty').length;
  const halfdutyCount = attendance.filter(a => a.status === 'halfduty').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  // Calculate total salary cost
  const totalSalaryCost = attendance.reduce((sum, record) => {
    const driver = record.driver_id;
    if (driver && driver.salary_per_duty) {
      if (record.status === 'fullduty') {
        return sum + driver.salary_per_duty;
      } else if (record.status === 'halfduty') {
        return sum + (driver.salary_per_duty / 2);
      }
    }
    return sum;
  }, 0);

  return {
    period,
    total_records: totalRecords,
    fullduty_count: fulldutyCount,
    halfduty_count: halfdutyCount,
    absent_count: absentCount,
    total_salary_cost: totalSalaryCost,
    attendance_by_status: {
      fullduty: fulldutyCount,
      halfduty: halfdutyCount,
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
    .populate('driver_id', 'name salary_per_duty')
    .populate('lorry_id', 'registration_number nick_name')
    .sort({ date: -1 });

  const totalDays = attendance.length;
  const fulldutyDays = attendance.filter(a => a.status === 'fullduty').length;
  const halfdutyDays = attendance.filter(a => a.status === 'halfduty').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;

  // Calculate total earnings
  const totalEarnings = attendance.reduce((sum, record) => {
    const driver = record.driver_id;
    if (driver && driver.salary_per_duty) {
      if (record.status === 'fullduty') {
        return sum + driver.salary_per_duty;
      } else if (record.status === 'halfduty') {
        return sum + (driver.salary_per_duty / 2);
      }
    }
    return sum;
  }, 0);

  return {
    driver_id,
    total_days: totalDays,
    fullduty_days: fulldutyDays,
    halfduty_days: halfdutyDays,
    absent_days: absentDays,
    total_earnings: totalEarnings,
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