const Expense = require('../models/expense.model');
const {
  createPayment,
} = require('./payment.controller');

const createExpense = async (expenseData) => {
  const {
    owner_id,
    lorry_id,
    bunk_id,
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

  // Validate bunk_id for fuel expenses
  if (category === 'fuel' && !bunk_id) {
    const err = new Error('Bunk ID is required for fuel expenses');
    err.status = 400;
    throw err;
  }

  // Clear bunk_id if category is not fuel
  const finalBunkId = category === 'fuel' ? bunk_id : null;

  const newExpense = new Expense({
    owner_id,
    lorry_id,
    bunk_id: finalBunkId,
    date: date || new Date(),
    category,
    amount,
    description,
    payment_mode
  });

  await newExpense.save();

  // If it's a fuel expense with non-credit payment, create a payment
  if (category === 'fuel' && payment_mode !== 'credit' && finalBunkId) {
    try {
      const paymentData = {
        owner_id,
        payment_type: 'to_bunk', // Bunk payment type
        bunk_id: finalBunkId,
        amount,
        payment_date: date || new Date(),
        payment_mode,
        notes: description,
        // Note: No customer_id, crusher_id, or collab_owner_id for bunk payments
      };

      // Create payment for bunk
      await createPayment(paymentData);
      console.log(`Payment created for fuel expense ${newExpense._id}`);
    } catch (paymentError) {
      // Log the error but don't fail the expense creation
      console.error('Failed to create payment for fuel expense:', paymentError);
      // Optionally, you could add this to the expense document:
      newExpense.payment_creation_error = paymentError.message;
      await newExpense.save();
    }
  }

  return newExpense;
};

const getAllExpenses = async (owner_id, filterParams = {}) => {
  const { 
    lorry_id, 
    category, 
    payment_mode, 
    start_date, 
    end_date,
    bunk_id,
    include_inactive = false
  } = filterParams;
  
  const query = { 
    owner_id,
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  if (lorry_id) query.lorry_id = lorry_id;
  if (category) query.category = category;
  if (payment_mode) query.payment_mode = payment_mode;
  if (bunk_id) query.bunk_id = bunk_id;
  
  // Date range filter
  if (start_date || end_date) {
    query.date = {};
    if (start_date) query.date.$gte = new Date(start_date);
    if (end_date) query.date.$lte = new Date(end_date);
  }

  const expenses = await Expense.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('bunk_id', 'bunk_name address')
    .sort({ date: -1, createdAt: -1 });

  return {
    count: expenses.length,
    expenses
  };
};

const getExpenseById = async (id, owner_id, include_inactive = false) => {
  const query = { 
    _id: id, 
    owner_id 
  };
  
  if (!include_inactive) {
    query.isActive = true;
  }
  
  const expense = await Expense.findOne(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('bunk_id', 'bunk_name address');

  if (!expense) {
    const err = new Error('Expense not found');
    err.status = 404;
    throw err;
  }
  return expense;
};

const updateExpense = async (id, owner_id, updateData) => {
  const { category, bunk_id } = updateData;
  
  // Validate bunk_id if category is being changed to fuel
  if (category === 'fuel' && !bunk_id) {
    const err = new Error('Bunk ID is required for fuel expenses');
    err.status = 400;
    throw err;
  }
  
  // Clear bunk_id if category is not fuel
  const processedData = { ...updateData };
  if (category && category !== 'fuel') {
    processedData.bunk_id = null;
  }

  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: id, owner_id, isActive: true },
    processedData,
    { new: true, runValidators: true }
  )
  .populate('lorry_id', 'registration_number nick_name')
  .populate('bunk_id', 'bunk_name address');

  if (!updatedExpense) {
    const err = new Error('Expense not found or update failed');
    err.status = 404;
    throw err;
  }
  return updatedExpense;
};

const deleteExpense = async (id, owner_id) => {
  // Soft delete - set isActive to false
  const deletedExpense = await Expense.findOneAndUpdate(
    { _id: id, owner_id, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!deletedExpense) {
    const err = new Error('Expense not found or delete failed');
    err.status = 404;
    throw err;
  }
  return { 
    message: 'Expense soft deleted successfully',
    expense_id: id 
  };
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
    isActive: true,
    date: { $gte: startDate }
  })
  .populate('lorry_id', 'registration_number')
  .populate('bunk_id', 'bunk_name');

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

  // Group by bunk for fuel expenses
  const bunkStats = {};
  expenses
    .filter(expense => expense.category === 'fuel' && expense.bunk_id)
    .forEach(expense => {
      const bunkName = expense.bunk_id?.bunk_name || 'Unknown Bunk';
      bunkStats[bunkName] = (bunkStats[bunkName] || 0) + expense.amount;
    });

  return {
    period,
    total_expenses: totalExpenses,
    total_amount: totalAmount,
    average_expense: totalExpenses > 0 ? totalAmount / totalExpenses : 0,
    category_breakdown: categoryStats,
    lorry_breakdown: lorryStats,
    bunk_breakdown: bunkStats // New: bunk breakdown for fuel expenses
  };
};

// Get expenses by lorry
const getExpensesByLorry = async (owner_id, lorry_id, filterParams = {}) => {
  const { category, include_inactive = false } = filterParams;
  
  const query = { 
    owner_id, 
    lorry_id,
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  if (category) query.category = category;

  const expenses = await Expense.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('bunk_id', 'bunk_name address')
    .sort({ date: -1 });

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group by category for this lorry
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  // Get fuel expenses with bunk details
  const fuelExpenses = expenses.filter(expense => expense.category === 'fuel');

  return {
    lorry_id,
    lorry_name: expenses[0]?.lorry_id?.registration_number || 'Lorry',
    total_expenses: expenses.length,
    total_amount: totalAmount,
    category_breakdown: categoryBreakdown,
    fuel_expenses: {
      count: fuelExpenses.length,
      total_amount: fuelExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      bunk_breakdown: fuelExpenses.reduce((acc, expense) => {
        const bunkName = expense.bunk_id?.bunk_name || 'Unknown Bunk';
        acc[bunkName] = (acc[bunkName] || 0) + expense.amount;
        return acc;
      }, {})
    },
    expenses
  };
};

// New: Get expenses by bunk
const getExpensesByBunk = async (owner_id, bunk_id, filterParams = {}) => {
  const { start_date, end_date, include_inactive = false } = filterParams;
  
  const query = { 
    owner_id, 
    bunk_id,
    category: 'fuel', // Only fuel expenses have bunk_id
    isActive: !include_inactive ? true : { $exists: true }
  };
  
  // Date range filter
  if (start_date || end_date) {
    query.date = {};
    if (start_date) query.date.$gte = new Date(start_date);
    if (end_date) query.date.$lte = new Date(end_date);
  }

  const expenses = await Expense.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('bunk_id', 'bunk_name address')
    .sort({ date: -1 });

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group by lorry for this bunk
  const lorryBreakdown = expenses.reduce((acc, expense) => {
    const lorryName = expense.lorry_id?.registration_number || 'Unknown';
    acc[lorryName] = (acc[lorryName] || 0) + expense.amount;
    return acc;
  }, {});

  return {
    bunk_id,
    bunk_name: expenses[0]?.bunk_id?.bunk_name || 'Bunk',
    total_fuel_expenses: expenses.length,
    total_amount: totalAmount,
    average_per_fill: expenses.length > 0 ? totalAmount / expenses.length : 0,
    lorry_breakdown: lorryBreakdown,
    expenses
  };
};

// New: Get fuel expenses summary
const getFuelExpensesSummary = async (owner_id, filterParams = {}) => {
  const { start_date, end_date } = filterParams;
  
  const query = { 
    owner_id, 
    category: 'fuel',
    isActive: true
  };
  
  // Date range filter
  if (start_date || end_date) {
    query.date = {};
    if (start_date) query.date.$gte = new Date(start_date);
    if (end_date) query.date.$lte = new Date(end_date);
  }

  const expenses = await Expense.find(query)
    .populate('lorry_id', 'registration_number nick_name')
    .populate('bunk_id', 'bunk_name address')
    .sort({ date: -1 });

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group by bunk
  const bunkBreakdown = expenses.reduce((acc, expense) => {
    const bunkName = expense.bunk_id?.bunk_name || 'Unknown Bunk';
    if (!acc[bunkName]) {
      acc[bunkName] = {
        total_amount: 0,
        count: 0,
        bunk_id: expense.bunk_id?._id
      };
    }
    acc[bunkName].total_amount += expense.amount;
    acc[bunkName].count += 1;
    return acc;
  }, {});

  // Group by lorry
  const lorryBreakdown = expenses.reduce((acc, expense) => {
    const lorryName = expense.lorry_id?.registration_number || 'Unknown';
    if (!acc[lorryName]) {
      acc[lorryName] = {
        total_amount: 0,
        count: 0,
        lorry_id: expense.lorry_id?._id
      };
    }
    acc[lorryName].total_amount += expense.amount;
    acc[lorryName].count += 1;
    return acc;
  }, {});

  return {
    total_fuel_expenses: expenses.length,
    total_amount: totalAmount,
    average_per_fill: expenses.length > 0 ? totalAmount / expenses.length : 0,
    bunk_breakdown: bunkBreakdown,
    lorry_breakdown: lorryBreakdown,
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
  getExpensesByLorry,
  getExpensesByBunk,
  getFuelExpensesSummary
};