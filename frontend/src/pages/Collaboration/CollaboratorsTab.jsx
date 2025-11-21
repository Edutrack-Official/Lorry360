import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  DollarSign,
  MoreVertical,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';
import CollabTransactionForm from './CollabTransactionForm';
import { useAuth } from '../../contexts/AuthContext';

const CollaboratorsTab = () => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [activeCollabId, setActiveCollabId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collaborations/active');
      const collabs = res.data.data?.collaborations || [];
      setCollaborations(collabs);

      // Fetch transactions and summaries for each collaboration
      const transactionPromises = collabs.map(collab =>
        api.get(`/collab-transactions/collaboration/${collab._id}`)
      );
      const summaryPromises = collabs.map(collab =>
        api.get(`/collab-transactions/summary/${collab._id}`)
      );

      const [transactionResults, summaryResults] = await Promise.all([
        Promise.all(transactionPromises),
        Promise.all(summaryPromises)
      ]);

      const transactionsData = {};
      const summariesData = {};

      collabs.forEach((collab, index) => {
        transactionsData[collab._id] = transactionResults[index].data.data?.transactions || [];
        summariesData[collab._id] = summaryResults[index].data.data || {};
      });

      setTransactions(transactionsData);
      setSummaries(summariesData);

      // Set first collaboration as active by default
      if (collabs.length > 0 && !activeCollabId) {
        setActiveCollabId(collabs[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch collaborations', error);
      toast.error(error.response?.data?.error || 'Failed to fetch collaborations');
    } finally {
      setLoading(false);
    }
  };

  // Get the partner owner (the other user in collaboration)
  const getPartnerOwner = (collaboration) => {
    return collaboration.from_owner_id._id === user.userId 
      ? collaboration.to_owner_id 
      : collaboration.from_owner_id;
  };

  // Get partner name
  const getPartnerName = (collaboration) => {
    const partner = getPartnerOwner(collaboration);
    return partner.name;
  };

  // Get partner company
  const getPartnerCompany = (collaboration) => {
    const partner = getPartnerOwner(collaboration);
    return partner.company_name;
  };

  const handleApprove = async (transactionId) => {
    try {
      await api.patch(`/collab-transactions/approve/${transactionId}`);
      toast.success('Transaction approved successfully');
      fetchCollaborations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve transaction');
    }
  };

  const handleMarkAsPaid = async (transactionId) => {
    try {
      await api.patch(`/collab-transactions/paid/${transactionId}`);
      toast.success('Transaction marked as paid');
      fetchCollaborations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark as paid');
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      await api.delete(`/collab-transactions/delete/${transactionId}`);
      toast.success('Transaction deleted successfully');
      fetchCollaborations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete transaction');
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Approved' },
      paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
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
      {/* Collaborations List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collaborations Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Collaborations</h3>
            <span className="text-sm text-gray-500">{collaborations.length}</span>
          </div>

          {collaborations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No active collaborations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collaborations.map((collab) => (
                <div
                  key={collab._id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    activeCollabId === collab._id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveCollabId(collab._id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {getPartnerName(collab)}
                    </h4>
                    {summaries[collab._id]?.net_balance !== undefined && (
                      <span className={`text-sm font-medium ${
                        summaries[collab._id].net_balance >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(summaries[collab._id].net_balance))}
                        {summaries[collab._id].net_balance >= 0 ? ' owed to you' : ' you owe'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {getPartnerCompany(collab)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {transactions[collab._id]?.length || 0} transactions
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCollaboration(collab);
                        setShowTransactionForm(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Request Payment"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions Panel */}
        <div className="lg:col-span-3">
          {activeCollabId && collaborations.find(c => c._id === activeCollabId) ? (
            <div className="space-y-6">
              {/* Summary Card */}
              {summaries[activeCollabId] && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Payment to be Paid</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summaries[activeCollabId].payment_to_be_paid || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600">Payment to be Received</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summaries[activeCollabId].payment_to_be_received || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-yellow-600">Amount to be Approved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summaries[activeCollabId].amount_to_be_approved || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-purple-600">Net Balance</p>
                      <p className={`text-2xl font-bold ${
                        (summaries[activeCollabId].net_balance || 0) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(summaries[activeCollabId].net_balance || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <button
                  onClick={() => {
                    const collab = collaborations.find(c => c._id === activeCollabId);
                    setSelectedCollaboration(collab);
                    setShowTransactionForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Request Payment
                </button>
              </div>

              {/* Transactions List */}
              {transactions[activeCollabId]?.length > 0 ? (
                <div className="space-y-4">
                  {transactions[activeCollabId].map((transaction) => (
                    <TransactionCard
                      key={transaction._id}
                      transaction={transaction}
                      currentUserId={user.userId}
                      onApprove={handleApprove}
                      onMarkAsPaid={handleMarkAsPaid}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h4>
                  <p className="mb-4">Start by requesting your first payment</p>
                  <button
                    onClick={() => {
                      const collab = collaborations.find(c => c._id === activeCollabId);
                      setSelectedCollaboration(collab);
                      setShowTransactionForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Request Payment
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Collaboration</h4>
              <p>Choose a collaboration from the list to view transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {showTransactionForm && selectedCollaboration && user && (
          <CollabTransactionForm
            collaboration={selectedCollaboration}
            currentUser={user}
            onClose={() => {
              setShowTransactionForm(false);
              setSelectedCollaboration(null);
            }}
            onSuccess={() => {
              setShowTransactionForm(false);
              setSelectedCollaboration(null);
              fetchCollaborations();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Updated Transaction Card Component
const TransactionCard = ({ transaction, currentUserId, onApprove, onMarkAsPaid, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  // Check user roles
  const isFromMe = transaction.from_owner_id._id === currentUserId;
  const isToMe = transaction.to_owner_id._id === currentUserId;
  
  // Action permissions based on your rules:
  // - Can only delete before approving if raised by me
  // - Partner needs to approve payments raised by me
  const canApprove = isToMe && transaction.status === 'pending'; // Partner can approve payments raised by me
  const canMarkAsPaid = isFromMe && transaction.status === 'approved'; // I can mark as paid after partner approves
  const canDelete = isFromMe && transaction.status === 'pending'; // I can delete only before approval

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Approved' },
      paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get transaction message
  const getTransactionMessage = () => {
    if (isFromMe) {
      return `You requested payment from ${transaction.to_owner_id.name}`;
    } else {
      return `${transaction.from_owner_id.name} requested payment from you`;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${
            isFromMe 
              ? 'bg-green-100 text-green-600'  // You requested payment (outgoing request)
              : 'bg-blue-100 text-blue-600'    // Partner requested payment (incoming request)
          }`}>
            {isFromMe ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownLeft className="h-4 w-4" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {formatCurrency(transaction.amount)}
              </span>
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {getTransactionMessage()}
            </p>
            {transaction.note && (
              <p className="text-sm text-gray-500">{transaction.note}</p>
            )}
            <p className="text-xs text-gray-400">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              {canApprove && (
                <button
                  onClick={() => {
                    onApprove(transaction._id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Payment
                </button>
              )}
              {canMarkAsPaid && (
                <button
                  onClick={() => {
                    onMarkAsPaid(transaction._id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <DollarSign className="h-4 w-4" />
                  Mark as Paid
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete(transaction._id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Delete Request
                </button>
              )}
              {!canApprove && !canMarkAsPaid && !canDelete && (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsTab;