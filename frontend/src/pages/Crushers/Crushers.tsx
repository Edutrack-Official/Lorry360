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
    setRowsPerPage(12);
    setCurrentPage(1);
    setSelectedIds([]);
    setSelectAll(false);
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-10">Loading crushers...</div>;
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Crushers</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your crushers and materials
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete ({selectedIds.length})
              </button>
            )}

            {/* Filters Toggle */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-2 text-sm font-medium border"
              onClick={() => setShowFilters(!showFilters)}
            >
              <motion.span
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
              Filters
            </button>

            {/* Add Crusher */}
            <Link
              to="/crushers/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
            >
              <FaPlus size={16} />
              <span className="hidden sm:inline">Add Crusher</span>
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
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search crushers by name or materials..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input input-bordered pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Rows per page */}
                <div>
                  <select
                    className="input input-bordered w-full"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                    <option value={36}>36 per page</option>
                    <option value={48}>48 per page</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div>
                  <button
                    className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm font-medium"
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginated.length > 0 ? (
          paginated.map((crusher) => (
            <motion.div
              key={crusher._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(crusher._id)}
                      onChange={() => toggleSelectOne(crusher._id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="p-2 bg-white rounded-lg shadow-sm border">
                      <Package size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Edit */}
                    <Link
                      to={`/crushers/edit/${crusher._id}`}
                      className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition shadow-sm"
                      title="Edit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiEdit size={16} />
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(crusher._id);
                      }}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
                      title="Delete Crusher"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-3 line-clamp-1">
                  {crusher.name}
                </h3>
                {/* <p className="text-sm text-gray-600 mt-1">
                  Owner: {crusher.owner_id?.name || "Unknown"}
                </p> */}  
              </div>

              {/* Card Body - Materials */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Materials & Prices</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {crusher.materials.length} materials
                  </span>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {crusher.materials.length > 0 ? (
                    crusher.materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {material.material_name}
                        </span>
                        <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                          <DollarSign size={12} />
                          {material.price_per_unit}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No materials added
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div>
                    Created: {new Date(crusher.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setSelectedCrusher(crusher)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="max-w-md mx-auto">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No crushers found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchText ? "Try adjusting your search terms" : "Get started by creating your first crusher"}
              </p>
              {!searchText && (
                <Link
                  to="/crushers/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  <FaPlus size={16} />
                  Add First Crusher
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 
                        bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} crushers
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${currentPage === 1
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                }`}
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition min-w-[40px]
                    ${currentPage === page
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${currentPage === totalPages
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Popup Modal for Details */}
      {selectedCrusher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[600px] relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCrusher(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCrusher.name}
                </h2>
                {/* <p className="text-gray-600">
                  Owner: {selectedCrusher.owner_id?.name || "Unknown"}
                </p> */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Created</h3>
                  <p className="text-gray-700">
                    {new Date(selectedCrusher.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Last Updated</h3>
                  <p className="text-gray-700">
                    {new Date(selectedCrusher.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div> */}

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Materials Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Materials</span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                      {selectedCrusher.materials.length}
                    </span>
                  </div>
                  {selectedCrusher.materials.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Average Price</span>
                      <span className="text-green-600 font-semibold">
                        ${(selectedCrusher.materials.reduce((sum, mat) => sum + mat.price_per_unit, 0) / selectedCrusher.materials.length).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Materials & Prices</h3>
              {selectedCrusher.materials.length > 0 ? (
                <div className="space-y-3">
                  {selectedCrusher.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign size={16} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {material.material_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Price per unit
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${material.price_per_unit}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                  <Package size={32} className="mx-auto mb-2" />
                  No materials added to this crusher
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete One */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Crusher?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All associated materials will be removed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bulk Delete */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {selectedIds.length} Crushers?
            </h3>
            <p className="text-gray-600 mb-6">
              This will permanently remove all selected crushers and their materials.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleBulkDelete();
                  setConfirmBulkDelete(false);
                }}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
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