import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Receipt,
  X,
  Loader2,
  TrendingUp,
  Fuel,
  Wrench,
  Hammer,
  MapPin,
  AlertTriangle,
  FileText,
  CreditCard,
  Smartphone,
  Wallet
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

const LorryExpenses = () => {
  const { lorryId } = useParams<{ lorryId: string }>();
  const navigate = useNavigate();
  
  const [lorry, setLorry] = useState<Lorry | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
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
    const filterParams: any = {};
    if (dateRange.start) filterParams.start_date = dateRange.start;
    if (dateRange.end) filterParams.end_date = dateRange.end;
    if (filterCategory !== 'all') filterParams.category = filterCategory;
    if (filterPaymentMode !== 'all') filterParams.payment_mode = filterPaymentMode;

    console.log('Fetching expenses for lorry:', lorryId, 'with params:', filterParams);

    // ✅ Use the dedicated lorry endpoint
    const res = await api.get(`/expenses/lorry/${lorryId}`, { params: filterParams });
    
    // The response structure might be different, so adjust accordingly
    const expensesData = res.data.data?.expenses || [];
    setExpenses(expensesData);
    
    console.log('Received expenses:', expensesData.length);
  } catch (error: any) {
    toast.error(error.response?.data?.error || "Failed to fetch expenses");
  } finally {
    setExpensesLoading(false);
  }
};

  useEffect(() => {
    if (lorryId) {
      fetchLorry();
      fetchExpenses();
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
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete expense");
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.amount.toString().includes(searchText);
    
    return matchesSearch;
  });

  const getCategoryConfig = (category: string) => {
    const config = {
      fuel: { 
        color: "bg-orange-50 text-orange-700 border-orange-200", 
        icon: Fuel, 
        label: "Fuel" 
      },
      maintenance: { 
        color: "bg-blue-50 text-blue-700 border-blue-200", 
        icon: Wrench, 
        label: "Maintenance" 
      },
      repair: { 
        color: "bg-red-50 text-red-700 border-red-200", 
        icon: Hammer, 
        label: "Repair" 
      },
      toll: { 
        color: "bg-purple-50 text-purple-700 border-purple-200", 
        icon: MapPin, 
        label: "Toll" 
      },
      fine: { 
        color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
        icon: AlertTriangle, 
        label: "Fine" 
      },
      other: { 
        color: "bg-gray-50 text-gray-700 border-gray-200", 
        icon: FileText, 
        label: "Other" 
      }
    };
    return config[category as keyof typeof config] || config.other;
  };

  const getPaymentModeConfig = (mode: string) => {
    const config = {
      cash: { 
        color: "bg-green-50 text-green-700 border-green-200", 
        icon: Wallet, 
        label: "Cash" 
      },
      bank: { 
        color: "bg-blue-50 text-blue-700 border-blue-200", 
        icon: CreditCard, 
        label: "Bank" 
      },
      upi: { 
        color: "bg-purple-50 text-purple-700 border-purple-200", 
        icon: Smartphone, 
        label: "UPI" 
      }
    };
    return config[mode as keyof typeof config] || config.cash;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (!lorry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorry not found</h3>
          <button
            onClick={() => navigate("/lorries")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lorries
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    fuel: expenses.filter(e => e.category === 'fuel').length,
    fuelAmount: expenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + e.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header - Sticky */}
      <div className="bg-white border-b z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <button
              onClick={() => navigate(`/lorries/${lorryId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {lorry.registration_number}
                </h1>
                {lorry.nick_name && (
                  <p className="text-sm text-gray-600 truncate">({lorry.nick_name})</p>
                )}
              </div>
            </div>

            <Link
              to={`/expenses/create?lorry=${lorryId}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats - Horizontal Scroll on Mobile */}
      <div className="px-4 py-4 sm:px-6 bg-white border-b">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide sm:grid sm:grid-cols-4 sm:gap-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 min-w-[130px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-gray-600" />
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 min-w-[140px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <p className="text-xs text-gray-600">Total Amount</p>
            </div>
            <p className="text-sm sm:text-base font-bold text-red-600">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 min-w-[130px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Fuel className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-gray-600">Fuel Expenses</p>
            </div>
            <p className="text-xl font-bold text-orange-600">{stats.fuel}</p>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 min-w-[130px] sm:min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600">Fuel Cost</p>
            </div>
            <p className="text-sm sm:text-base font-bold text-purple-600">
              {formatCurrency(stats.fuelAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 sm:px-6 bg-white border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {(searchText || filterCategory !== "all" || filterPaymentMode !== "all" || dateRange.start || dateRange.end) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 space-y-3">
            {/* Category Filters */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Category</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['all', 'fuel', 'maintenance', 'repair', 'toll', 'fine', 'other'].map((category) => {
                  const config = category === 'all' ? null : getCategoryConfig(category);
                  const IconComponent = config?.icon;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        filterCategory === category
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      {category === 'all' ? 'All' : config?.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Mode Filters */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Payment Mode</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['all', 'cash', 'bank', 'upi'].map((mode) => {
                  const config = mode === 'all' ? null : getPaymentModeConfig(mode);
                  const IconComponent = config?.icon;
                  
                  return (
                    <button
                      key={mode}
                      onClick={() => setFilterPaymentMode(mode)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        filterPaymentMode === mode
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      {mode === 'all' ? 'All' : config?.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Start Date</p>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">End Date</p>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="p-4 sm:p-6">
        {expensesLoading ? (
          <div className="flex justify-center items-center min-h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const categoryConfig = getCategoryConfig(expense.category);
              const paymentConfig = getPaymentModeConfig(expense.payment_mode);
              const CategoryIcon = categoryConfig.icon;
              const PaymentIcon = paymentConfig.icon;

              return (
                <motion.div
                  key={expense._id}
                  layout
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                            <CategoryIcon className="h-3 w-3" />
                            {categoryConfig.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${paymentConfig.color}`}>
                            <PaymentIcon className="h-3 w-3" />
                            {paymentConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(expense.date)}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {expense.description || "No description provided"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added {formatDate(expense.createdAt)}
                        </p>
                      </div>

                      {/* Action Menu */}
                      <div className="relative flex-shrink-0">
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
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-10 z-30 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => navigate(`/expenses/edit/${expense._id}`)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Expense
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDeleteExpense(expense._id, expense.description || 'Expense')}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
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
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <Receipt className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
            <p className="text-sm text-gray-600 mb-6">
              {searchText || filterCategory !== "all" || filterPaymentMode !== "all" || dateRange.start || dateRange.end
                ? "Try adjusting your search or filters"
                : "Get started by adding the first expense for this lorry"
              }
            </p>
            <Link
              to={`/expenses/create?lorry=${lorryId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add First Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LorryExpenses;