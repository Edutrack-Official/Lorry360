import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Save, X, Truck, Calendar, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const { lorryId } = useParams(); // From query param or route

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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchLorries();
    if (expenseId) {
      setIsEditing(true);
      fetchExpense();
    }
  }, [expenseId]);

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
    } catch (error: any) {
      toast.error('Failed to fetch expense details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/expenses/update/${expenseId}`, formData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses/create', formData);
        toast.success('Expense created successfully');
      }
      navigate(`/lorries/${formData.lorry_id}/expenses`);
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lorry Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="h-4 w-4 inline mr-2" />
              Lorry
            </label>
            <select
              name="lorry_id"
              value={formData.lorry_id}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
              disabled={!!lorryId} // Disable if lorry is pre-selected
            >
              <option value="">Select Lorry</option>
              {lorries.map(lorry => (
                <option key={lorry._id} value={lorry._id}>
                  {lorry.registration_number}
                  {lorry.nick_name && ` (${lorry.nick_name})`}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
            />
          </div>

          {/* Category and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
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
                <DollarSign className="h-4 w-4 inline mr-2" />
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'bank', 'upi'] as const).map(mode => (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    name="payment_mode"
                    value={mode}
                    checked={formData.payment_mode === mode}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="capitalize">{mode}</span>
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
              className="input input-bordered w-full resize-none"
              placeholder="Enter expense details..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : (isEditing ? 'Update Expense' : 'Create Expense')}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;