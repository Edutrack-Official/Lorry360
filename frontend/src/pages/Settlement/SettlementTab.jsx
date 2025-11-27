
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
// import api from '../../api/client';
// import { useAuth } from '../../contexts/AuthContext';
// import CreateSettlementForm from './CreateSettlementForm';
// import AddPaymentForm from './AddPaymentForm';

// // NEW: import CollaborationRequestsTab to embed inside Partners sub-tab
// import CollaborationRequestsTab from '../Collaboration/CollaborationRequestsTab';

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
//     if (settlement.owner_A_id._id === user.id) return 'owner_A';
//     if (settlement.owner_B_id._id === user.id) return 'owner_B';
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

//   const getPartnerCompany = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
//     return partner.company_name;
//   };

//   const statusConfig = getStatusConfig(settlement.status);
//   const userRole = getUserRoleInSettlement(settlement);
//   const isPayable = isUserPayable(settlement);
//   const partnerName = getPartnerName(settlement);
//   const partnerCompany = getPartnerCompany(settlement);

//   // Calculate payment summary
//   const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//   const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const remainingDue = settlement.net_amount - totalApproved;

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
//             <p className="text-sm text-gray-600">{partnerCompany}</p>
//             <p className="text-xs text-gray-500">
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
//           <p className="text-sm text-gray-600">Approved</p>
//           <p className="font-semibold text-green-600">{formatCurrency(totalApproved)}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-600">Due</p>
//           <p className="font-semibold text-orange-600">{formatCurrency(remainingDue)}</p>
//         </div>
//         <div>
//           <p className="text-sm text-gray-600">Trips</p>
//           <p className="font-semibold text-gray-900">{settlement.trip_ids?.length || 0}</p>
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-gray-600">
//           {isPayable ? `You owe ${formatCurrency(remainingDue)}` : `Owes you ${formatCurrency(remainingDue)}`}
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onViewDetails}
//             className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             View Details
//           </button>
//           {isPayable && remainingDue > 0 && (
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
//             {payment.rejection_reason && ` • Rejected: ${payment.rejection_reason}`}
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
//     console.log("settlement", settlement);

//     if (settlement.owner_A_id._id === user.id) return 'owner_A';
//     if (settlement.owner_B_id._id === user.id) return 'owner_B';
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

//   const getPartnerCompany = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
//     return partner.company_name;
//   };

//   const settlement = settlementData;
//   const statusConfig = getStatusConfig(settlement.status);
//   const userRole = getUserRoleInSettlement(settlement);
//   const isPayable = isUserPayable(settlement);
//   const partnerName = getPartnerName(settlement);
//   const partnerCompany = getPartnerCompany(settlement);

//   // Calculate payment summary
//   const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//   const pendingPayments = settlement.payments?.filter(p => p.status === 'pending') || [];
//   const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const remainingDue = settlement.net_amount - totalApproved;

//   // Calculate trip amounts by direction
//   const aToBTrips = settlement.trip_breakdown?.filter(trip => trip.direction === 'a_to_b') || [];
//   const bToATrips = settlement.trip_breakdown?.filter(trip => trip.direction === 'b_to_a') || [];
//   const aToBAmount = aToBTrips.reduce((sum, trip) => sum + trip.amount, 0);
//   const bToAAmount = bToATrips.reduce((sum, trip) => sum + trip.amount, 0);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h4 className="text-xl font-bold text-gray-900">Settlement with {partnerName}</h4>
//             <p className="text-gray-600">{partnerCompany}</p>
//             <p className="text-sm text-gray-500">
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
//             <p className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</p>
//           </div>
//           <div className="text-center p-4 bg-yellow-50 rounded-lg">
//             <p className="text-sm text-yellow-600">Pending Payments</p>
//             <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
//           </div>
//           <div className="text-center p-4 bg-orange-50 rounded-lg">
//             <p className="text-sm text-orange-600">Remaining Due</p>
//             <p className="text-2xl font-bold text-orange-600">{formatCurrency(remainingDue)}</p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         {isPayable && remainingDue > 0 && (
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

//       {/* Amount Breakdown */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <h5 className="text-lg font-semibold text-gray-900 mb-4">Amount Breakdown</h5>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-3">
//             <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
//               <span className="font-medium text-blue-900">A → B Trips</span>
//               <span className="font-semibold text-blue-900">{formatCurrency(aToBAmount)}</span>
//             </div>
//             <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
//               <span className="font-medium text-green-900">B → A Trips</span>
//               <span className="font-semibold text-green-900">{formatCurrency(bToAAmount)}</span>
//             </div>
//           </div>
//           <div className="space-y-3">
//             <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
//               <span className="font-medium text-orange-900">Net Amount</span>
//               <span className="font-semibold text-orange-900">{formatCurrency(settlement.net_amount)}</span>
//             </div>
//             <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
//               <span className="font-medium text-purple-900">Payable By</span>
//               <span className="font-semibold text-purple-900">
//                 {settlement.amount_breakdown.net_payable_by === 'owner_A' ? 'Owner A' : 
//                  settlement.amount_breakdown.net_payable_by === 'owner_B' ? 'Owner B' : 'None'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Trip Breakdown */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <h5 className="text-lg font-semibold text-gray-900 mb-4">Trip Breakdown ({settlement.trip_breakdown?.length || 0} trips)</h5>
//         <div className="space-y-3">
//           {settlement.trip_breakdown?.map((trip, index) => (
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
//         <div className="flex items-center justify-between mb-4">
//           <h5 className="text-lg font-semibold text-gray-900">Payment History</h5>
//           <span className="text-sm text-gray-500">
//             {settlement.payments?.length || 0} payments
//           </span>
//         </div>
//         {settlement.payments && settlement.payments.length > 0 ? (
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
//   const [activeTab, setActiveTab] = useState('overview');

//   // NEW: partnerSubTab controls which sub-view inside Partners tab is shown
//   // values: 'partnersList' | 'collabRequests'
//   const [partnerSubTab, setPartnerSubTab] = useState('partnersList');

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

//       // Handle API response structure
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
//       setShowCreateForm(false);
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
//       setShowPaymentForm(false);
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

//   // Calculate stats from settlements data
//   const calculateStats = () => {
//     const totalSettlements = settlements.length;
//     const completedSettlements = settlements.filter(s => s.status === 'completed').length;
//     const pendingSettlements = settlements.filter(s => s.status === 'pending' || s.status === 'partially_paid').length;
//     const totalAmount = settlements.reduce((sum, s) => sum + s.net_amount, 0);
    
//     const totalApproved = settlements.reduce((sum, settlement) => {
//       const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//       return sum + approvedPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
//     }, 0);
    
//     const totalDue = settlements.reduce((sum, settlement) => {
//       const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//       const totalApproved = approvedPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
//       return sum + (settlement.net_amount - totalApproved);
//     }, 0);

//     const completionRate = totalSettlements > 0 ? Math.round((completedSettlements / totalSettlements) * 100) : 0;

//     return {
//       total_settlements: totalSettlements,
//       completed_settlements: completedSettlements,
//       pending_settlements: pendingSettlements,
//       total_amount: totalAmount,
//       total_paid: totalApproved,
//       total_due: totalDue,
//       completion_rate: completionRate
//     };
//   };

//   const stats = calculateStats();

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
//           <h2 className="text-2xl font-bold text-gray-900">Collaboration Management</h2>
//         </div>
//         <button
//           onClick={() => {
//             setShowCreateForm(true);
//             // keep user focused on partners list by default when creating from header
//             setPartnerSubTab('partnersList');
//           }}
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
//                   <p className="text-2xl font-bold text-gray-900">{stats.total_settlements}</p>
//                 </div>
//                 <div className="p-3 bg-blue-100 rounded-lg">
//                   <FileText className="h-6 w-6 text-blue-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {stats.completed_settlements} completed
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Amount</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {formatCurrency(stats.total_amount)}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-lg">
//                   <DollarSign className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {formatCurrency(stats.total_paid)} paid
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Pending Amount</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {formatCurrency(stats.total_due)}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-yellow-100 rounded-lg">
//                   <Clock className="h-6 w-6 text-yellow-600" />
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 {stats.pending_settlements} pending settlements
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Completion Rate</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {stats.completion_rate}%
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
//                         setSelectedSettlement(settlement);
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
//               settlementData={selectedSettlement.settlement}
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
//                       setSelectedSettlement(settlement);
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

//       {/* Partners Tab with embedded CollaborationRequestsTab */}
//    {activeTab === 'partners' && (
//   <div className="space-y-6">
//     {/* Sub Tabs */}
//     <div className="border-b border-gray-200 flex gap-8">

//       <button
//         onClick={() => {
//           setPartnerSubTab('partnersList');
//           setSelectedPartner(null);
//         }}
//         className={`pb-2 text-sm font-medium transition-colors ${
//           partnerSubTab === 'partnersList'
//             ? 'border-b-2 border-blue-600 text-blue-600'
//             : 'text-gray-500 hover:text-gray-700'
//         }`}
//       >
//         Partners List
//       </button>

//       <button
//         onClick={() => {
//           setPartnerSubTab('collabRequests');
//           setSelectedPartner(null);
//         }}
//         className={`pb-2 text-sm font-medium transition-colors ${
//           partnerSubTab === 'collabRequests'
//             ? 'border-b-2 border-blue-600 text-blue-600'
//             : 'text-gray-500 hover:text-gray-700'
//         }`}
//       >
//         Collaboration Requests
//       </button>

//     </div>

//     {/* SUB TAB CONTENT */}
//     {partnerSubTab === 'collabRequests' ? (
//       <div className="mt-4">
//         <CollaborationRequestsTab />
//       </div>
//     ) : (
//       <>
//         {/* If a partner is selected, show details */}
//         {selectedPartner ? (
//           <div className="space-y-6">

//             {/* Back Button */}
//             <button
//               onClick={() => setSelectedPartner(null)}
//               className="text-sm text-gray-600 hover:text-gray-800"
//             >
//               ← Back to partners
//             </button>

//             {/* Partner Header */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-blue-100 rounded-lg">
//                   <Users className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-900">{selectedPartner.name}</h4>
//                   <p className="text-sm text-gray-600">{selectedPartner.company_name}</p>
//                   {selectedPartner.phone && (
//                     <p className="text-sm text-gray-500">📞 {selectedPartner.phone}</p>
//                   )}
//                 </div>
//               </div>

//               <button
//                 onClick={() => setShowCreateForm(true)}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Plus className="h-4 w-4" />
//                 Create New Settlement
//               </button>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="bg-white p-4 rounded-lg border border-gray-200">
//                 <p className="text-sm text-gray-600">Total Settlements</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   {settlements.filter(s =>
//                     s.owner_A_id._id === selectedPartner._id ||
//                     s.owner_B_id._id === selectedPartner._id
//                   ).length}
//                 </p>
//               </div>

//               <div className="bg-white p-4 rounded-lg border border-gray-200">
//                 <p className="text-sm text-gray-600">Completed</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {settlements.filter(
//                     s =>
//                       (s.owner_A_id._id === selectedPartner._id ||
//                         s.owner_B_id._id === selectedPartner._id) &&
//                       s.status === 'completed'
//                   ).length}
//                 </p>
//               </div>

//               <div className="bg-white p-4 rounded-lg border border-gray-200">
//                 <p className="text-sm text-gray-600">Pending</p>
//                 <p className="text-xl font-bold text-orange-600">
//                   {settlements.filter(
//                     s =>
//                       (s.owner_A_id._id === selectedPartner._id ||
//                         s.owner_B_id._id === selectedPartner._id) &&
//                       (s.status === 'pending' || s.status === 'partially_paid')
//                   ).length}
//                 </p>
//               </div>

//               <div className="bg-white p-4 rounded-lg border border-gray-200">
//                 <p className="text-sm text-gray-600">Total Amount</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   {formatCurrency(
//                     settlements
//                       .filter(
//                         s =>
//                           s.owner_A_id._id === selectedPartner._id ||
//                           s.owner_B_id._id === selectedPartner._id
//                       )
//                       .reduce((sum, s) => sum + s.net_amount, 0)
//                   )}
//                 </p>
//               </div>
//             </div>

//             {/* Settlement history */}
//             <div className="space-y-4">
//               <h5 className="text-lg font-semibold text-gray-900">
//                 Settlement History
//               </h5>

//               {settlements.filter(
//                 s =>
//                   s.owner_A_id._id === selectedPartner._id ||
//                   s.owner_B_id._id === selectedPartner._id
//               ).length > 0 ? (
//                 settlements
//                   .filter(
//                     s =>
//                       s.owner_A_id._id === selectedPartner._id ||
//                       s.owner_B_id._id === selectedPartner._id
//                   )
//                   .map(s => (
//                     <SettlementCard
//                       key={s._id}
//                       settlement={s}
//                       user={user}
//                       onViewDetails={async () => {
//                         const details = await getSettlementById(s._id);
//                         setSelectedSettlement(details);
//                         setActiveTab('settlements');
//                       }}
//                       onAddPayment={() => {
//                         setSelectedSettlement(s);
//                         setShowPaymentForm(true);
//                       }}
//                     />
//                   ))
//               ) : (
//                 <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                   <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                   <h4 className="text-lg font-semibold text-gray-900 mb-2">
//                     No Settlements Yet
//                   </h4>
//                   <p className="mb-4">
//                     Create your first settlement with {selectedPartner.name}
//                   </p>
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
//         ) : (
//           // ALL PARTNERS GRID
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {collaborativePartners.length > 0 ? (
//               collaborativePartners.map(partner => {
//                 const partnerSettlements = settlements.filter(
//                   s =>
//                     s.owner_A_id._id === partner._id ||
//                     s.owner_B_id._id === partner._id
//                 );

//                 return (
//                   <div
//                     key={partner._id}
//                     className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
//                     onClick={() => {
//                       setSelectedPartner(partner);
//                       setPartnerSubTab('partnersList');
//                     }}
//                   >
//                     <div className="flex items-center gap-4 mb-4">
//                       <div className="p-3 bg-blue-100 rounded-lg">
//                         <Users className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-900">{partner.name}</h4>
//                         <p className="text-sm text-gray-600">{partner.company_name}</p>
//                       </div>
//                     </div>

//                     <div className="space-y-1 text-sm text-gray-600 mb-3">
//                       {partner.phone && <p>📞 {partner.phone}</p>}
//                       {partner.email && <p>✉️ {partner.email}</p>}
//                     </div>

//                     <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
//                       <div className="text-center">
//                         <p className="text-xs text-gray-600">Settlements</p>
//                         <p className="text-sm font-semibold text-gray-900">{partnerSettlements.length}</p>
//                       </div>

//                       <div className="text-center">
//                         <p className="text-xs text-gray-600">Completed</p>
//                         <p className="text-sm font-semibold text-green-600">
//                           {partnerSettlements.filter(s => s.status === 'completed').length}
//                         </p>
//                       </div>

//                       <div className="text-center">
//                         <p className="text-xs text-gray-600">Total</p>
//                         <p className="text-sm font-semibold text-gray-900">
//                           {formatCurrency(
//                             partnerSettlements.reduce((sum, s) => sum + s.net_amount, 0)
//                           )}
//                         </p>
//                       </div>
//                     </div>

//                     <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
//                       <FileText className="h-4 w-4" />
//                       View Settlements
//                     </button>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
//                 <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                 <h4 className="text-lg font-semibold text-gray-900 mb-2">No Collaborative Partners</h4>
//                 <p>You need active collaborations to create settlements</p>
//               </div>
//             )}
//           </div>
//         )}
//       </>
//     )}
//   </div>
// )}


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
//             settlement={selectedSettlement}
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


//--cubeversion1
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
//   AlertCircle,
//   Filter,
//   Download,
//   RefreshCw,
//   ChevronDown,
//   UserPlus,
//   Info
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import api from '../../api/client';
// import { useAuth } from '../../contexts/AuthContext';
// import CreateSettlementForm from './CreateSettlementForm';
// import AddPaymentForm from './AddPaymentForm';
// import CollaborationRequestsTab from '../Collaboration/CollaborationRequestsTab';

// // Helper functions
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
//       label: 'Pending Review',
//       icon: <Clock className="h-4 w-4" />
//     },
//     approved: { 
//       color: 'bg-green-100 text-green-800', 
//       label: 'Approved',
//       icon: <CheckCircle className="h-4 w-4" />
//     },
//     rejected: { 
//       color: 'bg-red-100 text-red-800', 
//       label: 'Rejected',
//       icon: <X className="h-4 w-4" />
//     },
//     cancelled: { 
//       color: 'bg-gray-100 text-gray-800', 
//       label: 'Cancelled',
//       icon: <X className="h-4 w-4" />
//     }
//   };
//   return config[status] || config.pending;
// };

// // Settlement Card Component
// const SettlementCard = ({ settlement, user, onViewDetails, onAddPayment }) => {
//   const getUserRoleInSettlement = (settlement) => {
//     if (settlement.owner_A_id._id === user.id) return 'owner_A';
//     if (settlement.owner_B_id._id === user.id) return 'owner_B';
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

//   const getPartnerCompany = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
//     return partner.company_name;
//   };

//   const statusConfig = getStatusConfig(settlement.status);
//   const userRole = getUserRoleInSettlement(settlement);
//   const isPayable = isUserPayable(settlement);
//   const partnerName = getPartnerName(settlement);
//   const partnerCompany = getPartnerCompany(settlement);

//   // Calculate payment summary
//   const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//   const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const remainingDue = settlement.net_amount - totalApproved;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//     >
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
//             <p className="text-sm text-gray-600">{partnerCompany}</p>
//             <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
//               <Calendar className="h-3 w-3" />
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
//         <div className="bg-gray-50 p-3 rounded-lg">
//           <p className="text-xs text-gray-600 mb-1">Net Amount</p>
//           <p className="font-semibold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
//         </div>
//         <div className="bg-green-50 p-3 rounded-lg">
//           <p className="text-xs text-green-600 mb-1">Approved</p>
//           <p className="font-semibold text-green-600">{formatCurrency(totalApproved)}</p>
//         </div>
//         <div className="bg-orange-50 p-3 rounded-lg">
//           <p className="text-xs text-orange-600 mb-1">Due</p>
//           <p className="font-semibold text-orange-600">{formatCurrency(remainingDue)}</p>
//         </div>
//         <div className="bg-blue-50 p-3 rounded-lg">
//           <p className="text-xs text-blue-600 mb-1">Trips</p>
//           <p className="font-semibold text-blue-600">{settlement.trip_ids?.length || 0}</p>
//         </div>
//       </div>

//       <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//         <div className="text-sm font-medium text-gray-700">
//           {isPayable 
//             ? <span className="text-orange-600">You owe {formatCurrency(remainingDue)}</span>
//             : <span className="text-green-600">Owes you {formatCurrency(remainingDue)}</span>
//           }
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onViewDetails}
//             className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
//           >
//             View Details
//           </button>
//           {isPayable && remainingDue > 0 && (
//             <button
//               onClick={onAddPayment}
//               className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
//             >
//               <Plus className="h-3 w-3" />
//               Add Payment
//             </button>
//           )}
//         </div>
//       </div>
//     </motion.div>
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
//     <motion.div
//       initial={{ opacity: 0, x: -20 }}
//       animate={{ opacity: 1, x: 0 }}
//       className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//     >
//       <div className="flex items-center gap-4 flex-1">
//         <div className={`p-2 rounded-lg ${
//           isFromMe ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
//         }`}>
//           {isFromMe ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
//         </div>
        
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
//             <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
//               {statusConfig.icon}
//               {statusConfig.label}
//             </span>
//           </div>
//           <p className="text-sm text-gray-600">
//             {isFromMe ? 'You paid' : `${payment.paid_by.name} paid`} via <span className="font-medium">{payment.payment_mode}</span>
//           </p>
//           {payment.reference_number && (
//             <p className="text-sm text-gray-500">Ref: {payment.reference_number}</p>
//           )}
//           {payment.notes && (
//             <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
//           )}
//           <p className="text-xs text-gray-400 mt-1">
//             {formatDate(payment.payment_date)}
//             {payment.approved_at && ` • Approved on ${formatDate(payment.approved_at)}`}
//             {payment.rejection_reason && ` • Rejected: ${payment.rejection_reason}`}
//           </p>
//         </div>
//       </div>

//       {/* Actions */}
//       {(canApprove || canReject) && (
//         <div className="relative">
//           <button
//             onClick={() => setShowActions(!showActions)}
//             className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//           >
//             <MoreVertical className="h-4 w-4 text-gray-400" />
//           </button>

//           {showActions && (
//             <>
//               <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
//               <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
//                 {canApprove && (
//                   <button
//                     onClick={() => {
//                       onApprove(settlementId, paymentIndex);
//                       setShowActions(false);
//                     }}
//                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
//                   >
//                     <CheckCircle className="h-4 w-4" />
//                     Approve Payment
//                   </button>
//                 )}
//                 {canReject && (
//                   <button
//                     onClick={() => {
//                       const reason = prompt('Reason for rejection:');
//                       if (reason) {
//                         onReject(settlementId, paymentIndex, reason);
//                         setShowActions(false);
//                       }
//                     }}
//                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                   >
//                     <X className="h-4 w-4" />
//                     Reject Payment
//                   </button>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </motion.div>
//   );
// };

// // Settlement Details Component
// const SettlementDetails = ({ settlementData, user, onApprovePayment, onRejectPayment, onAddPayment }) => {
//   const [activeTab, setActiveTab] = useState('summary');

//   const getUserRoleInSettlement = (settlement) => {
//     if (settlement.owner_A_id._id === user.id) return 'owner_A';
//     if (settlement.owner_B_id._id === user.id) return 'owner_B';
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

//   const getPartnerCompany = (settlement) => {
//     const userRole = getUserRoleInSettlement(settlement);
//     const partner = userRole === 'owner_A' ? settlement.owner_B_id : settlement.owner_A_id;
//     return partner.company_name;
//   };

//   const settlement = settlementData;
//   const statusConfig = getStatusConfig(settlement.status);
//   const isPayable = isUserPayable(settlement);
//   const partnerName = getPartnerName(settlement);
//   const partnerCompany = getPartnerCompany(settlement);

//   // Calculate payment summary
//   const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//   const pendingPayments = settlement.payments?.filter(p => p.status === 'pending') || [];
//   const totalApproved = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
//   const remainingDue = settlement.net_amount - totalApproved;

//   // Calculate trip amounts by direction
//   const aToBTrips = settlement.trip_breakdown?.filter(trip => trip.direction === 'a_to_b') || [];
//   const bToATrips = settlement.trip_breakdown?.filter(trip => trip.direction === 'b_to_a') || [];
//   const aToBAmount = aToBTrips.reduce((sum, trip) => sum + trip.amount, 0);
//   const bToAAmount = bToATrips.reduce((sum, trip) => sum + trip.amount, 0);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h4 className="text-2xl font-bold text-gray-900">Settlement with {partnerName}</h4>
//             <p className="text-gray-600 mt-1">{partnerCompany}</p>
//             <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
//               <Calendar className="h-4 w-4" />
//               {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
//             </p>
//           </div>
//           <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
//             {statusConfig.icon}
//             {statusConfig.label}
//           </span>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-4 bg-white rounded-lg shadow-sm">
//             <p className="text-sm text-gray-600 mb-1">Net Amount</p>
//             <p className="text-2xl font-bold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
//           </div>
//           <div className="text-center p-4 bg-white rounded-lg shadow-sm">
//             <p className="text-sm text-green-600 mb-1">Approved</p>
//             <p className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</p>
//           </div>
//           <div className="text-center p-4 bg-white rounded-lg shadow-sm">
//             <p className="text-sm text-yellow-600 mb-1">Pending</p>
//             <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
//           </div>
//           <div className="text-center p-4 bg-white rounded-lg shadow-sm">
//             <p className="text-sm text-orange-600 mb-1">Due</p>
//             <p className="text-2xl font-bold text-orange-600">{formatCurrency(remainingDue)}</p>
//           </div>
//         </div>

//         {/* Action Button */}
//         {isPayable && remainingDue > 0 && (
//           <div className="mt-4 flex justify-end">
//             <button
//               onClick={onAddPayment}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
//             >
//               <Plus className="h-5 w-5" />
//               Add Payment
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8">
//           {[
//             { id: 'summary', label: 'Summary' },
//             { id: 'breakdown', label: 'Amount Breakdown' },
//             { id: 'trips', label: `Trips (${settlement.trip_breakdown?.length || 0})` },
//             { id: 'payments', label: `Payments (${settlement.payments?.length || 0})` }
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//                 activeTab === tab.id
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <AnimatePresence mode="wait">
//         {activeTab === 'summary' && (
//           <motion.div
//             key="summary"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="space-y-6"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-white p-6 rounded-xl border border-gray-200">
//                 <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <TrendingUp className="h-5 w-5 text-blue-600" />
//                   Payment Progress
//                 </h5>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Total Amount</span>
//                     <span className="font-semibold">{formatCurrency(settlement.net_amount)}</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-3">
//                     <div
//                       className="bg-green-600 h-3 rounded-full transition-all"
//                       style={{ width: `${(totalApproved / settlement.net_amount) * 100}%` }}
//                     />
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-green-600">{Math.round((totalApproved / settlement.net_amount) * 100)}% Paid</span>
//                     <span className="text-gray-600">{formatCurrency(remainingDue)} remaining</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded-xl border border-gray-200">
//                 <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <FileText className="h-5 w-5 text-purple-600" />
//                   Quick Stats
//                 </h5>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
//                     <span className="text-sm text-blue-900">Total Trips</span>
//                     <span className="font-semibold text-blue-900">{settlement.trip_breakdown?.length || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
//                     <span className="text-sm text-green-900">Approved Payments</span>
//                     <span className="font-semibold text-green-900">{approvedPayments.length}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
//                     <span className="text-sm text-yellow-900">Pending Payments</span>
//                     <span className="font-semibold text-yellow-900">{pendingPayments.length}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {activeTab === 'breakdown' && (
//           <motion.div
//             key="breakdown"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="bg-white p-6 rounded-xl border border-gray-200"
//           >
//             <h5 className="text-lg font-semibold text-gray-900 mb-6">Amount Breakdown</h5>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="font-medium text-blue-900">You → Partner Trips</span>
//                     <span className="text-sm text-blue-600">{aToBTrips.length} trips</span>
//                   </div>
//                   <p className="text-2xl font-bold text-blue-900">{formatCurrency(aToBAmount)}</p>
//                 </div>
//                 <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="font-medium text-green-900">Partner → You Trips</span>
//                     <span className="text-sm text-green-600">{bToATrips.length} trips</span>
//                   </div>
//                   <p className="text-2xl font-bold text-green-900">{formatCurrency(bToAAmount)}</p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
//                   <span className="font-medium text-orange-900">Net Settlement</span>
//                   <p className="text-2xl font-bold text-orange-900 mt-2">{formatCurrency(settlement.net_amount)}</p>
//                   <p className="text-sm text-orange-700 mt-2">
//                     {isPayable ? 'You pay to partner' : 'Partner pays to you'}
//                   </p>
//                 </div>
//                 <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
//                   <span className="font-medium text-purple-900">Payable By</span>
//                   <p className="text-xl font-bold text-purple-900 mt-2">
//                     {settlement.amount_breakdown.net_payable_by === 'owner_A' ? 'Owner A (You)' : 
//                      settlement.amount_breakdown.net_payable_by === 'owner_B' ? 'Owner B (Partner)' : 'None'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {activeTab === 'trips' && (
//           <motion.div
//             key="trips"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="bg-white p-6 rounded-xl border border-gray-200"
//           >
//             <h5 className="text-lg font-semibold text-gray-900 mb-4">
//               Trip Breakdown ({settlement.trip_breakdown?.length || 0} trips)
//             </h5>
//             <div className="space-y-3">
//               {settlement.trip_breakdown?.map((trip, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                   className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className={`p-2 rounded-lg ${
//                       trip.direction === 'a_to_b' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
//                     }`}>
//                       {trip.direction === 'a_to_b' ? 'A→B' : 'B→A'}
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-900">{trip.trip_number}</p>
//                       <p className="text-sm text-gray-600">
//                         {trip.material_name} • {trip.location}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-semibold text-gray-900">{formatCurrency(trip.amount)}</p>
//                     <p className="text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         )}

//         {activeTab === 'payments' && (
//           <motion.div
//             key="payments"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="bg-white p-6 rounded-xl border border-gray-200"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h5 className="text-lg font-semibold text-gray-900">Payment History</h5>
//               <span className="text-sm text-gray-500">
//                 {settlement.payments?.length || 0} payments
//               </span>
//             </div>
//             {settlement.payments && settlement.payments.length > 0 ? (
//               <div className="space-y-3">
//                 {settlement.payments.map((payment, index) => (
//                   <PaymentCard
//                     key={index}
//                     payment={payment}
//                     paymentIndex={index}
//                     user={user}
//                     settlementId={settlement._id}
//                     onApprove={onApprovePayment}
//                     onReject={onRejectPayment}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12 text-gray-500">
//                 <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                 <p className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</p>
//                 <p>Add your first payment to get started</p>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Main SettlementTab Component
// const SettlementTab = () => {
//   const { user } = useAuth();
//   const [collaborativePartners, setCollaborativePartners] = useState([]);
//   const [unsettledAmounts, setUnsettledAmounts] = useState({});
//   const [settlements, setSettlements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [showPaymentForm, setShowPaymentForm] = useState(false);
//   const [selectedPartner, setSelectedPartner] = useState(null);
//   const [selectedSettlement, setSelectedSettlement] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [partnerSubTab, setPartnerSubTab] = useState('partnersList');
//   const [statusFilter, setStatusFilter] = useState('all');

//   useEffect(() => {
//     if (user) {
//       fetchData();
//     }
//   }, [user]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
      
//       const [partnersRes, settlementsRes] = await Promise.all([
//         api.get('/settlements/partners'),
//         api.get('/settlements')
//       ]);

//       setCollaborativePartners(partnersRes.data.data || []);
//       setSettlements(settlementsRes.data.data?.settlements || []);

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
//       setShowCreateForm(false);
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
//       setShowPaymentForm(false);
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

//   // Calculate stats from settlements data
//   const calculateStats = () => {
//     const totalSettlements = settlements.length;
//     const completedSettlements = settlements.filter(s => s.status === 'completed').length;
//     const pendingSettlements = settlements.filter(s => s.status === 'pending' || s.status === 'partially_paid').length;
//     const totalAmount = settlements.reduce((sum, s) => sum + s.net_amount, 0);
    
//     const totalApproved = settlements.reduce((sum, settlement) => {
//       const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//       return sum + approvedPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
//     }, 0);
    
//     const totalDue = settlements.reduce((sum, settlement) => {
//       const approvedPayments = settlement.payments?.filter(p => p.status === 'approved') || [];
//       const totalApproved = approvedPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
//       return sum + (settlement.net_amount - totalApproved);
//     }, 0);

//     const completionRate = totalSettlements > 0 ? Math.round((completedSettlements / totalSettlements) * 100) : 0;

//     return {
//       total_settlements: totalSettlements,
//       completed_settlements: completedSettlements,
//       pending_settlements: pendingSettlements,
//       total_amount: totalAmount,
//       total_paid: totalApproved,
//       total_due: totalDue,
//       completion_rate: completionRate
//     };
//   };

//   const stats = calculateStats();

//   // Filter settlements
//   const filteredSettlements = statusFilter === 'all' 
//     ? settlements 
//     : settlements.filter(s => s.status === statusFilter);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading settlement data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">Collaboration Management</h2>
//         </div>
//         <button
//           onClick={() => {
//             setShowCreateForm(true);
//             setPartnerSubTab('partnersList');
//           }}
//           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium"
//         >
//           <Plus className="h-5 w-5" />
//           Create Settlement
//         </button>
//       </div>

//       {/* Tabs - REORDERED: Overview → Partners → Settlements */}
//       <div className="border-b border-gray-200 bg-white rounded-t-xl px-6">
//         <nav className="-mb-px flex space-x-8">
//           {[
//             { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
//             { id: 'partners', label: 'Partners', icon: <Users className="h-4 w-4" /> },
//             { id: 'settlements', label: 'Settlements', icon: <FileText className="h-4 w-4" /> }
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
//                 activeTab === tab.id
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               {tab.icon}
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Overview Tab */}
//       {activeTab === 'overview' && (
//         <motion.div
//           key="overview"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-6"
//         >
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-blue-100 rounded-lg">
//                   <FileText className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <span className="text-sm text-gray-500">Total</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">{stats.total_settlements}</p>
//               <p className="text-sm text-gray-600 mt-1">Settlements</p>
//               <p className="text-xs text-green-600 mt-2">
//                 {stats.completed_settlements} completed
//               </p>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-green-100 rounded-lg">
//                   <DollarSign className="h-6 w-6 text-green-600" />
//                 </div>
//                 <span className="text-sm text-gray-500">Amount</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">
//                 {formatCurrency(stats.total_amount)}
//               </p>
//               <p className="text-sm text-gray-600 mt-1">Total Value</p>
//               <p className="text-xs text-green-600 mt-2">
//                 {formatCurrency(stats.total_paid)} paid
//               </p>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-yellow-100 rounded-lg">
//                   <Clock className="h-6 w-6 text-yellow-600" />
//                 </div>
//                 <span className="text-sm text-gray-500">Pending</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">
//                 {formatCurrency(stats.total_due)}
//               </p>
//               <p className="text-sm text-gray-600 mt-1">Due Amount</p>
//               <p className="text-xs text-yellow-600 mt-2">
//                 {stats.pending_settlements} pending
//               </p>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="p-3 bg-purple-100 rounded-lg">
//                   <TrendingUp className="h-6 w-6 text-purple-600" />
//                 </div>
//                 <span className="text-sm text-gray-500">Rate</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">
//                 {stats.completion_rate}%
//               </p>
//               <p className="text-sm text-gray-600 mt-1">Completion</p>
//               <p className="text-xs text-purple-600 mt-2">
//                 Settlement efficiency
//               </p>
//             </motion.div>
//           </div>

//           {/* Recent Settlements */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//               <h3 className="text-xl font-semibold text-gray-900">Recent Settlements</h3>
//               <button
//                 onClick={() => setActiveTab('settlements')}
//                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 View all →
//               </button>
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
//                         setSelectedSettlement(settlement);
//                         setShowPaymentForm(true);
//                       }}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-gray-500">
//                   <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                   <h4 className="text-xl font-semibold text-gray-900 mb-2">No Settlements Yet</h4>
//                   <p className="mb-6">Create your first settlement to get started</p>
//                   <button
//                     onClick={() => setShowCreateForm(true)}
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
//                   >
//                     <Plus className="h-5 w-5" />
//                     Create Settlement
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </motion.div>
//       )}

//       {/* Partners Tab */}
//       {activeTab === 'partners' && (
//         <div className="space-y-6">
//           {/* Sub Tabs */}
//           <div className="bg-white rounded-xl border border-gray-200 p-2">
//             <div className="flex gap-2">
//               <button
//                 onClick={() => {
//                   setPartnerSubTab('partnersList');
//                   setSelectedPartner(null);
//                 }}
//                 className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
//                   partnerSubTab === 'partnersList'
//                     ? 'bg-blue-600 text-white shadow-sm'
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 Partners List
//               </button>

//               <button
//                 onClick={() => {
//                   setPartnerSubTab('collabRequests');
//                   setSelectedPartner(null);
//                 }}
//                 className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
//                   partnerSubTab === 'collabRequests'
//                     ? 'bg-blue-600 text-white shadow-sm'
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 Collaboration Requests
//               </button>
//             </div>
//           </div>

//           {/* SUB TAB CONTENT */}
//           {partnerSubTab === 'collabRequests' ? (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-4"
//             >
//               <CollaborationRequestsTab />
//             </motion.div>
//           ) : (
//             <>
//               {/* If a partner is selected, show details */}
//               {selectedPartner ? (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="space-y-6"
//                 >
//                   {/* Back Button */}
//                   <button
//                     onClick={() => setSelectedPartner(null)}
//                     className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
//                   >
//                     <X className="h-4 w-4" />
//                     Back to partners
//                   </button>

//                   {/* Partner Header */}
//                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <div className="p-4 bg-white rounded-xl shadow-sm">
//                           <Users className="h-8 w-8 text-blue-600" />
//                         </div>
//                         <div>
//                           <h4 className="text-2xl font-bold text-gray-900">{selectedPartner.name}</h4>
//                           <p className="text-lg text-gray-600">{selectedPartner.company_name}</p>
//                           {selectedPartner.phone && (
//                             <p className="text-sm text-gray-500 mt-1">📞 {selectedPartner.phone}</p>
//                           )}
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => setShowCreateForm(true)}
//                         className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
//                       >
//                         <Plus className="h-5 w-5" />
//                         Create Settlement
//                       </button>
//                     </div>
//                   </div>

//                   {/* Stats */}
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                       <p className="text-sm text-gray-600 mb-2">Total Settlements</p>
//                       <p className="text-3xl font-bold text-gray-900">
//                         {settlements.filter(s =>
//                           s.owner_A_id._id === selectedPartner._id ||
//                           s.owner_B_id._id === selectedPartner._id
//                         ).length}
//                       </p>
//                     </div>

//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                       <p className="text-sm text-gray-600 mb-2">Completed</p>
//                       <p className="text-3xl font-bold text-green-600">
//                         {settlements.filter(
//                           s =>
//                             (s.owner_A_id._id === selectedPartner._id ||
//                               s.owner_B_id._id === selectedPartner._id) &&
//                             s.status === 'completed'
//                         ).length}
//                       </p>
//                     </div>

//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                       <p className="text-sm text-gray-600 mb-2">Pending</p>
//                       <p className="text-3xl font-bold text-orange-600">
//                         {settlements.filter(
//                           s =>
//                             (s.owner_A_id._id === selectedPartner._id ||
//                               s.owner_B_id._id === selectedPartner._id) &&
//                             (s.status === 'pending' || s.status === 'partially_paid')
//                         ).length}
//                       </p>
//                     </div>

//                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                       <p className="text-sm text-gray-600 mb-2">Total Amount</p>
//                       <p className="text-2xl font-bold text-gray-900">
//                         {formatCurrency(
//                           settlements
//                             .filter(
//                               s =>
//                                 s.owner_A_id._id === selectedPartner._id ||
//                                 s.owner_B_id._id === selectedPartner._id
//                             )
//                             .reduce((sum, s) => sum + s.net_amount, 0)
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Settlement history */}
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h5 className="text-xl font-semibold text-gray-900">
//                         Settlement History
//                       </h5>
//                     </div>

//                     {settlements.filter(
//                       s =>
//                         s.owner_A_id._id === selectedPartner._id ||
//                         s.owner_B_id._id === selectedPartner._id
//                     ).length > 0 ? (
//                       settlements
//                         .filter(
//                           s =>
//                             s.owner_A_id._id === selectedPartner._id ||
//                             s.owner_B_id._id === selectedPartner._id
//                         )
//                         .map(s => (
//                           <SettlementCard
//                             key={s._id}
//                             settlement={s}
//                             user={user}
//                             onViewDetails={async () => {
//                               const details = await getSettlementById(s._id);
//                               setSelectedSettlement(details);
//                               setActiveTab('settlements');
//                             }}
//                             onAddPayment={() => {
//                               setSelectedSettlement(s);
//                               setShowPaymentForm(true);
//                             }}
//                           />
//                         ))
//                     ) : (
//                       <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
//                         <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//                         <h4 className="text-xl font-semibold text-gray-900 mb-2">
//                           No Settlements Yet
//                         </h4>
//                         <p className="mb-6">
//                           Create your first settlement with {selectedPartner.name}
//                         </p>
//                         <button
//                           onClick={() => setShowCreateForm(true)}
//                           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
//                         >
//                           <Plus className="h-5 w-5" />
//                           Create Settlement
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </motion.div>
//               ) : (
//                 // ALL PARTNERS GRID
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//                 >
//                   {collaborativePartners.length > 0 ? (
//                     collaborativePartners.map((partner, index) => {
//                       const partnerSettlements = settlements.filter(
//                         s =>
//                           s.owner_A_id._id === partner._id ||
//                           s.owner_B_id._id === partner._id
//                       );

//                       return (
//                         <motion.div
//                           key={partner._id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
//                           onClick={() => {
//                             setSelectedPartner(partner);
//                             setPartnerSubTab('partnersList');
//                           }}
//                         >
//                           <div className="flex items-center gap-4 mb-4">
//                             <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
//                               <Users className="h-6 w-6 text-blue-600" />
//                             </div>
//                             <div>
//                               <h4 className="font-semibold text-gray-900 text-lg">{partner.name}</h4>
//                               <p className="text-sm text-gray-600">{partner.company_name}</p>
//                             </div>
//                           </div>

//                           <div className="space-y-2 text-sm text-gray-600 mb-4">
//                             {partner.phone && (
//                               <p className="flex items-center gap-2">
//                                 <span className="text-gray-400">📞</span>
//                                 {partner.phone}
//                               </p>
//                             )}
//                             {partner.email && (
//                               <p className="flex items-center gap-2">
//                                 <span className="text-gray-400">✉️</span>
//                                 {partner.email}
//                               </p>
//                             )}
//                           </div>

//                           <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
//                             <div className="text-center">
//                               <p className="text-xs text-gray-600 mb-1">Settlements</p>
//                               <p className="text-lg font-semibold text-gray-900">{partnerSettlements.length}</p>
//                             </div>

//                             <div className="text-center">
//                               <p className="text-xs text-gray-600 mb-1">Completed</p>
//                               <p className="text-lg font-semibold text-green-600">
//                                 {partnerSettlements.filter(s => s.status === 'completed').length}
//                               </p>
//                             </div>

//                             <div className="text-center">
//                               <p className="text-xs text-gray-600 mb-1">Total</p>
//                               <p className="text-sm font-semibold text-gray-900">
//                                 {formatCurrency(
//                                   partnerSettlements.reduce((sum, s) => sum + s.net_amount, 0)
//                                 )}
//                               </p>
//                             </div>
//                           </div>

//                           <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium group-hover:bg-blue-600 group-hover:text-white">
//                             <FileText className="h-4 w-4" />
//                             View Settlements
//                           </button>
//                         </motion.div>
//                       );
//                     })
//                   ) : (
//                     <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
//                       <Users className="h-20 w-20 mx-auto mb-4 text-gray-300" />
//                       <h4 className="text-2xl font-semibold text-gray-900 mb-2">No Collaborative Partners</h4>
//                       <p className="text-lg mb-4">You need active collaborations to create settlements</p>
//                       <button
//                         onClick={() => setPartnerSubTab('collabRequests')}
//                         className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
//                       >
//                         <UserPlus className="h-5 w-5" />
//                         Send Collaboration Request
//                       </button>
//                     </div>
//                   )}
//                 </motion.div>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {/* Settlements Tab */}
//       {activeTab === 'settlements' && (
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <h3 className="text-xl font-semibold text-gray-900">
//               {selectedSettlement ? 'Settlement Details' : 'All Settlements'}
//             </h3>
//             <div className="flex items-center gap-3">
//               {!selectedSettlement && (
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-gray-400" />
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="pending">Pending</option>
//                     <option value="partially_paid">Partially Paid</option>
//                     <option value="completed">Completed</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>
//               )}
//               {selectedSettlement && (
//                 <button
//                   onClick={() => setSelectedSettlement(null)}
//                   className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
//                 >
//                   <X className="h-4 w-4" />
//                   Back to all
//                 </button>
//               )}
//             </div>
//           </div>

//           {selectedSettlement ? (
//             <SettlementDetails 
//               settlementData={selectedSettlement.settlement}
//               user={user}
//               onApprovePayment={approvePayment}
//               onRejectPayment={rejectPayment}
//               onAddPayment={() => setShowPaymentForm(true)}
//             />
//           ) : (
//             <div className="space-y-4">
//               {filteredSettlements.length > 0 ? (
//                 filteredSettlements.map((settlement) => (
//                   <SettlementCard
//                     key={settlement._id}
//                     settlement={settlement}
//                     user={user}
//                     onViewDetails={async () => {
//                       const details = await getSettlementById(settlement._id);
//                       setSelectedSettlement(details);
//                     }}
//                     onAddPayment={() => {
//                       setSelectedSettlement(settlement);
//                       setShowPaymentForm(true);
//                     }}
//                   />
//                 ))
//               ) : (
//                 <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
//                   <FileText className="h-20 w-20 mx-auto mb-4 text-gray-300" />
//                   <h4 className="text-2xl font-semibold text-gray-900 mb-2">
//                     {statusFilter === 'all' ? 'No Settlements Found' : `No ${statusFilter} Settlements`}
//                   </h4>
//                   <p className="text-lg mb-6">
//                     {statusFilter === 'all' 
//                       ? 'Create your first settlement to start managing payments'
//                       : `Try changing the filter or create a new settlement`
//                     }
//                   </p>
//                   <button
//                     onClick={() => setShowCreateForm(true)}
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
//                   >
//                     <Plus className="h-5 w-5" />
//                     Create Settlement
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Modals */}
//       <AnimatePresence>
//         {showCreateForm && (
//           <CreateSettlementForm
//             partners={collaborativePartners}
//             settlements={settlements}
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
//             settlement={selectedSettlement}
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

//cubeversion2
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
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  UserPlus,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import CreateSettlementForm from './CreateSettlementForm';
import AddPaymentForm from './AddPaymentForm';
import CollaborationRequestsTab from '../Collaboration/CollaborationRequestsTab';

// Helper functions
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
      label: 'Pending Review',
      icon: <Clock className="h-4 w-4" />
    },
    approved: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Approved',
      icon: <CheckCircle className="h-4 w-4" />
    },
    rejected: { 
      color: 'bg-red-100 text-red-800', 
      label: 'Rejected',
      icon: <X className="h-4 w-4" />
    },
    cancelled: { 
      color: 'bg-gray-100 text-gray-800', 
      label: 'Cancelled',
      icon: <X className="h-4 w-4" />
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
    >
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
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
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
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Net Amount</p>
          <p className="font-semibold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-600 mb-1">Approved</p>
          <p className="font-semibold text-green-600">{formatCurrency(totalApproved)}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-orange-600 mb-1">Due</p>
          <p className="font-semibold text-orange-600">{formatCurrency(remainingDue)}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Trips</p>
          <p className="font-semibold text-blue-600">{settlement.trip_ids?.length || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-700">
          {isPayable 
            ? <span className="text-orange-600">You owe {formatCurrency(remainingDue)}</span>
            : <span className="text-green-600">Owes you {formatCurrency(remainingDue)}</span>
          }
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View Details
          </button>
          {isPayable && remainingDue > 0 && (
            <button
              onClick={onAddPayment}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Payment
            </button>
          )}
        </div>
      </div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-2 rounded-lg ${
          isFromMe ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {isFromMe ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {isFromMe ? 'You paid' : `${payment.paid_by.name} paid`} via <span className="font-medium">{payment.payment_mode}</span>
          </p>
          {payment.reference_number && (
            <p className="text-sm text-gray-500">Ref: {payment.reference_number}</p>
          )}
          {payment.notes && (
            <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
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
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>

          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                {canApprove && (
                  <button
                    onClick={() => {
                      onApprove(settlementId, paymentIndex);
                      setShowActions(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Payment
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) {
                        onReject(settlementId, paymentIndex, reason);
                        setShowActions(false);
                      }
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Reject Payment
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Settlement Details Component
const SettlementDetails = ({ settlementData, user, onApprovePayment, onRejectPayment, onAddPayment }) => {
  const [activeTab, setActiveTab] = useState('summary');

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

  const settlement = settlementData;
  const statusConfig = getStatusConfig(settlement.status);
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Settlement with {partnerName}</h4>
            <p className="text-gray-600 mt-1">{partnerCompany}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
              <Calendar className="h-4 w-4" />
              {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Net Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(settlement.net_amount)}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-green-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-yellow-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-orange-600 mb-1">Due</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(remainingDue)}</p>
          </div>
        </div>

        {/* Action Button */}
        {isPayable && remainingDue > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onAddPayment}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
            >
              <Plus className="h-5 w-5" />
              Add Payment
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'breakdown', label: 'Amount Breakdown' },
            { id: 'trips', label: `Trips (${settlement.trip_breakdown?.length || 0})` },
            { id: 'payments', label: `Payments (${settlement.payments?.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Payment Progress
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-semibold">{formatCurrency(settlement.net_amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${(totalApproved / settlement.net_amount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600">{Math.round((totalApproved / settlement.net_amount) * 100)}% Paid</span>
                    <span className="text-gray-600">{formatCurrency(remainingDue)} remaining</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Quick Stats
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-900">Total Trips</span>
                    <span className="font-semibold text-blue-900">{settlement.trip_breakdown?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-900">Approved Payments</span>
                    <span className="font-semibold text-green-900">{approvedPayments.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-yellow-900">Pending Payments</span>
                    <span className="font-semibold text-yellow-900">{pendingPayments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'breakdown' && (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <h5 className="text-lg font-semibold text-gray-900 mb-6">Amount Breakdown</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">You → Partner Trips</span>
                    <span className="text-sm text-blue-600">{aToBTrips.length} trips</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(aToBAmount)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">Partner → You Trips</span>
                    <span className="text-sm text-green-600">{bToATrips.length} trips</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(bToAAmount)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-medium text-orange-900">Net Settlement</span>
                  <p className="text-2xl font-bold text-orange-900 mt-2">{formatCurrency(settlement.net_amount)}</p>
                  <p className="text-sm text-orange-700 mt-2">
                    {isPayable ? 'You pay to partner' : 'Partner pays to you'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="font-medium text-purple-900">Payable By</span>
                  <p className="text-xl font-bold text-purple-900 mt-2">
                    {settlement.amount_breakdown.net_payable_by === 'owner_A' ? 'Owner A (You)' : 
                     settlement.amount_breakdown.net_payable_by === 'owner_B' ? 'Owner B (Partner)' : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'trips' && (
          <motion.div
            key="trips"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
            <h5 className="text-lg font-semibold text-gray-900 mb-4">
              Trip Breakdown ({settlement.trip_breakdown?.length || 0} trips)
            </h5>
            <div className="space-y-3">
              {settlement.trip_breakdown?.map((trip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl border border-gray-200"
          >
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
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</p>
                <p>Add your first payment to get started</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main SettlementTab Component
const SettlementTab = () => {
  const { user } = useAuth();
  const [collaborativePartners, setCollaborativePartners] = useState([]);
  const [unsettledAmounts, setUnsettledAmounts] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [partnerSubTab, setPartnerSubTab] = useState('partnersList');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

    useEffect(() => {
    const loadUnsettledAmounts = async () => {
      if (collaborativePartners.length > 0) {
        const amounts = {};
        
        for (const partner of collaborativePartners) {
        const unsettled = await fetchUnsettledAmounts(partner._id);
        console.log(`Partner ${partner.name} unsettled:`, unsettled); // ADD THIS
        amounts[partner._id] = unsettled;
      }
      
      console.log('Final unsettled amounts:', amounts);
        
        setUnsettledAmounts(amounts);
      }
    };
    
    loadUnsettledAmounts();
  }, [collaborativePartners]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [partnersRes, settlementsRes] = await Promise.all([
        api.get('/settlements/partners'),
        api.get('/settlements')
      ]);

      setCollaborativePartners(partnersRes.data.data || []);
      setSettlements(settlementsRes.data.data?.settlements || []);

    } catch (error) {
      console.error('Failed to fetch settlement data', error);
      toast.error(error.response?.data?.error || 'Failed to fetch settlement data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnsettledAmounts = async (partnerId) => {
  try {
    const response = await api.post('/settlements/unsettled-ranges', {
      owner_B_id: partnerId
    });
    console.log('API Response for partner', partnerId, ':', response.data);
    const data = response.data.data;
    
    let myTripsForPartner = 0;
    let partnerTripsForMe = 0;
    
    if (data.unsettled_ranges && data.unsettled_ranges.length > 0) {
      data.unsettled_ranges.forEach(range => {
        if (range.trips_a_to_b) {
          myTripsForPartner += range.trips_a_to_b.reduce((sum, trip) => sum + trip.customer_amount, 0);
        }
        if (range.trips_b_to_a) {
          partnerTripsForMe += range.trips_b_to_a.reduce((sum, trip) => sum + trip.customer_amount, 0);
        }
      });
    }
    
    return {
      myTripsForPartner,
      partnerTripsForMe,
      netAmount: myTripsForPartner - partnerTripsForMe
    };
  } catch (error) {
    console.error('Failed to fetch unsettled amounts:', error);
    return { myTripsForPartner: 0, partnerTripsForMe: 0, netAmount: 0 };
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

  // Filter settlements
  const filteredSettlements = statusFilter === 'all' 
    ? settlements 
    : settlements.filter(s => s.status === statusFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settlement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Collaboration Management</h2>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setPartnerSubTab('partnersList');
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium"
        >
          <Plus className="h-5 w-5" />
          Create Settlement
        </button>
      </div>

      {/* Tabs - REORDERED: Overview → Partners → Settlements */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'partners', label: 'Partners', icon: <Users className="h-4 w-4" /> },
            { id: 'settlements', label: 'Settlements', icon: <FileText className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_settlements}</p>
              <p className="text-sm text-gray-600 mt-1">Settlements</p>
              <p className="text-xs text-green-600 mt-2">
                {stats.completed_settlements} completed
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Amount</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.total_amount)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Value</p>
              <p className="text-xs text-green-600 mt-2">
                {formatCurrency(stats.total_paid)} paid
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">Pending</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.total_due)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Due Amount</p>
              <p className="text-xs text-yellow-600 mt-2">
                {stats.pending_settlements} pending
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.completion_rate}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Completion</p>
              <p className="text-xs text-purple-600 mt-2">
                Settlement efficiency
              </p>
            </motion.div>
          </div>

          {/* Recent Settlements */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Recent Settlements</h3>
              <button
                onClick={() => setActiveTab('settlements')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </button>
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
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No Settlements Yet</h4>
                  <p className="mb-6">Create your first settlement to get started</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                  >
                    <Plus className="h-5 w-5" />
                    Create Settlement
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Sub Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPartnerSubTab('partnersList');
                  setSelectedPartner(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  partnerSubTab === 'partnersList'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Partners List
              </button>

              <button
                onClick={() => {
                  setPartnerSubTab('collabRequests');
                  setSelectedPartner(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  partnerSubTab === 'collabRequests'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Collaboration Requests
              </button>
            </div>
          </div>

          {/* SUB TAB CONTENT */}
          {partnerSubTab === 'collabRequests' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <CollaborationRequestsTab />
            </motion.div>
          ) : (
            <>
              {/* If a partner is selected, show details */}
              {selectedPartner ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    <X className="h-4 w-4" />
                    Back to partners
                  </button>

                  {/* Partner Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900">{selectedPartner.name}</h4>
                          <p className="text-lg text-gray-600">{selectedPartner.company_name}</p>
                          {selectedPartner.phone && (
                            <p className="text-sm text-gray-500 mt-1">📞 {selectedPartner.phone}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                      >
                        <Plus className="h-5 w-5" />
                        Create Settlement
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-600 mb-2">Total Settlements</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {settlements.filter(s =>
                          s.owner_A_id._id === selectedPartner._id ||
                          s.owner_B_id._id === selectedPartner._id
                        ).length}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-600 mb-2">Completed</p>
                      <p className="text-3xl font-bold text-green-600">
                        {settlements.filter(
                          s =>
                            (s.owner_A_id._id === selectedPartner._id ||
                              s.owner_B_id._id === selectedPartner._id) &&
                            s.status === 'completed'
                        ).length}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-600 mb-2">Pending</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {settlements.filter(
                          s =>
                            (s.owner_A_id._id === selectedPartner._id ||
                              s.owner_B_id._id === selectedPartner._id) &&
                            (s.status === 'pending' || s.status === 'partially_paid')
                        ).length}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          settlements
                            .filter(
                              s =>
                                s.owner_A_id._id === selectedPartner._id ||
                                s.owner_B_id._id === selectedPartner._id
                            )
                            .reduce((sum, s) => sum + s.net_amount, 0)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Settlement history */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xl font-semibold text-gray-900">
                        Settlement History
                      </h5>
                    </div>

                    {settlements.filter(
                      s =>
                        s.owner_A_id._id === selectedPartner._id ||
                        s.owner_B_id._id === selectedPartner._id
                    ).length > 0 ? (
                      settlements
                        .filter(
                          s =>
                            s.owner_A_id._id === selectedPartner._id ||
                            s.owner_B_id._id === selectedPartner._id
                        )
                        .map(s => (
                          <SettlementCard
                            key={s._id}
                            settlement={s}
                            user={user}
                            onViewDetails={async () => {
                              const details = await getSettlementById(s._id);
                              setSelectedSettlement(details);
                              setActiveTab('settlements');
                            }}
                            onAddPayment={() => {
                              setSelectedSettlement(s);
                              setShowPaymentForm(true);
                            }}
                          />
                        ))
                    ) : (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          No Settlements Yet
                        </h4>
                        <p className="mb-6">
                          Create your first settlement with {selectedPartner.name}
                        </p>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                        >
                          <Plus className="h-5 w-5" />
                          Create Settlement
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // ALL PARTNERS GRID
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {collaborativePartners.length > 0 ? (
                    collaborativePartners.map((partner, index) => {
                      const partnerSettlements = settlements.filter(
                        s =>
                          s.owner_A_id._id === partner._id ||
                          s.owner_B_id._id === partner._id
                      );
                      const unsettled = unsettledAmounts[partner._id] || { myTripsForPartner: 0, partnerTripsForMe: 0, netAmount: 0 };
                      console.log(`Rendering partner ${partner.name}:`, unsettled); // ADD THIS


                      return (
                        <motion.div
                          key={partner._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setPartnerSubTab('partnersList');
                          }}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{partner.name}</h4>
                              <p className="text-sm text-gray-600">{partner.company_name}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            {partner.phone && (
                              <p className="flex items-center gap-2">
                                <span className="text-gray-400">📞</span>
                                {partner.phone}
                              </p>
                            )}
                            {partner.email && (
                              <p className="flex items-center gap-2">
                                <span className="text-gray-400">✉️</span>
                                {partner.email}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Settlements</p>
                              <p className="text-lg font-semibold text-gray-900">{partnerSettlements.length}</p>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Completed</p>
                              <p className="text-lg font-semibold text-green-600">
                                {partnerSettlements.filter(s => s.status === 'completed').length}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-gray-600 mb-1">Total</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  partnerSettlements.reduce((sum, s) => sum + s.net_amount, 0)
                                )}
                              </p>
                            </div>
                          </div>

                          {(unsettled.myTripsForPartner > 0 || unsettled.partnerTripsForMe > 0) && (
                              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Unsettled Trips
                                </p>
                                <div className="space-y-1.5">
                                  {unsettled.myTripsForPartner > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-orange-700">You → Partner</span>
                                      <span className="font-semibold text-orange-900">
                                        {formatCurrency(unsettled.myTripsForPartner)}
                                      </span>
                                    </div>
                                  )}
                                  {unsettled.partnerTripsForMe > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-green-700">Partner → You</span>
                                      <span className="font-semibold text-green-900">
                                        {formatCurrency(unsettled.partnerTripsForMe)}
                                      </span>
                                    </div>
                                  )}
                                  {unsettled.netAmount !== 0 && (
                                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-yellow-300">
                                      <span className="font-medium text-yellow-900">Net Unsettled</span>
                                      <span className={`font-bold ${
                                        unsettled.netAmount > 0 ? 'text-orange-900' : 'text-green-900'
                                      }`}>
                                        {unsettled.netAmount > 0 ? '+' : ''}{formatCurrency(Math.abs(unsettled.netAmount))}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium group-hover:bg-blue-600 group-hover:text-white">
                            <FileText className="h-4 w-4" />
                            View Settlements
                          </button>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
                      <Users className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                      <h4 className="text-2xl font-semibold text-gray-900 mb-2">No Collaborative Partners</h4>
                      <p className="text-lg mb-4">You need active collaborations to create settlements</p>
                      <button
                        onClick={() => setPartnerSubTab('collabRequests')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                      >
                        <UserPlus className="h-5 w-5" />
                        Send Collaboration Request
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedSettlement ? 'Settlement Details' : 'All Settlements'}
            </h3>
            <div className="flex items-center gap-3">
              {!selectedSettlement && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              {selectedSettlement && (
                <button
                  onClick={() => setSelectedSettlement(null)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  <X className="h-4 w-4" />
                  Back to all
                </button>
              )}
            </div>
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
              {filteredSettlements.length > 0 ? (
                filteredSettlements.map((settlement) => (
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
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
                  <FileText className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                    {statusFilter === 'all' ? 'No Settlements Found' : `No ${statusFilter} Settlements`}
                  </h4>
                  <p className="text-lg mb-6">
                    {statusFilter === 'all' 
                      ? 'Create your first settlement to start managing payments'
                      : `Try changing the filter or create a new settlement`
                    }
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                  >
                    <Plus className="h-5 w-5" />
                    Create Settlement
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateSettlementForm
            partners={collaborativePartners}
            settlements={settlements}
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