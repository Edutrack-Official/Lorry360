import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Fuel, Calendar, Truck, IndianRupee, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Expense {
  _id: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  payment_mode: string;
  lorry_id: {
    _id: string;
    registration_number: string;
    nick_name?: string;
  };
  bunk_id: {
    _id: string;
    bunk_name: string;
    address?: string;
  };
  fuel_quantity?: number;
  fuel_price_per_liter?: number;
  odometer_reading?: number;
  previous_odometer_reading?: number;
}

const BunkExpenses = () => {
  const { bunkId } = useParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const fetchBunkExpenses = async () => {
    if (!bunkId) return;
    
    try {
      const expensesRes = await api.get(`/expenses/bunk/${bunkId}`);
      
      // The response structure from your backend is:
      // { success: true, data: { expenses: [...], total_fuel_expenses: X, total_amount: Y, etc. }}
      const responseData = expensesRes.data.data;
      const bunkExpenses = responseData?.expenses || [];
      
      console.log("Fetched bunk fuel expenses:", bunkExpenses);
      setExpenses(bunkExpenses);
    } catch (error: any) {
      console.error("Failed to fetch bunk expenses:", error);
      toast.error(error.response?.data?.error || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bunkId) {
      fetchBunkExpenses();
    }
  }, [bunkId]);

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

  const getPaymentModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Transfer',
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      other: 'Other'
    };
    return labels[mode] || mode.replace('_', ' ').toUpperCase();
  };

  const getPaymentModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-100 text-green-800 border-green-200',
      bank: 'bg-blue-100 text-blue-800 border-blue-200',
      bank_transfer: 'bg-blue-100 text-blue-800 border-blue-200',
      upi: 'bg-purple-100 text-purple-800 border-purple-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[mode] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const calculateFuelCostBreakdown = (expense: Expense) => {
    if (expense.fuel_quantity && expense.fuel_price_per_liter) {
      const calculatedAmount = expense.fuel_quantity * expense.fuel_price_per_liter;
      return {
        amount: calculatedAmount,
        breakdown: `${expense.fuel_quantity}L × ₹${expense.fuel_price_per_liter}/L`
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Fuel className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No fuel expenses found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
   

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses.map((expense) => {
          const fuelBreakdown = calculateFuelCostBreakdown(expense);
          
          return (
            <div 
              key={expense._id} 
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900">
                      Fuel Expense
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentModeColor(expense.payment_mode)}`}>
                  {getPaymentModeLabel(expense.payment_mode)}
                </span>
              </div>

              {/* Vehicle and Bunk Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {expense.lorry_id?.registration_number}
                      {expense.lorry_id?.nick_name && ` (${expense.lorry_id.nick_name})`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-600">Bunk:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {expense.bunk_id?.bunk_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fuel Details */}
              {/* <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                {expense.fuel_quantity && (
                  <div>
                    <span className="text-gray-600">Fuel Quantity:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {expense.fuel_quantity} liters
                    </span>
                  </div>
                )}
                
                {expense.fuel_price_per_liter && (
                  <div>
                    <span className="text-gray-600">Price/Liter:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      ₹{expense.fuel_price_per_liter}
                    </span>
                  </div>
                )}
              </div> */}

              {/* Odometer Readings */}
              {/* {(expense.odometer_reading || expense.previous_odometer_reading) && (
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  {expense.previous_odometer_reading && (
                    <div>
                      <span className="text-gray-600">Previous Odometer:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {expense.previous_odometer_reading} km
                      </span>
                    </div>
                  )}
                  {expense.odometer_reading && (
                    <div>
                      <span className="text-gray-600">Current Odometer:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {expense.odometer_reading} km
                      </span>
                    </div>
                  )}
                </div>
              )} */}

              {/* Description */}
              {expense.description && (
                <div className="mb-3 text-sm">
                  <span className="text-gray-600">Description:</span>
                  <p className="text-gray-900 mt-1">{expense.description}</p>
                </div>
              )}

              {/* Amount */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(expense.amount)}
                    </div>
                    {fuelBreakdown && (
                      <div className="text-xs text-gray-500 mt-1">
                        {fuelBreakdown.breakdown}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedExpense(expense)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/expenses/edit/${expense._id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Expense"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expense Details Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Fuel className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Fuel Expense Details</h2>
                    <p className="text-sm text-gray-600">{formatDate(selectedExpense.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Vehicle Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Vehicle Information</h3>
                  <p className="text-gray-700">
                    {selectedExpense.lorry_id?.registration_number}
                    {selectedExpense.lorry_id?.nick_name && ` (${selectedExpense.lorry_id.nick_name})`}
                  </p>
                </div>

                {/* Bunk Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Fuel Bunk</h3>
                  <p className="text-gray-700">{selectedExpense.bunk_id?.bunk_name}</p>
                  {selectedExpense.bunk_id?.address && (
                    <p className="text-sm text-gray-600 mt-1">{selectedExpense.bunk_id.address}</p>
                  )}
                </div>

                {/* Fuel Details */}
                {/* <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Fuel Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedExpense.fuel_quantity && (
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium text-gray-900">{selectedExpense.fuel_quantity} liters</p>
                      </div>
                    )}
                    {selectedExpense.fuel_price_per_liter && (
                      <div>
                        <p className="text-sm text-gray-600">Price per Liter</p>
                        <p className="font-medium text-gray-900">₹{selectedExpense.fuel_price_per_liter}</p>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Payment Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Payment Mode</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedExpense.payment_mode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedExpense.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedExpense.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedExpense.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BunkExpenses;