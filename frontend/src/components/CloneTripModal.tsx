// components/CloneTripModal.tsx
import React, { useState } from 'react';
import { X, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CloneTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (times: number) => Promise<void>;
  tripNumber: string;
  tripId?: string;
  mode: 'single' | 'multiple' | 'bulk';
  selectedTrips?: Array<{ id: string; tripNumber: string }>;
}

const CloneTripModal: React.FC<CloneTripModalProps> = ({
  isOpen,
  onClose,
  onClone,
  tripNumber,
  tripId,
  mode,
  selectedTrips = []
}) => {
  const [cloneCount, setCloneCount] = useState(1);
  const [isCloning, setIsCloning] = useState(false);

  if (!isOpen) return null;

  const handleClone = async () => {
    if (cloneCount < 1 || cloneCount > 50) {
      toast.error('Please enter a valid number between 1 and 50');
      return;
    }

    setIsCloning(true);
    try {
      await onClone(cloneCount);
      onClose();
      setCloneCount(1);
    } catch (error) {
      console.error('Clone failed:', error);
    } finally {
      setIsCloning(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'single':
        return `Clone Trip: ${tripNumber}`;
      case 'multiple':
        return `Clone ${selectedTrips.length} Selected Trips`;
      case 'bulk':
        return 'Bulk Clone Trip';
      default:
        return 'Clone Trip';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'single':
        return 'Create multiple copies of this trip with new trip numbers.';
      case 'multiple':
        return `Each of the ${selectedTrips.length} selected trips will be cloned the specified number of times.`;
      case 'bulk':
        return 'Clone a single trip multiple times based on count.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Copy className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getTitle()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getDescription()}
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

          {/* Body */}
          <div className="px-6 py-5">
            {mode === 'multiple' && selectedTrips.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Selected Trips:</p>
                    <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                      {selectedTrips.map((trip, index) => (
                        <div key={trip.id} className="text-xs">
                          {index + 1}. {trip.tripNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of copies to create for {mode === 'single' ? 'this trip' : mode === 'multiple' ? 'each trip' : 'the trip'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={cloneCount}
                      onChange={(e) => setCloneCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of copies"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {cloneCount === 1 ? 'copy' : 'copies'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum 50 copies at a time. Each copy will have a new trip number.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
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
                disabled={isCloning}
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
                    Clone {cloneCount} {cloneCount === 1 ? 'Time' : 'Times'}
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