import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";
import { Users, MapPin, Phone, IndianRupee } from "lucide-react";
import api from "../../api/client";
import BackButton from "../../components/BackButton";

interface FormData {
  name: string;
  phone: string;
  address: string;
  salary_per_duty: number;
  salary_per_trip: number;
  status: "active" | "inactive";
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  salary_per_duty?: string;
  salary_per_trip?: string;
  salary?: string;
}

const initialFormData: FormData = {
  name: "",
  phone: "+91-",
  address: "",
  salary_per_duty: 0,
  salary_per_trip: 0,
  status: "active",
};

const ManageDriverForm: React.FC = () => {
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
        .get(`/drivers/${id}`)
        .then((res) => {
          const driverData = res.data.data;
          setFormData({
            name: driverData.name || "",
            phone: driverData.phone || "+91-",
            address: driverData.address || "",
            salary_per_duty: driverData.salary_per_duty || 0,
            salary_per_trip: driverData.salary_per_trip || 0,
            status: driverData.status || "active",
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch driver details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+91-?\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be in format +91-xxxxxxxxxx";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Validate that at least one salary type is provided
    if ((!formData.salary_per_duty || formData.salary_per_duty <= 0) && 
        (!formData.salary_per_trip || formData.salary_per_trip <= 0)) {
      newErrors.salary = "At least one salary type must be provided";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Auto-format phone number
      let formattedValue = value;
      
      if (!formattedValue.startsWith("+91-")) {
        formattedValue = "+91-" + formattedValue.replace(/\+91-?/g, "");
      }
      
      const digits = formattedValue.slice(4).replace(/\D/g, "").slice(0, 10);
      formattedValue = "+91-" + digits;
      
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else if (name === "salary_per_duty" || name === "salary_per_trip") {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue ? parseInt(numericValue) : 0,
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

    // Clear salary error when user starts typing in either field
    if ((name === "salary_per_duty" || name === "salary_per_trip") && errors.salary) {
      setErrors((prev) => ({ ...prev, salary: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/drivers/update/${id}`, formData);
        toast.success("Driver updated successfully");
      } else {
        await api.post("/drivers/create", formData);
        toast.success("Driver created successfully");
        setFormData(initialFormData);
      }
      navigate("/drivers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
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
      {/* Header section */}
      <div className="bg-white p-5 rounded-t-xl border shadow-md flex items-center gap-3">
        <BackButton />
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Users className="w-6 h-6 text-blue-600" />
          {isEditMode ? "Edit Driver" : "Add Driver"}
        </h2>
      </div>

      {/* Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Driver Information
              </h3>
            </div>

            {/* Name */}
            <div>
              <FloatingInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                label="Full Name *"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <FloatingInput
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                label="Phone *"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Salary per Duty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary per Duty
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="salary_per_duty"
                  value={formData.salary_per_duty || ""}
                  onChange={handleChange}
                  placeholder="Enter salary per duty"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {formData.salary_per_duty > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Formatted: {formatSalary(formData.salary_per_duty)}
                </p>
              )}
            </div>

            {/* Salary per Trip */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary per Trip
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="salary_per_trip"
                  value={formData.salary_per_trip || ""}
                  onChange={handleChange}
                  placeholder="Enter salary per trip"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {formData.salary_per_trip > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Formatted: {formatSalary(formData.salary_per_trip)}
                </p>
              )}
            </div>

            {/* Salary Validation Error */}
            {errors.salary && (
              <div className="md:col-span-2">
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {errors.salary}
                </p>
              </div>
            )}

            {/* Salary Summary */}
            {(formData.salary_per_duty > 0 || formData.salary_per_trip > 0) && (
              <div className="md:col-span-2">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Salary Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {formData.salary_per_duty > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Per Duty:</span>
                        <span className="font-semibold text-blue-800">
                          {formatSalary(formData.salary_per_duty)}
                        </span>
                      </div>
                    )}
                    {formData.salary_per_trip > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Per Trip:</span>
                        <span className="font-semibold text-blue-800">
                          {formatSalary(formData.salary_per_trip)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
          </div>

          {/* Action Buttons */}
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
                  <Users className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Driver" : "Create Driver"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/drivers")}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageDriverForm;