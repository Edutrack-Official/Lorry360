import React, { useEffect, useState } from "react";
import { Users, Pencil, Trash2, Eye, X, Search, Building, MapPin, Phone, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { BsThreeDotsVertical } from "react-icons/bs";
import api from "../../api/client";

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  plan_type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Owners = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "trial" | "basic" | "professional" | "enterprise">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("active");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Column selector dropdown
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Columns toggle (defaults)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name", "company_name", "email", "phone", "plan_type", "city", "createdAt"
  ]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const navigate = useNavigate();

  const fetchOwners = async () => {
    try {
      const res = await api.get("/users?role=owner");
      setOwners(res.data.data?.users || []);
    } catch (error: any) {
      console.error("Failed to fetch owners", error);
      toast.error(error.response?.data?.error || "Failed to fetch owners");
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      await api.put(`/users/deactivate/${id}`);
      toast.success("Owner deactivated successfully");
      fetchOwners();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to deactivate owner");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.put(`/users/update/${id}`, { isActive: true });
      toast.success("Owner activated successfully");
      fetchOwners();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to activate owner");
    }
  };

  // Apply Search + Filters
  const filtered = owners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchText.toLowerCase()) ||
      owner.company_name.toLowerCase().includes(searchText.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchText.toLowerCase()) ||
      owner.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      owner.city.toLowerCase().includes(searchText.toLowerCase());

    const matchesPlan = filterPlan === "all" || owner.plan_type === filterPlan;
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && owner.isActive) ||
      (filterStatus === "inactive" && !owner.isActive);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "company_name", label: "Company" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "plan_type", label: "Plan" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "pincode", label: "Pincode" },
    { key: "address", label: "Address" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];

  // Handle Select All
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((o) => o._id));
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
        selectedIds.map((id) => api.put(`/users/deactivate/${id}`))
      );
      toast.success("Selected owners deactivated successfully");
      setSelectedIds([]);
      setSelectAll(false);
      fetchOwners();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to bulk deactivate");
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterPlan("all");
    setFilterStatus("active");
    setRowsPerPage(25);
    setCurrentPage(1);
    setVisibleColumns(["name", "company_name", "email", "phone", "plan_type", "city", "createdAt"]);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      trial: { color: "bg-gray-100 text-gray-800", label: "Trial" },
      basic: { color: "bg-blue-100 text-blue-800", label: "Basic" },
      professional: { color: "bg-purple-100 text-purple-800", label: "Professional" },
      enterprise: { color: "bg-green-100 text-green-800", label: "Enterprise" }
    };
    
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.trial;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading owners...</div>;
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-3 sm:p-4 rounded-t-xl border shadow-md flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Owners</h1>
            <Users size={32} className="text-gray-800" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-2 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm flex-shrink-0"
              >
                Deactivate Selected ({selectedIds.length})
              </button>
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

            {/* Add Owner */}
            <Link
              to="/owners/create"
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
                    placeholder="Search owners..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                {/* Plan Filter */}
                <select
                  className="input input-bordered w-full sm:w-auto"
                  value={filterPlan}
                  onChange={(e) => {
                    setFilterPlan(e.target.value as any);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Plans</option>
                  <option value="trial">Trial</option>
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>

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
              paginated.map((owner) => (
                <tr
                  key={owner._id}
                  className="group hover:bg-blue-50 transition-all"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(owner._id)}
                      onChange={() => toggleSelectOne(owner._id)}
                    />
                  </td>
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-700">
                        {col.key === "email" ? (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            {owner.email}
                          </div>
                        ) : col.key === "phone" ? (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {owner.phone}
                          </div>
                        ) : col.key === "company_name" ? (
                          <div className="flex items-center gap-2">
                            <Building size={14} className="text-gray-400" />
                            {owner.company_name}
                          </div>
                        ) : col.key === "plan_type" ? (
                          getPlanBadge(owner.plan_type)
                        ) : col.key === "address" ? (
                          <div className="flex items-center gap-2 max-w-xs truncate">
                            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{owner.address}</span>
                          </div>
                        ) : col.key === "createdAt" || col.key === "updatedAt" ? (
                          new Date(owner[col.key as keyof Owner] as string).toLocaleDateString()
                        ) : (
                          (owner as any)[col.key] || "-"
                        )}
                      </td>
                    ))}
                  <td className="px-6 py-4">
                    {getStatusBadge(owner.isActive)}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-3">
                    {/* Edit */}
                    <Link
                      to={`/owners/edit/${owner._id}`}
                      className="p-2 rounded-full bg-yellow-200 text-gray-500 hover:bg-yellow-500 shadow-md transition"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </Link>

                    {/* View Details */}
                    <button
                      onClick={() => setSelectedOwner(owner)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-md transition"
                      title="View Details"
                    >
                      <BsThreeDotsVertical className="h-5 w-5" />
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => owner.isActive ? setConfirmDeleteId(owner._id) : handleActivate(owner._id)}
                      className={`p-2 rounded-full transition ${
                        owner.isActive
                          ? "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                          : "bg-green-100 text-green-600 hover:bg-green-500 hover:text-white"
                      }`}
                      title={owner.isActive ? "Deactivate" : "Activate"}
                    >
                      {owner.isActive ? <Trash2 size={18} /> : "A"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 3} className="text-center py-10 text-gray-500 text-base font-medium">
                  No owners found
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
      {selectedOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[600px] relative animate-fadeIn">
            <button
              onClick={() => setSelectedOwner(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedOwner.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p>
                <strong>Company:</strong> {selectedOwner.company_name}
              </p>
              <p>
                <strong>Plan:</strong> {getPlanBadge(selectedOwner.plan_type)}
              </p>
              <p>
                <strong>Email:</strong> {selectedOwner.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOwner.phone}
              </p>
              <p>
                <strong>Status:</strong> {getStatusBadge(selectedOwner.isActive)}
              </p>
              <p>
                <strong>Role:</strong> <span className="capitalize">{selectedOwner.role}</span>
              </p>
              <p className="sm:col-span-2">
                <strong>Address:</strong> {selectedOwner.address}
              </p>
              <p>
                <strong>City:</strong> {selectedOwner.city}
              </p>
              <p>
                <strong>State:</strong> {selectedOwner.state}
              </p>
              <p>
                <strong>Pincode:</strong> {selectedOwner.pincode}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedOwner.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {new Date(selectedOwner.updatedAt).toLocaleString()}
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
              Deactivate Owner
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to deactivate this owner? They will lose access to the system.
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
              Deactivate {selectedIds.length} Owners?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to deactivate all selected owners? They will lose access to the system.
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

export default Owners;