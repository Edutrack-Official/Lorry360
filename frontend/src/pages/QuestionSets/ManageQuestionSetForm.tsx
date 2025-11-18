import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import FloatingInput from "../../components/FloatingInput";
import { PlusCircle } from "lucide-react";
import api from "../../api/client";

interface FormData {
    name: string;
    code: string;
    chapterId: string;
    examId: string;
    subjectId: string;
    instituteId: string[];
    isActive: boolean;
    createdBy?: string | null;
    lastUpdatedBy?: string | null;
}

const initialFormData: FormData = {
    name: "",
    code: "",
    chapterId: "",
    examId: "",
    subjectId: "",
    instituteId: [],
    isActive: true,
};

const ManageQuestionSetForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState<any[]>([]);
    const [institutes, setInstitutes] = useState<any[]>([]);

    const isEditMode = Boolean(id);

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

    // Fetch institutes
    useEffect(() => {
        api
            .get("/institutes")
            .then((res) => {
                const instituteList = Array.isArray(res.data)
                    ? res.data
                    : res.data.institutes || [];
                setInstitutes(instituteList.filter((inst: any) => inst.isActive));
            })
            .catch(() => toast.error("Failed to load institutes"));
    }, []);

    // Fetch data if editing
    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            api
                .get(`/questionset/${id}`)
                .then((res) => {
                    const data = res.data;
                    setFormData({
                        name: data.name || "",
                        code: data.code || "",
                        chapterId: data.chapterId?._id || "",
                        examId: data.examId?._id || "",
                        subjectId: data.subjectId?._id || "",
                        instituteId: data.instituteId?.map((i: any) => i._id) || [],
                        isActive: data.isActive ?? true,
                    });
                })
                .catch(() => toast.error("Failed to fetch question set details"))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim() || formData.name.length < 3)
            newErrors.name = "Name must be at least 3 characters";
        if (!formData.code.trim())
            newErrors.code = "Code is required";
        if (!formData.chapterId)
            newErrors.chapterId = "Chapter is required";
        if (!formData.examId)
            newErrors.examId = "Exam is required";
        if (!formData.subjectId)
            newErrors.subjectId = "Subject is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // When selecting chapter → auto fill examId & subjectId
    const handleChapterChange = (selected: any) => {
        if (selected) {
            const chapter = chapters.find((ch) => ch._id === selected.value);
            setFormData((prev) => ({
                ...prev,
                chapterId: selected.value,
                examId: chapter?.examId?._id || "",
                subjectId: chapter?.subjectId?._id || "",
            }));

            // Clear chapter error if it exists
            if (errors.chapterId) {
                setErrors((prev) => ({ ...prev, chapterId: undefined }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                chapterId: "",
                examId: "",
                subjectId: "",
            }));
        }
    };

    // Handle institutes selection
    const handleInstitutesChange = (selected: any) => {
        const selectedIds = selected ? selected.map((opt: any) => opt.value) : [];
        setFormData((prev) => ({
            ...prev,
            instituteId: selectedIds,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            let userId: string | null = null;
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    userId = parsedUser?.id || parsedUser?._id || null;
                } catch {
                    console.warn("Invalid user object in localStorage");
                }
            }

            if (isEditMode) {
                const payload = {
                    ...formData,
                    lastUpdatedBy: userId,
                };
                await api.put(
                    `/questionset/update/${id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                toast.success("Question Set updated successfully");
            } else {
                const payload = {
                    ...formData,
                    createdBy: userId,
                };
                await api.post(
                    "/questionset/create",
                    payload
                );
                toast.success("Question Set created successfully");
                setFormData(initialFormData);
            }
            navigate("/questionsets");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;

    const chapterOptions =
        Array.isArray(chapters) && chapters.length > 0
            ? chapters.map((ch) => ({
                value: ch._id,
                label: `${ch.name} - ${ch.subjectId?.name || "N/A"} - ${ch.examId?.name || "N/A"}`,
            }))
            : [];

    const instituteOptions =
        Array.isArray(institutes) && institutes.length > 0
            ? institutes.map((inst) => ({
                value: inst._id,
                label: `${inst.name} (${inst.code})`,
            }))
            : [];

    // Get selected chapter details for display
    const selectedChapter = chapters.find((ch) => ch._id === formData.chapterId);

    return (
        <div className="bg-white rounded-b-xl border shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="label">Question Set Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Question Set Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Code */}
                    <div>
                        <label className="label">Question Set Code</label>
                        <input
                            type="text"
                            name="code"
                            placeholder="Question Set  Code"
                            value={formData.code}
                            onChange={handleChange}
                            className="input"
                        />
                        {errors.code && (
                            <p className="text-sm text-red-600">{errors.code}</p>
                        )}
                    </div>

                    {/* Chapter Selection - Full Width */}
                    <div className="md:col-span-2">
                        <label className="label">Chapter *</label>
                        <Select
                            options={chapterOptions}
                            value={chapterOptions.find(
                                (opt) => opt.value === formData.chapterId
                            )}
                            onChange={handleChapterChange}
                            placeholder="Search and select chapter..."
                            isClearable
                            isSearchable
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {errors.chapterId && (
                            <p className="text-sm text-red-600">{errors.chapterId}</p>
                        )}
                    </div>

                    {/* Auto-filled Exam (Read-only) */}
                    <div>
                        <label className="label">Exam (Auto-filled)</label>
                        <input
                            type="text"
                            value={selectedChapter?.examId?.name || ""}
                            readOnly
                            className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                            placeholder="Will be auto-filled when chapter is selected"
                        />
                    </div>

                    {/* Auto-filled Subject (Read-only) */}
                    <div>
                        <label className="label">Subject (Auto-filled)</label>
                        <input
                            type="text"
                            value={selectedChapter?.subjectId?.name || ""}
                            readOnly
                            className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                            placeholder="Will be auto-filled when chapter is selected"
                        />
                    </div>

                    {/* Institutes Selection - Full Width */}
                    <div className="md:col-span-2">
                        <label className="label">Institutes (Optional)</label>
                        <Select
                            isMulti
                            options={instituteOptions}
                            value={instituteOptions.filter((opt) =>
                                formData.instituteId.includes(opt.value)
                            )}
                            onChange={handleInstitutesChange}
                            placeholder="Select institutes..."
                            isClearable
                            isSearchable
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Active Status
                        </label>
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
                                ? "Updating..."
                                : "Creating..."
                            : isEditMode
                                ? "Update Question Set"
                                : "Create Question Set"}
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
    );
};

export default ManageQuestionSetForm;