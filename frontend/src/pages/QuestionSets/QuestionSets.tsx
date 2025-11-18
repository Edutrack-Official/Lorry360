import React, { useEffect, useState } from "react";
import { PlusCircle, Pencil, Trash2, Eye, X, Search, Power, FileQuestion } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiFilePaper2Line } from "react-icons/ri";
import api from "../../api/client";


interface UserRef {
  _id: string;
  name: string;
  email: string;
}

interface Ref {
  _id: string;
  name: string;
}

interface QuestionSet {
  _id: string;
  name: string;
  code?: string;
  isActive: boolean;
  examId?: Ref | null;
  subjectId?: Ref | null;
  chapterId?: Ref | null;
  instituteId?: Ref[];
  createdBy?: UserRef;
  lastUpdatedBy?: UserRef;
  createdAt: string;
  updatedAt: string;
}

const QuestionSets = () => {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("active");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Column selector dropdown
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Columns toggle (defaults)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name", "code", "examId", "subjectId", "createdBy"
  ]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Clone Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloneCode, setCloneCode] = useState("");

  const [bulkAction, setBulkAction] = useState("");


  const navigate = useNavigate();

  const fetchQuestionSets = async () => {
    try {
      const res = await api.get("/questionset/all");
      setQuestionSets(res.data.questionSets || []);
    } catch (error) {
      console.error("Failed to fetch question sets", error);
      toast.error("Failed to fetch question sets");
      setQuestionSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/questionset/update/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Marked as ${!currentStatus ? "Active" : "Inactive"}`);
      fetchQuestionSets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Apply Search + Filters
  const filtered = questionSets.filter((set) => {
    const matchesSearch =
      set.name.toLowerCase().includes(searchText.toLowerCase()) ||
      set.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      set.examId?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      set.subjectId?.name?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && set.isActive) ||
      (filterStatus === "inactive" && !set.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "examId", label: "Exam" },
    { key: "subjectId", label: "Subject" },
    { key: "chapterId", label: "Chapter" },
    { key: "createdBy", label: "Created By" },
    { key: "lastUpdatedBy", label: "Last Updated By" },
    { key: "instituteId", label: "Institutes" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];

  // Handle Select All
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((s) => s._id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Open Clone Modal
  const openCloneModal = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one question set to clone");
      return;
    }
    setShowCloneModal(true);
  };

  // Handle Clone
  const handleClone = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    try {
      const res = await api.post("api/questionset/clone", {
        questionSetIds: selectedIds,
        createdBy: userId,
        name: cloneName,
        code: cloneCode,
      });
      toast.success(`${res.data.clonedSets?.length || 0} Question Set(s) cloned successfully`);
      setSelectedIds([]);
      setSelectAll(false);
      setShowCloneModal(false);
      setCloneName("");
      setCloneCode("");
      fetchQuestionSets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to clone question sets");
    }
  };

  // Soft Delete One
  const handleSoftDelete = async (id: string) => {
    try {
      await api.put(`api/questionset/update/${id}`, {
        isActive: false,
      });
      toast.success("Question set marked inactive");
      fetchQuestionSets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.put(`/questionset/update/${id}`, {
            isActive: false,
          })
        )
      );
      toast.success("Selected sets marked inactive");
      setSelectedIds([]);
      setSelectAll(false);
      fetchQuestionSets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to bulk delete");
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one question set");
      return;
    }

    switch (action) {
      case "clone":
        openCloneModal();
        break;
      case "delete":
        setConfirmBulkDelete(true);
        break;
      case "share":
        toast.success("Share action triggered");
        break;
      default:
        break;
    }

    // Reset dropdown value
    setBulkAction("");
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setRowsPerPage(25);
    setCurrentPage(1);
    setVisibleColumns(["name", "code", "examId", "subjectId", "createdBy"]);
    setSelectedIds([]);
    setSelectAll(false);
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-3 sm:p-4 rounded-t-xl border shadow-md flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Question Sets</h1>
            <FileQuestion size={32} className="text-gray-800" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto">
            {/* Bulk Actions */}
            <select
              value={bulkAction}
              onChange={(e) => {
                setBulkAction(e.target.value);
                handleBulkAction(e.target.value);
              }}
              className="px-2 sm:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0 flex-shrink-0"
            >
              <option value="" disabled>
                <span className="hidden sm:inline">Bulk Actions</span>
                <span className="sm:hidden">Bulk</span>
              </option>
              <option value="clone">Clone</option>
              <option value="delete">Delete</option>
              <option value="share">Share</option>
            </select>

            {/* Filters Toggle */}
            <button
              className="px-2 sm:px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-1 sm:gap-2 text-sm flex-shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <motion.span
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block text-xs"
              >
                ▼
              </motion.span>
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </button>
            {/* Add Question Set */}
            <Link
              to="/questionsets/add"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all flex-shrink-0"
            >
              <FaPlus size={16} className="sm:hidden" />
              <FaPlus size={20} className="hidden sm:block" />
            </Link>
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
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap md:items-center md:gap-4 gap-3">
                {/* Search - Full width on all screens */}
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search question sets..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                {/* Status Filter */}
                <select
                  className="input input-bordered w-full sm:w-auto"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as "all" | "active" | "inactive");
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Rows per page */}
                <select
                  className="input input-bordered w-full sm:w-auto"
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

                {/* Right-aligned controls */}
                <div className="flex gap-3 sm:gap-4 md:ml-auto w-full sm:w-auto justify-between sm:justify-start">
                  {/* Column Selector */}
                  <div className="relative w-full sm:w-auto">
                    <button
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                      className="px-4 py-2 w-full sm:w-auto bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Select Columns ▼
                    </button>
                    {showColumnDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                        {allColumns.map((col) => (
                          <label
                            key={col.key}
                            className="flex items-center gap-2 text-sm py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns.includes(col.key)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setVisibleColumns([...visibleColumns, col.key]);
                                } else {
                                  setVisibleColumns(
                                    visibleColumns.filter((c) => c !== col.key)
                                  );
                                }
                              }}
                            />
                            {col.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm w-full sm:w-auto"
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </button>
                </div>
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
              <th className="px-6 py-4 font-semibold">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              {allColumns
                .filter((col) => visibleColumns.includes(col.key))
                .map((col) => (
                  <th key={col.key} className="px-6 py-4 font-semibold">
                    {col.label}
                  </th>
                ))}
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.length > 0 ? (
              paginated.map((set) => (
                <tr
                  key={set._id}
                  className="group hover:bg-blue-50 transition-all cursor-pointer"
                  onClick={() => navigate(`/questions/${set._id}`)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(set._id)}
                      onChange={() => toggleSelectOne(set._id)}
                    />
                  </td>
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-700">
                        {col.key === "examId" ? (
                          set.examId?.name || "-"
                        ) : col.key === "subjectId" ? (
                          set.subjectId?.name || "-"
                        ) : col.key === "chapterId" ? (
                          set.chapterId?.name || "-"
                        ) : col.key === "createdBy" ? (
                          set.createdBy?.name || "-"
                        ) : col.key === "lastUpdatedBy" ? (
                          set.lastUpdatedBy?.name || "-"
                        ) : col.key === "instituteId" ? (
                          set.instituteId?.length
                            ? set.instituteId.map((i) => i.name).join(", ")
                            : "-"
                        ) : col.key === "createdAt" ? (
                          new Date(set.createdAt).toLocaleDateString()
                        ) : col.key === "updatedAt" ? (
                          new Date(set.updatedAt).toLocaleDateString()
                        ) : (
                          (set as any)[col.key] || "-"
                        )}
                      </td>
                    ))}
                  <td
                    className="px-6 py-4 flex items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Edit */}
                    <Link
                      to={`/questionsets/edit/${set._id}`}
                      className="p-2 rounded-full bg-yellow-200 text-gray-500 hover:bg-yellow-500 shadow-md transition"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </Link>
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleActive(set._id, set.isActive)}
                      className={`p-2 rounded-full transition ${set.isActive
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      title={set.isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className="h-5 w-5" />
                    </button>
                    {/* View Details */}
                    <button
                      onClick={() => setSelectedSet(set)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-md transition"
                      title="View Details"
                    >
                      <BsThreeDotsVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="text-center py-10 text-gray-500 text-base font-medium">
                  No question sets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 
                        bg-white border border-gray-200 shadow-md rounded-b-xl mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm
              ${currentPage === 1
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-blue-600 bg-gray-50 hover:bg-blue-100"
              }`}
          >
            Prev
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm transition
                  ${currentPage === page
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-50 text-gray-700 hover:bg-blue-100"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm
              ${currentPage === totalPages
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-blue-600 bg-gray-50 hover:bg-blue-100"
              }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Popup Modal for Details */}
      {selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[600px] relative animate-fadeIn">
            <button
              onClick={() => setSelectedSet(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedSet.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p>
                <strong>Code:</strong> {selectedSet.code || "-"}
              </p>
              <p>
                <strong>Status:</strong> {selectedSet.isActive ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Exam:</strong> {selectedSet.examId?.name || "-"}
              </p>
              <p>
                <strong>Subject:</strong> {selectedSet.subjectId?.name || "-"}
              </p>
              <p>
                <strong>Chapter:</strong> {selectedSet.chapterId?.name || "-"}
              </p>
              <p>
                <strong>Institutes:</strong>{" "}
                {selectedSet.instituteId?.length
                  ? selectedSet.instituteId.map((i) => i.name).join(", ")
                  : "-"}
              </p>
              <p>
                <strong>Created By:</strong>{" "}
                {selectedSet.createdBy?.name || "-"}
              </p>
              <p>
                <strong>Last Updated By:</strong>{" "}
                {selectedSet.lastUpdatedBy?.name || "-"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedSet.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {new Date(selectedSet.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete One */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this Question Set?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSoftDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bulk Delete */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete {selectedIds.length} Question Sets?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleBulkDelete();
                  setConfirmBulkDelete(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Clone Question Set</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter new name"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Enter new code"
                value={cloneCode}
                onChange={(e) => setCloneCode(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowCloneModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={!cloneName || !cloneCode}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Clone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionSets;