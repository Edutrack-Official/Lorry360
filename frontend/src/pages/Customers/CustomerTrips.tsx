import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, Calendar, IndianRupee, MapPin, Truck, User, Building } from 'lucide-react';
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
  no_of_unit_customer: number;
  rate_per_unit: number;
  crusher_id: {
    _id: string;
    name: string;
  };
  customer_id?: {
    _id: string;
    name: string;
    phone?: string;
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
    phone?: string;
  };
}

interface CustomerDetails {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const CustomerTrips = () => {
  const { customerId } = useParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(true);

  const fetchCustomerDetails = async () => {
    if (!customerId) return;
    
    try {
      const res = await api.get(`/customers/${customerId}`);
      setCustomerDetails(res.data.data);
    } catch (error: any) {
      console.error("Failed to fetch customer details:", error);
      toast.error("Failed to fetch customer details");
    } finally {
      setCustomerLoading(false);
    }
  };

const fetchCustomerTrips = async () => {
  if (!customerId) return;
  
  try {
    // Use the dedicated customer trips endpoint
    const res = await api.get(`/trips/customer/${customerId}`);
    const customerTrips = res.data.data?.trips || [];
    setTrips(customerTrips);
  } catch (error: any) {
    console.error("Failed to fetch customer trips:", error);
    toast.error("Failed to fetch trips");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
      fetchCustomerTrips();
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

  const getCrusherName = (trip: Trip) => {
    return trip.crusher_id?.name || 'Unknown Crusher';
  };

  if (customerLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Details Card */}
      {customerDetails && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customerDetails.name}</h1>
                {customerDetails.address && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {customerDetails.address}
                  </p>
                )}
                {customerDetails.phone && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {customerDetails.phone}
                  </p>
                )}
                {customerDetails.email && (
                  <p className="text-gray-600 mt-1">{customerDetails.email}</p>
                )}
              </div>
            </div>
            
            {/* Trip Statistics */}
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Trips</div>
              <div className="text-2xl font-bold text-gray-900">{trips.length}</div>
              <div className="text-sm text-gray-500 mt-2">
                Total Amount: {formatCurrency(trips.reduce((sum, trip) => sum + trip.customer_amount, 0))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trips Section */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Trip History</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : trips.length > 0 ? (
          <div className="divide-y">
            {trips.map((trip) => (
              <div key={trip._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">{trip.trip_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {trip.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(trip.trip_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Material:</span>
                        <span>{trip.material_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Crusher:</span>
                        <span>{getCrusherName(trip)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                      {trip.lorry_id && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Lorry:</span>
                          <span>{trip.lorry_id.registration_number}</span>
                          {trip.lorry_id.nick_name && (
                            <span className="text-gray-500">({trip.lorry_id.nick_name})</span>
                          )}
                        </div>
                      )}
                      
                      {trip.driver_id && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Driver:</span>
                          <span>{trip.driver_id.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Customer Units:</span>
                        <span>{trip.no_of_unit_customer} units</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Rate:</span>
                        <span>{formatCurrency(trip.rate_per_unit)}/unit</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Location:</span>
                      <span>{trip.location}</span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6 min-w-[120px]">
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-500">Customer Amount</div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(trip.customer_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Crusher Amount</div>
                        <div className="text-md font-medium text-orange-600">
                          {formatCurrency(trip.crusher_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Profit</div>
                        <div className={`text-md font-medium ${trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(trip.profit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-500">No trips have been recorded for this customer yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTrips;