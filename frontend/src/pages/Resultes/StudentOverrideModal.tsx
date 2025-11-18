import React, { useState, useEffect } from "react";
import { User, X, Save } from "lucide-react";

// Configuration state type for student overrides only
type StudentOverrideState = {
  studentId: string;
  isRetakeAllowed: boolean;
  isResumeAllowed: boolean;
  allowedAttempts: number;
  extraTimeInMinutes: number;
  grantedBy?: string;
};

interface Props {
  student: any; // Student object
  override: StudentOverrideState | null;
  onSave: (overrideData: StudentOverrideState) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  defaultConfig?: {
    isRetakeAllowed: boolean;
    maxAttempts: number;
    isResumeAllowed: boolean;
  };
}

const StudentOverrideModal: React.FC<Props> = ({
  student,
  override,
  onSave,
  onCancel,
  saving,
  defaultConfig
}) => {
  const [config, setConfig] = useState<StudentOverrideState>({
    studentId: student._id,
    isRetakeAllowed: false,
    isResumeAllowed: false,
    allowedAttempts: 1,
    extraTimeInMinutes: 0,
  });
  
  const [validationError, setValidationError] = useState<string>("");
  const [extraTimeInput, setExtraTimeInput] = useState<string>("");
  const [attemptsInput, setAttemptsInput] = useState<string>("");

  // Initialize form with existing override or defaults
  useEffect(() => {
    if (override) {
      setConfig(override);
      setExtraTimeInput(override.extraTimeInMinutes.toString());
      setAttemptsInput(override.allowedAttempts.toString());
    } else if (defaultConfig) {
      const initialConfig = {
        studentId: student._id,
        isRetakeAllowed: defaultConfig.isRetakeAllowed,
        isResumeAllowed: defaultConfig.isResumeAllowed,
        allowedAttempts: defaultConfig.maxAttempts,
        extraTimeInMinutes: 0,
      };
      setConfig(initialConfig);
      setExtraTimeInput("");
      setAttemptsInput(defaultConfig.maxAttempts.toString());
    }
  }, [override, student._id, defaultConfig]);

  const handleSave = async () => {
    if (validationError) {
      return;
    }
    await onSave(config);
  };

  const handleExtraTimeChange = (inputString: string) => {
    setValidationError("");
    
    if (inputString === "") {
      setExtraTimeInput("");
      setConfig({ 
        ...config, 
        extraTimeInMinutes: 0
      });
      return;
    }
    
    if (!/^\d*$/.test(inputString)) {
      return;
    }
    
    const newValue = parseInt(inputString, 10);
    
    if (isNaN(newValue)) {
      setExtraTimeInput("");
      setConfig({ 
        ...config, 
        extraTimeInMinutes: 0
      });
      return;
    }
    
    const originalValue = override?.extraTimeInMinutes || 0;
    
    setExtraTimeInput(inputString);
    setConfig({ 
      ...config, 
      extraTimeInMinutes: newValue
    });
  };

  const handleAttemptsChange = (inputString: string) => {
    if (inputString === "") {
      setAttemptsInput("");
      setConfig({ 
        ...config, 
        allowedAttempts: 1
      });
      return;
    }
    
    if (!/^\d*$/.test(inputString)) {
      return;
    }
    
    const newValue = parseInt(inputString, 10);
    
    if (isNaN(newValue)) {
      setAttemptsInput("");
      setConfig({ 
        ...config, 
        allowedAttempts: 1
      });
      return;
    }
    
    setAttemptsInput(inputString);
    setConfig({ 
      ...config, 
      allowedAttempts: newValue
    });
  };

  const handleExtraTimeBlur = () => {
    const currentValue = config.extraTimeInMinutes;
    const originalValue = override?.extraTimeInMinutes || 0;
    
    if (override && currentValue < originalValue) {
      setValidationError("Extra time can only be increased, not decreased. Please enter a value greater than or equal to the current extra time.");
      setConfig({ 
        ...config, 
        extraTimeInMinutes: originalValue
      });
      setExtraTimeInput(originalValue.toString());
      return;
    }
    
    if (currentValue > 180) {
      setValidationError("Extra time cannot exceed 180 minutes (3 hours).");
      const maxValue = Math.min(currentValue, 180);
      setConfig({ 
        ...config, 
        extraTimeInMinutes: maxValue
      });
      setExtraTimeInput(maxValue.toString());
      return;
    }
    
    if (currentValue < 0) {
      setValidationError("Extra time cannot be negative.");
      setConfig({ 
        ...config, 
        extraTimeInMinutes: 0
      });
      setExtraTimeInput("0");
      return;
    }
    
    setExtraTimeInput(currentValue.toString());
  };

  const handleAttemptsBlur = () => {
    const currentValue = config.allowedAttempts;
    
    if (currentValue < 1) {
      setConfig({ 
        ...config, 
        allowedAttempts: 1
      });
      setAttemptsInput("1");
      return;
    }
    
    if (!config.isRetakeAllowed && currentValue > 1) {
      setConfig({ 
        ...config, 
        allowedAttempts: 1
      });
      setAttemptsInput("1");
      return;
    }
    
    setAttemptsInput(currentValue.toString());
  };

  const hasChanges = override ? 
    config.isRetakeAllowed !== override.isRetakeAllowed ||
    config.isResumeAllowed !== override.isResumeAllowed ||
    config.allowedAttempts !== override.allowedAttempts ||
    config.extraTimeInMinutes !== override.extraTimeInMinutes
    : true;

  const isSaveDisabled = saving || !hasChanges || !!validationError;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onCancel}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Student Override</h3>
              <p className="text-sm text-white/80 mt-1">
                Custom settings for {student.name}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Student Info */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-500">{student.email}</p>
              </div>
            </div>
          </div>

          {/* Override Settings */}
          <div className="space-y-5">
            {/* Attempt Settings */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                Attempt Settings
              </h4>
              <div className="space-y-4">
                {/* Allow Retakes */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Allow Retakes</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isRetakeAllowed}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setConfig({ 
                          ...config, 
                          isRetakeAllowed: isChecked,
                          allowedAttempts: isChecked ? Math.max(2, config.allowedAttempts) : 1
                        });
                        setAttemptsInput(isChecked ? Math.max(2, config.allowedAttempts).toString() : "1");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Maximum Attempts */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Maximum Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={attemptsInput}
                    disabled={!config.isRetakeAllowed}
                    onChange={(e) => handleAttemptsChange(e.target.value)}
                    onBlur={handleAttemptsBlur}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                    placeholder="1"
                  />
                  {!config.isRetakeAllowed && (
                    <p className="text-xs text-gray-500 mt-2">
                      Enable "Allow Retakes" to set more than 1 attempt
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Test Behavior */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                Test Behavior
              </h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Allow Resume</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Student can resume the test if interrupted
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isResumeAllowed}
                    onChange={(e) => setConfig({ ...config, isResumeAllowed: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Time Settings */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                Time Settings
              </h4>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Extra Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={extraTimeInput}
                  onChange={(e) => handleExtraTimeChange(e.target.value)}
                  onBlur={handleExtraTimeBlur}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    validationError 
                      ? "border-red-300 focus:ring-red-500 bg-red-50" 
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="0"
                />
                
                {/* Current extra time info */}
                {override && override.extraTimeInMinutes > 0 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    Current extra time: {override.extraTimeInMinutes} minutes
                  </p>
                )}
                
                {/* Validation error message */}
                {validationError && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    {validationError}
                  </p>
                )}
                
                {/* Help text */}
                <p className={`text-xs mt-2 ${
                  validationError ? "text-red-500" : "text-gray-500"
                }`}>
                  {override 
                    ? "You can only increase extra time, not decrease it"
                    : "Additional time beyond standard duration"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2">Override Rules</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Extra time can only be increased for existing overrides</li>
              <li>• Retakes must be enabled to allow multiple attempts</li>
              <li>• Resume allows students to continue interrupted tests</li>
              <li>• Maximum extra time limit is 180 minutes (3 hours)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : override ? "Update Override" : "Add Override"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default StudentOverrideModal;