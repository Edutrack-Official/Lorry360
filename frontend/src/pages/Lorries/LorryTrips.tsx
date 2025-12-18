import React, { useEffect, useState, useMemo } from "react";
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
  X,
  Loader2,
  CheckCircle,
  Clock,
  Copy,
  CheckSquare,
  Square,
  ChevronDown,
  DollarSign,
  Filter as FilterIcon,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CloneTripModal from "../../components/CloneTripModal";
import PriceChangeModal from "../../components/PriceChangeModal";

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
  isActive?: boolean;
  collab_trip_status?: 'pending' | 'approved' | 'rejected';
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

  // Advanced Filter States
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [crusherFilter, setCrusherFilter] = useState<string>("");
  const [driverFilter, setDriverFilter] = useState<string>("");

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
  const [priceChangeModalOpen, setPriceChangeModalOpen] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Get unique values for filters
  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    trips.forEach(trip => {
      if (trip.customer_id?.name) customers.add(trip.customer_id.name);
      if (trip.collab_owner_id?.name) customers.add(trip.collab_owner_id.name);
      if (trip.collab_owner_id?.company_name) customers.add(trip.collab_owner_id.company_name);
    });
    return Array.from(customers).sort();
  }, [trips]);

  const uniqueCrushers = useMemo(() => {
    const crushers = new Set<string>();
    trips.forEach(trip => trip.crusher_id?.name && crushers.add(trip.crusher_id.name));
    return Array.from(crushers).sort();
  }, [trips]);

  const uniqueDrivers = useMemo(() => {
    const drivers = new Set<string>();
    trips.forEach(trip => trip.driver_id?.name && drivers.add(trip.driver_id.name));
    return Array.from(drivers).sort();
  }, [trips]);

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
      const lorryTrips = allTrips.filter((trip: Trip) =>
        trip.lorry_id?._id === lorryId &&
        (trip.isActive === undefined || trip.isActive === true)
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
  }, [lorryId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close bulk actions dropdown when clicking outside
      if (showBulkActions) {
        const bulkActionsBtn = document.querySelector('[data-bulk-actions-btn]');
        const bulkActionsMenu = document.querySelector('[data-bulk-actions-menu]');
        
        if (
          bulkActionsBtn &&
          !bulkActionsBtn.contains(event.target as Node) &&
          bulkActionsMenu &&
          !bulkActionsMenu.contains(event.target as Node)
        ) {
          setShowBulkActions(false);
        }
      }
      
      // Close individual action menu when clicking outside
      if (showActionMenu) {
        const actionBtn = document.querySelector(`[data-action-menu-btn="${showActionMenu}"]`);
        const actionMenu = document.querySelector(`[data-action-menu="${showActionMenu}"]`);
        
        if (
          actionBtn &&
          !actionBtn.contains(event.target as Node) &&
          actionMenu &&
          !actionMenu.contains(event.target as Node)
        ) {
          setShowActionMenu(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showBulkActions, showActionMenu]);

  const handleDeleteClick = (tripId: string, tripNumber: string, driverName?: string, material?: string) => {
    // Check if trip is approved
    const trip = trips.find(t => t._id === tripId);
    if (trip?.collab_trip_status === 'approved') {
      toast.error('This trip is approved and cannot be deleted');
      return;
    }
    
    setSelectedTrip({ id: tripId, tripNumber, driverName, material });
    setDeleteModalOpen(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrip) return;

    // Check if trip is approved
    const trip = trips.find(t => t._id === selectedTrip.id);
    if (trip?.collab_trip_status === 'approved') {
      toast.error('This trip is approved and cannot be deleted');
      setDeleteModalOpen(false);
      setSelectedTrip(null);
      return;
    }

    setIsDeleting(true);
    try {
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

    // Filter out trips that are approved
    const deletableTrips = selectedTrips.filter(tripItem => {
      const trip = trips.find(t => t._id === tripItem.id);
      return trip?.collab_trip_status !== 'approved';
    });

    if (deletableTrips.length === 0) {
      toast.error('Selected trips are approved and cannot be deleted');
      setBulkDeleteModalOpen(false);
      return;
    }

    if (deletableTrips.length !== selectedTrips.length) {
      toast.error(`Some trips are approved. Only ${deletableTrips.length} trip(s) can be deleted.`);
    }

    setIsDeleting(true);
    try {
      const tripIds = deletableTrips.map(trip => trip.id);
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

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTrips.length === 0) {
      toast.error('Please select trips to update');
      return;
    }

    // Filter out approved trips if trying to change from completed status
    const updatableTrips = selectedTrips.filter(tripItem => {
      const trip = trips.find(t => t._id === tripItem.id);
      // Allow status updates for approved trips only if they're not completed
      if (trip?.collab_trip_status === 'approved' && trip.status === 'completed') {
        return false;
      }
      return true;
    });

    if (updatableTrips.length === 0) {
      toast.error('Selected trips are approved and completed, status cannot be changed');
      return;
    }

    if (updatableTrips.length !== selectedTrips.length) {
      toast.error(`Some approved completed trips cannot be updated. Updating ${updatableTrips.length} trip(s).`);
    }

    try {
      const tripIds = updatableTrips.map(t => t.id);
      const response = await api.post('/trips/bulk-update-status', {
        tripIds,
        status
      });

      if (response.data.success) {
        toast.success(`Updated ${response.data.data.summary.trips_updated} trip${response.data.data.summary.trips_updated > 1 ? 's' : ''} to ${status}`);

        // Update the trips in state
        fetchTrips();
        setSelectedTrips([]);
        setShowBulkActions(false);

        // Show detailed summary if available
        if (response.data.data.summary.trips_skipped > 0) {
          toast.success(`${response.data.data.summary.trips_skipped} trip${response.data.data.summary.trips_skipped > 1 ? 's were' : ' was'} already in "${status}" status or inactive`);
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to update status to ${status}`);
    }
  };

  const handlePriceChange = async (data: {
    update_customer_amount: boolean;
    extra_amount: number;
  }) => {
    try {
      const tripIds = selectedTrips.map(t => t.id);

      const requestBody: any = {
        tripIds,
        update_customer_amount: data.update_customer_amount,
        extra_amount: data.extra_amount
      };

      const res = await api.put('/trips/update-prices', requestBody);

      toast.success(`Price change applied to ${selectedTrips.length} trip${selectedTrips.length > 1 ? 's' : ''}`);
      setSelectedTrips([]);
      setShowBulkActions(false);
      fetchTrips();

      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to apply price change');
      throw error;
    }
  };

  const handleBulkPriceChange = () => {
    if (selectedTrips.length === 0) {
      toast.error('Please select at least one trip to apply price change');
      return;
    }
    setPriceChangeModalOpen(true);
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    // Check if trip is approved and completed
    const trip = trips.find(t => t._id === tripId);
    if (trip?.collab_trip_status === 'approved' && trip.status === 'completed') {
      toast.error('This trip is approved and completed, status cannot be changed');
      setShowActionMenu(null);
      return;
    }
    
    try {
      await api.patch(`/trips/status/${tripId}`, { status: newStatus });
      toast.success(`Trip status updated`);
      setShowActionMenu(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // Filter trips based on all criteria
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Search text filter
      const matchesSearch =
        trip.trip_number.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.driver_id.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (trip.customer_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          trip.collab_owner_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          trip.collab_owner_id?.company_name?.toLowerCase().includes(searchText.toLowerCase())) ||
        trip.location.toLowerCase().includes(searchText.toLowerCase()) ||
        trip.material_name.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      const matchesStatus = filterStatus === "all" || trip.status === filterStatus;

      // Date range filter
      let matchesDate = true;
      if (startDate || endDate) {
        const tripDate = new Date(trip.trip_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) {
          matchesDate = tripDate >= start && tripDate <= end;
        } else if (start) {
          matchesDate = tripDate >= start;
        } else if (end) {
          matchesDate = tripDate <= end;
        }
      }

      // Customer filter
      let matchesCustomer = true;
      if (customerFilter) {
        const customerName = trip.customer_id?.name || '';
        const collabName = trip.collab_owner_id?.name || '';
        const collabCompany = trip.collab_owner_id?.company_name || '';
        matchesCustomer =
          customerName.toLowerCase().includes(customerFilter.toLowerCase()) ||
          collabName.toLowerCase().includes(customerFilter.toLowerCase()) ||
          collabCompany.toLowerCase().includes(customerFilter.toLowerCase());
      }

      // Crusher filter
      let matchesCrusher = true;
      if (crusherFilter) {
        matchesCrusher = trip.crusher_id.name.toLowerCase().includes(crusherFilter.toLowerCase());
      }

      // Driver filter
      let matchesDriver = true;
      if (driverFilter) {
        matchesDriver = trip.driver_id.name.toLowerCase().includes(driverFilter.toLowerCase());
      }

      return matchesSearch && matchesStatus && matchesDate && matchesCustomer && matchesCrusher && matchesDriver;
    });
  }, [trips, searchText, filterStatus, startDate, endDate, customerFilter, crusherFilter, driverFilter]);

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
name: (trip.collab_owner_id.company_name && trip.collab_owner_id.name) 
  ? `${trip.collab_owner_id.company_name} - ${trip.collab_owner_id.name}`
  : trip.collab_owner_id.company_name || trip.collab_owner_id.name,
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
      setSelectedTrips([]);
      setShowBulkActions(false);
      fetchTrips();

      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clone trips');
      throw error;
    }
  };

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

      if (!response.data || !response.data.data || !response.data.data.details) {
        throw new Error('Invalid response from server');
      }

      const tripDetail = response.data.data.details[0];

      if (!tripDetail) {
        throw new Error('No clone information returned');
      }

      if (!tripDetail.success) {
        throw new Error('Clone operation failed on server');
      }

      if (!tripDetail.cloned_trips || !Array.isArray(tripDetail.cloned_trips) || tripDetail.cloned_trips.length === 0) {
        throw new Error('No cloned trip data returned');
      }

      const clonedTrip = tripDetail.cloned_trips[0];

      if (!clonedTrip._id) {
        throw new Error('Cloned trip missing ID');
      }

      toast.success(`Trip cloned successfully!`);
      return clonedTrip._id;

    } catch (error: any) {
      console.error('Clone API Error:', error);

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
      const loadingToast = toast.loading('Cloning trip...');
      setShowActionMenu(null);
      const clonedTripId = await cloneSingleTrip(tripId);
      toast.dismiss(loadingToast);
      toast.success('Redirecting to edit page...', { duration: 2000 });
      setTimeout(() => {
        navigate(`/trips/edit/${clonedTripId}`);
      }, 500);
    } catch (error) {
      console.error('Clone and edit failed:', error);
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

  // Clear all filters
  const clearAllFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setStartDate("");
    setEndDate("");
    setCustomerFilter("");
    setCrusherFilter("");
    setDriverFilter("");
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return searchText ||
      filterStatus !== "all" ||
      startDate ||
      endDate ||
      customerFilter ||
      crusherFilter ||
      driverFilter;
  };

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
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Buttons Container */}
            <div className="flex items-center gap-2 flex-shrink-0">

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

      {/* Advanced Filters Section */}
      <div className="px-4 py-3 sm:px-6 bg-white border-b">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showAdvancedFilters || hasActiveFilters()
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700'
              }`}
          >
            <FilterIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{showAdvancedFilters ? 'Hide Filters' : 'Filters'}</span>
            <span className="sm:hidden">{showAdvancedFilters ? 'Hide' : 'Filter'}</span>
          </button>

          {/* Bulk Actions Dropdown */}
        {selectedTrips.length > 0 && (
  <div className="relative flex-shrink-0">
    <button
      data-bulk-actions-btn
      onClick={(e) => {
        e.stopPropagation();
        setShowBulkActions(!showBulkActions);
      }}
      className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap shadow-sm"
    >
      <span>{selectedTrips.length} Selected</span>
      <ChevronDown
        className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${
          showBulkActions ? "rotate-180" : ""
        }`}
      />
    </button>

    <AnimatePresence>
      {showBulkActions && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-black/50"
            onClick={() => setShowBulkActions(false)}
          />

          {/* Centered Modal Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Copy className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bulk Actions
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedTrips.length} trip
                        {selectedTrips.length > 1 ? "s" : ""} selected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBulkActions(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="p-4 space-y-1">
                  {/* Clone Action */}
                  <button
                    onClick={() => {
                      setShowBulkActions(false);
                      handleBulkClone();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                      <Copy className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">Clone Selected</p>
                      <p className="text-xs text-gray-500">
                        Create copies of selected trips
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* Price Change Action */}
                  <button
                    onClick={() => {
                      setShowBulkActions(false);
                      handleBulkPriceChange();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">
                        Apply Price Change
                      </p>
                      <p className="text-xs text-gray-500">
                        Update trip prices with current rates
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* Status Update Section */}
                  <div className="pt-2">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Update Status
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowBulkActions(false);
                        handleBulkStatusUpdate("completed");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">
                          Mark as Completed
                        </p>
                        <p className="text-xs text-gray-500">
                          Update selected trips to completed status
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-2">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Danger Zone
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowBulkActions(false);
                        handleBulkDeleteClick();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-red-900">
                          Delete Selected
                        </p>
                        <p className="text-xs text-red-600">
                          Permanently remove selected trips
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>

                    <button
                      onClick={() => {
                        setShowBulkActions(false);
                        handleClearSelection();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50">
                        <X className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">
                          Clear Selection
                        </p>
                        <p className="text-xs text-gray-500">
                          Deselect all trips
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowBulkActions(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
)}

          {/* Select All Button */}
          <button
            onClick={handleSelectAll}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            {selectedTrips.length === filteredTrips.length ? (
              <>
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Deselect All</span>
                <span className="sm:hidden">Deselect</span>
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                <span className="hidden sm:inline">Select All</span>
                <span className="sm:hidden">Select</span>
              </>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {/* Status Filter */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
              </div>

              {/* Date Range Filter */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Date Range</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Customer, Crusher, Driver Filters */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Advanced Filters</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Customer Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Customer/Collab Owner
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        placeholder="Filter by name..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    </div>
                    {uniqueCustomers.length > 0 && customerFilter && (
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {uniqueCustomers
                          .filter(name => name.toLowerCase().includes(customerFilter.toLowerCase()))
                          .slice(0, 5)
                          .map(name => (
                            <button
                              key={name}
                              onClick={() => setCustomerFilter(name)}
                              className="block w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                            >
                              {name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Crusher Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Crusher
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={crusherFilter}
                        onChange={(e) => setCrusherFilter(e.target.value)}
                        placeholder="Filter by crusher..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    </div>
                    {uniqueCrushers.length > 0 && crusherFilter && (
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {uniqueCrushers
                          .filter(name => name.toLowerCase().includes(crusherFilter.toLowerCase()))
                          .slice(0, 5)
                          .map(name => (
                            <button
                              key={name}
                              onClick={() => setCrusherFilter(name)}
                              className="block w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                            >
                              {name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Driver Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Driver
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={driverFilter}
                        onChange={(e) => setDriverFilter(e.target.value)}
                        placeholder="Filter by driver..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    </div>
                    {uniqueDrivers.length > 0 && driverFilter && (
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {uniqueDrivers
                          .filter(name => name.toLowerCase().includes(driverFilter.toLowerCase()))
                          .slice(0, 5)
                          .map(name => (
                            <button
                              key={name}
                              onClick={() => setDriverFilter(name)}
                              className="block w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                            >
                              {name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500">Active filters:</span>

              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {startDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  From: {formatDate(startDate)}
                  <button
                    onClick={() => setStartDate('')}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {endDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                  To: {formatDate(endDate)}
                  <button
                    onClick={() => setEndDate('')}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {customerFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
                  Customer: {customerFilter}
                  <button
                    onClick={() => setCustomerFilter('')}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {crusherFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
                  Crusher: {crusherFilter}
                  <button
                    onClick={() => setCrusherFilter('')}
                    className="text-amber-500 hover:text-amber-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {driverFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-200">
                  Driver: {driverFilter}
                  <button
                    onClick={() => setDriverFilter('')}
                    className="text-teal-500 hover:text-teal-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
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
            {/* Filter Summary */}
            {hasActiveFilters() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FilterIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Showing {filteredTrips.length} of {trips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
                      {hasActiveFilters() && ' (filtered)'}
                    </span>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {filteredTrips.map((trip) => {
              const destination = getDestinationInfo(trip);
              const statusConfig = getStatusConfig(trip.status);
              const StatusIcon = statusConfig.icon;
              const DestIcon = destination.icon;
              const isSelected = selectedTrips.some(t => t.id === trip._id);
              const isApproved = trip.collab_trip_status === 'approved';

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
                            {/* {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                              </span>
                            )} */}
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
                      <div className="relative flex-shrink-0">
                        <button
                          data-action-menu-btn={trip._id}
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
                              <motion.div
                                data-action-menu={trip._id}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 z-50 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 max-h-[calc(100vh-200px)] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
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
                                      disabled={isCurrentStatus || (isApproved && trip.status === 'completed')}
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

                                <div className="border-t border-gray-200 mt-2 pt-2">
                                  <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</p>
                                  </div>

                                  {/* Conditionally show Edit button */}
                                  {!isApproved && (
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
                                  )}

                                  <button
                                    onClick={() => {
                                      setShowActionMenu(null);
                                      setSelectedTrips([{ id: trip._id, tripNumber: trip.trip_number }]);
                                      setCloneModalOpen(true);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50"
                                  >
                                    <Copy className="h-4 w-4 flex-shrink-0" />
                                    <span>Clone</span>
                                  </button>

                                  <button
                                    onClick={() => handleCloneAndEdit(trip._id)}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Copy className="h-3 w-3" />
                                      <Edit className="h-3 w-3" />
                                    </div>
                                    <span>Clone and Edit</span>
                                  </button>

                                  {/* Conditionally show Delete button */}
                                  {!isApproved && (
                                    <button
                                      onClick={() => handleDeleteClick(trip._id, trip.trip_number, trip.driver_id.name, trip.material_name)}
                                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 flex-shrink-0" />
                                      <span>Delete Trip</span>
                                    </button>
                                  )}

                                  {/* Show message if trip is approved */}
                                  {isApproved && (
                                    <div className="px-4 py-2.5 text-xs text-gray-500 italic">
                                      This trip is approved and cannot be edited or deleted.
                                    </div>
                                  )}
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

                    {/* Additional Info - Crusher */}
                    <div className="pt-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Building className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Crusher</p>
                          <p className="font-medium text-gray-900 truncate">{trip.crusher_id.name}</p>
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters() ? 'No matching trips found' : 'No trips found'}
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                Clear filters to see all trips
              </button>
            )}
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

      {/* Clone Trip Modal */}
      <CloneTripModal
        isOpen={cloneModalOpen}
        onClose={() => {
          setCloneModalOpen(false);
        }}
        onClone={cloneTrips}
        selectedTrips={selectedTrips}
      />

      {/* Price Change Modal */}
      <PriceChangeModal
        isOpen={priceChangeModalOpen}
        onClose={() => {
          setPriceChangeModalOpen(false);
        }}
        onApply={handlePriceChange}
        selectedTrips={selectedTrips}
        tripsData={trips}
      />
    </div>
  );
};

export default LorryTrips;