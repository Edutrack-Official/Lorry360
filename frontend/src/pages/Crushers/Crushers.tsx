import React, { useEffect, useState } from "react";
import { 
  Package, 
  Pencil, 
  Trash2, 
  Eye, 
  X, 
  Search, 
  Plus, 
  MoreVertical,
  IndianRupee,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

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

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCrusherDelete, setSelectedCrusherDelete] = useState<{
    id: string;
    name: string;
    materialsCount: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Action menu
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

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

  const handleDeleteClick = (id: string, name: string, materialsCount: number) => {
    setSelectedCrusherDelete({ id, name, materialsCount });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCrusherDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/crushers/delete/${selectedCrusherDelete.id}`);
      toast.success("Crusher deleted successfully");
      setDeleteModalOpen(false);
      setSelectedCrusherDelete(null);
      fetchCrushers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete crusher");
    } finally {
      setIsDeleting(false);
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

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Loading crushers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Updated to match Lorries style */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Crushers</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {filtered.length} {filtered.length === 1 ? 'crusher' : 'crushers'} found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Add Crusher */}
              <Link
                to="/crushers/create"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm sm:text-base font-medium"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Add Crusher</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="mb-3 flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search crushers by name or materials..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {paginated.length > 0 ? (
          <>
            {/* Cards Grid - Updated UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((crusher) => (
                <motion.div
                  key={crusher._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98 flex flex-col h-full" // Added flex and h-full
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, a, input')) return;
                    navigate(`/crushers/${crusher._id}/trips`);
                  }}
                >
                  <div className="p-4 sm:p-5 flex-1"> {/* Added flex-1 */}
                    {/* Header with Action Menu */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">
                          {crusher.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {crusher.materials.length} materials
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Menu - Updated to match Lorries */}
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === crusher._id ? null : crusher._id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {showActionMenu === crusher._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-10 z-30 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/crushers/edit/${crusher._id}`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                                Edit Crusher
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/crushers/${crusher._id}/trips`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                                View Trips
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(crusher._id, crusher.name, crusher.materials.length);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Crusher
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Card Body - Materials */}
                    <div className="mb-4">
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {crusher.materials.length > 0 ? (
                          crusher.materials.slice(0, 3).map((material, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {material.material_name}
                              </span>
                              <div className="flex items-center gap-1 text-green-600 font-semibold text-sm whitespace-nowrap">
                                <IndianRupee size={12} />
                                {material.price_per_unit}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                            No materials added
                          </div>
                        )}
                        {crusher.materials.length > 3 && (
                          <div className="text-center text-xs text-gray-500 pt-1">
                            +{crusher.materials.length - 3} more materials
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer - Positioned at bottom */}
                  <div className="pt-3 border-t border-gray-100 mt-auto"> {/* Added mt-auto */}
                    <div className="flex items-center justify-between text-xs text-gray-600 px-4 pb-4 sm:px-5 sm:pb-5">
                      <div>
                        Created: {new Date(crusher.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCrusher(crusher);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination - Updated UI */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-0">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} crushers
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition min-w-[40px] border ${
                          currentPage === page
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === totalPages
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No crushers found
              </h3>
            </div>
          </div>
        )}
      </div>

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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <IndianRupee size={16} className="text-green-600" />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCrusherDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Crusher"
        message={`Are you sure you want to delete this crusher?`}
        isLoading={isDeleting}
        itemName={selectedCrusherDelete ? 
          `Crusher: ${selectedCrusherDelete.name} (${selectedCrusherDelete.materialsCount} materials)`
          : ""
        }
      />
    </div>
  );
};

export default Crushers;