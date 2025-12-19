const Trip = require('../models/trip.model');
const Lorry = require('../models/lorry.model');
const Driver = require('../models/driver.model');
const Customer = require('../models/customer.model');
const Crusher = require('../models/crusher.model');
const Collaboration = require('../models/collaboration.model');
const Payment = require('../models/payment.model');
const Expense = require('../models/expense.model');
const Salary = require('../models/salary.model');

// Helper functions
const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { firstDay, lastDay };
};

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
};

// Format currency for dashboard
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Main dashboard stats endpoint with Salary
const getDashboardStats = async (ownerId) => {
  try {
    // Get date ranges
    const currentMonth = getCurrentMonthRange();
    const today = getTodayRange();
    
    console.log(`Fetching dashboard for owner ${ownerId} - Month: ${currentMonth.firstDay.toISOString()} to ${currentMonth.lastDay.toISOString()}`);

    // Execute all queries in parallel (including salary)
    const [
      lorries,
      drivers,
      crushers,
      customers,
      allTrips,
      currentMonthTrips,
      todayTrips,
      customerPayments,
      pendingCustomerPayments,
      collaborations,
      monthlyExpenses,
      salaries
    ] = await Promise.all([
      // 1. Lorry Stats - Only active
      Lorry.find({ owner_id: ownerId, isActive: true }).select('status').lean(),
      
      // 2. Driver Stats - Only active
      Driver.find({ owner_id: ownerId, isActive: true }).select('status').lean(),
      
      // 3. Crusher Stats - Only active
      Crusher.find({ owner_id: ownerId, isActive: true }).countDocuments(),
      
      // 4. Customer Stats - Only active
      Customer.find({ owner_id: ownerId, isActive: true }).select('isActive').lean(),
      
      // 5. All Trips (basic info only) - Only active
      Trip.find({ owner_id: ownerId, isActive: true })
        .select('trip_date customer_id collab_owner_id status')
        .lean(),
      
      // 6. Current Month Trips (with financials) - Only active
      Trip.find({ 
        owner_id: ownerId,
        isActive: true,
        trip_date: { $gte: currentMonth.firstDay, $lte: currentMonth.lastDay },
        status: { $in: ['completed'] }
      })
      .select('crusher_amount customer_amount profit no_of_unit_crusher no_of_unit_customer')
      .lean(),
      
      // 7. Today's Trips - Only active
      Trip.find({ 
        owner_id: ownerId,
        isActive: true,
        trip_date: { $gte: today.start, $lte: today.end }
      }).countDocuments(),
      
      // 8. Customer Payments (settlements) - Only active
      Payment.find({ 
        owner_id: ownerId,
        isActive: true,
        payment_type: 'from_customer'
      }).select('amount collab_payment_status').lean(),
      
      // 9. Pending Customer Payments - Only active
      Payment.find({ 
        owner_id: ownerId,
        isActive: true,
        payment_type: 'from_customer',
        collab_payment_status: 'pending'
      }).select('amount').lean(),
      
      // 10. Collaboration Stats - Only active
      Collaboration.find({
        isActive: true,
        $or: [
          { from_owner_id: ownerId },
          { to_owner_id: ownerId }
        ]
      }).select('status from_owner_id to_owner_id').lean(),
      
      // 11. Monthly Expenses - Only active
      Expense.find({ 
        owner_id: ownerId,
        isActive: true,
        date: { $gte: currentMonth.firstDay, $lte: currentMonth.lastDay }
      }).select('amount').lean(),
      
      // 12. Salary Data - Only active
      Salary.find({ owner_id: ownerId, isActive: true })
        .select('advance_balance advance_transactions bonus amountpaid')
        .lean()
    ]);

    // Calculate statistics
    
    // Lorries - Now all are active, but check status
    const activeLorries = lorries.filter(l => l.status === 'active').length;
    const inactiveLorries = lorries.filter(l => l.status === 'inactive').length;
    
    // Drivers - Now all are active, but check status
    const activeDrivers = drivers.filter(d => d.status === 'active').length;
    const inactiveDrivers = drivers.filter(d => d.status === 'inactive').length;
    
    // Customers - Now all are active
    const activeCustomers = customers.filter(c => c.isActive).length; // This should equal customers.length
    
    // Trips - Filter by status for active trips
    const completedTrips = allTrips.filter(t => t.status === 'completed').length;
    const customerTrips = allTrips.filter(t => t.customer_id).length;
    const collaborativeTrips = allTrips.filter(t => t.collab_owner_id).length;
    
    // Financials from current month (already filtered by isActive)
    const financialStats = currentMonthTrips.reduce((acc, trip) => ({
      totalRevenue: acc.totalRevenue + (trip.customer_amount || 0),
      totalCost: acc.totalCost + (trip.crusher_amount || 0),
      totalProfit: acc.totalProfit + (trip.profit || 0),
      totalCrusherUnits: acc.totalCrusherUnits + (trip.no_of_unit_crusher || 0),
      totalCustomerUnits: acc.totalCustomerUnits + (trip.no_of_unit_customer || 0)
    }), {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalCrusherUnits: 0,
      totalCustomerUnits: 0
    });
    
    // Settlements (already filtered by isActive)
    const totalSettlementAmount = customerPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingSettlementAmount = pendingCustomerPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedSettlements = customerPayments.filter(p => p.collab_payment_status === 'approved').length;
    
    // Collaborations (already filtered by isActive)
    const activeCollaborations = collaborations.filter(c => c.status === 'active').length;
    const pendingReceived = collaborations.filter(c => 
      c.to_owner_id.toString() === ownerId.toString() && c.status === 'pending'
    ).length;
    const pendingSent = collaborations.filter(c => 
      c.from_owner_id.toString() === ownerId.toString() && c.status === 'pending'
    ).length;
    
    // Expenses (already filtered by isActive)
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Salary Calculations (already filtered by isActive)
    let totalAdvanceGiven = 0;
    let totalAdvanceDeducted = 0;
    let totalBonusPaid = 0;
    let totalSalaryPaid = 0;
    let totalCashPaid = 0;
    let totalAdvanceBalance = 0;
    
    // Calculate salary metrics
    salaries.forEach(salary => {
      // Advance calculations
      if (salary.advance_transactions && salary.advance_transactions.length > 0) {
        salary.advance_transactions.forEach(transaction => {
          if (transaction.type === 'given') {
            totalAdvanceGiven += transaction.amount || 0;
          } else if (transaction.type === 'deducted') {
            totalAdvanceDeducted += transaction.amount || 0;
          }
        });
      }
      
      // Bonus calculations
      if (salary.bonus && salary.bonus.length > 0) {
        totalBonusPaid += salary.bonus.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
      }
      
      // Salary payments calculations
      if (salary.amountpaid && salary.amountpaid.length > 0) {
        salary.amountpaid.forEach(payment => {
          totalSalaryPaid += payment.amount || 0;
          totalCashPaid += payment.cash_paid || 0;
        });
      }
      
      // Current advance balance
      totalAdvanceBalance += salary.advance_balance || 0;
    });
    
    // Calculate averages
    const avgProfitPerTrip = currentMonthTrips.length > 0 
      ? Math.round(financialStats.totalProfit / currentMonthTrips.length)
      : 0;
    
    const profitMargin = financialStats.totalRevenue > 0 
      ? Math.round((financialStats.totalProfit / financialStats.totalRevenue) * 100)
      : 0;
    
    // Total operational cost (crusher cost + expenses + salary)
    const totalOperationalCost = financialStats.totalCost + totalExpenses + totalSalaryPaid;
    
    // Net profit after all expenses
    const netProfitAfterAll = financialStats.totalProfit - totalExpenses - totalSalaryPaid;

    // Construct response with salary data
    const dashboardData = {
      summary: {
        totalTrips: allTrips.length,
        completedTrips,
        activeLorries,
        activeDrivers,
        activeCustomers,
        todayTrips,
        currentMonthTrips: currentMonthTrips.length,
        totalSalaryRecords: salaries.length
      },
      entities: {
        lorries: {
          total: lorries.length,
          active: activeLorries,
          inactive: inactiveLorries,
          note: "All are isActive: true"
        },
        drivers: {
          total: drivers.length,
          active: activeDrivers,
          inactive: inactiveDrivers,
          note: "All are isActive: true"
        },
        crushers: {
          total: crushers,
          note: "All are isActive: true"
        },
        customers: {
          total: customers.length,
          active: activeCustomers,
          note: "All are isActive: true"
        }
      },
      trips: {
        total: allTrips.length,
        today: todayTrips,
        thisMonth: currentMonthTrips.length,
        customer: customerTrips,
        collaborative: collaborativeTrips,
        note: "All are isActive: true"
      },
      settlements: {
        total: customerPayments.length,
        pending: pendingCustomerPayments.length,
        completed: completedSettlements,
        totalAmount: totalSettlementAmount,
        dueAmount: pendingSettlementAmount,
        paidAmount: totalSettlementAmount - pendingSettlementAmount,
        note: "All are isActive: true"
      },
      collaborations: {
        active: activeCollaborations,
        pendingReceived,
        pendingSent,
        note: "All are isActive: true"
      },
      salary: {
        totalRecords: salaries.length,
        totalAdvanceGiven,
        totalAdvanceDeducted,
        totalAdvanceBalance,
        totalBonusPaid,
        totalSalaryPaid,
        totalCashPaid,
        salaryPaidDriversCount: salaries.filter(s => s.amountpaid && s.amountpaid.length > 0).length,
        driversWithAdvance: salaries.filter(s => s.advance_balance > 0).length,
        formatted: {
          totalAdvanceGiven: formatCurrency(totalAdvanceGiven),
          totalAdvanceDeducted: formatCurrency(totalAdvanceDeducted),
          totalAdvanceBalance: formatCurrency(totalAdvanceBalance),
          totalBonusPaid: formatCurrency(totalBonusPaid),
          totalSalaryPaid: formatCurrency(totalSalaryPaid),
          totalCashPaid: formatCurrency(totalCashPaid)
        },
        note: "All are isActive: true"
      },
      financials: {
        totalRevenue: financialStats.totalRevenue,
        totalCost: financialStats.totalCost,
        totalProfit: financialStats.totalProfit,
        avgProfitPerTrip,
        profitMargin: `${profitMargin}%`,
        totalCrusherUnits: financialStats.totalCrusherUnits,
        totalCustomerUnits: financialStats.totalCustomerUnits,
        monthlyExpenses: totalExpenses,
        salaryExpenses: totalSalaryPaid,
        totalOperationalCost,
        netProfit: financialStats.totalProfit - totalExpenses,
        netProfitAfterAllExpenses: netProfitAfterAll,
        formatted: {
          totalRevenue: formatCurrency(financialStats.totalRevenue),
          totalCost: formatCurrency(financialStats.totalCost),
          totalProfit: formatCurrency(financialStats.totalProfit),
          avgProfitPerTrip: formatCurrency(avgProfitPerTrip),
          monthlyExpenses: formatCurrency(totalExpenses),
          salaryExpenses: formatCurrency(totalSalaryPaid),
          totalOperationalCost: formatCurrency(totalOperationalCost),
          netProfit: formatCurrency(financialStats.totalProfit - totalExpenses),
          netProfitAfterAllExpenses: formatCurrency(netProfitAfterAll)
        },
        note: "All based on isActive: true records"
      },
      metrics: {
        tripCompletionRate: allTrips.length > 0 ? Math.round((completedTrips / allTrips.length) * 100) : 0,
        lorryUtilization: lorries.length > 0 ? Math.round((activeLorries / lorries.length) * 100) : 0,
        customerRetention: customers.length > 0 ? Math.round((activeCustomers / customers.length) * 100) : 0,
        advanceUtilization: totalAdvanceGiven > 0 ? Math.round((totalAdvanceDeducted / totalAdvanceGiven) * 100) : 0,
        salaryToRevenueRatio: financialStats.totalRevenue > 0 ? Math.round((totalSalaryPaid / financialStats.totalRevenue) * 100) : 0,
        note: "All based on isActive: true records"
      },
      filtersApplied: {
        isActive: true,
        owner_id: ownerId
      },
      lastUpdated: new Date().toISOString(),
      generatedAt: new Date().toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    };

    console.log(`Dashboard data prepared for owner ${ownerId} (isActive: true):`, {
      trips: dashboardData.trips.total,
      revenue: dashboardData.financials.formatted.totalRevenue,
      profit: dashboardData.financials.formatted.totalProfit,
      salaryPaid: dashboardData.salary.formatted.totalSalaryPaid,
      advanceBalance: dashboardData.salary.formatted.totalAdvanceBalance,
      activeEntities: {
        lorries: dashboardData.entities.lorries.active,
        drivers: dashboardData.entities.drivers.active,
        customers: dashboardData.entities.customers.active
      }
    });
    
    return dashboardData;
    
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
};

// Additional function to get salary-specific dashboard data
const getSalaryDashboard = async (ownerId) => {
  try {
    const salaries = await Salary.find({ owner_id: ownerId })
      .populate('driver_id', 'name phone status')
      .select('driver_id advance_balance advance_transactions bonus amountpaid')
      .lean();
    
    const salarySummary = {
      totalDrivers: salaries.length,
      driversWithAdvance: salaries.filter(s => s.advance_balance > 0).length,
      driversWithSalary: salaries.filter(s => s.amountpaid && s.amountpaid.length > 0).length,
      
      advance: {
        totalGiven: salaries.reduce((sum, s) => {
          if (s.advance_transactions) {
            return sum + s.advance_transactions
              .filter(t => t.type === 'given')
              .reduce((tSum, t) => tSum + (t.amount || 0), 0);
          }
          return sum;
        }, 0),
        totalDeducted: salaries.reduce((sum, s) => {
          if (s.advance_transactions) {
            return sum + s.advance_transactions
              .filter(t => t.type === 'deducted')
              .reduce((tSum, t) => tSum + (t.amount || 0), 0);
          }
          return sum;
        }, 0),
        totalBalance: salaries.reduce((sum, s) => sum + (s.advance_balance || 0), 0)
      },
      
      payments: {
        totalSalary: salaries.reduce((sum, s) => {
          if (s.amountpaid) {
            return sum + s.amountpaid.reduce((pSum, p) => pSum + (p.amount || 0), 0);
          }
          return sum;
        }, 0),
        totalCash: salaries.reduce((sum, s) => {
          if (s.amountpaid) {
            return sum + s.amountpaid.reduce((pSum, p) => pSum + (p.cash_paid || 0), 0);
          }
          return sum;
        }, 0),
        totalBonus: salaries.reduce((sum, s) => {
          if (s.bonus) {
            return sum + s.bonus.reduce((bSum, b) => bSum + (b.amount || 0), 0);
          }
          return sum;
        }, 0)
      },
      
      topDrivers: salaries
        .filter(s => s.driver_id) // Ensure driver exists
        .map(s => ({
          driverId: s.driver_id._id,
          name: s.driver_id.name,
          phone: s.driver_id.phone,
          status: s.driver_id.status,
          advanceBalance: s.advance_balance || 0,
          totalSalaryPaid: s.amountpaid ? 
            s.amountpaid.reduce((sum, p) => sum + (p.amount || 0), 0) : 0,
          totalBonus: s.bonus ? 
            s.bonus.reduce((sum, b) => sum + (b.amount || 0), 0) : 0
        }))
        .sort((a, b) => b.advanceBalance - a.advanceBalance)
        .slice(0, 5)
    };
    
    return salarySummary;
    
  } catch (error) {
    console.error('Error in getSalaryDashboard:', error);
    throw new Error(`Failed to fetch salary dashboard data: ${error.message}`);
  }
};

module.exports = {
  getDashboardStats,
  getSalaryDashboard,
  formatCurrency
};