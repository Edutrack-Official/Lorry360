import React, { useEffect, useState } from "react";
import api from "../../api/client";
import {
  Mail,
  Power,
  Search,
  Truck,
  Wrench,
  Clock
} from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Lorry {
  _id: string;
  owner_id: { _id: string; name: string; company_name?: string };
  registration_number: string;
  nick_name?: string;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const Lorries = () => {
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "maintenance" | "inactive">("all");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Column selector dropdown
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Columns toggle (defaults)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "registration_number", "nick_name", "status", "createdAt"
  ]);

  const navigate = useNavigate();

  const fetchLorries = async () => {
    try {
      const res = await api.get("/lorries");
      console.log("lorries", res);
      setLorries(res.data.data?.lorries || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch lorries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLorries();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      let newStatus: string;
      
      // Cycle through statuses: active → maintenance → inactive → active
      switch (currentStatus) {
        case 'active':
          newStatus = 'maintenance';
          break;
        case 'maintenance':
          newStatus = 'inactive';
          break;
        case 'inactive':
          newStatus = 'active';
          break;
        default:
          newStatus = 'active';
      }

      await api.patch(`/lorries/status/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchLorries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleDeleteLorry = async (id: string, registrationNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete lorry ${registrationNumber}?`)) {
      return;
    }

    try {
      await api.delete(`/lorries/delete/${id}`);
      toast.success("Lorry deleted successfully");
      fetchLorries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete lorry");
    }
  };

  // ✅ Apply Search + Filters
  const filtered = lorries.filter((lorry) => {
    const matchesSearch =
      lorry.registration_number.toLowerCase().includes(searchText.toLowerCase()) ||
      lorry.nick_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      lorry.owner_id?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || lorry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allColumns = [
    { key: "registration_number", label: "Registration Number" },
    { key: "nick_name", label: "Nick Name" },
    { key: "status", label: "Status" },
    { key: "owner_id", label: "Owner" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Last Updated" },
  ];

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setRowsPerPage(25);
    setCurrentPage(1);
    setVisibleColumns(["registration_number", "nick_name", "status", "createdAt"]);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: "🚚" },
      maintenance: { color: "bg-yellow-100 text-yellow-800", icon: "🔧" },
      inactive: { color: "bg-gray-100 text-gray-800", icon: "⏸️" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-t-xl border shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Lorries</h1>
            <Truck size={32} className="text-blue-600" />
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

            {/* Add Lorry */}
            <Link
              to="/lorries/create"
              className="inline-flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
            >
              <FaPlus size={20} />
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
              {/* ✅ All controls in one horizontal line */}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {/* Left-aligned controls */}
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by registration or nick name..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                <select
                  className="input input-bordered w-40"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as "all" | "active" | "maintenance" | "inactive");
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>

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

                {/* Right-aligned controls, pushed by ml-auto */}
                <div className="flex gap-4 ml-auto">
                  <div className="relative">
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

                  <button
                    className="btn btn-secondary"
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
              paginated.map((lorry) => (
                <tr
                  key={lorry._id}
                  className="group hover:bg-blue-50 transition-all cursor-pointer"
                  onClick={() => navigate(`/lorries/${lorry._id}`)}
                >
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-700">
                        {col.key === "registration_number" ? (
                          <span className="font-mono font-semibold text-blue-600">
                            {lorry.registration_number}
                          </span>
                        ) : col.key === "status" ? (
                          getStatusBadge(lorry.status)
                        ) : col.key === "owner_id" ? (
                          lorry.owner_id?.name || "-"
                        ) : col.key === "createdAt" || col.key === "updatedAt" ? (
                          new Date(lorry[col.key as keyof Lorry] as string).toLocaleDateString()
                        ) : (
                          (lorry as any)[col.key] || "-"
                        )}
                      </td>
                    ))}
                  <td
                    className="px-6 py-4 flex items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Edit */}
                    <Link
                      to={`/lorries/edit/${lorry._id}`}
                      className="p-2 rounded-full bg-yellow-200 text-gray-500 hover:bg-yellow-500 shadow-md transition"
                      title="Edit Lorry"
                    >
                      <FiEdit size={18} />
                    </Link>

                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(lorry._id, lorry.status)}
                      className={`p-2 rounded-full transition ${
                        lorry.status === 'active'
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : lorry.status === 'maintenance'
                          ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      title={`Change status from ${lorry.status}`}
                    >
                      <Power className="h-5 w-5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteLorry(lorry._id, lorry.registration_number)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition"
                      title="Delete Lorry"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="text-center py-10 text-gray-500 text-base font-medium">
                  No lorries found
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
        ${
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
                className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm transition
            ${
              currentPage === page
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
        ${
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

export default Lorries;