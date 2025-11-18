import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import FileUpload from "../../components/FileUpload"; // ✅ import your custom file uploader
import api from "../../api/client";

interface UploadQuestionSetExcelProps {
    instituteId: string;
}

const UploadQuestionSetExcel: React.FC<UploadQuestionSetExcelProps> = ({ instituteId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [chapters, setChapters] = useState<any[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<any>(null);

    // 🔑 get user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    // Fetch chapters
    useEffect(() => {
        api
            .get("/chapter/all")
            .then((res) => {
                const chapterList = Array.isArray(res.data)
                    ? res.data
                    : res.data.chapters || [];
                setChapters(chapterList);
            })
            .catch(() => toast.error("Failed to load chapters"));
    }, []);

    // handle file selection from FileUpload
    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile && !selectedFile.name.endsWith(".xlsx")) {
            toast.error("Please upload a valid Excel (.xlsx) file");
            return;
        }
        setFile(selectedFile);
    };

    const handleChapterChange = (selected: any) => {
        setSelectedChapter(selected);
    };

    const handleUpload = async () => {
        if (!file) return toast.error("No file selected");
        if (!selectedChapter) return toast.error("Please select a chapter");
        if (!userId) return toast.error("User not found. Please login again");

        const chapter = chapters.find((ch) => ch._id === selectedChapter.value);
        if (!chapter) return toast.error("Invalid chapter selected");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("chapterId", chapter._id);
        formData.append("examId", chapter.examId?._id || "");
        formData.append("subjectId", chapter.subjectId?._id || "");
        formData.append("instituteIds", instituteId);
        formData.append("createdBy", userId);

        try {
            setUploading(true);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/importQuestionSets",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Question sets uploaded successfully");
            setFile(null);
            setSelectedChapter(null);
        } catch (error: any) {
            const message = error.response?.data?.error || "Failed to upload Excel";
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const chapterOptions =
        Array.isArray(chapters) && chapters.length > 0
            ? chapters.map((ch) => ({
                value: ch._id,
                label: `${ch.name} - ${ch.subjectId?.name || "N/A"} - ${ch.examId?.name || "N/A"
                    }`,
            }))
            : [];

    return (
        <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-6 text-center">
                Upload Question Sets via Excel
            </h2>

            {/* ✅ Centered File Upload */}
            <div className="flex justify-center mb-6">
                <FileUpload
                    label="Browse Excel File (.xlsx)"
                    onFileSelect={handleFileSelect}
                />
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter (auto includes Subject & Exam)
                </label>
                <Select
                    options={chapterOptions}
                    value={selectedChapter}
                    onChange={handleChapterChange}
                    placeholder="Search and select chapter..."
                    isClearable
                    isSearchable
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="btn btn-primary mt-6 w-full"
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default UploadQuestionSetExcel;