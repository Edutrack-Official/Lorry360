import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Users,
  TrendingUp,
  Package,
  Building2,
  UserCheck,
  MapPin,
  LayoutDashboard,
  RefreshCw,
  Activity,
  ArrowUp,
  Clock,
  Calendar,
  UserPlus,
  AlertCircle,
  IndianRupee,
  Wallet,
  CreditCard,
  Award,
  BarChart3,
  DollarSign,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalTrips: 0,
      completedTrips: 0,
      activeLorries: 0,
      activeDrivers: 0,
      activeCustomers: 0,
      todayTrips: 0,
      currentMonthTrips: 0,
      totalSalaryRecords: 0,
    },
    entities: {
      lorries: { total: 0, active: 0, inactive: 0 },
      drivers: { total: 0, active: 0, inactive: 0 },
      crushers: { total: 0 },
      customers: { total: 0, active: 0 },
    },
    trips: {
      total: 0,
      today: 0,
      thisMonth: 0,
      customer: 0,
      collaborative: 0,
    },
    settlements: {
      total: 0,
      pending: 0,
      completed: 0,
      totalAmount: 0,
      dueAmount: 0,
      paidAmount: 0,
    },
    collaborations: {
      active: 0,
      pendingReceived: 0,
      pendingSent: 0,
    },
    salary: {
      totalRecords: 0,
      totalAdvanceGiven: 0,
      totalAdvanceDeducted: 0,
      totalAdvanceBalance: 0,
      totalBonusPaid: 0,
      totalSalaryPaid: 0,
      totalCashPaid: 0,
      salaryPaidDriversCount: 0,
      driversWithAdvance: 0,
      formatted: {
        totalAdvanceGiven: "₹0",
        totalAdvanceDeducted: "₹0",
        totalAdvanceBalance: "₹0",
        totalBonusPaid: "₹0",
        totalSalaryPaid: "₹0",
        totalCashPaid: "₹0",
      },
    },
    financials: {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      avgProfitPerTrip: 0,
      profitMargin: "0%",
      totalCrusherUnits: 0,
      totalCustomerUnits: 0,
      monthlyExpenses: 0,
      salaryExpenses: 0,
      totalOperationalCost: 0,
      netProfit: 0,
      netProfitAfterAllExpenses: 0,
      formatted: {
        totalRevenue: "₹0",
        totalCost: "₹0",
        totalProfit: "₹0",
        avgProfitPerTrip: "₹0",
        monthlyExpenses: "₹0",
        salaryExpenses: "₹0",
        totalOperationalCost: "₹0",
        netProfit: "₹0",
        netProfitAfterAllExpenses: "₹0",
      },
    },
    metrics: {
      tripCompletionRate: 0,
      lorryUtilization: 0,
      customerRetention: 0,
      advanceUtilization: 0,
      salaryToRevenueRatio: 0,
    },
    lastUpdated: "",
    generatedAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Accordion state
  const [expandedSections, setExpandedSections] = useState({
    financial: true,
    trips: true,
    collaborations: true,
    salary: true,
    performance: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Simulating data load
    setDashboardData({
      ...dashboardData,
      entities: {
        lorries: { total: 25, active: 20, inactive: 5 },
        drivers: { total: 30, active: 28, inactive: 2 },
        crushers: { total: 8 },
        customers: { total: 45, active: 40 },
      },
      trips: {
        total: 450,
        today: 12,
        thisMonth: 150,
        customer: 300,
        collaborative: 150,
      },
      settlements: {
        total: 200,
        pending: 25,
        completed: 175,
        totalAmount: 5000000,
        dueAmount: 250000,
        paidAmount: 4750000,
      },
      collaborations: {
        active: 15,
        pendingReceived: 5,
        pendingSent: 3,
      },
      salary: {
        totalRecords: 120,
        totalAdvanceGiven: 500000,
        totalAdvanceDeducted: 300000,
        totalAdvanceBalance: 200000,
        totalBonusPaid: 150000,
        totalSalaryPaid: 3500000,
        totalCashPaid: 3650000,
        salaryPaidDriversCount: 28,
        driversWithAdvance: 12,
        formatted: {
          totalAdvanceGiven: "₹5,00,000",
          totalAdvanceDeducted: "₹3,00,000",
          totalAdvanceBalance: "₹2,00,000",
          totalBonusPaid: "₹1,50,000",
          totalSalaryPaid: "₹35,00,000",
          totalCashPaid: "₹36,50,000",
        },
      },
      financials: {
        totalRevenue: 7500000,
        totalCost: 4500000,
        totalProfit: 3000000,
        avgProfitPerTrip: 20000,
        profitMargin: "40%",
        totalCrusherUnits: 1500,
        totalCustomerUnits: 1500,
        monthlyExpenses: 800000,
        salaryExpenses: 3500000,
        totalOperationalCost: 4300000,
        netProfit: 3200000,
        netProfitAfterAllExpenses: 2400000,
        formatted: {
          totalRevenue: "₹75,00,000",
          totalCost: "₹45,00,000",
          totalProfit: "₹30,00,000",
          avgProfitPerTrip: "₹20,000",
          monthlyExpenses: "₹8,00,000",
          salaryExpenses: "₹35,00,000",
          totalOperationalCost: "₹43,00,000",
          netProfit: "₹32,00,000",
          netProfitAfterAllExpenses: "₹24,00,000",
        },
      },
      summary: {
        totalTrips: 450,
        completedTrips: 400,
        activeLorries: 20,
        activeDrivers: 28,
        activeCustomers: 40,
        todayTrips: 12,
        currentMonthTrips: 150,
        totalSalaryRecords: 120,
      },
      metrics: {
        tripCompletionRate: 89,
        lorryUtilization: 80,
        customerRetention: 92,
        advanceUtilization: 60,
        salaryToRevenueRatio: 47,
      },
      generatedAt: new Date().toLocaleString("en-IN"),
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Truck,
      label: "Total Lorries",
      value: dashboardData.entities.lorries.total,
      gradient: "from-blue-500 to-blue-700",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "from-blue-100 to-blue-200",
      change: `${dashboardData.entities.lorries.active} Active`,
      isPositive: true,
    },
    {
      icon: UserCheck,
      label: "Total Drivers",
      value: dashboardData.entities.drivers.total,
      gradient: "from-green-500 to-green-700",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "from-green-100 to-green-200",
      change: `${dashboardData.entities.drivers.active} Active`,
      isPositive: true,
    },
    {
      icon: Building2,
      label: "Crushers",
      value: dashboardData.entities.crushers.total,
      gradient: "from-orange-500 to-orange-700",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "from-orange-100 to-orange-200",
      change: "Material Sources",
      isPositive: true,
    },
    {
      icon: Users,
      label: "Customers",
      value: dashboardData.entities.customers.total,
      gradient: "from-purple-500 to-purple-700",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "from-purple-100 to-purple-200",
      change: `${dashboardData.entities.customers.active} Active`,
      isPositive: true,
    },
    {
      icon: Package,
      label: "Total Trips",
      value: dashboardData.trips.total,
      gradient: "from-indigo-500 to-indigo-700",
      bgGradient: "from-indigo-50 to-indigo-100",
      iconBg: "from-indigo-100 to-indigo-200",
      change: `${dashboardData.trips.thisMonth} This Month`,
      isPositive: true,
    },
    {
      icon: IndianRupee,
      label: "Customer Settlements",
      value: dashboardData.settlements.total,
      gradient: "from-pink-500 to-pink-700",
      bgGradient: "from-pink-50 to-pink-100",
      iconBg: "from-pink-100 to-pink-200",
      change: formatCurrency(dashboardData.settlements.dueAmount),
      isPositive: dashboardData.settlements.dueAmount === 0,
    },
    {
      icon: Wallet,
      label: "Salary Paid",
      value: dashboardData.salary.totalRecords,
      gradient: "from-amber-500 to-amber-700",
      bgGradient: "from-amber-50 to-amber-100",
      iconBg: "from-amber-100 to-amber-200",
      change: dashboardData.salary.formatted.totalSalaryPaid,
      isPositive: true,
    },
    {
      icon: CreditCard,
      label: "Advance Balance",
      value: dashboardData.salary.driversWithAdvance,
      gradient: "from-rose-500 to-rose-700",
      bgGradient: "from-rose-50 to-rose-100",
      iconBg: "from-rose-100 to-rose-200",
      change: dashboardData.salary.formatted.totalAdvanceBalance,
      isPositive: dashboardData.salary.totalAdvanceBalance === 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border-2 border-gray-100"
      >
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex justify-between items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Dashboard
            </h1>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-bold shadow-lg transition-all flex items-center justify-center ${
                refreshing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              }`}
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </motion.button>
          </div>

          <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 flex items-center gap-1.5">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span>
              Last updated: {dashboardData.generatedAt || new Date().toLocaleString("en-IN")}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <AnimatePresence>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative overflow-hidden bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 opacity-5 bg-gradient-to-br ${card.bgGradient}`}
                />

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`absolute top-0 left-0 h-1.5 bg-gradient-to-r ${card.gradient}`}
                />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-br ${card.iconBg} shadow-lg`}
                    >
                      <Icon className="h-8 w-8 text-gray-700" />
                    </div>

                    <div
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                        card.isPositive
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {card.isPositive ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <Activity className="h-3 w-3" />
                      )}
                      <span className="truncate max-w-[120px]">{card.change}</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    {card.label}
                  </p>

                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Financial Summary Section - Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 mb-6 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('financial')}
          className="w-full p-6 sm:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Financial Overview
            </h2>
          </div>
          {expandedSections.financial ? (
            <ChevronUp className="h-6 w-6 text-gray-600" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-600" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.financial && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardData.financials.formatted.totalRevenue}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200">
                    <p className="text-sm font-semibold text-orange-700 mb-2">
                      Total Cost
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {dashboardData.financials.formatted.totalCost}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      Total Profit
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardData.financials.formatted.totalProfit}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Profit Margin: {dashboardData.financials.profitMargin}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
                    <p className="text-sm font-semibold text-purple-700 mb-2">
                      Avg Profit/Trip
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardData.financials.formatted.avgProfitPerTrip}
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      Per trip average
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
                    <p className="text-sm font-semibold text-amber-700 mb-2">
                      Salary Expenses
                    </p>
                    <p className="text-3xl font-bold text-amber-600">
                      {dashboardData.financials.formatted.salaryExpenses}
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      {dashboardData.salary.salaryPaidDriversCount} Drivers Paid
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200">
                    <p className="text-sm font-semibold text-rose-700 mb-2">
                      Monthly Expenses
                    </p>
                    <p className="text-3xl font-bold text-rose-600">
                      {dashboardData.financials.formatted.monthlyExpenses}
                    </p>
                    <p className="text-xs text-rose-600 mt-2">
                      Operational Costs
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-700 mb-2">
                      Net Profit
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {dashboardData.financials.formatted.netProfitAfterAllExpenses}
                    </p>
                    <p className="text-xs text-emerald-600 mt-2">
                      After all expenses
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Three Column Layout: Trips, Collaborations & Salary - All Accordions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Trip Breakdown - Accordion */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('trips')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Trip Distribution
              </h2>
            </div>
            {expandedSections.trips ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.trips && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <MapPin className="h-5 w-5 text-blue-600 mb-2" />
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Customer Trips
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dashboardData.trips.customer}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-600">
                            {dashboardData.trips.total > 0
                              ? ((dashboardData.trips.customer / dashboardData.trips.total) * 100).toFixed(0)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Users className="h-5 w-5 text-purple-600 mb-2" />
                          <p className="text-sm font-semibold text-purple-700 mb-1">
                            Collaborative Trips
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {dashboardData.trips.collaborative}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-purple-600">
                            {dashboardData.trips.total > 0
                              ? ((dashboardData.trips.collaborative / dashboardData.trips.total) * 100).toFixed(0)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Calendar className="h-5 w-5 text-green-600 mb-2" />
                          <p className="text-sm font-semibold text-green-700 mb-1">
                            Today's Trips
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {dashboardData.trips.today}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600">
                            Active today
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <BarChart3 className="h-5 w-5 text-amber-600 mb-2" />
                          <p className="text-sm font-semibold text-amber-700 mb-1">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-bold text-amber-600">
                            {dashboardData.metrics.tripCompletionRate}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-amber-600">
                            {dashboardData.summary.completedTrips} of {dashboardData.summary.totalTrips}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collaborations Status - Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('collaborations')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Collaborations
              </h2>
            </div>
            {expandedSections.collaborations ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.collaborations && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <UserPlus className="h-5 w-5 text-green-600 mb-2" />
                          <p className="text-sm font-semibold text-green-700 mb-1">
                            Active Collaborations
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {dashboardData.collaborations.active}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <AlertCircle className="h-5 w-5 text-orange-600 mb-2" />
                          <p className="text-sm font-semibold text-orange-700 mb-1">
                            Requests Received
                          </p>
                          <p className="text-2xl font-bold text-orange-600">
                            {dashboardData.collaborations.pendingReceived}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-orange-600">
                            Awaiting action
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Activity className="h-5 w-5 text-blue-600 mb-2" />
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Requests Sent
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dashboardData.collaborations.pendingSent}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-600">
                            Pending approval
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Award className="h-5 w-5 text-indigo-600 mb-2" />
                          <p className="text-sm font-semibold text-indigo-700 mb-1">
                            Collaboration Rate
                          </p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {dashboardData.trips.total > 0
                              ? ((dashboardData.trips.collaborative / dashboardData.trips.total) * 100).toFixed(0)
                              : 0}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-indigo-600">
                            of total trips
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Salary Overview - Accordion */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('salary')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl">
                <Wallet className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Salary Overview
              </h2>
            </div>
            {expandedSections.salary ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.salary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Wallet className="h-5 w-5 text-amber-600 mb-2" />
                          <p className="text-sm font-semibold text-amber-700 mb-1">
                            Total Salary Paid
                          </p>
                          <p className="text-2xl font-bold text-amber-600">
                            {dashboardData.salary.formatted.totalSalaryPaid}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-amber-600">
                            {dashboardData.salary.salaryPaidDriversCount} Drivers
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <CreditCard className="h-5 w-5 text-rose-600 mb-2" />
                          <p className="text-sm font-semibold text-rose-700 mb-1">
                            Advance Balance
                          </p>
                          <p className="text-2xl font-bold text-rose-600">
                            {dashboardData.salary.formatted.totalAdvanceBalance}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-rose-600">
                            {dashboardData.salary.driversWithAdvance} Drivers
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Award className="h-5 w-5 text-emerald-600 mb-2" />
                          <p className="text-sm font-semibold text-emerald-700 mb-1">
                            Bonus Paid
                          </p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {dashboardData.salary.formatted.totalBonusPaid}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-emerald-600">
                            Extra payments
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <BarChart3 className="h-5 w-5 text-blue-600 mb-2" />
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Salary to Revenue
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {dashboardData.metrics.salaryToRevenueRatio}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-600">
                            of total revenue
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Performance Metrics - Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('performance')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Performance Metrics
            </h2>
          </div>
          {expandedSections.performance ? (
            <ChevronUp className="h-6 w-6 text-gray-600" />
          ) : (
            <ChevronDown className="h-6 w-6 text-gray-600" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.performance && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 text-center">
                    <p className="text-sm font-semibold text-blue-700 mb-1">
                      Lorry Utilization
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData.metrics.lorryUtilization}%
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 text-center">
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      Customer Retention
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData.metrics.customerRetention}%
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 text-center">
                    <p className="text-sm font-semibold text-amber-700 mb-1">
                      Advance Utilization
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {dashboardData.metrics.advanceUtilization}%
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 text-center">
                    <p className="text-sm font-semibold text-purple-700 mb-1">
                      Trip Completion
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData.metrics.tripCompletionRate}%
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 text-center">
                    <p className="text-sm font-semibold text-rose-700 mb-1">
                      Salary Ratio
                    </p>
                    <p className="text-2xl font-bold text-rose-600">
                      {dashboardData.metrics.salaryToRevenueRatio}%
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dashboard;