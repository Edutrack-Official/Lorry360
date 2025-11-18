
import React, { useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload"; // your custom uploader
import api from "../../api/client";

interface UploadStudentExcelProps {
  batchId?: string | null;
  instituteId?: string | null;
}

const UploadStudentExcel: React.FC<UploadStudentExcelProps> = ({ batchId: propBatchId, instituteId: propInstituteId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // get user id from localStorage (if available)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?._id || "";

  // resolve ids: prefer props, then query/localStorage
  const finalBatchId = propBatchId || localStorage.getItem("selectedBatchId");
  const finalInstituteId = propInstituteId || localStorage.getItem("selectedInstituteId");

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && !selectedFile.name.endsWith(".xlsx")) {
      toast.error("Please upload a valid Excel (.xlsx) file");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("No file selected");
    if (!finalInstituteId || !finalBatchId) {
      return toast.error("Institute ID or Batch ID missing. Please select them before uploading.");
    }
    if (!userId) return toast.error("User not found. Please login again.");

    const formData = new FormData();
    formData.append("file", file);
    // server expects role/password per user creation route
    formData.append("role", "student");
    formData.append("password", "Password@123"); // default password for imported users
    formData.append("instituteId", finalInstituteId);
    formData.append("batchId", finalBatchId);
    formData.append("createdBy", userId);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const response = await api.post("/importUsers", formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message || "Students uploaded successfully");
      setFile(null);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.response?.data?.error || "Failed to upload Excel";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-6 text-center">Upload Students via Excel</h2>

      {/* Centered File Upload */}
      <div className="flex justify-center mb-6">
        <FileUpload label="Browse Excel File (.xlsx)" onFileSelect={handleFileSelect} />
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>
          Make sure your Excel has columns: <span className="font-medium">name, email, mobile</span>, and optional
          columns: <span className="font-medium">password, instituteId, batchId</span>. If you don't include password,
          a default <span className="font-medium">Password@123</span> will be used.
        </p>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="btn btn-primary mt-2 w-full"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadStudentExcel;
