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
    total_to_pay: 0,
    total_to_receive: 0,
    pending_payments: 0,
    pending_receivables: 0,
    total_paid: 0,
    total_received: 0
  };

  transactions.forEach(transaction => {
    const isFromMe = transaction.from_owner_id._id.toString() === owner_id;
    const isToMe = transaction.to_owner_id._id.toString() === owner_id;

    if (isFromMe && transaction.type === 'need_payment') {
      // I need to pay partner
      summary.total_to_pay += transaction.amount;
      if (transaction.status === 'approved') summary.pending_payments += transaction.amount;
      if (transaction.status === 'paid') summary.total_paid += transaction.amount;
    } else if (isFromMe && transaction.type === 'give_payment') {
      // Partner needs to pay me
      summary.total_to_receive += transaction.amount;
      if (transaction.status === 'approved') summary.pending_receivables += transaction.amount;
      if (transaction.status === 'paid') summary.total_received += transaction.amount;
    } else if (isToMe && transaction.type === 'need_payment') {
      // Partner needs to pay me
      summary.total_to_receive += transaction.amount;
      if (transaction.status === 'approved') summary.pending_receivables += transaction.amount;
      if (transaction.status === 'paid') summary.total_received += transaction.amount;
    } else if (isToMe && transaction.type === 'give_payment') {
      // I need to pay partner
      summary.total_to_pay += transaction.amount;
      if (transaction.status === 'approved') summary.pending_payments += transaction.amount;
      if (transaction.status === 'paid') summary.total_paid += transaction.amount;
    }
  });

  // Calculate net balance
  summary.net_balance = (summary.total_received + summary.pending_receivables) - 
                       (summary.total_paid + summary.pending_payments);

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