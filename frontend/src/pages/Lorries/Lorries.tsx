import React, { useEffect, useState } from "react";
import {
  Truck,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  X,
  CheckCircle2,
  Clock,
  PauseCircle,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";

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
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "maintenance" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchLorries = async () => {
    try {
      const res = await api.get("/lorries");
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
      setShowActionMenu(null);
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
      setShowActionMenu(null);
      fetchLorries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete lorry");
    }
  };

  const handleCardClick = (lorryId: string, lorry: Lorry) => {
    navigate(`/lorries/${lorryId}/trips`);
    localStorage.setItem('selectedLorry', JSON.stringify(lorry));
  };

  const filtered = lorries.filter((lorry) => {
    const matchesSearch =
      lorry.registration_number.toLowerCase().includes(searchText.toLowerCase()) ||
      lorry.nick_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      lorry.owner_id?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || lorry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      active: { 
        color: "bg-green-50 text-green-700 border-green-200", 
        icon: CheckCircle2,
        label: "Active",
        dotColor: "bg-green-500"
      },
      maintenance: { 
        color: "bg-amber-50 text-amber-700 border-amber-200", 
        icon: Clock,
        label: "Maintenance",
        dotColor: "bg-amber-500"
      },
      inactive: { 
        color: "bg-gray-50 text-gray-700 border-gray-200", 
        icon: PauseCircle,
        label: "Inactive",
        dotColor: "bg-gray-500"
      }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
  };

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
          <p className="text-sm text-gray-600">Loading lorries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lorries</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{filtered.length} {filtered.length === 1 ? 'lorry' : 'lorries'}</p>
              </div>
            </div>

            <Link
              to="/lorries/create"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm sm:text-base font-medium"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add Lorry</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>

          {/* Search Bar & Status Filters - Desktop Layout */}
          <div className="mb-3 flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search lorries..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Quick Status Filters - Hidden on Mobile, Shown on Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === "all" ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === "active" ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("maintenance")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === "maintenance" ? 'bg-amber-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                Maintenance
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === "inactive" ? 'bg-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Filter Button & Status Pills - Mobile Only */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">

            {/* Quick Status Filters */}
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === "all" ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === "active" ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("maintenance")}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === "maintenance" ? 'bg-amber-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === "inactive" ? 'bg-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Expanded Filters */}
          {/* <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Active Filters</p>
                    {(searchText || filterStatus !== "all") && (
                      <button
                        onClick={resetFilters}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Clear All
                      </button>
                    )}
                  </div>
                  {!searchText && filterStatus === "all" && (
                    <p className="text-sm text-gray-500 mt-2">No filters applied</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((lorry) => {
              const statusConfig = getStatusConfig(lorry.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={lorry._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
                  onClick={() => handleCardClick(lorry._id, lorry)}
                >
                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">
                          {lorry.registration_number}
                        </h3>
                        {lorry.nick_name && (
                          <p className="text-gray-600 text-sm truncate">{lorry.nick_name}</p>
                        )}
                      </div>
                      
                      {/* Action Menu */}
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === lorry._id ? null : lorry._id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {showActionMenu === lorry._id && (
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
                                  navigate(`/lorries/edit/${lorry._id}`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                                Edit Lorry
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(lorry._id, lorry.status);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Power className="h-4 w-4 text-gray-500" />
                                Change Status
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLorry(lorry._id, lorry.registration_number);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Lorry
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${statusConfig.color}">
                      <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor} animate-pulse`}></span>
                      <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {statusConfig.label}
                    </div>

                    {/* Owner Info */}
                    {/* {lorry.owner_id?.name && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Owner</p>
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {lorry.owner_id.name}
                        </p>
                      </div>
                    )} */}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Truck className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No lorries found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {searchText || filterStatus !== "all" 
                  ? "Try adjusting your search or filters to find what you're looking for"
                  : "Get started by adding your first lorry to the fleet"
                }
              </p>
              <Link
                to="/lorries/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
              >
                <Plus className="h-5 w-5" />
                Add First Lorry
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lorries;