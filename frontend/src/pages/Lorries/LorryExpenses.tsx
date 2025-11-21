import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import {
  DollarSign,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Plus,
  ArrowLeft,
  Truck,
  Receipt
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Expense {
  _id: string;
  owner_id: string;
  lorry_id: { _id: string; registration_number: string; nick_name?: string };
  date: string;
  category: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'fine' | 'other';
  amount: number;
  description?: string;
  payment_mode: 'cash' | 'bank' | 'upi';
  createdAt: string;
  updatedAt: string;
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
  status: string;
}

interface ExpenseStats {
  period: string;
  total_expenses: number;
  total_amount: number;
  average_expense: number;
  category_breakdown: Record<string, number>;
  lorry_breakdown: Record<string, number>;
}

const LorryExpenses = () => {
  const { lorryId } = useParams<{ lorryId: string }>();
  
  const [lorry, setLorry] = useState<Lorry | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("all");
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

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

  const fetchExpenses = async () => {
    try {
      const filterParams: any = { lorry_id: lorryId };
      if (dateRange.start) filterParams.start_date = dateRange.start;
      if (dateRange.end) filterParams.end_date = dateRange.end;
      if (filterCategory !== 'all') filterParams.category = filterCategory;
      if (filterPaymentMode !== 'all') filterParams.payment_mode = filterPaymentMode;

      const res = await api.get(`/expenses`, { params: filterParams });
      setExpenses(res.data.data?.expenses || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch expenses");
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(`/expenses/stats/month`);
      setStats(res.data.data);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (lorryId) {
      fetchLorry();
      fetchExpenses();
      fetchStats();
    }
  }, [lorryId]);

  useEffect(() => {
    if (lorryId) {
      fetchExpenses();
    }
  }, [dateRange, filterCategory, filterPaymentMode]);

  const handleDeleteExpense = async (expenseId: string, description: string) => {
    if (!window.confirm(`Are you sure you want to delete ${description || 'this expense'}?`)) {
      return;
    }

    try {
      await api.delete(`/expenses/delete/${expenseId}`);
      toast.success("Expense deleted successfully");
      setShowActionMenu(null);
      fetchExpenses();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete expense");
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.amount.toString().includes(searchText);
    
    return matchesSearch;
  });

  const getCategoryConfig = (category: string) => {
    const config = {
      fuel: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: "⛽", label: "Fuel" },
      maintenance: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔧", label: "Maintenance" },
      repair: { color: "bg-red-100 text-red-800 border-red-200", icon: "🛠️", label: "Repair" },
      toll: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: "🛣️", label: "Toll" },
      fine: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🚨", label: "Fine" },
      other: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "📝", label: "Other" }
    };
    return config[category as keyof typeof config] || config.other;
  };

  const getPaymentModeConfig = (mode: string) => {
    const config = {
      cash: { color: "bg-green-100 text-green-800 border-green-200", icon: "💵", label: "Cash" },
      bank: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🏦", label: "Bank" },
      upi: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: "📱", label: "UPI" }
    };
    return config[mode as keyof typeof config] || config.cash;
  };

  const getCategoryBadge = (category: string) => {
    const config = getCategoryConfig(category);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getPaymentModeBadge = (mode: string) => {
    const config = getPaymentModeConfig(mode);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
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

  const clearFilters = () => {
    setSearchText("");
    setFilterCategory("all");
    setFilterPaymentMode("all");
    setDateRange({ start: "", end: "" });
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
        <Link to="/lorries" className="text-blue-600 hover:text-blue-700">
          Back to Lorries
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/lorries/${lorryId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="p-2 bg-green-100 rounded-lg">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lorry.registration_number}
                {lorry.nick_name && (
                  <span className="text-gray-600 text-lg ml-2">({lorry.nick_name})</span>
                )}
              </h1>
              <p className="text-gray-600">Expense Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/expenses/create?lorry=${lorryId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.average_expense || 0)}
            </div>
            <div className="text-sm text-gray-600">Average Expense</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {expenses.filter(e => e.category === 'fuel').length}
            </div>
            <div className="text-sm text-gray-600">Fuel Expenses</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search expenses by description, category..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input input-bordered pl-9 w-full"
            />
          </div>

          <select
            className="input input-bordered w-full md:w-40"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="fuel">Fuel</option>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="toll">Toll</option>
            <option value="fine">Fine</option>
            <option value="other">Other</option>
          </select>

          <select
            className="input input-bordered w-full md:w-32"
            value={filterPaymentMode}
            onChange={(e) => setFilterPaymentMode(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="upi">UPI</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input input-bordered w-32"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input input-bordered w-32"
              placeholder="End Date"
            />
          </div>

          <button
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm flex items-center gap-2"
            onClick={clearFilters}
          >
            <Filter className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {expensesLoading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Expense Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(expense.date)}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2">
                      {getCategoryBadge(expense.category)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getPaymentModeBadge(expense.payment_mode)}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="text-sm text-gray-900 font-medium mb-1">
                      {expense.description || "No description"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {formatDate(expense.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(showActionMenu === expense._id ? null : expense._id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {showActionMenu === expense._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                        >
                          <Link
                            to={`/expenses/edit/${expense._id}`}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Expense
                          </Link>
                          
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => handleDeleteExpense(expense._id, expense.description || 'Expense')}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Expense
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
          <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 mb-6">
            {searchText || filterCategory !== "all" || filterPaymentMode !== "all" || dateRange.start || dateRange.end
              ? "Try adjusting your search or filters"
              : "Get started by adding the first expense for this lorry"
            }
          </p>
          <Link
            to={`/expenses/create?lorry=${lorryId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add First Expense
          </Link>
        </div>
      )}
    </div>
  );
};

export default LorryExpenses;