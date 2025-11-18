import React, { useEffect, useState } from 'react';
import api from "../../api/client";
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Institute {
  _id: string;
  name: string;
}

interface ExamPayload {
  name: string;
  examCode: string;
  createdBy?: string;
  instituteId?: string[];
}

interface ExamFormData {
  name: string;
  examCode: string;
}

interface Props {
  examToEdit?: {
    _id: string;
    name: string;
    examCode: string;
    instituteId: string[];
  };
  institutes: Institute[];
  onClose: () => void;
}

const initialFormData: ExamFormData = {
  name: '',
  examCode: '',
};

const ManageExamForm: React.FC<Props> = ({ examToEdit, institutes, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ExamFormData>(initialFormData);
  const [instituteIds, setInstituteIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ExamFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        name: examToEdit.name,
        examCode: examToEdit.examCode,
      });
      setInstituteIds(examToEdit.instituteId || []);
    }
  }, [examToEdit]);

  const validate = (): boolean => {
    const newErrors: Partial<ExamFormData> = {};
    
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }
    
    if (!formData.examCode.trim()) {
      newErrors.examCode = 'Exam code is required';
    } else if (formData.examCode.length < 2) {
      newErrors.examCode = 'Exam code must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ExamFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const payload: ExamPayload = {
      name: formData.name.trim(),
      examCode: formData.examCode.trim(),
      createdBy: user?.id,
      instituteId: instituteIds.length > 0 ? instituteIds : undefined,
    };

    try {
      setSubmitting(true);
      if (examToEdit) {
        await api.put(`/exam/${examToEdit._id}`, payload);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/exam/create', payload);
        toast.success('Exam created successfully');
      }
      onClose();
      setFormData(initialFormData);
      setInstituteIds([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInstitutes = institutes.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {examToEdit ? 'Edit Exam' : 'Add Exam'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exam Name */}
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="Enter exam name"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Exam Code */}
        <div>
          <label className="label">Exam Code</label>
          <input
            type="text"
            name="examCode"
            value={formData.examCode}
            onChange={handleChange}
            className="input"
            placeholder="Enter unique exam code"
          />
          {errors.examCode && <p className="text-sm text-red-600">{errors.examCode}</p>}
        </div>
      </div>

      {/* Institutes Dropdown */}
      <div className="space-y-2 relative">
        <label className="label">
          Institutes (Optional)
        </label>
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition input"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {instituteIds.length > 0
            ? `${instituteIds.length} selected`
            : '— Select Institutes —'}
        </div>

        {dropdownOpen && (
          <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {/* Search */}
            <input
              className="w-full px-3 py-2 border-b text-sm outline-none"
              placeholder="Search institute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-48 overflow-y-auto">
              {/* None */}
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                onClick={() => {
                  setInstituteIds([]);
                  setDropdownOpen(false);
                }}
              >
                <input type="checkbox" checked={instituteIds.length === 0} readOnly />
                None
              </div>

              {/* Select All */}
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                onClick={() => {
                  if (instituteIds.length === institutes.length) {
                    setInstituteIds([]);
                  } else {
                    setInstituteIds(institutes.map((i) => i._id));
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={instituteIds.length === institutes.length}
                  readOnly
                />
                Select All
              </div>

              {/* Institutes */}
              {filteredInstitutes.map((inst) => (
                <div
                  key={inst._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => {
                    if (instituteIds.includes(inst._id)) {
                      setInstituteIds((prev) => prev.filter((id) => id !== inst._id));
                    } else {
                      setInstituteIds((prev) => [...prev, inst._id]);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={instituteIds.includes(inst._id)}
                    readOnly
                  />
                  {inst.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          type="submit"
          className="btn btn-primary w-full md:w-auto"
          disabled={submitting}
        >
          {submitting
            ? examToEdit
              ? 'Updating...'
              : 'Creating...'
            : examToEdit
            ? 'Update Exam'
            : 'Create Exam'}
        </button>

        {examToEdit && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary w-full md:w-auto"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ManageExamForm;