const mongoose = require('mongoose'); // Add this import
const Payment = require('../models/payment.model');
const Trip = require('../models/trip.model');

const createPayment = async (paymentData) => {
  const {
    owner_id,
    payment_type,
    crusher_id,
    customer_id,
    amount,
    payment_date,
    payment_mode,
    notes
  } = paymentData;

  // Validate required fields
  if (!owner_id || !payment_type || !amount || !payment_mode) {
    const err = new Error('Owner ID, payment type, amount, and payment mode are required');
    err.status = 400;
    throw err;
  }

  // Validate type-specific fields
  if (payment_type === 'to_crusher' && !crusher_id) {
    const err = new Error('Crusher ID is required for crusher payments');
    err.status = 400;
    throw err;
  }

  if (payment_type === 'from_customer' && !customer_id) {
    const err = new Error('Customer ID is required for customer payments');
    err.status = 400;
    throw err;
  }

   // Generate payment number (ADD THIS)
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Count payments for current month
  const count = await Payment.countDocuments({
    isActive: true,
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }
  });

  const payment_number = `PMT${yearMonth}${String(count + 1).padStart(4, '0')}`;

  const newPayment = new Payment({
    payment_number,
    owner_id,
    payment_type,
    crusher_id,
    customer_id,
    amount,
    payment_date: payment_date || new Date(),
    payment_mode,
    notes
  });

  await newPayment.save();
  return newPayment;
};

const getAllPayments = async (owner_id, filterParams = {}) => {
  const { payment_type, payment_mode, start_date, end_date } = filterParams;
  const query = { 
    owner_id,
    isActive: true // Only active payments
   };
  
  if (payment_type) query.payment_type = payment_type;
  if (payment_mode) query.payment_mode = payment_mode;
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name')
    .sort({ payment_date: -1, createdAt: -1 });

  return {
    count: payments.length,
    payments
  };
};

const getPaymentById = async (id, owner_id) => {
  const payment = await Payment.findOne({ _id: id, owner_id })
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name');

  if (!payment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  return payment;
};

const updatePayment = async (id, owner_id, updateData) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: id, owner_id,       isActive: true },
    updateData,
    { new: true, runValidators: true }
  )
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name');

  if (!updatedPayment) {
    const err = new Error('Payment not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedPayment;
};

// ✅ Simple Soft Delete Only
const deletePayment = async (id, owner_id) => {
  const deletedPayment = await Payment.findOneAndUpdate(
    { 
      _id: id, 
      owner_id, 
      isActive: true // Only soft delete active payments
    },
    { isActive: false },
    { new: true }
  );

  if (!deletedPayment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Payment deleted successfully' };
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

// Get payment statistics
const getPaymentStats = async (owner_id, period = 'month') => {
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

  const payments = await Payment.find({
    owner_id,
    isActive: true, // Only active payments
    payment_date: { $gte: startDate }
  });

  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Separate incoming and outgoing payments
  const incomingPayments = payments.filter(p => p.payment_type === 'from_customer');
  const outgoingPayments = payments.filter(p => p.payment_type === 'to_crusher');
  
  const totalIncoming = incomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoing = outgoingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const netCashFlow = totalIncoming - totalOutgoing;

  // Group by payment mode
  const paymentModeStats = payments.reduce((acc, payment) => {
    const mode = payment.payment_mode;
    acc[mode] = (acc[mode] || 0) + payment.amount;
    return acc;
  }, {});

  return {
    period,
    total_payments: totalPayments,
    total_amount: totalAmount,
    total_incoming: totalIncoming,
    total_outgoing: totalOutgoing,
    net_cash_flow: netCashFlow,
    average_payment: totalPayments > 0 ? totalAmount / totalPayments : 0,
    payment_mode_breakdown: paymentModeStats,
    incoming_count: incomingPayments.length,
    outgoing_count: outgoingPayments.length
  };
};

// Get payments by crusher
const getPaymentsByCrusher = async (owner_id, crusher_id) => {
  // Get all payments made to this crusher
  const payments = await Payment.find({ 
    owner_id, 
    crusher_id,
    payment_type: 'to_crusher',
    isActive: true // Only active payments
  })
    .populate('crusher_id', 'name')
    .sort({ payment_date: -1 });

  // Get all trips from this crusher to calculate total owed amount
  const trips = await Trip.find({ owner_id, crusher_id });
  
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOwed = trips.reduce((sum, trip) => sum + trip.crusher_amount, 0);
  const balance = totalOwed - totalPaid;

  return {
    crusher_id,
    crusher_name: payments[0]?.crusher_id?.name || 'Crusher',
    total_trips: trips.length,
    total_owed: totalOwed,    // From trips (crusher_amount)
    total_paid: totalPaid,    // From payments (amount)
    balance: balance,         // Owed - Paid
    payment_count: payments.length,
    payments
  };
};

// Get payments by customer
const getPaymentsByCustomer = async (owner_id, customer_id) => {
  // Get all payments received from this customer
  const payments = await Payment.find({ 
    owner_id, 
    customer_id,
    payment_type: 'from_customer',
        isActive: true // Only active payments
  })
    .populate('customer_id', 'name')
    .sort({ payment_date: -1 });

  // Get all trips for this customer to calculate total receivable amount
  const trips = await Trip.find({ owner_id, customer_id });
  
  const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceivable = trips.reduce((sum, trip) => sum + trip.customer_amount, 0);
  const balance = totalReceivable - totalReceived;

  return {
    customer_id,
    customer_name: payments[0]?.customer_id?.name || 'Customer',
    total_trips: trips.length,
    total_receivable: totalReceivable,  // From trips (customer_amount)
    total_received: totalReceived,      // From payments (amount)
    balance: balance,                   // Receivable - Received
    payment_count: payments.length,
    payments
  };
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  deleteSalaryPayment, // Add this
  deleteSalaryAdvance, // Add this
  deleteSalaryBonus,   // Add this
  getPaymentStats,
  getPaymentsByCrusher,
  getPaymentsByCustomer
};