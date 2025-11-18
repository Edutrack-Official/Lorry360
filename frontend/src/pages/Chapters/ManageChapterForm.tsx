import React, { useEffect, useState, useRef } from 'react';
import api from "../../api/client";
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Institute {
  _id: string;
  name: string;
}

interface Chapter {
  _id?: string;
  name: string;
  chapterCode: string;
  subjectId: string;
  examId: string;
  instituteId?: string[];
  createdBy?: string;
}

interface Subject {
  _id: string;
  name: string;
  examId: string;
  instituteId?: string[];
}

interface Props {
  subject: Subject;
  chapterToEdit?: Chapter | null;
  onSuccess: (chapter: Chapter) => void;
  onClose: () => void;
}

const ManageChapterForm: React.FC<Props> = ({ subject, chapterToEdit, onSuccess, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState(chapterToEdit?.name || '');
  const [chapterCode, setChapterCode] = useState(chapterToEdit?.chapterCode || '');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState<string[]>(chapterToEdit?.instituteId || []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [errors, setErrors] = useState<{ name?: string; chapterCode?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subject.instituteId && subject.instituteId.length > 0) {
      const fetchInstitutes = async () => {
        try {
          const res = await api.get('/institutes');
          const subjectInstitutes = res.data.institutes.filter((inst: Institute) =>
            subject.instituteId?.includes(inst._id)
          );
          setInstitutes(subjectInstitutes);
        } catch {
          toast.error('Failed to load institutes');
        }
      };
      fetchInstitutes();
    }
  }, [subject]);

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

  const filteredInstitutes = institutes.filter((inst) =>
    inst.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const validate = (): boolean => {
    const newErrors: { name?: string; chapterCode?: string } = {};
    
    if (!name.trim() || name.length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }
    
    if (!chapterCode.trim()) {
      newErrors.chapterCode = 'Chapter code is required';
    } else if (chapterCode.length < 2) {
      newErrors.chapterCode = 'Chapter code must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (subject.instituteId && subject.instituteId.length > 0 && selectedInstitutes.length === 0) {
      toast.error('Select at least one institute');
      return;
    }

    const payload: Chapter = {
      name: name.trim(),
      chapterCode: chapterCode.trim(),
      subjectId: subject._id,
      examId: subject.examId,
      createdBy: user?.id,
    };

    if (subject.instituteId && subject.instituteId.length > 0 && selectedInstitutes.length > 0) {
      payload.instituteId = selectedInstitutes;
    }

    try {
      setSubmitting(true);
      const res = chapterToEdit
        ? await api.put(`/chapter/update/${chapterToEdit._id}`, payload)
        : await api.post('/chapter/create', payload);

      toast.success(`Chapter ${chapterToEdit ? 'updated' : 'created'} successfully`);
      onSuccess(res.data.chapter || res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save chapter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {chapterToEdit ? 'Edit Chapter' : 'Add Chapter'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field with Label */}
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            placeholder="Chapter Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            className="input"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Chapter Code Field with Label */}
        <div>
          <label className="label">Chapter Code</label>
          <input
            type="text"
            placeholder="Chapter Code"
            value={chapterCode}
            onChange={(e) => {
              setChapterCode(e.target.value);
              if (errors.chapterCode) setErrors(prev => ({ ...prev, chapterCode: undefined }));
            }}
            className="input"
          />
          {errors.chapterCode && <p className="text-sm text-red-600">{errors.chapterCode}</p>}
        </div>

        {/* Institutes Dropdown */}
        {subject.instituteId && subject.instituteId.length > 0 && (
          <div className="md:col-span-2">
            <label className="label">Select Institutes</label>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                className="input w-full flex justify-between items-center cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>
                  {selectedInstitutes.length > 0
                    ? `${selectedInstitutes.length} selected`
                    : 'Select Institutes'}
                </span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  <input
                    type="text"
                    placeholder="Search institutes..."
                    className="w-full px-3 py-2 border-b text-sm outline-none"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />

                  <div className="max-h-48 overflow-y-auto">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                      onClick={handleSelectAll}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedInstitutes.length === filteredInstitutes.length &&
                          filteredInstitutes.length > 0
                        }
                        readOnly
                      />
                      Select All
                    </div>

                    {filteredInstitutes.map((institute) => (
                      <div
                        key={institute._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                        onClick={() => toggleInstitute(institute._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInstitutes.includes(institute._id)}
                          readOnly
                        />
                        {institute.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            ? chapterToEdit
              ? 'Updating...'
              : 'Creating...'
            : chapterToEdit
            ? 'Update Chapter'
            : 'Create Chapter'}
        </button>

        {chapterToEdit && (
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

export default ManageChapterForm;