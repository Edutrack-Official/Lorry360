const Salary = require('../models/salary.model');
const mongoose = require('mongoose');
const createSalary = async (salaryData) => {
  const {
    owner_id,
    driver_id
  } = salaryData;

  if (!owner_id || !driver_id) {
    const err = new Error('Owner ID and driver ID are required');
    err.status = 400;
    throw err;
  }

  // Check if salary record already exists for this driver
  const existingSalary = await Salary.findOne({ owner_id, driver_id });
  if (existingSalary) {
    return existingSalary;
  }

        // Generate salary number with monthly reset
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    // Count salary records for current month
  const count = await Salary.countDocuments({
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }
  });


  const salary_number = `SL${yearMonth}${String(count + 1).padStart(4, '0')}`;


  const newSalary = new Salary({
    salary_number,
    owner_id,
    driver_id
  });

  await newSalary.save();
  return newSalary;
};

const getSalaryByDriver = async (owner_id, driver_id) => {
  const salary = await Salary.findOne({ owner_id, driver_id })
    .populate('driver_id', 'name phone salary_per_duty');

  if (!salary) {
    // Create salary record if it doesn't exist
    return await createSalary({ owner_id, driver_id });
  }

  return salary;
};

const getAllSalaries = async (owner_id) => {
  const salaries = await Salary.find({ owner_id })
    .populate('driver_id', 'name phone salary_per_duty')
    .sort({ createdAt: -1 });

  return {
    count: salaries.length,
    salaries
  };
};

// Add advance amount
const addAdvance = async (owner_id, driver_id, advanceData) => {
  const { amount, notes } = advanceData;

  if (!amount || amount <= 0) {
    const err = new Error('Valid advance amount is required');
    err.status = 400;
    throw err;
  }

  const salary = await Salary.findOne({ owner_id, driver_id });
  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  salary.advance_transactions.push({
    type: 'given',
    amount,
    notes: notes || 'Advance given'
  });

  await salary.save();
  return salary;
};

// Deduct advance amount
const deductAdvance = async (owner_id, driver_id, deductionData) => {
  const { amount, notes } = deductionData;

  if (!amount || amount <= 0) {
    const err = new Error('Valid deduction amount is required');
    err.status = 400;
    throw err;
  }

  const salary = await Salary.findOne({ owner_id, driver_id });
  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  if (salary.advance_balance < amount) {
    const err = new Error('Insufficient advance balance');
    err.status = 400;
    throw err;
  }

  salary.advance_transactions.push({
    type: 'deducted',
    amount,
    notes: notes || 'Advance deduction'
  });

  await salary.save();
  return salary;
};

// Add bonus
const addBonus = async (owner_id, driver_id, bonusData) => {
  const { amount, reason } = bonusData;

  if (!amount || amount <= 0) {
    const err = new Error('Valid bonus amount is required');
    err.status = 400;
    throw err;
  }

  const salary = await Salary.findOne({ owner_id, driver_id });
  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  salary.bonus.push({
    amount,
    reason: reason || 'Bonus'
  });

  await salary.save();
  return salary;
};

// Make salary payment
const makePayment = async (owner_id, driver_id, paymentData) => {
  const {
    amount,
    payment_mode,
    deducted_from_advance,
    advance_deduction_amount,
    notes
  } = paymentData;

  if (!amount || amount <= 0 || !payment_mode) {
    const err = new Error('Valid amount and payment mode are required');
    err.status = 400;
    throw err;
  }

  const salary = await Salary.findOne({ owner_id, driver_id });
  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  // Validate advance deduction
  if (deducted_from_advance) {
    if (!advance_deduction_amount || advance_deduction_amount <= 0) {
      const err = new Error('Valid advance deduction amount is required');
      err.status = 400;
      throw err;
    }

    if (advance_deduction_amount > salary.advance_balance) {
      const err = new Error('Insufficient advance balance for deduction');
      err.status = 400;
      throw err;
    }

    if (advance_deduction_amount > amount) {
      const err = new Error('Advance deduction cannot exceed payment amount');
      err.status = 400;
      throw err;
    }

    // Add advance deduction transaction
    salary.advance_transactions.push({
      type: 'deducted',
      amount: advance_deduction_amount,
      notes: `Salary payment deduction: ${notes || ''}`
    });
  }

  // Add salary payment
  salary.amountpaid.push({
    amount,
    payment_mode,
    deducted_from_advance: deducted_from_advance || false,
    advance_deduction_amount: advance_deduction_amount || 0,
    notes: notes || 'Salary payment'
  });

  await salary.save();
  return salary;
};

// Get salary statistics
const getSalaryStats = async (owner_id) => {
  const salaries = await Salary.find({ owner_id })
    .populate('driver_id', 'name phone salary_per_duty');

  const totalAdvance = salaries.reduce((sum, salary) => sum + salary.advance_balance, 0);
  const totalBonus = salaries.reduce((sum, salary) => 
    sum + salary.bonus.reduce((bonusSum, bonus) => bonusSum + bonus.amount, 0), 0);
  const totalPaid = salaries.reduce((sum, salary) => 
    sum + salary.amountpaid.reduce((paidSum, payment) => paidSum + payment.amount, 0), 0);

  return {
    total_drivers: salaries.length,
    total_advance_balance: totalAdvance,
    total_bonus_given: totalBonus,
    total_salary_paid: totalPaid,
    drivers_with_advance: salaries.filter(s => s.advance_balance > 0).length
  };
};

// Get salary summary for driver
const getDriverSalarySummary = async (owner_id, driver_id) => {
  const salary = await Salary.findOne({ owner_id, driver_id })
    .populate('driver_id', 'name phone salary_per_duty');

  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  const totalBonus = salary.bonus.reduce((sum, bonus) => sum + bonus.amount, 0);
  const totalPaid = salary.amountpaid.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCashPaid = salary.amountpaid.reduce((sum, payment) => sum + payment.cash_paid, 0);
  const totalAdvanceDeduction = salary.amountpaid.reduce((sum, payment) => 
    sum + payment.advance_deduction_amount, 0);

  return {
    driver: salary.driver_id,
    advance_balance: salary.advance_balance,
    total_bonus: totalBonus,
    total_paid: totalPaid,
    total_cash_paid: totalCashPaid,
    total_advance_deduction: totalAdvanceDeduction,
    net_earnings: totalBonus + totalPaid,
    transaction_count: {
      advance_transactions: salary.advance_transactions.length,
      bonus_transactions: salary.bonus.length,
      salary_payments: salary.amountpaid.length
    }
  };
};
// Soft delete salary payment
const deleteSalaryPayment = async (driverId, paymentId, owner_id) => {
  // First find the salary record for this driver
  const salary = await mongoose.model('Salary').findOne({ 
    driver_id: driverId, 
    owner_id 
  });

  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  // Find and soft delete the payment
  const paymentIndex = salary.amountpaid.findIndex(
    payment => payment._id.toString() === paymentId
  );

  if (paymentIndex === -1) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }

  // Soft delete by setting isActive to false or removing from array
  // Depending on your schema, you might want to:
  // Option 1: Remove from array
  salary.amountpaid.splice(paymentIndex, 1);
  
  // Option 2: Or if you have isActive field in subdocuments:
  // salary.amountpaid[paymentIndex].isActive = false;

  await salary.save();
  return { message: 'Salary payment deleted successfully' };
};

// Soft delete salary advance
const deleteSalaryAdvance = async (driverId, advanceId, owner_id) => {
  const salary = await mongoose.model('Salary').findOne({ 
    driver_id: driverId, 
    owner_id 
  });

  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  const advanceIndex = salary.advance_transactions.findIndex(
    advance => advance._id.toString() === advanceId
  );

  if (advanceIndex === -1) {
    const err = new Error('Advance transaction not found');
    err.status = 404;
    throw err;
  }

  salary.advance_transactions.splice(advanceIndex, 1);
  await salary.save();
  return { message: 'Advance transaction deleted successfully' };
};

// Soft delete salary bonus
const deleteSalaryBonus = async (driverId, bonusId, owner_id) => {
  const salary = await mongoose.model('Salary').findOne({ 
    driver_id: driverId, 
    owner_id 
  });

  if (!salary) {
    const err = new Error('Salary record not found');
    err.status = 404;
    throw err;
  }

  const bonusIndex = salary.bonus.findIndex(
    bonus => bonus._id.toString() === bonusId
  );

  if (bonusIndex === -1) {
    const err = new Error('Bonus not found');
    err.status = 404;
    throw err;
  }

  salary.bonus.splice(bonusIndex, 1);
  await salary.save();
  return { message: 'Bonus deleted successfully' };
};
module.exports = {
  createSalary,
  getSalaryByDriver,
  getAllSalaries,
  addAdvance,
  deductAdvance,
  addBonus,
  makePayment,
  getSalaryStats,
  getDriverSalarySummary,
  deleteSalaryPayment, // Add this
  deleteSalaryAdvance, // Add this
  deleteSalaryBonus,   // Add this
};