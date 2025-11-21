import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, Outlet } from "react-router-dom";
import api from "../../api/client";
import { Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Truck,
  Package,
  Receipt,
  Calendar,
  Edit,
  MoreVertical,
  ArrowLeft,
  Plus,
  BadgeAlert
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
  status: 'active' | 'maintenance' | 'inactive';
  owner_id: string;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  _id: string;
  trip_number: string;
  status: string;
  trip_date: string;
  profit: number;
}

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
}

const LorryDetails = () => {
  const { lorryId } = useParams<{ lorryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lorry, setLorry] = useState<Lorry | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/expenses')) return 'expenses';
    if (path.includes('/trips')) return 'trips';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const fetchLorry = async () => {
    try {
      const res = await api.get(`/lorries/${lorryId}`);
      setLorry(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch lorry details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/trips`);
      const allTrips = res.data.data?.trips || [];
      const lorryTrips = allTrips.filter((trip: any) => trip.lorry_id?._id === lorryId);
      setTrips(lorryTrips.slice(0, 5));
    } catch (error: any) {
      console.error("Failed to fetch trips:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses`, { params: { lorry_id: lorryId } });
      const expensesData = res.data.data?.expenses || [];
      setExpenses(expensesData.slice(0, 5));
    } catch (error: any) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  useEffect(() => {
    if (lorryId) {
      fetchLorry();
      fetchTrips();
      fetchExpenses();
    }
  }, [lorryId]);

  const handleDeleteLorry = async () => {
    if (!window.confirm(`Are you sure you want to delete ${lorry?.registration_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/lorries/delete/${lorryId}`);
      toast.success("Lorry deleted successfully");
      navigate("/lorries");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete lorry");
    }
  };

  const getStatusConfig = (status: string) => {
    const config = {
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: "✅", label: "Active" },
      maintenance: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🔧", label: "Maintenance" },
      inactive: { color: "bg-red-100 text-red-800 border-red-200", icon: "⏸️", label: "Inactive" }
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getCategoryConfig = (category: string) => {
    const config = {
      fuel: { color: "bg-orange-100 text-orange-800", icon: "⛽" },
      maintenance: { color: "bg-blue-100 text-blue-800", icon: "🔧" },
      repair: { color: "bg-red-100 text-red-800", icon: "🛠️" },
      toll: { color: "bg-purple-100 text-purple-800", icon: "🛣️" },
      fine: { color: "bg-yellow-100 text-yellow-800", icon: "🚨" },
      other: { color: "bg-gray-100 text-gray-800", icon: "📝" }
    };
    return config[category as keyof typeof config] || config.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateStats = () => {
    const totalTrips = trips.length;
    const totalExpenses = expenses.length;
    const totalProfit = trips.reduce((sum, trip) => sum + trip.profit, 0);
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalProfit - totalExpenseAmount;

    return {
      totalTrips,
      totalExpenses,
      totalProfit,
      totalExpenseAmount,
      netProfit
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lorry) {
    return (
      <div className="text-center py-12">
        <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorry not found</h3>
        <button
          onClick={() => navigate("/lorries")}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Lorries
        </button>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/lorries")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="p-3 bg-blue-100 rounded-xl">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {lorry.registration_number}
                </h1>
                {getStatusBadge(lorry.status)}
              </div>
              
              {lorry.nick_name && (
                <p className="text-lg text-gray-600 mb-2">{lorry.nick_name}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(lorry.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <BadgeAlert className="h-4 w-4" />
                  Last updated {formatDate(lorry.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/lorries/edit/${lorryId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Lorry
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>

              <AnimatePresence>
                {showActionMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-12 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                  >
                    <Link
                      to={`/trips/create?lorry=${lorryId}`}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Trip
                    </Link>
                    <Link
                      to={`/expenses/create?lorry=${lorryId}`}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Expense
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleDeleteLorry}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Lorry
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalTrips}</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalProfit)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalExpenseAmount)}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.netProfit)}
            </div>
            <div className="text-sm text-gray-600">Net Profit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalExpenses}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <Link
              to={`/lorries/${lorryId}`}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="h-4 w-4" />
              Overview
            </Link>
            <Link
              to={`/lorries/${lorryId}/trips`}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'trips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4" />
              Trips
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {trips.length}
              </span>
            </Link>
            <Link
              to={`/lorries/${lorryId}/expenses`}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'expenses'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Receipt className="h-4 w-4" />
              Expenses
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {expenses.length}
              </span>
            </Link>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Recent Trips */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Recent Trips
                  </h3>
                  <Link
                    to={`/lorries/${lorryId}/trips`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {trips.length > 0 ? (
                  <div className="space-y-3">
                    {trips.map((trip) => (
                      <div key={trip._id} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{trip.trip_number}</div>
                            <div className="text-sm text-gray-500">{formatDate(trip.trip_date)}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(trip.profit)}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">{trip.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No trips yet</p>
                    <Link
                      to={`/trips/create?lorry=${lorryId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Trip
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Expenses */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    Recent Expenses
                  </h3>
                  <Link
                    to={`/lorries/${lorryId}/expenses`}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense) => {
                      const config = getCategoryConfig(expense.category);
                      return (
                        <div key={expense._id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`p-2 rounded-lg ${config.color}`}>
                                {config.icon}
                              </span>
                              <div>
                                <div className="font-medium text-gray-900 capitalize">
                                  {expense.category}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(expense.date)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600">
                                {formatCurrency(expense.amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No expenses yet</p>
                    <Link
                      to={`/expenses/create?lorry=${lorryId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Expense
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // This will render either LorryTrips or LorryExpenses component
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};


export default LorryDetails;