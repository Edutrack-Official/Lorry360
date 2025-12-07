
//uiclean

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ChevronRight,
  Building2,
  Phone,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  UserPlus,
  CheckCircle,
  X,
  Clock,
  MapPin,
  AlertCircle,
  Send,
  HeartHandshake
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
  address?: string;
}

interface Collaboration {
  _id: string;
  from_owner_id: Partner;
  to_owner_id: Partner;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CollaborationRequest {
  _id: string;
  from_owner_id: Partner;
  to_owner_id: Partner;
  status: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CollaborationListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [searchText, setSearchText] = useState('');
  const [receivedRequests, setReceivedRequests] = useState<CollaborationRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<CollaborationRequest[]>([]);
  const [availableOwners, setAvailableOwners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendRequest, setShowSendRequest] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'received' | 'sent'>('active');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [collabRes, receivedRes, sentRes] = await Promise.all([
        api.get('/collaborations/active'),
        api.get('/collaborations/requests/received'),
        api.get('/collaborations/requests/sent')
      ]);

      setCollaborations(collabRes.data.data?.collaborations || []);
      setReceivedRequests(
        (receivedRes.data.data?.requests || []).filter((req: CollaborationRequest) => req.status === 'pending')
      );
      setSentRequests(
        (sentRes.data.data?.requests || []).filter((req: CollaborationRequest) => req.status === 'pending')
      );
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const searchOwners = async (term: string) => {
    if (term.length < 2) {
      setAvailableOwners([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get(`/collaborations/owners/search?search=${term}`);
      setAvailableOwners(res.data.data?.owners || []);
    } catch (error) {
      toast.error('Failed to search owners');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (toOwnerId: string) => {
    try {
      await api.post('/collaborations/send-request', { to_owner_id: toOwnerId });
      toast.success('Request sent successfully');
      setShowSendRequest(false);
      setSearchTerm('');
      setAvailableOwners([]);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

  const handleAccept = async (collabId: string) => {
    try {
      await api.patch(`/collaborations/${collabId}/accept`);
      toast.success('Request accepted');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleReject = async (collabId: string) => {
    try {
      await api.patch(`/collaborations/${collabId}/reject`);
      toast.success('Request rejected');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleCancel = async (collabId: string) => {
    try {
      await api.delete(`/collaborations/${collabId}/cancel`);
      toast.success('Request cancelled');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    }
  };

  const getPartnerInfo = (collab: Collaboration): Partner => {
    if (collab.from_owner_id._id === user?.id) {
      return collab.to_owner_id;
    }
    return collab.from_owner_id;
  };

  const handleViewCollaboration = (partner: Partner) => {
    navigate(`/partners/collaboration/${partner._id}`, {
      state: { partner }
    });
  };

  const filteredCollaborations = collaborations.filter(collab => {
    const partner = getPartnerInfo(collab);
    return (
      partner.name.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.company_name.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.phone.includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 pb-20 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <HeartHandshake  className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Partners</h1>
                <p className="text-xs text-gray-500">Manage your partnerships</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setShowSendRequest(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Partner</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-700 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-900">{collaborations.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Requests</p>
              <p className="text-2xl font-bold text-blue-900">{receivedRequests.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-700 mb-1">Pending</p>
              <p className="text-2xl font-bold text-purple-900">{sentRequests.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Active Partners</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'active'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {collaborations.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'received'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Requests</span>
            {receivedRequests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'received'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {receivedRequests.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === 'sent'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Sent</span>
            {sentRequests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'sent'
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {sentRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        {activeTab === 'active' && collaborations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'active' && (
              <ActiveTab
                collaborations={filteredCollaborations}
                onView={handleViewCollaboration}
                getPartner={getPartnerInfo}
              />
            )}
            
            {activeTab === 'received' && (
              <RequestsTab
                requests={receivedRequests}
                type="received"
                onAccept={handleAccept}
                onReject={handleReject}
              />
            )}
            
            {activeTab === 'sent' && (
              <RequestsTab
                requests={sentRequests}
                type="sent"
                onCancel={handleCancel}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {showSendRequest && (
            <SendRequestModal
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              owners={availableOwners}
              loading={searchLoading}
              onSearch={searchOwners}
              onSend={handleSendRequest}
              onClose={() => {
                setShowSendRequest(false);
                setSearchTerm('');
                setAvailableOwners([]);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Active Partners Tab
const ActiveTab = ({ collaborations, onView, getPartner }: any) => {
  if (collaborations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">No Partners</h3>
        <p className="text-sm text-gray-600">Start by adding a new partner</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {collaborations.map((collab: Collaboration) => {
        const partner = getPartner(collab);
        
        return (
          <motion.div
            key={collab._id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            onClick={() => onView(partner)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{partner.name}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex-shrink-0">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{partner.company_name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{partner.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(collab.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Requests Tab
const RequestsTab = ({ requests, type, onAccept, onReject, onCancel }: any) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
        <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <h4 className="text-base font-bold text-gray-900 mb-1">
          No {type === 'received' ? 'Requests' : 'Pending Requests'}
        </h4>
        <p className="text-sm text-gray-600">
          {type === 'received' 
            ? 'No partnership requests at the moment'
            : 'You haven\'t sent any requests yet'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request: CollaborationRequest) => {
        const partner = type === 'received' ? request.from_owner_id : request.to_owner_id;
        
        return (
          <motion.div
            key={request._id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-gray-900 truncate">{partner.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Pending
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{partner.company_name}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{partner.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {type === 'received' ? (
                  <>
                    <button
                      onClick={() => onAccept(request._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(request._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onCancel(request._id)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Send Request Modal
const SendRequestModal = ({ searchTerm, setSearchTerm, owners, loading, onSearch, onSend, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
      >
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Partner</h3>
                <p className="text-xs text-gray-600">Search and send request</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-700">Type at least 2 characters</p>
            </div>
          )}

          <div className="space-y-2">
            {owners.map((owner: Partner) => (
              <div
                key={owner._id}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 bg-blue-100 rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{owner.name}</h4>
                    <p className="text-xs text-gray-600 truncate">{owner.company_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSend(owner._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex-shrink-0"
                >
                  <Send className="h-3 w-3" />
                  Send
                </button>
              </div>
            ))}

            {searchTerm.length >= 2 && !loading && owners.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-600">No results for "{searchTerm}"</p>
              </div>
            )}

            {!searchTerm && (
              <div className="text-center py-12 bg-blue-50 rounded-lg">
                <Search className="h-10 w-10 mx-auto mb-2 text-blue-300" />
                <p className="text-sm text-gray-700 font-medium">Start typing to search</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CollaborationListPage;