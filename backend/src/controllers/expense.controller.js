const Expense = require('../models/expense.model');

const createExpense = async (expenseData) => {
  const {
    owner_id,
    lorry_id,
    date,
    category,
    amount,
    description,
    payment_mode
  } = expenseData;

  // Validate required fields
  if (!owner_id || !lorry_id || !category || !amount || !payment_mode) {
    const err = new Error('Owner ID, lorry ID, category, amount, and payment mode are required');
    err.status = 400;
    throw err;
  }

  const newExpense = new Expense({
    owner_id,
    lorry_id,
    date: date || new Date(),
    category,
    amount,
    description,
    payment_mode
  });

  await newExpense.save();
  return newExpense;
};

const getAllExpenses = async (owner_id, filterParams = {}) => {
  const { lorry_id, category, payment_mode, start_date, end_date } = filterParams;
  const query = { owner_id };
  
  if (lorry_id) query.lorry_id = lorry_id;
  if (category) query.category = category;
  if (payment_mode) query.payment_mode = payment_mode;
  
  // Date range filter
  if (start_date || end_date) {
    query.date = {};
    if (start_date) query.date.$gte = new Date(start_date);
    if (end_date) query.date.$lte = new Date(end_date);
  }

  const expenses = await Expense.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .sort({ date: -1, createdAt: -1 });

  return {
    count: expenses.length,
    expenses
  };
};

const getExpenseById = async (id, owner_id) => {
  const expense = await Expense.findOne({ _id: id, owner_id })
    .populate('lorry_id', 'registration_number nick_name');

  if (!expense) {
    const err = new Error('Expense not found');
    err.status = 404;
    throw err;
  }
  return expense;
};

const updateExpense = async (id, owner_id, updateData) => {
  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: id, owner_id },
    updateData,
    { new: true, runValidators: true }
  ).populate('lorry_id', 'registration_number nick_name');

  if (!updatedExpense) {
    const err = new Error('Expense not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedExpense;
};

const deleteExpense = async (id, owner_id) => {
  const deletedExpense = await Expense.findOneAndDelete({ _id: id, owner_id });

  if (!deletedExpense) {
    const err = new Error('Expense not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { message: 'Expense deleted successfully' };
};

// Get expense statistics
const getExpenseStats = async (owner_id, period = 'month') => {
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

  const expenses = await Expense.find({
    owner_id,
    date: { $gte: startDate }
  }).populate('lorry_id', 'registration_number');

  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group by category
  const categoryStats = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  // Group by lorry
  const lorryStats = expenses.reduce((acc, expense) => {
    const lorryName = expense.lorry_id?.registration_number || 'Unknown';
    acc[lorryName] = (acc[lorryName] || 0) + expense.amount;
    return acc;
  }, {});

  return {
    period,
    total_expenses: totalExpenses,
    total_amount: totalAmount,
    average_expense: totalExpenses > 0 ? totalAmount / totalExpenses : 0,
    category_breakdown: categoryStats,
    lorry_breakdown: lorryStats
  };
};

// Get expenses by lorry
const getExpensesByLorry = async (owner_id, lorry_id) => {
  const expenses = await Expense.find({ 
    owner_id, 
    lorry_id
  })
    .populate('lorry_id', 'registration_number nick_name')
    .sort({ date: -1 });

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group by category for this lorry
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  return {
    lorry_id,
    lorry_name: expenses[0]?.lorry_id?.registration_number || 'Lorry',
    total_expenses: expenses.length,
    total_amount: totalAmount,
    category_breakdown: categoryBreakdown,
    expenses
  };
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpensesByLorry
};