import React, { useState } from 'react';
import { X, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';

const CollabTransactionForm = ({ collaboration, currentUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  // Get the partner owner (the other user)
  const getPartnerOwner = () => {
    return collaboration.from_owner_id._id === currentUser.userId 
      ? collaboration.to_owner_id 
      : collaboration.from_owner_id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const partner = getPartnerOwner();
      
      // Always: Partner is from_owner (needs to pay), Current user is to_owner (will receive)
      await api.post('/collab-transactions/create', {
        collaboration_id: collaboration._id,
        from_owner_id:currentUser.userId ,  // Partner needs to pay
        to_owner_id:partner._id,  // I will receive
        amount: parseFloat(formData.amount),
        type: 'need_payment',  // Partner needs to pay me
        note: formData.note,
        date: formData.date
      });

      toast.success('Transaction created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPartnerName = () => {
    const partner = getPartnerOwner();
    return partner.name;
  };

  const getPartnerCompany = () => {
    const partner = getPartnerOwner();
    return partner.company_name;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Request Payment</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Collaboration Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Requesting payment from</p>
              <p className="text-lg font-semibold text-gray-900">{getPartnerName()}</p>
              <p className="text-sm text-gray-600">{getPartnerCompany()}</p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Owed *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="input input-bordered pl-9 w-full"
                  placeholder="Enter amount owed to you"
                />
              </div>
              {formData.amount && (
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Payment (Optional)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="Describe why this payment is owed..."
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Request Payment'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CollabTransactionForm;