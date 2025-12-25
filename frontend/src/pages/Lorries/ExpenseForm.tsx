import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { Save, X, Truck, Calendar, FileText, Loader2, Building2, Fuel, Upload, File, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

interface ExpenseFormData {
  lorry_id: string;
  date: string;
  category: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'fine' | 'other';
  amount: number;
  description: string;
  payment_mode: 'cash' | 'bank' | 'upi' | 'credit';
  bunk_id?: string;
  proof?: File | null;
}

interface FormErrors {
  lorry_id?: string;
  date?: string;
  category?: string;
  amount?: string;
  payment_mode?: string;
  bunk_id?: string;
  proof?: string;
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
}

interface Bunk {
  _id: string;
  bunk_name: string;
  address?: string;
}

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const [searchParams] = useSearchParams();
  const lorryId = searchParams.get('lorry');
  const bunkId = searchParams.get('bunk');

  const [formData, setFormData] = useState<ExpenseFormData>({
    lorry_id: lorryId || '',
    date: new Date().toISOString().split('T')[0],
    category: bunkId ? 'fuel' : 'fuel',
    amount: 0,
    description: '',
    payment_mode: 'cash',
    bunk_id: bunkId || '',
    proof: null,
  });

  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [bunks, setBunks] = useState<Bunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [lorryName, setLorryName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showFuelDetails, setShowFuelDetails] = useState(false);
  const [existingProofUrl, setExistingProofUrl] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

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

  // Show/hide fuel details based on category
  useEffect(() => {
    setShowFuelDetails(formData.category === 'fuel');
  }, [formData.category]);

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        // Only fetch lorries if no specific lorry is selected
        if (!lorryId) {
          await fetchLorries();
        }

        // Always fetch bunks for fuel category
        await fetchBunks();

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

  const fetchBunks = async () => {
    try {
      const res = await api.get('/petrol-bunks');
      setBunks(res.data.data?.petrolBunks || []);
    } catch (error: any) {
      toast.error('Failed to fetch bunks');
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
        payment_mode: expense.payment_mode,
        bunk_id: expense.bunk_id?._id || expense.bunk_id || '',
        proof: null,
      });

      // Store existing proof URL
      if (expense.proof) {
        setExistingProofUrl(expense.proof);
      }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Only take first file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'application/pdf'
    ];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images (JPEG, PNG, GIF, WebP, HEIC) and PDF files are allowed');
      e.target.value = '';
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({
      ...prev,
      proof: file
    }));

    // Clear any proof errors
    if (errors.proof) {
      setErrors(prev => ({ ...prev, proof: undefined }));
    }

    // Reset the input
    e.target.value = '';
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      proof: null
    }));
    setExistingProofUrl(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    return <File className="h-5 w-5 text-red-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.lorry_id) {
      newErrors.lorry_id = "Please select a lorry";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.payment_mode) {
      newErrors.payment_mode = "Payment mode is required";
    }

    // Fuel-specific validations
    if (formData.category === 'fuel') {
      if (!formData.bunk_id) {
        newErrors.bunk_id = "Please select a bunk for fuel expense";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();
      
      // Append all form fields
      submitFormData.append('lorry_id', formData.lorry_id);
      submitFormData.append('date', formData.date);
      submitFormData.append('category', formData.category);
      submitFormData.append('amount', formData.amount.toString());
      submitFormData.append('description', formData.description);
      submitFormData.append('payment_mode', formData.payment_mode);

      // Append bunk_id only for fuel category
      if (formData.category === 'fuel' && formData.bunk_id) {
        submitFormData.append('bunk_id', formData.bunk_id);
      }

      // Append proof file if selected
      if (formData.proof) {
        submitFormData.append('proof', formData.proof);
      }

      if (isEditing) {
        await api.put(`/expenses/update/${expenseId}`, submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Expense updated successfully');
      } else {
        await api.post('/expenses/create', submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Expense created successfully');
      }

      // Navigate back based on where we came from
      if (formData.bunk_id) {
        navigate(`/lorries/${formData.lorry_id}/expenses`);
      } else if (formData.lorry_id) {
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

    // Handle number inputs
    const numericFields = ['amount'];

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
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
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
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
              <>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {lorryName || "Loading..."}
                </div>
                <input type="hidden" name="lorry_id" value={formData.lorry_id} />
              </>
            ) : (
              <>
                <select
                  name="lorry_id"
                  value={formData.lorry_id}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.lorry_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Lorry</option>
                  {lorries.map(lorry => (
                    <option key={lorry._id} value={lorry._id}>
                      {lorry.registration_number}
                      {lorry.nick_name && ` (${lorry.nick_name})`}
                    </option>
                  ))}
                </select>
                {errors.lorry_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <span className="text-red-500 font-bold">•</span>
                    {errors.lorry_id}
                  </p>
                )}
              </>
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
              max={today}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.date && (
              <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                <span className="text-red-500 font-bold">•</span>
                {errors.date}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="toll">Toll</option>
              <option value="fine">Fine</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                <span className="text-red-500 font-bold">•</span>
                {errors.category}
              </p>
            )}
          </div>

          {/* Fuel Details Section - Only shown when category is fuel */}
          {showFuelDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Fuel Details</h3>
              </div>

              {/* Bunk Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  Fuel Bunk *
                </label>
                <select
                  name="bunk_id"
                  value={formData.bunk_id || ''}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bunk_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Fuel Bunk</option>
                  {bunks.map(bunk => (
                    <option key={bunk._id} value={bunk._id}>
                      {bunk.bunk_name}
                      {bunk.address && ` - ${bunk.address.substring(0, 30)}${bunk.address.length > 30 ? '...' : ''}`}
                    </option>
                  ))}
                </select>
                {errors.bunk_id && (
                  <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <span className="text-red-500 font-bold">•</span>
                    {errors.bunk_id}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                formData.category === 'fuel'
                  ? ['cash', 'bank', 'upi', 'credit'] as const
                  : ['cash', 'bank', 'upi'] as const
              ).map(mode => (
                <label
                  key={mode}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.payment_mode === mode
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : errors.payment_mode
                      ? 'border-red-300 bg-white hover:bg-gray-50'
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
            {errors.payment_mode && (
              <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                {errors.payment_mode}
              </p>
            )}
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Enter expense details..."
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-2" />
              Proof Document (Optional)
            </label>
            <div className="space-y-3">
              {/* Show existing proof or upload button */}
              {!formData.proof && !existingProofUrl ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Images (PNG, JPG, GIF, WebP, HEIC) or PDF (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {formData.proof ? 'New File Selected' : 'Current Proof'}
                  </p>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {formData.proof ? (
                        <>
                          {getFileIcon(formData.proof)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {formData.proof.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(formData.proof.size)}
                            </p>
                          </div>
                        </>
                      ) : existingProofUrl ? (
                        <>
                          <File className="h-5 w-5 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              Existing Proof Document
                            </p>
                            <a
                              href={existingProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {!formData.proof && (
                    <label className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <Upload className="h-4 w-4" />
                      Replace with new file
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              )}

              {errors.proof && (
                <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                  <span className="text-red-500 font-bold">•</span>
                  {errors.proof}
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update Expense' : 'Create Expense'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none disabled:opacity-50"
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