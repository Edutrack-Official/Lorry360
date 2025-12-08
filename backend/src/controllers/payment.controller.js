const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Trip = require('../models/trip.model');

const createPayment = async (paymentData) => {
  const {
    owner_id,
    payment_type,
    crusher_id,
    customer_id,
    collab_owner_id,
    bunk_id,
    amount,
    payment_date,
    payment_mode,
    notes,
    collab_payment_status
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

  if (payment_type === 'to_collab_owner' && !collab_owner_id) {
    const err = new Error('Collaboration owner ID is required for collaboration payments');
    err.status = 400;
    throw err;
  }

  if (payment_type === 'to_bunk' && !bunk_id) {
    const err = new Error('Bunk ID is required for bunk payments');
    err.status = 400;
    throw err;
  }

  // Generate payment number
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
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
    collab_owner_id,
    bunk_id,
    amount,
    payment_date: payment_date || new Date(),
    payment_mode,
    notes,
    collab_payment_status: payment_type === 'to_collab_owner' 
      ? (collab_payment_status || 'pending') 
      : undefined
  });

  await newPayment.save();
  
  // Populate the created payment
  const populatedPayment = await Payment.findById(newPayment._id)
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name')
    .populate('collab_owner_id', 'name email phone')
    .populate('bunk_id', 'bunk_name address');

  return populatedPayment;
};

const getAllPayments = async (owner_id, filterParams = {}) => {
  const { 
    payment_type, 
    payment_mode, 
    start_date, 
    end_date,
    collab_owner_id,
    bunk_id,
    collab_payment_status,
    include_inactive = false
  } = filterParams;
  
  const query = { 
    owner_id,
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  if (payment_type) query.payment_type = payment_type;
  if (payment_mode) query.payment_mode = payment_mode;
  if (collab_owner_id) query.collab_owner_id = collab_owner_id;
  if (bunk_id) query.bunk_id = bunk_id;
  if (collab_payment_status) query.collab_payment_status = collab_payment_status;
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name')
    .populate('collab_owner_id', 'name email phone')
    .populate('bunk_id', 'bunk_name address')
    .sort({ payment_date: -1, createdAt: -1 });

  return {
    count: payments.length,
    payments
  };
};

const getPaymentById = async (id, owner_id, include_inactive = false) => {
  const query = { 
    _id: id, 
    owner_id 
  };
  
  if (!include_inactive) {
    query.isActive = true;
  }
  
  const payment = await Payment.findOne(query)
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name')
    .populate('collab_owner_id', 'name email phone')
    .populate('bunk_id', 'bunk_name address');

  if (!payment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  return payment;
};

const updatePayment = async (id, owner_id, updateData) => {
  // Don't allow changing payment_type or owner_id or collab_owner_id or bunk_id
  const allowedUpdates = [
    'amount',
    'payment_date',
    'payment_mode',
    'notes',
    'collab_payment_status'
  ];
  
  const filteredUpdates = {};
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updateData[key];
    }
  });

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: id, owner_id, isActive: true },
    filteredUpdates,
    { new: true, runValidators: true }
  )
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name')
    .populate('collab_owner_id', 'name email phone')
    .populate('bunk_id', 'bunk_name address');

  if (!updatedPayment) {
    const err = new Error('Payment not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedPayment;
};

const updateCollabPaymentStatus = async (id, owner_id, collab_owner_id, status) => {
  // Validate status
  if (!['approved', 'rejected'].includes(status)) {
    const err = new Error('Invalid status. Use "approved" or "rejected"');
    err.status = 400;
    throw err;
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { 
      _id: id, 
      owner_id,
      collab_owner_id,
      payment_type: 'to_collab_owner',
      isActive: true 
    },
    { collab_payment_status: status },
    { new: true, runValidators: true }
  )
    .populate('collab_owner_id', 'name email phone');

  if (!updatedPayment) {
    const err = new Error('Collaboration payment not found or update failed');
    err.status = 404;
    throw err;
  }
  
  return updatedPayment;
};

const deletePayment = async (id, owner_id) => {
  const deletedPayment = await Payment.findOneAndUpdate(
    { 
      _id: id, 
      owner_id, 
      isActive: true
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

// Get all collaboration payments for a specific collab owner
const getCollabPaymentsForOwner = async (owner_id, collab_owner_id, filterParams = {}) => {
  const { 
    status, 
    start_date, 
    end_date,
    payment_mode 
  } = filterParams;
  
  const query = { 
    owner_id,
    collab_owner_id,
    payment_type: 'to_collab_owner',
    isActive: true
  };
  
  if (status) query.collab_payment_status = status;
  if (payment_mode) query.payment_mode = payment_mode;
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('collab_owner_id', 'name email phone')
    .sort({ payment_date: -1, createdAt: -1 });

  // Calculate summary
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(p => p.collab_payment_status === 'pending');
  const approvedPayments = payments.filter(p => p.collab_payment_status === 'approved');
  const rejectedPayments = payments.filter(p => p.collab_payment_status === 'rejected');

  return {
    collab_owner_id,
    summary: {
      total_payments: payments.length,
      total_amount: totalAmount,
      pending_count: pendingPayments.length,
      pending_amount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      approved_count: approvedPayments.length,
      approved_amount: approvedPayments.reduce((sum, p) => sum + p.amount, 0),
      rejected_count: rejectedPayments.length,
      rejected_amount: rejectedPayments.reduce((sum, p) => sum + p.amount, 0)
    },
    payments
  };
};

// Get payment statistics (updated to include collab payments and bunk payments)
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
    isActive: true,
    payment_date: { $gte: startDate }
  })
  .populate('crusher_id', 'name')
  .populate('bunk_id', 'bunk_name')
  .populate('customer_id', 'name')
  .populate('collab_owner_id', 'name');

  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Separate by payment type
  const incomingPayments = payments.filter(p => p.payment_type === 'from_customer');
  const outgoingCrusherPayments = payments.filter(p => p.payment_type === 'to_crusher');
  const outgoingCollabPayments = payments.filter(p => p.payment_type === 'to_collab_owner');
  const outgoingBunkPayments = payments.filter(p => p.payment_type === 'to_bunk');
  
  const totalIncoming = incomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoingCrusher = outgoingCrusherPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoingCollab = outgoingCollabPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoingBunk = outgoingBunkPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoing = totalOutgoingCrusher + totalOutgoingCollab + totalOutgoingBunk;
  const netCashFlow = totalIncoming - totalOutgoing;

  // Group by payment mode
  const paymentModeStats = payments.reduce((acc, payment) => {
    const mode = payment.payment_mode;
    acc[mode] = (acc[mode] || 0) + payment.amount;
    return acc;
  }, {});

  // Collab payment status breakdown
  const collabPaymentStats = {
    pending: outgoingCollabPayments.filter(p => p.collab_payment_status === 'pending').length,
    approved: outgoingCollabPayments.filter(p => p.collab_payment_status === 'approved').length,
    rejected: outgoingCollabPayments.filter(p => p.collab_payment_status === 'rejected').length
  };

  // Bunk payment breakdown
  const bunkBreakdown = {};
  outgoingBunkPayments.forEach(payment => {
    const bunkName = payment.bunk_id?.bunk_name || 'Unknown Bunk';
    bunkBreakdown[bunkName] = (bunkBreakdown[bunkName] || 0) + payment.amount;
  });

  // Crusher payment breakdown
  const crusherBreakdown = {};
  outgoingCrusherPayments.forEach(payment => {
    const crusherName = payment.crusher_id?.name || 'Unknown Crusher';
    crusherBreakdown[crusherName] = (crusherBreakdown[crusherName] || 0) + payment.amount;
  });

  return {
    period,
    total_payments: totalPayments,
    total_amount: totalAmount,
    total_incoming: totalIncoming,
    total_outgoing: totalOutgoing,
    total_outgoing_crusher: totalOutgoingCrusher,
    total_outgoing_collab: totalOutgoingCollab,
    total_outgoing_bunk: totalOutgoingBunk,
    net_cash_flow: netCashFlow,
    average_payment: totalPayments > 0 ? totalAmount / totalPayments : 0,
    payment_mode_breakdown: paymentModeStats,
    incoming_count: incomingPayments.length,
    outgoing_crusher_count: outgoingCrusherPayments.length,
    outgoing_collab_count: outgoingCollabPayments.length,
    outgoing_bunk_count: outgoingBunkPayments.length,
    collab_payment_status: collabPaymentStats,
    bunk_breakdown: bunkBreakdown,
    crusher_breakdown: crusherBreakdown
  };
};

// NEW: Get payments by bunk
const getPaymentsByBunk = async (owner_id, bunk_id, filterParams = {}) => {
  const { 
    start_date, 
    end_date,
    include_inactive = false 
  } = filterParams;
  
  const query = { 
    owner_id, 
    bunk_id,
    payment_type: 'to_bunk',
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('bunk_id', 'bunk_name address')
    .sort({ payment_date: -1 });

  // Get fuel expenses for this bunk to calculate total owed
  const Expense = require('../models/expense.model');
  const fuelExpenses = await Expense.find({
    owner_id,
    bunk_id,
    category: 'fuel',
    isActive: true
  });

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalFuelExpenses = fuelExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalFuelExpenses - totalPaid; // Positive = owe to bunk, Negative = credit with bunk

  return {
    bunk_id,
    bunk_name: payments[0]?.bunk_id?.bunk_name || 'Bunk',
    total_fuel_expenses: fuelExpenses.length,
    total_fuel_amount: totalFuelExpenses,
    total_paid: totalPaid,
    balance: balance,
    payment_count: payments.length,
    payments,
    fuel_expenses_summary: {
      count: fuelExpenses.length,
      total_amount: totalFuelExpenses,
      breakdown_by_lorry: fuelExpenses.reduce((acc, expense) => {
        if (expense.lorry_id) {
          const lorryName = expense.lorry_id?.registration_number || 'Unknown';
          acc[lorryName] = (acc[lorryName] || 0) + expense.amount;
        }
        return acc;
      }, {})
    }
  };
};

const getPaymentsAsReceiver = async (collab_owner_id, filterParams = {}) => {
  const { 
    payment_mode, 
    start_date, 
    end_date,
    collab_payment_status,
    owner_id  // Filter by specific partner (optional)
  } = filterParams;
  
  const query = { 
    collab_owner_id,  // I am the receiver
    payment_type: 'to_collab_owner',
    isActive: true
  };
  
  if (payment_mode) query.payment_mode = payment_mode;
  if (collab_payment_status) query.collab_payment_status = collab_payment_status;
  if (owner_id) query.owner_id = owner_id;  // Filter by specific partner
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('owner_id', 'name email phone company_name')
    .populate('collab_owner_id', 'name email phone company_name')
    .sort({ payment_date: -1, createdAt: -1 });

  return {
    count: payments.length,
    payments
  };
};

// Get payments by crusher (updated to filter by status)
const getPaymentsByCrusher = async (owner_id, crusher_id, filterParams = {}) => {
  const { 
    start_date, 
    end_date,
    include_inactive = false 
  } = filterParams;
  
  const query = { 
    owner_id, 
    crusher_id,
    payment_type: 'to_crusher',
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('crusher_id', 'name')
    .sort({ payment_date: -1 });

  const trips = await Trip.find({
    owner_id,
    crusher_id,
    status: { $in: ['completed', 'delivered'] },
    isActive: true
  });
  
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOwed = trips.reduce((sum, trip) => sum + trip.crusher_amount, 0);
  const balance = totalOwed - totalPaid;

  return {
    crusher_id,
    crusher_name: payments[0]?.crusher_id?.name || 'Crusher',
    total_trips: trips.length,
    total_owed: totalOwed,
    total_paid: totalPaid,
    balance: balance,
    payment_count: payments.length,
    payments,
    trips_summary: {
      count: trips.length,
      total_amount: totalOwed,
      last_trip_date: trips.length > 0 ? trips[trips.length - 1].trip_date : null
    }
  };
};

// Get payments by customer (updated with filters)
const getPaymentsByCustomer = async (owner_id, customer_id, filterParams = {}) => {
  const { 
    start_date, 
    end_date,
    include_inactive = false 
  } = filterParams;
  
  const query = { 
    owner_id, 
    customer_id,
    payment_type: 'from_customer',
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('customer_id', 'name')
    .sort({ payment_date: -1 });

  const trips = await Trip.find({ 
    owner_id, 
    customer_id,
    status: { $in: ['completed', 'delivered'] },
    isActive: true
  });
  
  const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceivable = trips.reduce((sum, trip) => sum + trip.customer_amount, 0);
  const balance = totalReceivable - totalReceived;

  return {
    customer_id,
    customer_name: payments[0]?.customer_id?.name || 'Customer',
    total_trips: trips.length,
    total_receivable: totalReceivable,
    total_received: totalReceived,
    balance: balance,
    payment_count: payments.length,
    payments,
    trips_summary: {
      count: trips.length,
      total_amount: totalReceivable,
      last_trip_date: trips.length > 0 ? trips[trips.length - 1].trip_date : null
    }
  };
};

const getMyPaymentsToPartner = async (owner_id, partner_id, filterParams = {}) => {
  const { 
    payment_mode, 
    start_date, 
    end_date,
    collab_payment_status 
  } = filterParams;
  
  // Build query - I am the owner, partner is the receiver
  const query = { 
    owner_id,  // I created these payments
    collab_owner_id: partner_id,  // Sent TO this specific partner
    payment_type: 'to_collab_owner',
    isActive: true
  };
  
  if (payment_mode) query.payment_mode = payment_mode;
  if (collab_payment_status) query.collab_payment_status = collab_payment_status;
  
  // Date range filter
  if (start_date || end_date) {
    query.payment_date = {};
    if (start_date) query.payment_date.$gte = new Date(start_date);
    if (end_date) query.payment_date.$lte = new Date(end_date);
  }

  const payments = await Payment.find(query)
    .populate('owner_id', 'name email phone company_name')
    .populate('collab_owner_id', 'name email phone company_name')
    .sort({ payment_date: -1, createdAt: -1 });

  return {
    count: payments.length,
    payments
  };
};

// NEW: Bulk soft delete payments
const bulkSoftDeletePayments = async (paymentIds, owner_id) => {
  try {
    // Validate input
    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      throw new Error('paymentIds must be a non-empty array');
    }

    // Update active payments owned by user
    const result = await Payment.updateMany(
      {
        _id: { $in: paymentIds },
        owner_id,
        isActive: true
      },
      { $set: { isActive: false } }
    );

    return {
      success: true,
      message: `Soft deleted ${result.modifiedCount} payment(s)`,
      modifiedCount: result.modifiedCount
    };

  } catch (error) {
    console.error('Error in bulk soft delete payments:', error);
    throw error;
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updateCollabPaymentStatus,
  deletePayment,
  bulkSoftDeletePayments, // New function
  
  getCollabPaymentsForOwner,
  getMyPaymentsToPartner, 
  getPaymentStats,
  getPaymentsByCrusher,
  getPaymentsByCustomer,
  getPaymentsAsReceiver,
  getPaymentsByBunk // New function
};