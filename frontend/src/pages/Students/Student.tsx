import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Pencil,
  Power,
  Search,
  Phone,
  User,
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import api from "../../api/client";

interface Student {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isActive: boolean;
  createdAt: string;
}

const Students = () => {
  const { batchId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get('view') || 'students';

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/students/batch/${batchId}`);
      setStudents(res.data.students);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      localStorage.setItem('selectedBatchId', batchId);
      fetchStudents();
    }
  }, [batchId]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`http://localhost:7071/api/users/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // ✅ Filtering
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && student.isActive) ||
      (statusFilter === 'inactive' && !student.isActive);

    return matchesSearch && matchesStatus;
  });

  // ✅ Navigate to Groups when Groups tab is clicked
  useEffect(() => {
    if (view === 'groups' && batchId) {
      navigate(`/batches/${batchId}/groups`);
    }
  }, [view, batchId, navigate]);

  return (
    <div className="px-4 md:px-10 py-6">
      <BackButton />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">👨‍🎓 Students</h1>
        <Link
          to={`/students/create?batchId=${batchId}`}
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Student
        </Link>
      </div>

      {/* ✅ Toggle between Students / Groups */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            view === 'students'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Students
        </button>
        <button
          onClick={() => navigate(`/batches/${batchId}/groups`)}
          className="px-4 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Groups
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Mobile</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr
                  key={student._id}
                  className={`border-t transition ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                  } hover:bg-blue-50`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800 align-middle flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    {student.name}
                  </td>
                  <td className="px-6 py-4 align-middle">{student.email}</td>
                  <td className="px-6 py-4 align-middle flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {student.mobile || '-'}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        student.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 align-middle">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3 align-middle">
                    <Link
                      to={`/students/edit/${student._id}`}
                      className="text-gray-500 hover:text-yellow-500 transition"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleToggleActive(student._id, student.isActive)}
                      className="text-gray-500 hover:text-red-600 transition"
                      title={student.isActive ? 'Mark Inactive' : 'Mark Active'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Students;