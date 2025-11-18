import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, X, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { Plus, Edit3, Eye } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { AnimatePresence, motion } from "framer-motion";
import api from "../../api/client";

interface Subject {
  _id: string;
  name: string;
  subjectCode: string;
  isActive: boolean;
  examId: string;
  instituteId?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface Exam {
  _id: string;
  name: string;
  examCode: string;
}

interface Institute {
  _id: string;
  name: string;
}

const Subjects = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleSubject, setToggleSubject] = useState<Subject | null>(null);
  const [showFilters, setShowFilters] = useState(false);


  // Filters & Pagination
  const [searchText, setSearchText] = useState('');
  const [filterInstitute, setFilterInstitute] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchData = async () => {
    if (!examId) return;
    try {
      const [examRes, subRes, instRes] = await Promise.all([
        api.get(`/exam/${examId}`),
        api.get(`/subject/exam/${examId}`),
        api.get(`/institutes`),
      ]);
      setExam(examRes.data);
      setSubjects(subRes.data || []);
      setInstitutes(instRes.data.institutes || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

  const handleToggleStatus = async (subject: Subject) => {
    try {
      await api.put(`/subject/${subject._id}`, { isActive: !subject.isActive });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesInstitute =
      filterInstitute === 'all' || subject.instituteId?.includes(filterInstitute);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && subject.isActive) ||
      (filterStatus === 'inactive' && !subject.isActive);
    return matchesSearch && matchesInstitute && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubjects.length / rowsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <BackButton />

      {exam && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-xl shadow-md text-white">
          <h2 className="text-3xl font-bold">{exam.name}</h2>
          <p className="text-sm mt-1 opacity-90">Exam Code: {exam.examCode}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-t-xl border shadow-md flex flex-col gap-4">
        {/* Header with Toggle Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subjects</h1>

          <div className="flex gap-3">
            {/* Filters toggle */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <motion.span
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                ▼
              </motion.span>
              Filters
            </button>

            <button
              className="inline-flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
              onClick={() => navigate(`/exams/${examId}/subjects/add`)}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Filters (Animated Collapse) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-2">
                <div className="flex gap-3 w-full md:w-auto flex-1">
                  {/* Search */}
                  <div className="relative w-full md:w-60">
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="input input-bordered pl-9 w-full"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    className="input input-bordered w-36"
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as "all" | "active" | "inactive")
                    }
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Rows per page dropdown */}
                <select
                  className="input input-bordered w-32"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[25, 50, 75, 100].map((count) => (
                    <option key={count} value={count}>
                      {count} per page
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  className="btn btn-secondary flex items-center gap-2"
                  onClick={() => {
                    setSearchText("");
                    setFilterInstitute("all");
                    setFilterStatus("all");
                    setRowsPerPage(25);
                    setCurrentPage(1);
                  }}
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Code</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold">Updated</th>
              <th className="px-6 py-4 font-semibold">Created By</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginatedSubjects.length > 0 ? (
              paginatedSubjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-blue-50 transition-all">
                  <td className="px-6 py-4 font-medium text-gray-800">{subject.name}</td>
                  <td className="px-6 py-4 text-gray-600">{subject.subjectCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(subject.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(subject.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]">
                    {subject.createdBy}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-6 py-4 flex items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate(`/exams/${examId}/subjects/add?edit=${subject._id}`)}
                      className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                    >
                      <Edit3 size={18} />
                    </button>
                    <Link
                      to={`/subjects/${subject._id}/chapters`}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setToggleSubject(subject)}
                      className={`p-2 rounded-full transition ${subject.isActive
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                      {subject.isActive ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No subjects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirm Toggle Modal */}
      {toggleSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">
              {toggleSubject.isActive ? 'Deactivate' : 'Activate'} this subject?
            </h3>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setToggleSubject(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleToggleStatus(toggleSubject);
                  setToggleSubject(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;