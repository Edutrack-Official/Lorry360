import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";
import { Users, Building, MapPin, Phone, Mail, Key, Eye, EyeOff } from "lucide-react";
import api from "../../api/client";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password?: string; // Make password optional
  role: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  plan_type: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  plan_type?: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "+91-",
  password: "", // Still can have default value
  role: "owner",
  company_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  plan_type: "trial",
};

const ManageOwnerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/users/${id}`)
        .then((res) => {
          const ownerData = res.data.data;
          setFormData({
            name: ownerData.name || "",
            email: ownerData.email || "",
            phone: ownerData.phone || "+91-",
            password: "", // Don't pre-fill password in edit mode
            role: "owner",
            company_name: ownerData.company_name || "",
            address: ownerData.address || "",
            city: ownerData.city || "",
            state: ownerData.state || "",
            pincode: ownerData.pincode || "",
            plan_type: ownerData.plan_type || "trial",
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch owner details");
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+91-?\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be in format +91-xxxxxxxxxx";
    }

    // Password validation only for create mode
    if (!isEditMode && !formData.password) {
      newErrors.password = "Password is required";
    } else if (!isEditMode && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
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
    } else if (name === "pincode") {
      // Only allow numbers and limit to 6 digits
      const digits = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: digits,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Create payload - password is optional so we can safely delete it
      const payload = { ...formData };
      
      // For edit mode, don't send password if empty
      if (isEditMode && !payload.password) {
        delete payload.password;
      }

      if (isEditMode) {
        await api.put(`/users/update/${id}`, payload);
        toast.success("Owner updated successfully");
      } else {
        await api.post("/users/create", payload);
        toast.success("Owner created successfully");
        setFormData(initialFormData);
      }
      navigate("/owners");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
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
        <button
          onClick={() => navigate("/owners")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Users className="w-6 h-6 text-blue-600" />
          {isEditMode ? "Edit Owner" : "Add Owner"}
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
                Personal Information
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

            {/* Email */}
            <div>
              <FloatingInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Email *"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEditMode ? "New Password" : "Password *"}
                {!isEditMode && (
                  <span className="text-xs text-gray-500 ml-1">(leave blank to keep current)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  placeholder={isEditMode ? "Enter new password" : "Enter password"}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <div className="absolute right-3 top-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                    >
                      Generate
                    </button>
                  )}
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {!isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Business Information */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Business Information
              </h3>
            </div>

            {/* Company Name */}
            <div className="md:col-span-2">
              <FloatingInput
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                label="Company Name *"
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
              )}
            </div>

            {/* Plan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type *
              </label>
              <select
                name="plan_type"
                value={formData.plan_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="trial">Trial</option>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
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
                placeholder="Enter complete business address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <FloatingInput
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                label="City *"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <FloatingInput
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                label="State *"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            {/* Pincode */}
            <div>
              <FloatingInput
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                label="Pincode *"
              />
              {errors.pincode && (
                <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
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
                  {isEditMode ? "Update Owner" : "Create Owner"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/owners")}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Owner Management Information
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• All fields marked with * are required</li>
              <li>• Phone number must be in Indian format (+91-xxxxxxxxxx)</li>
              <li>• Pincode must be exactly 6 digits</li>
              <li>• A welcome email with login credentials will be sent to the owner</li>
              <li>• Plan type determines the features available to the owner</li>
              <li>• In edit mode, password is optional - leave blank to keep current password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOwnerForm;