import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Package, Calendar, IndianRupee, MapPin, Truck } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Trip {
  _id: string;
  trip_number: string;
  status: string;
  trip_date: string;
  profit: number;
  customer_amount: number;
  location: string;
  material_name: string;
  customer_id: {
    _id: string;
    name: string;
    phone: string;
  };
  lorry_id?: {
    _id: string;
    registration_number: string;
  };
}

const CustomerTrips = () => {
  const { customerId } = useParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/trips`);
      const allTrips = res.data.data?.trips || [];
      
      // Fix: customer_id is an object, so we need to check customer_id._id
      const customerTrips = allTrips.filter((trip: Trip) => 
        trip.customer_id && trip.customer_id._id === customerId
      );
      
      setTrips(customerTrips);
    } catch (error: any) {
      console.error("Failed to fetch trips:", error);
      toast.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchTrips();
    }
  }, [customerId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Trips</h2>
        <Link
           to={`/customers/${customerId}/trips/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Trip
        </Link>
      </div>
      
      {trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{trip.trip_number}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(trip.trip_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{trip.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{trip.material_name}</span>
                    </div>
                    
                    {trip.lorry_id && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span>{trip.lorry_id.registration_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(trip.customer_amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Profit: <span className={trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(trip.profit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first trip for this customer</p>
          <Link
             to={`/customers/${customerId}/trips/create`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add First Trip
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerTrips;