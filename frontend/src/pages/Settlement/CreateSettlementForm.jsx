// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { X, Calculator, Calendar, Truck, User, MapPin, Package } from 'lucide-react';
// import toast from 'react-hot-toast';

// const CreateSettlementForm = ({ partners, onCalculate, onCreate, onClose, initialPartner }) => {
//   const [formData, setFormData] = useState({
//     owner_B_id: initialPartner?._id || '',
//     from_date: '',
//     to_date: '',
//     notes: ''
//   });
//   const [calculation, setCalculation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'my-trips', 'partner-trips'

//   const handleCalculate = async () => {
//     if (!formData.owner_B_id || !formData.from_date || !formData.to_date) {
//       toast.error('Please select partner and date range');
//       return;
//     }

//     try {
//       setLoading(true);
//       const result = await onCalculate(
//         formData.owner_B_id,
//         formData.from_date,
//         formData.to_date
//       );
//       setCalculation(result);
//     } catch (error) {
//       // Error handled in parent
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = async () => {
//     if (!calculation) {
//       toast.error('Please calculate settlement first');
//       return;
//     }

//     try {
//       await onCreate({
//         ...formData,
//         notes: formData.notes || undefined
//       });
//       onClose();
//     } catch (error) {
//       // Error handled in parent
//     }
//   };

//   const selectedPartner = partners.find(p => p._id === formData.owner_B_id);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
//       >
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">Create Settlement</h3>
//             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Partner Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Collaborative Partner
//             </label>
//             <select
//               value={formData.owner_B_id}
//               onChange={(e) => setFormData({ ...formData, owner_B_id: e.target.value })}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select a partner</option>
//               {partners.map(partner => (
//                 <option key={partner._id} value={partner._id}>
//                   {partner.name} ({partner.company_name})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Date Range */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 From Date
//               </label>
//               <input
//                 type="date"
//                 value={formData.from_date}
//                 onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 To Date
//               </label>
//               <input
//                 type="date"
//                 value={formData.to_date}
//                 onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//           </div>

//           {/* Calculate Button */}
//           <button
//             onClick={handleCalculate}
//             disabled={loading || !formData.owner_B_id || !formData.from_date || !formData.to_date}
//             className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
//           >
//             <Calculator className="h-5 w-5" />
//             {loading ? 'Calculating...' : 'Calculate Settlement'}
//           </button>

//           {/* Calculation Results */}
//           {calculation && (
//             <div className="space-y-6">
//               {/* Summary Section */}
//               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
//                 <h4 className="font-semibold text-gray-900 mb-4">Settlement Summary</h4>
                
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <div className="text-center p-4 bg-white rounded border">
//                     <p className="text-sm text-gray-600">My Trips for Partner</p>
//                     <p className="text-lg font-bold text-green-600">
//                       {formatCurrency(calculation.trip_categories?.my_trips_for_partner?.total_amount || 0)}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {calculation.trip_categories?.my_trips_for_partner?.count || 0} trips
//                     </p>
//                   </div>
//                   <div className="text-center p-4 bg-white rounded border">
//                     <p className="text-sm text-gray-600">Partner Trips for Me</p>
//                     <p className="text-lg font-bold text-blue-600">
//                       {formatCurrency(calculation.trip_categories?.partner_trips_for_me?.total_amount || 0)}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {calculation.trip_categories?.partner_trips_for_me?.count || 0} trips
//                     </p>
//                   </div>
//                 </div>

//                 <div className="text-center p-4 bg-blue-50 rounded border border-blue-200">
//                   <p className="text-sm text-blue-600">Net Settlement Amount</p>
//                   <p className="text-2xl font-bold text-blue-600">
//                     {formatCurrency(calculation.net_amount)}
//                   </p>
//                   <p className="text-sm text-blue-600 mt-1">
//                     {calculation.amount_breakdown.net_payable_by === 'owner_A' 
//                       ? `You owe ${selectedPartner?.name}` 
//                       : `${selectedPartner?.name} owes you`}
//                   </p>
//                 </div>

//                 <p className="text-sm text-gray-600 mt-3 text-center">
//                   Includes {calculation.trip_count} trips in the selected period
//                 </p>

//                 <button
//                   onClick={handleCreate}
//                   className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
//                 >
//                   {/* <CheckCircle className="h-5 w-5" /> */}
//                   Create Settlement
//                 </button>
//               </div>

//               {/* Detailed Trip Breakdown Tabs */}
//               <div className="bg-white rounded-lg border border-gray-200">
//                 <div className="border-b border-gray-200">
//                   <nav className="-mb-px flex space-x-8 px-6">
//                     {[
//                       { id: 'summary', label: 'Summary' },
//                       { id: 'my-trips', label: `My Trips for ${selectedPartner?.name}` },
//                       { id: 'partner-trips', label: `${selectedPartner?.name}'s Trips for Me` }
//                     ].map((tab) => (
//                       <button
//                         key={tab.id}
//                         onClick={() => setActiveTab(tab.id)}
//                         className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                           activeTab === tab.id
//                             ? 'border-blue-500 text-blue-600'
//                             : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                         }`}
//                       >
//                         {tab.label}
//                       </button>
//                     ))}
//                   </nav>
//                 </div>

//                 <div className="p-6">
//                   {activeTab === 'summary' && (
//                     <div className="space-y-4">
//                       <h5 className="font-semibold text-gray-900">Trip Summary</h5>
//                       {calculation.trip_breakdown.map((trip, index) => (
//                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                           <div className="flex items-center gap-3">
//                             <div className={`p-2 rounded ${
//                               trip.direction === 'a_to_b' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
//                             }`}>
//                               {trip.direction === 'a_to_b' ? 'You → Partner' : 'Partner → You'}
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-900">{trip.trip_number}</p>
//                               <p className="text-sm text-gray-600">
//                                 {trip.material_name} • {trip.location}
//                               </p>
//                               <p className="text-xs text-gray-500">{formatDate(trip.trip_date)}</p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-semibold text-gray-900">{formatCurrency(trip.amount)}</p>
//                             <p className="text-sm text-gray-600">
//                               {trip.payable_by === 'owner_A' ? 'You pay' : 'Partner pays'}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {activeTab === 'my-trips' && (
//                     <div className="space-y-4">
//                       <h5 className="font-semibold text-gray-900 mb-4">
//                         My Trips Delivered to {selectedPartner?.name}
//                       </h5>
//                       {calculation.trip_categories?.my_trips_for_partner?.trips?.map((trip, index) => (
//                         <TripDetailCard key={index} trip={trip} type="my_trip" />
//                       ))}
//                       {(!calculation.trip_categories?.my_trips_for_partner?.trips || calculation.trip_categories.my_trips_for_partner.trips.length === 0) && (
//                         <p className="text-gray-500 text-center py-4">No trips found</p>
//                       )}
//                     </div>
//                   )}

//                   {activeTab === 'partner-trips' && (
//                     <div className="space-y-4">
//                       <h5 className="font-semibold text-gray-900 mb-4">
//                         {selectedPartner?.name}'s Trips Delivered to Me
//                       </h5>
//                       {calculation.trip_categories?.partner_trips_for_me?.trips?.map((trip, index) => (
//                         <TripDetailCard key={index} trip={trip} type="partner_trip" />
//                       ))}
//                       {(!calculation.trip_categories?.partner_trips_for_me?.trips || calculation.trip_categories.partner_trips_for_me.trips.length === 0) && (
//                         <p className="text-gray-500 text-center py-4">No trips found</p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Notes */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Settlement Notes (Optional)
//                 </label>
//                 <textarea
//                   value={formData.notes}
//                   onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                   rows={3}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Add any additional notes about this settlement..."
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Trip Detail Card Component
// const TripDetailCard = ({ trip, type }) => {
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-3">
//           <div className={`p-2 rounded ${
//             type === 'my_trip' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
//           }`}>
//             {type === 'my_trip' ? 'You → Partner' : 'Partner → You'}
//           </div>
//           <div>
//             <p className="font-semibold text-gray-900">{trip.trip_number}</p>
//             <p className="text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
//           </div>
//         </div>
//         <div className="text-right">
//           <p className="font-bold text-lg text-gray-900">{formatCurrency(trip.customer_amount)}</p>
//           <p className="text-sm text-gray-600">
//             {type === 'my_trip' ? 'Partner pays you' : 'You pay partner'}
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4 text-sm">
//         <div>
//           <p className="text-gray-600">Material</p>
//           <p className="font-medium">{trip.material_name}</p>
//         </div>
//         <div>
//           <p className="text-gray-600">Location</p>
//           <p className="font-medium">{trip.location}</p>
//         </div>
//       </div>

//       {trip.notes && (
//         <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
//           <p className="text-sm text-yellow-800">
//             <strong>Notes:</strong> {trip.notes}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateSettlementForm;


//cubeversion1
import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { 
  X, 
  Calculator, 
  Calendar, 
  Truck, 
  User, 
  MapPin, 
  Package,
  Info,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateSettlementForm = ({ partners, settlements, onCalculate, onCreate, onClose, initialPartner }) => {
  const [formData, setFormData] = useState({
    owner_B_id: initialPartner?._id || '',
    from_date: '',
    to_date: '',
    notes: ''
  });
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [showDateSuggestion, setShowDateSuggestion] = useState(false);
  const [suggestedDates, setSuggestedDates] = useState(null);

  // Auto-suggest dates when partner is selected - NOW USING SMART API
  useEffect(() => {
    if (formData.owner_B_id) {
      fetchSmartDateSuggestions(formData.owner_B_id);
    }
  }, [formData.owner_B_id]);

  const fetchSmartDateSuggestions = async (partnerId) => {
    try {
      setLoading(true);
      // Call the new smart API endpoint
      const response = await api.post('/settlements/date-suggestions', {
        owner_B_id: partnerId
      });

      const data = response.data.data;
      console.log("unsettled",data);
      
      if (data.suggestion_type === 'unsettled_trips') {
        // We have unsettled trips - use them!
        const suggestion = {
          from_date: data.suggested_range.from_date,
          to_date: data.suggested_range.to_date,
          reason: data.suggested_range.reason,
          trip_count: data.suggested_range.expected_trip_count,
          priority: data.suggested_range.priority,
          note: data.suggested_range.note,
          lastSettlement: data.last_settlement,
          alternativeRanges: data.alternative_ranges || []
        };

        setSuggestedDates(suggestion);
        setShowDateSuggestion(true);
        
        // Auto-fill the dates
        setFormData(prev => ({
          ...prev,
          from_date: suggestion.from_date,
          to_date: suggestion.to_date
        }));
      } else if (data.suggestion_type === 'continuation') {
        // Continue from last settlement
        const suggestion = {
          from_date: data.suggested_range.from_date,
          to_date: data.suggested_range.to_date,
          reason: data.suggested_range.reason,
          trip_count: 0,
          note: data.suggested_range.note,
          lastSettlement: data.last_settlement
        };

        setSuggestedDates(suggestion);
        setShowDateSuggestion(true);
        
        // Auto-fill the dates
        setFormData(prev => ({
          ...prev,
          from_date: suggestion.from_date,
          to_date: suggestion.to_date
        }));
      } else {
        // First settlement
        const suggestion = {
          from_date: data.suggested_range.from_date,
          to_date: data.suggested_range.to_date,
          reason: data.suggested_range.reason,
          trip_count: 0,
          note: data.suggested_range.note
        };

        setSuggestedDates(suggestion);
        setShowDateSuggestion(true);
        
        // Auto-fill the dates
        setFormData(prev => ({
          ...prev,
          from_date: suggestion.from_date,
          to_date: suggestion.to_date
        }));
      }
    } catch (error) {
      console.error('Failed to fetch date suggestions:', error);
      // Fallback to simple logic if API fails
      fallbackDateSuggestion(partnerId);
    } finally {
      setLoading(false);
    }
  };

  // Fallback if API fails
  const fallbackDateSuggestion = (partnerId) => {
    const partnerSettlements = settlements.filter(s => 
      s.owner_A_id._id === partnerId || s.owner_B_id._id === partnerId
    );

    if (partnerSettlements.length === 0) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const suggestion = {
        from_date: firstDay.toISOString().split('T')[0],
        to_date: today.toISOString().split('T')[0],
        reason: 'Current month (No previous settlements found)'
      };

      setSuggestedDates(suggestion);
      setShowDateSuggestion(true);
      
      setFormData(prev => ({
        ...prev,
        from_date: suggestion.from_date,
        to_date: suggestion.to_date
      }));
    } else {
      const sortedSettlements = [...partnerSettlements].sort((a, b) => 
        new Date(b.to_date) - new Date(a.to_date)
      );
      const lastSettlement = sortedSettlements[0];

      const nextDay = new Date(lastSettlement.to_date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const today = new Date();

      const suggestion = {
        from_date: nextDay.toISOString().split('T')[0],
        to_date: today.toISOString().split('T')[0],
        reason: `Continuing from last settlement (${formatDate(lastSettlement.from_date)} - ${formatDate(lastSettlement.to_date)})`,
        lastSettlement: lastSettlement
      };

      setSuggestedDates(suggestion);
      setShowDateSuggestion(true);

      setFormData(prev => ({
        ...prev,
        from_date: suggestion.from_date,
        to_date: suggestion.to_date
      }));
    }
  };

  const handleCalculate = async () => {
    if (!formData.owner_B_id || !formData.from_date || !formData.to_date) {
      toast.error('Please select partner and date range');
      return;
    }

    // Validate date range
    if (new Date(formData.from_date) > new Date(formData.to_date)) {
      toast.error('From date must be before To date');
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
      setShowDateSuggestion(false);
      toast.success('Settlement calculated successfully');
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

    if (calculation.trip_count === 0) {
      toast.error('No trips found in selected date range');
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

  const handleUseSuggestion = () => {
    if (suggestedDates) {
      setFormData(prev => ({
        ...prev,
        from_date: suggestedDates.from_date,
        to_date: suggestedDates.to_date
      }));
      setShowDateSuggestion(false);
      toast.success('Date range applied');
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
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Create New Settlement</h3>
              <p className="text-gray-600 mt-1">Calculate and create a settlement with your partner</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Partner Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Collaborative Partner *
            </label>
            <select
              value={formData.owner_B_id}
              onChange={(e) => {
                setFormData({ ...formData, owner_B_id: e.target.value });
                setCalculation(null); // Reset calculation when partner changes
              }}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="">Select a partner</option>
              {partners.map(partner => (
                <option key={partner._id} value={partner._id}>
                  {partner.name} - {partner.company_name}
                </option>
              ))}
            </select>
            {selectedPartner && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                {selectedPartner.phone && `${selectedPartner.phone}`}
                {selectedPartner.email && ` • ${selectedPartner.email}`}
              </p>
            )}
          </div>

          {/* Date Suggestion Alert - ENHANCED with Priority */}
          {showDateSuggestion && suggestedDates && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-xl p-4 ${
                suggestedDates.priority === 'critical' 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  suggestedDates.priority === 'critical'
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                }`}>
                  {suggestedDates.priority === 'critical' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      suggestedDates.priority === 'critical' ? 'text-red-900' : 'text-blue-900'
                    }`}>
                      Suggested Date Range
                    </h4>
                    {suggestedDates.priority === 'critical' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                        CRITICAL
                      </span>
                    )}
                    {suggestedDates.trip_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                        {suggestedDates.trip_count} unsettled trips
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-2 ${
                    suggestedDates.priority === 'critical' ? 'text-red-700' : 'text-blue-700'
                  }`}>
                    {suggestedDates.reason}
                  </p>
                  
                  {suggestedDates.note && (
                    <p className={`text-xs mb-2 font-medium ${
                      suggestedDates.priority === 'critical' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {suggestedDates.note}
                    </p>
                  )}
                  
                  <div className={`flex items-center gap-2 text-sm font-medium ${
                    suggestedDates.priority === 'critical' ? 'text-red-900' : 'text-blue-900'
                  }`}>
                    <span>{formatDate(suggestedDates.from_date)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{formatDate(suggestedDates.to_date)}</span>
                  </div>
                  
                  {suggestedDates.lastSettlement && (
                    <p className={`text-xs mt-2 ${
                      suggestedDates.priority === 'critical' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      Last settlement: {formatCurrency(suggestedDates.lastSettlement.net_amount)} 
                      ({suggestedDates.lastSettlement.trip_ids?.length || 0} trips)
                    </p>
                  )}
                  
                  {/* Show alternative ranges if available */}
                  {suggestedDates.alternativeRanges && suggestedDates.alternativeRanges.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 mb-2">
                        Other unsettled date ranges found:
                      </p>
                      <div className="space-y-1">
                        {suggestedDates.alternativeRanges.slice(0, 2).map((range, index) => (
                          <div key={index} className="flex items-center justify-between text-xs text-blue-600">
                            <span>
                              {formatDate(range.from_date)} → {formatDate(range.to_date)}
                            </span>
                            <span className="font-medium">{range.trip_count} trips</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUseSuggestion}
                  className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                    suggestedDates.priority === 'critical'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Use This Range
                </button>
              </div>
            </motion.div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                From Date *
              </label>
              <input
                type="date"
                value={formData.from_date}
                onChange={(e) => {
                  setFormData({ ...formData, from_date: e.target.value });
                  setCalculation(null);
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                To Date *
              </label>
              <input
                type="date"
                value={formData.to_date}
                onChange={(e) => {
                  setFormData({ ...formData, to_date: e.target.value });
                  setCalculation(null);
                }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Date Range Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Quick select:</span>
            {[
              { label: 'This Month', days: 'current_month' },
              { label: 'Last Month', days: 'last_month' },
              { label: 'Last 30 Days', days: 30 },
              { label: 'Last 90 Days', days: 90 }
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  const today = new Date();
                  let fromDate, toDate;

                  if (option.days === 'current_month') {
                    fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    toDate = today;
                  } else if (option.days === 'last_month') {
                    fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    toDate = new Date(today.getFullYear(), today.getMonth(), 0);
                  } else {
                    fromDate = new Date(today);
                    fromDate.setDate(today.getDate() - option.days);
                    toDate = today;
                  }

                  setFormData({
                    ...formData,
                    from_date: fromDate.toISOString().split('T')[0],
                    to_date: toDate.toISOString().split('T')[0]
                  });
                  setCalculation(null);
                  setShowDateSuggestion(false);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading || !formData.owner_B_id || !formData.from_date || !formData.to_date}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg disabled:shadow-none"
          >
            <Calculator className="h-5 w-5" />
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Calculating...
              </>
            ) : (
              'Calculate Settlement'
            )}
          </button>

          {/* Calculation Results */}
          {calculation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Alert */}
              {calculation.trip_count === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">No Trips Found</h4>
                      <p className="text-sm text-yellow-700">
                        There are no trips in the selected date range. Please try a different date range.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Calculation Complete</h4>
                      <p className="text-sm text-green-700">
                        Found {calculation.trip_count} trips in the selected period
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Settlement Summary
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">My Trips for Partner</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculation.trip_categories?.my_trips_for_partner?.total_amount || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Truck className="h-3 w-3" />
                      {calculation.trip_categories?.my_trips_for_partner?.count || 0} trips
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Partner Trips for Me</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculation.trip_categories?.partner_trips_for_me?.total_amount || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Truck className="h-3 w-3" />
                      {calculation.trip_categories?.partner_trips_for_me?.count || 0} trips
                    </p>
                  </div>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-md border-2 border-blue-300">
                  <p className="text-sm text-blue-600 mb-2 font-semibold">Net Settlement Amount</p>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {formatCurrency(calculation.net_amount)}
                  </p>
                  <p className="text-base text-blue-700 font-medium">
                    {calculation.amount_breakdown.net_payable_by === 'owner_A' 
                      ? `You owe ${selectedPartner?.name}` 
                      : `${selectedPartner?.name} owes you`}
                  </p>
                </div>

                {calculation.trip_count > 0 && (
                  <button
                    onClick={handleCreate}
                    className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Create Settlement
                  </button>
                )}
              </div>

              {/* Detailed Trip Breakdown Tabs */}
              {calculation.trip_count > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {[
                        { id: 'summary', label: 'All Trips', count: calculation.trip_breakdown?.length },
                        { id: 'my-trips', label: `My Trips`, count: calculation.trip_categories?.my_trips_for_partner?.trips?.length },
                        { id: 'partner-trips', label: `Partner Trips`, count: calculation.trip_categories?.partner_trips_for_me?.trips?.length }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.label} ({tab.count || 0})
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6 max-h-96 overflow-y-auto">
                    {activeTab === 'summary' && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900 mb-4">All Trips</h5>
                        {calculation.trip_breakdown.map((trip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                trip.direction === 'a_to_b' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {trip.direction === 'a_to_b' ? 'You → Partner' : 'Partner → You'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{trip.trip_number}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  {trip.material_name}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {trip.location}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(trip.trip_date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-lg">{formatCurrency(trip.amount)}</p>
                              <p className="text-sm text-gray-600">
                                {trip.payable_by === 'owner_A' ? 'You pay' : 'Partner pays'}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'my-trips' && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900 mb-4">
                          My Trips Delivered to {selectedPartner?.name}
                        </h5>
                        {calculation.trip_categories?.my_trips_for_partner?.trips?.map((trip, index) => (
                          <TripDetailCard key={index} trip={trip} type="my_trip" />
                        ))}
                        {(!calculation.trip_categories?.my_trips_for_partner?.trips || calculation.trip_categories.my_trips_for_partner.trips.length === 0) && (
                          <p className="text-gray-500 text-center py-8">No trips found</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'partner-trips' && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900 mb-4">
                          {selectedPartner?.name}'s Trips Delivered to Me
                        </h5>
                        {calculation.trip_categories?.partner_trips_for_me?.trips?.map((trip, index) => (
                          <TripDetailCard key={index} trip={trip} type="partner_trip" />
                        ))}
                        {(!calculation.trip_categories?.partner_trips_for_me?.trips || calculation.trip_categories.partner_trips_for_me.trips.length === 0) && (
                          <p className="text-gray-500 text-center py-8">No trips found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Settlement Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes about this settlement..."
                />
              </div>
            </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            type === 'my_trip' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {type === 'my_trip' ? 'You → Partner' : 'Partner → You'}
          </div>
          <div>
            <p className="font-bold text-gray-900">{trip.trip_number}</p>
            <p className="text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-gray-900">{formatCurrency(trip.customer_amount)}</p>
          <p className="text-sm text-gray-600">
            {type === 'my_trip' ? 'Partner pays you' : 'You pay partner'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600 flex items-center gap-1">
            <Package className="h-3 w-3" />
            Material
          </p>
          <p className="font-medium text-gray-900">{trip.material_name}</p>
        </div>
        <div>
          <p className="text-gray-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location
          </p>
          <p className="font-medium text-gray-900">{trip.location}</p>
        </div>
      </div>

      {trip.notes && (
        <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Notes:</strong> {trip.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CreateSettlementForm;