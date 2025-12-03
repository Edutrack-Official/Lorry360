import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Calendar, 
  Building, 
  FileText, 
  X,
  AlertCircle,
  Banknote,
  Smartphone,
  Wallet,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface PaymentFormData {
  payment_type: string;
  crusher_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes: string;
}

interface Crusher {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  materials: Array<{
    material_name: string;
    price_per_unit: number;
  }>;
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
  crusher_amount: number;
  trip_date: string;
  status: string;
  crusher_id: {
    _id: string;
    name: string;
  };
}

const CrusherPaymentForm = () => {
  const { crusherId } = useParams<{ crusherId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_type: 'to_crusher',
    crusher_id: crusherId || searchParams.get('crusher') || '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    notes: ''
  });

  const [crusher, setCrusher] = useState<Crusher | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch crusher details and payment history
  useEffect(() => {
    const fetchData = async () => {
      const targetCrusherId = crusherId || searchParams.get('crusher');
      if (targetCrusherId) {
        setLoading(true);
        try {
          // Fetch crusher details
          const crusherRes = await api.get(`/crushers/${targetCrusherId}`);
          const crusherData = crusherRes.data.data;
          setCrusher(crusherData);

          // Ensure crusher_id is set in form data
          setFormData(prev => ({
            ...prev,
            crusher_id: targetCrusherId
          }));

          // Fetch payment history
          const paymentsRes = await api.get(`/payments/crusher/${targetCrusherId}`);
          setPayments(paymentsRes.data.data?.payments || []);

          // Fetch trips for this crusher
          const tripsRes = await api.get(`/trips/crusher/${targetCrusherId}`);
          setTrips(tripsRes.data.data?.trips || []);

        } catch (error: any) {
          console.error('Failed to fetch data:', error);
          toast.error('Failed to fetch crusher data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [crusherId, searchParams]);

  // Calculate payment statistics
  const calculatePaymentStats = () => {
    const totalCrusherAmount = trips.reduce((sum, trip) => sum + (trip.crusher_amount || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = Math.max(0, totalCrusherAmount - totalPayments);

    return {
      totalCrusherAmount,
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

    // CRITICAL FIX: Ensure crusher_id is properly set
    if (!formData.crusher_id || formData.crusher_id.trim() === '') {
      newErrors.crusher_id = "Crusher is required";
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
        crusher_id: crusherId || searchParams.get('crusher'), // Force set from URL param or query
        payment_type: 'to_crusher', // Force set for crusher payments
        amount: parseFloat(formData.amount.toString())
      };

      console.log('Submitting payment data:', submissionData);

      await api.post("/payments/create", submissionData);
      toast.success("Payment recorded successfully");
      
      // Refresh data
      const targetCrusherId = crusherId || searchParams.get('crusher');
      if (targetCrusherId) {
        const paymentsRes = await api.get(`/payments/crusher/${targetCrusherId}`);
        setPayments(paymentsRes.data.data?.payments || []);
      }
      
      // Reset form but keep crusher_id
      setFormData(prev => ({
        ...prev,
        amount: 0,
        notes: ''
      }));
    } catch (error: any) {
      console.error('Payment submission error:', error);
      let errorMessage = error.response?.data?.error || "Failed to record payment";
      
      // Handle specific Mongoose validation errors
      if (errorMessage.includes('crusher_id') && errorMessage.includes('required')) {
        errorMessage = "Crusher information is missing. Please refresh the page and try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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

  const getBackUrl = () => {
    if (crusherId) {
      return `/crushers/${crusherId}/payments`;
    } else {
      return '/payments';
    }
  };

  const paymentModes = [
    { value: 'cash', label: 'Cash', Icon: Banknote },
    { value: 'bank_transfer', label: 'Bank Transfer', Icon: TrendingUp },
    { value: 'cheque', label: 'Cheque', Icon: IndianRupee },
    { value: 'upi', label: 'UPI', Icon: Smartphone },
    { value: 'other', label: 'Other', Icon: Wallet }
  ];

  if (loading && !payments.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crusher details...</p>
        </div>
      </div>
    );
  }

  if (!crusher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Crusher Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load crusher information</p>
          <button
            onClick={() => navigate('/crushers')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Crushers
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
          <div className="flex items-start gap-3 mb-4">
            <button
              onClick={() => navigate(getBackUrl())}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Back to payments"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Crusher Payments
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                Manage payments to {crusher?.name}
              </p>
            </div>
          </div>

          {/* Crusher Info Card */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-orange-900 break-words">{crusher.name}</h3>
                {crusher.phone && (
                  <p className="text-orange-700 text-sm break-words">{crusher.phone}</p>
                )}
                {crusher.address && (
                  <p className="text-orange-600 text-sm break-words">{crusher.address}</p>
                )}
                {crusher.materials && crusher.materials.length > 0 && (
                  <p className="text-orange-600 text-sm break-words">
                    Materials: {crusher.materials.map(m => m.material_name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Record New Payment</h3>
          
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Pending amount: {formatCurrency(paymentStats.pendingAmount)}
                </p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
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
                        className={`p-3 rounded-lg border transition-all ${
                          formData.payment_mode === mode.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </div>

            <input type="hidden" name="crusher_id" value={formData.crusher_id} />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(getBackUrl())}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || paymentStats.pendingAmount <= 0}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="h-4 w-4" />
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrusherPaymentForm;