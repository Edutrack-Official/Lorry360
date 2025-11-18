import React, { useState } from "react";
import BackButton from "../../components/BackButton";
import ManageBatchForm from "./ManageBatchForm";
import UploadBatchExcel from "./UploadBatchExcel";

const AddBatch: React.FC = () => {
  const instituteId = localStorage.getItem("selectedInstituteId");
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
            <ManageBatchForm />
          </div>
        ) : instituteId ? (
          <div className="bg-white rounded-b-xl border shadow-md p-6">
            <UploadBatchExcel instituteId={instituteId} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-md p-6 text-center">
            <p className="text-red-600 text-sm sm:text-base">
              Missing institute ID. Please select an institute.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBatch;
