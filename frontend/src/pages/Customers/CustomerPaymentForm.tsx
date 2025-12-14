import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CreditCard,
  Calendar,
  User,
  FileText,
  X,
  AlertCircle,
  Banknote,
  Building2,
  Smartphone,
  Wallet,
  IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  const { customerId, paymentId } = useParams<{ customerId: string; paymentId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!paymentId;

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (customerId || paymentId) {
        setLoading(true);
        try {
          // If in edit mode, fetch the payment data first
          if (isEditMode && paymentId) {
            try {
              const paymentRes = await api.get(`/payments/${paymentId}`);
              const paymentData = paymentRes.data.data;

              // Set form data from existing payment
              setFormData({
                payment_type: paymentData.payment_type || 'from_customer',
                customer_id: paymentData.customer_id || '',
                amount: paymentData.amount || 0,
                payment_date: paymentData.payment_date ?
                  new Date(paymentData.payment_date).toISOString().split('T')[0] :
                  new Date().toISOString().split('T')[0],
                payment_mode: paymentData.payment_mode || 'cash',
                notes: paymentData.notes || ''
              });

              // Set customerId from payment if not in params
              const targetCustomerId = customerId || paymentData.customer_id;
              if (targetCustomerId) {
                const customerRes = await api.get(`/customers/${targetCustomerId}`);
                const customerData = customerRes.data.data;
                setCustomer(customerData);
              }
            } catch (error: any) {
              console.error('Failed to fetch payment:', error);
              toast.error('Failed to fetch payment details');
              navigate('/customers');
            }
          } else if (customerId) {
            // Create mode: fetch customer data
            const customerRes = await api.get(`/customers/${customerId}`);
            const customerData = customerRes.data.data;
            setCustomer(customerData);
          }

          // Fetch existing payments for stats (only for create mode)
          if (!isEditMode && customerId) {
            const paymentsRes = await api.get(`/payments/customer/${customerId}`);
            setPayments(paymentsRes.data.data?.payments || []);
          }

          // Fetch trips for stats
          if (customerId) {
            const tripsRes = await api.get('/trips');
            const allTrips = tripsRes.data.data?.trips || [];
            const customerTrips = allTrips.filter((trip: Trip) =>
              trip.customer_id && trip.customer_id._id === customerId && trip.status === 'completed'
            );
            setTrips(customerTrips);
          }

        } catch (error: any) {
          console.error('Failed to fetch data:', error);
          toast.error('Failed to fetch data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [customerId, paymentId, isEditMode, navigate]);

  const calculatePaymentStats = () => {
    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = Math.max(0, totalRevenue - totalPayments);

    return {
      totalRevenue,
      totalPayments,
      pendingAmount
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

    if (!formData.customer_id || (typeof formData.customer_id === 'string' && formData.customer_id.trim() === '')) {
      newErrors.customer_id = "Customer is required";
    }

    if (formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!formData.payment_date) newErrors.payment_date = "Payment date is required";
    if (!formData.payment_mode) newErrors.payment_mode = "Payment mode is required";

    // For create mode only, check if amount exceeds pending amount
    if (!isEditMode && formData.amount > paymentStats.pendingAmount) {
      newErrors.amount = `Amount cannot exceed pending amount of ${formatCurrency(paymentStats.pendingAmount)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        customer_id: customerId || formData.customer_id,
        payment_type: 'from_customer',
        amount: parseFloat(formData.amount.toString())
      };

      if (isEditMode && paymentId) {
        // Update existing payment
        await api.put(`/payments/update/${paymentId}`, submissionData);
        toast.success("Payment updated successfully");
      } else {
        // Create new payment
        await api.post("/payments/create", submissionData);
        toast.success("Payment recorded successfully");
      }

      // Navigate back to payments list
      const targetCustomerId = customerId || formData.customer_id;
      navigate(`/customers/${targetCustomerId}/payments`);

    } catch (error: any) {
      console.error('Payment submission error:', error);
      let errorMessage = error.response?.data?.error ||
        (isEditMode ? "Failed to update payment" : "Failed to record payment");

      if (errorMessage.includes('customer_id') && errorMessage.includes('required')) {
        errorMessage = "Customer information is missing. Please refresh the page and try again.";
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paymentModes = [
    { value: 'cash', label: 'Cash', Icon: Banknote },
    { value: 'bank_transfer', label: 'Bank Transfer', Icon: Building2 },
    { value: 'cheque', label: 'Cheque', Icon: IndianRupee },
    { value: 'upi', label: 'UPI', Icon: Smartphone },
    { value: 'other', label: 'Other', Icon: Wallet }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isEditMode ? 'Loading payment details...' : 'Loading customer details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!customer && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load customer information</p>
          <button
            onClick={() => navigate('/customers')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                const targetCustomerId = customerId || formData.customer_id;
                navigate(`/customers/${targetCustomerId}/payments`);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Back to payments"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center lg:justify-start flex-1 min-w-0">
              <div className="text-center lg:text-left min-w-0 max-w-full">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Payment' : 'Customer Payments'}
                </h1>
                {/* <p className="text-sm sm:text-base text-gray-600 truncate">
                  {isEditMode
                    ? `Edit payment for ${customer?.name || 'Customer'}`
                    : `Manage payments for ${customer?.name || 'Customer'}`}
                </p> */}
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          {customer && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-green-900 break-words">{customer.name}</h3>
                  <p className="text-green-700 text-sm break-words">{customer.phone}</p>
                  <p className="text-green-600 text-sm break-words">{customer.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            {isEditMode ? 'Edit Payment' : 'Record New Payment'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="h-4 w-4 inline mr-1" />
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
                {!isEditMode && customer && (
                  <p className="text-xs text-gray-500 mt-2">
                    Pending amount: {formatCurrency(paymentStats.pendingAmount)}
                  </p>
                )}
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Payment Date *
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  max={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                />
                {errors.payment_date && (
                  <p className="mt-2 text-sm text-red-600">{errors.payment_date}</p>
                )}
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {paymentModes.map((mode) => {
                    const IconComponent = mode.Icon;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode.value }))}
                        className={`p-3 rounded-lg border transition-all ${formData.payment_mode === mode.value
                          ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                          <IconComponent className="h-5 w-5" />
                          <span className="text-xs sm:text-sm font-medium text-center sm:text-left">
                            {mode.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.payment_mode && (
                  <p className="mt-2 text-sm text-red-600">{errors.payment_mode}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </div>

            <input type="hidden" name="customer_id" value={formData.customer_id} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || (!isEditMode && paymentStats.pendingAmount <= 0)}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors flex-1 sm:flex-none font-medium
      ${submitting || (!isEditMode && paymentStats.pendingAmount <= 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                  }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                    {isEditMode ? 'Updating...' : 'Recording...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Update Payment' : 'Record Payment'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetCustomerId = customerId || formData.customer_id;
                  navigate(`/customers/${targetCustomerId}/payments`);
                }}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors flex-1 sm:flex-none disabled:opacity-50 font-medium"
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