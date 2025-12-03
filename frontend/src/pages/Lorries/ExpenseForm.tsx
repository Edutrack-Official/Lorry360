import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { Save, X, Truck, Calendar, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

interface ExpenseFormData {
  lorry_id: string;
  date: string;
  category: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'fine' | 'other';
  amount: number;
  description: string;
  payment_mode: 'cash' | 'bank' | 'upi';
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
}

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const [searchParams] = useSearchParams();
  const lorryId = searchParams.get('lorry');

  const [formData, setFormData] = useState<ExpenseFormData>({
    lorry_id: lorryId || '',
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    amount: 0,
    description: '',
    payment_mode: 'cash'
  });
  
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [lorryName, setLorryName] = useState("");

  // Get lorry name from localStorage (similar to TripForm)
  useEffect(() => {
    const selectedLorry = localStorage.getItem('selectedLorry');
    console.log('selectedLorry from localStorage:', selectedLorry);
    if (selectedLorry) {
      try {
        const lorry = JSON.parse(selectedLorry);
        if (lorry) {
          setLorryName(lorry.registration_number || lorry.nick_name || "Selected Lorry");
        } else {
          setLorryName("Lorry ID: " + lorryId);
        }
      } catch (error) {
        console.error('Error parsing selectedLorry from localStorage:', error);
        setLorryName("Lorry ID: " + lorryId);
      }
    } else {
      setLorryName("Lorry ID: " + lorryId);
    }
  }, [lorryId]);

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        // Only fetch lorries if no specific lorry is selected
        if (!lorryId) {
          await fetchLorries();
        }

        // If editing, fetch expense details
        if (expenseId) {
          setIsEditing(true);
          await fetchExpense();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [expenseId, lorryId]);

  const fetchLorries = async () => {
    try {
      const res = await api.get('/lorries');
      setLorries(res.data.data?.lorries || []);
    } catch (error: any) {
      toast.error('Failed to fetch lorries');
    }
  };

  const fetchExpense = async () => {
    try {
      const res = await api.get(`/expenses/${expenseId}`);
      const expense = res.data.data;
      setFormData({
        lorry_id: expense.lorry_id._id,
        date: expense.date.split('T')[0],
        category: expense.category,
        amount: expense.amount,
        description: expense.description || '',
        payment_mode: expense.payment_mode
      });

      // If editing and no lorryName set, use the expense's lorry info
      if (!lorryName && expense.lorry_id) {
        const lorryDisplay = expense.lorry_id.registration_number || 
                           expense.lorry_id.nick_name || 
                           "Lorry";
        setLorryName(lorryDisplay);
      }
    } catch (error: any) {
      toast.error('Failed to fetch expense details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.lorry_id) {
      toast.error('Please select a lorry');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/expenses/update/${expenseId}`, formData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses/create', formData);
        toast.success('Expense created successfully');
      }
      
      // Navigate back to lorry expenses page
      if (formData.lorry_id) {
        navigate(`/lorries/${formData.lorry_id}/expenses`);
      } else {
        navigate('/expenses');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update expense details' : 'Add a new expense for the lorry'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lorry Display/Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="h-4 w-4 inline mr-2" />
                Lorry *
              </label>
              {lorryId ? (
                // Display lorry name (read-only) when coming from lorry page
                <>
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {lorryName || "Loading..."}
                  </div>
                  <input type="hidden" name="lorry_id" value={formData.lorry_id} />
                </>
              ) : (
                // Show dropdown when creating expense from general expenses page
                <select
                  name="lorry_id"
                  value={formData.lorry_id}
                  onChange={handleChange}
                  required
                  className="w-full input input-bordered"
                >
                  <option value="">Select Lorry</option>
                  {lorries.map(lorry => (
                    <option key={lorry._id} value={lorry._id}>
                      {lorry.registration_number}
                      {lorry.nick_name && ` (${lorry.nick_name})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full input input-bordered"
              />
            </div>

            {/* Category and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full input input-bordered"
                >
                  <option value="fuel">Fuel</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="toll">Toll</option>
                  <option value="fine">Fine</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full input input-bordered"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['cash', 'bank', 'upi'] as const).map(mode => (
                  <label 
                    key={mode} 
                    className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.payment_mode === mode 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_mode"
                      value={mode}
                      checked={formData.payment_mode === mode}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="capitalize font-medium">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full input input-bordered resize-none"
                placeholder="Enter expense details..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Create Expense')}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;