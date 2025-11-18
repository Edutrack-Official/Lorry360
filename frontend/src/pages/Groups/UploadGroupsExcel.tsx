import React, { useState } from 'react';
import api from "../../api/client";
import toast from 'react-hot-toast';

interface UploadGroupsExcelProps {
  batchId: string;
}

const UploadGroupsExcel: React.FC<UploadGroupsExcelProps> = ({ batchId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && !selectedFile.name.endsWith('.xlsx')) {
      toast.error('Please upload a valid Excel (.xlsx) file');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('batchId', batchId); // ⬅ Attach batchId

    try {
      setUploading(true);
      const response = await api.post('/importGroups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message || 'Groups uploaded successfully');
      setFile(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload Excel';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Groups via Excel</h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="btn btn-primary"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default UploadGroupsExcel;