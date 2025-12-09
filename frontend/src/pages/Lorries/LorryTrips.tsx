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
  ArrowLeft,
  Plus,
  Users,
  Building,
  Filter,
  X,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Copy,
  CheckSquare,
  Square,
  CalendarDays,
  RefreshCw,
  ChevronDown
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
  cloned_from?: string;
  clone_count?: number;
  isActive?: boolean; // Add this field
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
  status: string;
}

interface CloneTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (data: {
    times: number;
    resetStatus: boolean;
    resetDate: boolean;
    newTripDate?: string;
  }) => Promise<void>;
  selectedTrips: Array<{ id: string; tripNumber: string }>;
}

const CloneTripModal: React.FC<CloneTripModalProps> = ({
  isOpen,
  onClose,
  onClone,
  selectedTrips = []
}) => {
  const [cloneCount, setCloneCount] = useState<string>("1");
  const [resetStatus, setResetStatus] = useState(true);
  const [resetDate, setResetDate] = useState(false);
  const [newTripDate, setNewTripDate] = useState<string>("");
  const [isCloning, setIsCloning] = useState(false);

  // Set default date to today when resetDate is true
  useEffect(() => {
    if (resetDate && !newTripDate) {
      const today = new Date().toISOString().split('T')[0];
      setNewTripDate(today);
    }
  }, [resetDate, newTripDate]);

  if (!isOpen) return null;

  const handleClone = async () => {
    const count = parseInt(cloneCount);

    if (isNaN(count) || count < 1 || count > 100) {
      toast.error('Please enter a valid number between 1 and 100');
      return;
    }

    if (resetDate && !newTripDate) {
      toast.error('Please select a date when reset date is enabled');
      return;
    }

    const cloneData = {
      times: count,
      resetStatus,
      resetDate,
      newTripDate: resetDate ? newTripDate : undefined
    };

    setIsCloning(true);
    try {
      await onClone(cloneData);
      onClose();
      setCloneCount("1");
      setResetStatus(true);
      setResetDate(false);
      setNewTripDate("");
    } catch (error) {
      console.error('Clone failed:', error);
    } finally {
      setIsCloning(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTripDate(e.target.value);
  };

  const handleCloneCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string (so user can erase completely)
    if (value === "") {
      setCloneCount("");
      return;
    }

    // Only allow numbers
    if (/^\d*$/.test(value)) {
      const num = parseInt(value);
      // If it's a valid number between 1-100, or empty string
      if (!isNaN(num) && num >= 1 && num <= 100) {
        setCloneCount(value);
      } else if (value === "") {
        setCloneCount("");
      }
    }
  };

  const handleIncrement = () => {
    const current = parseInt(cloneCount) || 1;
    if (current < 100) {
      setCloneCount((current + 1).toString());
    }
  };

  const handleDecrement = () => {
    const current = parseInt(cloneCount) || 1;
    if (current > 1) {
      setCloneCount((current - 1).toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Copy className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Clone {selectedTrips.length} Selected Trip{selectedTrips.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create multiple copies of selected trips with new trip numbers.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="space-y-4">
              {/* Number of Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of copies for each selected trip
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={parseInt(cloneCount) <= 1}
                        className="px-3 py-3 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">−</span>
                      </button>

                      <input
                        type="text"
                        value={cloneCount}
                        onChange={handleCloneCountChange}
                        onBlur={() => {
                          // If empty or invalid, set to 1
                          if (!cloneCount || isNaN(parseInt(cloneCount)) || parseInt(cloneCount) < 1) {
                            setCloneCount("1");
                          }
                        }}
                        className="flex-1 w-full px-2 py-3 text-center border-0 focus:ring-0 focus:outline-none"
                        placeholder="Enter number"
                      />

                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={parseInt(cloneCount) >= 100}
                        className="px-3 py-3 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum 100 copies at a time. Each copy will have a new trip number.
                </p>
              </div>

              {/* Reset Status Toggle */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reset Status</p>
                    <p className="text-xs text-gray-500">Set all cloned trips to "Scheduled" status</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetStatus(!resetStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${resetStatus ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${resetStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Reset Date Toggle */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reset Trip Date</p>
                    <p className="text-xs text-gray-500">Set new trip date for all cloned trips</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetDate(!resetDate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${resetDate ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${resetDate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Date Picker (shown when resetDate is true) */}
              {resetDate && (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Trip Date
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={newTripDate}
                      onChange={handleDateChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This date will be applied to all cloned trips.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isCloning}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={isCloning || !cloneCount}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCloning ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cloning...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Clone {cloneCount || "1"} {parseInt(cloneCount) === 1 ? 'Time' : 'Times'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<{
    id: string;
    tripNumber: string;
    driverName?: string;
    material?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState<Array<{ id: string; tripNumber: string }>>([]);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  let refersh = false;

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
      // Filter by lorry AND only active trips
      const lorryTrips = allTrips.filter((trip: Trip) =>
        trip.lorry_id?._id === lorryId &&
        (trip.isActive === undefined || trip.isActive === true) // Only show active trips
      );
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
  }, [lorryId, refersh]);

  const handleDeleteClick = (tripId: string, tripNumber: string, driverName?: string, material?: string) => {
    setSelectedTrip({ id: tripId, tripNumber, driverName, material });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrip) return;

    setIsDeleting(true);
    try {
      // Use bulk soft delete endpoint for single trip
      const response = await api.post('/trips/bulk-soft-delete', {
        tripIds: [selectedTrip.id]
      });

      toast.success("Deleted successfully");
      setDeleteModalOpen(false);
      setSelectedTrip(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete trip");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedTrips.length === 0) {
      toast.error("Please select trips to delete");
      return;
    }
    setBulkDeleteModalOpen(true);
    setShowBulkActions(false);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedTrips.length === 0) return;

    setIsDeleting(true);
    try {
      // Use bulk soft delete endpoint for multiple trips
      const tripIds = selectedTrips.map(trip => trip.id);
      const response = await api.post('/trips/bulk-soft-delete', {
        tripIds
      });

      toast.success(`Deleted successfully`);
      setSelectedTrips([]);
      setBulkDeleteModalOpen(false);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete trips");
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

  // Clone function using the new endpoint
  const cloneTrips = async (data: {
    times: number;
    resetStatus: boolean;
    resetDate: boolean;
    newTripDate?: string;
  }) => {
    try {
      const tripIds = selectedTrips.map(t => t.id);

      const requestBody: any = {
        tripIds,
        times: data.times,
        resetStatus: data.resetStatus,
        resetDate: data.resetDate
      };

      if (data.resetDate && data.newTripDate) {
        requestBody.newTripDate = data.newTripDate;
      }

      const res = await api.post('/trips/clone', requestBody);

      toast.success(`Cloned successfully`);
      // Reset selection state
      setSelectedTrips([]);
      setShowBulkActions(false);

      // Refresh trips
      fetchTrips();

      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clone trips');
      throw error;
    }
  };

  // Selection handlers
  const handleTripSelect = (tripId: string, tripNumber: string) => {
    if (selectedTrips.some(t => t.id === tripId)) {
      setSelectedTrips(selectedTrips.filter(t => t.id !== tripId));
    } else {
      setSelectedTrips([...selectedTrips, { id: tripId, tripNumber }]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTrips.length === filteredTrips.length) {
      setSelectedTrips([]);
      setShowBulkActions(false);
    } else {
      setSelectedTrips(filteredTrips.map(trip => ({ id: trip._id, tripNumber: trip.trip_number })));
      setShowBulkActions(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedTrips([]);
    setShowBulkActions(false);
  };

  const handleBulkClone = () => {
    if (selectedTrips.length === 0) {
      toast.error('Please select at least one trip to clone');
      return;
    }
    setCloneModalOpen(true);
  };

  const cloneSingleTrip = async (tripId: string) => {
  try {
    const response = await api.post('/trips/clone', {
      tripIds: [tripId],
      times: 1,
      resetStatus: true,
      resetDate: false
    });

    console.log('Clone API Response:', response.data);

    // Check if response has the expected structure
    if (!response.data || !response.data.data || !response.data.data.details) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response from server');
    }

    // Find the detail entry for our specific trip
    const tripDetail = response.data.data.details.find(
      (detail: any) => detail.tripId === tripId || detail.original_trip_number
    );

    if (!tripDetail) {
      console.error('No detail found for trip:', tripId);
      throw new Error('No clone information returned');
    }

    if (!tripDetail.success) {
      console.error('Clone failed in API:', tripDetail);
      throw new Error('Clone operation failed on server');
    }

    if (!tripDetail.cloned_trips || !Array.isArray(tripDetail.cloned_trips) || tripDetail.cloned_trips.length === 0) {
      console.error('No cloned trips in response:', tripDetail);
      throw new Error('No cloned trip data returned');
    }

    // Get the first cloned trip (since we cloned only once)
    const clonedTrip = tripDetail.cloned_trips[0];
    
    if (!clonedTrip._id) {
      console.error('Cloned trip missing _id:', clonedTrip);
      throw new Error('Cloned trip missing ID');
    }

    toast.success(`Trip cloned successfully! New trip: ${clonedTrip.trip_number}`);
    return clonedTrip._id;
    
  } catch (error: any) {
    console.error('Clone API Error:', error);
    
    // Show user-friendly error message
    const errorMessage = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'Failed to clone trip';
    
    toast.error(errorMessage);
    throw error;
  }
};

const handleCloneAndEdit = async (tripId: string) => {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Cloning trip...');
    
    // Close the action menu immediately for better UX
    setShowActionMenu(null);
    
    // Clone the trip
    const clonedTripId = await cloneSingleTrip(tripId);
    
    // Dismiss loading toast
    toast.dismiss(loadingToast);
    
    // Show success and redirect
    toast.success('Redirecting to edit page...', { duration: 2000 });
    
    // Navigate to edit page after a short delay
    setTimeout(() => {
      navigate(`/trips/edit/${clonedTripId}`);
    }, 500);
    
  } catch (error) {
    console.error('Clone and edit failed:', error);
    // Error is already handled in cloneSingleTrip, so we don't need to show another toast here
  }
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
    const handleClickOutside = () => {
      setShowActionMenu(null);
      if (showBulkActions) {
        setShowBulkActions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showBulkActions]);

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
            <div className="flex items-center gap-2">
              {/* Bulk Actions Dropdown */}
              {selectedTrips.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBulkActions(!showBulkActions);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <span>{selectedTrips.length} Selected</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {showBulkActions && (
                      <>
                        {/* Backdrop for mobile */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
                          onClick={() => setShowBulkActions(false)}
                        />

                        {/* Dropdown Menu */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-2 z-50 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setShowBulkActions(false);
                              handleBulkClone();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Clone Selected</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowBulkActions(false);
                              handleBulkDeleteClick();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Selected</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowBulkActions(false);
                              handleClearSelection();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 border-t border-gray-200"
                          >
                            <X className="h-4 w-4" />
                            <span>Clear Selection</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Add Trip Button */}
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
      </div>

      {/* Filters */}
      <div className="px-4 py-3 sm:px-6 bg-white border-b">
        <div className="flex items-center justify-between gap-2">
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

          {/* Select All Button */}
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {selectedTrips.length === filteredTrips.length ? (
              <>
                <CheckSquare className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                Select All
              </>
            )}
          </button>
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
              const isSelected = selectedTrips.some(t => t.id === trip._id);

              return (
                <motion.div
                  key={trip._id}
                  layout
                  className={`bg-white rounded-xl border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} shadow-sm overflow-visible relative`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Checkbox for selection */}
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTripSelect(trip._id, trip.trip_number)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-gray-900">{trip.trip_number}</h3>
                            {trip.cloned_from && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                <Copy className="h-3 w-3" />
                                Clone
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
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
                      </div>

                      {/* Action Menu for individual trip */}
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
                                    onClick={() => {
                                      setShowActionMenu(null);
                                      // Select single trip and open clone modal
                                      setSelectedTrips([{ id: trip._id, tripNumber: trip.trip_number }]);
                                      setCloneModalOpen(true);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
                                  >
                                    <Copy className="h-4 w-4 flex-shrink-0" />
                                    <span>Clone This Trip</span>
                                  </button>

                                  {/* New Clone and Edit Option */}
                                  <button
                                    onClick={() => handleCloneAndEdit(trip._id)}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50"
                                  >
                                    <div className="relative flex items-center justify-center w-4 h-4">
                                      <Copy className="absolute h-3 w-3" />
                                      <Edit className="absolute h-2 w-2 -bottom-1 -right-1" />
                                    </div>
                                    <span>Clone and Edit</span>
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
                          <p className="text-xs text-gray-500 mb-1">Units: {trip.no_of_unit_customer}</p>
                          <p className="text-xs text-gray-500 mb-1">Amount: {trip.customer_amount}</p>
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

      {/* Single Trip Delete Confirmation Modal */}
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

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          setBulkDeleteModalOpen(false);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Trips"
        message={`Are you sure you want to delete ${selectedTrips.length} selected trip${selectedTrips.length > 1 ? 's' : ''}? This action cannot be undone.`}
        isLoading={isDeleting}
        itemName={`${selectedTrips.length} trip${selectedTrips.length > 1 ? 's' : ''}`}
      />

      {/* Enhanced Clone Trip Modal */}
      <CloneTripModal
        isOpen={cloneModalOpen}
        onClose={() => {
          setCloneModalOpen(false);
        }}
        onClone={cloneTrips}
        selectedTrips={selectedTrips}
      />
    </div>
  );
};

export default LorryTrips;