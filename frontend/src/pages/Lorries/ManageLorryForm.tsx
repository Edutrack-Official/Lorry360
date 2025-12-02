import React, { useEffect, useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { 
  Truck, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  PauseCircle,
  Info,
  Loader2
} from "lucide-react";

interface FormData {
  registration_number: string;
  nick_name: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface FormErrors {
  registration_number?: string;
  nick_name?: string;
  status?: string;
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

  const statusOptions = [
    { 
      value: 'active', 
      label: 'Active', 
      description: 'Lorry is operational and available',
      icon: CheckCircle2,
      color: 'border-green-200 bg-green-50',
      selectedColor: 'border-green-500 bg-green-100 ring-2 ring-green-500',
      iconColor: 'text-green-600',
      dotColor: 'bg-green-500'
    },
    { 
      value: 'maintenance', 
      label: 'Maintenance', 
      description: 'Lorry is under maintenance',
      icon: Clock,
      color: 'border-amber-200 bg-amber-50',
      selectedColor: 'border-amber-500 bg-amber-100 ring-2 ring-amber-500',
      iconColor: 'text-amber-600',
      dotColor: 'bg-amber-500'
    },
    { 
      value: 'inactive', 
      label: 'Inactive', 
      description: 'Lorry is not in service',
      icon: PauseCircle,
      color: 'border-gray-200 bg-gray-50',
      selectedColor: 'border-gray-500 bg-gray-100 ring-2 ring-gray-500',
      iconColor: 'text-gray-600',
      dotColor: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading lorry details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header - Sticky */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {isEditMode ? "Edit Lorry" : "Add New Lorry"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEditMode ? "Update lorry information" : "Create a new lorry entry"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Registration Number */}
              <div>
                <FloatingInput
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  label="Registration Number *"
                />
                {errors.registration_number && (
                  <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <span className="text-red-500 font-bold">•</span>
                    {errors.registration_number}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Auto-converted to uppercase (e.g., TN01AB1234)
                </p>
              </div>

              {/* Nick Name */}
              <div>
                <FloatingInput
                  type="text"
                  name="nick_name"
                  value={formData.nick_name}
                  onChange={handleChange}
                  label="Nick Name (Optional)"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Friendly name for easier identification
                </p>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Status *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {statusOptions.map((statusOption) => {
                    const StatusIcon = statusOption.icon;
                    const isSelected = formData.status === statusOption.value;
                    
                    return (
                      <label
                        key={statusOption.value}
                        className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          isSelected
                            ? statusOption.selectedColor
                            : `${statusOption.color} hover:border-gray-300`
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={statusOption.value}
                          checked={isSelected}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex flex-col w-full gap-2">
                          <div className="flex items-center justify-between">
                            <StatusIcon className={`h-5 w-5 ${statusOption.iconColor}`} />
                            {isSelected && (
                              <span className={`h-2 w-2 rounded-full ${statusOption.dotColor} animate-pulse`}></span>
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${statusOption.iconColor}`}>
                              {statusOption.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {statusOption.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.status && (
                  <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <span className="text-red-500 font-bold">•</span>
                    {errors.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Sticky on Mobile */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 shadow-lg sm:shadow-none">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary Action */}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm text-sm sm:text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? "Update Lorry" : "Create Lorry"}
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => navigate("/lorries")}
                disabled={submitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all font-medium text-sm sm:text-base disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageLorryForm;