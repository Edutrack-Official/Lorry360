import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Plus,
  ArrowLeft,
  Truck,
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
  Wallet,
  IndianRupee
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

interface Expense {
  _id: string;
  owner_id: string;
  lorry_id: { _id: string; registration_number: string; nick_name?: string };
  date: string; // This is the expense date field
  category: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'fine' | 'other';
  amount: number;
  description?: string;
  payment_mode: 'cash' | 'bank' | 'upi' | 'credit';
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
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]); // Store all expenses for client-side filtering
  const [loading, setLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{
    id: string;
    description: string;
    amount: number;
    category: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
    setExpensesLoading(true);
    try {
      // Only fetch ALL expenses initially
      console.log('Fetching all expenses for lorry:', lorryId);
      
      const res = await api.get(`/expenses/lorry/${lorryId}`);
      const expensesData = res.data.data?.expenses || [];
      setAllExpenses(expensesData); // Store all expenses
      setExpenses(expensesData); // Set initial expenses
      
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

  // Apply filters client-side when filter values change
  useEffect(() => {
    if (allExpenses.length === 0) return;
    
    let filtered = [...allExpenses];
    
    // Apply date filter FIRST
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0); // Normalize time to midnight
        
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (expenseDate < startDate) return false;
        }
        
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (expenseDate > endDate) return false;
        }
        
        return true;
      });
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }
    
    // Apply payment mode filter
    if (filterPaymentMode !== 'all') {
      filtered = filtered.filter(expense => expense.payment_mode === filterPaymentMode);
    }
    
    // Apply search text filter
    if (searchText) {
      filtered = filtered.filter((expense) => {
        return (
          expense.description?.toLowerCase().includes(searchText.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchText.toLowerCase()) ||
          expense.amount.toString().includes(searchText)
        );
      });
    }
    
    setExpenses(filtered);
    
    console.log('Filtered expenses:', filtered.length, 'from', allExpenses.length);
    console.log('Date range:', dateRange);
    console.log('Filtered expense dates:', filtered.map(e => e.date));
  }, [dateRange, filterCategory, filterPaymentMode, searchText, allExpenses]);

  const handleDeleteClick = (expenseId: string, description: string, amount: number, category: string) => {
    setSelectedExpense({ id: expenseId, description, amount, category });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpense) return;

    setIsDeleting(true);
    try {
      await api.delete(`/expenses/delete/${selectedExpense.id}`);
      toast.success("Expense deleted successfully");
      setDeleteModalOpen(false);
      setSelectedExpense(null);
      fetchExpenses(); // Refetch all expenses
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

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
      },
      credit: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: CreditCard, 
      label: "Credit"
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
    // Expenses will be automatically filtered in the useEffect
  };

  const handleActionMenuToggle = (expenseId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (showActionMenu === expenseId) {
      setShowActionMenu(null);
      return;
    }

    const button = buttonRefs.current[expenseId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }

    setShowActionMenu(expenseId);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  // Show current filter status in UI
  const hasActiveFilters = searchText || filterCategory !== "all" || filterPaymentMode !== "all" || dateRange.start || dateRange.end;

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
    total: allExpenses.length,
    totalAmount: allExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    fuel: allExpenses.filter(e => e.category === 'fuel').length,
    fuelAmount: allExpenses.filter(e => e.category === 'fuel').reduce((sum, e) => sum + e.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header - Sticky */}
      <div className="bg-white border-b z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            <Link
              to={`/expenses/create?lorry=${lorryId}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 sm:px-6 bg-white border-b">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === category
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
                {['all', 'cash', 'bank', 'upi', 'credit'].map((mode) => {
                  const config = mode === 'all' ? null : getPaymentModeConfig(mode);
                  const IconComponent = config?.icon;

                  return (
                    <button
                      key={mode}
                      onClick={() => setFilterPaymentMode(mode)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterPaymentMode === mode
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
        ) : expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => {
              const categoryConfig = getCategoryConfig(expense.category);
              const paymentConfig = getPaymentModeConfig(expense.payment_mode);
              const CategoryIcon = categoryConfig.icon;
              const PaymentIcon = paymentConfig.icon;

              return (
                <motion.div
                  key={expense._id}
                  layout
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Header Row: Category, Payment Mode & Amount */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryConfig.color}`}>
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {categoryConfig.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${paymentConfig.color}`}>
                          <PaymentIcon className="h-3.5 w-3.5" />
                          {paymentConfig.label}
                        </span>
                      </div>

                      {/* Amount - Prominent Display */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {expense.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {expense.description}
                        </p>
                      </div>
                    )}

                    {/* Footer Row: Date & Actions */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(expense.date)}</span>
                      </div>

                      {/* Action Menu Button */}
                      <button
                        ref={(el) => (buttonRefs.current[expense._id] = el)}
                        onClick={(e) => handleActionMenuToggle(expense._id, e)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <IndianRupee className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? "No matching expenses found" : "No expenses found"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {hasActiveFilters 
                ? "Try adjusting your filters" 
                : "Add your first expense to get started"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Menu Dropdown - Portal Style */}
      <AnimatePresence>
        {showActionMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowActionMenu(null)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
              style={{
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  navigate(`/expenses/edit/${showActionMenu}`);
                  setShowActionMenu(null);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <Edit className="h-4 w-4" />
                Edit Expense
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  const expense = expenses.find(e => e._id === showActionMenu);
                  if (expense) {
                    handleDeleteClick(
                      expense._id,
                      expense.description || 'Expense',
                      expense.amount,
                      expense.category
                    );
                  }
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="h-4 w-4" />
                Delete Expense
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedExpense(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense?`}
        isLoading={isDeleting}
        itemName={selectedExpense ?
          `${selectedExpense.description || 'Expense'} - ${formatCurrency(selectedExpense.amount)} (${selectedExpense.category})`
          : ""
        }
      />
    </div>
  );
};

export default LorryExpenses;