import React, { useEffect, useState } from 'react';
import api from "../../api/client";
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Users, Check } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface Student {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isActive: boolean;
}

interface GroupFormData {
  name: string;
  candidateIds: string[];
  isActive: boolean;
}

interface ErrorMessage {
  name: string;
  candidate: string
}

const initialFormData: GroupFormData = {
  name: '',
  candidateIds: [],
  isActive: true
};

interface Props {
  batchId?: string | null;
}

const ManageGroupForm: React.FC<Props> = ({ batchId }) => {
  const { id } = useParams(); // for edit
  const [searchParams] = useSearchParams();
  const batchIdFromQuery = searchParams.get('batchId');

  const navigate = useNavigate();
  const [formData, setFormData] = useState<GroupFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ErrorMessage>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Students data and search state
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  
  // Add this state to track if group data has been loaded
  const [groupDataLoaded, setGroupDataLoaded] = useState(false);

  const finalBatchId = batchId || batchIdFromQuery || localStorage.getItem("selectedBatchId");
  const isEditMode = Boolean(id);

  // Fetch students for the batch
  const fetchStudents = async () => {
    try {
      const res = await api.get(`/students/batch/${finalBatchId}`);
      const activeStudents = res.data.students.filter((s: Student) => s.isActive);
      setStudents(activeStudents);
      setFilteredStudents(activeStudents);
    } catch (error) {
      console.error('Failed to fetch students', error);
      toast.error('Failed to fetch students');
    }
  };

  // Fetch group data for edit mode
  const fetchGroupData = async () => {
    if (!isEditMode) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/group/${id}`);
      console.log("res", res);
      
      const groupData = res.data;
      
      setFormData({
        name: groupData.name,
        candidateIds: groupData.candidateIds || [],
        isActive: groupData.isActive
      });
      
      setGroupDataLoaded(true);
    } catch (error) {
      console.error('Failed to fetch group details', error);
      toast.error('Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (finalBatchId) {
      fetchStudents();
    }
    fetchGroupData();
  }, [finalBatchId, id]);

  // Filter students based on search
  useEffect(() => {
    if (studentSearch.trim() === '') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter(student => 
          student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.email.toLowerCase().includes(studentSearch.toLowerCase())
        )
      );
    }
  }, [studentSearch, students]);

  const validate = (): boolean => {
    const newErrors: Partial<ErrorMessage> = {};
    if (!formData.name.trim() || formData.name.length < 3)
      newErrors.name = 'Group name must be at least 3 characters';
    if (formData.candidateIds.length === 0)
      newErrors.candidate = 'Please select at least one student';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentId: string) => {
    setFormData(prev => {
      const isSelected = prev.candidateIds.includes(studentId);
      if (isSelected) {
        return {
          ...prev,
          candidateIds: prev.candidateIds.filter(id => id !== studentId)
        };
      } else {
        return {
          ...prev,
          candidateIds: [...prev.candidateIds, studentId]
        };
      }
    });
  };

  const handleSelectAll = () => {
    const allFilteredStudentIds = filteredStudents.map(student => student._id);
    const allSelected = allFilteredStudentIds.every(id => formData.candidateIds.includes(id));
    
    if (allSelected) {
      // Deselect all filtered students
      setFormData(prev => ({
        ...prev,
        candidateIds: prev.candidateIds.filter(id => !allFilteredStudentIds.includes(id))
      }));
    } else {
      // Select all filtered students (add only those not already selected)
      const newSelections = allFilteredStudentIds.filter(id => !formData.candidateIds.includes(id));
      setFormData(prev => ({
        ...prev,
        candidateIds: [...prev.candidateIds, ...newSelections]
      }));
    }
  };

  const isStudentSelected = (studentId: string) => formData.candidateIds.includes(studentId);
  
  const isAllSelected = () => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every(student => formData.candidateIds.includes(student._id));
  };

  const isSomeSelected = () => {
    return filteredStudents.some(student => formData.candidateIds.includes(student._id)) && !isAllSelected();
  };

  const getSelectedStudents = () => {
    return students.filter(student => formData.candidateIds.includes(student._id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const userId = localStorage.getItem("userId") || "temp-user-id";
    if (!finalBatchId) {
      toast.error('Batch ID is missing.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/group/${id}`, {
          ...formData,
          lastUpdatedBy: userId
        });
        toast.success('Group updated successfully');
      } else {
        await api.post('/group/create', {
          ...formData,
          batchId: finalBatchId,
          createdBy: userId
        });
        toast.success('Group created successfully');
        setFormData(initialFormData);
      }
      navigate(-1);
    } catch (error: any) {
      console.log("error", error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div>
      <BackButton />

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {isEditMode ? 'Edit Group' : 'Add Group'}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className="label">Group Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter group name"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Student Selection */}
          <div>
            <label className="label">
              Select Students ({formData.candidateIds.length} selected)
            </label>
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="input pl-10"
                placeholder="Search students by name or email..."
              />
            </div>

            {/* Select All Checkbox */}
            {filteredStudents.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    {isSomeSelected() && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">
                    Select All ({filteredStudents.length} students)
                  </span>
                </label>
              </div>
            )}

            {/* Students List with Checkboxes */}
            {filteredStudents.length > 0 ? (
              <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student._id}
                    className={`flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                      index !== filteredStudents.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                    onClick={() => handleStudentToggle(student._id)}
                  >
                    <input
                      type="checkbox"
                      checked={isStudentSelected(student._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStudentToggle(student._id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{student.name}</p>
                      <p className="text-sm text-gray-500 truncate">{student.email}</p>
                      <p className="text-xs text-gray-400">{student.mobile}</p>
                    </div>
                    
                    {isStudentSelected(student._id) && (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : studentSearch ? (
              <div className="text-center py-8 text-gray-500">
                No students found matching "{studentSearch}"
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No students available in this batch
              </div>
            )}

            {errors.candidate && <p className="text-sm text-red-600 mt-2">{errors.candidate}</p>}
          </div>

          {/* Selected Students Summary */}
          {formData.candidateIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                Selected Students ({formData.candidateIds.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedStudents().map((student) => (
                  <span
                    key={student._id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {student.name}
                  </span>
                ))}
              </div>
            </div>
          )}
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
              ? 'Update Group'
              : 'Create Group'}
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

export default ManageGroupForm;