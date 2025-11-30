import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
  showLabel?: boolean; // Control label visibility
}

const BackButton: React.FC<BackButtonProps> = ({ 
  label = "Back", 
  className = "",
  showLabel = true 
}) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`inline-flex items-center justify-center gap-2 
                  p-2 sm:px-3 sm:py-2
                  bg-gray-100 text-gray-700 rounded-lg shadow-sm 
                  hover:bg-gray-200 active:scale-95 transition-all
                  font-medium touch-manipulation ${className}`}
    >
      <ArrowLeft size={20} className="text-gray-600 flex-shrink-0" />
      {showLabel && (
        <span className="hidden sm:inline text-sm">
          {label}
        </span>
      )}
    </button>
  );
};

export default BackButton;