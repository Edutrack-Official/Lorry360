import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
}

const CustomerPayments = () => {
  const { customerId } = useParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("all");
  const [filterPaymentType, setFilterPaymentType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/customer/${customerId}`);
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
    if (customerId) {
      fetchPayments();
    }
  }, [customerId]);

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
        icon: Wallet, 
        label: "Cash" 
      },
      bank_transfer: { 
        color: "bg-blue-50 text-blue-700 border-blue-200", 
        icon: CreditCard, 
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

  const filteredPayments = payments.filter((payment) => {
    // Search filter
    const matchesSearch =
      payment.payment_number.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.amount.toString().includes(searchText) ||
      payment.payment_type.toLowerCase().includes(searchText.toLowerCase());

    // Payment mode filter
    const matchesPaymentMode =
      filterPaymentMode === "all" || payment.payment_mode === filterPaymentMode;

    // Payment type filter
    const matchesPaymentType =
      filterPaymentType === "all" || payment.payment_type === filterPaymentType;

    // Date range filter
    const paymentDate = new Date(payment.payment_date);
    const matchesDateRange =
      (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
      (!dateRange.end || paymentDate <= new Date(dateRange.end));

    return matchesSearch && matchesPaymentMode && matchesPaymentType && matchesDateRange;
  });

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
                placeholder="Search payments..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            <Link
              to={`/customers/${customerId}/payments/create`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Payment</span>
            </Link>
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
          </div>
        )}
      </div>

      {/* Payments List */}
      <div className="p-4 sm:p-6">
        {filteredPayments.length > 0 ? (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const config = getPaymentModeConfig(payment.payment_mode);
              const PaymentIcon = config.icon;

              return (
                <motion.div
                  key={payment._id}
                  layout
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
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

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
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

                    {/* Footer Row: Date */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(payment.payment_date)}</span>
                      </div>
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
              No payments found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPayments;