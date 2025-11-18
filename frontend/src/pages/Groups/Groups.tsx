import React, { useEffect, useState } from 'react';
import api from "../../api/client";
import {
  PlusCircle,
  Pencil,
  Power,
  Search,
  Users,
  Eye,
  X,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import { FaPlus } from 'react-icons/fa6';
import { FiEdit, FiInfo } from 'react-icons/fi';

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  mobile: string;
  isActive: boolean;
  profileImageUrl: string | null;
}

interface Group {
  _id: string;
  name: string;
  batchId: string | {
    _id: string;
    name: string;
  };
  candidateIds: Student[];
  isActive: boolean;
  createdAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  lastUpdatedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

const Groups = () => {
  const { batchId } = useParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // 🔍 Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      // Get all groups and filter by batchId
      const res = await api.get(`/group/all`);
      const batchGroups = res.data.filter((group: Group) => {
        const groupBatchId = typeof group.batchId === 'string' ? group.batchId : group.batchId._id;
        return groupBatchId === batchId;
      });
      setGroups(batchGroups);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      localStorage.setItem('selectedBatchId', batchId);
      fetchGroups();
    }
  }, [batchId]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/group/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Group marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewStudents = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  // ✅ Filtering
  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && group.isActive) ||
      (statusFilter === 'inactive' && !group.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-4 md:px-10 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Groups</h1>
        </div>
        <Link
          to={`/groups/create/${batchId}`}
          className="flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
        >
           <FaPlus size={20} />
        </Link>
      </div>

      {/* ✅ Toggle between Students / Groups */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate(`/batches/${batchId}/students`)}
          className="px-4 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Students
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium transition bg-blue-600 text-white shadow"
        >
          Groups
        </button>
      </div>

      {/* 🔍 Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by group name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className="px-4 py-2 bg-gray-100 text-sm text-gray-700 rounded-md hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-blue-600 text-left text-sm font-semibold text-white">
                <th className="px-6 py-3">Group Name</th>
                <th className="px-6 py-3">Students Count</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, idx) => (
                <tr
                  key={group._id}
                  className={`border-t transition cursor-pointer ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                  } hover:bg-blue-100`}
                  // onClick={() => navigate(`/groups/view/${group._id}`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-800 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      {group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      {group.candidateIds?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        group.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 align-middle">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className="px-6 py-4 flex items-center gap-3 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleViewStudents(group, e)}
                      className="text-gray-500 hover:text-blue-500 transition"
                      title="View Students"
                    >
                      <FiInfo size={20}/>
                    </button>
                    <Link
                      to={`/groups/edit/${group._id}`}
                      className="text-gray-500 hover:text-yellow-500 transition"
                      title="Edit"
                    >
                      <FiEdit size={20}/>
                    </Link>
                    <button
                      onClick={() => handleToggleActive(group._id, group.isActive)}
                      className="text-gray-500 hover:text-red-600 transition"
                      title={group.isActive ? 'Mark Inactive' : 'Mark Active'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Students Modal */}
      {isModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedGroup.name} - Students
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedGroup.candidateIds.length} student(s) in this group
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedGroup.candidateIds.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No students in this group yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedGroup.candidateIds.map((student) => (
                    <div
                      key={student._id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      {/* Student Avatar */}
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          {student.profileImageUrl ? (
                            <img
                              src={student.profileImageUrl}
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{student.name}</h3>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              student.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{student.mobile}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="capitalize">{student.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {/* <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Total: {selectedGroup.candidateIds.length} students
                </p>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;