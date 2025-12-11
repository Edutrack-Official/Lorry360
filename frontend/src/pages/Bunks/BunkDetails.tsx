import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, Outlet } from "react-router-dom";
import api from "../../api/client";
import { IndianRupee, Fuel } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Calendar,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

interface Bunk {
  _id: string;
  bunk_name: string;
  address: string;
  isActive: boolean;
  owner_id: string;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  _id: string;
  expense_number: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_mode: string;
  description?: string;
  notes?: string;
  bunk_id: {
    _id: string;
    bunk_name: string;
  };
  vehicle_id?: {
    _id: string;
    registration_number: string;
  };
  driver_id?: {
    _id: string;
    name: string;
  };
  fuel_type?: string;
  fuel_quantity?: number;
  fuel_price_per_liter?: number;
}

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
  bunk_id: string;
}

const BunkDetails = () => {
  const { bunkId } = useParams<{ bunkId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bunk, setBunk] = useState<Bunk | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/payments')) return 'payments';
    return 'expenses'; // Changed from 'trips' to 'expenses'
  };

  const activeTab = getActiveTab();

  const fetchBunk = async () => {
    try {
      const res = await api.get(`/petrol-bunks/${bunkId}`); // Changed endpoint
      setBunk(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch bunk details");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      // Assuming you have an endpoint to get expenses by bunk
      const res = await api.get(`/expenses/bunk/${bunkId}`, {
        params: { category: 'fuel' }
      });
      const bunkExpenses = res.data.data?.expenses || [];
      setExpenses(bunkExpenses);
    } catch (error: any) {
      console.error("Failed to fetch expenses:", error);
      toast.error("Failed to fetch expenses");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/bunk/${bunkId}`); // Changed endpoint
      const paymentsData = res.data.data?.payments || [];
      setPayments(paymentsData);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to fetch payments");
    }
  };

  useEffect(() => {
    if (bunkId) {
      fetchBunk();
      fetchExpenses();
      fetchPayments();
    }
  }, [bunkId]);

  const getStatusBadge = (isActive: boolean) => {
    const config = isActive 
      ? { color: "bg-green-100 text-green-800 border-green-200", label: "Active" }
      : { color: "bg-red-100 text-red-800 border-red-200",  label: "Inactive" };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {/* <span>{config.icon}</span> */}
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

  const calculateStats = () => {
    const totalExpenses = expenses.length;
    const totalPayments = payments.length;
    
    // Calculate total fuel expenses
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalFuelQuantity = expenses.reduce((sum, expense) => sum + (expense.fuel_quantity || 0), 0);
    
    const totalPaymentAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = totalExpenseAmount - totalPaymentAmount;

    // Calculate average fuel price
    const fuelExpenses = expenses.filter(e => e.fuel_price_per_liter);
    const avgFuelPrice = fuelExpenses.length > 0 
      ? fuelExpenses.reduce((sum, e) => sum + (e.fuel_price_per_liter || 0), 0) / fuelExpenses.length
      : 0;

    return {
      totalExpenses,
      totalPayments,
      totalExpenseAmount,
      totalFuelQuantity,
      totalPaymentAmount,
      pendingAmount,
      avgFuelPrice
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bunk) {
    return (
      <div className="text-center py-12 px-4">
        <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bunk not found</h3>
        <button
          onClick={() => navigate("/bunks")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Bunks
        </button>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-4 md:space-y-6 fade-in p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate("/bunks")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                  {bunk.bunk_name}
                </h1>
                {getStatusBadge(bunk.isActive)}
              </div>
              
              {/* Address Information */}
              {bunk.address && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{bunk.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats - Scrollable Horizontal */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            <div className="flex gap-4 min-w-max">
              {/* Total Expenses */}
              <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalExpenses}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Fuel Expenses</div>
              </div>

              {/* Total Fuel Quantity */}
              {/* <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 break-words">
                  {stats.totalFuelQuantity.toFixed(2)} L
                </div>
                <div className="text-xs sm:text-sm text-blue-600 mt-1">Fuel Quantity</div>
              </div> */}

              {/* Total Expense Amount */}
              <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-purple-100 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 break-words">
                  {formatCurrency(stats.totalExpenseAmount)}
                </div>
                <div className="text-xs sm:text-sm text-purple-600 mt-1">Total Expenses</div>
              </div>

              {/* Average Fuel Price */}
              {/* <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-amber-100 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-amber-600 break-words">
                  ₹{stats.avgFuelPrice.toFixed(2)}/L
                </div>
                <div className="text-xs sm:text-sm text-amber-600 mt-1">Avg Fuel Price</div>
              </div> */}

              {/* Payments Made */}
              <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-green-100 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-green-600 break-words">
                  {formatCurrency(stats.totalPaymentAmount)}
                </div>
                <div className="text-xs sm:text-sm text-green-600 mt-1">Payments Made</div>
              </div>

              {/* Pending Amount */}
              <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-orange-100 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-orange-600 break-words">
                  {formatCurrency(stats.pendingAmount)}
                </div>
                <div className="text-xs sm:text-sm text-orange-600 mt-1">Pending Amount</div>
              </div>

              {/* Payment Count */}
              <div className="min-w-[140px] sm:min-w-[160px] text-center p-4 bg-white border border-indigo-100 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl font-bold text-indigo-600">
                  {stats.totalPayments}
                </div>
                <div className="text-xs sm:text-sm text-indigo-600 mt-1">Payment Count</div>
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Tabs - Mobile Optimized */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            <Link
              to={`/bunks/${bunkId}/expenses`}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Fuel className="h-4 w-4 flex-shrink-0" />
              <span>Fuel Expenses</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {expenses.length}
              </span>
            </Link>
            <Link
              to={`/bunks/${bunkId}/payments`}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IndianRupee className="h-4 w-4 flex-shrink-0" />
              <span>Payments</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {payments.length}
              </span>
            </Link>
          </nav>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {/* This will render either BunkExpenses or BunkPayments component */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BunkDetails;