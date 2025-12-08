import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Truck, User, Package, MapPin, Calendar, FileText } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface FormData {
  crusher_id: string;
  lorry_id: string;
  driver_id: string;
  customer_id: string;
  material_name: string;
  rate_per_unit: string;
  no_of_unit_crusher: string;
  no_of_unit_customer: string;
  crusher_amount: string;
  customer_amount: string;
  location: string;
  trip_date: string;
  dc_number: string;
  notes: string;
}

interface FormOptions {
  lorries: Array<{ _id: string; registration_number: string; nick_name?: string }>;
  drivers: Array<{ _id: string; name: string }>;
  customers: Array<{ _id: string; name: string; address?: string; site_addresses?: string[] }>;
  crusher: { _id: string; name: string; materials?: string[] } | null;
}

const CrusherTripForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const crusherId = searchParams.get('crusher');
  
  const [formData, setFormData] = useState<FormData>({
    crusher_id: crusherId || '',
    lorry_id: '',
    driver_id: '',
    customer_id: '',
    material_name: '',
    rate_per_unit: '',
    no_of_unit_crusher: '',
    no_of_unit_customer: '',
    crusher_amount: '',
    customer_amount: '',
    location: '',
    trip_date: new Date().toISOString().split('T')[0],
    dc_number: '',
    notes: ''
  });

  const [options, setOptions] = useState<FormOptions>({
    lorries: [],
    drivers: [],
    customers: [],
    crusher: null
  });

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Fetch form options and crusher details
  useEffect(() => {
    const fetchFormData = async () => {
      if (!crusherId) {
        toast.error('No crusher specified');
        navigate('/crushers');
        return;
      }

      try {
        setFormLoading(true);
        
        // Fetch form options (lorries, drivers, customers)
        const [formRes, crusherRes] = await Promise.all([
          api.get('/form-data/trips'),
          api.get(`/crushers/${crusherId}`)
        ]);

        const formData = formRes.data.data;
        setOptions({
          lorries: formData.lorries || [],
          drivers: formData.drivers || [],
          customers: formData.customers || [],
          crusher: crusherRes.data.data || null
        });

        // Auto-select the first material from crusher if available
        if (crusherRes.data.data?.materials?.length > 0) {
          setFormData(prev => ({
            ...prev,
            material_name: crusherRes.data.data.materials[0]
          }));
        }

      } catch (error: any) {
        console.error('Failed to fetch form data:', error);
        toast.error('Failed to load form data');
      } finally {
        setFormLoading(false);
      }
    };

    fetchFormData();
  }, [crusherId, navigate]);

  // Calculate amounts when units or rate change
  useEffect(() => {
    const calculateAmounts = async () => {
      if (!formData.rate_per_unit || !formData.no_of_unit_crusher || !formData.no_of_unit_customer) {
        return;
      }

      setCalculating(true);
      try {
        const rate = parseFloat(formData.rate_per_unit);
        const crusherUnits = parseFloat(formData.no_of_unit_crusher);
        const customerUnits = parseFloat(formData.no_of_unit_customer);

        if (!isNaN(rate) && !isNaN(crusherUnits) && !isNaN(customerUnits)) {
          const crusherAmount = rate * crusherUnits;
          const customerAmount = rate * customerUnits;

          setFormData(prev => ({
            ...prev,
            crusher_amount: crusherAmount.toFixed(2),
            customer_amount: customerAmount.toFixed(2)
          }));
        }
      } catch (error) {
        console.error('Error calculating amounts:', error);
      } finally {
        setCalculating(false);
      }
    };

    calculateAmounts();
  }, [formData.rate_per_unit, formData.no_of_unit_crusher, formData.no_of_unit_customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lorry_id) {
      toast.error('Please select a lorry');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        rate_per_unit: parseFloat(formData.rate_per_unit),
        no_of_unit_crusher: parseFloat(formData.no_of_unit_crusher),
        no_of_unit_customer: parseFloat(formData.no_of_unit_customer),
        crusher_amount: parseFloat(formData.crusher_amount),
        customer_amount: parseFloat(formData.customer_amount)
      };

      await api.post('/trips/create', payload);
      toast.success('Trip created successfully!');
      navigate(-1); // Go back to previous page (crusher trips)
    } catch (error: any) {
      console.error('Failed to create trip:', error);
      toast.error(error.response?.data?.error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (formLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
          <p className="text-gray-600">
            {options.crusher && `For crusher: ${options.crusher.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border p-6">
        {/* Crusher Information (Read-only) */}
        {options.crusher && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Crusher Information</h3>
            <p className="text-blue-800">
              <strong>Name:</strong> {options.crusher.name}
            </p>
            {options.crusher.materials && options.crusher.materials.length > 0 && (
              <p className="text-blue-800">
                <strong>Available Materials:</strong> {options.crusher.materials.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lorry Selection */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Truck className="h-4 w-4" />
              Lorry *
            </label>
            <select
              value={formData.lorry_id}
              onChange={(e) => handleInputChange('lorry_id', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Lorry</option>
              {options.lorries.map((lorry) => (
                <option key={lorry._id} value={lorry._id}>
                  {lorry.registration_number} {lorry.nick_name && `(${lorry.nick_name})`}
                </option>
              ))}
            </select>
            {!formData.lorry_id && (
              <p className="mt-1 text-sm text-red-600">Lorry is required</p>
            )}
          </div>

          {/* Driver Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              Driver *
            </label>
            <select
              value={formData.driver_id}
              onChange={(e) => handleInputChange('driver_id', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Driver</option>
              {options.drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              Customer *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              {options.customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4" />
              Material Name *
            </label>
            <select
              value={formData.material_name}
              onChange={(e) => handleInputChange('material_name', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Material</option>
              {options.crusher?.materials?.map((material, index) => (
                <option key={index} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          {/* Rate per Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate per Unit (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.rate_per_unit}
              onChange={(e) => handleInputChange('rate_per_unit', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Units at Crusher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units at Crusher *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.no_of_unit_crusher}
              onChange={(e) => handleInputChange('no_of_unit_crusher', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Units at Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units at Customer *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.no_of_unit_customer}
              onChange={(e) => handleInputChange('no_of_unit_customer', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Calculated Amounts */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Calculated Amounts</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Crusher Amount:</span>
                <span className="font-medium">₹{formData.crusher_amount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer Amount:</span>
                <span className="font-medium">₹{formData.customer_amount || '0.00'}</span>
              </div>
              {formData.crusher_amount && formData.customer_amount && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-gray-700">Profit:</span>
                  <span className={`font-medium ${
                    parseFloat(formData.customer_amount) - parseFloat(formData.crusher_amount) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ₹{(parseFloat(formData.customer_amount) - parseFloat(formData.crusher_amount)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter location"
            />
          </div>

          {/* Trip Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4" />
              Trip Date *
            </label>
            <input
              type="date"
              value={formData.trip_date}
              onChange={(e) => handleInputChange('trip_date', e.target.value)}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* DC Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              DC Number
            </label>
            <input
              type="text"
              value={formData.dc_number}
              onChange={(e) => handleInputChange('dc_number', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Optional DC number"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating Trip...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrusherTripForm;