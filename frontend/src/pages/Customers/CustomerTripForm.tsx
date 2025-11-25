import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Changed to useParams
import { ArrowLeft, Save, Truck, User, Package, Calendar, IndianRupee, MapPin } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Crusher {
  _id: string;
  name: string;
  location: string;
  materials?: string[];
}

interface Lorry {
  _id: string;
  registration_number: string;
  nick_name?: string;
}

interface Driver {
  _id: string;
  name: string;
  phone: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  site_addresses?: string[];
}

interface TripFormData {
  crusher_id: string;
  lorry_id: string;
  driver_id: string;
  customer_id: string;
  material_name: string;
  rate_per_unit: number;
  no_of_unit_crusher: number;
  no_of_unit_customer: number;
  crusher_amount: number;
  customer_amount: number;
  location: string;
  trip_date: string;
  notes?: string;
}

const CrusherTripForm = () => {
  const navigate = useNavigate();
  const { crusherId } = useParams<{ crusherId: string }>(); // Get crusherId from route params

  const [loading, setLoading] = useState(false);
  const [crushers, setCrushers] = useState<Crusher[]>([]);
  const [lorries, setLorries] = useState<Lorry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCrusher, setSelectedCrusher] = useState<Crusher | null>(null);
  const [isCrusherLoaded, setIsCrusherLoaded] = useState(false);

  const [formData, setFormData] = useState<TripFormData>({
    crusher_id: crusherId || '',
    lorry_id: '',
    driver_id: '',
    customer_id: '',
    material_name: '',
    rate_per_unit: 0,
    no_of_unit_crusher: 0,
    no_of_unit_customer: 0,
    crusher_amount: 0,
    customer_amount: 0,
    location: '',
    trip_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchCrushers();
    fetchLorries();
    fetchDrivers();
    fetchCustomers();
  }, []);

  // Set selected crusher when crusherId changes
  useEffect(() => {
    if (crusherId && crushers.length > 0 && !isCrusherLoaded) {
      const crusher = crushers.find(c => c._id === crusherId);
      if (crusher) {
        setSelectedCrusher(crusher);
        setFormData(prev => ({
          ...prev,
          crusher_id: crusherId
        }));
        setIsCrusherLoaded(true);
      }
    }
  }, [crusherId, crushers, isCrusherLoaded]);

  const fetchCrushers = async () => {
    try {
      const res = await api.get('/crushers');
      setCrushers(res.data.data?.crushers || []);
    } catch (error: any) {
      console.error('Failed to fetch crushers:', error);
      toast.error('Failed to fetch crushers');
    }
  };

  const fetchLorries = async () => {
    try {
      const res = await api.get('/lorries');
      setLorries(res.data.data?.lorries || []);
    } catch (error: any) {
      console.error('Failed to fetch lorries:', error);
      toast.error('Failed to fetch lorries');
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data.data?.drivers || []);
    } catch (error: any) {
      console.error('Failed to fetch drivers:', error);
      toast.error('Failed to fetch drivers');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.data?.customers || []);
    } catch (error: any) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate amounts when rate or units change
    if (name === 'rate_per_unit' || name === 'no_of_unit_customer') {
      const rate = name === 'rate_per_unit' ? parseFloat(value) || 0 : formData.rate_per_unit;
      const units = name === 'no_of_unit_customer' ? parseFloat(value) || 0 : formData.no_of_unit_customer;
      const customerAmount = rate * units;

      setFormData(prev => ({
        ...prev,
        customer_amount: customerAmount
      }));
    }

    // Auto-calculate crusher amount when crusher units change
    if (name === 'no_of_unit_crusher') {
      const crusherUnits = parseFloat(value) || 0;
      const crusherAmount = formData.rate_per_unit * crusherUnits;

      setFormData(prev => ({
        ...prev,
        crusher_amount: crusherAmount
      }));
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c._id === customerId) || null;
    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      location: customer?.address || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.crusher_id || !formData.lorry_id || !formData.driver_id || !formData.customer_id) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      const tripData = {
        ...formData,
        rate_per_unit: parseFloat(formData.rate_per_unit.toString()),
        no_of_unit_crusher: parseFloat(formData.no_of_unit_crusher.toString()),
        no_of_unit_customer: parseFloat(formData.no_of_unit_customer.toString()),
        crusher_amount: parseFloat(formData.crusher_amount.toString()),
        customer_amount: parseFloat(formData.customer_amount.toString()),
      };

      await api.post('/trips/create', tripData);
      toast.success('Trip created successfully!');

      // Navigate back to crusher trips page
      navigate(`/crushers/${crusherId}/trips`);
    } catch (error: any) {
      console.error('Failed to create trip:', error);
      toast.error(error.response?.data?.error || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    return formData.customer_amount - formData.crusher_amount;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Trip</h1>
                <p className="text-gray-600">
                  {selectedCrusher ? `For crusher: ${selectedCrusher.name}` : 'Create a new trip'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Trip Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crusher Selection - Fixed to show preselected crusher */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crusher *
                </label>
                {crusherId ? (
                  // Show read-only display when crusher is preselected AND we have the crusher data
                  crushers.length > 0 && crushers.find(c => c._id === crusherId) ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">
                            {selectedCrusher ? `${selectedCrusher.name} - ${selectedCrusher.location}` : 'Loading...'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Crusher is preselected. To change crusher, go back and select from crushers list.
                      </p>
                      {/* Hidden input to maintain form data */}
                      <input type="hidden" name="crusher_id" value={formData.crusher_id} />
                    </div>
                  ) : (
                    // Show loading state while fetching crusher data
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Loading crusher...</span>
                      </div>
                    </div>
                  )
                ) : (
                  // Show dropdown when no crusher is preselected
                  <select
                    name="crusher_id"
                    value={formData.crusher_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Crusher</option>
                    {crushers.map((crusher) => (
                      <option key={crusher._id} value={crusher._id}>
                        {crusher.name} - {crusher.location}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Customer Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleCustomerChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle and Driver */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lorry *
                </label>
                <select
                  name="lorry_id"
                  value={formData.lorry_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Lorry</option>
                  {lorries.map((lorry) => (
                    <option key={lorry._id} value={lorry._id}>
                      {lorry.registration_number} {lorry.nick_name && `(${lorry.nick_name})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver *
                </label>
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name *
                </label>
                <select
                  name="material_name"
                  value={formData.material_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Material</option>
                  {selectedCrusher?.materials?.map((material, index) => (
                    <option key={index} value={material}>
                      {material}
                    </option>
                  ))}
                  {(!selectedCrusher?.materials || selectedCrusher.materials.length === 0)}
                </select>
              </div>

              {/* Pricing and Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Per Unit (₹) *
                </label>
                <input
                  type="number"
                  name="rate_per_unit"
                  value={formData.rate_per_unit}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units at Crusher *
                </label>
                <input
                  type="number"
                  name="no_of_unit_crusher"
                  value={formData.no_of_unit_crusher}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units at Customer *
                </label>
                <input
                  type="number"
                  name="no_of_unit_customer"
                  value={formData.no_of_unit_customer}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter delivery address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Trip Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Date *
                </label>
                <input
                  type="date"
                  name="trip_date"
                  value={formData.trip_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Amounts Display */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">Crusher Amount</div>
                  <div className="text-lg font-semibold text-red-600">
                    ₹{formData.crusher_amount.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">Customer Amount</div>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{formData.customer_amount.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">Profit</div>
                  <div className={`text-lg font-semibold ${calculateProfit() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ₹{calculateProfit().toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional notes about this trip..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrusherTripForm;