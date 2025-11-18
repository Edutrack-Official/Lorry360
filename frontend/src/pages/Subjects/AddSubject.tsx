import React, { useState, useEffect } from 'react';
import UploadSubjectExcel from './UploadSubjectExcel';
import ManageSubjectForm from './ManageSubjectForm';
import BackButton from '../../components/BackButton';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from "../../api/client";
import toast from 'react-hot-toast';

const AddSubject = () => {
  const [mode, setMode] = useState<'form' | 'excel'>('form');
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, subjectRes] = await Promise.all([
          api.get(`/exam/${examId}`),
          editId ? api.get(`/subject/${editId}`) : Promise.resolve({ data: null }),
        ]);
        setExam(examRes.data);
        setSubjectToEdit(subjectRes.data);
      } catch {
        toast.error('Failed to load exam or subject data');
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchData();
  }, [examId, editId]);

  if (loading) return <p className="text-center py-10 text-gray-500 text-lg">Loading...</p>;
  if (!exam) return <p className="text-center py-10 text-red-600 text-lg">Exam not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="bg-white p-3 sm:p-5 rounded-t-xl border shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <BackButton />
          <h1 className="text-xl font-semibold text-gray-700">
            {editId ? 'Edit Subject' : 'Add Subject'}
          </h1>
        </div>

        {/* Toggle Buttons */}
        <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
          {!editId && (
          <button
            onClick={() => setMode('form')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md text-sm sm:text-base transition-colors ${
              mode === 'form'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Add via Form
          </button>
          )}
          
          {!editId && (
            <button
              onClick={() => setMode('excel')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md text-sm sm:text-base transition-colors ${
                mode === 'excel'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upload Excel
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {mode === 'form' ? (
          <div className="bg-white rounded-b-xl border shadow-md p-6">
            <ManageSubjectForm
              exam={exam}
              subjectToEdit={subjectToEdit}
              onSuccess={() => navigate(-1)}
              onClose={() => navigate(-1)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border shadow-md p-6">
            <UploadSubjectExcel examId={examId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSubject;