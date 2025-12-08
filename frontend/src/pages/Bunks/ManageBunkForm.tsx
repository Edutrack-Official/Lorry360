import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";
import { Building2, Plus, X, MapPin, User, Phone } from "lucide-react";
import api from "../../api/client";
import BackButton from "../../components/BackButton";

interface FormData {
  bunk_name: string;
  address: string;
  contact_person?: string;
  phone_number?: string;
}

interface FormErrors {
  bunk_name?: string;
}

const initialFormData: FormData = {
  bunk_name: "",
  address: "",
  contact_person: "",
  phone_number: "",
};

const ManageBunkForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      api
        .get(`/petrol-bunks/${id}`)
        .then((res) => {
          const bunkData = res.data.data;
          setFormData({
            bunk_name: bunkData.bunk_name || "",
            address: bunkData.address || "",
            contact_person: bunkData.contact_person || "",
            phone_number: bunkData.phone_number || "",
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch bunk details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bunk_name.trim()) {
      newErrors.bunk_name = "Bunk name is required";
    } else if (formData.bunk_name.length < 2) {
      newErrors.bunk_name = "Name must be at least 2 characters";
    }

    // Phone number validation (if provided)
    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        toast.error("Phone number must be 10 digits");
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await api.put(`/petrol-bunks/update/${id}`, formData);
        toast.success("Bunk updated successfully");
      } else {
        await api.post("/petrol-bunks/create", formData);
        toast.success("Bunk created successfully");
        setFormData(initialFormData);
      }
      navigate("/bunks");
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header section */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BackButton />
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {isEditMode ? "Edit Fuel Bunk" : "Add New Fuel Bunk"}
            </h2>
          </div>
          <p className="text-sm text-gray-600 ml-12">
            {isEditMode 
              ? "Update the details of your fuel bunk" 
              : "Fill in the details to add a new fuel bunk to your account"}
          </p>
        </div>

        {/* Form section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bunk Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-2 text-blue-600" />
                Bunk Name *
              </label>
              <input
                type="text"
                name="bunk_name"
                value={formData.bunk_name}
                onChange={handleChange}
                placeholder="e.g., City Fuel Station, Highway Bunk"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {errors.bunk_name && (
                <p className="mt-1 text-sm text-red-600">{errors.bunk_name}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2 text-blue-600" />
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Enter complete address with landmark"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
              />
            </div>

            {/* Contact Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person || ''}
                      onChange={handleChange}
                      placeholder="e.g., Manager Name"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number || ''}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      maxLength={10}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    {isEditMode ? "Update Bunk" : "Create Bunk"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/bunks")}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>
            </div>

            {/* Required fields note */}
            <div className="text-xs text-gray-500 mt-4">
              * Required fields
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageBunkForm;