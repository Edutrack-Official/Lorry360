// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import BackButton from '../../components/BackButton';
// import ManageStudentForm from './ManageStudentForm';
// import UploadStudentExcel from './UploadStudentExcel';

// const AddStudent = () => {
//   const [mode, setMode] = useState<'form' | 'excel'>('form');
//   const navigate = useNavigate();

//   return (
//     <div>
//       <BackButton />
//       <h1 className="text-2xl font-semibold mb-4">Add Student</h1>

//       <div className="flex space-x-4 mb-6">
//         <button
//           onClick={() => setMode('form')}
//           className={`btn ${mode === 'form' ? 'btn-primary' : 'btn-outline'}`}
//         >
//           Add via Form
//         </button>
//         <button
//           onClick={() => setMode('excel')}
//           className={`btn ${mode === 'excel' ? 'btn-primary' : 'btn-outline'}`}
//         >
//           Upload Excel
//         </button>
//       </div>

//       {mode === 'form' ? <ManageStudentForm /> : <UploadStudentExcel />}
//     </div>
//   );
// };

// export default AddStudent;

import React, { useState } from "react";
import BackButton from "../../components/BackButton";
import ManageStudentForm from "./ManageStudentForm";
import UploadStudentExcel from "./UploadStudentExcel";

const AddStudent: React.FC = () => {
  const batchId = localStorage.getItem("selectedBatchId");
  const [mode, setMode] = useState<"form" | "excel">("form");

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="bg-white p-3 sm:p-5 rounded-t-xl border shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <BackButton />
        </div>

        {/* Toggle Buttons */}
        <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setMode("form")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md text-sm sm:text-base transition-colors ${
              mode === "form"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Add via Form
          </button>

          <button
            onClick={() => setMode("excel")}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md text-sm sm:text-base transition-colors ${
              mode === "excel"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upload Excel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {mode === "form" ? (
          <div className="bg-white rounded-b-xl border shadow-md p-6">
            <ManageStudentForm />
          </div>
        ) : batchId ? (
          <div className="bg-white rounded-b-xl border shadow-md p-6">
            <UploadStudentExcel batchId={batchId} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-md p-6 text-center">
            <p className="text-red-600 text-sm sm:text-base">
              Missing batch ID. Please select a batch before uploading via Excel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;

