
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
  Info,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  ArrowLeft,
  IndianRupee
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
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
      label: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      dotColor: 'bg-yellow-500'
    },
    partially_paid: { 
      color: 'bg-blue-50 text-blue-700 border-blue-200', 
      label: 'Partially Paid',
      icon: <TrendingUp className="h-4 w-4" />,
      dotColor: 'bg-blue-500'
    },
    completed: { 
      color: 'bg-green-50 text-green-700 border-green-200', 
      label: 'Completed',
      icon: <CheckCircle2 className="h-4 w-4" />,
      dotColor: 'bg-green-500'
    },
    cancelled: { 
      color: 'bg-red-50 text-red-700 border-red-200', 
      label: 'Cancelled',
      icon: <X className="h-4 w-4" />,
      dotColor: 'bg-red-500'
    }
  };
  return config[status] || config.pending;
};

const getPaymentStatusConfig = (status) => {
  const config = {
    pending: { 
      color: 'bg-yellow-50 text-yellow-700', 
      label: 'Pending Review',
      icon: <Clock className="h-4 w-4" />
    },
    approved: { 
      color: 'bg-green-50 text-green-700', 
      label: 'Approved',
      icon: <CheckCircle className="h-4 w-4" />
    },
    rejected: { 
      color: 'bg-red-50 text-red-700', 
      label: 'Rejected',
      icon: <X className="h-4 w-4" />
    },
    cancelled: { 
      color: 'bg-gray-50 text-gray-700', 
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
      className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${
            isPayable 
              ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600' 
              : 'bg-gradient-to-br from-green-100 to-green-200 text-green-600'
          }`}>
            {isPayable ? (
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">{partnerName}</h4>
            <p className="text-sm text-gray-600 truncate">{partnerCompany}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} animate-pulse`}></span>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Amount Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-gray-600 mb-1 font-medium">Net Amount</p>
          <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{formatCurrency(settlement.net_amount)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-green-700 mb-1 font-medium">Approved</p>
          <p className="font-bold text-green-700 text-sm sm:text-base truncate">{formatCurrency(totalApproved)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-orange-700 mb-1 font-medium">Due</p>
          <p className="font-bold text-orange-700 text-sm sm:text-base truncate">{formatCurrency(remainingDue)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-blue-700 mb-1 font-medium">Trips</p>
          <p className="font-bold text-blue-700 text-sm sm:text-base">{settlement.trip_ids?.length || 0}</p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
        <div className="text-sm font-semibold">
          {isPayable 
            ? <span className="text-orange-600">You owe {formatCurrency(remainingDue)}</span>
            : <span className="text-green-600">Owes you {formatCurrency(remainingDue)}</span>
          }
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 sm:flex-initial px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
          >
            View Details
          </button>
          {isPayable && remainingDue > 0 && (
            <button
              onClick={onAddPayment}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Payment</span>
              <span className="sm:hidden">Pay</span>
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
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-start gap-3 flex-1 w-full min-w-0">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
          isFromMe 
            ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600' 
            : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
        }`}>
          {isFromMe ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-bold text-gray-900 text-base">{formatCurrency(payment.amount)}</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-1">
            {isFromMe ? 'You paid' : `${payment.paid_by.name} paid`} via <span className="font-semibold">{payment.payment_mode}</span>
          </p>
          {payment.reference_number && (
            <p className="text-xs text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded mb-1">
              Ref: {payment.reference_number}
            </p>
          )}
          {payment.notes && (
            <p className="text-sm text-gray-600 mt-1 italic">{payment.notes}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {formatDate(payment.payment_date)}
            {payment.approved_at && ` • Approved ${formatDate(payment.approved_at)}`}
            {payment.rejection_reason && ` • Rejected: ${payment.rejection_reason}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      {(canApprove || canReject) && (
        <div className="relative self-end sm:self-center">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>

          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-20 animate-fade-in">
                {canApprove && (
                  <button
                    onClick={() => {
                      onApprove(settlementId, paymentIndex);
                      setShowActions(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium"
                  >
                    <CheckCircle className="h-5 w-5" />
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
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <X className="h-5 w-5" />
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
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 rounded-2xl border border-blue-200 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{partnerName}</h4>
            <p className="text-gray-700 mb-2">{partnerCompany}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {formatDate(settlement.from_date)} - {formatDate(settlement.to_date)}
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color} shadow-sm`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Net Amount</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(settlement.net_amount)}</p>
          </div>
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <p className="text-xs sm:text-sm text-green-600 mb-1 font-medium">Approved</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">{formatCurrency(totalApproved)}</p>
          </div>
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <p className="text-xs sm:text-sm text-yellow-600 mb-1 font-medium">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600 truncate">{formatCurrency(totalPending)}</p>
          </div>
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <p className="text-xs sm:text-sm text-orange-600 mb-1 font-medium">Due</p>
            <p className="text-lg sm:text-2xl font-bold text-orange-600 truncate">{formatCurrency(remainingDue)}</p>
          </div>
        </div>

        {/* Action Button */}
        {isPayable && remainingDue > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onAddPayment}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-xl font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Payment
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max px-4">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'breakdown', label: 'Breakdown' },
              { id: 'trips', label: `Trips (${settlement.trip_breakdown?.length || 0})` },
              { id: 'payments', label: `Payments (${settlement.payments?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 sm:px-6 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
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
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Payment Progress
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Total Amount</span>
                        <span className="font-bold text-gray-900">{formatCurrency(settlement.net_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${(totalApproved / settlement.net_amount) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-semibold">
                          {Math.round((totalApproved / settlement.net_amount) * 100)}% Paid
                        </span>
                        <span className="text-gray-600 font-medium">{formatCurrency(remainingDue)} remaining</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Quick Stats
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <span className="text-sm text-blue-900 font-medium">Total Trips</span>
                        <span className="font-bold text-blue-900 text-lg">{settlement.trip_breakdown?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                        <span className="text-sm text-green-900 font-medium">Approved Payments</span>
                        <span className="font-bold text-green-900 text-lg">{approvedPayments.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                        <span className="text-sm text-yellow-900 font-medium">Pending Payments</span>
                        <span className="font-bold text-yellow-900 text-lg">{pendingPayments.length}</span>
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
                className="space-y-6"
              >
                <h5 className="text-xl font-bold text-gray-900">Amount Breakdown</h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-blue-900 text-sm sm:text-base">You → Partner Trips</span>
                        <span className="text-xs sm:text-sm text-blue-600 font-semibold bg-white px-3 py-1 rounded-full">
                          {aToBTrips.length} trips
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-900">{formatCurrency(aToBAmount)}</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-green-900 text-sm sm:text-base">Partner → You Trips</span>
                        <span className="text-xs sm:text-sm text-green-600 font-semibold bg-white px-3 py-1 rounded-full">
                          {bToATrips.length} trips
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-green-900">{formatCurrency(bToAAmount)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-sm">
                      <span className="font-bold text-orange-900 text-sm sm:text-base block mb-3">Net Settlement</span>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-900 mb-3">{formatCurrency(settlement.net_amount)}</p>
                      <p className="text-sm text-orange-700 font-medium">
                        {isPayable ? '💸 You pay to partner' : '💰 Partner pays to you'}
                      </p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-sm">
                      <span className="font-bold text-purple-900 text-sm sm:text-base block mb-3">Payable By</span>
                      <p className="text-lg sm:text-xl font-bold text-purple-900">
                        {settlement.amount_breakdown.net_payable_by === 'owner_A' ? '👤 Owner A (You)' : 
                         settlement.amount_breakdown.net_payable_by === 'owner_B' ? '👥 Owner B (Partner)' : '➖ None'}
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
                className="space-y-4"
              >
                <h5 className="text-xl font-bold text-gray-900">
                  Trip Breakdown ({settlement.trip_breakdown?.length || 0} trips)
                </h5>
                <div className="space-y-3">
                  {settlement.trip_breakdown?.map((trip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 font-bold text-xs ${
                          trip.direction === 'a_to_b' 
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700' 
                            : 'bg-gradient-to-br from-green-100 to-green-200 text-green-700'
                        }`}>
                          {trip.direction === 'a_to_b' ? 'A→B' : 'B→A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 mb-1 truncate">{trip.trip_number}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {trip.material_name} • {trip.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right self-end sm:self-center">
                        <p className="font-bold text-gray-900 text-base">{formatCurrency(trip.amount)}</p>
                        <p className="text-xs text-gray-600">{formatDate(trip.trip_date)}</p>
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
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xl font-bold text-gray-900">Payment History</h5>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">
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
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-2">No Payments Yet</p>
                    <p className="text-gray-600">Add your first payment to get started</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
          amounts[partner._id] = unsettled;
        }
        
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
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading settlement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Collaboration Management</h2>
          <p className="text-sm text-gray-600">Manage settlements and partnerships</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setPartnerSubTab('partnersList');
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-xl font-semibold"
        >
          <Plus className="h-5 w-5" />
          Create Settlement
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max px-2 sm:px-6">
            {[
              { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'partners', label: 'Partners', icon: <Users className="h-4 w-4" /> },
              { id: 'settlements', label: 'Settlements', icon: <FileText className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 sm:px-6 border-b-2 font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-1 rounded-full">Total</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-900 mb-1">{stats.total_settlements}</p>
                  <p className="text-sm text-blue-700 font-medium">Settlements</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold">
                    ✓ {stats.completed_settlements} completed
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-white px-2 py-1 rounded-full">Amount</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900 mb-1 truncate">
                    {formatCurrency(stats.total_amount)}
                  </p>
                  <p className="text-sm text-green-700 font-medium">Total Value</p>
                  <p className="text-xs text-green-600 mt-2 font-semibold truncate">
                    ✓ {formatCurrency(stats.total_paid)} paid
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-xs font-semibold text-yellow-600 bg-white px-2 py-1 rounded-full">Pending</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-1 truncate">
                    {formatCurrency(stats.total_due)}
                  </p>
                  <p className="text-sm text-yellow-700 font-medium">Due Amount</p>
                  <p className="text-xs text-yellow-600 mt-2 font-semibold">
                    ⏳ {stats.pending_settlements} pending
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-white px-2 py-1 rounded-full">Rate</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-purple-900 mb-1">
                    {stats.completion_rate}%
                  </p>
                  <p className="text-sm text-purple-700 font-medium">Completion</p>
                  <p className="text-xs text-purple-600 mt-2 font-semibold">
                    📊 Settlement efficiency
                  </p>
                </motion.div>
              </div>

              {/* Recent Settlements */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Settlements</h3>
                  <button
                    onClick={() => setActiveTab('settlements')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 sm:p-6">
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
                    <div className="text-center py-16 text-gray-500">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-300" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">No Settlements Yet</h4>
                      <p className="text-gray-600 mb-6">Create your first settlement to get started</p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md"
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
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-2 border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPartnerSubTab('partnersList');
                      setSelectedPartner(null);
                    }}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                      partnerSubTab === 'partnersList'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    Partners List
                  </button>

                  <button
                    onClick={() => {
                      setPartnerSubTab('collabRequests');
                      setSelectedPartner(null);
                    }}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                      partnerSubTab === 'collabRequests'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    Requests
                  </button>
                </div>
              </div>

              {/* SUB TAB CONTENT */}
              {partnerSubTab === 'collabRequests' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to partners
                      </button>

                      {/* Partner Header */}
                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="p-4 bg-white rounded-2xl shadow-md">
                              <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-2xl font-bold text-gray-900 mb-1">{selectedPartner.name}</h4>
                              <p className="text-lg text-gray-700 mb-2">{selectedPartner.company_name}</p>
                              <div className="space-y-1">
                                {selectedPartner.phone && (
                                  <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {selectedPartner.phone}
                                  </p>
                                )}
                                {selectedPartner.email && (
                                  <p className="text-sm text-gray-600 flex items-center gap-2 truncate">
                                    <Mail className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{selectedPartner.email}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md"
                          >
                            <Plus className="h-5 w-5" />
                            Create Settlement
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Total Settlements</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {settlements.filter(s =>
                              s.owner_A_id._id === selectedPartner._id ||
                              s.owner_B_id._id === selectedPartner._id
                            ).length}
                          </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Completed</p>
                          <p className="text-3xl font-bold text-green-600">
                            {settlements.filter(
                              s =>
                                (s.owner_A_id._id === selectedPartner._id ||
                                  s.owner_B_id._id === selectedPartner._id) &&
                                s.status === 'completed'
                            ).length}
                          </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Pending</p>
                          <p className="text-3xl font-bold text-orange-600">
                            {settlements.filter(
                              s =>
                                (s.owner_A_id._id === selectedPartner._id ||
                                  s.owner_B_id._id === selectedPartner._id) &&
                                (s.status === 'pending' || s.status === 'partially_paid')
                            ).length}
                          </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Total Amount</p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
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
                          <h5 className="text-xl font-bold text-gray-900">
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
                          <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <FileText className="h-10 w-10 text-gray-300" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">
                              No Settlements Yet
                            </h4>
                            <p className="text-gray-600 mb-6">
                              Create your first settlement with {selectedPartner.name}
                            </p>
                            <button
                              onClick={() => setShowCreateForm(true)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md"
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
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                    >
                      {collaborativePartners.length > 0 ? (
                        collaborativePartners.map((partner, index) => {
                          const partnerSettlements = settlements.filter(
                            s =>
                              s.owner_A_id._id === partner._id ||
                              s.owner_B_id._id === partner._id
                          );
                          const unsettled = unsettledAmounts[partner._id] || { myTripsForPartner: 0, partnerTripsForMe: 0, netAmount: 0 };

                          return (
                            <motion.div
                              key={partner._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                              onClick={() => {
                                setSelectedPartner(partner);
                                setPartnerSubTab('partnersList');
                              }}
                            >
                              <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                                  <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-lg truncate">{partner.name}</h4>
                                  <p className="text-sm text-gray-600 truncate">{partner.company_name}</p>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm text-gray-600 mb-4">
                                {partner.phone && (
                                  <p className="flex items-center gap-2 truncate">
                                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                    <span className="truncate">{partner.phone}</span>
                                  </p>
                                )}
                                {partner.email && (
                                  <p className="flex items-center gap-2 truncate">
                                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                    <span className="truncate">{partner.email}</span>
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4">
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Settlements</p>
                                  <p className="text-lg font-bold text-gray-900">{partnerSettlements.length}</p>
                                </div>

                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Completed</p>
                                  <p className="text-lg font-bold text-green-600">
                                    {partnerSettlements.filter(s => s.status === 'completed').length}
                                  </p>
                                </div>

                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Total</p>
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                    {formatCurrency(
                                      partnerSettlements.reduce((sum, s) => sum + s.net_amount, 0)
                                    )}
                                  </p>
                                </div>
                              </div>

                              {(unsettled.myTripsForPartner > 0 || unsettled.partnerTripsForMe > 0) && (
                                <div className="mb-4 p-3 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                                  <p className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Unsettled Trips
                                  </p>
                                  <div className="space-y-1.5">
                                    {unsettled.myTripsForPartner > 0 && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-orange-700 font-medium">You → Partner</span>
                                        <span className="font-bold text-orange-900">
                                          {formatCurrency(unsettled.myTripsForPartner)}
                                        </span>
                                      </div>
                                    )}
                                    {unsettled.partnerTripsForMe > 0 && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-green-700 font-medium">Partner → You</span>
                                        <span className="font-bold text-green-900">
                                          {formatCurrency(unsettled.partnerTripsForMe)}
                                        </span>
                                      </div>
                                    )}
                                    {unsettled.netAmount !== 0 && (
                                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-yellow-300">
                                        <span className="font-bold text-yellow-900">Net Unsettled</span>
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

                              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:text-white transition-all font-semibold group-hover:shadow-md">
                                <FileText className="h-5 w-5" />
                                View Settlements
                              </button>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-12 w-12 text-gray-300" />
                          </div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">No Collaborative Partners</h4>
                          <p className="text-lg text-gray-600 mb-4">You need active collaborations to create settlements</p>
                          <button
                            onClick={() => setPartnerSubTab('collabRequests')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedSettlement ? 'Settlement Details' : 'All Settlements'}
                </h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!selectedSettlement && (
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm"
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
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Back to all</span>
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
                    <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {statusFilter === 'all' ? 'No Settlements Found' : `No ${statusFilter} Settlements`}
                      </h4>
                      <p className="text-lg text-gray-600 mb-6">
                        {statusFilter === 'all' 
                          ? 'Create your first settlement to start managing payments'
                          : `Try changing the filter or create a new settlement`
                        }
                      </p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md"
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
        </div>
      </div>

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