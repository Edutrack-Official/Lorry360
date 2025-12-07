import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, Calendar, MapPin, Truck, User } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Trip {
  _id: string;
  trip_number: string;
  status: string;
  trip_date: string;
  profit: number;
  crusher_amount: number;
  customer_amount: number;
  material_name: string;
  location: string;
  no_of_unit_crusher: number;
  rate_per_unit: number;
  crusher_id: {
    _id: string;
    name: string;
  };
  customer_id?: {
    _id: string;
    name: string;
  };
  collab_owner_id?: {
    _id: string;
    name: string;
    company_name?: string;
  };
  lorry_id?: {
    _id: string;
    registration_number: string;
    nick_name?: string;
  };
  driver_id?: {
    _id: string;
    name: string;
  };
}

const CrusherTrips = () => {
  const { crusherId } = useParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCrusherTrips = async () => {
    if (!crusherId) return;
    
    try {
      const tripsRes = await api.get(`/trips/crusher/${crusherId}`);
       const crusherTrips = (tripsRes.data.data?.trips || []).filter(
              (trip: any) => trip.status === "completed"
            );
            console.log("Fetched completed crusher trips:", crusherTrips);
      setTrips(crusherTrips);
    } catch (error: any) {
      console.error("Failed to fetch crusher trips:", error);
      toast.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (crusherId) {
      fetchCrusherTrips();
    }
  }, [crusherId]);

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

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-yellow-100 text-yellow-800',
      loaded: 'bg-orange-100 text-orange-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDestinationName = (trip: Trip) => {
    if (trip.customer_id) {
      return trip.customer_id.name;
    } else if (trip.collab_owner_id) {
      return trip.collab_owner_id.company_name || trip.collab_owner_id.name;
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
        <p className="text-sm text-gray-500">No trips have been recorded for this crusher yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {trips.map((trip) => (
        <div 
          key={trip._id} 
          className="bg-white border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {trip.trip_number}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{formatDate(trip.trip_date)}</span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(trip.status)}`}>
              {trip.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-3 text-xs sm:text-sm">
            {/* Material */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Material:</span>
              <span className="font-medium text-gray-900 truncate">{trip.material_name}</span>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">To:</span>
              <span className="font-medium text-gray-900 truncate">{getDestinationName(trip)}</span>
            </div>

            {/* Lorry */}
            {trip.lorry_id && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Lorry:</span>
                <span className="font-medium text-gray-900 truncate">
                  {trip.lorry_id.registration_number}
                  {trip.lorry_id.nick_name && ` (${trip.lorry_id.nick_name})`}
                </span>
              </div>
            )}

            {/* Driver */}
            {trip.driver_id && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Driver:</span>
                <span className="font-medium text-gray-900 truncate">{trip.driver_id.name}</span>
              </div>
            )}

            {/* Units */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Units:</span>
              <span className="font-medium text-gray-900">{trip.no_of_unit_crusher}</span>
            </div>

            {/* Rate */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium text-gray-900">{formatCurrency(trip.rate_per_unit)}/unit</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 mb-3 text-xs sm:text-sm">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600">Location:</span>
            <span className="text-gray-900 break-words flex-1">{trip.location}</span>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-0.5">Crusher Amount</div>
              <div className="text-sm sm:text-base font-semibold text-orange-600">
                {formatCurrency(trip.crusher_amount)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-0.5">Customer Amount</div>
              <div className="text-sm sm:text-base font-semibold text-green-600">
                {formatCurrency(trip.customer_amount)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-0.5">Profit Amount</div>
              <div className={`text-sm sm:text-base font-semibold ${trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(trip.profit)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CrusherTrips;