import React, { useEffect, useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { Truck } from "lucide-react";

interface FormData {
  registration_number: string;
  nick_name: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface FormErrors {
  registration_number?: string;
  nick_name?: string;
  status?: string; // Error messages are always strings
}

const initialFormData: FormData = {
  registration_number: "",
  nick_name: "",
  status: "active",
};

const ManageLorryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/lorries/${id}`)
        .then((res) => {
          const lorryData = res.data.data;
          setFormData({
            registration_number: lorryData.registration_number || "",
            nick_name: lorryData.nick_name || "",
            status: lorryData.status || "active",
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch lorry details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.registration_number.trim()) {
      newErrors.registration_number = "Registration number is required";
    } else if (formData.registration_number.length < 3) {
      newErrors.registration_number = "Registration number must be at least 3 characters";
    }

    // Nick name is optional, no validation needed
    
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "status") {
      // Type guard for status field
      if (value === 'active' || value === 'maintenance' || value === 'inactive') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "registration_number" ? value.toUpperCase() : value,
      }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/lorries/update/${id}`, formData);
        toast.success("Lorry updated successfully");
      } else {
        await api.post("/lorries/create", formData);
        toast.success("Lorry created successfully");
        setFormData(initialFormData);
      }
      navigate("/lorries");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: "🚚" },
      maintenance: { color: "bg-yellow-100 text-yellow-800", icon: "🔧" },
      inactive: { color: "bg-gray-100 text-gray-800", icon: "⏸️" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 🔹 Header section */}
      <div className="bg-white p-5 rounded-t-xl border shadow-md flex items-center gap-3">
        <BackButton />
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Truck className="w-6 h-6 text-blue-600" />
          {isEditMode ? "Edit Lorry" : "Add Lorry"}
        </h2>
      </div>

      {/* 🔹 Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Number */}
            <div className="md:col-span-2">
              <FloatingInput
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                label="Registration Number *"
              />
              {errors.registration_number && (
                <p className="mt-1 text-sm text-red-600">{errors.registration_number}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be automatically converted to uppercase
              </p>
            </div>

            {/* Nick Name */}
            <div className="md:col-span-2">
              <FloatingInput
                type="text"
                name="nick_name"
                value={formData.nick_name}
                onChange={handleChange}
                label="Nick Name (Optional)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional friendly name for easier identification
              </p>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'active', label: 'Active', description: 'Lorry is operational and available' },
                  { value: 'maintenance', label: 'Maintenance', description: 'Lorry is under maintenance' },
                  { value: 'inactive', label: 'Inactive', description: 'Lorry is not in service' }
                ].map((statusOption) => (
                  <label
                    key={statusOption.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.status === statusOption.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={statusOption.value}
                      checked={formData.status === statusOption.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(statusOption.value)}
                          </div>
                          <p className="font-medium text-gray-900 mt-1">
                            {statusOption.label}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {statusOption.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>

          {/* 🔹 Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Lorry" : "Create Lorry"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/lorries")}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate(`/lorries`)}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors md:ml-auto"
              >
                Back to Lorries
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 🔹 Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Lorry Management Information
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Registration number must be unique across all lorries</li>
              <li>• Status determines the operational state of the lorry</li>
              <li>• Nick names help with quick identification in lists</li>
              <li>• Only owners can create and manage lorries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLorryForm;