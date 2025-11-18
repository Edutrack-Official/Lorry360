import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

interface BackButtonProps {
  label?: string; // optional "Back" text
  className?: string; // extra styles
}

const BackButton: React.FC<BackButtonProps> = ({ label = "Back", className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`inline-flex items-center gap-2 px-3 py-2 
                  bg-gray-100 text-gray-700 rounded-lg shadow-sm 
                  hover:bg-gray-200 hover:scale-105 transition 
                  font-medium ${className}`}
    >
      <IoIosArrowBack size={22} className="text-gray-600" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
