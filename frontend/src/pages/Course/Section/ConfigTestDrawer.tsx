import React from "react";
import { X, Settings, Save } from "lucide-react";


type ConfigState = {
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  maxAttempts: number;
  isRetakeAllowed: boolean;
  isResumeAllowed: boolean; // Added this field
  isProctored: boolean;
  isPreparationTest: boolean;
  correctMark: number;
  negativeMark: number;
  passPercentage: number;
  enableVideoProctoring: boolean;
  maxTabSwitch: number;
  videoProctoringViolationLimit: number;
};

interface Props {
  config: ConfigState;
  onConfigChange: React.Dispatch<React.SetStateAction<ConfigState>>;
  onSave: () => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

const ConfigTestDrawer: React.FC<Props> = ({
  config,
  onConfigChange,
  onSave,
  onClose,
  saving,
}) => {
  const setConfig = onConfigChange;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Configure Test</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Schedule */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Schedule
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={config.startTime}
                  onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={config.endTime}
                  onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Duration & Attempts */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Duration & Attempts
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min={1}
                  value={config.durationInMinutes}
                  onChange={(e) =>
                    setConfig({ ...config, durationInMinutes: Math.max(1, +e.target.value || 1) })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Max Attempts</label>
                <input
                  type="number"
                  min={1}
                  value={config.isRetakeAllowed ? config.maxAttempts : 1}
                  disabled={!config.isRetakeAllowed}
                  onChange={(e) =>
                    setConfig({ ...config, maxAttempts: Math.max(1, +e.target.value || 1) })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isRetakeAllowed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setConfig((c) => ({
                      ...c,
                      isRetakeAllowed: checked,
                      maxAttempts: checked ? Math.max(2, c.maxAttempts) : 1,
                    }));
                  }}
                  className="rounded border-gray-400 w-4 h-4"
                />
                <span className="font-medium text-gray-700">Allow Retakes</span>
              </label>
              
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isResumeAllowed}
                  onChange={(e) => {
                    setConfig({ ...config, isResumeAllowed: e.target.checked });
                  }}
                  className="rounded border-gray-400 w-4 h-4"
                />
                <span className="font-medium text-gray-700">Allow Resume Test</span>
              </label>
            </div>
            {!config.isRetakeAllowed && (
              <p className="text-xs text-gray-500 mt-1 ml-6">Attempts locked to 1</p>
            )}
          </div>

          {/* Mode */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Mode
            </h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={config.isProctored}
                  onChange={() =>
                    setConfig((c) => ({ ...c, isProctored: true, isPreparationTest: false }))
                  }
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-700">Proctored</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={config.isPreparationTest}
                  onChange={() =>
                    setConfig((c) => ({ ...c, isProctored: false, isPreparationTest: true }))
                  }
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-700">Preparation</span>
              </label>
            </div>
          </div>

          {/* Proctoring Options */}
          {config.isProctored && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-3">Proctoring Settings</h4>
              
              {/* Max Tab Switch */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-blue-800 mb-1">
                  Max Tab Switch
                </label>
                <input
                  type="number"
                  min={0}
                  value={config.maxTabSwitch}
                  onChange={(e) =>
                    setConfig({ ...config, maxTabSwitch: Math.max(0, +e.target.value || 0) })
                  }
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum allowed tab switches"
                />
            
                                <p className="text-xs text-blue-600 mt-1">Tab switches, fullscreen exits.</p>

              </div>

              {/* Video Proctoring */}
              <div className="mb-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableVideoProctoring}
                    onChange={(e) => setConfig({ ...config, enableVideoProctoring: e.target.checked })}
                    className="rounded border-blue-400 w-4 h-4"
                  />
                  <span className="font-medium text-blue-800">Enable Video Proctoring</span>
                </label>
                <p className="text-xs text-blue-600 mt-1 ml-6">
                  Students will be required to enable camera during the test
                </p>
              </div>

          

              {/* Video Proctoring Violation Limit */}
              {config.enableVideoProctoring && (
                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1">
                    Video Proctoring Violation Limit
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.videoProctoringViolationLimit}
                    onChange={(e) =>
                      setConfig({ ...config, videoProctoringViolationLimit: Math.max(0, +e.target.value || 0) })
                    }
                    className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maximum allowed video violations"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Combined limit for all video violations: Face not detected, Multiple faces, Mobile phone
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Scoring */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Scoring
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Correct Mark</label>
                <input
                  type="number"
                  min={0}
                  value={config.correctMark}
                  onChange={(e) => setConfig({ ...config, correctMark: Math.max(0, +e.target.value || 1) })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Negative Mark</label>
                <input
                  type="number"
                  min={0}
                  value={config.negativeMark}
                  onChange={(e) => setConfig({ ...config, negativeMark: Math.max(0, +e.target.value || 0) })}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pass %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={config.passPercentage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      passPercentage: Math.min(100, Math.max(0, +e.target.value || 40)),
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Config"}
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

export default ConfigTestDrawer;