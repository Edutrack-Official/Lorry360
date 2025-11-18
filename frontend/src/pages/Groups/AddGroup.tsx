
// Updated AddGroup component
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
;
import BackButton from '../../components/BackButton';
import ManageGroupForm from './ManageGroupForm';
import UploadGroupsExcel from './UploadGroupsExcel';

const AddGroup = () => {
    
  const { batchId } = useParams(); // Get batchId from URL params
  const [mode, setMode] = useState<'form' | 'excel'>('form');

  return (
    <div>
      <BackButton />
      <h1 className="text-2xl font-semibent mb-4">Add Group</h1>

      <div className="flex space-x-4 mb-6">
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

      {mode === 'form' ? (
        <ManageGroupForm batchId={batchId} />
      ) : batchId ? (
        <UploadGroupsExcel batchId={batchId} />
      ) : (
        <p className="text-red-600">Missing batch ID.</p>
      )}
    </div>
  );
};

export default AddGroup;