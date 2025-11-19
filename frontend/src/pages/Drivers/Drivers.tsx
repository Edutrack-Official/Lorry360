import React, { useEffect, useState } from "react";
import { Users, Pencil, Trash2, Eye, X, Search, MapPin, Phone, IndianRupee } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { BsThreeDotsVertical } from "react-icons/bs";
import api from "../../api/client";

interface Driver {
  _id: string;
  name: string;
  phone: string;
  address: string;
  salary_per_duty: number;
  status: "active" | "inactive";
  isActive: boolean;
  owner_id: string;
  createdAt: string;
  updatedAt: string;
}

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

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
    "name", "phone", "salary_per_duty", "address", "status", "createdAt"
  ]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const navigate = useNavigate();

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/drivers");
      setDrivers(res.data.data?.drivers || []);
    } catch (error: any) {
      console.error("Failed to fetch drivers", error);
      toast.error(error.response?.data?.error || "Failed to fetch drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      await api.patch(`/drivers/status/${id}`, { status: "inactive" });
      toast.success("Driver deactivated successfully");
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to deactivate driver");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.patch(`/drivers/status/${id}`, { status: "active" });
      toast.success("Driver activated successfully");
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to activate driver");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/drivers/delete/${id}`);
      toast.success("Driver deleted successfully");
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete driver");
    }
  };

  // Apply Search + Filters
  const filtered = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      driver.address.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && driver.isActive && driver.status === "active") ||
      (filterStatus === "inactive" && (!driver.isActive || driver.status === "inactive"));

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "salary_per_duty", label: "Salary/Duty" },
    { key: "address", label: "Address" },
    { key: "status", label: "Work Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];

  // Handle Select All
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((d) => d._id));
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

  // Bulk Deactivate
  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => api.patch(`/drivers/status/${id}`, { status: "inactive" }))
      );
      toast.success("Selected drivers deactivated successfully");
      setSelectedIds([]);
      setSelectAll(false);
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to bulk deactivate");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => api.delete(`/drivers/delete/${id}`))
      );
      toast.success("Selected drivers deleted successfully");
      setSelectedIds([]);
      setSelectAll(false);
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to bulk delete");
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("active");
    setRowsPerPage(25);
    setCurrentPage(1);
    setVisibleColumns(["name", "phone", "salary_per_duty", "address", "status", "createdAt"]);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }

    return status === "active" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Inactive
      </span>
    );
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading drivers...</div>;
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-3 sm:p-4 rounded-t-xl border shadow-md flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Drivers</h1>
            <Users size={32} className="text-gray-800" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  className="px-2 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm flex-shrink-0"
                >
                  Deactivate Selected ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2 sm:px-4 py-2 rounded-lg bg-red-800 text-white hover:bg-red-900 transition text-sm flex-shrink-0"
                >
                  Delete Selected ({selectedIds.length})
                </button>
              </div>
            )}

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

            {/* Add Driver */}
            <Link
              to="/drivers/create"
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
                {/* Search */}
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
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
                    setFilterStatus(e.target.value as any);
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
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.length > 0 ? (
              paginated.map((driver) => (
                <tr
                  key={driver._id}
                  className="group hover:bg-blue-50 transition-all"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(driver._id)}
                      onChange={() => toggleSelectOne(driver._id)}
                    />
                  </td>
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-700">
                        {col.key === "phone" ? (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {driver.phone}
                          </div>
                        ) : col.key === "salary_per_duty" ? (
                          <div className="flex items-center gap-2">
                            <IndianRupee size={14} className="text-gray-400" />
                            {formatSalary(driver.salary_per_duty)}
                          </div>
                        ) : col.key === "address" ? (
                          <div className="flex items-center gap-2 max-w-xs truncate">
                            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{driver.address}</span>
                          </div>
                        ) : col.key === "status" ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            driver.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                          </span>
                        ) : col.key === "createdAt" || col.key === "updatedAt" ? (
                          new Date(driver[col.key as keyof Driver] as string).toLocaleDateString()
                        ) : (
                          (driver as any)[col.key] || "-"
                        )}
                      </td>
                    ))}
                  <td className="px-6 py-4">
                    {getStatusBadge(driver.status, driver.isActive)}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-3">
                    {/* Edit */}
                    <Link
                      to={`/drivers/edit/${driver._id}`}
                      className="p-2 rounded-full bg-yellow-200 text-gray-500 hover:bg-yellow-500 shadow-md transition"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </Link>

                    {/* View Details */}
                    <button
                      onClick={() => setSelectedDriver(driver)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-md transition"
                      title="View Details"
                    >
                      <BsThreeDotsVertical className="h-5 w-5" />
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => driver.isActive && driver.status === "active" 
                        ? setConfirmDeleteId(driver._id) 
                        : handleActivate(driver._id)
                      }
                      className={`p-2 rounded-full transition ${
                        driver.isActive && driver.status === "active"
                          ? "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                          : "bg-green-100 text-green-600 hover:bg-green-500 hover:text-white"
                      }`}
                      title={driver.isActive && driver.status === "active" ? "Deactivate" : "Activate"}
                    >
                      {driver.isActive && driver.status === "active" ? <Trash2 size={18} /> : "A"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(driver._id)}
                      className="p-2 rounded-full bg-red-800 text-white hover:bg-red-900 shadow-md transition"
                      title="Delete Permanently"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 3} className="text-center py-10 text-gray-500 text-base font-medium">
                  No drivers found
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
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[500px] relative animate-fadeIn">
            <button
              onClick={() => setSelectedDriver(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedDriver.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
              <p>
                <strong>Phone:</strong> {selectedDriver.phone}
              </p>
              <p>
                <strong>Salary per Duty:</strong> {formatSalary(selectedDriver.salary_per_duty)}
              </p>
              <p>
                <strong>Work Status:</strong> {getStatusBadge(selectedDriver.status, selectedDriver.isActive)}
              </p>
              <p>
                <strong>Account Status:</strong> {selectedDriver.isActive ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Address:</strong> {selectedDriver.address}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedDriver.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {new Date(selectedDriver.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deactivate */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Deactivate Driver
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to deactivate this driver? They will be marked as inactive.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeactivate(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bulk Deactivate */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Deactivate {selectedIds.length} Drivers?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to deactivate all selected drivers? They will be marked as inactive.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleBulkDeactivate();
                  setConfirmBulkDelete(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Deactivate All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;