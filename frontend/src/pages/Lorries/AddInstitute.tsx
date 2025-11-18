// src/pages/AddInstitute.tsx
import React, { useState } from 'react';
import UploadInstituteExcel from './UploadInstituteExcel';
import { useNavigate } from 'react-router-dom';
import ManageInstituteForm from './ManageInstituteForm';
import BackButton from '../../components/BackButton';


const AddInstitute = () => {
  const [mode, setMode] = useState<'form' | 'excel'>('form');
  const navigate = useNavigate(); // 👈 for back navigation

  return (
    <div>

      {/* <h1 className="text-2xl font-semibold mb-4">Add Institute</h1> */}

       <ManageInstituteForm />

      {/* <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode('form')}
          className={`btn ${mode === 'form' ? 'btn-primary' : 'btn-outline'}`}
        >
          Add via Form
        </button>
        <button
          onClick={() => setMode('excel')}
          className={`btn ${mode === 'excel' ? 'btn-primary' : 'btn-outline'}`}
        >
          Upload Excel
        </button>
      </div>

      {mode === 'form' ? <ManageInstituteForm /> : <UploadInstituteExcel />} */}
    </div>
  );
};

export default AddInstitute;
