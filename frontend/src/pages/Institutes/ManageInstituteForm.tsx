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
  code: string;
  email: string;
  address: string;
  contact: string;
  location: string;
  subscriptionType: string;
  capacity: number;
}

const initialFormData: FormData = {
  name: "",
  code: "",
  email: "",
  address: "",
  contact: "",
  location: "",
  subscriptionType: "",
  capacity: 100,
};

const ManageInstituteForm: React.FC = () => {
  const { id } = useParams();
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
        .get(`/institutes/${id}`)
        .then((res) => setFormData(res.data))
        .catch(() => toast.error("Failed to fetch institute details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim() || formData.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.address.trim() || formData.address.length < 3)
      newErrors.address = "Address must be at least 3 characters";
    if (!formData.contact.trim() || !/^\+91-\d{10}$/.test(formData.contact))
      newErrors.contact = "Contact must be in format +91-xxxxxxxxxx";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.subscriptionType.trim())
      newErrors.subscriptionType = "Subscription type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value,
    }));

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
        await api.put(`/institutes/${id}`, formData);
        toast.success("Institute updated successfully");
      } else {
        await api.post("/institute/create", formData);
        toast.success("Institute created successfully");
        setFormData(initialFormData);
      }
      navigate("/institutes");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
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
          {isEditMode ? "Edit Institute" : "Add Institute"}
        </h2>
      </div>

      {/* 🔹 Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-8">
       <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
  <h2 className="text-xl font-semibold text-gray-700 mb-4">
    {isEditMode ? 'Edit Institute' : 'Add Institute'}
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Name */}
    <div>
      <label className="label">Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="input"
      />
      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
    </div>

    {/* Code */}
    <div>
      <label className="label">Code</label>
      <input
        type="text"
        name="code"
        value={formData.code}
        onChange={handleChange}
        className="input"
      />
      {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
    </div>

    {/* Email */}
    <div>
      <label className="label">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="input"
      />
      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
    </div>

    {/* Contact Number */}
    <div>
      <label className="label">Contact Number (+91-XXXXXXXXXX)</label>
      <input
        type="text"
        name="contact"
        value={formData.contact}
        onChange={(e) => {
          let val = e.target.value;

          // Always start with "+91-"
          if (!val.startsWith("+91-")) {
            val = "+91-" + val.replace(/\+91-?/g, "");
          }

          // Allow only 10 digits after +91-
          const digits = val.slice(4).replace(/\D/g, "").slice(0, 10);
          setFormData((prev) => ({ ...prev, contact: "+91-" + digits }));
        }}
        className="input"
        placeholder="+91-xxxxxxxxxx"
      />
      {errors.contact && <p className="text-sm text-red-600">{errors.contact}</p>}
    </div>

    {/* Location */}
    <div>
      <label className="label">Location</label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        className="input"
      />
      {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
    </div>

    {/* Subscription Type */}
    <div>
      <label className="label">Subscription Type</label>
      <select
        name="subscriptionType"
        value={formData.subscriptionType}
        onChange={handleChange}
        className="input"
      >
        <option value="">Select</option>
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>
      {errors.subscriptionType && <p className="text-sm text-red-600">{errors.subscriptionType}</p>}
    </div>

    {/* Capacity */}
    <div>
      <label className="label">Capacity</label>
      <input
        type="number"
        name="capacity"
        value={formData.capacity.toString()}
        onChange={handleChange}
        className="input"
      />
    </div>

    {/* Address */}
    <div className="md:col-span-2">
      <label className="label">Address</label>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        className="input"
      />
      {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
    </div>
  </div>

  {/* Actions */}
  <div className="flex flex-col md:flex-row gap-4">
    <button
      type="submit"
      className="btn btn-primary w-full md:w-auto"
      disabled={submitting}
    >
      {submitting
        ? isEditMode
          ? 'Updating...'
          : 'Creating...'
        : isEditMode
        ? 'Update Institute'
        : 'Create Institute'}
    </button>

    {isEditMode && (
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-secondary w-full md:w-auto"
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

export default ManageInstituteForm;
