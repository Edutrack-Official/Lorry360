import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../../api/client";

interface StudentFormData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
}

const initialFormData: StudentFormData = {
  name: '',
  email: '',
  mobile: '',
  password: 'Password@123',
  role: 'student',
};

const ManageStudentForm: React.FC = () => {
  const { id } = useParams(); // Edit mode if ID exists
  const navigate = useNavigate();

  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<StudentFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(id);
  const instituteId = localStorage.getItem('selectedInstituteId');
  const batchId = localStorage.getItem('selectedBatchId');

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      api
        .get(`/users/${id}`)
        .then((res) => setFormData(res.data))
        .catch(() => toast.error('Failed to fetch student details'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};
    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!/^\+91-\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Format: +91-XXXXXXXXXX';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!instituteId || !batchId) {
      toast.error('Missing institute or batch');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/users/${id}`, {
          ...formData,
          instituteId,
          batchId
        });
        toast.success('Student updated successfully');
      } else {
        await api.post('/createUser', {
          ...formData,
          instituteId,
          batchId
        });
        toast.success('Student created successfully');
        setFormData(initialFormData);
      }
      navigate(-1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {isEditMode ? 'Edit Student' : 'Add Student'}
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

        {/* Mobile */}
        <div>
          <label className="label">Mobile (+91-XXXXXXXXXX)</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="input"
          />
          {errors.mobile && <p className="text-sm text-red-600">{errors.mobile}</p>}
        </div>

        {/* Password */}
        {!isEditMode && (
        <div>
          <label className="label">Password</label>
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            disabled
          />
        </div>
        )}
        

        {/* Role */}
        <div>
          <label className="label">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="input">
            <option value="student">Student</option>
          </select>
        </div>
      </div>

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
            ? 'Update Student'
            : 'Create Student'}
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
  );
};

export default ManageStudentForm;
