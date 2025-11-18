import React, { useEffect, useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";

interface BatchFormData {
  name: string;
  code: string;
  year: string;
  isActive: boolean;
}

const initialFormData: BatchFormData = {
  name: "",
  code: "",
  year: new Date().getFullYear().toString(),
  isActive: true,
};

interface Props {
  instituteId?: string | null;
}

const ManageBatchForm: React.FC<Props> = ({ instituteId }) => {
  const { id } = useParams(); // for edit
  const [searchParams] = useSearchParams();
  const instIdFromQuery = searchParams.get("instituteId");

  const navigate = useNavigate();
  const [formData, setFormData] = useState<BatchFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<BatchFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalInstituteId = instituteId || instIdFromQuery;
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/batches/${id}`)
        .then((res) => setFormData(res.data))
        .catch(() => toast.error("Failed to fetch batch details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Partial<BatchFormData> = {};
    if (!formData.name.trim() || formData.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!/^\d{4}$/.test(formData.year))
      newErrors.year = "Year must be in YYYY format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "isActive"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    if ((errors as any)[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!localStorage.getItem("selectedInstituteId") && !finalInstituteId) {
      toast.error("Institute ID is missing.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/batches/${id}`, {
          ...formData,
          instituteId: localStorage.getItem("selectedInstituteId") || finalInstituteId,
        });
        toast.success("Batch updated successfully");
      } else {
        await api.post("/batch/create", {
          ...formData,
          instituteId: localStorage.getItem("selectedInstituteId") || finalInstituteId,
        });
        toast.success("Batch created successfully");
        setFormData(initialFormData);
      }
      navigate(-1);
    } catch (error: any) {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-b-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        {isEditMode ? "Edit Batch" : "Add Batch"}
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

  {/* Year */}
  <div>
    <label className="label">Year (YYYY)</label>
    <input
      type="text"
      name="year"
      value={formData.year}
      onChange={handleChange}
      className="input"
      placeholder={new Date().getFullYear().toString()}
    />
    {errors.year && <p className="text-sm text-red-600">{errors.year}</p>}
  </div>

  {/* Status toggle */}
  <div className="flex items-center">
    <label className="label flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name="isActive"
        checked={formData.isActive}
        onChange={handleChange}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-gray-700">Active</span>
    </label>
  </div>
</div>  

      <div className="flex flex-col md:flex-row gap-4 pt-4">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md w-full md:w-auto"
          disabled={submitting}
        >
          {submitting ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Batch" : "Create Batch"}
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition shadow-md w-full md:w-auto"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ManageBatchForm;
