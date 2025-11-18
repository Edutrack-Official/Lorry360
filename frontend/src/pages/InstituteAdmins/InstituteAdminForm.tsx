import React, { useEffect, useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import FloatingInput from "../../components/FloatingInput";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { GraduationCap } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  mobile: string;
  password?: string; // only for create
}

const initialFormData: FormData = {
  name: "",
  email: "",
  mobile: "",
  password: "",
};

const InstituteAdminForm: React.FC = () => {
  const { instituteId, id } = useParams(); // 👈 instituteId + adminId
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/users/${id}`)
        .then((res) => {
          setFormData({
            name: res.data.name,
            email: res.data.email,
            mobile: res.data.mobile,
          });
        })
        .catch(() => toast.error("Failed to fetch admin details"))
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim() || formData.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.mobile.trim() || !/^\+\d{6,15}$/.test(formData.mobile))
      newErrors.mobile = "Enter a valid phone number with country code";
    if (!isEditMode && (!formData.password || formData.password.length < 6))
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/users/${id}`, formData);
        toast.success("Center Admin updated successfully");
      } else {
        await api.post("/createUser", {
          ...formData,
          role: "center_admin",
          instituteId,
        });
        toast.success("Center Admin created successfully");
      }
      navigate(`/institutes/${instituteId}/admins`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 🔹 Header section */}
      <div className="bg-white p-5 rounded-t-xl border shadow-md flex items-center gap-3">
        <BackButton />
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          {isEditMode ? "Edit Center Admin" : "Add Center Admin"}
        </h2>
      </div>

      {/* 🔹 Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div>
              <FloatingInput
                name="name"
                value={formData.name}
                onChange={handleChange}
                label="Name"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <FloatingInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Email"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <PhoneInput
                defaultCountry="in"
                value={formData.mobile}
                onChange={(phone) =>
                  setFormData((prev) => ({ ...prev, mobile: phone }))
                }
                className="w-full"
                inputClassName="!w-full !pl-12 !pr-3 !py-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>}
            </div>

            {/* Password (only for Add) */}
            {!isEditMode && (
              <div>
                <FloatingInput
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  label="Password"
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md"
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Admin"
                : "Create Admin"}
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition shadow-md"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteAdminForm;
