import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Phone,
  IndianRupee,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  X,
  CheckCircle2,
  Clock,
  PauseCircle,
  ChevronDown,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

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
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  // Add these state variables
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{
    id: string;
    name: string;
    phone?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const newStatus = isActive ? "inactive" : "active";
      await api.patch(`/drivers/status/${id}`, { status: newStatus });
      toast.success(`Driver ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      setShowActionMenu(null);
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // Function to open delete modal
  const handleDeleteClick = (id: string, name: string, phone?: string) => {
    setSelectedDriver({ id, name, phone });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  // Function to handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!selectedDriver) return;

    setIsDeleting(true);
    try {
      await api.delete(`/drivers/delete/${selectedDriver.id}`);
      toast.success("Driver deleted successfully");
      setDeleteModalOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete driver");
    } finally {
      setIsDeleting(false);
    }
  };

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

  const getStatusConfig = (status: string, isActive: boolean) => {
    if (!isActive || status === "inactive") {
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: PauseCircle,
        label: "Inactive",
        dotColor: "bg-red-500"
      };
    }

    return {
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Active",
      dotColor: "bg-green-500"
    };
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
      return "bg-purple-50 text-purple-700 border-purple-200";
    } else if (driver.salary_per_duty > 0) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    } else if (driver.salary_per_trip > 0) {
      return "bg-green-50 text-green-700 border-green-200";
    }
    return "bg-gray-50 text-gray-700 border-gray-200";
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
          <p className="text-sm text-gray-600">Loading drivers...</p>
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
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Drivers</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{filtered.length} {filtered.length === 1 ? 'driver' : 'drivers'}</p>
              </div>
            </div>

            <Link
              to="/drivers/create"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm sm:text-base font-medium"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Add Driver</span>
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
                placeholder="Search drivers by name, phone, or address..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Quick Status Filters - Hidden on Mobile, Shown on Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === "all" ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === "active" ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === "inactive" ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
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
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === "all" ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === "active" ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === "inactive" ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((driver) => {
              const statusConfig = getStatusConfig(driver.status, driver.isActive);
              const StatusIcon = statusConfig.icon;
              const salaryType = getSalaryType(driver);
              const salaryTypeColor = getSalaryTypeColor(driver);
              const isActiveDriver = driver.isActive && driver.status === "active";

              return (
                <motion.div
                  key={driver._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
                  onClick={() => navigate(`/drivers/${driver._id}`)}
                >
                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">
                          {driver.name}
                        </h3>
                      </div>

                      {/* Action Menu */}
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === driver._id ? null : driver._id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {showActionMenu === driver._id && (
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
                                  navigate(`/drivers/edit/${driver._id}`);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                                Edit Driver
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(driver._id, isActiveDriver);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Power className="h-4 w-4 text-gray-500" />
                                {isActiveDriver ? "Deactivate" : "Activate"}
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(driver._id, driver.name, driver.phone);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Driver
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${statusConfig.color}`}>
                        {/* <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor} animate-pulse`}></span> */}
                        <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {statusConfig.label}
                      </div>

                      {/* Salary Type Badge */}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${salaryTypeColor}`}>
                        {salaryType}
                      </span>
                    </div>

                    {/* Salary Information */}
                    {(driver.salary_per_duty > 0 || driver.salary_per_trip > 0) && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {driver.salary_per_duty > 0 && (
                          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm font-semibold text-blue-900">
                              {formatSalary(driver.salary_per_duty)}
                            </p>
                            <p className="text-xs text-blue-600">per duty</p>
                          </div>
                        )}
                        {driver.salary_per_trip > 0 && (
                          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-sm font-semibold text-green-900">
                              {formatSalary(driver.salary_per_trip)}
                            </p>
                            <p className="text-xs text-green-600">per trip</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Driver Details */}
                    <div className="space-y-3">
                      {/* Phone */}
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-white rounded-md shadow-sm">
                          <Phone className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{driver.phone}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-white rounded-md shadow-sm mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 line-clamp-2">{driver.address}</p>
                        </div>
                      </div>

                      {/* Join Date */}
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
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
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No drivers found
              </h3>
            </div>
          </div>
        )}
      </div>
        {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedDriver(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Driver"
        message={`Are you sure you want to delete this driver?`}
        isLoading={isDeleting}
        itemName={selectedDriver ? 
          `Driver: ${selectedDriver.name}${selectedDriver.phone ? ` (${selectedDriver.phone})` : ''}`
          : ""
        }
      />
    </div>
  );
};

export default Drivers;