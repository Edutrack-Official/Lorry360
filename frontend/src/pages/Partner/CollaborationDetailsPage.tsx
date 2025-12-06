// src/pages/partners/CollaborationDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Calendar,
  MapPin,
  Package,
  IndianRupee,
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Partner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  company_name: string;
}

interface Trip {
  _id: string;
  trip_number: string;
  trip_date: string;
  material_name: string;
  location: string;
  customer_amount: number;
  crusher_amount: number;
  profit: number;
  status: string;
  notes?: string;
  owner_id: string;
  collab_owner_id?: {
    _id: string;
    name: string;
    company_name: string;
  };
  customer_id?: {
    _id: string;
    name: string;
  };
  crusher_id?: {
    _id: string;
    name: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CollaborationDetailsPage = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-trips' | 'partner-trips'>('my-trips');
  
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [partnerTrips, setPartnerTrips] = useState<Trip[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (location.state?.partner) {
      setPartner(location.state.partner);
      fetchTrips();
    } else {
      // If no state, go back to list
      navigate('/partners');
    }
  }, [partnerId]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      // Fetch MY trips where I'm owner and partner is collaborator
      const myTripsParams: any = {
        collab_owner_id: partnerId,
        trip_type: 'collaborative'
      };
      
      if (dateRange.start) myTripsParams.start_date = dateRange.start;
      if (dateRange.end) myTripsParams.end_date = dateRange.end;
      
const myTripsRes = await api.get('/trips', {
  params: {
    trip_type: 'collaborative',
    collab_owner_id: partnerId,  // Partner is the collaborator
    fetch_mode: 'as_owner' // Default, can be omitted
  }
});  
    if (myTripsRes.data.success) {
        setMyTrips(myTripsRes.data.data?.trips || []);
      }
      
      // Fetch PARTNER'S trips where partner is owner and I'm collaborator
      // We'll need to use the same endpoint but with owner_id filter
      // This might require backend changes or we can filter client-side
      // For now, let's assume we can get all trips and filter
         const partnerTripsRes = await api.get('/trips', {
            params: {
                trip_type: 'collaborative',
                collab_owner_id: partnerId,  // Partner is the owner (parameter name is confusing)
                fetch_mode: 'as_collaborator' // This changes the logic
            }
            });
      
      if (partnerTripsRes.data.success) {
        setPartnerTrips(partnerTripsRes.data.data?.trips || []);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

const calculateTotals = () => {
  const totalMyTripsAmount = myTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
  const totalPartnerTripsAmount = partnerTrips.reduce((sum, trip) => sum + trip.customer_amount, 0);
  
  // Partner owes me for my trips, I owe partner for partner's trips
  const partnerOwesMe = totalMyTripsAmount;
  const iOwePartner = totalPartnerTripsAmount;
  
  const netAmount = totalMyTripsAmount - totalPartnerTripsAmount;
  
  return {
    totalMyTripsAmount,
    totalPartnerTripsAmount,
    partnerOwesMe,
    iOwePartner,
    netAmount,
    myTripCount: myTrips.length,
    partnerTripCount: partnerTrips.length
  };
};


  const filteredTrips = () => {
    const trips = activeTab === 'my-trips' ? myTrips : partnerTrips;
    
    return trips.filter(trip => {
      const searchLower = searchText.toLowerCase();
      return (
        trip.trip_number.toLowerCase().includes(searchLower) ||
        trip.material_name.toLowerCase().includes(searchLower) ||
        trip.location.toLowerCase().includes(searchLower) ||
        (trip.notes && trip.notes.toLowerCase().includes(searchLower))
      );
    });
  };

  const TripCard = ({ trip, type }: { trip: Trip; type: 'my' | 'partner' }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            type === 'my' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{trip.trip_number}</h4>
            <p className="text-xs text-gray-500">{formatDate(trip.trip_date)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatCurrency(trip.customer_amount)}</p>
          <p className="text-xs text-gray-500 capitalize">{trip.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-gray-400" />
          <span className="truncate">{trip.material_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="truncate">{trip.location}</span>
        </div>
      </div>

      {trip.notes && (
        <p className="text-xs text-gray-600 italic border-t pt-2">{trip.notes}</p>
      )}
    </motion.div>
  );

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner Not Found</h2>
        <button
          onClick={() => navigate('/partners')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Collaborations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/partners')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{partner.name}</h1>
                  <p className="text-gray-600">{partner.company_name}</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchTrips}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 mb-1">My Trips Amount</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(totals.totalMyTripsAmount)}</p>
              <p className="text-xs text-green-600">{totals.myTripCount} trips</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Partner Trips Amount</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(totals.totalPartnerTripsAmount)}</p>
              <p className="text-xs text-blue-600">{totals.partnerTripCount} trips</p>
            </div>
<div className={`p-4 rounded-xl border ${
  totals.netAmount > 0 
    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
    : totals.netAmount < 0
    ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
}`}>
  <div className="flex items-center gap-2 mb-1">
    {totals.netAmount > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : totals.netAmount < 0 ? (
      <TrendingDown className="h-4 w-4 text-orange-600" />
    ) : null}
    <p className="text-sm">
      {totals.netAmount > 0 ? 'Partner needs to pay me' : 
       totals.netAmount < 0 ? 'I need to pay partner' : 'All settled'}
    </p>
  </div>
  <p className={`text-xl font-bold ${
    totals.netAmount > 0 
      ? 'text-green-900' 
      : totals.netAmount < 0
      ? 'text-orange-900'
      : 'text-gray-900'
  }`}>
    {formatCurrency(Math.abs(totals.netAmount))}
  </p>
</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs and Search */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex border-b md:border-b-0">
              <button
                onClick={() => setActiveTab('my-trips')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'my-trips'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Trips to Partner
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {myTrips.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('partner-trips')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'partner-trips'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Partner Trips to Me
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {partnerTrips.length}
                </span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="End date"
                />
                {(dateRange.start || dateRange.end) && (
                  <button
                    onClick={() => setDateRange({ start: '', end: '' })}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trips List */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {activeTab === 'my-trips' 
              ? `My Trips to ${partner.name}` 
              : `${partner.name}'s Trips to Me`}
            <span className="text-gray-500 font-normal ml-2">
              ({filteredTrips().length} trips)
            </span>
          </h3>
          
          {filteredTrips().length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h4>
              <p className="text-gray-600">
                {searchText || dateRange.start || dateRange.end
                  ? 'Try adjusting your search filters'
                  : activeTab === 'my-trips'
                    ? `You haven't delivered any trips to ${partner.name} yet`
                    : `${partner.name} hasn't delivered any trips to you yet`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrips().map((trip) => (
                <TripCard 
                  key={trip._id} 
                  trip={trip} 
                  type={activeTab === 'my-trips' ? 'my' : 'partner'} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationDetailsPage;