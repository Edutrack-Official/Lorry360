import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, CreditCard, Calendar, IndianRupee, Building } from 'lucide-react';
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

const CrusherPayments = () => {
  const { crusherId } = useParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
      cash: { color: "bg-green-100 text-green-800", icon: "💵", label: "Cash" },
      bank_transfer: { color: "bg-blue-100 text-blue-800", icon: "🏦", label: "Bank Transfer" },
      cheque: { color: "bg-purple-100 text-purple-800", icon: "📄", label: "Cheque" },
      upi: { color: "bg-orange-100 text-orange-800", icon: "📱", label: "UPI" },
      other: { color: "bg-gray-100 text-gray-800", icon: "💳", label: "Other" }
    };
    return config[mode as keyof typeof config] || config.other;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
        <Link
          to={`/crushers/${crusherId}/payments/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Payment
        </Link>
      </div>
      
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => {
            const config = getPaymentModeConfig(payment.payment_mode);
            return (
              <div 
                key={payment._id} 
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${config.color}`}>
                      <span className="text-lg">{config.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {payment.payment_number}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{formatDate(payment.payment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <CreditCard className="h-4 w-4 flex-shrink-0" />
                        <span className="capitalize">{config.label}</span>
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right min-w-[120px]">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-sm text-gray-500 capitalize mt-1">
                      {payment.payment_type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Start by recording your first payment to this crusher
          </p>
          <Link
            to={`/crushers/${crusherId}/payments/create`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Record First Payment
          </Link>
        </div>
      )}
    </div>
  );
};

export default CrusherPayments;