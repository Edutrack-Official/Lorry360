import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
    Hand,
  Search, 
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';
import CollaboratorsTab from './CollaboratorsTab';
import CollaborationRequestsTab from './CollaborationRequestsTab';

const CollaborationDashboard = () => {
  const [activeTab, setActiveTab] = useState('collaborators');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCollaborations: 0,
    pendingRequests: 0,
    sentRequests: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [activeRes, requestsRes, sentRes] = await Promise.all([
        api.get('/collaborations/active'),
        api.get('/collaborations/requests/received'),
        api.get('/collaborations/requests/sent')
      ]);

      setStats({
        activeCollaborations: activeRes.data.data?.count || 0,
        pendingRequests: requestsRes.data.data?.count || 0,
        sentRequests: sentRes.data.data?.count || 0
      });
    } catch (error: any) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'collaborators', label: 'Collaborators', icon: Users },
    { id: 'requests', label: 'Collaboration Requests', icon: UserPlus }
  ];

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Hand className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collaborations</h1>
              <p className="text-gray-600">Manage your business partnerships</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Active Collaborations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCollaborations}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Hand className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Sent Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sentRequests}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'collaborators' && <CollaboratorsTab />}
              {activeTab === 'requests' && <CollaborationRequestsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDashboard;