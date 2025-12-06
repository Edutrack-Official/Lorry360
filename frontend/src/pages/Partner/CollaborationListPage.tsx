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
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
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

interface Collaboration {
  _id: string;
  from_owner_id: Partner;
  to_owner_id: Partner;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collaborations/active');
      
      if (res.data.success) {
        setCollaborations(res.data.data?.collaborations || []);
      } else {
        toast.error(res.data.error || 'Failed to fetch collaborations');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch collaborations');
    } finally {
      setLoading(false);
    }
  };

  const getPartnerInfo = (collab: Collaboration): Partner => {
    // Determine who is the partner (not the current user)
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collaborations</h1>
              <p className="text-gray-600 mt-1">Active business partnerships</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchCollaborations}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search partners by name, company, phone or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Collaborations List */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          {filteredCollaborations.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {collaborations.length === 0 ? 'No active collaborations' : 'No matching partners found'}
              </h3>
              <p className="text-gray-600">
                {collaborations.length === 0 
                  ? 'You don\'t have any active collaborations yet.'
                  : 'Try a different search term.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCollaborations.map((collab) => {
                const partner = getPartnerInfo(collab);
                const isUserSender = collab.from_owner_id._id === user?.id;
                
                return (
                  <motion.div
                    key={collab._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewCollaboration(partner)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{partner.company_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{partner.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{partner.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Started: {formatDate(collab.createdAt)}</span>
                            </div>
                            <span className={`px-2 py-1 rounded ${
                              isUserSender 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {isUserSender ? 'You invited' : 'Invited you'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationListPage;