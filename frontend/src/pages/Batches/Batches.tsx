import React, { useEffect, useState } from "react";
import api from "../../api/client";
import { Power, Search, GraduationCap } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "../../components/BackButton";

interface Batch {
  _id: string;
  name: string;
  code: string;
  year: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: { _id: string; name: string; email: string };
  instituteId?: { _id: string; name: string; code: string };
  lastUpdatedBy?: { _id: string; name: string; email: string };
  updatedAt?: string;
}

const Batches = () => {
  const { instituteId } = useParams();
  const navigate = useNavigate();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [instituteName, setInstituteName] = useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination / per-page
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Column toggle
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "code",
    "year",
    "status",
  ]);

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "year", label: "Year" },
    { key: "status", label: "Status" },
    { key: "createdBy", label: "Created By" },
    { key: "createdAt", label: "Created At" },
    { key: "lastUpdatedBy", label: "Last Updated By" },
    { key: "updatedAt", label: "Updated At" },
  ];

  const fetchBatches = async () => {
    try {

        if (instituteId) {
              localStorage.setItem('selectedInstituteId', instituteId);
            }      const res = await api.get(
        `/batch/institute/${instituteId}`
      );
      setBatches(res.data.batches || []);

      if (res.data.batches?.length > 0 && res.data.batches[0].instituteId) {
        setInstituteName(res.data.batches[0].instituteId.name);
      }
    } catch {
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [instituteId]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/batches/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Marked as ${!currentStatus ? "Active" : "Inactive"}`);
      fetchBatches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Filtering
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = !yearFilter || batch.year.includes(yearFilter.trim());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && batch.isActive) ||
      (statusFilter === "inactive" && !batch.isActive);

    return matchesSearch && matchesYear && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / rowsPerPage));
  const paginated = filteredBatches.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const resetFilters = () => {
    setSearchQuery("");
    setYearFilter("");
    setStatusFilter("all");
    setVisibleColumns(["name", "code", "year", "status"]);
    setRowsPerPage(25);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 🔹 Header */}
      <div className="bg-white p-4 rounded-t-xl border shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                Batches
              </h2>
              {instituteName && (
                <p className="text-sm text-gray-500">
                  Institute: <span className="font-medium">{instituteName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filters Toggle */}
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

            {/* Add Batch */}
            <Link
              to={`/batches/create?instituteId=${instituteId}`}
              className="inline-flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
            >
              <FaPlus size={20} />
            </Link>
          </div>
        </div>

        {/* 🔹 Filters (inside header) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {/* Search */}
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                {/* Year */}
                <input
                  type="text"
                  placeholder={`Year (e.g. ${new Date().getFullYear()})`}
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input input-bordered w-40"
                />

                {/* Status */}
                <select
                  className="input input-bordered w-40"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | "active" | "inactive");
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Rows per page */}
                <select
                  className="input input-bordered w-40"
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

                {/* Column toggle */}
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Select Columns ▼
                  </button>
                  {showColumnDropdown && (
                    <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      {allColumns.map((col) => (
                        <label key={col.key} className="flex items-center gap-2 text-sm py-1">
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setVisibleColumns([...visibleColumns, col.key]);
                              } else {
                                setVisibleColumns(visibleColumns.filter((c) => c !== col.key));
                              }
                            }}
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button className="btn btn-secondary" onClick={resetFilters}>
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔹 Table */}
      <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
        {loading ? (
          <p className="text-center text-gray-500 p-6">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm">
              <tr>
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
                paginated.map((batch) => (
                  <tr
                    key={batch._id}
                    className="group hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => navigate(`/batches/${batch._id}/students`)}
                  >
                    {allColumns
                      .filter((col) => visibleColumns.includes(col.key))
                      .map((col) => (
                        <td key={col.key} className="px-6 py-4 text-gray-700">
                          {col.key === "status" ? (
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                batch.isActive
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }`}
                            >
                              {batch.isActive ? "Active" : "Inactive"}
                            </span>
                          ) : col.key === "createdBy" ? (
                            batch.createdBy?.name || "-"
                          ) : col.key === "lastUpdatedBy" ? (
                            batch.lastUpdatedBy?.name || "-"
                          ) : col.key === "createdAt" ? (
                            new Date(batch.createdAt).toLocaleDateString()
                          ) : col.key === "updatedAt" ? (
                            batch.updatedAt ? new Date(batch.updatedAt).toLocaleDateString() : "-"
                          ) : (
                            (batch as any)[col.key] || "-"
                          )}
                        </td>
                      ))}
                    <td
                      className="px-6 py-4 flex items-center justify-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to={`/batches/edit/${batch._id}`}
                        className="p-2 rounded-full bg-yellow-200 text-gray-500 hover:bg-yellow-500 shadow-md transition"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </Link>

                      <button
                        onClick={() => handleToggleActive(batch._id, batch.isActive)}
                        className={`p-2 rounded-full transition ${
                          batch.isActive
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                        title={batch.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="text-center py-10 text-gray-500 text-base font-medium"
                  >
                    No batches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white border border-gray-200 shadow-md rounded-b-xl mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm ${
              currentPage === 1
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
                className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm transition ${
                  currentPage === page ? "bg-blue-600 text-white shadow" : "bg-gray-50 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm ${
              currentPage === totalPages
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-blue-600 bg-gray-50 hover:bg-blue-100"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Batches;
