import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, Outlet } from "react-router-dom";
import api from "../../api/client";
import { Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  User,
  Package,
  Receipt,
  Calendar,
  Edit,
  MoreVertical,
  ArrowLeft,
  Plus,
  BadgeAlert,
  MapPin,
  Phone,
  Home,
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

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/payments')) return 'payments';
    return 'trips'; // Default to trips tab
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
      const res = await api.get(`/trips`);
      const allTrips = res.data.data?.trips || [];
      const customerTrips = allTrips.filter((trip: Trip) => trip.customer_id === customerId);
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
      <div className="text-center py-12">
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
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/customers")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h1>
                {getStatusBadge(customer.isActive)}
              </div>
              
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Home className="h-4 w-4 mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(customer.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <BadgeAlert className="h-4 w-4" />
                  Last updated {formatDate(customer.updatedAt)}
                </div>
              </div>

              {/* Site Addresses */}
              {customer.site_addresses && customer.site_addresses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Site Addresses:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.site_addresses.map((address, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {address}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/customers/edit/${customerId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Customer
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
                      to={`/trips/create?customer=${customerId}`}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Trip
                    </Link>
                    <Link
                      to={`/payments/create?customer=${customerId}`}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Payment
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleDeleteCustomer}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Customer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalTrips}</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalProfit)}
            </div>
            <div className="text-sm text-gray-600">Total Profit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalPaymentAmount)}
            </div>
            <div className="text-sm text-gray-600">Payments Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pendingAmount)}
            </div>
            <div className="text-sm text-gray-600">Pending Amount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.totalPayments}
            </div>
            <div className="text-sm text-gray-600">Payment Count</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <Link
              to={`/customers/${customerId}/trips`}
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
              to={`/customers/${customerId}/payments`}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'payments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Payments
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {payments.length}
              </span>
            </Link>
          </nav>
        </div>

        <div className="p-6">
          {/* This will render either CustomerTrips or CustomerPayments component */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;