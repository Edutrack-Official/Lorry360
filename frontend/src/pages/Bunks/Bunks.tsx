import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Pencil, 
  Trash2, 
  Eye, 
  X, 
  Search, 
  Plus, 
  MoreVertical,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

interface Bunk {
  _id: string;
  bunk_name: string;  // Changed from 'name'
  address: string;    // Changed from 'location'
  isActive: boolean;  // Added isActive
  owner_id: string;   // Changed from object to string
  createdAt: string;
  updatedAt: string;
}

const Bunks = () => {
  const [bunks, setBunks] = useState<Bunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBunk, setSelectedBunk] = useState<Bunk | null>(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBunkDelete, setSelectedBunkDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Action menu
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchBunks = async () => {
    try {
      const res = await api.get("/petrol-bunks");  // Changed endpoint
      // Backend returns { success: true, data: { petrolBunks: [...] } }
      setBunks(res.data.data?.petrolBunks || []);
    } catch (error: any) {
      console.error("Failed to fetch bunks", error);
      toast.error(error.response?.data?.error || "Failed to fetch bunks");
      setBunks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBunks();
  }, []);

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedBunkDelete({ id, name });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBunkDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/petrol-bunks/delete/${selectedBunkDelete.id}`);  // Changed endpoint
      toast.success("Bunk deleted successfully");
      setDeleteModalOpen(false);
      setSelectedBunkDelete(null);
      fetchBunks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete bunk");
    } finally {
      setIsDeleting(false);
    }
  };

  // Apply Search + Filters
  const filtered = bunks.filter((bunk) => {
    const matchesSearch =
      bunk.bunk_name.toLowerCase().includes(searchText.toLowerCase()) ||
      (bunk.address && bunk.address.toLowerCase().includes(searchText.toLowerCase()));
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
          <p className="text-sm text-gray-600">Loading bunks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fuel Bunks</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {filtered.length} {filtered.length === 1 ? 'bunk' : 'bunks'} found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Add Bunk */}
              <Link
                to="/bunks/create"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm sm:text-base font-medium"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Add Bunk</span>
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
                placeholder="Search bunks by name or address..."
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
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((bunk) => (
                <motion.div
                  key={bunk._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98 flex flex-col h-full"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, a, input')) return;
                    navigate(`/bunks/${bunk._id}`);
                  }}
                >
                  <div className="p-4 sm:p-5 flex-1">
                    {/* Header with Action Menu */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">
                          {bunk.bunk_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            bunk.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {bunk.isActive ? "Active" : "Inactive"}
                          </span>
                          {bunk.address && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {bunk.address}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Menu */}
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === bunk._id ? null : bunk._id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {showActionMenu === bunk._id && (
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
                                  navigate(`/bunks/edit/${bunk._id}`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                                Edit Bunk
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/bunks/${bunk._id}/details`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                                View Details
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(bunk._id, bunk.bunk_name);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Bunk
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(bunk.createdAt).toLocaleDateString()}
                      </div>
                      {bunk.address && (
                        <div className="text-sm text-gray-600 flex items-start gap-1">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{bunk.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer - Positioned at bottom */}
                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-600 px-4 pb-4 sm:px-5 sm:pb-5">
                      <div>
                        ID: {bunk._id.substring(0, 8)}...
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBunk(bunk);
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-0">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} bunks
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
                <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No bunks found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchText ? 'Try adjusting your search' : 'Get started by adding your first fuel bunk'}
              </p>
              <Link
                to="/bunks/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add First Bunk
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Popup Modal for Details */}
      {selectedBunk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[600px] relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBunk(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedBunk.bunk_name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBunk.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedBunk.isActive ? "✅ Active" : "⏸️ Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Bunk Name</p>
                    <p className="font-medium text-gray-900">{selectedBunk.bunk_name}</p>
                  </div>
                  {selectedBunk.address && (
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{selectedBunk.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Status Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Current Status</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      selectedBunk.isActive 
                        ? "bg-green-600 text-white" 
                        : "bg-red-600 text-white"
                    }`}>
                      {selectedBunk.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Timestamps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h4 className="text-sm text-gray-600 mb-1">Created At</h4>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedBunk.createdAt).toLocaleDateString()} at{" "}
                    {new Date(selectedBunk.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h4 className="text-sm text-gray-600 mb-1">Last Updated</h4>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedBunk.updatedAt).toLocaleDateString()} at{" "}
                    {new Date(selectedBunk.updatedAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Bunk ID */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-2">Bunk ID</h4>
                <p className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded border">
                  {selectedBunk._id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBunkDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Bunk"
        message={`Are you sure you want to delete this bunk?`}
        isLoading={isDeleting}
        itemName={selectedBunkDelete ? 
          `Bunk: ${selectedBunkDelete.name}`
          : ""
        }
      />
    </div>
  );
};

export default Bunks;