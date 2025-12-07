import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, Outlet } from "react-router-dom";
import api from "../../api/client";
import { IndianRupee, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  User,
  Package,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  site_addresses: string[];
  isActive: boolean;
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
  customer_amount: number;
  location: string;
  material_name: string;
  customer_id: string;
  lorry_id?: {
    _id: string;
    registration_number: string;
  };
}

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
  customer_id: string;
}

const CustomerDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/payments')) return 'payments';
    return 'trips';
  };

  const activeTab = getActiveTab();

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${customerId}`);
      setCustomer(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/trips/customer/${customerId}`);
      const customerTrips = (res.data.data?.trips || []).filter(
        (trip: any) => trip.status === "completed"
      );    
    setTrips(customerTrips);
    } catch (error: any) {
      console.error("Failed to fetch trips:", error);
      toast.error("Failed to fetch trips");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/customer/${customerId}`);
      const paymentsData = res.data.data?.payments || [];
      setPayments(paymentsData);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to fetch payments");
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchTrips();
      fetchPayments();
    }
  }, [customerId]);

  const handleDeleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to delete ${customer?.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/customers/delete/${customerId}`);
      toast.success("Customer deleted successfully");
      navigate("/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete customer");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    const config = isActive 
      ? { color: "bg-green-100 text-green-800 border-green-200", icon: "✅", label: "Active" }
      : { color: "bg-red-100 text-red-800 border-red-200", icon: "⏸️", label: "Inactive" };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
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

  const calculateStats = () => {
    const totalTrips = trips.length;
    const totalPayments = payments.length;
    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const totalProfit = trips.reduce((sum, trip) => sum + (trip.profit || 0), 0);
    const totalPaymentAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = totalRevenue - totalPaymentAmount;

    return {
      totalTrips,
      totalPayments,
      totalRevenue,
      totalProfit,
      totalPaymentAmount,
      pendingAmount
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 px-4">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer not found</h3>
        <button
          onClick={() => navigate("/customers")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-4 fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
        {/* Title Section */}
        <div className="flex items-start gap-3 mb-6">
          <button
            onClick={() => navigate("/customers")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Back to customers"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words flex-1 min-w-0">
            {customer.name}
          </h1>
        </div>

        {/* Stats Section - Scrollable on Mobile */}
        <div className="border-t border-gray-200 pt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div 
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-6 sm:overflow-visible"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex-shrink-0 min-w-[140px] text-center sm:min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.totalTrips}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Trips</div>
            </div>

            <div className="flex-shrink-0 min-w-[140px] text-center sm:min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Revenue</div>
            </div>

            <div className="flex-shrink-0 min-w-[140px] text-center sm:min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalProfit)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Profit</div>
            </div>

            <div className="flex-shrink-0 min-w-[140px] text-center sm:min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {formatCurrency(stats.totalPaymentAmount)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Received</div>
            </div>

            <div className="flex-shrink-0 min-w-[140px] text-center sm:min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {formatCurrency(stats.pendingAmount)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>

            <div className="flex-shrink-0 min-w-[140px] text-center sm:min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {stats.totalPayments}
              </div>
              <div className="text-sm text-gray-600 mt-1">Payments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <nav className="flex px-4 sm:px-6 min-w-max">
            <Link
              to={`/customers/${customerId}/trips`}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'trips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 flex-shrink-0" />
              <span>Trips</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {trips.length}
              </span>
            </Link>

            <Link
              to={`/customers/${customerId}/payments`}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IndianRupee className="h-4 w-4 flex-shrink-0" />
              <span>Payments</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {payments.length}
              </span>
            </Link>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;