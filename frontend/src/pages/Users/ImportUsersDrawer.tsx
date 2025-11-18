import React, { useState } from "react";
import toast from "react-hot-toast";
import { X, Upload, FileText, Download, AlertCircle } from "lucide-react";
import api from "../../api/client";


const ROLES = [
  { value: "student", label: "Student" },
  { value: "trainer", label: "Trainer" },
  { value: "center_admin", label: "Center Admin" },
  { value: "content_admin", label: "Content Admin" },
];

interface Institute {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  name: string;
}

interface Props {
  institutes: Institute[];
  batches: Batch[];
  onClose: () => void;
  onSuccess: () => void;
}

const ImportUsersDrawer: React.FC<Props> = ({ institutes, batches, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = "name,email,mobile\nJohn Doe,john@example.com,+91-9876543210\nJane Smith,jane@example.com,+91-9876543211";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user-import-template.csv";
    a.click();
    toast.success("Template downloaded");
  };

  const validateForm = () => {
    if (!file) {
      toast.error("Please select a file");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (role === "student" && (!instituteId || !batchId)) {
      toast.error("Institute and Batch are required for students");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("role", role);
      formData.append("password", password);
      if (instituteId) formData.append("instituteId", instituteId);
      if (batchId) formData.append("batchId", batchId);

      const res = await api.post(`/importUsers`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Import completed! Created: ${res.data.createdCount}, Updated: ${res.data.updatedCount}`
      );
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to import users");
    } finally {
      setUploading(false);
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
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Import Users</h3>
              <p className="text-purple-100 text-sm">
                Bulk upload users from Excel file
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
          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Import Instructions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Download the template file below</li>
                  <li>• Fill in user details: name, email, mobile</li>
                  <li>• Upload the completed Excel file</li>
                  <li>• All users will get the same password initially</li>
                  <li>• Existing emails will be updated, new ones created</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template */}
          <div>
            <button
              onClick={handleDownloadTemplate}
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 text-blue-700 font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Template File
            </button>
          </div>

          {/* File Upload */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
              Upload File
            </h4>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-all">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  {file ? file.name : "Click to upload Excel file"}
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx and .xls files
                </p>
              </label>
            </div>
          </div>

          {/* User Settings */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
              User Settings
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Password *
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter default password for all users"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  All imported users will get this password
                </p>
              </div>

              {role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Institute *
                    </label>
                    <select
                      value={instituteId}
                      onChange={(e) => setInstituteId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Institute</option>
                      {institutes.map((inst) => (
                        <option key={inst._id} value={inst._id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Batch *
                    </label>
                    <select
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview Info */}
          {file && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2">Ready to Import</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• File: {file.name}</p>
                <p>• Role: {ROLES.find((r) => r.value === role)?.label}</p>
                {role === "student" && (
                  <>
                    <p>• Institute: {institutes.find((i) => i._id === instituteId)?.name || "Not selected"}</p>
                    <p>• Batch: {batches.find((b) => b._id === batchId)?.name || "Not selected"}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {uploading ? "Importing..." : "Import Users"}
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

export default ImportUsersDrawer;