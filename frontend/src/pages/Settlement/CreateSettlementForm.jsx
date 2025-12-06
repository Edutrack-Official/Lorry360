
import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  Clock,
  FileText,
  Sparkles
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

  // Auto-suggest dates when partner is selected
  useEffect(() => {
    if (formData.owner_B_id) {
      fetchSmartDateSuggestions(formData.owner_B_id);
    }
  }, [formData.owner_B_id]);

  const fetchSmartDateSuggestions = async (partnerId) => {
    try {
      setLoading(true);
      const response = await api.post('/settlements/date-suggestions', {
        owner_B_id: partnerId
      });

      const data = response.data.data;
      
      if (data.suggestion_type === 'unsettled_trips') {
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
        
        setFormData(prev => ({
          ...prev,
          from_date: suggestion.from_date,
          to_date: suggestion.to_date
        }));
      } else if (data.suggestion_type === 'continuation') {
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
        
        setFormData(prev => ({
          ...prev,
          from_date: suggestion.from_date,
          to_date: suggestion.to_date
        }));
      } else {
        const suggestion = {
          from_date: data.suggested_range.from_date,
          to_date: data.suggested_range.to_date,
          reason: data.suggested_range.reason,
          trip_count: 0,
          note: data.suggested_range.note
        };

        setSuggestedDates(suggestion);
        setShowDateSuggestion(true);
        
        setFormData(prev => ({
          ...prev,
          from_date: suggestion.from_date,
          to_date: suggestion.to_date
        }));
      }
    } catch (error) {
      console.error('Failed to fetch date suggestions:', error);
      fallbackDateSuggestion(partnerId);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl w-full max-w-6xl my-4 mx-2 sm:mx-4 shadow-2xl z-50"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Create New Settlement
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white rounded-xl transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto relative">
          {/* Partner Selection */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Collaborative Partner *
            </label>
            <div className="relative">
              <select
                value={formData.owner_B_id}
                onChange={(e) => {
                  setFormData({ ...formData, owner_B_id: e.target.value });
                  setCalculation(null);
                }}
                className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base font-medium bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                  backgroundPosition: 'right 0.75rem center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '1.5em 1.5em', 
                  paddingRight: '2.5rem' 
                }}
              >
                <option value="">Select a partner</option>
                {partners.map(partner => (
                  <option key={partner._id} value={partner._id}>
                    {partner.name} - {partner.company_name}
                  </option>
                ))}
              </select>
            </div>
            {selectedPartner && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center gap-2 flex-wrap">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{selectedPartner.phone && selectedPartner.phone}</span>
                  {selectedPartner.email && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="break-all">{selectedPartner.email}</span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Date Suggestion Alert */}
          <AnimatePresence>
            {showDateSuggestion && suggestedDates && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border-2 rounded-xl p-4 ${
                  suggestedDates.priority === 'critical' 
                    ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
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
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className={`text-sm font-bold ${
                        suggestedDates.priority === 'critical' ? 'text-red-900' : 'text-blue-900'
                      }`}>
                        Suggested Date Range
                      </h4>
                      {suggestedDates.priority === 'critical' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800">
                          CRITICAL
                        </span>
                      )}
                      {suggestedDates.trip_count > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800">
                          {suggestedDates.trip_count} unsettled
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 font-medium ${
                      suggestedDates.priority === 'critical' ? 'text-red-700' : 'text-blue-700'
                    }`}>
                      {suggestedDates.reason}
                    </p>
                    
                    {suggestedDates.note && (
                      <p className={`text-xs mb-2 ${
                        suggestedDates.priority === 'critical' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        ⚠️ {suggestedDates.note}
                      </p>
                    )}
                    
                    <div className={`flex flex-wrap items-center gap-2 text-base font-bold mb-2 ${
                      suggestedDates.priority === 'critical' ? 'text-red-900' : 'text-blue-900'
                    }`}>
                      <span className="truncate">{formatDate(suggestedDates.from_date)}</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(suggestedDates.to_date)}</span>
                    </div>
                    
                    {suggestedDates.lastSettlement && (
                      <p className={`text-xs ${
                        suggestedDates.priority === 'critical' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        Last: {formatCurrency(suggestedDates.lastSettlement.net_amount)} 
                        ({suggestedDates.lastSettlement.trip_ids?.length || 0} trips)
                      </p>
                    )}
                    
                    {suggestedDates.alternativeRanges && suggestedDates.alternativeRanges.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs font-bold text-blue-700 mb-2">
                          Other available ranges:
                        </p>
                        <div className="space-y-1">
                          {suggestedDates.alternativeRanges.slice(0, 2).map((range, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-blue-700 bg-white/50 p-2 rounded-lg">
                              <span className="truncate">
                                {formatDate(range.from_date)} → {formatDate(range.to_date)}
                              </span>
                              <span className="font-bold ml-2 flex-shrink-0">({range.trip_count})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleUseSuggestion}
                    className={`w-full sm:w-auto px-4 py-2.5 text-white rounded-xl transition-all text-sm font-bold whitespace-nowrap shadow-md hover:shadow-lg ${
                      suggestedDates.priority === 'critical'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    Use Range
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
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
                className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
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
                className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Quick Date Range Buttons */}
          <div className="space-y-2">
            <span className="text-sm text-gray-600 font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Quick select:
            </span>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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
                  className="px-4 py-2.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-semibold shadow-sm hover:shadow-md"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading || !formData.owner_B_id || !formData.from_date || !formData.to_date}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg disabled:shadow-none text-base sm:text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="h-5 w-5" />
                Calculate Settlement
              </>
            )}
          </button>

          {/* Calculation Results */}
          <AnimatePresence>
            {calculation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Summary Alert */}
                {calculation.trip_count === 0 ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-yellow-900 mb-1 text-base">No Trips Found</h4>
                        <p className="text-sm text-yellow-700">
                          There are no trips in the selected date range. Please try a different date range.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-green-900 mb-1 text-base">Calculation Complete</h4>
                        <p className="text-sm text-green-700">
                          Found <span className="font-bold">{calculation.trip_count}</span> trips in the selected period
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Section */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                  <h4 className="font-bold text-gray-900 mb-4 text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Settlement Summary
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 sm:p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border-2 border-green-200">
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 font-semibold">My Trips for Partner</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600 mb-1 truncate">
                        {formatCurrency(calculation.trip_categories?.my_trips_for_partner?.total_amount || 0)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Truck className="h-4 w-4" />
                        {calculation.trip_categories?.my_trips_for_partner?.count || 0} trips
                      </p>
                    </div>
                    <div className="text-center p-4 sm:p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border-2 border-blue-200">
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 font-semibold">Partner Trips for Me</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 truncate">
                        {formatCurrency(calculation.trip_categories?.partner_trips_for_me?.total_amount || 0)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Truck className="h-4 w-4" />
                        {calculation.trip_categories?.partner_trips_for_me?.count || 0} trips
                      </p>
                    </div>
                  </div>

                  <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-xl border-2 border-blue-300">
                    <p className="text-sm text-blue-600 mb-2 font-bold">Net Settlement Amount</p>
                    <p className="text-3xl sm:text-5xl font-bold text-blue-600 mb-3 break-all">
                      {formatCurrency(calculation.net_amount)}
                    </p>
                  <p className="text-sm sm:text-base text-blue-700 font-semibold">
                  {calculation.amount_breakdown.net_payable_by === 'owner_A' 
                    ? `💸 You pay ${selectedPartner?.name}` 
                    : `💰 ${selectedPartner?.name} pays you`}
                </p>
                        </div>

                  {calculation.trip_count > 0 && (
                    <button
                      onClick={handleCreate}
                      className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold shadow-lg hover:shadow-xl text-base"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Create Settlement
                    </button>
                  )}
                </div>

                {/* Detailed Trip Breakdown Tabs */}
                {calculation.trip_count > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200 overflow-x-auto">
                      <nav className="flex min-w-max px-2 sm:px-6">
                        {[
                          { id: 'summary', label: 'All', count: calculation.trip_breakdown?.length },
                          { id: 'my-trips', label: `My Trips`, count: calculation.trip_categories?.my_trips_for_partner?.trips?.length },
                          { id: 'partner-trips', label: `Partner`, count: calculation.trip_categories?.partner_trips_for_me?.trips?.length }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-3 sm:px-6 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${
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

                    <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
                      {activeTab === 'summary' && (
                        <div className="space-y-3">
                          <h5 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">All Trips</h5>
                          {calculation.trip_breakdown.map((trip, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md transition-all border border-gray-200"
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                                <div className={`p-2 rounded-xl flex-shrink-0 text-xs font-bold ${
                                  trip.direction === 'a_to_b' 
                                    ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700' 
                                    : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'
                                }`}>
                                  {trip.direction === 'a_to_b' ? 'You→P' : 'P→You'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{trip.trip_number}</p>
                                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate">
                                    <Package className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{trip.material_name}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{trip.location}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{formatDate(trip.trip_date)}</p>
                                </div>
                              </div>
                              <div className="text-right self-end sm:self-center">
                                <p className="font-bold text-gray-900 text-base sm:text-lg">{formatCurrency(trip.amount)}</p>
                                <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                  {trip.payable_by === 'owner_A' ? 'You pay' : 'Partner pays'}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'my-trips' && (
                        <div className="space-y-3">
                          <h5 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
                            My Trips to {selectedPartner?.name}
                          </h5>
                          {calculation.trip_categories?.my_trips_for_partner?.trips?.map((trip, index) => (
                            <TripDetailCard key={index} trip={trip} type="my_trip" />
                          ))}
                          {(!calculation.trip_categories?.my_trips_for_partner?.trips || calculation.trip_categories.my_trips_for_partner.trips.length === 0) && (
                            <div className="text-center py-12 text-gray-500">
                              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No trips found</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'partner-trips' && (
                        <div className="space-y-3">
                          <h5 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
                            {selectedPartner?.name}'s Trips to Me
                          </h5>
                          {calculation.trip_categories?.partner_trips_for_me?.trips?.map((trip, index) => (
                            <TripDetailCard key={index} trip={trip} type="partner_trip" />
                          ))}
                          {(!calculation.trip_categories?.partner_trips_for_me?.trips || calculation.trip_categories.partner_trips_for_me.trips.length === 0) && (
                            <div className="text-center py-12 text-gray-500">
                              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No trips found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {calculation && calculation.trip_count > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Settlement Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Add any additional notes about this settlement..."
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 rounded-xl flex-shrink-0 text-xs font-bold ${
            type === 'my_trip' 
              ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700' 
              : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'
          }`}>
            {type === 'my_trip' ? 'You→P' : 'P→You'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{trip.trip_number}</p>
            <p className="text-xs sm:text-sm text-gray-600">{formatDate(trip.trip_date)}</p>
          </div>
        </div>
        <div className="text-right self-end sm:self-center">
          <p className="font-bold text-lg sm:text-xl text-gray-900">{formatCurrency(trip.customer_amount)}</p>
          <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            {type === 'my_trip' ? 'Partner pays' : 'You pay'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-gray-600 flex items-center gap-1 mb-1 text-xs font-semibold">
            <Package className="h-3 w-3" />
            Material
          </p>
          <p className="font-bold text-gray-900 truncate">{trip.material_name}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-gray-600 flex items-center gap-1 mb-1 text-xs font-semibold">
            <MapPin className="h-3 w-3" />
            Location
          </p>
          <p className="font-bold text-gray-900 truncate">{trip.location}</p>
        </div>
      </div>

      {trip.notes && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong className="font-bold">Notes:</strong> {trip.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CreateSettlementForm;