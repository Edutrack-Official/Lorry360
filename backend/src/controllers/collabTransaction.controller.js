const CollabTransaction = require('../models/collabTransaction.model');
const Collaboration = require('../models/collaboration.model');

const createTransaction = async (transactionData) => {
  const {
    collaboration_id,
    from_owner_id,
    to_owner_id,
    date,
    amount,
    type,
    note
  } = transactionData;

  if (!collaboration_id || !from_owner_id || !to_owner_id || !amount || !type) {
    const err = new Error('Collaboration ID, from owner, to owner, amount, and type are required');
    err.status = 400;
    throw err;
  }

  // Verify collaboration exists and is active
  const collaboration = await Collaboration.findById(collaboration_id);
  if (!collaboration || collaboration.status !== 'active') {
    const err = new Error('Collaboration not found or not active');
    err.status = 404;
    throw err;
  }

  console.log('Collaboration found:', collaboration);
  console.log('From Owner ID:', from_owner_id);
    console.log('To Owner ID:', to_owner_id);   

  // Verify owners are part of collaboration
  const isValidOwner = (
    (collaboration.from_owner_id.toString() === from_owner_id && collaboration.to_owner_id.toString() === to_owner_id) ||
    (collaboration.from_owner_id.toString() === to_owner_id && collaboration.to_owner_id.toString() === from_owner_id)
  );

  if (!isValidOwner) {
    const err = new Error('Invalid owners for this collaboration');
    err.status = 400;
    throw err;
  }

  const newTransaction = new CollabTransaction({
    collaboration_id,
    from_owner_id,
    to_owner_id,
    date: date || new Date(),
    amount,
    type,
    note,
    status: 'pending'
  });

  await newTransaction.save();
  return newTransaction;
};

const getTransactionsByCollaboration = async (collaboration_id, owner_id) => {
  const transactions = await CollabTransaction.find({ collaboration_id })
    .populate('from_owner_id', 'name company_name')
    .populate('to_owner_id', 'name company_name')
    .populate('approved_by', 'name')
    .sort({ date: -1, createdAt: -1 });

  return {
    count: transactions.length,
    transactions
  };
};

const getTransactionById = async (id, owner_id) => {
  const transaction = await CollabTransaction.findById(id)
    .populate('from_owner_id', 'name company_name')
    .populate('to_owner_id', 'name company_name')
    .populate('approved_by', 'name');

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  // Verify owner has access to this transaction
  const hasAccess = (
    transaction.from_owner_id._id.toString() === owner_id ||
    transaction.to_owner_id._id.toString() === owner_id
  );

  if (!hasAccess) {
    const err = new Error('Access denied to this transaction');
    err.status = 403;
    throw err;
  }

  return transaction;
};

const approveTransaction = async (id, owner_id) => {
  const transaction = await CollabTransaction.findById(id);
  
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  // Only the "to_owner" can approve transactions
  if (transaction.to_owner_id.toString() !== owner_id) {
    const err = new Error('Only the receiving owner can approve this transaction');
    err.status = 403;
    throw err;
  }

  if (transaction.status !== 'pending') {
    const err = new Error('Transaction is not pending approval');
    err.status = 400;
    throw err;
  }

  transaction.status = 'approved';
  transaction.approved_by = owner_id;
  transaction.approved_at = new Date();

  await transaction.save();
  return transaction;
};

const rejectTransaction = async (id, owner_id, reason) => {
  const transaction = await CollabTransaction.findById(id);
  
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  // Only the "to_owner" can reject transactions
  if (transaction.to_owner_id.toString() !== owner_id) {
    const err = new Error('Only the receiving owner can reject this transaction');
    err.status = 403;
    throw err;
  }

  if (transaction.status !== 'pending') {
    const err = new Error('Transaction is not pending approval');
    err.status = 400;
    throw err;
  }

  // For rejection, we delete the transaction
  await CollabTransaction.findByIdAndDelete(id);
  
  return { 
    message: 'Transaction rejected and deleted', 
    rejected_reason: reason 
  };
};

const markAsPaid = async (id, owner_id) => {
  const transaction = await CollabTransaction.findById(id);
  
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  // Only the "from_owner" can mark as paid
  if (transaction.from_owner_id.toString() !== owner_id) {
    const err = new Error('Only the paying owner can mark this as paid');
    err.status = 403;
    throw err;
  }

  if (transaction.status !== 'approved') {
    const err = new Error('Transaction must be approved before marking as paid');
    err.status = 400;
    throw err;
  }

  transaction.status = 'paid';
  await transaction.save();
  return transaction;
};

const getCollabSummary = async (collaboration_id, owner_id) => {
  const transactions = await CollabTransaction.find({ collaboration_id })
    .populate('from_owner_id', 'name')
    .populate('to_owner_id', 'name');

  let summary = {
    payment_to_be_paid: 0,      // You need to pay others (approved payments)
    payment_to_be_received: 0,  // Others need to pay you (approved payments)
    net_balance: 0,
    amount_to_be_approved: 0    // Pending approval transactions
  };

  transactions.forEach(transaction => {
    const isFromMe = transaction.from_owner_id._id.toString() === owner_id;
    const isToMe = transaction.to_owner_id._id.toString() === owner_id;

    if (transaction.status === 'pending') {
      // Count pending transactions for approval (only those where I'm the receiver)
      if (isToMe) {
        summary.amount_to_be_approved += transaction.amount;
      }
    }

    if (isFromMe) {
      // Transactions where I requested payment (I'm the from_owner)
      if (transaction.status === 'approved') {
        // Partner approved my request - I should receive this amount
        summary.payment_to_be_received += transaction.amount;
      } else if (transaction.status === 'pending') {
        // My request is pending partner approval - not counted in payment to be received yet
      }
    } else if (isToMe) {
      // Transactions where partner requested payment from me (I'm the to_owner)
      if (transaction.status === 'approved') {
        // I approved partner's request - I should pay this amount
        summary.payment_to_be_paid += transaction.amount;
      } else if (transaction.status === 'pending') {
        // Partner's request is pending my approval - not counted in payment to be paid yet
      }
    }

    // Paid transactions are settled and don't affect the balance
  });

  // Calculate net balance: (To be received) - (To be paid)
  summary.net_balance = summary.payment_to_be_received - summary.payment_to_be_paid;

  return summary;
};

const deleteTransaction = async (id, owner_id) => {
  const transaction = await CollabTransaction.findById(id);
  
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  // Only the creator can delete pending transactions
  if (transaction.from_owner_id.toString() !== owner_id) {
    const err = new Error('Only the transaction creator can delete it');
    err.status = 403;
    throw err;
  }

  if (transaction.status !== 'pending') {
    const err = new Error('Only pending transactions can be deleted');
    err.status = 400;
    throw err;
  }

  await CollabTransaction.findByIdAndDelete(id);
  return { message: 'Transaction deleted successfully' };
};

module.exports = {
  createTransaction,
  getTransactionsByCollaboration,
  getTransactionById,
  approveTransaction,
  rejectTransaction,
  markAsPaid,
  getCollabSummary,
  deleteTransaction
};