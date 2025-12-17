import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  ChevronDown,
  IndianRupee,
  TrendingDown,
  AlertTriangle,
  Filter as FilterIcon,
  ChevronUp,
} from "lucide-react";
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
  cloned_from?: string;
  clone_count?: number;
  isActive?: boolean;
  collab_trip_status?: 'pending' | 'approved' | 'rejected';
}

interface PriceChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: {
    update_customer_amount: boolean;
    extra_amount: number;
  }) => Promise<void>;
  selectedTrips: Array<{ id: string; tripNumber: string }>;
  tripsData: Trip[];
}

const PriceChangeModal: React.FC<PriceChangeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  selectedTrips = [],
  tripsData = []
}) => {
  const [updateCustomerAmount, setUpdateCustomerAmount] = useState(false);
  const [extraAmount, setExtraAmount] = useState<string>("0");
  const [isApplying, setIsApplying] = useState(false);

  const getDateRange = () => {
    if (selectedTrips.length === 0 || tripsData.length === 0) {
      return { earliest: null, latest: null };
    }

    const selectedTripsData = tripsData.filter(trip =>
      selectedTrips.some(selected => selected.id === trip._id)
    );

    if (selectedTripsData.length === 0) return { earliest: null, latest: null };

    const dates = selectedTripsData.map(trip => new Date(trip.trip_date));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));

    return { earliest, latest };
  };

  const getMaterialSummary = () => {
    if (selectedTrips.length === 0 || tripsData.length === 0) {
      return [];
    }

    const selectedTripsData = tripsData.filter(trip =>
      selectedTrips.some(selected => selected.id === trip._id)
    );

    const materialMap: Record<string, {
      count: number;
      totalUnits: number;
      totalCrusherAmount: number;
      crushers: Set<string>;
    }> = {};

    selectedTripsData.forEach(trip => {
      if (!materialMap[trip.material_name]) {
        materialMap[trip.material_name] = {
          count: 0,
          totalUnits: 0,
          totalCrusherAmount: 0,
          crushers: new Set()
        };
      }

      materialMap[trip.material_name].count += 1;
      materialMap[trip.material_name].totalUnits += trip.no_of_unit_crusher;
      materialMap[trip.material_name].totalCrusherAmount += trip.crusher_amount;
      materialMap[trip.material_name].crushers.add(trip.crusher_id.name);
    });

    return Object.entries(materialMap).map(([material, data]) => ({
      material,
      count: data.count,
      totalUnits: data.totalUnits,
      totalCrusherAmount: data.totalCrusherAmount,
      crushers: Array.from(data.crushers).join(', ')
    }));
  };

  const handleApply = async () => {
    const extra = parseFloat(extraAmount);
    if (isNaN(extra) || extra < 0) {
      toast.error('Please enter a valid extra amount');
      return;
    }

    if (extra > 1000000) {
      toast.error('Extra amount cannot exceed ₹10,00,000');
      return;
    }

    setIsApplying(true);
    try {
      await onApply({
        update_customer_amount: updateCustomerAmount,
        extra_amount: extra
      });
      onClose();
      setUpdateCustomerAmount(false);
      setExtraAmount("0");
    } catch (error) {
      console.error('Price change failed:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleExtraAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setExtraAmount("");
      return;
    }

    if (/^\d*\.?\d*$/.test(value)) {
      setExtraAmount(value);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const { earliest, latest } = getDateRange();
  const materialSummary = getMaterialSummary();
  const totalCrusherAmount = materialSummary.reduce((sum, item) => sum + item.totalCrusherAmount, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Apply Price Change to {selectedTrips.length} Trip{selectedTrips.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update trip prices based on current crusher material rates
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

          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Selected Trips Summary</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Total Trips</p>
                    <p className="font-bold text-lg text-blue-900">{selectedTrips.length}</p>
                  </div>

                  {earliest && latest && (
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Date Range</p>
                      <p className="font-medium text-blue-900">
                        {earliest.getTime() === latest.getTime()
                          ? formatDate(earliest)
                          : `${formatDate(earliest)} - ${formatDate(latest)}`
                        }
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-blue-600 mb-1">Total Crusher Amount</p>
                    <p className="font-bold text-lg text-blue-900">
                      {formatCurrency(totalCrusherAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-blue-600 mb-1">Materials</p>
                    <p className="font-medium text-blue-900">
                      {materialSummary.length} type{materialSummary.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {materialSummary.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-semibold text-gray-900">Material Breakdown</h4>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-40 overflow-y-auto">
                    {materialSummary.map((item, index) => (
                      <div key={index} className="px-4 py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{item.material}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.count} trip{item.count > 1 ? 's' : ''} • {item.totalUnits} units • {item.crushers}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(item.totalCrusherAmount)}</p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.totalCrusherAmount / item.count)} avg.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 mb-1">Important Note</p>
                    <p className="text-sm text-amber-800">
                      This will update all selected trips with current crusher material prices. Each trip's rate per unit will be updated to match the current price in the crusher's material list.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <TrendingUp className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">Update Customer Amount</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Add price difference to customer amount along with extra amount
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUpdateCustomerAmount(!updateCustomerAmount);
                    if (!updateCustomerAmount) {
                      setExtraAmount("0");
                    }
                  }}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${updateCustomerAmount ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  role="switch"
                  aria-checked={updateCustomerAmount}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${updateCustomerAmount ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {updateCustomerAmount && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-gray-600" />
                      <label className="text-sm font-medium text-gray-900">
                        Extra Amount to Add
                      </label>
                    </div>
                    <span className="text-xs text-gray-500">Per trip</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="text"
                      value={extraAmount}
                      onChange={handleExtraAmountChange}
                      onBlur={() => {
                        if (!extraAmount || extraAmount === "" || parseFloat(extraAmount) < 0) {
                          setExtraAmount("0");
                        }
                      }}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    This amount will be added to customer amount for each selected trip.
                    Total extra amount: ₹{(parseFloat(extraAmount) * selectedTrips.length).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between">
              {/* <div className="text-sm text-gray-600">
                <span className="font-medium">Total trips affected:</span> {selectedTrips.length}
              </div> */}
              <div className="w-full flex justify-end items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={isApplying}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4" />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChangeModal;