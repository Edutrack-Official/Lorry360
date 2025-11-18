import React, { useEffect, useState } from 'react';
import api from "../../api/client";
import toast from 'react-hot-toast';
import ManageExamForm from './ManageExamForm';
import BackButton from "../../components/BackButton";
import { useNavigate } from 'react-router-dom';

interface Institute {
  _id: string;
  name: string;
}

const AddExam = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/institutes')
      .then((res) => setInstitutes(res.data.institutes || []))
      .catch(() => toast.error('Failed to load institutes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <BackButton />
      <h1 className="text-2xl font-semibold">Add Exam</h1>
      <ManageExamForm
        institutes={institutes}
        onClose={() => navigate('/exams')}
      />
    </div>
  );
};

export default AddExam;
