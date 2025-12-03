import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import {
  Truck,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  User,
  Package,
  MapPin,
  DollarSign,
  ArrowLeft,
  Plus,
  Users,
  Building,
  Filter,
  X,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";


interface Trip {
  _id: string;
  trip_number: string;
  owner_id: string;
  lorry_id: { _id: string; registration_number: string; nick_name?: string };
  driver_id: { _id: string; name: string; phone: string };
  crusher_id: { _id: string; name: string; materials?: string[] };
  customer_id?: { _id: string; name: string; phone: string; address?: string; site_addresses?: any[] };
  collab_owner_id?: { _id: string; name: string; company_name?: string; phone: string; email?: string };
  material_name: string;
  rate_per_unit: number;
  no_of_unit_crusher: number;
  no_of_unit_customer: number;
  crusher_amount: number;
  customer_amount: number;
  profit: number;
  location: string;
  trip_date: string;
  status: 'scheduled' | 'dispatched' | 'loaded' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  dc_number?: string;
  notes?: string;
  dispatched_at?: string;
  loaded_at?: string;
  delivered_at?: string;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
  status: string;
}

const LorryTrips = () => {
  const { lorryId } = useParams<{ lorryId: string }>();
  const navigate = useNavigate();

  const [lorry, setLorry] = useState<Lorry | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<{
    id: string;
    tripNumber: string;
    driverName?: string;
    material?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLorry = async () => {
    try {
      const res = await api.get(`/lorries/${lorryId}`);
      setLorry(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch lorry details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/trips`);
      const allTrips = res.data.data?.trips || [];
      const lorryTrips = allTrips.filter((trip: Trip) => trip.lorry_id?._id === lorryId);
      setTrips(lorryTrips);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch trips");
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    if (lorryId) {
      fetchLorry();
      fetchTrips();
    }
  }, [lorryId]);

  const handleDeleteClick = (tripId: string, tripNumber: string, driverName?: string, material?: string) => {
    setSelectedTrip({ id: tripId, tripNumber, driverName, material });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrip) return;

    setIsDeleting(true);
    try {
      await api.delete(`/trips/delete/${selectedTrip.id}`);
      toast.success("Trip deleted successfully");
      setDeleteModalOpen(false);
      setSelectedTrip(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete trip");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    try {
      await api.patch(`/trips/status/${tripId}`, { status: newStatus });
      toast.success(`Trip status updated`);
      setShowActionMenu(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.trip_number.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.driver_id.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (trip.customer_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.collab_owner_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.collab_owner_id?.company_name?.toLowerCase().includes(searchText.toLowerCase())) ||
      trip.location.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.material_name.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus === "all" || trip.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const config = {
      scheduled: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock, label: "Scheduled" },
      dispatched: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Package, label: "Dispatched" },
      loaded: { color: "bg-orange-50 text-orange-700 border-orange-200", icon: Package, label: "Loaded" },
      in_transit: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Truck, label: "In Transit" },
      delivered: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle, label: "Delivered" },
      completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Completed" },
      cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: X, label: "Cancelled" }
    };
    return config[status as keyof typeof config] || config.scheduled;
  };

  const getDestinationInfo = (trip: Trip) => {
    if (trip.customer_id) {
      return {
        type: 'customer',
        name: trip.customer_id.name,
        icon: User,
        label: 'Customer'
      };
    } else if (trip.collab_owner_id) {
      return {
        type: 'collaborative',
        name: trip.collab_owner_id.company_name || trip.collab_owner_id.name,
        icon: Building,
        label: 'Collab Owner'
      };
    }
    return {
      type: 'unknown',
      name: 'Unknown',
      icon: Users,
      label: 'Unknown'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterStatus("all");
  };

  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(null);
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (!lorry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorry not found</h3>
          <button
            onClick={() => navigate("/lorries")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lorries
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    total: trips.length,
    totalProfit: trips.reduce((sum, trip) => sum + trip.profit, 0),
    completed: trips.filter(t => t.status === 'completed').length,
    active: trips.filter(t => ['scheduled', 'dispatched', 'loaded', 'in_transit'].includes(t.status)).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header - Sticky */}
      <div className="bg-white border-b z-20 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <Link
              to={`/trips/create?lorry=${lorryId}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Trip</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 sm:px-6 bg-white border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
              }`}
          >
            <Filter className="h-4 w-4" />
            Status
          </button>

          {(searchText || filterStatus !== "all") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'scheduled', 'dispatched', 'loaded', 'in_transit', 'delivered', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trips List */}
      <div className="p-4 sm:p-6">
        {tripsLoading ? (
          <div className="flex justify-center items-center min-h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="space-y-4">
            {filteredTrips.map((trip) => {
              const destination = getDestinationInfo(trip);
              const statusConfig = getStatusConfig(trip.status);
              const StatusIcon = statusConfig.icon;
              const DestIcon = destination.icon;

              return (
                <motion.div
                  key={trip._id}
                  layout
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible relative"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 mb-1">{trip.trip_number}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(trip.trip_date)}
                          </span>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="relative flex-shrink-0 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === trip._id ? null : trip._id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {showActionMenu === trip._id && (
                            <>
                              {/* Backdrop for mobile */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/20 sm:hidden"
                                onClick={() => setShowActionMenu(null)}
                              />
                              
                              {/* Dropdown Menu */}
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 z-50 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 max-h-[calc(100vh-200px)] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Status Update Section */}
                                <div className="px-3 py-2 border-b border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Status</p>
                                </div>

                                {['scheduled', 'dispatched', 'loaded', 'in_transit', 'delivered', 'completed', 'cancelled'].map((status) => {
                                  const config = getStatusConfig(status);
                                  const StatusIconItem = config.icon;
                                  const isCurrentStatus = trip.status === status;

                                  return (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusUpdate(trip._id, status)}
                                      disabled={isCurrentStatus}
                                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${isCurrentStatus
                                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                          : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                      <StatusIconItem className="h-4 w-4 flex-shrink-0" />
                                      <span className="flex-1 text-left">
                                        {config.label}
                                      </span>
                                      {isCurrentStatus && (
                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}

                                {/* Actions Section */}
                                <div className="border-t border-gray-200 mt-2 pt-2">
                                  <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</p>
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      setShowActionMenu(null);
                                      navigate(`/trips/edit/${trip._id}`);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit className="h-4 w-4 flex-shrink-0" />
                                    <span>Edit Trip</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteClick(trip._id, trip.trip_number, trip.driver_id.name, trip.material_name)}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                                    <span>Delete Trip</span>
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Driver</p>
                          <p className="font-medium text-gray-900 truncate">{trip.driver_id.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <DestIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">{destination.label}</p>
                          <p className="font-medium text-gray-900 truncate">{destination.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium text-gray-900 truncate">{trip.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Material</p>
                          <p className="font-medium text-gray-900 truncate">{trip.material_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Units & Rate</p>
                          <p className="font-medium text-gray-900">
                            {trip.no_of_unit_customer} × {formatCurrency(trip.rate_per_unit)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Profit</p>
                          <p className={`font-bold text-base ${trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(trip.profit)}
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
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTrip(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Trip"
        message={`Are you sure you want to delete this trip?`}
        isLoading={isDeleting}
        itemName={selectedTrip ?
          `Trip: ${selectedTrip.tripNumber} (Driver: ${selectedTrip.driverName || 'N/A'}, Material: ${selectedTrip.material || 'N/A'})`
          : ""
        }
      />
    </div>
  );
};

export default LorryTrips;