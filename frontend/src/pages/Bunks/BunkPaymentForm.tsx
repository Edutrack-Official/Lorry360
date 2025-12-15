import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Calendar, 
  Building2, 
  FileText, 
  X,
  AlertCircle,
  Banknote,
  Smartphone,
  Wallet,
  TrendingUp,
  IndianRupee,
  Fuel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface PaymentFormData {
  payment_type: string;
  bunk_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes: string;
}

interface Bunk {
  _id: string;
  bunk_name: string;
  address?: string;
  isActive: boolean;
  owner_id: string;
  createdAt: string;
  updatedAt: string;
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

interface Expense {
  _id: string;
  expense_number: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_mode: string;
  description?: string;
  bunk_id: {
    _id: string;
    bunk_name: string;
  };
  fuel_type?: string;
  fuel_quantity?: number;
  fuel_price_per_liter?: number;
}

const BunkPaymentForm = () => {
  const { bunkId, paymentId } = useParams<{ bunkId: string; paymentId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!paymentId;
  
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_type: 'to_bunk',
    bunk_id: bunkId || searchParams.get('bunk') || '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    notes: ''
  });

  const [bunk, setBunk] = useState<Bunk | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (bunkId || paymentId) {
        setLoading(true);
        try {
          // If in edit mode, fetch the payment data first
          if (isEditMode && paymentId) {
            try {
              const paymentRes = await api.get(`/payments/${paymentId}`);
              const paymentData = paymentRes.data.data;
              
              // Set form data from existing payment
              setFormData({
                payment_type: paymentData.payment_type || 'to_bunk',
                bunk_id: paymentData.bunk_id || '',
                amount: paymentData.amount || 0,
                payment_date: paymentData.payment_date ? 
                  new Date(paymentData.payment_date).toISOString().split('T')[0] : 
                  new Date().toISOString().split('T')[0],
                payment_mode: paymentData.payment_mode || 'cash',
                notes: paymentData.notes || ''
              });

              // Set bunkId from payment if not in params
              const targetBunkId = bunkId || paymentData.bunk_id;
              if (targetBunkId) {
                const bunkRes = await api.get(`/petrol-bunks/${targetBunkId}`);
                const bunkData = bunkRes.data.data;
                setBunk(bunkData);
              }
            } catch (error: any) {
              console.error('Failed to fetch payment:', error);
              toast.error('Failed to fetch payment details');
              navigate('/bunks');
            }
          } else if (bunkId) {
            // Create mode: fetch bunk data
            const bunkRes = await api.get(`/petrol-bunks/${bunkId}`);
            const bunkData = bunkRes.data.data;
            setBunk(bunkData);
          }

          // Fetch existing payments for stats (only for create mode)
          if (!isEditMode && bunkId) {
            const paymentsRes = await api.get(`/payments/bunk/${bunkId}`);
            setPayments(paymentsRes.data.data?.payments || []);
          }

          // Fetch expenses for stats
          if (bunkId) {
            const expensesRes = await api.get(`/expenses/bunk/${bunkId}`, {
              params: { category: 'fuel' }
            });
            setExpenses(expensesRes.data.data?.expenses || []);
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
  }, [bunkId, paymentId, isEditMode, navigate]);

  const calculatePaymentStats = () => {
    // Filter for fuel expenses only
    const fuelExpenses = expenses.filter(expense => expense.category === 'fuel');
    
    const totalExpenseAmount = fuelExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = Math.max(0, totalExpenseAmount - totalPayments);

    return {
      totalExpenseAmount,
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

    if (!formData.bunk_id || (typeof formData.bunk_id === 'string' && formData.bunk_id.trim() === '')) {
      newErrors.bunk_id = "Bunk is required";
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
      toast.error("Please fix the form errors");
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        bunk_id: bunkId || formData.bunk_id,
        payment_type: 'to_bunk',
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
      const targetBunkId = bunkId || formData.bunk_id;
      navigate(`/bunks/${targetBunkId}/payments`);
      
    } catch (error: any) {
      console.error('Payment submission error:', error);
      let errorMessage = error.response?.data?.error || 
        (isEditMode ? "Failed to update payment" : "Failed to record payment");
      
      if (errorMessage.includes('bunk_id') && errorMessage.includes('required')) {
        errorMessage = "Bunk information is missing. Please refresh the page and try again.";
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
    { value: 'bank_transfer', label: 'Bank Transfer', Icon: TrendingUp },
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
            {isEditMode ? 'Loading payment details...' : 'Loading bunk details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!bunk && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bunk Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load bunk information</p>
          <button
            onClick={() => navigate('/bunks')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Bunks
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
              onClick={() => {
                const targetBunkId = bunkId || formData.bunk_id;
                navigate(`/bunks/${targetBunkId}/payments`);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Back to payments"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Payment' : 'Bunk Payments'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                {isEditMode 
                  ? `Edit payment for ${bunk?.bunk_name || 'Bunk'}`
                  : `Manage payments to ${bunk?.bunk_name || 'Bunk'}`}
              </p>
            </div>
          </div>

          {/* Bunk Info Card */}
          {/* {bunk && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-blue-900 break-words">{bunk.bunk_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      bunk.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {bunk.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {bunk.address && (
                    <p className="text-blue-600 text-sm break-words">{bunk.address}</p>
                  )}
                  <p className="text-blue-500 text-xs mt-1">
                    Created: {new Date(bunk.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Payment Stats */}
          {/* {!isEditMode && bunk && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Fuel Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(paymentStats.totalExpenseAmount)}
                    </p>
                  </div>
                  <Fuel className="h-8 w-8 text-red-400" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments Made</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(paymentStats.totalPayments)}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Amount</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(paymentStats.pendingAmount)}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>
          )} */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
                {!isEditMode && bunk && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Pending amount: <span className="font-semibold">{formatCurrency(paymentStats.pendingAmount)}</span>
                    </p>
                    {/* <p className="text-xs text-gray-500">
                      Total fuel expenses: <span className="font-semibold">{formatCurrency(paymentStats.totalExpenseAmount)}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Total payments: <span className="font-semibold">{formatCurrency(paymentStats.totalPayments)}</span>
                    </p> */}
                  </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>
            </div>

            <input type="hidden" name="bunk_id" value={formData.bunk_id} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || (!isEditMode && paymentStats.pendingAmount <= 0)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <Save className="h-4 w-4" />
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
                  const targetBunkId = bunkId || formData.bunk_id;
                  navigate(`/bunks/${targetBunkId}/payments`);
                }}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none disabled:opacity-50"
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

export default BunkPaymentForm;