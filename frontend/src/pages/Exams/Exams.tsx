import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import api from "../../api/client";
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa6';
import { FiEdit } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {  ClipboardList } from 'lucide-react';


import ManageExamForm from './ManageExamForm';
import { IoIosArrowBack } from 'react-icons/io';

interface Exam {
  _id: string;
  name: string;
  examCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;   // ✅ added
  instituteId: string[];
}

interface Institute {
  _id: string;
  name: string;
}

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  const [showExamPage, setShowExamPage] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [toggleExam, setToggleExam] = useState<Exam | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterInstitute, setFilterInstitute] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [resExams, resInstitutes] = await Promise.all([
        api.get('/exam/all'),
        api.get('/institutes'),
      ]);
      setExams(resExams.data.exams || []);
      setInstitutes(resInstitutes.data.institutes || []);
    } catch {
      toast.error('Failed to load exams or institutes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (exam: Exam) => {
    try {
      await api.put(`/exam/${exam._id}`, { isActive: !exam.isActive });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesInstitute =
      filterInstitute === 'all' || exam.instituteId.includes(filterInstitute);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && exam.isActive) ||
      (filterStatus === 'inactive' && !exam.isActive);
    return matchesSearch && matchesInstitute && matchesStatus;
  });

  // --- pagination calculations ---
  const totalPages = Math.ceil(filteredExams.length / rowsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6 fade-in p-6">
      {showExamPage ? (
        <>
           <button
            onClick={() => setShowExamPage(false)}
                aria-label="Go back"
                className={`inline-flex items-center gap-2 px-3 py-2 
                            bg-gray-100 text-gray-700 rounded-lg shadow-sm 
                            hover:bg-gray-200 hover:scale-105 transition 
                            font-medium`}
              >
                <IoIosArrowBack size={22} className="text-gray-600" />
                <span>Back</span>
              </button>

          <ManageExamForm
            examToEdit={editExam ?? undefined}
            institutes={institutes}
            onClose={() => {
              setShowExamPage(false);
              fetchData();
            }}
          />
        </>
      ) : (
        <>
          {/* Header with Filters */}
          <div className="bg-white p-4 rounded-t-xl border shadow-md flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">                
                 <h1 className="text-3xl font-bold">Exams</h1>
                 <ClipboardList size={32} className="text-gray-800" />
              </div>
              <div className="flex items-center gap-3">
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

                {/* Add Exam */}
                <button
                  className="inline-flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
                  onClick={() => {
                    setEditExam(null);
                    setShowExamPage(true);
                  }}
                >
                  <FaPlus size={20} />
                </button>
              </div>
            </div>

              {/* Filters (Animated Collapse in SAME block) */}
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
                            placeholder="Search exams..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="input input-bordered pl-9 w-full"
                          />
                        </div>

                        {/* Institute Filter */}
                        {/* <select
                        className="input input-bordered w-40"
                        value={filterInstitute}
                        onChange={(e) => setFilterInstitute(e.target.value)}
                      >
                        <option value="all">All Institutes</option>
                        {institutes.map((i) => (
                          <option key={i._id} value={i._id}>
                            {i.name}
                          </option>
                        ))}
                      </select> */}

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
                          setCurrentPage(1); // reset page
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
              <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Exam Code</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold">Updated</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedExams.length > 0 ? (
                  paginatedExams.map((exam) => (
                    <tr
                      key={exam._id}
                      onClick={() => navigate(`/exams/${exam._id}/subjects`)}
                      className="group hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{exam.name}</td>
                      <td className="px-6 py-4 text-gray-600">{exam.examCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {exam.updatedAt
                          ? new Date(exam.updatedAt).toLocaleDateString()
                          : '-'}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-6 py-4 flex items-center justify-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditExam(exam);
                            setShowExamPage(true);
                          }}
                          className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                        >
                          <FiEdit size={18} />
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {/* Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ prevent row click
                            setToggleExam(exam);
                          }}
                          className={`p-2 rounded-full transition ${exam.isActive
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                          {exam.isActive ? (
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
                    <td
                      colSpan={6}
                      className="text-center py-10 text-gray-500 text-base font-medium"
                    >
                      No exams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-4">
                {/* Prev button */}
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {/* Page numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next button */}
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
          {toggleExam && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
              <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">
                  {toggleExam.isActive ? 'Deactivate' : 'Activate'} this exam?
                </h3>
                <div className="flex justify-end gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setToggleExam(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handleToggleStatus(toggleExam);
                      setToggleExam(null);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Exams;
