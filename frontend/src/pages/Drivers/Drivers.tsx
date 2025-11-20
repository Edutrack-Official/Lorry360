import React, { useEffect, useState } from "react";
import { Users, Search, MapPin, Phone, IndianRupee, X, Mail, Clock, Car } from "lucide-react";
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
  salary_per_trip: number;
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
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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

  // Bulk Actions
  const handleBulkActivate = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => api.patch(`/drivers/status/${id}`, { status: "active" }))
      );
      toast.success("Selected drivers activated successfully");
      setSelectedIds([]);
      setSelectAll(false);
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to bulk activate");
    }
  };

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
    setFilterStatus("all");
    setRowsPerPage(12);
    setCurrentPage(1);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
          🔴 Inactive
        </span>
      );
    }

    return status === "active" ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
        🟢 Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        🟡 Inactive
      </span>
    );
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return "border-l-red-500";
    return status === "active" ? "border-l-green-500" : "border-l-yellow-500";
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const getSalaryType = (driver: Driver) => {
    if (driver.salary_per_duty > 0 && driver.salary_per_trip > 0) {
      return "Duty + Trip";
    } else if (driver.salary_per_duty > 0) {
      return "Per Duty";
    } else if (driver.salary_per_trip > 0) {
      return "Per Trip";
    }
    return "Not Set";
  };

  const getSalaryTypeColor = (driver: Driver) => {
    if (driver.salary_per_duty > 0 && driver.salary_per_trip > 0) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else if (driver.salary_per_duty > 0) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (driver.salary_per_trip > 0) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
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
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
              <p className="text-gray-600">Manage your drivers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <div className="relative">
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm">
                    Bulk Actions ({selectedIds.length}) ▼
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={handleBulkActivate}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      🟢 Activate All
                    </button>
                    <button
                      onClick={handleBulkDeactivate}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      🔴 Deactivate All
                    </button>
                    <button
                      onClick={() => setConfirmBulkDelete(true)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🗑️ Delete All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters Toggle */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2"
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

            {/* Add Driver */}
            <Link
              to="/drivers/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FaPlus size={16} />
              Add Driver
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
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search drivers by name, phone, or address..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                <select
                  className="input input-bordered w-full md:w-40"
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
                  className="input input-bordered w-full md:w-40"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[12, 24, 36, 48].map((count) => (
                    <option key={count} value={count}>
                      {count} per page
                    </option>
                  ))}
                </select>

                <button
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginated.map((driver) => (
          <div
            key={driver._id}
            className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${getStatusColor(driver.status, driver.isActive)} relative`}
          >
            <div
              className="p-5 cursor-pointer group"
              onClick={() => navigate(`/drivers/${driver._id}`)}
            >
              {/* Header with Selection Checkbox */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(driver._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectOne(driver._id);
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                    />

                    {/* Driver Name and Role */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {driver.name}
                      </h3>
                      <p className="text-gray-500 text-sm">Professional Driver</p>
                    </div>
                  </div>
                </div>

                {/* Action Menu */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDriver(driver);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors group/btn"
                    title="More actions"
                  >
                    <BsThreeDotsVertical className="h-4 w-4 text-gray-400 group-hover/btn:text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Status and Salary Type */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(driver.status, driver.isActive)}
                </div>

                {/* Salary Type Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSalaryTypeColor(driver)}`}>
                  {getSalaryType(driver)}
                </span>
              </div>

              {/* Salary Information */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {driver.salary_per_duty > 0 && (
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">
                      {formatSalary(driver.salary_per_duty)}
                    </p>
                    <p className="text-xs text-blue-600">per duty</p>
                  </div>
                )}
                {driver.salary_per_trip > 0 && (
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-900">
                      {formatSalary(driver.salary_per_trip)}
                    </p>
                    <p className="text-xs text-green-600">per trip</p>
                  </div>
                )}
              </div>

              {/* Driver Details Grid */}
              <div className="space-y-3">
                {/* Phone */}
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <div className="p-1.5 bg-white rounded-md shadow-sm">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{driver.phone}</span>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <div className="p-1.5 bg-white rounded-md shadow-sm mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{driver.address}</p>
                  </div>
                </div>

                {/* Join Date */}
                {/* <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <div className="p-1.5 bg-white rounded-md shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Joined {new Date(driver.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.floor((new Date().getTime() - new Date(driver.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No drivers found</h3>
          <p className="text-gray-600 mb-6">
            {searchText || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first driver"
            }
          </p>
          <Link
            to="/drivers/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <FaPlus size={16} />
            Add First Driver
          </Link>
        </div>
      )}

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

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDriver.name}
                </h3>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedDriver.phone}</p>
                </div>

                {/* Salary Information */}
                {selectedDriver.salary_per_duty > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Salary per Duty</label>
                    <p className="text-gray-900">{formatSalary(selectedDriver.salary_per_duty)}</p>
                  </div>
                )}

                {selectedDriver.salary_per_trip > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Salary per Trip</label>
                    <p className="text-gray-900">{formatSalary(selectedDriver.salary_per_trip)}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Salary Type</label>
                  <p className="text-gray-900">{getSalaryType(selectedDriver)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Work Status</label>
                  <div className="mt-1">{getStatusBadge(selectedDriver.status, selectedDriver.isActive)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Account Status</label>
                  <p className="text-gray-900">{selectedDriver.isActive ? "Active" : "Inactive"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">{selectedDriver.address}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-gray-900">{new Date(selectedDriver.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">{new Date(selectedDriver.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    navigate(`/drivers/edit/${selectedDriver._id}`);
                    setSelectedDriver(null);
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Driver
                </button>
                <button
                  onClick={() => {
                    if (selectedDriver.isActive && selectedDriver.status === "active") {
                      handleDeactivate(selectedDriver._id);
                    } else {
                      handleActivate(selectedDriver._id);
                    }
                    setSelectedDriver(null);
                  }}
                  className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  {selectedDriver.isActive && selectedDriver.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedDriver._id);
                    setSelectedDriver(null);
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bulk Delete */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">
              Delete {selectedIds.length} Drivers?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete all selected drivers? This action cannot be undone.
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
    </div>
  );
};

export default Drivers;