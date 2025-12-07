// // src/pages/partners/CollaborationListPage.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Users,
//   ChevronRight,
//   Building2,
//   Phone,
//   Mail,
//   Calendar,
//   Search,
//   RefreshCw
// } from 'lucide-react';
// import { motion } from 'framer-motion';
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

// interface Collaboration {
//   _id: string;
//   from_owner_id: Partner;
//   to_owner_id: Partner;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// }

// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// };

// const CollaborationListPage = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');

//   useEffect(() => {
//     fetchCollaborations();
//   }, []);

//   const fetchCollaborations = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/collaborations/active');
      
//       if (res.data.success) {
//         setCollaborations(res.data.data?.collaborations || []);
//       } else {
//         toast.error(res.data.error || 'Failed to fetch collaborations');
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Failed to fetch collaborations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getPartnerInfo = (collab: Collaboration): Partner => {
//     // Determine who is the partner (not the current user)
//     if (collab.from_owner_id._id === user?.id) {
//       return collab.to_owner_id;
//     }
//     return collab.from_owner_id;
//   };

//   const handleViewCollaboration = (partner: Partner) => {
//     navigate(`/partners/collaboration/${partner._id}`, {
//       state: { partner }
//     });
//   };

//   const filteredCollaborations = collaborations.filter(collab => {
//     const partner = getPartnerInfo(collab);
//     return (
//       partner.name.toLowerCase().includes(searchText.toLowerCase()) ||
//       partner.company_name.toLowerCase().includes(searchText.toLowerCase()) ||
//       partner.email.toLowerCase().includes(searchText.toLowerCase()) ||
//       partner.phone.includes(searchText)
//     );
//   });

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow border p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Collaborations</h1>
//               <p className="text-gray-600 mt-1">Active business partnerships</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={fetchCollaborations}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//                 title="Refresh"
//               >
//                 <RefreshCw className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Search */}
//         <div className="bg-white rounded-xl shadow border p-4 mb-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search partners by name, company, phone or email..."
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//         </div>

//         {/* Collaborations List */}
//         <div className="bg-white rounded-xl shadow border overflow-hidden">
//           {filteredCollaborations.length === 0 ? (
//             <div className="text-center py-16">
//               <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 {collaborations.length === 0 ? 'No active collaborations' : 'No matching partners found'}
//               </h3>
//               <p className="text-gray-600">
//                 {collaborations.length === 0 
//                   ? 'You don\'t have any active collaborations yet.'
//                   : 'Try a different search term.'}
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredCollaborations.map((collab) => {
//                 const partner = getPartnerInfo(collab);
//                 const isUserSender = collab.from_owner_id._id === user?.id;
                
//                 return (
//                   <motion.div
//                     key={collab._id}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
//                     onClick={() => handleViewCollaboration(partner)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4 flex-1">
//                         <div className="p-3 bg-blue-100 rounded-lg">
//                           <Users className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
//                             <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                               Active
//                             </span>
//                           </div>
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
//                             <div className="flex items-center gap-2">
//                               <Building2 className="h-4 w-4" />
//                               <span>{partner.company_name}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Phone className="h-4 w-4" />
//                               <span>{partner.phone}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Mail className="h-4 w-4" />
//                               <span className="truncate">{partner.email}</span>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
//                             <div className="flex items-center gap-1">
//                               <Calendar className="h-4 w-4" />
//                               <span>Started: {formatDate(collab.createdAt)}</span>
//                             </div>
//                             <span className={`px-2 py-1 rounded ${
//                               isUserSender 
//                                 ? 'bg-blue-100 text-blue-700' 
//                                 : 'bg-green-100 text-green-700'
//                             }`}>
//                               {isUserSender ? 'You invited' : 'Invited you'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                       <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CollaborationListPage;

// src/pages/partners/CollaborationListPage.tsx
// src/pages/partners/CollaborationListPage.tsx
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
  TrendingUp,
  Send
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
      toast.success('Collaboration request sent successfully');
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
      toast.success('Collaboration request accepted');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleReject = async (collabId: string) => {
    try {
      await api.patch(`/collaborations/${collabId}/reject`);
      toast.success('Collaboration request rejected');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleCancel = async (collabId: string) => {
    try {
      await api.delete(`/collaborations/${collabId}/cancel`);
      toast.success('Collaboration request cancelled');
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
        <p className="mt-3 text-gray-600 text-sm">Loading collaborations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow border border-blue-200 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Collaborations</h1>
                <p className="text-xs text-gray-600">Manage partnerships and requests</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={() => setShowSendRequest(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Send Request</span>
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-100">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Active</p>
                  <p className="text-lg font-bold text-gray-900">{collaborations.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Received</p>
                  <p className="text-lg font-bold text-gray-900">{receivedRequests.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100">
                  <Send className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Sent</p>
                  <p className="text-lg font-bold text-gray-900">{sentRequests.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg p-1.5 border border-gray-200 shadow-sm mb-4 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Active</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
              activeTab === 'active'
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {collaborations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'received'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Received</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
              activeTab === 'received'
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {receivedRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'sent'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Sent</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
              activeTab === 'sent'
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {sentRequests.length}
            </span>
          </button>
        </div>

        {/* Search (only for active collaborations) */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search partners by name, company, phone or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'active' && (
              <ActiveCollaborationsTab
                collaborations={filteredCollaborations}
                onViewCollaboration={handleViewCollaboration}
                getPartnerInfo={getPartnerInfo}
                user={user}
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

        {/* Send Request Modal */}
        <AnimatePresence>
          {showSendRequest && (
            <SendRequestModal
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              availableOwners={availableOwners}
              searchLoading={searchLoading}
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
    </div>
  );
};

// Active Collaborations Tab Component
const ActiveCollaborationsTab = ({ 
  collaborations, 
  onViewCollaboration, 
  getPartnerInfo, 
  user 
}: any) => {
  if (collaborations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No active collaborations</h3>
          <p className="text-sm text-gray-600">You don't have any active collaborations yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="divide-y divide-gray-200">
        {collaborations.map((collab: Collaboration) => {
          const partner = getPartnerInfo(collab);
          const isUserSender = collab.from_owner_id._id === user?.id;
          
          return (
            <motion.div
              key={collab._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onViewCollaboration(partner)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{partner.name}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{partner.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        <span>{partner.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Started: {formatDate(collab.createdAt)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded ${
                        isUserSender 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isUserSender ? 'You invited' : 'Invited you'}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-3" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Requests Tab Component
const RequestsTab = ({ 
  requests, 
  type, 
  onAccept, 
  onReject, 
  onCancel 
}: any) => {
  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h4 className="text-base font-bold text-gray-900 mb-1">
          No {type === 'received' ? 'Received' : 'Sent'} Requests
        </h4>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          {type === 'received' 
            ? 'You have no pending collaboration requests at the moment'
            : 'You haven\'t sent any collaboration requests yet'
          }
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request: CollaborationRequest, index: number) => (
        <RequestCard
          key={request._id}
          request={request}
          type={type}
          index={index}
          onAccept={onAccept}
          onReject={onReject}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, type, index, onAccept, onReject, onCancel }: any) => {
  const owner = type === 'received' ? request.from_owner_id : request.to_owner_id;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md"
    >
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 w-full lg:w-auto">
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex-shrink-0"
          >
            <Users className="h-5 w-5 text-blue-600" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-bold text-gray-900 truncate">{owner.name}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {owner.email && (
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                  <Mail className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{owner.email}</span>
                </div>
              )}
              
              {owner.phone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                  <Phone className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span>{owner.phone}</span>
                </div>
              )}
              
              {owner.company_name && (
                <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200 sm:col-span-2">
                  <Building2 className="h-3 w-3 text-purple-600 flex-shrink-0" />
                  <span className="truncate">{owner.company_name}</span>
                </div>
              )}
              
              {owner.address && (
                <div className="flex items-start gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200 sm:col-span-2">
                  <MapPin className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{owner.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-flex">
              <Clock className="h-3 w-3" />
              <span>Requested on {formatDate(request.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {type === 'received' && (
            <>
              <button
                onClick={() => onAccept(request._id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => onReject(request._id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium shadow-sm"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </>
          )}
          {type === 'sent' && (
            <button
              onClick={() => onCancel(request._id)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-medium shadow-sm"
            >
              <X className="h-4 w-4" />
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Send Request Modal Component
const SendRequestModal = ({ 
  searchTerm, 
  setSearchTerm, 
  availableOwners, 
  searchLoading, 
  onSearch, 
  onSendRequest, 
  onClose 
}: any) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={onClose}
        ></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-lg w-full max-w-4xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Send Collaboration Request</h3>
                  <p className="text-xs text-gray-600">Search and connect with business partners</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, company, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}
            </div>

            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <div className="mb-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Type at least 2 characters to search</p>
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableOwners.map((owner: Partner, index: number) => (
                <motion.div
                  key={owner._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-md flex-shrink-0">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{owner.name}</h4>
                      {owner.company_name && (
                        <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          {owner.company_name}
                        </p>
                      )}
                      {owner.email && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {owner.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onSendRequest(owner._id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Request
                  </button>
                </motion.div>
              ))}

              {searchTerm.length >= 2 && !searchLoading && availableOwners.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">No owners found matching "{searchTerm}"</p>
                  <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
                </div>
              )}

              {!searchTerm && (
                <div className="text-center py-8 bg-blue-50 rounded-lg border border-dashed border-blue-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Start typing to search for owners</p>
                  <p className="text-xs text-gray-600 mt-1">Search by name, company, email, or phone</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CollaborationListPage;