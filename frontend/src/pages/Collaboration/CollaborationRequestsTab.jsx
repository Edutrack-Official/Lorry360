import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  CheckCircle, 
  X, 
  Clock,
  Users,
  Plus,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';

const CollaborationRequestsTab = () => {
  const [activeSection, setActiveSection] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendRequest, setShowSendRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/collaborations/requests/received'),
        api.get('/collaborations/requests/sent')
      ]);

      setReceivedRequests(receivedRes.data.data?.requests || []);
      setSentRequests(sentRes.data.data?.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error(error.response?.data?.error || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const searchOwners = async (term) => {
    if (term.length < 2) {
      setAvailableOwners([]);
      return;
    }

    try {
      const res = await api.get(`/collaborations/owners/search?search=${term}`);
      setAvailableOwners(res.data.data?.owners || []);
    } catch (error) {
      console.error('Failed to search owners', error);
    }
  };

  const handleSendRequest = async (toOwnerId) => {
    try {
      await api.post('/collaborations/send-request', { to_owner_id: toOwnerId });
      toast.success('Collaboration request sent successfully');
      setShowSendRequest(false);
      setSearchTerm('');
      setAvailableOwners([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

  const handleAccept = async (collabId) => {
    try {
      await api.patch(`/collaborations/${collabId}/accept`);
      toast.success('Collaboration request accepted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleReject = async (collabId) => {
    try {
      await api.patch(`/collaborations/${collabId}/reject`);
      toast.success('Collaboration request rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleCancel = async (collabId) => {
    try {
      await api.delete(`/collaborations/${collabId}/cancel`);
      toast.success('Collaboration request cancelled');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    }
  };

  const sections = [
    { id: 'received', label: 'Received Requests', data: receivedRequests },
    { id: 'sent', label: 'Sent Requests', data: sentRequests }
  ];

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
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label} ({section.data.length})
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowSendRequest(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Send Request
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {sections
          .find(s => s.id === activeSection)
          ?.data.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              type={activeSection}
              onAccept={handleAccept}
              onReject={handleReject}
              onCancel={handleCancel}
            />
          ))}

        {sections.find(s => s.id === activeSection)?.data.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No {activeSection === 'received' ? 'Received' : 'Sent'} Requests</h4>
            <p>
              {activeSection === 'received' 
                ? 'You have no pending collaboration requests'
                : 'You haven\'t sent any collaboration requests yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Send Request Modal */}
      <AnimatePresence>
        {showSendRequest && (
          <SendRequestModal
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            availableOwners={availableOwners}
            onSearch={searchOwners}
            onSendRequest={handleSendRequest}
            onClose={() => {
              setShowSendRequest(false);
              setSearchTerm('');
              setAvailableOwners([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, type, onAccept, onReject, onCancel }) => {
  const owner = type === 'received' ? request.from_owner_id : request.to_owner_id;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{owner.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{owner.phone}</span>
              </div>
              {owner.company_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Company:</span>
                  <span>{owner.company_name}</span>
                </div>
              )}
              {owner.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{owner.address}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Requested {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {type === 'received' && (
            <>
              <button
                onClick={() => onAccept(request._id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => onReject(request._id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </>
          )}
          {type === 'sent' && (
            <button
              onClick={() => onCancel(request._id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Send Request Modal Component
const SendRequestModal = ({ searchTerm, setSearchTerm, availableOwners, onSearch, onSendRequest, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Send Collaboration Request</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search owners by name, company, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearch(e.target.value);
              }}
              className="input input-bordered pl-9 w-full"
            />
          </div>

          {/* Results */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableOwners.map((owner) => (
              <div
                key={owner._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{owner.name}</h4>
                    <p className="text-sm text-gray-600">{owner.company_name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSendRequest(owner._id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Send Request
                </button>
              </div>
            ))}

            {searchTerm && availableOwners.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No owners found matching "{searchTerm}"</p>
              </div>
            )}

            {!searchTerm && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Start typing to search for owners</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CollaborationRequestsTab;