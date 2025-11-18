// src/pages/Questions/UploadQuestionExcel.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import FileUpload from "../../components/FileUpload"; // ✅ import your reusable FileUpload
import api from "../../api/client";

interface UploadQuestionExcelProps {
    questionSetId: string; // 👈 required
}

const UploadQuestionExcel: React.FC<UploadQuestionExcelProps> = ({
    questionSetId,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // ✅ handler for FileUpload component
    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile && !selectedFile.name.endsWith(".xlsx")) {
            toast.error("Please upload a valid Excel (.xlsx) file");
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("questionSetId", questionSetId);

        try {
            setUploading(true);
            const response = await api.post(
                "/importQuestions",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            toast.success(
                response.data.message || "Questions uploaded successfully"
            );
            setFile(null);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Failed to upload Excel";
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-6 text-center">
                Upload Questions via Excel
            </h2>

            {/* ✅ Centered FileUpload component */}
            <div className="flex justify-center mb-6">
                <FileUpload
                    label="Browse Excel File (.xlsx)"
                    onFileSelect={handleFileSelect}
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="btn btn-primary w-full"
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default UploadQuestionExcel;
