// const mongoose = require('mongoose'); // Add this import
// const Payment = require('../models/payment.model');
// const Trip = require('../models/trip.model');

// const createPayment = async (paymentData) => {
//   const {
//     owner_id,
//     payment_type,
//     crusher_id,
//     customer_id,
//     amount,
//     payment_date,
//     payment_mode,
//     notes
//   } = paymentData;

//   // Validate required fields
//   if (!owner_id || !payment_type || !amount || !payment_mode) {
//     const err = new Error('Owner ID, payment type, amount, and payment mode are required');
//     err.status = 400;
//     throw err;
//   }

//   // Validate type-specific fields
//   if (payment_type === 'to_crusher' && !crusher_id) {
//     const err = new Error('Crusher ID is required for crusher payments');
//     err.status = 400;
//     throw err;
//   }

//   if (payment_type === 'from_customer' && !customer_id) {
//     const err = new Error('Customer ID is required for customer payments');
//     err.status = 400;
//     throw err;
//   }

//    // Generate payment number (ADD THIS)
//   const now = new Date();
//   const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
//   // Count payments for current month
//   const count = await Payment.countDocuments({
//     isActive: true,
//     createdAt: {
//       $gte: new Date(now.getFullYear(), now.getMonth(), 1),
//       $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
//     }
//   });

//   const payment_number = `PMT${yearMonth}${String(count + 1).padStart(4, '0')}`;

//   const newPayment = new Payment({
//     payment_number,
//     owner_id,
//     payment_type,
//     crusher_id,
//     customer_id,
//     amount,
//     payment_date: payment_date || new Date(),
//     payment_mode,
//     notes
//   });

//   await newPayment.save();
//   return newPayment;
// };

// const getAllPayments = async (owner_id, filterParams = {}) => {
//   const { payment_type, payment_mode, start_date, end_date } = filterParams;
//   const query = { 
//     owner_id,
//     isActive: true // Only active payments
//    };
  
//   if (payment_type) query.payment_type = payment_type;
//   if (payment_mode) query.payment_mode = payment_mode;
  
//   // Date range filter
//   if (start_date || end_date) {
//     query.payment_date = {};
//     if (start_date) query.payment_date.$gte = new Date(start_date);
//     if (end_date) query.payment_date.$lte = new Date(end_date);
//   }

//   const payments = await Payment.find(query)
//     .populate('crusher_id', 'name')
//     .populate('customer_id', 'name')
//     .sort({ payment_date: -1, createdAt: -1 });

//   return {
//     count: payments.length,
//     payments
//   };
// };

// const getPaymentById = async (id, owner_id) => {
//   const payment = await Payment.findOne({ _id: id, owner_id })
//     .populate('crusher_id', 'name')
//     .populate('customer_id', 'name');

//   if (!payment) {
//     const err = new Error('Payment not found');
//     err.status = 404;
//     throw err;
//   }
//   return payment;
// };

// const updatePayment = async (id, owner_id, updateData) => {
//   const updatedPayment = await Payment.findOneAndUpdate(
//     { _id: id, owner_id,       isActive: true },
//     updateData,
//     { new: true, runValidators: true }
//   )
//     .populate('crusher_id', 'name')
//     .populate('customer_id', 'name');

//   if (!updatedPayment) {
//     const err = new Error('Payment not found or update failed');
//     err.status = 404;
//     throw err;
//   }
//   return updatedPayment;
// };

// // ✅ Simple Soft Delete Only
// const deletePayment = async (id, owner_id) => {
//   const deletedPayment = await Payment.findOneAndUpdate(
//     { 
//       _id: id, 
//       owner_id, 
//       isActive: true // Only soft delete active payments
//     },
//     { isActive: false },
//     { new: true }
//   );

//   if (!deletedPayment) {
//     const err = new Error('Payment not found');
//     err.status = 404;
//     throw err;
//   }
//   return { message: 'Payment deleted successfully' };
// };



// // Get payment statistics
// const getPaymentStats = async (owner_id, period = 'month') => {
//   const now = new Date();
//   let startDate;

//   switch (period) {
//     case 'day':
//       startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       break;
//     case 'week':
//       startDate = new Date(now);
//       startDate.setDate(now.getDate() - 7);
//       break;
//     case 'month':
//       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       break;
//     default:
//       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//   }

//   const payments = await Payment.find({
//     owner_id,
//     isActive: true, // Only active payments
//     payment_date: { $gte: startDate }
//   });

//   const totalPayments = payments.length;
//   const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
//   // Separate incoming and outgoing payments
//   const incomingPayments = payments.filter(p => p.payment_type === 'from_customer');
//   const outgoingPayments = payments.filter(p => p.payment_type === 'to_crusher');
  
//   const totalIncoming = incomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const totalOutgoing = outgoingPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const netCashFlow = totalIncoming - totalOutgoing;

//   // Group by payment mode
//   const paymentModeStats = payments.reduce((acc, payment) => {
//     const mode = payment.payment_mode;
//     acc[mode] = (acc[mode] || 0) + payment.amount;
//     return acc;
//   }, {});

//   return {
//     period,
//     total_payments: totalPayments,
//     total_amount: totalAmount,
//     total_incoming: totalIncoming,
//     total_outgoing: totalOutgoing,
//     net_cash_flow: netCashFlow,
//     average_payment: totalPayments > 0 ? totalAmount / totalPayments : 0,
//     payment_mode_breakdown: paymentModeStats,
//     incoming_count: incomingPayments.length,
//     outgoing_count: outgoingPayments.length
//   };
// };

// // Get payments by crusher
// const getPaymentsByCrusher = async (owner_id, crusher_id) => {
//   // Get all payments made to this crusher
//   const payments = await Payment.find({ 
//     owner_id, 
//     crusher_id,
//     payment_type: 'to_crusher',
//     isActive: true // Only active payments
//   })
//     .populate('crusher_id', 'name')
//     .sort({ payment_date: -1 });

//   // Get all trips from this crusher to calculate total owed amount
//   const trips = await Trip.find({ owner_id, crusher_id });
  
//   const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
//   const totalOwed = trips.reduce((sum, trip) => sum + trip.crusher_amount, 0);
//   const balance = totalOwed - totalPaid;

//   return {
//     crusher_id,
//     crusher_name: payments[0]?.crusher_id?.name || 'Crusher',
//     total_trips: trips.length,
//     total_owed: totalOwed,    // From trips (crusher_amount)
//     total_paid: totalPaid,    // From payments (amount)
//     balance: balance,         // Owed - Paid
//     payment_count: payments.length,
//     payments
//   };
// };

// // Get payments by customer
// const getPaymentsByCustomer = async (owner_id, customer_id) => {
//   // Get all payments received from this customer
//   const payments = await Payment.find({ 
//     owner_id, 
//     customer_id,
//     payment_type: 'from_customer',
//         isActive: true // Only active payments
//   })
//     .populate('customer_id', 'name')
//     .sort({ payment_date: -1 });

//   // Get all trips for this customer to calculate total receivable amount
//   const trips = await Trip.find({ owner_id, customer_id });
  
//   const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
//   const totalReceivable = trips.reduce((sum, trip) => sum + trip.customer_amount, 0);
//   const balance = totalReceivable - totalReceived;

//   return {
//     customer_id,
//     customer_name: payments[0]?.customer_id?.name || 'Customer',
//     total_trips: trips.length,
//     total_receivable: totalReceivable,  // From trips (customer_amount)
//     total_received: totalReceived,      // From payments (amount)
//     balance: balance,                   // Receivable - Received
//     payment_count: payments.length,
//     payments
//   };
// };

// module.exports = {
//   createPayment,
//   getAllPayments,
//   getPaymentById,
//   updatePayment,
//   deletePayment,

//   getPaymentStats,
//   getPaymentsByCrusher,
//   getPaymentsByCustomer
// };


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
    .populate('collab_owner_id', 'name email phone');

  return populatedPayment;
};

const getAllPayments = async (owner_id, filterParams = {}) => {
  const { 
    payment_type, 
    payment_mode, 
    start_date, 
    end_date,
    collab_owner_id,
    collab_payment_status 
  } = filterParams;
  
  const query = { 
    owner_id,
    isActive: true
  };
  
  if (payment_type) query.payment_type = payment_type;
  if (payment_mode) query.payment_mode = payment_mode;
  if (collab_owner_id) query.collab_owner_id = collab_owner_id;
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
    .sort({ payment_date: -1, createdAt: -1 });

  return {
    count: payments.length,
    payments
  };
};

const getPaymentById = async (id, owner_id) => {
  const payment = await Payment.findOne({ _id: id, owner_id })
    .populate('crusher_id', 'name')
    .populate('customer_id', 'name')
    .populate('collab_owner_id', 'name email phone');

  if (!payment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }
  return payment;
};

const updatePayment = async (id, owner_id, updateData) => {
  // Don't allow changing payment_type or owner_id or collab_owner_id
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
    .populate('collab_owner_id', 'name email phone');

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

// Get payment statistics (updated to include collab payments)
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
  });

  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Separate by payment type
  const incomingPayments = payments.filter(p => p.payment_type === 'from_customer');
  const outgoingCrusherPayments = payments.filter(p => p.payment_type === 'to_crusher');
  const outgoingCollabPayments = payments.filter(p => p.payment_type === 'to_collab_owner');
  
  const totalIncoming = incomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoingCrusher = outgoingCrusherPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoingCollab = outgoingCollabPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoing = totalOutgoingCrusher + totalOutgoingCollab;
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

  return {
    period,
    total_payments: totalPayments,
    total_amount: totalAmount,
    total_incoming: totalIncoming,
    total_outgoing: totalOutgoing,
    total_outgoing_crusher: totalOutgoingCrusher,
    total_outgoing_collab: totalOutgoingCollab,
    net_cash_flow: netCashFlow,
    average_payment: totalPayments > 0 ? totalAmount / totalPayments : 0,
    payment_mode_breakdown: paymentModeStats,
    incoming_count: incomingPayments.length,
    outgoing_crusher_count: outgoingCrusherPayments.length,
    outgoing_collab_count: outgoingCollabPayments.length,
    collab_payment_status: collabPaymentStats
  };
};

// Add this new function to payment.controller.js
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


// Get payments by crusher (unchanged)
const getPaymentsByCrusher = async (owner_id, crusher_id) => {
  const payments = await Payment.find({ 
    owner_id, 
    crusher_id,
    payment_type: 'to_crusher',
    isActive: true
  })
    .populate('crusher_id', 'name')
    .sort({ payment_date: -1 });

const trips = await Trip.find({
  owner_id,
  crusher_id,
  status: "completed"
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
    payments
  };
};

// Get payments by customer (unchanged)
const getPaymentsByCustomer = async (owner_id, customer_id) => {
  const payments = await Payment.find({ 
    owner_id, 
    customer_id,
    payment_type: 'from_customer',
    isActive: true
  })
    .populate('customer_id', 'name')
    .sort({ payment_date: -1 });

  const trips = await Trip.find({ owner_id, customer_id });
  
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
    payments
  };
};

const getMyPaymentsToPartner = async (owner_id, partner_id, filterParams = {}) => {
  console.log('🔍 getMyPaymentsToPartner called');
  console.log('📍 owner_id (me):', owner_id);
  console.log('📍 partner_id:', partner_id);
  
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

  console.log('📍 MongoDB query:', JSON.stringify(query, null, 2));

  const payments = await Payment.find(query)
    .populate('owner_id', 'name email phone company_name')
    .populate('collab_owner_id', 'name email phone company_name')
    .sort({ payment_date: -1, createdAt: -1 });

  console.log('📍 Payments found:', payments.length);

  return {
    count: payments.length,
    payments
  };
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updateCollabPaymentStatus, // New function
  deletePayment,
  
  getCollabPaymentsForOwner, // New function
  getMyPaymentsToPartner, 
  getPaymentStats,
  getPaymentsByCrusher,
  getPaymentsByCustomer,
  getPaymentsAsReceiver    
};