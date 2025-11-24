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
  Building
} from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

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
      // Filter trips by lorry_id on client side since backend might not support filtering by lorry_id
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

  const handleDeleteTrip = async (tripId: string, tripNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete trip ${tripNumber}?`)) {
      return;
    }

    try {
      await api.delete(`/trips/delete/${tripId}`);
      toast.success("Trip deleted successfully");
      setShowActionMenu(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete trip");
    }
  };

  const handleStatusUpdate = async (tripId: string, newStatus: string) => {
    try {
      await api.patch(`/trips/status/${tripId}`, { status: newStatus });
      toast.success(`Trip status updated to ${newStatus}`);
      setShowActionMenu(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // Filter trips
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
      scheduled: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "⏰", label: "Scheduled" },
      dispatched: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: "🚀", label: "Dispatched" },
      loaded: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: "📦", label: "Loaded" },
      in_transit: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🚚", label: "In Transit" },
      delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: "✅", label: "Delivered" },
      completed: { color: "bg-green-100 text-green-800 border-green-200", icon: "🏁", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: "❌", label: "Cancelled" }
    };
    return config[status as keyof typeof config] || config.scheduled;
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getDestinationInfo = (trip: Trip) => {
    if (trip.customer_id) {
      return {
        type: 'customer',
        name: trip.customer_id.name,
        icon: <User className="h-4 w-4 text-blue-500" />,
        label: 'Customer'
      };
    } else if (trip.collab_owner_id) {
      return {
        type: 'collaborative',
        name: trip.collab_owner_id.company_name || trip.collab_owner_id.name,
        icon: <Building className="h-4 w-4 text-green-500" />,
        label: 'Collaborative Owner'
      };
    }
    return {
      type: 'unknown',
      name: 'Unknown',
      icon: <Users className="h-4 w-4 text-gray-500" />,
      label: 'Unknown'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lorry) {
    return (
      <div className="text-center py-12">
        <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorry not found</h3>
        <button
          onClick={() => navigate("/lorries")}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Lorries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/lorries")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {lorry.registration_number}
                {lorry.nick_name && (
                  <span className="text-gray-600 text-lg ml-2">({lorry.nick_name})</span>
                )}
              </h1>
              <p className="text-gray-600">Trip Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/trips/create?lorry=${lorryId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Trip
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{trips.length}</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(trips.reduce((sum, trip) => sum + trip.profit, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Profit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trips.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {trips.filter(t => ['scheduled', 'dispatched', 'loaded', 'in_transit'].includes(t.status)).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search trips by number, driver, customer, material..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input input-bordered pl-9 w-full"
            />
          </div>

          <select
            className="input input-bordered w-full md:w-40"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="dispatched">Dispatched</option>
            <option value="loaded">Loaded</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 border text-sm"
            onClick={() => {
              setSearchText("");
              setFilterStatus("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Trips List */}
      {tripsLoading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const destination = getDestinationInfo(trip);
            
            return (
              <div
                key={trip._id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Trip Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{trip.trip_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(trip.trip_date)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{trip.driver_id.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {destination.icon}
                        <span>{destination.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {destination.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{trip.location}</span>
                      </div>
                      <div className="text-sm text-gray-600">{trip.material_name}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatCurrency(trip.profit)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {trip.no_of_unit_customer} units × {formatCurrency(trip.rate_per_unit)}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="mb-2">{getStatusBadge(trip.status)}</div>
                      <div className="text-sm text-gray-500">
                        Updated {formatDate(trip.updatedAt)}
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="relative">
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
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-10 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                          >
                            <button
                              onClick={() => navigate(`/trips/edit/${trip._id}`)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Trip
                            </button>
                            
                            {/* Status Update Options */}
                            {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                              <>
                                <div className="border-t border-gray-200 my-1"></div>
                                <div className="px-3 py-1 text-xs font-medium text-gray-500">
                                  Update Status
                                </div>
                                {['dispatched', 'loaded', 'in_transit', 'delivered', 'completed', 'cancelled'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(trip._id, status)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                  </button>
                                ))}
                              </>
                            )}
                            
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => handleDeleteTrip(trip._id, trip.trip_number)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Trip
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 text-sm">
                  <div>
                    <span className="text-gray-600">Crusher:</span>
                    <div className="font-medium">{trip.crusher_id.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer Amount:</span>
                    <div className="font-medium text-green-600">{formatCurrency(trip.customer_amount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Crusher Amount:</span>
                    <div className="font-medium text-orange-600">{formatCurrency(trip.crusher_amount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Profit:</span>
                    <div className={`font-medium ${trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(trip.profit)}
                    </div>
                  </div>
                </div>

                {/* Units Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">Crusher Units:</span>
                    <div className="font-medium">{trip.no_of_unit_crusher}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer Units:</span>
                    <div className="font-medium">{trip.no_of_unit_customer}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Rate per Unit:</span>
                    <div className="font-medium">{formatCurrency(trip.rate_per_unit)}</div>
                  </div>
                  {trip.dc_number && (
                    <div>
                      <span className="text-gray-600">DC Number:</span>
                      <div className="font-medium">{trip.dc_number}</div>
                    </div>
                  )}
                </div>

                {trip.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <strong>Notes:</strong> {trip.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600 mb-6">
            {searchText || filterStatus !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by adding the first trip for this lorry"
            }
          </p>
          <Link
            to={`/trips/create?lorry=${lorryId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <FaPlus size={16} />
            Add First Trip
          </Link>
        </div>
      )}
    </div>
  );
};

export default LorryTrips;