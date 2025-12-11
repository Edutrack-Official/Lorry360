
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import {
//   ArrowLeft,
//   Truck,
//   Calendar,
//   MapPin,
//   Package,
//   IndianRupee,
//   Search,
//   RefreshCw,
//   TrendingUp,
//   TrendingDown,
//   Users,
//   CreditCard,
//   Plus,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Filter,
//   Banknote,
//   Building2,
//   Smartphone,
//   Wallet
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import api from '../../api/client';
// import { useAuth } from '../../contexts/AuthContext';

// interface Partner {
//   _id: string;
//   name: string;
//   phone: string;
//   email: string;
//   company_name: string;
// }

// interface Trip {
//   _id: string;
//   trip_number: string;
//   trip_date: string;
//   material_name: string;
//   location: string;
//   customer_amount: number;
//   crusher_amount: number;
//   profit: number;
//   status: string;
//   notes?: string;
//   owner_id: string;
//   collab_owner_id?: {
//     _id: string;
//     name: string;
//     company_name: string;
//   };
// }

// interface Payment {
//   _id: string;
//   payment_number: string;
//   payment_type: string;
//   amount: number;
//   payment_date: string;
//   payment_mode: string;
//   notes?: string;
//   collab_payment_status: 'pending' | 'approved' | 'rejected';
//   owner_id: {
//     _id: string;
//     name: string;
//   };
//   collab_owner_id?: {
//     _id: string;
//     name: string;
//   };
//   createdAt: string;
// }

// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount || 0);
// };

// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// };

// const CollaborationDetailsPage = () => {
//   const { partnerId } = useParams<{ partnerId: string }>();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();
  
//   const [partner, setPartner] = useState<Partner | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeMainTab, setActiveMainTab] = useState<'trips' | 'payments'>('trips');
//   const [activeTripsTab, setActiveTripsTab] = useState<'my-trips' | 'partner-trips'>('my-trips');
//   const [activePaymentsTab, setActivePaymentsTab] = useState<'my-payments' | 'partner-payments'>('my-payments');
  
//   const [myTrips, setMyTrips] = useState<Trip[]>([]);
//   const [partnerTrips, setPartnerTrips] = useState<Trip[]>([]);
//   const [myPayments, setMyPayments] = useState<Payment[]>([]);
//   const [partnerPayments, setPartnerPayments] = useState<Payment[]>([]);
  
//   const [searchText, setSearchText] = useState('');
//   const [dateRange, setDateRange] = useState({ start: '', end: '' });
//   const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

//   useEffect(() => {
//     if (location.state?.partner) {
//       setMyPayments([]);
//       setPartnerPayments([]);
//       setMyTrips([]);
//       setPartnerTrips([]);
      
//       setPartner(location.state.partner);
//       fetchData();
//     } else {
//       navigate('/partners');
//     }
//   }, [partnerId]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       await Promise.all([fetchTrips(), fetchPayments()]);
//     } catch (error: any) {
//       toast.error('Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTrips = async () => {
//     try {
//       const [myTripsRes, partnerTripsRes] = await Promise.all([
//         api.get('/trips', {
//           params: {
//             trip_type: 'collaborative',
//             collab_owner_id: partnerId,
//             fetch_mode: 'as_owner'
//           }
//         }),
//         api.get('/trips', {
//           params: {
//             trip_type: 'collaborative',
//             collab_owner_id: partnerId,
//             fetch_mode: 'as_collaborator'
//           }
//         })
//       ]);
      
//     //   setMyTrips(myTripsRes.data.data?.trips || []);
//     //   setPartnerTrips(partnerTripsRes.data.data?.trips || []);

//     setMyTrips(
//   (myTripsRes.data.data?.trips || []).filter(
//     (trip:any) => trip.status === "completed"
//   )
// );

// setPartnerTrips(
//   (partnerTripsRes.data.data?.trips || []).filter(
//     (trip:any) => trip.status === "completed"
//   )
// );

//     } catch (error: any) {
//       console.error('Failed to fetch trips:', error);
//     }
//   };

//   const fetchPayments = async () => {
//     try {
//       const myPaymentsRes = await api.get(`/payments/to-partner/${partnerId}`);
//       const partnerPaymentsRes = await api.get('/payments-received', {
//         params: { owner_id: partnerId }
//       });

//       setMyPayments(myPaymentsRes.data.data?.payments || []);
//       setPartnerPayments(partnerPaymentsRes.data.data?.payments || []);
//     } catch (error: any) {
//       console.error('Failed to fetch payments:', error);
//       toast.error('Failed to fetch payments');
//     }
//   };

//   const handleApprovePayment = async (paymentId: string, ownerId:any) => {
//     try {
//       await api.put(`/payments/collab/${paymentId}/status`, {
//         status: 'approved',
//         owner_id: ownerId
//       });
//       toast.success('Payment approved successfully');
//       fetchPayments();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Failed to approve payment');
//     }
//   };

//   const handleRejectPayment = async (paymentId: any, ownerId: any) => {
//     try {
//       await api.put(`/payments/collab/${paymentId}/status`, {
//         status: 'rejected',
//         owner_id: ownerId
//       });
//       toast.success('Payment rejected');
//       fetchPayments();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Failed to reject payment');
//     }
//   };

//   const calculateTotals = () => {
//     const totalMyTripsAmount = myTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
//     const totalPartnerTripsAmount = partnerTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
    
//     const totalMyPayments = myPayments
//       .filter(p => p.collab_payment_status === 'approved')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const totalPartnerPayments = partnerPayments
//       .filter(p => p.collab_payment_status === 'approved')
//       .reduce((sum, payment) => sum + payment.amount, 0);
    
//     const netTripAmount = totalPartnerTripsAmount - totalMyTripsAmount;
//     const totalPaymentsMade = totalMyPayments + totalPartnerPayments;
//     const finalBalance = netTripAmount - totalMyPayments + totalPartnerPayments;
    
//     return {
//       totalMyTripsAmount,
//       totalPartnerTripsAmount,
//       totalMyPayments,
//       totalPartnerPayments,
//       netTripAmount,
//       totalPaymentsMade,
//       finalBalance,
//       myTripCount: myTrips.length,
//       partnerTripCount: partnerTrips.length,
//       myPaymentCount: myPayments.length,
//       partnerPaymentCount: partnerPayments.length
//     };
//   };

//   const filteredTrips = () => {
//     const trips = activeTripsTab === 'my-trips' ? myTrips : partnerTrips;
    
//     return trips.filter(trip => {
//       const matchesSearch = !searchText || 
//         trip.trip_number.toLowerCase().includes(searchText.toLowerCase()) ||
//         trip.material_name.toLowerCase().includes(searchText.toLowerCase()) ||
//         trip.location.toLowerCase().includes(searchText.toLowerCase());
      
//       const tripDate = new Date(trip.trip_date);
//       const matchesDateRange =
//         (!dateRange.start || tripDate >= new Date(dateRange.start)) &&
//         (!dateRange.end || tripDate <= new Date(dateRange.end));
      
//       return matchesSearch && matchesDateRange;
//     });
//   };

//   const filteredPayments = () => {
//     const payments = activePaymentsTab === 'my-payments' ? myPayments : partnerPayments;
    
//     return payments.filter(payment => {
//       const matchesSearch = !searchText ||
//         payment.payment_number.toLowerCase().includes(searchText.toLowerCase()) ||
//         payment.payment_mode.toLowerCase().includes(searchText.toLowerCase()) ||
//         payment.notes?.toLowerCase().includes(searchText.toLowerCase());
      
//       const matchesStatus = paymentStatusFilter === 'all' || 
//         payment.collab_payment_status === paymentStatusFilter;
      
//       const paymentDate = new Date(payment.payment_date);
//       const matchesDateRange =
//         (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
//         (!dateRange.end || paymentDate <= new Date(dateRange.end));
      
//       return matchesSearch && matchesStatus && matchesDateRange;
//     });
//   };

//   const getPaymentModeConfig = (mode: string) => {
//     const configs = {
//       cash: { color: 'bg-green-100 text-green-700 border-green-200', icon: Banknote, label: 'Cash' },
//       bank_transfer: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Building2, label: 'Bank Transfer' },
//       cheque: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CreditCard, label: 'Cheque' },
//       upi: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Smartphone, label: 'UPI' },
//       other: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Wallet, label: 'Other' }
//     };
//     return configs[mode as keyof typeof configs] || configs.other;
//   };

//   const getStatusConfig = (status: string) => {
//     const configs = {
//       pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending', icon: Clock },
//       approved: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Approved', icon: CheckCircle },
//       rejected: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: XCircle }
//     };
//     return configs[status as keyof typeof configs] || configs.pending;
//   };

//   const TripCard = ({ trip, type }: { trip: Trip; type: 'my' | 'partner' }) => (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
//     >
//       <div className="flex items-start justify-between mb-2">
//         <div className="flex items-center gap-2">
//           <div className={`p-1.5 rounded-lg ${
//             type === 'my' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
//           }`}>
//             <Truck className="h-4 w-4" />
//           </div>
//           <div>
//             <h4 className="font-bold text-gray-900 text-sm">{trip.trip_number}</h4>
//             <p className="text-xs text-gray-500">{formatDate(trip.trip_date)}</p>
//           </div>
//         </div>
//         <div className="text-right">
//           <p className="font-bold text-gray-900 text-sm">{formatCurrency(trip.customer_amount)}</p>
//           <p className="text-xs text-gray-500 capitalize">{trip.status}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-2 text-xs">
//         <div className="flex items-center gap-1">
//           <Package className="h-3 w-3 text-gray-400" />
//           <span className="truncate">{trip.material_name}</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <MapPin className="h-3 w-3 text-gray-400" />
//           <span className="truncate">{trip.location}</span>
//         </div>
//       </div>

//       {trip.notes && (
//         <p className="text-xs text-gray-600 italic border-t pt-2 mt-2">{trip.notes}</p>
//       )}
//     </motion.div>
//   );

//   const PaymentCard = ({ payment, canApproveReject }: { payment: Payment; canApproveReject: boolean }) => {
//     const modeConfig = getPaymentModeConfig(payment.payment_mode);
//     const statusConfig = getStatusConfig(payment.collab_payment_status);
//     const ModeIcon = modeConfig.icon;
//     const StatusIcon = statusConfig.icon;

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
//       >
//         <div className="flex items-start justify-between mb-3">
//           <div>
//             <h4 className="font-bold text-gray-900 text-sm mb-1">{payment.payment_number}</h4>
//             <div className="flex items-center gap-2">
//               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${modeConfig.color}`}>
//                 <ModeIcon className="h-3 w-3" />
//                 {modeConfig.label}
//               </span>
//               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig.color}`}>
//                 <StatusIcon className="h-3 w-3" />
//                 {statusConfig.label}
//               </span>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="font-bold text-green-600 text-lg">{formatCurrency(payment.amount)}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
//           <Calendar className="h-3 w-3" />
//           <span>{formatDate(payment.payment_date)}</span>
//         </div>

//         {payment.notes && (
//           <p className="text-xs text-gray-600 mb-3">{payment.notes}</p>
//         )}

//         {canApproveReject && payment.collab_payment_status === 'pending' && (
//           <div className="flex gap-2 pt-3 border-t">
//             <button
//               onClick={() => handleApprovePayment(payment._id, payment.owner_id._id || payment.owner_id)}
//               className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
//             >
//               <CheckCircle className="h-3 w-3" />
//               Approve
//             </button>
//             <button
//               onClick={() => handleRejectPayment(payment._id, payment.owner_id._id || payment.owner_id)}
//               className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
//             >
//               <XCircle className="h-3 w-3" />
//               Reject
//             </button>
//           </div>
//         )}
//       </motion.div>
//     );
//   };

//   const totals = calculateTotals();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!partner) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <h2 className="text-xl font-bold text-gray-900 mb-4">Partner Not Found</h2>
//         <button
//           onClick={() => navigate('/partners')}
//           className="text-blue-600 hover:text-blue-700"
//         >
//           ← Back to Collaborations
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b shadow-sm">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => navigate('/partners')}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </button>
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Users className="h-5 w-5 text-blue-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-lg font-bold text-gray-900">{partner.name}</h1>
//                   <p className="text-sm text-gray-600">{partner.company_name}</p>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={fetchData}
//               className="p-2 hover:bg-gray-100 rounded-lg"
//               title="Refresh"
//             >
//               <RefreshCw className="h-4 w-4" />
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
//               <p className="text-l text-blue-800 mb-1">Total Trips Value</p>
//               <p className="text-l text-blue-600">
//                 Partner Trips: {formatCurrency(totals.totalPartnerTripsAmount)} <p></p> My Trips: {formatCurrency(totals.totalMyTripsAmount)}
//               </p>
//             </div>
//             <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
//               <p className="text-xs text-green-700 mb-1">Total Payments (Approved)</p>
//               <p className="text-lg font-bold text-green-900">{formatCurrency(totals.totalPaymentsMade)}</p>
//               <p className="text-xs text-green-600">
//                 Mine: {formatCurrency(totals.totalMyPayments)} • Partner: {formatCurrency(totals.totalPartnerPayments)}
//               </p>
//             </div>
//             <div className={`p-3 rounded-lg border ${
//               totals.finalBalance > 0 
//                 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
//                 : totals.finalBalance < 0
//                 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
//                 : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
//             }`}>
//               <div className="flex items-center gap-1 mb-1">
//                 {totals.finalBalance > 0 ? (
//                   <TrendingDown className="h-3 w-3 text-green-600" />
//                 ) : totals.finalBalance < 0 ? (
//                   <TrendingUp className="h-3 w-3 text-orange-600" />
//                 ) : null}
//                 <p className={`text-xs ${
//                   totals.finalBalance > 0 ? 'text-green-700' : 
//                   totals.finalBalance < 0 ? 'text-orange-700' : 'text-gray-700'
//                 }`}>
//                   {totals.finalBalance > 0 ? `You need to pay ${partner.name}` : 
//                    totals.finalBalance < 0 ? `${partner.name} needs to pay you` : 'All settled'}
//                 </p>
//               </div>
//               <p className={`text-lg font-bold ${
//                 totals.finalBalance > 0 ? 'text-green-900' : 
//                 totals.finalBalance < 0 ? 'text-orange-900' : 'text-gray-900'
//               }`}>
//                 {formatCurrency(Math.abs(totals.finalBalance))}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 py-4">
//         <div className="bg-white rounded-lg p-1.5 border border-gray-200 shadow-sm mb-4 inline-flex gap-1">
//           <button
//             onClick={() => setActiveMainTab('trips')}
//             className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
//               activeMainTab === 'trips'
//                 ? 'bg-blue-600 text-white shadow-sm'
//                 : 'text-gray-700 hover:bg-gray-100'
//             }`}
//           >
//             <Truck className="h-4 w-4" />
//             <span>Trips</span>
//             <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
//               activeMainTab === 'trips'
//                 ? 'bg-white/20 text-white'
//                 : 'bg-gray-200 text-gray-700'
//             }`}>
//               {myTrips.length + partnerTrips.length}
//             </span>
//           </button>
//           <button
//             onClick={() => setActiveMainTab('payments')}
//             className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
//               activeMainTab === 'payments'
//                 ? 'bg-green-600 text-white shadow-sm'
//                 : 'text-gray-700 hover:bg-gray-100'
//             }`}
//           >
//             <CreditCard className="h-4 w-4" />
//             <span>Payments</span>
//             <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
//               activeMainTab === 'payments'
//                 ? 'bg-white/20 text-white'
//                 : 'bg-gray-200 text-gray-700'
//             }`}>
//               {myPayments.length + partnerPayments.length}
//             </span>
//           </button>
//         </div>

//         <div className="bg-white rounded-lg border shadow-sm p-3 mb-4">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
//             <div className="flex border-b md:border-b-0">
//               {activeMainTab === 'trips' ? (
//                 <>
//                   <button
//                     onClick={() => setActiveTripsTab('my-trips')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 ${
//                       activeTripsTab === 'my-trips'
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }`}
//                   >
//                     My Trips
//                     <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
//                       {myTrips.length}
//                     </span>
//                   </button>
//                   <button
//                     onClick={() => setActiveTripsTab('partner-trips')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 ${
//                       activeTripsTab === 'partner-trips'
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }`}
//                   >
//                     Partner Trips
//                     <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
//                       {partnerTrips.length}
//                     </span>
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => setActivePaymentsTab('my-payments')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 ${
//                       activePaymentsTab === 'my-payments'
//                         ? 'border-green-500 text-green-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }`}
//                   >
//                     My Payments
//                     <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
//                       {myPayments.length}
//                     </span>
//                   </button>
//                   <button
//                     onClick={() => setActivePaymentsTab('partner-payments')}
//                     className={`px-4 py-2 font-medium text-sm border-b-2 ${
//                       activePaymentsTab === 'partner-payments'
//                         ? 'border-green-500 text-green-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }`}
//                   >
//                     Partner Payments
//                     <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
//                       {partnerPayments.length}
//                     </span>
//                   </button>
//                 </>
//               )}
//             </div>
            
//             <div className="flex items-center gap-2">
//               {activeMainTab === 'payments' && (
//                 <select
//                   value={paymentStatusFilter}
//                   onChange={(e) => setPaymentStatusFilter(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="approved">Approved</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//               )}
              
//               <div className="flex gap-2">
//                 <input
//                   type="date"
//                   value={dateRange.start}
//                   onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                 />
//                 <input
//                   type="date"
//                   value={dateRange.end}
//                   onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                 />
//               </div>
              
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {activeMainTab === 'payments' && activePaymentsTab === 'my-payments' && (
//           <div className="mb-4">
//             <button
//               onClick={() => navigate(`/partners/${partnerId}/payments/create`)}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
//             >
//               <Plus className="h-4 w-4" />
//               Add Payment
//             </button>
//           </div>
//         )}

//         <div className="bg-white rounded-lg border shadow-sm p-4">
//           <h3 className="text-base font-semibold text-gray-900 mb-4">
//             {activeMainTab === 'trips' 
//               ? (activeTripsTab === 'my-trips' 
//                   ? `My Trips to ${partner.name}` 
//                   : `${partner.name}'s Trips to Me`)
//               : (activePaymentsTab === 'my-payments'
//                   ? `My Payments to ${partner.name}`
//                   : `${partner.name}'s Payments to Me`)}
//             <span className="text-gray-500 font-normal ml-2">
//               ({activeMainTab === 'trips' ? filteredTrips().length : filteredPayments().length} items)
//             </span>
//           </h3>
          
//           {activeMainTab === 'trips' ? (
//             filteredTrips().length === 0 ? (
//               <div className="text-center py-12">
//                 <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                 <h4 className="text-base font-semibold text-gray-900 mb-2">No trips found</h4>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredTrips().map((trip) => (
//                   <TripCard 
//                     key={trip._id} 
//                     trip={trip} 
//                     type={activeTripsTab === 'my-trips' ? 'my' : 'partner'} 
//                   />
//                 ))}
//               </div>
//             )
//           ) : (
//             filteredPayments().length === 0 ? (
//               <div className="text-center py-12">
//                 <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                 <h4 className="text-base font-semibold text-gray-900 mb-2">No payments found</h4>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {filteredPayments().map((payment) => (
//                   <PaymentCard 
//                     key={payment._id} 
//                     payment={payment}
//                     canApproveReject={activePaymentsTab === 'partner-payments'}
//                   />
//                 ))}
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CollaborationDetailsPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Calendar,
  MapPin,
  Package,
  IndianRupee,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Banknote,
  Building2,
  Smartphone,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Partner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  company_name: string;
}

interface Trip {
  _id: string;
  trip_number: string;
  trip_date: string;
  material_name: string;
  location: string;
  customer_amount: number;
  crusher_amount: number;
  profit: number;
  status: string;
  collab_trip_status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  owner_id: string;
  collab_owner_id?: {
    _id: string;
    name: string;
    company_name: string;
  };
}

interface Payment {
  _id: string;
  payment_number: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string;
  collab_payment_status: 'pending' | 'approved' | 'rejected';
  owner_id: {
    _id: string;
    name: string;
  };
  collab_owner_id?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CollaborationDetailsPage = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'trips' | 'payments'>('trips');
  const [activeTripsTab, setActiveTripsTab] = useState<'my-trips' | 'partner-trips'>('my-trips');
  const [activePaymentsTab, setActivePaymentsTab] = useState<'my-payments' | 'partner-payments'>('my-payments');
  
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [partnerTrips, setPartnerTrips] = useState<Trip[]>([]);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [partnerPayments, setPartnerPayments] = useState<Payment[]>([]);
  
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [tripStatusFilter, setTripStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (location.state?.partner) {
      setMyPayments([]);
      setPartnerPayments([]);
      setMyTrips([]);
      setPartnerTrips([]);
      
      setPartner(location.state.partner);
      fetchData();
    } else {
      navigate('/partners');
    }
  }, [partnerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTrips(), fetchPayments()]);
    } catch (error: any) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ WORKFLOW: Only fetch "completed" trips for approval
  const fetchTrips = async () => {
    try {
      const [myTripsRes, partnerTripsRes] = await Promise.all([
        api.get('/trips', {
          params: {
            trip_type: 'collaborative',
            collab_owner_id: partnerId,
            fetch_mode: 'as_owner',
            status: 'completed'  // ✅ Only fetch completed trips
          }
        }),
        api.get('/trips', {
          params: {
            trip_type: 'collaborative',
            collab_owner_id: partnerId,
            fetch_mode: 'as_collaborator',
            status: 'completed'  // ✅ Only fetch completed trips
          }
        })
      ]);
      
      // Show all completed trips (including pending, approved, rejected)
      setMyTrips(myTripsRes.data.data?.trips || []);
      setPartnerTrips(partnerTripsRes.data.data?.trips || []);

    } catch (error: any) {
      console.error('Failed to fetch trips:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const myPaymentsRes = await api.get(`/payments/to-partner/${partnerId}`);
      const partnerPaymentsRes = await api.get('/payments-received', {
        params: { owner_id: partnerId }
      });

      setMyPayments(myPaymentsRes.data.data?.payments || []);
      setPartnerPayments(partnerPaymentsRes.data.data?.payments || []);
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to fetch payments');
    }
  };

  const handleApproveTripStatus = async (tripId: string, collabOwnerId: any) => {
    try {
      await api.put(`/trips/collab/${tripId}/status`, {
        status: 'approved',
        collab_owner_id: collabOwnerId
      });
      toast.success('Trip approved successfully');
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve trip');
    }
  };

  const handleRejectTripStatus = async (tripId: string, collabOwnerId: any) => {
    try {
      await api.put(`/trips/collab/${tripId}/status`, {
        status: 'rejected',
        collab_owner_id: collabOwnerId
      });
      toast.success('Trip rejected');
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject trip');
    }
  };

  const handleApprovePayment = async (paymentId: string, ownerId: any) => {
    try {
      await api.put(`/payments/collab/${paymentId}/status`, {
        status: 'approved',
        owner_id: ownerId
      });
      toast.success('Payment approved successfully');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId: any, ownerId: any) => {
    try {
      await api.put(`/payments/collab/${paymentId}/status`, {
        status: 'rejected',
        owner_id: ownerId
      });
      toast.success('Payment rejected');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    }
  };

  const calculateTotals = () => {
    // ✅ Only count approved trips (completed + approved)
    const approvedMyTrips = myTrips.filter(t => 
      t.collab_trip_status === 'approved'
    );
    const approvedPartnerTrips = partnerTrips.filter(t => 
      t.collab_trip_status === 'approved'
    );
    
    const totalMyTripsAmount = approvedMyTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
    const totalPartnerTripsAmount = approvedPartnerTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
    
    const totalMyPayments = myPayments
      .filter(p => p.collab_payment_status === 'approved')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalPartnerPayments = partnerPayments
      .filter(p => p.collab_payment_status === 'approved')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const netTripAmount = totalPartnerTripsAmount - totalMyTripsAmount;
    const totalPaymentsMade = totalMyPayments + totalPartnerPayments;
    const finalBalance = netTripAmount - totalMyPayments + totalPartnerPayments;
    
    return {
      totalMyTripsAmount,
      totalPartnerTripsAmount,
      totalMyPayments,
      totalPartnerPayments,
      netTripAmount,
      totalPaymentsMade,
      finalBalance,
      myTripCount: myTrips.length,
      partnerTripCount: partnerTrips.length,
      myPaymentCount: myPayments.length,
      partnerPaymentCount: partnerPayments.length
    };
  };

  const filteredTrips = () => {
    const trips = activeTripsTab === 'my-trips' ? myTrips : partnerTrips;
    
    return trips.filter(trip => {
      const matchesSearch = !searchText || 
        trip.trip_number.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.material_name.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesTripStatus = tripStatusFilter === 'all' || 
        (trip.collab_trip_status === tripStatusFilter);
      
      const tripDate = new Date(trip.trip_date);
      const matchesDateRange =
        (!dateRange.start || tripDate >= new Date(dateRange.start)) &&
        (!dateRange.end || tripDate <= new Date(dateRange.end));
      
      return matchesSearch && matchesTripStatus && matchesDateRange;
    });
  };

  const filteredPayments = () => {
    const payments = activePaymentsTab === 'my-payments' ? myPayments : partnerPayments;
    
    return payments.filter(payment => {
      const matchesSearch = !searchText ||
        payment.payment_number.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.payment_mode.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.notes?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = paymentStatusFilter === 'all' || 
        payment.collab_payment_status === paymentStatusFilter;
      
      const paymentDate = new Date(payment.payment_date);
      const matchesDateRange =
        (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
        (!dateRange.end || paymentDate <= new Date(dateRange.end));
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  };

  const getPaymentModeConfig = (mode: string) => {
    const configs = {
      cash: { color: 'bg-green-100 text-green-700 border-green-200', icon: Banknote, label: 'Cash' },
      bank_transfer: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Building2, label: 'Bank Transfer' },
      cheque: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CreditCard, label: 'Cheque' },
      upi: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Smartphone, label: 'UPI' },
      other: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Wallet, label: 'Other' }
    };
    return configs[mode as keyof typeof configs] || configs.other;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const TripCard = ({ trip, type, canApproveReject }: { 
    trip: Trip; 
    type: 'my' | 'partner';
    canApproveReject: boolean;
  }) => {
    const getTripStatusConfig = (status: string) => {
      const configs = {
        pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending Approval', icon: Clock },
        approved: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Approved', icon: CheckCircle },
        rejected: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected', icon: XCircle }
      };
      return configs[status as keyof typeof configs] || configs.pending;
    };

    const statusConfig = trip.collab_trip_status ? getTripStatusConfig(trip.collab_trip_status) : null;
    const StatusIcon = statusConfig?.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              type === 'my' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{trip.trip_number}</h4>
              <p className="text-xs text-gray-500">{formatDate(trip.trip_date)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">{formatCurrency(trip.customer_amount)}</p>
            <p className="text-xs text-gray-500 capitalize">{trip.status}</p>
          </div>
        </div>

        {/* Collaboration Status Badge */}
        {trip.collab_trip_status && statusConfig && StatusIcon && (
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-gray-400" />
            <span className="truncate">{trip.material_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="truncate">{trip.location}</span>
          </div>
        </div>

        {trip.notes && (
          <p className="text-xs text-gray-600 italic border-t pt-2 mt-2">{trip.notes}</p>
        )}

        {/* Approve/Reject Buttons - Only for partner trips that are pending */}
        {canApproveReject && trip.collab_trip_status === 'pending' && (
          <div className="flex gap-2 pt-3 border-t mt-3">
            <button
              onClick={() => handleApproveTripStatus(trip._id, trip.collab_owner_id?._id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
            >
              <CheckCircle className="h-3 w-3" />
              Approve
            </button>
            <button
              onClick={() => handleRejectTripStatus(trip._id, trip.collab_owner_id?._id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
            >
              <XCircle className="h-3 w-3" />
              Reject
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const PaymentCard = ({ payment, canApproveReject }: { payment: Payment; canApproveReject: boolean }) => {
    const modeConfig = getPaymentModeConfig(payment.payment_mode);
    const statusConfig = getStatusConfig(payment.collab_payment_status);
    const ModeIcon = modeConfig.icon;
    const StatusIcon = statusConfig.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">{payment.payment_number}</h4>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${modeConfig.color}`}>
                <ModeIcon className="h-3 w-3" />
                {modeConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600 text-lg">{formatCurrency(payment.amount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(payment.payment_date)}</span>
        </div>

        {payment.notes && (
          <p className="text-xs text-gray-600 mb-3">{payment.notes}</p>
        )}

        {canApproveReject && payment.collab_payment_status === 'pending' && (
          <div className="flex gap-2 pt-3 border-t">
            <button
              onClick={() => handleApprovePayment(payment._id, payment.owner_id._id || payment.owner_id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
            >
              <CheckCircle className="h-3 w-3" />
              Approve
            </button>
            <button
              onClick={() => handleRejectPayment(payment._id, payment.owner_id._id || payment.owner_id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
            >
              <XCircle className="h-3 w-3" />
              Reject
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Partner Not Found</h2>
        <button
          onClick={() => navigate('/partners')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Collaborations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/partners')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{partner.name}</h1>
                  <p className="text-sm text-gray-600">{partner.company_name}</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 mb-1">Total Trips Value (Approved)</p>
              <p className="text-sm text-blue-600">
                Partner: {formatCurrency(totals.totalPartnerTripsAmount)}
              </p>
              <p className="text-sm text-blue-600">
                Mine: {formatCurrency(totals.totalMyTripsAmount)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">Total Payments (Approved)</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(totals.totalPaymentsMade)}</p>
              <p className="text-xs text-green-600">
                Mine: {formatCurrency(totals.totalMyPayments)} • Partner: {formatCurrency(totals.totalPartnerPayments)}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${
              totals.finalBalance > 0 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                : totals.finalBalance < 0
                ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {totals.finalBalance > 0 ? (
                  <TrendingDown className="h-3 w-3 text-green-600" />
                ) : totals.finalBalance < 0 ? (
                  <TrendingUp className="h-3 w-3 text-orange-600" />
                ) : null}
                <p className={`text-xs ${
                  totals.finalBalance > 0 ? 'text-green-700' : 
                  totals.finalBalance < 0 ? 'text-orange-700' : 'text-gray-700'
                }`}>
                  {totals.finalBalance > 0 ? `You need to pay ${partner.name}` : 
                   totals.finalBalance < 0 ? `${partner.name} needs to pay you` : 'All settled'}
                </p>
              </div>
              <p className={`text-lg font-bold ${
                totals.finalBalance > 0 ? 'text-green-900' : 
                totals.finalBalance < 0 ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {formatCurrency(Math.abs(totals.finalBalance))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-1.5 border border-gray-200 shadow-sm mb-4 inline-flex gap-1">
          <button
            onClick={() => setActiveMainTab('trips')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeMainTab === 'trips'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Trips</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
              activeMainTab === 'trips'
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {myTrips.length + partnerTrips.length}
            </span>
          </button>
          <button
            onClick={() => setActiveMainTab('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeMainTab === 'payments'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
              activeMainTab === 'payments'
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {myPayments.length + partnerPayments.length}
            </span>
          </button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex border-b md:border-b-0">
              {activeMainTab === 'trips' ? (
                <>
                  <button
                    onClick={() => setActiveTripsTab('my-trips')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTripsTab === 'my-trips'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Completed Trips
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {myTrips.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTripsTab('partner-trips')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTripsTab === 'partner-trips'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Partner Completed Trips
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {partnerTrips.length}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActivePaymentsTab('my-payments')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activePaymentsTab === 'my-payments'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Payments
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {myPayments.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActivePaymentsTab('partner-payments')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activePaymentsTab === 'partner-payments'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Partner Payments
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {partnerPayments.length}
                    </span>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {activeMainTab === 'trips' && (
                <select
                  value={tripStatusFilter}
                  onChange={(e) => setTripStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
              
              {activeMainTab === 'payments' && (
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
              
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {activeMainTab === 'payments' && activePaymentsTab === 'my-payments' && (
          <div className="mb-4">
            <button
              onClick={() => navigate(`/partners/${partnerId}/payments/create`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {activeMainTab === 'trips' 
              ? (activeTripsTab === 'my-trips' 
                  ? `My Completed Trips to ${partner.name}` 
                  : `${partner.name}'s Completed Trips to Me`)
              : (activePaymentsTab === 'my-payments'
                  ? `My Payments to ${partner.name}`
                  : `${partner.name}'s Payments to Me`)}
            <span className="text-gray-500 font-normal ml-2">
              ({activeMainTab === 'trips' ? filteredTrips().length : filteredPayments().length} items)
            </span>
          </h3>
          
          {activeMainTab === 'trips' ? (
            filteredTrips().length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">No completed trips found</h4>
                <p className="text-sm text-gray-600">Trips must be marked as "completed" to appear here for approval</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTrips().map((trip) => (
                  <TripCard 
                    key={trip._id} 
                    trip={trip} 
                    type={activeTripsTab === 'my-trips' ? 'my' : 'partner'}
                    canApproveReject={activeTripsTab === 'partner-trips'}
                  />
                ))}
              </div>
            )
          ) : (
            filteredPayments().length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">No payments found</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPayments().map((payment) => (
                  <PaymentCard 
                    key={payment._id} 
                    payment={payment}
                    canApproveReject={activePaymentsTab === 'partner-payments'}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationDetailsPage;