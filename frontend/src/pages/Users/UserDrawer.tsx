import React, { useState, useEffect } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { X, Save, User, Mail, Phone, Shield, Building, GraduationCap, Key, Eye, EyeOff } from "lucide-react";


const ROLES = [
  { value: "superadmin", label: "Super Admin" },
  { value: "center_admin", label: "Center Admin" },
  { value: "trainer", label: "Trainer" },
  { value: "student", label: "Student" },
  { value: "content_admin", label: "Content Admin" },
];

const PERMISSIONS = [
  { value: "*", label: "All Permissions (*)" },
  { value: "content:crud:own", label: "Content CRUD (Own)" },
  { value: "content:view:all", label: "Content View (All)" },
  { value: "content:crud:all", label: "Content CRUD (All)" },
];

interface UserData {
  _id?: string;
  name: string;
  email: string;
  role: string;
  mobile: string;
  password?: string;
  permissions: string[];
  instituteId: string | null;
  batchId: string | null;
  profileImageUrl: string;
  isActive: boolean;
}

interface Institute {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  name: string;
}

interface Props {
  user: any;
  institutes: Institute[];
  batches: Batch[];
  onClose: () => void;
  onSuccess: () => void;
}

const UserDrawer: React.FC<Props> = ({ user, institutes, batches, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    role: "student",
    mobile: "+91-",
    password: "",
    permissions: [],
    instituteId: null,
    batchId: null,
    profileImageUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "student",
        mobile: user.mobile || "+91-",
        password: "", // Don't pre-fill password
        permissions: user.permissions || [],
        instituteId: user.instituteId?._id || null,
        batchId: user.batchId?._id || null,
        profileImageUrl: user.profileImageUrl || "",
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const handleChange = (field: keyof UserData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions };
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.mobile.match(/^\+91-?\d{10}$/)) {
      toast.error("Mobile must be in format +91-xxxxxxxxxx");
      return false;
    }
    if (!user && !formData.password) {
      toast.error("Password is required for new users");
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (formData.role === "student" && (!formData.instituteId || !formData.batchId)) {
      toast.error("Institute and Batch are required for students");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        mobile: formData.mobile,
        permissions: formData.permissions,
        instituteId: formData.instituteId,
        batchId: formData.batchId,
        profileImageUrl: formData.profileImageUrl,
        isActive: formData.isActive,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (user) {
        // Update existing user
        await api.put(`/users/${user._id}`, payload);
        toast.success("User updated successfully");
      } else {
        // Create new user
        await api.post(`/users`, payload);
        toast.success("User created successfully");
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {user ? "Edit User" : "Add New User"}
              </h3>
              <p className="text-blue-100 text-sm">
                {user ? "Update user information" : "Create a new user account"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
              Basic Information
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!user}
                  />
                </div>
                {user && (
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: +91-xxxxxxxxxx</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {user ? "New Password (leave blank to keep current)" : "Password *"}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder={user ? "Enter new password" : "Enter password"}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
              Role & Permissions
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {PERMISSIONS.map((perm) => (
                    <label
                      key={perm.value}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.value)}
                        onChange={() => handlePermissionToggle(perm.value)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{perm.label}</p>
                        <p className="text-xs text-gray-500">{perm.value}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Institute & Batch (for students) */}
          {formData.role === "student" && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Institute & Batch
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institute *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.instituteId || ""}
                      onChange={(e) => handleChange("instituteId", e.target.value || null)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst._id} value={inst._id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Batch *
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.batchId || ""}
                      onChange={(e) => handleChange("batchId", e.target.value || null)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Settings */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
              Additional Settings
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => handleChange("profileImageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Active Status</p>
                  <p className="text-xs text-gray-500">
                    User can login and access the system
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : user ? "Update User" : "Create User"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default UserDrawer;