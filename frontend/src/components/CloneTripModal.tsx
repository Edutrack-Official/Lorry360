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
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Filter as FilterIcon,
  ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CloneTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (data: {
    times: number;
    resetStatus: boolean;
    resetDate: boolean;
    newTripDate?: string;
  }) => Promise<void>;
  selectedTrips: Array<{ id: string; tripNumber: string }>;
}

const CloneTripModal: React.FC<CloneTripModalProps> = ({
  isOpen,
  onClose,
  onClone,
  selectedTrips = []
}) => {
  const [cloneCount, setCloneCount] = useState<string>("1");
  const [resetStatus, setResetStatus] = useState(true);
  const [resetDate, setResetDate] = useState(false);
  const [newTripDate, setNewTripDate] = useState<string>("");
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    if (resetDate && !newTripDate) {
      const today = new Date().toISOString().split('T')[0];
      setNewTripDate(today);
    }
  }, [resetDate, newTripDate]);

  if (!isOpen) return null;

  const handleClone = async () => {
    const count = parseInt(cloneCount);

    if (isNaN(count) || count < 1 || count > 100) {
      toast.error('Please enter a valid number between 1 and 100');
      return;
    }

    if (resetDate && !newTripDate) {
      toast.error('Please select a date when reset date is enabled');
      return;
    }

    const cloneData = {
      times: count,
      resetStatus,
      resetDate,
      newTripDate: resetDate ? newTripDate : undefined
    };

    setIsCloning(true);
    try {
      await onClone(cloneData);
      onClose();
      setCloneCount("1");
      setResetStatus(true);
      setResetDate(false);
      setNewTripDate("");
    } catch (error) {
      console.error('Clone failed:', error);
    } finally {
      setIsCloning(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTripDate(e.target.value);
  };

  const handleCloneCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setCloneCount("");
      return;
    }

    if (/^\d*$/.test(value)) {
      const num = parseInt(value);
      if (!isNaN(num) && num >= 1 && num <= 100) {
        setCloneCount(value);
      } else if (value === "") {
        setCloneCount("");
      }
    }
  };

  const handleIncrement = () => {
    const current = parseInt(cloneCount) || 1;
    if (current < 100) {
      setCloneCount((current + 1).toString());
    }
  };

  const handleDecrement = () => {
    const current = parseInt(cloneCount) || 1;
    if (current > 1) {
      setCloneCount((current - 1).toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Copy className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Clone {selectedTrips.length} Selected Trip{selectedTrips.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create multiple copies of selected trips with new trip numbers.
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

          <div className="px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of copies for each selected trip
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={parseInt(cloneCount) <= 1}
                        className="px-3 py-3 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">−</span>
                      </button>

                      <input
                        type="text"
                        value={cloneCount}
                        onChange={handleCloneCountChange}
                        onBlur={() => {
                          if (!cloneCount || isNaN(parseInt(cloneCount)) || parseInt(cloneCount) < 1) {
                            setCloneCount("1");
                          }
                        }}
                        className="flex-1 w-full px-2 py-3 text-center border-0 focus:ring-0 focus:outline-none"
                        placeholder="Enter number"
                      />

                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={parseInt(cloneCount) >= 100}
                        className="px-3 py-3 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum 100 copies at a time. Each copy will have a new trip number.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reset Status</p>
                    <p className="text-xs text-gray-500">Set all cloned trips to "Scheduled" status</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetStatus(!resetStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${resetStatus ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${resetStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reset Trip Date</p>
                    <p className="text-xs text-gray-500">Set new trip date for all cloned trips</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetDate(!resetDate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${resetDate ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${resetDate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {resetDate && (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Trip Date
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={newTripDate}
                      onChange={handleDateChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This date will be applied to all cloned trips.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isCloning}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={isCloning || !cloneCount}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCloning ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cloning...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Clone {cloneCount || "1"} {parseInt(cloneCount) === 1 ? 'Time' : 'Times'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloneTripModal;