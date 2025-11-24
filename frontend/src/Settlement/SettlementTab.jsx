// import React, { useState, useEffect } from 'react';
// import { 
//   Plus, 
//   ArrowUpRight, 
//   ArrowDownLeft, 
//   CheckCircle, 
//   DollarSign,
//   MoreVertical,
//   X,
//   Users,
//   Calendar,
//   FileText,
//   TrendingUp,
//   Clock,
//   CheckCircle2,
//   AlertCircle
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import api from '../api/client';
// import { useAuth } from '../contexts/AuthContext';
// import CreateSettlementForm from './CreateSettlementForm';
// import AddPaymentForm from './AddPaymentForm';

// // Helper functions - moved outside the component
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount || 0);
// };

// const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// };

// const getStatusConfig = (status) => {
//   const config = {
//     pending: { 
//       color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
//       label: 'Pending',
//       icon: <Clock className="h-4 w-4" />
//     },
//     partially_paid: { 
//       color: 'bg-blue-100 text-blue-800 border-blue-200', 
//       label: 'Partially Paid',
//       icon: <TrendingUp className="h-4 w-4" />
//     },
//     completed: { 
//       color: 'bg-green-100 text-green-800 border-green-200', 
//       label: 'Completed',
//       icon: <CheckCircle2 className="h-4 w-4" />
//     },
//     cancelled: { 
//       color: 'bg-red-100 text-red-800 border-red-200', 
//       label: 'Cancelled',
//       icon: <X className="h-4 w-4" />
//     }
//   };
//   return config[status] || config.pending;
// };

// const getPaymentStatusConfig = (status) => {
//   const config = {
//     pending: { 
//       color: 'bg-yellow-100 text-yellow-800', 
//       label: 'Pending Review'
//     },
//     approved: { 
//       color: 'bg-green-100 text-green-800', 
//       label: 'Approved'
//     },
//     rejected: { 
//       color: 'bg-red-100 text-red-800', 
//       label: 'Rejected'
//     },
//     cancelled: { 
//       color: 'bg-gray-100 text-gray-800', 
//       label: 'Cancelled'
//     }
//   };
//   return config[status] || config.pending;
// };

// // Settlement Card Component
// const SettlementCard = ({ settlement, user, onViewDetails, onAddPayment }) => {
//   const getUserRoleInSettlement = (settlement) => {
//     if (settlement.owner_A_id._id === user.userId) return 'owner_A';
//     if (settlement.owner_B_id._id === user.userId) return 'owner_B';
//     return null;
//   };

//   const isUserPayable = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     return settlement.amount_breakdown.net_payable_by === userRole;
//   };

//   const getPartnerName = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
//     return partner.name;
//   };

//   const statusConfig = getStatusConfig(settlement.status);
//   const userRole = getUserRoleInSettlement(settlement);
//   const isPayable = isUserPayable(settlement);
//   const partnerName = getPartnerName(settlement);

//   return (
//     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className={`p-2 rounded-lg ${
//             isPayable ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
//           }`}>
//             {isPayable ? (
//               <ArrowUpRight className="h-4 w-4" />
//             ) : (
//               <ArrowDownLeft className="h-4 w-4" />
//             )}
//           </div>
//           <div>
//             <h4 className="font-semibold text-gray-900">{partnerName}</h4>
//             <p className="text-sm text-gray-600">
//               {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
//             {statusConfig.icon}
//             {statusConfig.label}
//           </span>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//         <div>
//           <p className="text-sm text-gray-600">Net Amount</p>
//           <p className="font-semibold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-600">Paid</p>
//           <p className="font-semibold text-green-600">{formatCurrency(settlement.paid_amount)}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-600">Due</p>
//           <p className="font-semibold text-orange-600">{formatCurrency(settlement.due_amount)}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-600">Trips</p>
//           <p className="font-semibold text-gray-900">{settlement.trip_ids.length}</p>
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-gray-600">
//           {isPayable ? `You owe ${formatCurrency(settlement.due_amount)}` : `Owes you ${formatCurrency(settlement.due_amount)}`}
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onViewDetails}
//             className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             View Details
//           </button>
//           {isPayable && settlement.due_amount > 0 && (
//             <button
//               onClick={onAddPayment}
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Add Payment
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Payment Card Component
// const PaymentCard = ({ payment, paymentIndex, settlementId, user, onApprove, onReject }) => {
//   const [showActions, setShowActions] = useState(false);
//   const statusConfig = getPaymentStatusConfig(payment.status);
//   const isFromMe = payment.paid_by._id === user.userId;
//   const isToMe = payment.paid_to._id === user.userId;

//   const canApprove = isToMe && payment.status === 'pending';
//   const canReject = isToMe && payment.status === 'pending';

//   return (
//     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//       <div className="flex items-center gap-4 flex-1">
//         <div className={`p-2 rounded ${
//           isFromMe ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
//         }`}>
//           {isFromMe ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
//         </div>
        
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
//             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
//               {statusConfig.label}
//             </span>
//           </div>
//           <p className="text-sm text-gray-600">
//             {isFromMe ? 'You paid' : `${payment.paid_by.name} paid`} via {payment.payment_mode}
//           </p>
//           {payment.reference_number && (
//             <p className="text-sm text-gray-500">Ref: {payment.reference_number}</p>
//           )}
//           {payment.notes && (
//             <p className="text-sm text-gray-500">{payment.notes}</p>
//           )}
//           <p className="text-xs text-gray-400">
//             {formatDate(payment.payment_date)}
//             {payment.approved_at && ` • Approved on ${formatDate(payment.approved_at)}`}
//           </p>
//         </div>
//       </div>

//       {/* Actions */}
//       {(canApprove || canReject) && (
//         <div className="relative">
//           <button
//             onClick={() => setShowActions(!showActions)}
//             className="p-2 hover:bg-gray-200 rounded transition-colors"
//           >
//             <MoreVertical className="h-4 w-4 text-gray-400" />
//           </button>

//           {showActions && (
//             <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
//               {canApprove && (
//                 <button
//                   onClick={() => {
//                     onApprove(settlementId, paymentIndex);
//                     setShowActions(false);
//                   }}
//                   className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
//                 >
//                   <CheckCircle className="h-4 w-4" />
//                   Approve
//                 </button>
//               )}
//               {canReject && (
//                 <button
//                   onClick={() => {
//                     const reason = prompt('Reason for rejection:');
//                     if (reason) onReject(settlementId, paymentIndex, reason);
//                     setShowActions(false);
//                   }}
//                   className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                 >
//                   <X className="h-4 w-4" />
//                   Reject
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Settlement Details Component
// const SettlementDetails = ({ settlementData, user, onApprovePayment, onRejectPayment, onAddPayment }) => {
//   const getUserRoleInSettlement = (settlement) => {
//     if (settlement.owner_A_id._id === user.userId) return 'owner_A';
//     if (settlement.owner_B_id._id === user.userId) return 'owner_B';
//     return null;
//   };

//   const isUserPayable = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     return settlement.amount_breakdown.net_payable_by === userRole;
//   };

//   const getPartnerName = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
//     return partner.name;
//   };

//   const { settlement, payment_summary } = settlementData;
//   const statusConfig = getStatusConfig(settlement.status);
//   const userRole = getUserRoleInSettlement(settlement);
//   const isPayable = isUserPayable(settlement);
//   const partnerName = getPartnerName(settlement);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h4 className="text-xl font-bold text-gray-900">Settlement with {partnerName}</h4>
//             <p className="text-gray-600">
//               {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
//             </p>
//           </div>
//           <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
//             {statusConfig.icon}
//             {statusConfig.label}
//           </span>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-4 bg-gray-50 rounded-lg">
//             <p className="text-sm text-gray-600">Net Amount</p>
//             <p className="text-2xl font-bold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
//           </div>
//           <div className="text-center p-4 bg-green-50 rounded-lg">
//             <p className="text-sm text-green-600">Approved Payments</p>
//             <p className="text-2xl font-bold text-green-600">{formatCurrency(payment_summary.total_approved)}</p>
//           </div>
//           <div className="text-center p-4 bg-yellow-50 rounded-lg">
//             <p className="text-sm text-yellow-600">Pending Payments</p>
//             <p className="text-2xl font-bold text-yellow-600">{formatCurrency(payment_summary.total_pending)}</p>
//           </div>
//           <div className="text-center p-4 bg-orange-50 rounded-lg">
//             <p className="text-sm text-orange-600">Remaining Due</p>
//             <p className="text-2xl font-bold text-orange-600">{formatCurrency(payment_summary.remaining_due)}</p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         {isPayable && settlement.due_amount > 0 && (
//           <div className="mt-4 flex justify-end">
//             <button
//               onClick={onAddPayment}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//             >
//               <Plus className="h-4 w-4" />
//               Add Payment
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Trip Breakdown */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <h5 className="text-lg font-semibold text-gray-900 mb-4">Trip Breakdown</h5>
//         <div className="space-y-3">
//           {settlement.trip_breakdown.map((trip, index) => (
//             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <div className={`p-2 rounded ${
//                   trip.direction === 'a_to_b' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
//                 }`}>
//                   {trip.direction === 'a_to_b' ? 'A→B' : 'B→A'}
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">{trip.trip_number}</p>
//                   <p className="text-sm text-gray-600">
//                     {trip.material_name} • {trip.location}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="font-semibold text-gray-900">{formatCurrency(trip.amount)}</p>
//                 <p className="text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Payment History */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <h5 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h5>
//         {settlement.payments.length > 0 ? (
//           <div className="space-y-3">
//             {settlement.payments.map((payment, index) => (
//               <PaymentCard
//                 key={index}
//                 payment={payment}
//                 paymentIndex={index}
//                 user={user}
//                 settlementId={settlement._id}
//                 onApprove={onApprovePayment}
//                 onReject={onRejectPayment}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8 text-gray-500">
//             <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//             <p>No payments yet</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Main SettlementTab Component
// const SettlementTab = () => {
//   const { user } = useAuth();
//   const [collaborativePartners, setCollaborativePartners] = useState([]);
//   const [settlements, setSettlements] = useState([]);
//   const [settlementStats, setSettlementStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [showPaymentForm, setShowPaymentForm] = useState(false);
//   const [selectedPartner, setSelectedPartner] = useState(null);
//   const [selectedSettlement, setSelectedSettlement] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'settlements', 'partners'

//   useEffect(() => {
//     if (user) {
//       fetchData();
//     }
//   }, [user]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch all data in parallel
//       const [partnersRes, settlementsRes, statsRes] = await Promise.all([
//         api.get('/settlements/partners'),
//         api.get('/settlements'),
//         api.get('/settlements/stats/month')
//       ]);

//       setCollaborativePartners(partnersRes.data.data || []);
//       setSettlements(settlementsRes.data.data?.settlements || []);
//       setSettlementStats(statsRes.data.data || {});

//     } catch (error) {
//       console.error('Failed to fetch settlement data', error);
//       toast.error(error.response?.data?.error || 'Failed to fetch settlement data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateNetSettlement = async (partnerId, fromDate, toDate) => {
//     try {
//       const res = await api.post('/settlements/calculate', {
//         owner_B_id: partnerId,
//         from_date: fromDate,
//         to_date: toDate
//       });
//       return res.data.data;
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to calculate settlement');
//       throw error;
//     }
//   };

//   const createSettlement = async (settlementData) => {
//     try {
//       await api.post('/settlements/create', settlementData);
//       toast.success('Settlement created successfully');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to create settlement');
//       throw error;
//     }
//   };

//   const addPayment = async (settlementId, paymentData) => {
//     try {
//       await api.post(`/settlements/${settlementId}/payments`, paymentData);
//       toast.success('Payment added successfully');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to add payment');
//       throw error;
//     }
//   };

//   const approvePayment = async (settlementId, paymentIndex) => {
//     try {
//       await api.patch(`/settlements/${settlementId}/payments/${paymentIndex}/approve`, {});
//       toast.success('Payment approved successfully');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to approve payment');
//     }
//   };

//   const rejectPayment = async (settlementId, paymentIndex, rejectionReason) => {
//     try {
//       await api.patch(`/settlements/${settlementId}/payments/${paymentIndex}/reject`, {
//         rejection_reason: rejectionReason
//       });
//       toast.success('Payment rejected');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to reject payment');
//     }
//   };

//   const getSettlementById = async (settlementId) => {
//     try {
//       const res = await api.get(`/settlements/${settlementId}`);
//       return res.data.data;
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to fetch settlement details');
//       throw error;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Settlement Management</h2>
//           <p className="text-gray-600">Manage payments and settlements with your collaborators</p>
//         </div>
//         <button
//           onClick={() => setShowCreateForm(true)}
//           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
//         >
//           <Plus className="h-4 w-4" />
//           Create Settlement
//         </button>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8">
//           {['overview', 'settlements', 'partners'].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
//                 activeTab === tab
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Overview Tab */}
//       {activeTab === 'overview' && (
//         <div className="space-y-6">
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Settlements</p>
//                   <p className="text-2xl font-bold text-gray-900">{settlementStats.total_settlements || 0}</p>
//                 </div>
//                 <div className="p-3 bg-blue-100 rounded-lg">
//                   <FileText className="h-6 w-6 text-blue-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {settlementStats.completed_settlements || 0} completed
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Amount</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {formatCurrency(settlementStats.total_amount)}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-lg">
//                   <DollarSign className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {formatCurrency(settlementStats.total_paid)} paid
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Pending Amount</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {formatCurrency(settlementStats.total_due)}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-yellow-100 rounded-lg">
//                   <Clock className="h-6 w-6 text-yellow-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {settlementStats.pending_settlements || 0} pending settlements
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Completion Rate</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {Math.round(settlementStats.completion_rate || 0)}%
//                   </p>
//                 </div>
//                 <div className="p-3 bg-purple-100 rounded-lg">
//                   <TrendingUp className="h-6 w-6 text-purple-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 Settlement efficiency
//               </p>
//             </div>
//           </div>

//           {/* Recent Settlements */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Recent Settlements</h3>
//             </div>
//             <div className="p-6">
//               {settlements.length > 0 ? (
//                 <div className="space-y-4">
//                   {settlements.slice(0, 5).map((settlement) => (
//                     <SettlementCard
//                       key={settlement._id}
//                       settlement={settlement}
//                       user={user}
//                       onViewDetails={async () => {
//                         const details = await getSettlementById(settlement._id);
//                         setSelectedSettlement(details);
//                         setActiveTab('settlements');
//                       }}
//                       onAddPayment={() => {
//                         setSelectedSettlement({ settlement: settlement });
//                         setShowPaymentForm(true);
//                       }}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500">
//                   <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                   <h4 className="text-lg font-semibold text-gray-900 mb-2">No Settlements Yet</h4>
//                   <p className="mb-4">Create your first settlement to get started</p>
//                   <button
//                     onClick={() => setShowCreateForm(true)}
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Create Settlement
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Settlements Tab */}
//       {activeTab === 'settlements' && (
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               {selectedSettlement ? 'Settlement Details' : 'All Settlements'}
//             </h3>
//             {selectedSettlement && (
//               <button
//                 onClick={() => setSelectedSettlement(null)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ← Back to all settlements
//               </button>
//             )}
//           </div>

//           {selectedSettlement ? (
//             <SettlementDetails 
//               settlementData={selectedSettlement}
//               user={user}
//               onApprovePayment={approvePayment}
//               onRejectPayment={rejectPayment}
//               onAddPayment={() => setShowPaymentForm(true)}
//             />
//           ) : (
//             <div className="space-y-4">
//               {settlements.length > 0 ? (
//                 settlements.map((settlement) => (
//                   <SettlementCard
//                     key={settlement._id}
//                     settlement={settlement}
//                     user={user}
//                     onViewDetails={async () => {
//                       const details = await getSettlementById(settlement._id);
//                       setSelectedSettlement(details);
//                     }}
//                     onAddPayment={() => {
//                       setSelectedSettlement({ settlement: settlement });
//                       setShowPaymentForm(true);
//                     }}
//                   />
//                 ))
//               ) : (
//                 <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
//                   <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                   <h4 className="text-lg font-semibold text-gray-900 mb-2">No Settlements Found</h4>
//                   <p className="mb-4">Create your first settlement to start managing payments</p>
//                   <button
//                     onClick={() => setShowCreateForm(true)}
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Create Settlement
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Partners Tab */}
//       {activeTab === 'partners' && (
//         <div className="space-y-6">
//           <h3 className="text-lg font-semibold text-gray-900">Collaborative Partners</h3>
          
//           {collaborativePartners.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {collaborativePartners.map((partner) => (
//                 <div
//                   key={partner._id}
//                   className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//                 >
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="p-3 bg-blue-100 rounded-lg">
//                       <Users className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">{partner.name}</h4>
//                       <p className="text-sm text-gray-600">{partner.company_name}</p>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-2 text-sm text-gray-600">
//                     {partner.phone && (
//                       <p>📞 {partner.phone}</p>
//                     )}
//                     {partner.email && (
//                       <p>✉️ {partner.email}</p>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => {
//                       setSelectedPartner(partner);
//                       setShowCreateForm(true);
//                     }}
//                     className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//                   >
//                     <Plus className="h-4 w-4" />
//                     Create Settlement
//                   </button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
//               <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//               <h4 className="text-lg font-semibold text-gray-900 mb-2">No Collaborative Partners</h4>
//               <p>You need active collaborations to create settlements</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Modals */}
//       <AnimatePresence>
//         {showCreateForm && (
//           <CreateSettlementForm
//             partners={collaborativePartners}
//             onCalculate={calculateNetSettlement}
//             onCreate={createSettlement}
//             onClose={() => {
//               setShowCreateForm(false);
//               setSelectedPartner(null);
//             }}
//             initialPartner={selectedPartner}
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showPaymentForm && selectedSettlement && (
//           <AddPaymentForm
//             settlement={selectedSettlement.settlement}
//             user={user}
//             onAddPayment={addPayment}
//             onClose={() => {
//               setShowPaymentForm(false);
//               setSelectedSettlement(null);
//             }}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SettlementTab;


import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  DollarSign,
  MoreVertical,
  X,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import CreateSettlementForm from './CreateSettlementForm';
import AddPaymentForm from './AddPaymentForm';

// Helper functions - moved outside the component
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusConfig = (status) => {
  const config = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />
    },
    partially_paid: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      label: 'Partially Paid',
      icon: <TrendingUp className="h-4 w-4" />
    },
    completed: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      label: 'Completed',
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      label: 'Cancelled',
      icon: <X className="h-4 w-4" />
    }
  };
  return config[status] || config.pending;
};

const getPaymentStatusConfig = (status) => {
  const config = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      label: 'Pending Review'
    },
    approved: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Approved'
    },
    rejected: { 
      color: 'bg-red-100 text-red-800', 
      label: 'Rejected'
    },
    cancelled: { 
      color: 'bg-gray-100 text-gray-800', 
      label: 'Cancelled'
    }
  };
  return config[status] || config.pending;
};

// Settlement Card Component
const SettlementCard = ({ settlement, user, onViewDetails, onAddPayment }) => {
  const getUserRoleInSettlement = (settlement) => {
    if (settlement.owner_A_id._id === user.id) return 'owner_A';
    if (settlement.owner_B_id._id === user.id) return 'owner_B';
    return null;
  };

  const isUserPayable = (settlement) => {
    const userRole = getUserRoleInSettlement(settlement);
    return settlement.amount_breakdown.net_payable_by === userRole;
  };

  const getPartnerName = (settlement) => {
    const userRole = getUserRoleInSettlement(settlement);
    const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
    return partner.name;
  };

  const getPartnerCompany = (settlement) => {
    const userRole = getUserRoleInSettlement(settlement);
    const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
    return partner.company_name;
  };

  const statusConfig = getStatusConfig(settlement.status);
  const userRole = getUserRoleInSettlement(settlement);
  const isPayable = isUserPayable(settlement);
  const partnerName = getPartnerName(settlement);
  const partnerCompany = getPartnerCompany(settlement);

  // Calculate payment summary
  const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
  const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingDue = settlement.net_amount - totalApproved;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isPayable ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
          }`}>
            {isPayable ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownLeft className="h-4 w-4" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{partnerName}</h4>
            <p className="text-sm text-gray-600">{partnerCompany}</p>
            <p className="text-xs text-gray-500">
              {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Net Amount</p>
          <p className="font-semibold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Approved</p>
          <p className="font-semibold text-green-600">{formatCurrency(totalApproved)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Due</p>
          <p className="font-semibold text-orange-600">{formatCurrency(remainingDue)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Trips</p>
          <p className="font-semibold text-gray-900">{settlement.trip_ids?.length || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isPayable ? `You owe ${formatCurrency(remainingDue)}` : `Owes you ${formatCurrency(remainingDue)}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          {isPayable && remainingDue > 0 && (
            <button
              onClick={onAddPayment}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Card Component
const PaymentCard = ({ payment, paymentIndex, settlementId, user, onApprove, onReject }) => {
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getPaymentStatusConfig(payment.status);
  const isFromMe = payment.paid_by._id === user.userId;
  const isToMe = payment.paid_to._id === user.userId;

  const canApprove = isToMe && payment.status === 'pending';
  const canReject = isToMe && payment.status === 'pending';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-2 rounded ${
          isFromMe ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {isFromMe ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {isFromMe ? 'You paid' : `${payment.paid_by.name} paid`} via {payment.payment_mode}
          </p>
          {payment.reference_number && (
            <p className="text-sm text-gray-500">Ref: {payment.reference_number}</p>
          )}
          {payment.notes && (
            <p className="text-sm text-gray-500">{payment.notes}</p>
          )}
          <p className="text-xs text-gray-400">
            {formatDate(payment.payment_date)}
            {payment.approved_at && ` • Approved on ${formatDate(payment.approved_at)}`}
            {payment.rejection_reason && ` • Rejected: ${payment.rejection_reason}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      {(canApprove || canReject) && (
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              {canApprove && (
                <button
                  onClick={() => {
                    onApprove(settlementId, paymentIndex);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              )}
              {canReject && (
                <button
                  onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) onReject(settlementId, paymentIndex, reason);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Settlement Details Component
const SettlementDetails = ({ settlementData, user, onApprovePayment, onRejectPayment, onAddPayment }) => {
  const getUserRoleInSettlement = (settlement) => {
console.log("settlement", settlement);

    if (settlement.owner_A_id._id === user.id) return 'owner_A';
    if (settlement.owner_B_id._id === user.id) return 'owner_B';
    return null;
  };

  const isUserPayable = (settlement) => {
    const userRole = getUserRoleInSettlement(settlement);
    return settlement.amount_breakdown.net_payable_by === userRole;
  };

  const getPartnerName = (settlement) => {
    const userRole = getUserRoleInSettlement(settlement);
    const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
    return partner.name;
  };

  const getPartnerCompany = (settlement) => {
    const userRole = getUserRoleInSettlement(settlement);
    const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
    return partner.company_name;
  };

  const settlement = settlementData;
  const statusConfig = getStatusConfig(settlement.status);
  const userRole = getUserRoleInSettlement(settlement);
  const isPayable = isUserPayable(settlement);
  const partnerName = getPartnerName(settlement);
  const partnerCompany = getPartnerCompany(settlement);

  // Calculate payment summary
  const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
  const pendingPayments = settlement.payments?.filter(p => p.status === 'pending') || [];
  const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingDue = settlement.net_amount - totalApproved;

  // Calculate trip amounts by direction
  const aToBTrips = settlement.trip_breakdown?.filter(trip => trip.direction === 'a_to_b') || [];
  const bToATrips = settlement.trip_breakdown?.filter(trip => trip.direction === 'b_to_a') || [];
  const aToBAmount = aToBTrips.reduce((sum, trip) => sum + trip.amount, 0);
  const bToAAmount = bToATrips.reduce((sum, trip) => sum + trip.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-gray-900">Settlement with {partnerName}</h4>
            <p className="text-gray-600">{partnerCompany}</p>
            <p className="text-sm text-gray-500">
              {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Net Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Approved Payments</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-600">Remaining Due</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(remainingDue)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isPayable && remainingDue > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onAddPayment}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </button>
          </div>
        )}
      </div>

      {/* Amount Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Amount Breakdown</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">A → B Trips</span>
              <span className="font-semibold text-blue-900">{formatCurrency(aToBAmount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">B → A Trips</span>
              <span className="font-semibold text-green-900">{formatCurrency(bToAAmount)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-orange-900">Net Amount</span>
              <span className="font-semibold text-orange-900">{formatCurrency(settlement.net_amount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-900">Payable By</span>
              <span className="font-semibold text-purple-900">
                {settlement.amount_breakdown.net_payable_by === 'owner_A' ? 'Owner A' : 
                 settlement.amount_breakdown.net_payable_by === 'owner_B' ? 'Owner B' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Trip Breakdown ({settlement.trip_breakdown?.length || 0} trips)</h5>
        <div className="space-y-3">
          {settlement.trip_breakdown?.map((trip, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  trip.direction === 'a_to_b' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {trip.direction === 'a_to_b' ? 'A→B' : 'B→A'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{trip.trip_number}</p>
                  <p className="text-sm text-gray-600">
                    {trip.material_name} • {trip.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(trip.amount)}</p>
                <p className="text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-900">Payment History</h5>
          <span className="text-sm text-gray-500">
            {settlement.payments?.length || 0} payments
          </span>
        </div>
        {settlement.payments && settlement.payments.length > 0 ? (
          <div className="space-y-3">
            {settlement.payments.map((payment, index) => (
              <PaymentCard
                key={index}
                payment={payment}
                paymentIndex={index}
                user={user}
                settlementId={settlement._id}
                onApprove={onApprovePayment}
                onReject={onRejectPayment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main SettlementTab Component
const SettlementTab = () => {
  const { user } = useAuth();
  const [collaborativePartners, setCollaborativePartners] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [settlementStats, setSettlementStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [partnersRes, settlementsRes, statsRes] = await Promise.all([
        api.get('/settlements/partners'),
        api.get('/settlements'),
        api.get('/settlements/stats/month')
      ]);

      // Handle API response structure
      setCollaborativePartners(partnersRes.data.data || []);
      setSettlements(settlementsRes.data.data?.settlements || []);
      setSettlementStats(statsRes.data.data || {});

    } catch (error) {
      console.error('Failed to fetch settlement data', error);
      toast.error(error.response?.data?.error || 'Failed to fetch settlement data');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetSettlement = async (partnerId, fromDate, toDate) => {
    try {
      const res = await api.post('/settlements/calculate', {
        owner_B_id: partnerId,
        from_date: fromDate,
        to_date: toDate
      });
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to calculate settlement');
      throw error;
    }
  };

  const createSettlement = async (settlementData) => {
    try {
      await api.post('/settlements/create', settlementData);
      toast.success('Settlement created successfully');
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create settlement');
      throw error;
    }
  };

  const addPayment = async (settlementId, paymentData) => {
    try {
      await api.post(`/settlements/${settlementId}/payments`, paymentData);
      toast.success('Payment added successfully');
      setShowPaymentForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add payment');
      throw error;
    }
  };

  const approvePayment = async (settlementId, paymentIndex) => {
    try {
      await api.patch(`/settlements/${settlementId}/payments/${paymentIndex}/approve`, {});
      toast.success('Payment approved successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve payment');
    }
  };

  const rejectPayment = async (settlementId, paymentIndex, rejectionReason) => {
    try {
      await api.patch(`/settlements/${settlementId}/payments/${paymentIndex}/reject`, {
        rejection_reason: rejectionReason
      });
      toast.success('Payment rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    }
  };

  const getSettlementById = async (settlementId) => {
    try {
      const res = await api.get(`/settlements/${settlementId}`);
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch settlement details');
      throw error;
    }
  };

  // Calculate stats from settlements data
  const calculateStats = () => {
    const totalSettlements = settlements.length;
    const completedSettlements = settlements.filter(s => s.status === 'completed').length;
    const pendingSettlements = settlements.filter(s => s.status === 'pending' || s.status === 'partially_paid').length;
    const totalAmount = settlements.reduce((sum, s) => sum + s.net_amount, 0);
    
    const totalApproved = settlements.reduce((sum, settlement) => {
      const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
      return sum + approvedPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
    }, 0);
    
    const totalDue = settlements.reduce((sum, settlement) => {
      const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
      const totalApproved = approvedPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
      return sum + (settlement.net_amount - totalApproved);
    }, 0);

    const completionRate = totalSettlements > 0 ? Math.round((completedSettlements / totalSettlements) * 100) : 0;

    return {
      total_settlements: totalSettlements,
      completed_settlements: completedSettlements,
      pending_settlements: pendingSettlements,
      total_amount: totalAmount,
      total_paid: totalApproved,
      total_due: totalDue,
      completion_rate: completionRate
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settlement Management</h2>
          <p className="text-gray-600">Manage payments and settlements with your collaborators</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Settlement
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'settlements', 'partners'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Settlements</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_settlements}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.completed_settlements} completed
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_amount)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(stats.total_paid)} paid
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_due)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.pending_settlements} pending settlements
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completion_rate}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Settlement efficiency
              </p>
            </div>
          </div>

          {/* Recent Settlements */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Settlements</h3>
            </div>
            <div className="p-6">
              {settlements.length > 0 ? (
                <div className="space-y-4">
                  {settlements.slice(0, 5).map((settlement) => (
                    <SettlementCard
                      key={settlement._id}
                      settlement={settlement}
                      user={user}
                      onViewDetails={async () => {
                        const details = await getSettlementById(settlement._id);
                        setSelectedSettlement(details);
                        setActiveTab('settlements');
                      }}
                      onAddPayment={() => {
                        setSelectedSettlement(settlement);
                        setShowPaymentForm(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Settlements Yet</h4>
                  <p className="mb-4">Create your first settlement to get started</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Create Settlement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSettlement ? 'Settlement Details' : 'All Settlements'}
            </h3>
            {selectedSettlement && (
              <button
                onClick={() => setSelectedSettlement(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to all settlements
              </button>
            )}
          </div>

          {selectedSettlement ? (
            <SettlementDetails 
              settlementData={selectedSettlement.settlement}
              user={user}
              onApprovePayment={approvePayment}
              onRejectPayment={rejectPayment}
              onAddPayment={() => setShowPaymentForm(true)}
            />
          ) : (
            <div className="space-y-4">
              {settlements.length > 0 ? (
                settlements.map((settlement) => (
                  <SettlementCard
                    key={settlement._id}
                    settlement={settlement}
                    user={user}
                    onViewDetails={async () => {
                      const details = await getSettlementById(settlement._id);
                      setSelectedSettlement(details);
                    }}
                    onAddPayment={() => {
                      setSelectedSettlement(settlement);
                      setShowPaymentForm(true);
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Settlements Found</h4>
                  <p className="mb-4">Create your first settlement to start managing payments</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Create Settlement
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Partners Tab */}
  {activeTab === 'partners' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">
        {selectedPartner ? `Settlements with ${selectedPartner.name}` : 'Collaborative Partners'}
      </h3>
      {selectedPartner && (
        <button
          onClick={() => setSelectedPartner(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to all partners
        </button>
      )}
    </div>

    {selectedPartner ? (
      // Show settlements for selected partner
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{selectedPartner.name}</h4>
              <p className="text-sm text-gray-600">{selectedPartner.company_name}</p>
              {selectedPartner.phone && (
                <p className="text-sm text-gray-500">📞 {selectedPartner.phone}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create New Settlement
          </button>
        </div>

        {/* Partner Settlement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Settlements</p>
            <p className="text-xl font-bold text-gray-900">
              {settlements.filter(s => 
                s.owner_A_id._id === selectedPartner._id || 
                s.owner_B_id._id === selectedPartner._id
              ).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-xl font-bold text-green-600">
              {settlements.filter(s => 
                (s.owner_A_id._id === selectedPartner._id || 
                 s.owner_B_id._id === selectedPartner._id) && 
                s.status === 'completed'
              ).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-xl font-bold text-orange-600">
              {settlements.filter(s => 
                (s.owner_A_id._id === selectedPartner._id || 
                 s.owner_B_id._id === selectedPartner._id) && 
                (s.status === 'pending' || s.status === 'partially_paid')
              ).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(
                settlements
                  .filter(s => 
                    s.owner_A_id._id === selectedPartner._id || 
                    s.owner_B_id._id === selectedPartner._id
                  )
                  .reduce((sum, s) => sum + s.net_amount, 0)
              )}
            </p>
          </div>
        </div>

        {/* Partner's Settlements */}
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-gray-900">Settlement History</h5>
          {settlements
            .filter(settlement => 
              settlement.owner_A_id._id === selectedPartner._id || 
              settlement.owner_B_id._id === selectedPartner._id
            )
            .length > 0 ? (
            settlements
              .filter(settlement => 
                settlement.owner_A_id._id === selectedPartner._id || 
                settlement.owner_B_id._id === selectedPartner._id
              )
              .map((settlement) => (
                <SettlementCard
                  key={settlement._id}
                  settlement={settlement}
                  user={user}
                  onViewDetails={async () => {
                    const details = await getSettlementById(settlement._id);
                    setSelectedSettlement(details);
                    setActiveTab('settlements');
                  }}
                  onAddPayment={() => {
                    setSelectedSettlement(settlement);
                    setShowPaymentForm(true);
                  }}
                />
              ))
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Settlements Yet</h4>
              <p className="mb-4">Create your first settlement with {selectedPartner.name}</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Settlement
              </button>
            </div>
          )}
        </div>
      </div>
    ) : (
      // Show all partners grid
      collaborativePartners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborativePartners.map((partner) => {
            // Calculate partner-specific stats
            const partnerSettlements = settlements.filter(s => 
              s.owner_A_id._id === partner._id || s.owner_B_id._id === partner._id
            );
            const completedSettlements = partnerSettlements.filter(s => s.status === 'completed').length;
            const pendingSettlements = partnerSettlements.filter(s => 
              s.status === 'pending' || s.status === 'partially_paid'
            ).length;
            const totalAmount = partnerSettlements.reduce((sum, s) => sum + s.net_amount, 0);

            return (
              <div
                key={partner._id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedPartner(partner)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                    <p className="text-sm text-gray-600">{partner.company_name}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {partner.phone && (
                    <p>📞 {partner.phone}</p>
                  )}
                  {partner.email && (
                    <p>✉️ {partner.email}</p>
                  )}
                </div>

                {/* Partner Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Settlements</p>
                    <p className="text-sm font-semibold text-gray-900">{partnerSettlements.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Completed</p>
                    <p className="text-sm font-semibold text-green-600">{completedSettlements}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartner(partner);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    View Settlements
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartner(partner);
                      setShowCreateForm(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Collaborative Partners</h4>
          <p>You need active collaborations to create settlements</p>
        </div>
      )
    )}
  </div>
)}

      {/* Modals */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateSettlementForm
            partners={collaborativePartners}
            onCalculate={calculateNetSettlement}
            onCreate={createSettlement}
            onClose={() => {
              setShowCreateForm(false);
              setSelectedPartner(null);
            }}
            initialPartner={selectedPartner}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentForm && selectedSettlement && (
          <AddPaymentForm
            settlement={selectedSettlement}
            user={user}
            onAddPayment={addPayment}
            onClose={() => {
              setShowPaymentForm(false);
              setSelectedSettlement(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettlementTab;