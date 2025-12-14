import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";
import { User, MapPin, Plus, X } from "lucide-react";
import api from "../../api/client";
import BackButton from "../../components/BackButton";

interface FormData {
  name: string;
  phone: string;
  address: string;
  site_addresses: string[];
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

const initialFormData: FormData = {
  name: "",
  phone: "+91-",
  address: "",
  site_addresses: [],
};

const ManageCustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSiteAddress, setNewSiteAddress] = useState("");

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/customers/${id}`)
        .then((res) => {
          const customerData = res.data.data;
          setFormData({
            name: customerData.name || "",
            phone: customerData.phone || "+91-",
            address: customerData.address || "",
            site_addresses: customerData.site_addresses || [],
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch customer details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+91-?\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be in format +91-xxxxxxxxxx";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Auto-format phone number
      let formattedValue = value;

      // Ensure it starts with +91-
      if (!formattedValue.startsWith("+91-")) {
        formattedValue = "+91-" + formattedValue.replace(/\+91-?/g, "");
      }

      // Allow only 10 digits after +91-
      const digits = formattedValue.slice(4).replace(/\D/g, "").slice(0, 10);
      formattedValue = "+91-" + digits;

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const addSiteAddress = () => {
    if (newSiteAddress.trim() && !formData.site_addresses.includes(newSiteAddress.trim())) {
      setFormData(prev => ({
        ...prev,
        site_addresses: [...prev.site_addresses, newSiteAddress.trim()]
      }));
      setNewSiteAddress("");
    }
  };

  const removeSiteAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      site_addresses: prev.site_addresses.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/customers/update/${id}`, formData);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers/create", formData);
        toast.success("Customer created successfully");
        setFormData(initialFormData);
      }
      navigate("/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 space-y-6">
      {/* Header section */}
      <div className="bg-white p-5 rounded-t-xl border shadow-md flex items-center gap-3">
        <BackButton />
        <div className="flex items-center justify-center lg:justify-start flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 text-center lg:text-left">
            {isEditMode ? "Edit Customer" : "Add Customer"}
          </h2>
        </div>
      </div>

      {/* Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <FloatingInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                label="Customer Name *"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <FloatingInput
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                label="Phone Number *"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: +91 followed by 10-digit phone number
              </p>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter complete address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Site Addresses */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Addresses (Optional)
              </label>
              <div className="space-y-3">
                {/* Add new site address */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSiteAddress}
                    onChange={(e) => setNewSiteAddress(e.target.value)}
                    placeholder="Enter site address"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSiteAddress();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSiteAddress}
                    disabled={!newSiteAddress.trim()}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Site addresses list */}
                {formData.site_addresses.length > 0 && (
                  <div className="space-y-2">
                    {formData.site_addresses.map((site, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                          <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                          <span className="text-sm break-words">{site}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSiteAddress(index)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add multiple site addresses for this customer (optional)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Customer" : "Create Customer"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageCustomerForm;