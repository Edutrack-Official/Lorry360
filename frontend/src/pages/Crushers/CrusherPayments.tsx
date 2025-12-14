import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  IndianRupee,
  Search,
  Filter,
  X,
  Loader2,
  Wallet,
  Smartphone,
  Banknote,
  Building2,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
}

const CrusherPayments = () => {
  const { crusherId } = useParams();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("all");
  const [filterPaymentType, setFilterPaymentType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    id: string;
    payment_number: string;
    amount: number;
    payment_mode: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/crusher/${crusherId}`);
      const paymentsData = res.data.data?.payments || [];
      setPayments(paymentsData);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (crusherId) {
      fetchPayments();
    }
  }, [crusherId]);

  const handleDeleteClick = (paymentId: string, payment_number: string, amount: number, payment_mode: string) => {
    setSelectedPayment({ id: paymentId, payment_number, amount, payment_mode });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/payments/delete/${selectedPayment.id}`);
      toast.success("Payment deleted successfully");
      setDeleteModalOpen(false);
      setSelectedPayment(null);
      fetchPayments(); // Refresh the payments list
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
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

  const getPaymentModeConfig = (mode: string) => {
    const config = {
      cash: { 
        color: "bg-green-50 text-green-700 border-green-200", 
        icon: Banknote, 
        label: "Cash" 
      },
      bank_transfer: { 
        color: "bg-blue-50 text-blue-700 border-blue-200", 
        icon: Building2, 
        label: "Bank Transfer" 
      },
      cheque: { 
        color: "bg-purple-50 text-purple-700 border-purple-200", 
        icon: CreditCard, 
        label: "Cheque" 
      },
      upi: { 
        color: "bg-orange-50 text-orange-700 border-orange-200", 
        icon: Smartphone, 
        label: "UPI" 
      },
      other: { 
        color: "bg-gray-50 text-gray-700 border-gray-200", 
        icon: CreditCard, 
        label: "Other" 
      }
    };
    return config[mode as keyof typeof config] || config.other;
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterPaymentMode("all");
    setFilterPaymentType("all");
    setDateRange({ start: "", end: "" });
  };

  const normalizeAmountForSearch = (amount: number): string => {
    return amount.toString().replace(/,/g, '');
  };

  const matchesAmountSearch = (amount: number, searchText: string): boolean => {
    if (!searchText.trim()) return true;
    
    const normalizedSearch = searchText.replace(/,/g, '').toLowerCase();
    const normalizedAmount = normalizeAmountForSearch(amount);
    
    if (normalizedAmount.includes(normalizedSearch)) {
      return true;
    }
    
    const formattedAmount = new Intl.NumberFormat('en-IN').format(amount);
    if (formattedAmount.includes(searchText)) {
      return true;
    }
    
    const currencyFormatted = formatCurrency(amount).toLowerCase();
    if (currencyFormatted.includes(searchText.toLowerCase())) {
      return true;
    }
    
    const cleanCurrency = currencyFormatted.replace(/[₹,]/g, '').trim();
    if (cleanCurrency.includes(normalizedSearch)) {
      return true;
    }
    
    return false;
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchText === "" ||
      payment.payment_number.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchText.toLowerCase()) ||
      matchesAmountSearch(payment.amount, searchText) ||
      payment.payment_type.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.payment_mode.toLowerCase().includes(searchText.toLowerCase());

    const matchesPaymentMode =
      filterPaymentMode === "all" || payment.payment_mode === filterPaymentMode;

    const matchesPaymentType =
      filterPaymentType === "all" || payment.payment_type === filterPaymentType;

    const paymentDate = new Date(payment.payment_date);
    const matchesDateRange =
      (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
      (!dateRange.end || paymentDate <= new Date(dateRange.end));

    return matchesSearch && matchesPaymentMode && matchesPaymentType && matchesDateRange;
  });

  const handleActionMenuToggle = (paymentId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (showActionMenu === paymentId) {
      setShowActionMenu(null);
      return;
    }

    const button = buttonRefs.current[paymentId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setShowActionMenu(paymentId);
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
          <p className="text-sm text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header - Sticky */}
      <div className="bg-white border-b z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search payments by amount, number, notes, mode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              {searchText && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => setSearchText("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <Link
              to={`/crushers/${crusherId}/payments/create`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Payment</span>
            </Link>
          </div>
          
          {/* Search tips */}
          {searchText && (
            <div className="text-xs text-gray-500 mt-2">
              Tip: Search amounts like "5000", "5,000", or "₹5000" | Payment modes: cash, bank, upi, etc.
            </div>
          )}
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

          {(searchText || filterPaymentMode !== "all" || filterPaymentType !== "all" || dateRange.start || dateRange.end) && (
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
            {/* Payment Mode Filters */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Payment Mode</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['all', 'cash', 'bank_transfer', 'cheque', 'upi', 'other'].map((mode) => {
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

            {/* Payment Type Filter */}
            {/* <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Payment Type</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['all', 'to_crusher', 'from_crusher'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterPaymentType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      filterPaymentType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">From Date</p>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">To Date</p>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {(searchText || filterPaymentMode !== "all" || filterPaymentType !== "all" || dateRange.start || dateRange.end) && (
        <div className="px-4 py-2 sm:px-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">
              Found {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} 
              {searchText ? ` matching "${searchText}"` : ''}
            </p>
            {filteredPayments.length > 0 && (
              <p className="text-sm text-blue-600 font-medium">
                Total: {formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.amount, 0))}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="p-2 sm:p-4">
        {filteredPayments.length > 0 ? (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const config = getPaymentModeConfig(payment.payment_mode);
              const PaymentIcon = config.icon;
              const formattedAmount = formatCurrency(payment.amount);

              return (
                <motion.div
                  key={payment._id}
                  layout
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {payment.payment_number}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                            <PaymentIcon className="h-3.5 w-3.5" />
                            {config.label}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {payment.payment_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Amount - Highlight if matches search */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xl font-bold ${
                          searchText && matchesAmountSearch(payment.amount, searchText) 
                            ? 'text-blue-600 underline decoration-2' 
                            : 'text-green-600'
                        }`}>
                          {formattedAmount}
                        </p>
                        {searchText && matchesAmountSearch(payment.amount, searchText) && (
                          <p className="text-xs text-blue-500 mt-1">Amount matches search</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {payment.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {payment.notes}
                        </p>
                      </div>
                    )}

                    {/* Footer Row: Date & Actions */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(payment.payment_date)}</span>
                      </div>

                      {/* Three-dot Action Menu Button */}
                      <button
                        ref={(el) => (buttonRefs.current[payment._id] = el)}
                        onClick={(e) => handleActionMenuToggle(payment._id, e)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors relative"
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
            <CreditCard className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {payments.length === 0 ? 'No payments yet' : 'No payments found'}
            </h3>
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
                  navigate(`/crushers/${crusherId}/payments/edit/${showActionMenu}`);
                  setShowActionMenu(null);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <Edit className="h-4 w-4" />
                Edit Payment
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  const payment = payments.find(p => p._id === showActionMenu);
                  if (payment) {
                    handleDeleteClick(
                      payment._id,
                      payment.payment_number,
                      payment.amount,
                      payment.payment_mode
                    );
                  }
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="h-4 w-4" />
                Delete Payment
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
          setSelectedPayment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
        isLoading={isDeleting}
        itemName={selectedPayment ? 
          `${selectedPayment.payment_number} - ${formatCurrency(selectedPayment.amount)} (${getPaymentModeConfig(selectedPayment.payment_mode).label})` 
          : ""
        }
      />
    </div>
  );
};

export default CrusherPayments;