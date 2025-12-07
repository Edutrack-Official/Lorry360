// src/pages/partners/PartnerPaymentForm.tsx
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
  IndianRupee,
  Users
} from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface PaymentFormData {
  payment_type: string;
  collab_owner_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes: string;
}

interface Partner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  company_name: string;
  address?: string;
}

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  collab_payment_status: string;
  notes?: string;
  createdAt: string;
}

interface Trip {
  _id: string;
  trip_number: string;
  customer_amount: number;
  trip_date: string;
  status: string;
}

const PartnerPaymentForm = () => {
  const { partnerId, paymentId } = useParams<{ partnerId: string; paymentId?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!paymentId;
  
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_type: 'to_collab_owner',
    collab_owner_id: partnerId || '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    notes: ''
  });

  const [partner, setPartner] = useState<Partner | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [partnerTrips, setPartnerTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (partnerId || paymentId) {
        setLoading(true);
        try {
          // If in edit mode, fetch the payment data first
          if (isEditMode && paymentId) {
            try {
              const paymentRes = await api.get(`/payments/${paymentId}`);
              const paymentData = paymentRes.data.data;
              
              setFormData({
                payment_type: paymentData.payment_type || 'to_collab_owner',
                collab_owner_id: paymentData.collab_owner_id || '',
                amount: paymentData.amount || 0,
                payment_date: paymentData.payment_date ? 
                  new Date(paymentData.payment_date).toISOString().split('T')[0] : 
                  new Date().toISOString().split('T')[0],
                payment_mode: paymentData.payment_mode || 'cash',
                notes: paymentData.notes || ''
              });

              const targetPartnerId = partnerId || paymentData.collab_owner_id;
              if (targetPartnerId) {
                await fetchPartnerData(targetPartnerId);
              }
            } catch (error: any) {
              console.error('Failed to fetch payment:', error);
              toast.error('Failed to fetch payment details');
              navigate('/partners');
            }
          } else if (partnerId) {
            await fetchPartnerData(partnerId);
          }

          // Fetch existing payments for stats (only for create mode)
          if (!isEditMode && partnerId) {
            const paymentsRes = await api.get('/payments', {
              params: {
                payment_type: 'to_collab_owner',
                collab_owner_id: partnerId
              }
            });
            setPayments(paymentsRes.data.data?.payments || []);
          }

          // Fetch trips for stats
          if (partnerId) {
            const [myTripsRes, partnerTripsRes] = await Promise.all([
              api.get('/trips', {
                params: {
                  trip_type: 'collaborative',
                  collab_owner_id: partnerId,
                  fetch_mode: 'as_owner'
                }
              }),
              api.get('/trips', {
                params: {
                  trip_type: 'collaborative',
                  collab_owner_id: partnerId,
                  fetch_mode: 'as_collaborator'
                }
              })
            ]);
            
            setMyTrips(myTripsRes.data.data?.trips || []);
            setPartnerTrips(partnerTripsRes.data.data?.trips || []);
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
  }, [partnerId, paymentId, isEditMode, navigate]);

  const fetchPartnerData = async (targetPartnerId: string) => {
    const collabRes = await api.get('/collaborations/active');
    const collaborations = collabRes.data.data?.collaborations || [];
    
    const collaboration = collaborations.find((c: any) => 
      c.from_owner_id._id === targetPartnerId || c.to_owner_id._id === targetPartnerId
    );
    
    if (collaboration) {
      const partnerData = collaboration.from_owner_id._id === targetPartnerId 
        ? collaboration.from_owner_id 
        : collaboration.to_owner_id;
      setPartner(partnerData);
    } else {
      throw new Error('Partner not found');
    }
  };

  const calculatePaymentStats = () => {
    const totalMyTripsAmount = myTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const totalPartnerTripsAmount = partnerTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
    const netTripAmount = totalPartnerTripsAmount - totalMyTripsAmount;
    
    const totalPayments = payments
      .filter(p => p.collab_payment_status === 'approved')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const pendingAmount = Math.max(0, netTripAmount - totalPayments);

    return {
      netTripAmount,
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

    if (!formData.collab_owner_id || formData.collab_owner_id.trim() === '') {
      newErrors.collab_owner_id = "Partner is required";
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
        collab_owner_id: partnerId || formData.collab_owner_id,
        payment_type: 'to_collab_owner',
        amount: parseFloat(formData.amount.toString()),
        collab_payment_status: 'pending'
      };

      if (isEditMode && paymentId) {
        await api.put(`/payments/update/${paymentId}`, submissionData);
        toast.success("Payment updated successfully");
      } else {
        await api.post("/payments/create", submissionData);
        toast.success("Payment recorded successfully. Waiting for partner approval.");
      }
      
      const targetPartnerId = partnerId || formData.collab_owner_id;
      navigate(`/partners/collaboration/${targetPartnerId}`);
      
    } catch (error: any) {
      console.error('Payment submission error:', error);
      let errorMessage = error.response?.data?.error || 
        (isEditMode ? "Failed to update payment" : "Failed to record payment");
      
      if (errorMessage.includes('collab_owner_id') && errorMessage.includes('required')) {
        errorMessage = "Partner information is missing. Please refresh the page and try again.";
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">
            {isEditMode ? 'Loading payment details...' : 'Loading partner details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!partner && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Partner Not Found</h3>
          <p className="text-sm text-gray-600 mb-4">Unable to load partner information</p>
          <button
            onClick={() => navigate('/partners')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Back to Collaborations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start gap-3 mb-3">
            <button
              onClick={() => {
                const targetPartnerId = partnerId || formData.collab_owner_id;
                navigate(-1);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Back to collaboration"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Edit Payment' : 'Partner Payment'}
              </h1>
              <p className="text-sm text-gray-600 truncate">
                {isEditMode 
                  ? `Edit payment for ${partner?.name || 'Partner'}`
                  : `Record payment to ${partner?.name || 'Partner'}`}
              </p>
            </div>
          </div>

          {/* Partner Info Card */}
          {partner && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-blue-900 break-words">{partner.name}</h3>
                  <p className="text-blue-700 text-sm break-words">{partner.company_name}</p>
                  <p className="text-blue-600 text-sm break-words">{partner.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {isEditMode ? 'Edit Payment' : 'Payment Details'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
              )}
              {!isEditMode && partner && (
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {paymentModes.map((mode) => {
                  const IconComponent = mode.Icon;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode.value }))}
                      className={`p-2.5 rounded-lg border transition-all ${
                        formData.payment_mode === mode.value
                          ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs font-medium">{mode.label}</span>
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
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                placeholder="Additional notes about this payment..."
              />
            </div>

            {/* Info Alert */}
            {!isEditMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Payment Approval Required</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This payment will be pending until {partner?.name} approves it.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <input type="hidden" name="collab_owner_id" value={formData.collab_owner_id} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || (!isEditMode && paymentStats.pendingAmount <= 0)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none text-sm font-medium"
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
                  const targetPartnerId = partnerId || formData.collab_owner_id;
                  navigate(`/partners/collaboration/${targetPartnerId}`);
                }}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none disabled:opacity-50 text-sm font-medium"
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

export default PartnerPaymentForm;