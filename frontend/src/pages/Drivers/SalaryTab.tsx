// // components/SalaryTab.tsx
// import React, { useState, useEffect } from "react";
// import { IndianRupee, Plus, TrendingUp, Clock, ArrowUp, ArrowDown, RefreshCw, AlertCircle } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import api from "../../api/client";

// interface Salary {
//   _id: string;
//   salary_number?: string;
//   advance_balance: number;
//   advance_transactions: Array<{
//     _id: string;
//     date: string;
//     type: 'given' | 'deducted';
//     amount: number;
//     notes: string;
//   }>;
//   bonus: Array<{
//     _id: string;
//     date: string;
//     amount: number;
//     reason: string;
//   }>;
//   amountpaid: Array<{
//     _id: string;
//     date: string;
//     amount: number;
//     payment_mode: string;
//     deducted_from_advance: boolean;
//     advance_deduction_amount: number;
//     cash_paid: number;
//     notes: string;
//   }>;
//   driver_id?: {
//     _id: string;
//     name: string;
//     phone: string;
//     salary_per_duty: number;
//   };
// }

// interface SalaryTabProps {
//   driverId: string;
//   salary: Salary | null;
//   onUpdate: () => void;
//   driverInfo?: {
//     name: string;
//     phone: string;
//     salary_per_duty: number;
//   };
// }

// const SalaryTab: React.FC<SalaryTabProps> = ({ driverId, salary, onUpdate, driverInfo }) => {
//   const navigate = useNavigate();
//   const [showAdvanceModal, setShowAdvanceModal] = useState(false);
//   const [showBonusModal, setShowBonusModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const [advanceForm, setAdvanceForm] = useState({ amount: '', notes: '' });
//   const [bonusForm, setBonusForm] = useState({ amount: '', reason: '' });
//   const [paymentForm, setPaymentForm] = useState({
//     amount: '',
//     payment_mode: 'cash',
//     deducted_from_advance: false,
//     advance_deduction_amount: '',
//     notes: ''
//   });

//   useEffect(() => {
//     if (salary === null) {
//       setError("No salary data available. Please try refreshing.");
//     } else {
//       setError(null);
//     }
//   }, [salary]);

//   const handleAddAdvance = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post(`/salary/advance/${driverId}`, {
//         amount: parseFloat(advanceForm.amount),
//         notes: advanceForm.notes
//       });
//       toast.success("Advance added successfully");
//       setShowAdvanceModal(false);
//       setAdvanceForm({ amount: '', notes: '' });
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to add advance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBonus = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post(`/salary/bonus/${driverId}`, {
//         amount: parseFloat(bonusForm.amount),
//         reason: bonusForm.reason
//       });
//       toast.success("Bonus added successfully");
//       setShowBonusModal(false);
//       setBonusForm({ amount: '', reason: '' });
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to add bonus");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMakePayment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post(`/salary/payment/${driverId}`, {
//         amount: parseFloat(paymentForm.amount),
//         payment_mode: paymentForm.payment_mode,
//         deducted_from_advance: paymentForm.deducted_from_advance,
//         advance_deduction_amount: paymentForm.deducted_from_advance ? parseFloat(paymentForm.advance_deduction_amount) : 0,
//         notes: paymentForm.notes
//       });
//       toast.success("Payment made successfully");
//       setShowPaymentModal(false);
//       setPaymentForm({
//         amount: '',
//         payment_mode: 'cash',
//         deducted_from_advance: false,
//         advance_deduction_amount: '',
//         notes: ''
//       });
//       onUpdate();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Failed to make payment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const calculateSalaryStats = () => {
//     if (!salary) return null;

//     const totalBonus = salary.bonus.reduce((sum, bonus) => sum + bonus.amount, 0);
//     const totalPaid = salary.amountpaid.reduce((sum, payment) => sum + payment.amount, 0);
//     const totalAdvanceGiven = salary.advance_transactions
//       .filter(t => t.type === 'given')
//       .reduce((sum, t) => sum + t.amount, 0);
//     const totalAdvanceDeducted = salary.advance_transactions
//       .filter(t => t.type === 'deducted')
//       .reduce((sum, t) => sum + t.amount, 0);

//     return {
//       totalBonus,
//       totalPaid,
//       totalAdvanceGiven,
//       totalAdvanceDeducted,
//       netEarnings: totalBonus + totalPaid
//     };
//   };

//   const salaryStats = calculateSalaryStats();

//   const handleRetry = () => {
//     setError(null);
//     onUpdate();
//   };

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Salary Data</h3>
//         <p className="text-gray-600 mb-6">{error}</p>
//         <button
//           onClick={handleRetry}
//           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!salary) {
//     return (
//       <div className="text-center py-12 text-gray-500">
//         <IndianRupee className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//         <p className="text-lg font-medium mb-2">No salary data available</p>
//         <p className="mb-6">Salary record will be created when you add the first transaction</p>
//         <button
//           onClick={handleRetry}
//           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Refresh
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Driver Salary Info */}
//       {driverInfo && (
//         <div className="bg-white rounded-xl border shadow-sm p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900">{driverInfo.name}</h3>
//               <p className="text-gray-600">{driverInfo.phone}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-600">Salary per Duty</p>
//               <p className="text-xl font-bold text-blue-600">{formatCurrency(driverInfo.salary_per_duty)}</p>
//             </div>
//           </div>
//           {salary.salary_number && (
//             <div className="mt-3 pt-3 border-t border-gray-200">
//               <p className="text-sm text-gray-600">
//                 Salary Account: <span className="font-medium text-gray-900">{salary.salary_number}</span>
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Salary Actions */}
//       <div className="bg-white rounded-xl border shadow-sm p-6">
//         <div className="flex flex-wrap gap-3">
//           <button
//             onClick={() => setShowAdvanceModal(true)}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Plus className="h-4 w-4" />
//             Add Advance
//           </button>
          
//           <button
//             onClick={() => setShowBonusModal(true)}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Plus className="h-4 w-4" />
//             Add Bonus
//           </button>
          
//           <button
//             onClick={() => setShowPaymentModal(true)}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <IndianRupee className="h-4 w-4" />
//             Make Payment
//           </button>

//           <button
//             onClick={onUpdate}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Salary Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl border shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-yellow-100 rounded-lg">
//               <IndianRupee className="h-6 w-6 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Advance Balance</p>
//               <p className="text-xl font-bold text-gray-900">
//                 {formatCurrency(salary.advance_balance)}
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-xl border shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <TrendingUp className="h-6 w-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Bonus</p>
//               <p className="text-xl font-bold text-gray-900">
//                 {formatCurrency(salaryStats?.totalBonus || 0)}
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-xl border shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <IndianRupee className="h-6 w-6 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Paid</p>
//               <p className="text-xl font-bold text-gray-900">
//                 {formatCurrency(salaryStats?.totalPaid || 0)}
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-xl border shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-purple-100 rounded-lg">
//               <Clock className="h-6 w-6 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Net Earnings</p>
//               <p className="text-xl font-bold text-gray-900">
//                 {formatCurrency(salaryStats?.netEarnings || 0)}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Salary Transactions */}
//       <div className="bg-white rounded-xl border shadow-sm p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
//           <div className="text-sm text-gray-600">
//             {salary.advance_transactions.length + salary.bonus.length + salary.amountpaid.length} total transactions
//           </div>
//         </div>
        
//         <div className="space-y-6">
//           {/* Advance Transactions */}
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-4">Advance Transactions ({salary.advance_transactions.length})</h4>
//             {salary.advance_transactions.length > 0 ? (
//               <div className="space-y-3">
//                 {salary.advance_transactions.map((transaction) => (
//                   <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-full ${
//                         transaction.type === 'given' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
//                       }`}>
//                         {transaction.type === 'given' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {transaction.type === 'given' ? 'Advance Given' : 'Advance Deducted'}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {new Date(transaction.date).toLocaleDateString()} • {transaction.notes}
//                         </p>
//                       </div>
//                     </div>
//                     <p className={`font-semibold text-lg ${
//                       transaction.type === 'given' ? 'text-red-600' : 'text-green-600'
//                     }`}>
//                       {transaction.type === 'given' ? '+' : '-'}{formatCurrency(transaction.amount)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                 <IndianRupee className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                 <p>No advance transactions</p>
//               </div>
//             )}
//           </div>

//           {/* Bonus Transactions */}
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-4">Bonus Payments ({salary.bonus.length})</h4>
//             {salary.bonus.length > 0 ? (
//               <div className="space-y-3">
//                 {salary.bonus.map((bonus) => (
//                   <div key={bonus._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-green-100 text-green-600 rounded-full">
//                         <TrendingUp className="h-4 w-4" />
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">Bonus Payment</p>
//                         <p className="text-sm text-gray-600">
//                           {new Date(bonus.date).toLocaleDateString()} • {bonus.reason}
//                         </p>
//                       </div>
//                     </div>
//                     <p className="font-semibold text-green-600 text-lg">
//                       +{formatCurrency(bonus.amount)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                 <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                 <p>No bonus payments</p>
//               </div>
//             )}
//           </div>

//           {/* Salary Payments */}
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-4">Salary Payments ({salary.amountpaid.length})</h4>
//             {salary.amountpaid.length > 0 ? (
//               <div className="space-y-3">
//                 {salary.amountpaid.map((payment) => (
//                   <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
//                         <IndianRupee className="h-4 w-4" />
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           Salary Payment ({payment.payment_mode})
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {new Date(payment.date).toLocaleDateString()} • {payment.notes}
//                           {payment.deducted_from_advance && (
//                             <span className="text-yellow-600 block">
//                               Advance deducted: {formatCurrency(payment.advance_deduction_amount)}
//                             </span>
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold text-blue-600 text-lg">
//                         +{formatCurrency(payment.amount)}
//                       </p>
//                       {payment.deducted_from_advance && (
//                         <p className="text-sm text-gray-500">
//                           Cash: {formatCurrency(payment.cash_paid)}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                 <IndianRupee className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                 <p>No salary payments</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals remain the same as your original code */}
//       {/* Add Advance Modal */}
//       <AnimatePresence>
//         {showAdvanceModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl shadow-xl max-w-md w-full"
//             >
//               <div className="p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Add Advance</h3>
//                 <form onSubmit={handleAddAdvance} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       required
//                       value={advanceForm.amount}
//                       onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
//                       className="input input-bordered w-full"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Notes
//                     </label>
//                     <textarea
//                       value={advanceForm.notes}
//                       onChange={(e) => setAdvanceForm(prev => ({ ...prev, notes: e.target.value }))}
//                       className="input input-bordered w-full"
//                       placeholder="Optional notes"
//                       rows={3}
//                     />
//                   </div>
//                   <div className="flex gap-3 pt-4">
//                     <button
//                       type="button"
//                       onClick={() => setShowAdvanceModal(false)}
//                       className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? 'Adding...' : 'Add Advance'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Add Bonus Modal */}
//       <AnimatePresence>
//         {showBonusModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl shadow-xl max-w-md w-full"
//             >
//               <div className="p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Add Bonus</h3>
//                 <form onSubmit={handleAddBonus} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       required
//                       value={bonusForm.amount}
//                       onChange={(e) => setBonusForm(prev => ({ ...prev, amount: e.target.value }))}
//                       className="input input-bordered w-full"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Reason
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={bonusForm.reason}
//                       onChange={(e) => setBonusForm(prev => ({ ...prev, reason: e.target.value }))}
//                       className="input input-bordered w-full"
//                       placeholder="Enter reason for bonus"
//                     />
//                   </div>
//                   <div className="flex gap-3 pt-4">
//                     <button
//                       type="button"
//                       onClick={() => setShowBonusModal(false)}
//                       className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? 'Adding...' : 'Add Bonus'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Make Payment Modal */}
//       <AnimatePresence>
//         {showPaymentModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-2xl shadow-xl max-w-md w-full"
//             >
//               <div className="p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Make Payment</h3>
//                 <form onSubmit={handleMakePayment} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       required
//                       value={paymentForm.amount}
//                       onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
//                       className="input input-bordered w-full"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Payment Mode
//                     </label>
//                     <select
//                       required
//                       value={paymentForm.payment_mode}
//                       onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_mode: e.target.value }))}
//                       className="input input-bordered w-full"
//                     >
//                       <option value="cash">Cash</option>
//                       <option value="bank_transfer">Bank Transfer</option>
//                       <option value="cheque">Cheque</option>
//                       <option value="upi">UPI</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={paymentForm.deducted_from_advance}
//                       onChange={(e) => setPaymentForm(prev => ({ ...prev, deducted_from_advance: e.target.checked }))}
//                       className="rounded"
//                     />
//                     <label className="text-sm text-gray-700">Deduct from advance</label>
//                   </div>
//                   {paymentForm.deducted_from_advance && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Advance Deduction Amount
//                       </label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         required
//                         value={paymentForm.advance_deduction_amount}
//                         onChange={(e) => setPaymentForm(prev => ({ ...prev, advance_deduction_amount: e.target.value }))}
//                         className="input input-bordered w-full"
//                         placeholder="Enter deduction amount"
//                         max={salary?.advance_balance}
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Available advance: {formatCurrency(salary?.advance_balance || 0)}
//                       </p>
//                     </div>
//                   )}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Notes
//                     </label>
//                     <textarea
//                       value={paymentForm.notes}
//                       onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
//                       className="input input-bordered w-full"
//                       placeholder="Optional notes"
//                       rows={3}
//                     />
//                   </div>
//                   <div className="flex gap-3 pt-4">
//                     <button
//                       type="button"
//                       onClick={() => setShowPaymentModal(false)}
//                       className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? 'Processing...' : 'Make Payment'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SalaryTab;


// components/SalaryTab.tsx
import React, { useState, useEffect } from "react";
import { IndianRupee, Plus, TrendingUp, Clock, ArrowUp, ArrowDown, RefreshCw, AlertCircle, Calculator, Calendar, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/client";

interface Salary {
  _id: string;
  salary_number?: string;
  advance_balance: number;
  advance_transactions: Array<{
    _id: string;
    date: string;
    type: 'given' | 'deducted';
    amount: number;
    notes: string;
  }>;
  bonus: Array<{
    _id: string;
    date: string;
    amount: number;
    reason: string;
  }>;
  amountpaid: Array<{
    _id: string;
    date: string;
    amount: number;
    payment_mode: string;
    deducted_from_advance: boolean;
    advance_deduction_amount: number;
    cash_paid: number;
    notes: string;
  }>;
}

interface Attendance {
  _id: string;
  date: string;
  status: 'fullduty' | 'halfduty' | 'doubleduty' | 'absent' | 'tripduty' | 'custom';
  salary_amount: number;
  lorry_id: {
    _id: string;
    registration_number: string;
    nick_name?: string;
  };
}

interface SalaryTabProps {
  driverId: string;
  salary: Salary | null;
  onUpdate: () => void;
  driverInfo?: {
    name: string;
    phone: string;
    salary_per_duty: number;
  };
}

const SalaryTab: React.FC<SalaryTabProps> = ({ driverId, salary, onUpdate, driverInfo }) => {
  const navigate = useNavigate();
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [period, setPeriod] = useState<'current_month' | 'last_month' | 'custom'>('current_month');
  const [customDateRange, setCustomDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  
  const [advanceForm, setAdvanceForm] = useState({ amount: '', notes: '' });
  const [bonusForm, setBonusForm] = useState({ amount: '', reason: '' });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_mode: 'cash',
    deducted_from_advance: false,
    advance_deduction_amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [driverId, period, customDateRange]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      let params = new URLSearchParams();
      
      if (period === 'current_month') {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        params.append('start_date', startDate.toISOString().split('T')[0]);
        params.append('end_date', endDate.toISOString().split('T')[0]);
      } else if (period === 'last_month') {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        params.append('start_date', startDate.toISOString().split('T')[0]);
        params.append('end_date', endDate.toISOString().split('T')[0]);
      } else if (period === 'custom' && customDateRange.start_date && customDateRange.end_date) {
        params.append('start_date', customDateRange.start_date);
        params.append('end_date', customDateRange.end_date);
      }

      const res = await api.get(`/attendance/driver/${driverId}?${params}`);
      setAttendanceData(res.data.data.attendance || []);
      setError(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch attendance data");
      setError("Failed to load salary information");
    } finally {
      setLoading(false);
    }
  };

  // Calculate salary information from attendance data
  const calculateSalaryInfo = () => {
    const totalEarned = attendanceData.reduce((sum, record) => sum + (record.salary_amount || 0), 0);
    
    // Calculate by status
    const statusBreakdown = attendanceData.reduce((acc, record) => {
      const status = record.status;
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count += 1;
      acc[status].amount += record.salary_amount || 0;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    // Calculate days worked (excluding absent days)
    const daysWorked = attendanceData.filter(record => record.status !== 'absent').length;
    const absentDays = attendanceData.filter(record => record.status === 'absent').length;

    return {
      totalEarned,
      statusBreakdown,
      daysWorked,
      absentDays,
      totalDays: attendanceData.length
    };
  };

  const salaryInfo = calculateSalaryInfo();

  const calculateSalaryStats = () => {
    if (!salary) return {
      totalBonus: 0,
      totalPaid: 0,
      totalAdvanceGiven: 0,
      totalAdvanceDeducted: 0,
      netEarnings: 0
    };

    const totalBonus = salary.bonus.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalPaid = salary.amountpaid.reduce((sum, payment) => sum + payment.amount, 0);
    const totalAdvanceGiven = salary.advance_transactions
      .filter(t => t.type === 'given')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalAdvanceDeducted = salary.advance_transactions
      .filter(t => t.type === 'deducted')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBonus,
      totalPaid,
      totalAdvanceGiven,
      totalAdvanceDeducted,
      netEarnings: totalBonus + totalPaid
    };
  };

  const salaryStats = calculateSalaryStats();

  // Calculate salary to be paid
  const calculateSalaryToBePaid = () => {
    const totalEarnedFromAttendance = salaryInfo.totalEarned;
    const totalBonus = salaryStats.totalBonus;
    const totalAlreadyPaid = salaryStats.totalPaid;
    const advanceBalance = salary?.advance_balance || 0;

    // Salary to be paid = (Earned from attendance + Bonus) - (Already paid + Advance balance)
    const totalEarnings = totalEarnedFromAttendance + totalBonus;
    const totalDeductions = totalAlreadyPaid + advanceBalance;
    const salaryToBePaid = totalEarnings - totalDeductions;

    return {
      totalEarnings,
      totalDeductions,
      salaryToBePaid: Math.max(0, salaryToBePaid), // Don't show negative
      hasPendingSalary: salaryToBePaid > 0
    };
  };

  const paymentInfo = calculateSalaryToBePaid();

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/salary/advance/${driverId}`, {
        amount: parseFloat(advanceForm.amount),
        notes: advanceForm.notes
      });
      toast.success("Advance added successfully");
      setShowAdvanceModal(false);
      setAdvanceForm({ amount: '', notes: '' });
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add advance");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/salary/bonus/${driverId}`, {
        amount: parseFloat(bonusForm.amount),
        reason: bonusForm.reason
      });
      toast.success("Bonus added successfully");
      setShowBonusModal(false);
      setBonusForm({ amount: '', reason: '' });
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add bonus");
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/salary/payment/${driverId}`, {
        amount: parseFloat(paymentForm.amount),
        payment_mode: paymentForm.payment_mode,
        deducted_from_advance: paymentForm.deducted_from_advance,
        advance_deduction_amount: paymentForm.deducted_from_advance ? parseFloat(paymentForm.advance_deduction_amount) : 0,
        notes: paymentForm.notes
      });
      toast.success("Payment made successfully");
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        payment_mode: 'cash',
        deducted_from_advance: false,
        advance_deduction_amount: '',
        notes: ''
      });
      onUpdate();
      fetchAttendanceData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to make payment");
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

  const handleRetry = () => {
    setError(null);
    onUpdate();
    fetchAttendanceData();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Salary Data</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="text-center py-12 text-gray-500">
        <IndianRupee className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">No salary data available</p>
        <p className="mb-6">Salary record will be created when you add the first transaction</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Salary Period</h3>
            <p className="text-sm text-gray-600">Select period for salary calculation</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Period</option>
            </select>

            {period === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.start_date}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={customDateRange.end_date}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <button
              onClick={fetchAttendanceData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Period Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected Period</p>
              <p className="font-semibold text-gray-900">{getPeriodLabel()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Attendance Days</p>
              <p className="font-semibold text-gray-900">
                {salaryInfo.daysWorked} worked • {salaryInfo.absentDays} absent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary to be Paid - Most Important Card */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Salary Summary</h3>
          <div className="text-sm text-gray-600">
            {getPeriodLabel()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Salary to be Paid */}
          <div className={`bg-gradient-to-br rounded-xl p-6 border ${
            paymentInfo.hasPendingSalary 
              ? 'from-green-50 to-green-100 border-green-200' 
              : 'from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                paymentInfo.hasPendingSalary ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Salary to be Paid</p>
                <p className={`text-2xl font-bold ${
                  paymentInfo.hasPendingSalary ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {formatCurrency(paymentInfo.salaryToBePaid)}
                </p>
                {paymentInfo.hasPendingSalary && (
                  <p className="text-xs text-green-600 mt-1">Pending Payment</p>
                )}
              </div>
            </div>
          </div>

          {/* Total Earned from Attendance */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Earned from Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salaryInfo.totalEarned)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {salaryInfo.daysWorked} days worked
                </p>
              </div>
            </div>
          </div>

          {/* Total Bonus */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-green-600">Total Bonus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salaryStats.totalBonus)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {salary?.bonus.length || 0} bonus entries
                </p>
              </div>
            </div>
          </div>

          {/* Advance Balance */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">Advance Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salary?.advance_balance || 0)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {salary?.advance_transactions.length || 0} transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Salary Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Earned from Attendance:</span>
                <span className="font-medium">{formatCurrency(salaryInfo.totalEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus Amount:</span>
                <span className="font-medium text-green-600">+{formatCurrency(salaryStats.totalBonus)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-medium">Total Earnings:</span>
                <span className="font-bold">{formatCurrency(paymentInfo.totalEarnings)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Already Paid:</span>
                <span className="font-medium text-red-600">-{formatCurrency(salaryStats.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Balance:</span>
                <span className="font-medium text-red-600">-{formatCurrency(salary?.advance_balance || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-medium">Total Deductions:</span>
                <span className="font-bold text-red-600">-{formatCurrency(paymentInfo.totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Actions */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAdvanceModal(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Advance
          </button>
          
          <button
            onClick={() => setShowBonusModal(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Bonus
          </button>
          
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={loading || paymentInfo.salaryToBePaid <= 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IndianRupee className="h-4 w-4" />
            Make Payment
          </button>

          <button
            onClick={() => {
              onUpdate();
              fetchAttendanceData();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Attendance Breakdown */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(salaryInfo.statusBreakdown).map(([status, data]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-900 capitalize">{status}</p>
              <p className="text-2xl font-bold text-blue-600">{data.count}</p>
              <p className="text-xs text-gray-600">{formatCurrency(data.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Transactions */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
          <div className="text-sm text-gray-600">
            {salary.advance_transactions.length + salary.bonus.length + salary.amountpaid.length} total transactions
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Advance Transactions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Advance Transactions ({salary.advance_transactions.length})</h4>
            {salary.advance_transactions.length > 0 ? (
              <div className="space-y-3">
                {salary.advance_transactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'given' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {transaction.type === 'given' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.type === 'given' ? 'Advance Given' : 'Advance Deducted'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.notes}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold text-lg ${
                      transaction.type === 'given' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'given' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <IndianRupee className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No advance transactions</p>
              </div>
            )}
          </div>

          {/* Bonus Transactions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Bonus Payments ({salary.bonus.length})</h4>
            {salary.bonus.length > 0 ? (
              <div className="space-y-3">
                {salary.bonus.map((bonus) => (
                  <div key={bonus._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-full">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Bonus Payment</p>
                        <p className="text-sm text-gray-600">
                          {new Date(bonus.date).toLocaleDateString()} • {bonus.reason}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600 text-lg">
                      +{formatCurrency(bonus.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No bonus payments</p>
              </div>
            )}
          </div>

          {/* Salary Payments */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Salary Payments ({salary.amountpaid.length})</h4>
            {salary.amountpaid.length > 0 ? (
              <div className="space-y-3">
                {salary.amountpaid.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <IndianRupee className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Salary Payment ({payment.payment_mode})
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.date).toLocaleDateString()} • {payment.notes}
                          {payment.deducted_from_advance && (
                            <span className="text-yellow-600 block">
                              Advance deducted: {formatCurrency(payment.advance_deduction_amount)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600 text-lg">
                        +{formatCurrency(payment.amount)}
                      </p>
                      {payment.deducted_from_advance && (
                        <p className="text-sm text-gray-500">
                          Cash: {formatCurrency(payment.cash_paid)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <IndianRupee className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No salary payments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Add Advance Modal */}
      <AnimatePresence>
        {showAdvanceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Advance</h3>
                <form onSubmit={handleAddAdvance} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={advanceForm.amount}
                      onChange={(e) => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={advanceForm.notes}
                      onChange={(e) => setAdvanceForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Optional notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanceModal(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Advance'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Bonus Modal */}
      <AnimatePresence>
        {showBonusModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Bonus</h3>
                <form onSubmit={handleAddBonus} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bonusForm.amount}
                      onChange={(e) => setBonusForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      required
                      value={bonusForm.reason}
                      onChange={(e) => setBonusForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Enter reason for bonus"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBonusModal(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Bonus'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Make Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Make Payment</h3>
                <form onSubmit={handleMakePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Enter amount"
                      max={paymentInfo.salaryToBePaid}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Available to pay: {formatCurrency(paymentInfo.salaryToBePaid)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      required
                      value={paymentForm.payment_mode}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                      className="input input-bordered w-full"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="upi">UPI</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={paymentForm.deducted_from_advance}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, deducted_from_advance: e.target.checked }))}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Deduct from advance</label>
                  </div>
                  {paymentForm.deducted_from_advance && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Deduction Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={paymentForm.advance_deduction_amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, advance_deduction_amount: e.target.value }))}
                        className="input input-bordered w-full"
                        placeholder="Enter deduction amount"
                        max={salary?.advance_balance}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available advance: {formatCurrency(salary?.advance_balance || 0)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="input input-bordered w-full"
                      placeholder="Optional notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Make Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalaryTab;