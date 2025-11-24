import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calculator, Calendar, Truck, User, MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateSettlementForm = ({ partners, onCalculate, onCreate, onClose, initialPartner }) => {
  const [formData, setFormData] = useState({
    owner_B_id: initialPartner?._id || '',
    from_date: '',
    to_date: '',
    notes: ''
  });
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'my-trips', 'partner-trips'

  const handleCalculate = async () => {
    if (!formData.owner_B_id || !formData.from_date || !formData.to_date) {
      toast.error('Please select partner and date range');
      return;
    }

    try {
      setLoading(true);
      const result = await onCalculate(
        formData.owner_B_id,
        formData.from_date,
        formData.to_date
      );
      setCalculation(result);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!calculation) {
      toast.error('Please calculate settlement first');
      return;
    }

    try {
      await onCreate({
        ...formData,
        notes: formData.notes || undefined
      });
      onClose();
    } catch (error) {
      // Error handled in parent
    }
  };

  const selectedPartner = partners.find(p => p._id === formData.owner_B_id);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Create Settlement</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Partner Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collaborative Partner
            </label>
            <select
              value={formData.owner_B_id}
              onChange={(e) => setFormData({ ...formData, owner_B_id: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a partner</option>
              {partners.map(partner => (
                <option key={partner._id} value={partner._id}>
                  {partner.name} ({partner.company_name})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading || !formData.owner_B_id || !formData.from_date || !formData.to_date}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            <Calculator className="h-5 w-5" />
            {loading ? 'Calculating...' : 'Calculate Settlement'}
          </button>

          {/* Calculation Results */}
          {calculation && (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Settlement Summary</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded border">
                    <p className="text-sm text-gray-600">My Trips for Partner</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(calculation.trip_categories?.my_trips_for_partner?.total_amount || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculation.trip_categories?.my_trips_for_partner?.count || 0} trips
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded border">
                    <p className="text-sm text-gray-600">Partner Trips for Me</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculation.trip_categories?.partner_trips_for_me?.total_amount || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculation.trip_categories?.partner_trips_for_me?.count || 0} trips
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-600">Net Settlement Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculation.net_amount)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {calculation.amount_breakdown.net_payable_by === 'owner_A' 
                      ? `You owe ${selectedPartner?.name}` 
                      : `${selectedPartner?.name} owes you`}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-3 text-center">
                  Includes {calculation.trip_count} trips in the selected period
                </p>

                <button
                  onClick={handleCreate}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  {/* <CheckCircle className="h-5 w-5" /> */}
                  Create Settlement
                </button>
              </div>

              {/* Detailed Trip Breakdown Tabs */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {[
                      { id: 'summary', label: 'Summary' },
                      { id: 'my-trips', label: `My Trips for ${selectedPartner?.name}` },
                      { id: 'partner-trips', label: `${selectedPartner?.name}'s Trips for Me` }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'summary' && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900">Trip Summary</h5>
                      {calculation.trip_breakdown.map((trip, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${
                              trip.direction === 'a_to_b' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {trip.direction === 'a_to_b' ? 'You → Partner' : 'Partner → You'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{trip.trip_number}</p>
                              <p className="text-sm text-gray-600">
                                {trip.material_name} • {trip.location}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(trip.trip_date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(trip.amount)}</p>
                            <p className="text-sm text-gray-600">
                              {trip.payable_by === 'owner_A' ? 'You pay' : 'Partner pays'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'my-trips' && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900 mb-4">
                        My Trips Delivered to {selectedPartner?.name}
                      </h5>
                      {calculation.trip_categories?.my_trips_for_partner?.trips?.map((trip, index) => (
                        <TripDetailCard key={index} trip={trip} type="my_trip" />
                      ))}
                      {(!calculation.trip_categories?.my_trips_for_partner?.trips || calculation.trip_categories.my_trips_for_partner.trips.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No trips found</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'partner-trips' && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900 mb-4">
                        {selectedPartner?.name}'s Trips Delivered to Me
                      </h5>
                      {calculation.trip_categories?.partner_trips_for_me?.trips?.map((trip, index) => (
                        <TripDetailCard key={index} trip={trip} type="partner_trip" />
                      ))}
                      {(!calculation.trip_categories?.partner_trips_for_me?.trips || calculation.trip_categories.partner_trips_for_me.trips.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No trips found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Settlement Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes about this settlement..."
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Trip Detail Card Component
const TripDetailCard = ({ trip, type }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded ${
            type === 'my_trip' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {type === 'my_trip' ? 'You → Partner' : 'Partner → You'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{trip.trip_number}</p>
            <p className="text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">{formatCurrency(trip.customer_amount)}</p>
          <p className="text-sm text-gray-600">
            {type === 'my_trip' ? 'Partner pays you' : 'You pay partner'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Material</p>
          <p className="font-medium">{trip.material_name}</p>
        </div>
        <div>
          <p className="text-gray-600">Location</p>
          <p className="font-medium">{trip.location}</p>
        </div>
      </div>

      {trip.notes && (
        <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Notes:</strong> {trip.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateSettlementForm;