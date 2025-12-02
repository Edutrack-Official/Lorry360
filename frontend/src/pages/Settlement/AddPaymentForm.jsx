// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { X, DollarSign, Upload } from 'lucide-react';

// const AddPaymentForm = ({ settlement, user, onAddPayment, onClose }) => {
//   const [formData, setFormData] = useState({
//     amount: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     payment_mode: 'bank_transfer',
//     reference_number: '',
//     notes: '',
//     proof_document: ''
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (formData.amount > settlement.due_amount) {
//       toast.error('Payment amount cannot exceed due amount');
//       return;
//     }

//     try {
//       await onAddPayment(settlement._id, {
//         ...formData,
//         amount: parseFloat(formData.amount)
//       });
//       onClose();
//     } catch (error) {
//       // Error handled in parent
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         className="bg-white rounded-xl w-full max-w-md"
//       >
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
//             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Amount
//             </label>
//             <div className="relative">
//               <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="number"
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                 className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="0.00"
//                 min="0"
//                 max={settlement.due_amount}
//                 required
//               />
//             </div>
//             <p className="text-sm text-gray-500 mt-1">
//               Due amount: {formatCurrency(settlement.due_amount)}
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Date
//             </label>
//             <input
//               type="date"
//               value={formData.payment_date}
//               onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Mode
//             </label>
//             <select
//               value={formData.payment_mode}
//               onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             >
//               <option value="cash">Cash</option>
//               <option value="bank_transfer">Bank Transfer</option>
//               <option value="upi">UPI</option>
//               <option value="cheque">Cheque</option>
//               <option value="online">Online Payment</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Reference Number
//             </label>
//             <input
//               type="text"
//               value={formData.reference_number}
//               onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Transaction ID, Cheque number, etc."
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Notes (Optional)
//             </label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//               rows={2}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Any additional notes..."
//             />
//           </div>

//           <div className="flex gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Add Payment
//             </button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount || 0);
// };

// export default AddPaymentForm;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  IndianRupee, 
  Upload, 
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddPaymentForm = ({ settlement, user, onAddPayment, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'bank_transfer',
    reference_number: '',
    notes: '',
    proof_document: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Calculate due amount from settlement
    const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
    const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const dueAmount = settlement.net_amount - totalApproved;

    if (parseFloat(formData.amount) > dueAmount) {
      toast.error('Payment amount cannot exceed due amount');
      return;
    }

    try {
      await onAddPayment(settlement._id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      onClose();
    } catch (error) {
      // Error handled in parent
    }
  };

  // Calculate due amount
  const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
  const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const dueAmount = settlement.net_amount - totalApproved;

  const paymentModes = [
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'from-green-100 to-green-200' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'from-blue-100 to-blue-200' },
    { value: 'upi', label: 'UPI', icon: Smartphone, color: 'from-purple-100 to-purple-200' },
    { value: 'cheque', label: 'Cheque', icon: FileText, color: 'from-yellow-100 to-yellow-200' },
    { value: 'online', label: 'Online Payment', icon: CreditCard, color: 'from-indigo-100 to-indigo-200' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl w-full max-w-2xl my-4 mx-2 sm:mx-4 shadow-2xl z-50"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl">
                  <IndianRupee className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add Payment</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Record a new payment transaction</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Due Amount Alert */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-b-2 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-orange-900 font-bold">Outstanding Amount</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(dueAmount)}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                Payment Amount *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  max={dueAmount}
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Maximum payable: <span className="font-bold text-gray-700">{formatCurrency(dueAmount)}</span>
              </p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                required
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Payment Mode *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <label
                      key={mode.value}
                      className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.payment_mode === mode.value
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                          : 'border-gray-300 hover:border-blue-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_mode"
                        value={mode.value}
                        checked={formData.payment_mode === mode.value}
                        onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${mode.color}`}>
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <span className="font-semibold text-gray-900">{mode.label}</span>
                      {formData.payment_mode === mode.value && (
                        <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-blue-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                placeholder="Transaction ID, Cheque number, UTR, etc."
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Enter transaction reference for tracking purposes
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium resize-none"
                placeholder="Add any additional notes about this payment..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Add Payment
              </button>
            </div>
          </form>
        </motion.div>
    </div>
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default AddPaymentForm;