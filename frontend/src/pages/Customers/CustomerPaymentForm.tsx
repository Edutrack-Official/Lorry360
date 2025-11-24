import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  X,
  TrendingUp,
  Clock,
  Calculator,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface PaymentFormData {
  payment_type: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  site_addresses: string[];
}

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
  createdAt: string;
}

interface Trip {
  _id: string;
  trip_number: string;
  customer_amount: number;
  trip_date: string;
  status: string;
  customer_id: {
    _id: string;
    name: string;
  };
}

const CustomerPaymentForm = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_type: 'from_customer',
    customer_id: customerId || '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    notes: ''
  });

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [period, setPeriod] = useState<'current_month' | 'last_month' | 'custom'>('current_month');
  const [customDateRange, setCustomDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePayment, setDeletePayment] = useState<Payment | null>(null);

  // Fetch customer details and payment history
  useEffect(() => {
    const fetchData = async () => {
      if (customerId) {
        setLoading(true);
        try {
          // Fetch customer details
          const customerRes = await api.get(`/customers/${customerId}`);
          const customerData = customerRes.data.data;
          setCustomer(customerData);

          // Ensure customer_id is set in form data
          setFormData(prev => ({
            ...prev,
            customer_id: customerId
          }));

          // Fetch payment history
          const paymentsRes = await api.get(`/payments/customer/${customerId}`);
          setPayments(paymentsRes.data.data?.payments || []);

          // Fetch trips for this customer
          const tripsRes = await api.get('/trips');
          const allTrips = tripsRes.data.data?.trips || [];
          const customerTrips = allTrips.filter((trip: Trip) => 
            trip.customer_id && trip.customer_id._id === customerId
          );
          setTrips(customerTrips);

        } catch (error: any) {
          console.error('Failed to fetch data:', error);
          toast.error('Failed to fetch customer data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [customerId]);

  // Calculate payment statistics
  const calculatePaymentStats = () => {
    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = Math.max(0, totalRevenue - totalPayments);

    // Filter payments by period
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      let startDate: Date, endDate: Date;

      if (period === 'current_month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'last_month') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (period === 'custom' && customDateRange.start_date && customDateRange.end_date) {
        startDate = new Date(customDateRange.start_date);
        endDate = new Date(customDateRange.end_date);
      } else {
        return true; // Show all if no period selected
      }

      return paymentDate >= startDate && paymentDate <= endDate;
    });

    const periodPayments = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      totalRevenue,
      totalPayments,
      pendingAmount,
      periodPayments,
      filteredPayments,
      paymentCount: filteredPayments.length
    };
  };

  const paymentStats = calculatePaymentStats();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }));
    } else {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // CRITICAL FIX: Ensure customer_id is properly set
    if (!formData.customer_id || formData.customer_id.trim() === '') {
      newErrors.customer_id = "Customer is required";
    }

    if (formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!formData.payment_date) newErrors.payment_date = "Payment date is required";
    if (!formData.payment_mode) newErrors.payment_mode = "Payment mode is required";

    // Validate if payment amount exceeds pending amount
    if (formData.amount > paymentStats.pendingAmount) {
      newErrors.amount = `Amount cannot exceed pending amount of ${formatCurrency(paymentStats.pendingAmount)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSubmitting(true);
    try {
      // Ensure all required fields are properly set
      const submissionData = {
        ...formData,
        customer_id: customerId, // Force set from URL param
        payment_type: 'from_customer', // Force set for customer payments
        amount: parseFloat(formData.amount.toString())
      };

      console.log('Submitting payment data:', submissionData);

      await api.post("/payments/create", submissionData);
      toast.success("Payment recorded successfully");
      
      // Refresh data
      const paymentsRes = await api.get(`/payments/customer/${customerId}`);
      setPayments(paymentsRes.data.data?.payments || []);
      
      // Reset form but keep customer_id
      setFormData(prev => ({
        ...prev,
        amount: 0,
        notes: ''
      }));
    } catch (error: any) {
      console.error('Payment submission error:', error);
      let errorMessage = error.response?.data?.error || "Failed to record payment";
      
      // Handle specific Mongoose validation errors
      if (errorMessage.includes('customer_id') && errorMessage.includes('required')) {
        errorMessage = "Customer information is missing. Please refresh the page and try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deletePayment) return;

    setLoading(true);
    try {
      await api.delete(`/payments/delete/${deletePayment._id}`);
      toast.success("Payment deleted successfully");
      setShowDeleteModal(false);
      setDeletePayment(null);
      
      // Refresh payments
      const paymentsRes = await api.get(`/payments/customer/${customerId}`);
      setPayments(paymentsRes.data.data?.payments || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete payment");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'current_month':
        return 'Current Month';
      case 'last_month':
        return 'Last Month';
      case 'custom':
        return 'Custom Period';
      default:
        return 'Current Month';
    }
  };

  const paymentModes = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cheque', label: 'Cheque', icon: '📄' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'other', label: 'Other', icon: '💳' }
  ];

  if (loading && !payments.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load customer information</p>
          <button
            onClick={() => navigate('/customers')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(`/customers/${customerId}/payments`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Payments
              </h1>
              <p className="text-gray-600">
                Manage payments for {customer?.name}
              </p>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">{customer.name}</h3>
                <p className="text-green-700 text-sm">{customer.phone}</p>
                <p className="text-green-600 text-sm">{customer.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Record New Payment</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Pending amount: {formatCurrency(paymentStats.pendingAmount)}
                </p>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {errors.payment_date && <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>}
              </div>

              {/* Payment Mode */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {paymentModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode.value }))}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        formData.payment_mode === mode.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mode.icon}</span>
                        <span className="text-sm font-medium">{mode.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.payment_mode && <p className="mt-1 text-sm text-red-600">{errors.payment_mode}</p>}
              </div>

              {/* Notes */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </div>

            {/* Hidden customer_id field for debugging */}
            <input type="hidden" name="customer_id" value={formData.customer_id} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || paymentStats.pendingAmount <= 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4" />
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/customers/${customerId}/payments`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentForm;