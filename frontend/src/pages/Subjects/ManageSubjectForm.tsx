import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import api from "../../api/client";

interface Institute {
  _id: string;
  name: string;
}

interface Subject {
  _id?: string;
  name: string;
  subjectCode: string;
  examId: string;
  instituteId?: string[];
  createdBy?: string;
}

interface Exam {
  _id: string;
  name: string;
  examCode: string;
  instituteId?: string[];
}

interface Props {
  exam: Exam;
  subjectToEdit?: Subject | null;
  onSuccess: (subject: Subject) => void;
  onClose: () => void;
}

const ManageSubjectForm: React.FC<Props> = ({ exam, subjectToEdit, onSuccess, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState(subjectToEdit?.name || '');
  const [subjectCode, setSubjectCode] = useState(subjectToEdit?.subjectCode || '');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState<string[]>(subjectToEdit?.instituteId || []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [errors, setErrors] = useState<{ name?: string; subjectCode?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await api.get('/institutes');
        setInstitutes(res.data.institutes || []);
      } catch {
        toast.error('Failed to load institutes');
      }
    };
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleInstitute = (instituteId: string) => {
    setSelectedInstitutes((prev) =>
      prev.includes(instituteId)
        ? prev.filter((id) => id !== instituteId)
        : [...prev, instituteId]
    );
  };

  const handleSelectAll = () => {
    const ids = filteredInstitutes.map((i) => i._id);
    if (selectedInstitutes.length === ids.length) {
      setSelectedInstitutes([]);
    } else {
      setSelectedInstitutes(ids);
    }
  };

  const filteredInstitutes = institutes.filter(
    (inst) => exam.instituteId?.includes(inst._id) &&
      inst.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const validate = (): boolean => {
    const newErrors: { name?: string; subjectCode?: string } = {};
    
    if (!name.trim() || name.length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }
    
    if (!subjectCode.trim()) {
      newErrors.subjectCode = 'Subject code is required';
    } else if (subjectCode.length < 2) {
      newErrors.subjectCode = 'Subject code must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (exam.instituteId && exam.instituteId.length > 0) {
      if (selectedInstitutes.length === 0) {
        toast.error('Select at least one institute');
        return;
      }
    }

    const payload: Subject = {
      name: name.trim(),
      subjectCode: subjectCode.trim(),
      examId: exam._id,
      createdBy: user?.id,
    };

    if (exam.instituteId && exam.instituteId.length > 0) {
      payload.instituteId = selectedInstitutes;
    }

    try {
      setSubmitting(true);
      const res = subjectToEdit
        ? await api.put(`/subject/${subjectToEdit._id}`, payload)
        : await api.post('/subject/create', payload);

      toast.success(`Subject ${subjectToEdit ? 'updated' : 'created'} successfully`);
      onSuccess(res.data.subject || res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field with Label */}
      <div>
        <label className="label">Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
          }}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Subject Code Field with Label */}
      <div>
        <label className="label">Subject Code</label>
        <input
          type="text"
          className="input input-bordered w-full uppercase"
          value={subjectCode}
          onChange={(e) => {
            setSubjectCode(e.target.value);
            if (errors.subjectCode) setErrors(prev => ({ ...prev, subjectCode: undefined }));
          }}
        />
        {errors.subjectCode && <p className="text-sm text-red-600">{errors.subjectCode}</p>}
      </div>

      {exam.instituteId && exam.instituteId.length > 0 && (
        <div>
          <label className="label">Select Institutes</label>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              className="input input-bordered w-full flex justify-between items-center"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedInstitutes.length > 0
                ? `${selectedInstitutes.length} selected`
                : 'Select Institutes'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow p-3 max-h-60 overflow-auto space-y-2">
                <input
                  type="text"
                  placeholder="Search institutes..."
                  className="input input-bordered w-full mb-2"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedInstitutes.length === filteredInstitutes.length &&
                      filteredInstitutes.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  <span className="font-medium">Select All</span>
                </label>

                {filteredInstitutes.map((institute) => (
                  <label key={institute._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedInstitutes.includes(institute._id)}
                      onChange={() => toggleInstitute(institute._id)}
                    />
                    <span>{institute.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button 
          type="button" 
          onClick={onClose} 
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting 
            ? (subjectToEdit ? 'Updating...' : 'Creating...')
            : (subjectToEdit ? 'Update' : 'Create')
          }
        </button>
      </div>
    </form>
  );
};

export default ManageSubjectForm;