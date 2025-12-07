// import React, { useState, useEffect } from 'react';
// import { 
//   UserPlus, 
//   Search, 
//   CheckCircle, 
//   X, 
//   Clock,
//   Users,
//   Plus,
//   Mail,
//   Phone,
//   MapPin
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import api from '../../api/client';

// const CollaborationRequestsTab = () => {
//   const [activeSection, setActiveSection] = useState('received');
//   const [receivedRequests, setReceivedRequests] = useState([]);
//   const [sentRequests, setSentRequests] = useState([]);
//   const [availableOwners, setAvailableOwners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showSendRequest, setShowSendRequest] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [receivedRes, sentRes] = await Promise.all([
//         api.get('/collaborations/requests/received'),
//         api.get('/collaborations/requests/sent')
//       ]);

//       setReceivedRequests(receivedRes.data.data?.requests || []);
//       setSentRequests(sentRes.data.data?.requests || []);
//     } catch (error) {
//       console.error('Failed to fetch requests', error);
//       toast.error(error.response?.data?.error || 'Failed to fetch requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const searchOwners = async (term) => {
//     if (term.length < 2) {
//       setAvailableOwners([]);
//       return;
//     }

//     try {
//       const res = await api.get(`/collaborations/owners/search?search=${term}`);
//       setAvailableOwners(res.data.data?.owners || []);
//     } catch (error) {
//       console.error('Failed to search owners', error);
//     }
//   };

//   const handleSendRequest = async (toOwnerId) => {
//     try {
//       await api.post('/collaborations/send-request', { to_owner_id: toOwnerId });
//       toast.success('Collaboration request sent successfully');
//       setShowSendRequest(false);
//       setSearchTerm('');
//       setAvailableOwners([]);
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to send request');
//     }
//   };

//   const handleAccept = async (collabId) => {
//     try {
//       await api.patch(`/collaborations/${collabId}/accept`);
//       toast.success('Collaboration request accepted');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to accept request');
//     }
//   };

//   const handleReject = async (collabId) => {
//     try {
//       await api.patch(`/collaborations/${collabId}/reject`);
//       toast.success('Collaboration request rejected');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to reject request');
//     }
//   };

//   const handleCancel = async (collabId) => {
//     try {
//       await api.delete(`/collaborations/${collabId}/cancel`);
//       toast.success('Collaboration request cancelled');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to cancel request');
//     }
//   };

//   const sections = [
//     { id: 'received', label: 'Received Requests', data: receivedRequests },
//     { id: 'sent', label: 'Sent Requests', data: sentRequests }
//   ];

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
//         <div className="flex gap-2">
//           {sections.map((section) => (
//             <button
//               key={section.id}
//               onClick={() => setActiveSection(section.id)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                 activeSection === section.id
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {section.label} ({section.data.length})
//             </button>
//           ))}
//         </div>

//         <button
//           onClick={() => setShowSendRequest(true)}
//           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
//         >
//           <UserPlus className="h-4 w-4" />
//           Send Request
//         </button>
//       </div>

//       {/* Requests List */}
//       <div className="space-y-4">
//         {sections
//           .find(s => s.id === activeSection)
//           ?.data.map((request) => (
//             <RequestCard
//               key={request._id}
//               request={request}
//               type={activeSection}
//               onAccept={handleAccept}
//               onReject={handleReject}
//               onCancel={handleCancel}
//             />
//           ))}

//         {sections.find(s => s.id === activeSection)?.data.length === 0 && (
//           <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
//             <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//             <h4 className="text-lg font-semibold text-gray-900 mb-2">No {activeSection === 'received' ? 'Received' : 'Sent'} Requests</h4>
//             <p>
//               {activeSection === 'received' 
//                 ? 'You have no pending collaboration requests'
//                 : 'You haven\'t sent any collaboration requests yet'
//               }
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Send Request Modal */}
//       <AnimatePresence>
//         {showSendRequest && (
//           <SendRequestModal
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             availableOwners={availableOwners}
//             onSearch={searchOwners}
//             onSendRequest={handleSendRequest}
//             onClose={() => {
//               setShowSendRequest(false);
//               setSearchTerm('');
//               setAvailableOwners([]);
//             }}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Request Card Component
// const RequestCard = ({ request, type, onAccept, onReject, onCancel }) => {
//   const owner = type === 'received' ? request.from_owner_id : request.to_owner_id;

//   return (
//     <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
//       <div className="flex items-start justify-between">
//         <div className="flex items-start gap-4 flex-1">
//           {/* Avatar */}
//           <div className="p-3 bg-blue-100 rounded-lg">
//             <Users className="h-6 w-6 text-blue-600" />
//           </div>

//           {/* Details */}
//           <div className="flex-1">
//             <div className="flex items-center gap-2 mb-2">
//               <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
//               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
//                 <Clock className="h-3 w-3 mr-1" />
//                 Pending
//               </span>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Mail className="h-4 w-4" />
//                 <span>{owner.email}</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <Phone className="h-4 w-4" />
//                 <span>{owner.phone}</span>
//               </div>
//               {owner.company_name && (
//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <span className="font-medium">Company:</span>
//                   <span>{owner.company_name}</span>
//                 </div>
//               )}
//               {owner.address && (
//                 <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
//                   <MapPin className="h-4 w-4 mt-0.5" />
//                   <span>{owner.address}</span>
//                 </div>
//               )}
//             </div>

//             <p className="text-sm text-gray-500">
//               Requested {new Date(request.createdAt).toLocaleDateString()}
//             </p>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-2">
//           {type === 'received' && (
//             <>
//               <button
//                 onClick={() => onAccept(request._id)}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <CheckCircle className="h-4 w-4" />
//                 Accept
//               </button>
//               <button
//                 onClick={() => onReject(request._id)}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 <X className="h-4 w-4" />
//                 Reject
//               </button>
//             </>
//           )}
//           {type === 'sent' && (
//             <button
//               onClick={() => onCancel(request._id)}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//             >
//               <X className="h-4 w-4" />
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Send Request Modal Component
// const SendRequestModal = ({ searchTerm, setSearchTerm, availableOwners, onSearch, onSendRequest, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
//       >
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-xl font-bold text-gray-900">Send Collaboration Request</h3>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6">
//           {/* Search */}
//           <div className="relative mb-6">
//             <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
//             <input
//               type="text"
//               placeholder="Search owners by name, company, or email..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 onSearch(e.target.value);
//               }}
//               className="input input-bordered pl-9 w-full"
//             />
//           </div>

//           {/* Results */}
//           <div className="space-y-3 max-h-96 overflow-y-auto">
//             {availableOwners.map((owner) => (
//               <div
//                 key={owner._id}
//                 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Users className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900">{owner.name}</h4>
//                     <p className="text-sm text-gray-600">{owner.company_name}</p>
//                     <p className="text-sm text-gray-500">{owner.email}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => onSendRequest(owner._id)}
//                   className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <UserPlus className="h-4 w-4" />
//                   Send Request
//                 </button>
//               </div>
//             ))}

//             {searchTerm && availableOwners.length === 0 && (
//               <div className="text-center py-8 text-gray-500">
//                 <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                 <p>No owners found matching "{searchTerm}"</p>
//               </div>
//             )}

//             {!searchTerm && (
//               <div className="text-center py-8 text-gray-500">
//                 <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                 <p>Start typing to search for owners</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default CollaborationRequestsTab;

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  CheckCircle, 
  X, 
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Send
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
  const [searchLoading, setSearchLoading] = useState(false);

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

    setReceivedRequests(
      (receivedRes.data.data?.requests || []).filter(req => req.status === "pending")
    );

    setSentRequests(
      (sentRes.data.data?.requests || []).filter(req => req.status === "pending")
    );
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
      setSearchLoading(true);
      const res = await api.get(`/collaborations/owners/search?search=${term}`);
      setAvailableOwners(res.data.data?.owners || []);
    } catch (error) {
      console.error('Failed to search owners', error);
      toast.error('Failed to search owners');
    } finally {
      setSearchLoading(false);
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
    { id: 'received', label: 'Received', icon: TrendingUp, data: receivedRequests },
    { id: 'sent', label: 'Sent', icon: Send, data: sentRequests }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading collaboration requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Collaboration Requests</h2>
            </div>
          </div>
          
          <button
            onClick={() => setShowSendRequest(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold"
          >
            <UserPlus className="h-5 w-5" />
            Send Request
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    section.id === 'received' 
                      ? 'bg-gradient-to-br from-green-100 to-green-200' 
                      : 'bg-gradient-to-br from-blue-100 to-blue-200'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      section.id === 'received' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">{section.label} Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{section.data.length}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-2 border-2 border-gray-200 shadow-sm inline-flex gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
              <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${
                activeSection === section.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {section.data.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {sections
            .find(s => s.id === activeSection)
            ?.data.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RequestCard
                  request={request}
                  type={activeSection}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onCancel={handleCancel}
                />
              </motion.div>
            ))}

          {sections.find(s => s.id === activeSection)?.data.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                No {activeSection === 'received' ? 'Received' : 'Sent'} Requests
              </h4>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeSection === 'received' 
                  ? 'You have no pending collaboration requests at the moment'
                  : 'You haven\'t sent any collaboration requests yet. Click "Send Request" to start building partnerships'
                }
              </p>
            </motion.div>
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
  );
};

// Request Card Component
const RequestCard = ({ request, type, onAccept, onReject, onCancel }) => {
  const owner = type === 'received' ? request.from_owner_id : request.to_owner_id;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg"
    >
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1 w-full lg:w-auto">
          {/* Avatar */}
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            className="p-3.5 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-md flex-shrink-0"
          >
            <Users className="h-7 w-7 text-blue-600" />
          </motion.div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{owner.name}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-2 border-yellow-200 shadow-sm">
                <Clock className="h-3 w-3 mr-1.5" />
                Pending
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {owner.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 p-2.5 rounded-lg border border-gray-200">
                  <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate font-medium">{owner.email}</span>
                </div>
              )}
              
              {owner.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 p-2.5 rounded-lg border border-gray-200">
                  <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">{owner.phone}</span>
                </div>
              )}
              
              {owner.company_name && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2">
                  <Building2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span className="truncate font-medium">{owner.company_name}</span>
                </div>
              )}
              
              {owner.address && (
                <div className="flex items-start gap-2 text-sm text-gray-700 bg-white/50 p-2.5 rounded-lg border border-gray-200 sm:col-span-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{owner.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-flex">
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                Requested on {new Date(request.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {type === 'received' && (
            <>
              <button
                onClick={() => onAccept(request._id)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold shadow-md hover:shadow-lg"
              >
                <CheckCircle className="h-5 w-5" />
                Accept
              </button>
              {/* <button
                onClick={() => onReject(request._id)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-md hover:shadow-lg"
              >
                <X className="h-5 w-5" />
                Reject
              </button> */}
            </>
          )}
          {type === 'sent' && (
            <button
              onClick={() => onCancel(request._id)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-bold shadow-md hover:shadow-lg"
            >
              <X className="h-5 w-5" />
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Send Request Modal Component
const SendRequestModal = ({ searchTerm, setSearchTerm, availableOwners, searchLoading, onSearch, onSendRequest, onClose }) => {
  return (
    <>
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
            className="relative bg-white rounded-2xl w-full max-w-6xl my-4 mx-2 sm:mx-4 shadow-2xl z-50 overflow-hidden"

            >


          {/* Header */}
          <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Send Collaboration Request</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Search and connect with business partners</p>
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

          {/* Content */}
          <div className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, company, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Search Hint */}
            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-700 font-medium">
                  Type at least 2 characters to search
                </p>
              </div>
            )}

            {/* Results */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {availableOwners.map((owner, index) => (
                <motion.div
                  key={owner._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all border-2 border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex-shrink-0">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base truncate">{owner.name}</h4>
                      {owner.company_name && (
                        <p className="text-sm text-gray-600 font-medium truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          {owner.company_name}
                        </p>
                      )}
                      {owner.email && (
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {owner.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onSendRequest(owner._id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <Send className="h-4 w-4" />
                    Send Request
                  </button>
                </motion.div>
              ))}

              {/* Empty States */}
              {searchTerm.length >= 2 && !searchLoading && availableOwners.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No owners found matching "{searchTerm}"</p>
                  <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                </div>
              )}

              {!searchTerm && (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-3">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-700 font-medium">Start typing to search for owners</p>
                  <p className="text-sm text-gray-600 mt-1">Search by name, company, email, or phone</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CollaborationRequestsTab;