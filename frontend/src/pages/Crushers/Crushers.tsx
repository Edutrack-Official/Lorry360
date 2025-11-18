import React, { useEffect, useState } from "react";
import { Package, Pencil, Trash2, Eye, X, Search, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { BsThreeDotsVertical } from "react-icons/bs";
import api from "../../api/client";

interface Material {
  material_name: string;
  price_per_unit: number;
  _id?: string;
}

interface Crusher {
  _id: string;
  name: string;
  materials: Material[];
  owner_id: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Crushers = () => {
  const [crushers, setCrushers] = useState<Crusher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrusher, setSelectedCrusher] = useState<Crusher | null>(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Column selector dropdown
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Columns toggle (defaults)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name", "materials", "createdAt"
  ]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const navigate = useNavigate();

  const fetchCrushers = async () => {
    try {
      const res = await api.get("/crushers");
      setCrushers(res.data.data?.crushers || []);
    } catch (error: any) {
      console.error("Failed to fetch crushers", error);
      toast.error(error.response?.data?.error || "Failed to fetch crushers");
      setCrushers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrushers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/crushers/delete/${id}`);
      toast.success("Crusher deleted successfully");
      fetchCrushers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete crusher");
    }
  };

  // Apply Search + Filters
  const filtered = crushers.filter((crusher) => {
    const matchesSearch =
      crusher.name.toLowerCase().includes(searchText.toLowerCase()) ||
      crusher.materials.some(material => 
        material.material_name.toLowerCase().includes(searchText.toLowerCase())
      );

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allColumns = [
    { key: "name", label: "Crusher Name" },
    { key: "materials", label: "Materials & Prices" },
    { key: "owner_id", label: "Owner" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];

  // Handle Select All
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((c) => c._id));
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

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => api.delete(`/crushers/delete/${id}`))
      );
      toast.success("Selected crushers deleted successfully");
      setSelectedIds([]);
      setSelectAll(false);
      fetchCrushers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to bulk delete");
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setRowsPerPage(25);
    setCurrentPage(1);
    setVisibleColumns(["name", "materials", "createdAt"]);
    setSelectedIds([]);
    setSelectAll(false);
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading crushers...</div>;
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-3 sm:p-4 rounded-t-xl border shadow-md flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Crushers</h1>
            <Package size={32} className="text-gray-800" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-2 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm flex-shrink-0"
              >
                Delete Selected ({selectedIds.length})
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

            {/* Add Crusher */}
            <Link
              to="/crushers/create"
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
                    placeholder="Search crushers by name or materials..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

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
              paginated.map((crusher) => (
                <tr
                  key={crusher._id}
                  className="group hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(crusher._id)}
                      onChange={() => toggleSelectOne(crusher._id)}
                    />
                  </td>
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-700">
                        {col.key === "materials" ? (
                          <div className="space-y-1">
                            {crusher.materials.length > 0 ? (
                              crusher.materials.map((material, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded"
                                >
                                  <span className="font-medium">{material.material_name}</span>
                                  <span className="text-green-600 flex items-center gap-1">
                                    <DollarSign size={10} />
                                    {material.price_per_unit}/unit
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">No materials</span>
                            )}
                          </div>
                        ) : col.key === "owner_id" ? (
                          crusher.owner_id?.name || "-"
                        ) : col.key === "createdAt" ? (
                          new Date(crusher.createdAt).toLocaleDateString()
                        ) : col.key === "updatedAt" ? (
                          new Date(crusher.updatedAt).toLocaleDateString()
                        ) : (
                          (crusher as any)[col.key] || "-"
                        )}
                      </td>
                    ))}
                  <td
                    className="px-6 py-4 flex items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Edit */}
                    <Link
                      to={`/crushers/edit/${crusher._id}`}
                      className="p-2 rounded-full bg-yellow-200 text-gray-500 hover:bg-yellow-500 shadow-md transition"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </Link>

                    {/* View Details */}
                    <button
                      onClick={() => setSelectedCrusher(crusher)}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-md transition"
                      title="View Details"
                    >
                      <BsThreeDotsVertical className="h-5 w-5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDeleteId(crusher._id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition"
                      title="Delete Crusher"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="text-center py-10 text-gray-500 text-base font-medium">
                  No crushers found
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
      {selectedCrusher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[600px] relative animate-fadeIn">
            <button
              onClick={() => setSelectedCrusher(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedCrusher.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p>
                <strong>Owner:</strong> {selectedCrusher.owner_id?.name || "-"}
              </p>
              <p>
                <strong>Total Materials:</strong> {selectedCrusher.materials.length}
              </p>
              <div className="sm:col-span-2">
                <strong className="block mb-2">Materials & Prices:</strong>
                {selectedCrusher.materials.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCrusher.materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-blue-600" />
                          <span className="font-medium">{material.material_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign size={16} />
                          {material.price_per_unit} / unit
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No materials added</p>
                )}
              </div>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedCrusher.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {new Date(selectedCrusher.updatedAt).toLocaleString()}
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
              Are you sure you want to delete this crusher?
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
                  handleDelete(confirmDeleteId);
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
              Are you sure you want to delete {selectedIds.length} crushers?
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
    </div>
  );
};

export default Crushers;