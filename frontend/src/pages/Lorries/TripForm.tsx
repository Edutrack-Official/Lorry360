import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import toast from "react-hot-toast";
import BackButton from "../../components/BackButton";
import { useAuth } from '../../contexts/AuthContext';

import {
  Truck,
  User,
  Building,
  MapPin,
  Calendar,
  FileText,
  Save,
  X,
  Package,
  Navigation,
  Hash,
  Users,
  IndianRupee
} from "lucide-react";

interface FormData {
  lorry_id: string;
  driver_id: string;
  crusher_id: string;
  material_name: string;
  rate_per_unit: number;
  no_of_unit_crusher: number;
  no_of_unit_customer: number;
  crusher_amount: number;
  customer_id: string;
  collab_owner_id: string;
  location: string;
  customer_amount: number;
  trip_date: string;
  notes: string;
  dc_number: string;
}

interface FormDataResponse {
  customers: Array<{
    _id: string;
    name: string;
    address: string;
    site_addresses: string[];
  }>;
  drivers: Array<{
    _id: string;
    name: string;
  }>;
  crushers: Array<{
    _id: string;
    name: string;
    materials: Array<{
      material_name: string;
      price_per_unit: number;
    }>;
  }>;
  collaborative_owners: Array<{
    _id: string;
    name: string;
    company_name: string;
    phone: string;
    email: string;
  }>;
}

interface Collaboration {
  _id: string;
  from_owner_id: {
    _id: string;
    name: string;
    company_name: string;
  };
  to_owner_id: {
    _id: string;
    name: string;
    company_name: string;
  };
  status: string;
}

const TripForm = () => {
  const { user } = useAuth();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const lorryId = searchParams.get('lorry');
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    lorry_id: lorryId || "",
    driver_id: "",
    crusher_id: "",
    material_name: "",
    rate_per_unit: 0,
    no_of_unit_crusher: 0,
    no_of_unit_customer: 0,
    crusher_amount: 0,
    customer_id: "",
    collab_owner_id: "",
    location: "",
    customer_amount: 0,
    trip_date: new Date().toISOString().split('T')[0],
    notes: "",
    dc_number: ""
  });

  const [formOptions, setFormOptions] = useState<FormDataResponse>({
    customers: [],
    drivers: [],
    crushers: [],
    collaborative_owners: []
  });

  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCustomerAddresses, setSelectedCustomerAddresses] = useState<string[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Array<{ material_name: string; price_per_unit: number }>>([]);
  const [lorryName, setLorryName] = useState("");
  const [isCustomMaterial, setIsCustomMaterial] = useState(false);
  const [destinationType, setDestinationType] = useState<'customer' | 'collaborative'>('customer');

  const isEditMode = Boolean(tripId);

  // Get lorry name from localStorage
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

  // Fetch form data and collaborations
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        // Fetch form data
        const response = await api.get('/form-data/trips');
        const data = response.data.data;
        setFormOptions({
          customers: data.customers || [],
          drivers: data.drivers || [],
          crushers: data.crushers || [],
          collaborative_owners: data.collaborative_owners || []
        });

        // Fetch active collaborations
        const collabResponse = await api.get('/collaborations/active');

        setCollaborations(collabResponse.data.data?.collaborations || []);

        if (isEditMode) {
          const tripRes = await api.get(`/trips/${tripId}`);
          const tripData = tripRes.data.data;

          // Determine destination type
          const isCollaborative = !!tripData.collab_owner_id;
          setDestinationType(isCollaborative ? 'collaborative' : 'customer');

          setFormData({
            lorry_id: tripData.lorry_id?._id || lorryId || "",
            driver_id: tripData.driver_id?._id || "",
            crusher_id: tripData.crusher_id?._id || "",
            material_name: tripData.material_name || "",
            rate_per_unit: tripData.rate_per_unit || 0,
            no_of_unit_crusher: tripData.no_of_unit_crusher || 0,
            no_of_unit_customer: tripData.no_of_unit_customer || 0,
            crusher_amount: tripData.crusher_amount || 0,
            customer_id: tripData.customer_id?._id || "",
            collab_owner_id: tripData.collab_owner_id?._id || "",
            location: tripData.location || "",
            customer_amount: tripData.customer_amount || 0,
            trip_date: tripData.trip_date ? new Date(tripData.trip_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            notes: tripData.notes || "",
            dc_number: tripData.dc_number || ""
          });

          // Set customer addresses if customer is selected
          if (tripData.customer_id?._id) {
            const customer = data.customers.find((c: any) => c._id === tripData.customer_id._id);
            if (customer) {
              const addresses = [
                customer.address,
                ...(customer.site_addresses || [])
              ].filter(addr => addr && addr.trim() !== '');
              setSelectedCustomerAddresses(addresses);
            }
          }

          // Set materials if crusher is selected
          if (tripData.crusher_id?._id) {
            var crusher = data.crushers.find((c: any) => c._id === tripData.crusher_id._id);
            if (crusher) {
              setAvailableMaterials(crusher.materials || []);
            }
          }

          // In edit mode, check if material exists in predefined list
          const materialExists = crusher?.materials?.some((m: any) => m.material_name === tripData.material_name);
          setIsCustomMaterial(!materialExists);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [tripId, isEditMode, lorryId]);

  // Handle customer selection
  useEffect(() => {
    if (formData.customer_id && destinationType === 'customer') {
      const customer = formOptions.customers.find(c => c._id === formData.customer_id);
      if (customer) {
        const addresses = [
          customer.address,
          ...(customer.site_addresses || [])
        ].filter(addr => addr && addr.trim() !== '');
        setSelectedCustomerAddresses(addresses);

        if (addresses.length > 0 && !formData.location) {
          setFormData(prev => ({ ...prev, location: addresses[0] }));
        }
      }
    } else {
      setSelectedCustomerAddresses([]);
    }
  }, [formData.customer_id, formOptions.customers, destinationType]);

  // Handle crusher selection
  useEffect(() => {
    if (formData.crusher_id) {
      const crusher = formOptions.crushers.find(c => c._id === formData.crusher_id);
      if (crusher) {
        setAvailableMaterials(crusher.materials || []);

        // Check if current material exists in new crusher's materials
        if (formData.material_name) {
          const materialExists = crusher.materials.some(m => m.material_name === formData.material_name);
          if (materialExists && isCustomMaterial) {
            setIsCustomMaterial(false);
          }
        }
      }
    } else {
      setAvailableMaterials([]);
    }
  }, [formData.crusher_id, formOptions.crushers]);

  // Handle material selection from dropdown (create mode only)
  useEffect(() => {
    if (!isEditMode && formData.material_name && availableMaterials.length > 0 && !isCustomMaterial) {
      const material = availableMaterials.find(m => m.material_name === formData.material_name);
      if (material) {
        setFormData(prev => ({
          ...prev,
          rate_per_unit: material.price_per_unit
        }));
      }
    }
  }, [formData.material_name, availableMaterials, isEditMode, isCustomMaterial]);

  // Auto-calculate crusher amount
  useEffect(() => {
    if (formData.rate_per_unit > 0 && formData.no_of_unit_crusher > 0) {
      const crusherAmount = formData.rate_per_unit * formData.no_of_unit_crusher;
      setFormData(prev => ({ ...prev, crusher_amount: Number(crusherAmount.toFixed(2)) }));
    }
  }, [formData.rate_per_unit, formData.no_of_unit_crusher]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Allow empty value (user can delete 0)
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }));
    } else {
      // Convert to number, allow decimal values
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMaterialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, material_name: value }));
  };

  const handleMaterialSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      material_name: value
    }));

    // Auto-populate rate when material is selected from dropdown
    if (value && availableMaterials.length > 0) {
      const material = availableMaterials.find(m => m.material_name === value);
      if (material) {
        setFormData(prev => ({
          ...prev,
          rate_per_unit: material.price_per_unit
        }));
      }
    }

    setIsCustomMaterial(false);
  };

  const handleCustomMaterialToggle = () => {
    setIsCustomMaterial(true);
    setFormData(prev => ({ ...prev, material_name: "", rate_per_unit: 0 }));
  };

  const handlePredefinedMaterialToggle = () => {
    setIsCustomMaterial(false);
    setFormData(prev => ({ ...prev, material_name: "", rate_per_unit: 0 }));
  };

  const handleAddressSelect = (address: string) => {
    setFormData(prev => ({ ...prev, location: address }));
  };

  const handleDestinationTypeChange = (type: 'customer' | 'collaborative') => {
    setDestinationType(type);
    // Clear the other destination field
    if (type === 'customer') {
      setFormData(prev => ({ ...prev, collab_owner_id: "" }));
    } else {
      setFormData(prev => ({ ...prev, customer_id: "", location: "" }));
      setSelectedCustomerAddresses([]);
    }
  };

  // Get collaborative partners from active collaborations
  const getCollaborativePartners = (currentUserId: any) => {
    const allPartners = collaborations.flatMap(collab => [
      collab.from_owner_id,
      collab.to_owner_id
    ]).filter(partner =>
      partner && partner._id && partner._id !== currentUserId
    );

    // Remove duplicates
    return allPartners.filter((partner, index, self) =>
      index === self.findIndex(p => p._id === partner._id)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lorry_id) newErrors.lorry_id = "Lorry is required";
    if (!formData.driver_id) newErrors.driver_id = "Driver is required";
    if (!formData.crusher_id) newErrors.crusher_id = "Crusher is required";
    if (!formData.material_name) newErrors.material_name = "Material is required";

    // Validate destination based on type
    if (destinationType === 'customer') {

      if (!formData.customer_id)
        newErrors.customer_id = "Customer is required";

    } else {
      if (!formData.collab_owner_id) newErrors.collab_owner_id = "Collaborative owner is required";
    }

    if (!formData.location) newErrors.location = "Location is required";
    if (formData.rate_per_unit <= 0) newErrors.rate_per_unit = "Rate per unit must be greater than 0";
    if (formData.no_of_unit_crusher <= 0) newErrors.no_of_unit_crusher = "Crusher units must be greater than 0";
    if (formData.no_of_unit_customer <= 0) newErrors.no_of_unit_customer = "Customer units must be greater than 0";
    if (formData.crusher_amount <= 0) newErrors.crusher_amount = "Crusher amount must be greater than 0";
    if (formData.customer_amount <= 0) newErrors.customer_amount = "Customer amount must be greater than 0";
    if (!formData.trip_date) newErrors.trip_date = "Trip date is required";
    if (formData.customer_amount < formData.crusher_amount) newErrors.customer_amount = "Customer amount must be greater than crusher amount";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {

        if (destinationType == 'customer') {
          formData.collab_owner_id = "";
        }
        else {
          formData.customer_id = "";
        }
        await api.put(`/trips/update/${tripId}`, formData);
        toast.success("Trip updated successfully");
      } else {
        await api.post("/trips/create", formData);
        toast.success("Trip created successfully");
      }

      if (formData.lorry_id) {
        navigate(`/lorries/${formData.lorry_id}/trips`);
      } else {
        navigate("/trips");
      }
    } catch (error: any) {
      let errorMessage = error.response?.data?.error || "Operation failed";

      // Transform technical errors to user-friendly messages
      if (errorMessage.includes('dc_number_1')) {
        errorMessage = "This DC number is already in use. Please use a different DC number.";
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = "This record already exists. Please check your information and try again.";
      } else if (errorMessage.includes('validation failed')) {
        errorMessage = "Please check all required fields and try again.";
      } else if (errorMessage.includes('cast to objectid failed')) {
        errorMessage = "Invalid data format. Please refresh the page and try again.";
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const profit = formData.customer_amount - formData.crusher_amount;
  const collaborativePartners = getCollaborativePartners(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <div className="flex items-center justify-center lg:justify-start flex-1">
              <div className="text-center lg:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Trip' : 'Create New Trip'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEditMode ? 'Update trip details' : 'Add a new trip for the lorry'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Lorry Display (Read-only) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="h-4 w-4 inline mr-2" />
                  Lorry *
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {lorryName || "Loading..."}
                </div>
                <input type="hidden" name="lorry_id" value={formData.lorry_id} />
                {errors.lorry_id && <p className="mt-1 text-sm text-red-600">{errors.lorry_id}</p>}
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Driver *
                </label>
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleTextChange}
                  className="w-full input input-bordered"
                >
                  <option value="">Select Driver</option>
                  {formOptions.drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
                {errors.driver_id && <p className="mt-1 text-sm text-red-600">{errors.driver_id}</p>}
              </div>

              {/* Destination Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Type *
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="destinationType"
                      checked={destinationType === 'customer'}
                      onChange={() => handleDestinationTypeChange('customer')}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Customer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="destinationType"
                      checked={destinationType === 'collaborative'}
                      onChange={() => handleDestinationTypeChange('collaborative')}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Collaborative Owner</span>
                  </label>
                </div>
              </div>

              {/* Customer Selection */}
              {destinationType === 'customer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Customer *
                  </label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleTextChange}
                    className="w-full input input-bordered"
                  >
                    <option value="">Select Customer</option>
                    {formOptions.customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                </div>
              )}

              {/* Collaborative Owner Selection */}
              {destinationType === 'collaborative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-2" />
                    Collaborative Owner *
                  </label>
                  <select
                    name="collab_owner_id"
                    value={formData.collab_owner_id}
                    onChange={handleTextChange}
                    className="w-full input input-bordered"
                  >
                    <option value="">Select Collaborative Owner</option>
                    {collaborativePartners.map((partner) => (
                      <option key={partner._id} value={partner._id}>
                        {partner.name} ({partner.company_name})
                      </option>
                    ))}
                  </select>
                  {errors.collab_owner_id && <p className="mt-1 text-sm text-red-600">{errors.collab_owner_id}</p>}
                </div>
              )}

              {/* DC Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2" />
                  DC Number
                </label>
                <input
                  type="text"
                  name="dc_number"
                  value={formData.dc_number}
                  onChange={handleTextChange}
                  className="w-full input input-bordered"
                  placeholder="Enter DC number"
                />
              </div>

              {/* Trip Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Trip Date *
                </label>
                <input
                  type="date"
                  name="trip_date"
                  value={formData.trip_date}
                  onChange={handleTextChange}
                  className="w-full input input-bordered"
                />
                {errors.trip_date && <p className="mt-1 text-sm text-red-600">{errors.trip_date}</p>}
              </div>

              {/* Customer Address Selection - Only for Customer destination */}
              {destinationType === 'customer' && selectedCustomerAddresses.length > 0 && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Select Delivery Location *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCustomerAddresses.map((address, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddressSelect(address)}
                        className={`p-3 text-left rounded-lg border transition-colors ${formData.location === address
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <Navigation className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{address}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Delivery Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleTextChange}
                  className="w-full input input-bordered"
                  placeholder={
                    destinationType === 'customer'
                      ? "Enter delivery address or select from above"
                      : "Enter delivery address for collaborative owner"
                  }
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            </div>

            {/* Crusher & Material Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Crusher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Crusher *
                </label>
                <select
                  name="crusher_id"
                  value={formData.crusher_id}
                  onChange={handleTextChange}
                  className="w-full input input-bordered"
                >
                  <option value="">Select Crusher</option>
                  {formOptions.crushers.map((crusher) => (
                    <option key={crusher._id} value={crusher._id}>
                      {crusher.name}
                    </option>
                  ))}
                </select>
                {errors.crusher_id && <p className="mt-1 text-sm text-red-600">{errors.crusher_id}</p>}
              </div>

              {/* Material Selection/Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="h-4 w-4 inline mr-2" />
                  Material *
                </label>

                <div className="space-y-2">
                  {isCustomMaterial ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="material_name"
                        value={formData.material_name}
                        onChange={handleMaterialInputChange}
                        className="w-full input input-bordered"
                        placeholder="Enter custom material name"
                      />
                      <button
                        type="button"
                        onClick={handlePredefinedMaterialToggle}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        ← Choose from predefined materials
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        name="material_name"
                        value={formData.material_name}
                        onChange={handleMaterialSelectChange}
                        className="w-full input input-bordered"
                        disabled={!formData.crusher_id}
                      >
                        <option value="">Select Material</option>
                        {availableMaterials.map((material, index) => (
                          <option key={index} value={material.material_name}>
                            {material.material_name} - ₹{material.price_per_unit}/unit
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleCustomMaterialToggle}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add custom material
                      </button>
                    </div>
                  )}
                </div>

                {errors.material_name && <p className="mt-1 text-sm text-red-600">{errors.material_name}</p>}
                {!formData.crusher_id && !isCustomMaterial && (
                  <p className="mt-1 text-sm text-gray-500">Please select a crusher first</p>
                )}
              </div>

              {/* Rate per Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="h-4 w-4 inline mr-2" />
                  Rate per Unit *
                </label>
                <input
                  type="number"
                  name="rate_per_unit"
                  value={formData.rate_per_unit || ''}
                  onChange={handleNumberChange}
                  className="w-full input input-bordered"
                  min="0"
                  step="0.01"
                  placeholder="Enter rate"
                />
                {errors.rate_per_unit && <p className="mt-1 text-sm text-red-600">{errors.rate_per_unit}</p>}
              </div>
            </div>

            {/* Units and Amounts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Crusher Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crusher Units *
                </label>
                <input
                  type="number"
                  name="no_of_unit_crusher"
                  value={formData.no_of_unit_crusher || ''}
                  onChange={handleNumberChange}
                  className="w-full input input-bordered"
                  min="0"
                  step="0.01"
                  placeholder="3.60"
                />
                {errors.no_of_unit_crusher && <p className="mt-1 text-sm text-red-600">{errors.no_of_unit_crusher}</p>}
              </div>

              {/* Crusher Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crusher Amount *
                </label>
                <input
                  type="number"
                  name="crusher_amount"
                  value={formData.crusher_amount || ''}
                  onChange={handleNumberChange}
                  className="w-full input input-bordered"
                  min="0"
                  step="0.01"
                  readOnly
                />
                {errors.crusher_amount && <p className="mt-1 text-sm text-red-600">{errors.crusher_amount}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Auto: {formData.rate_per_unit} × {formData.no_of_unit_crusher} = ₹{formData.crusher_amount}
                </p>
              </div>

              {/* Customer Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Units *
                </label>
                <input
                  type="number"
                  name="no_of_unit_customer"
                  value={formData.no_of_unit_customer || ''}
                  onChange={handleNumberChange}
                  className="w-full input input-bordered"
                  min="0"
                  step="0.01"
                  placeholder="3.60"
                />
                {errors.no_of_unit_customer && <p className="mt-1 text-sm text-red-600">{errors.no_of_unit_customer}</p>}
              </div>

              {/* Customer Amount (User Input) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="h-4 w-4 inline mr-2" />
                  Customer Amount *
                </label>
                <input
                  type="number"
                  name="customer_amount"
                  value={formData.customer_amount || ''}
                  onChange={handleNumberChange}
                  className="w-full input input-bordered"
                  min="0"
                  step="0.01"
                  placeholder="Enter customer amount"
                />
                {errors.customer_amount && <p className="mt-1 text-sm text-red-600">{errors.customer_amount}</p>}
              </div>
            </div>

            {/* Profit Preview */}
            {(formData.customer_amount > 0 || formData.crusher_amount > 0) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-gray-600 mb-1">Customer Amount</div>
                    <div className="font-bold text-green-600 text-lg">₹{formData.customer_amount.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-gray-600 mb-1">Crusher Amount</div>
                    <div className="font-bold text-orange-600 text-lg">₹{formData.crusher_amount.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-gray-600 mb-1">Estimated Profit</div>
                    <div className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{profit.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleTextChange}
                rows={3}
                className="w-full input input-bordered"
                placeholder="Additional notes about this trip..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4" />
                {submitting ? 'Saving...' : (isEditMode ? 'Update Trip' : 'Create Trip')}
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

export default TripForm;