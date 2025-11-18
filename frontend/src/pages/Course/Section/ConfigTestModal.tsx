// import React from "react";

// type ConfigState = {
//   startTime: string;
//   endTime: string;
//   durationInMinutes: number;
//   maxAttempts: number;
//   isRetakeAllowed: boolean;
//   isProctored: boolean;
//   isPreparationTest: boolean;
//   malpracticeLimit: number;
//   correctMark: number;
//   negativeMark: number;
//   passPercentage: number;
// };

// interface Props {
//   config: ConfigState;
//   onConfigChange: React.Dispatch<React.SetStateAction<ConfigState>>;
//   onSave: () => Promise<void>;
//   onCancel: () => void;
//   saving: boolean;
// }

// const ConfigTestModal: React.FC<Props> = ({
//   config,
//   onConfigChange,
//   onSave,
//   onCancel,
//   saving,
// }) => {
//   const setConfig = onConfigChange;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
//       <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-semibold">Configure Test</h3>
//           <button
//             onClick={onCancel}
//             className="text-gray-400 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Schedule */}
//         <div className="mb-4">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule</h4>
//           <div className="grid grid-cols-2 gap-3">
//             <input
//               type="datetime-local"
//               value={config.startTime}
//               onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
//               className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//               type="datetime-local"
//               value={config.endTime}
//               onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
//               className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Duration & Attempts */}
//         <div className="mb-4">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Duration & Attempts</h4>
//           <div className="grid grid-cols-2 gap-3">
//             <input
//               type="number"
//               min={1}
//               value={config.durationInMinutes}
//               onChange={(e) =>
//                 setConfig({ ...config, durationInMinutes: Math.max(1, +e.target.value || 1) })
//               }
//               className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Duration (minutes)"
//             />
//             <div className="flex items-center">
//               <input
//                 type="number"
//                 min={1}
//                 value={config.isRetakeAllowed ? config.maxAttempts : 1}
//                 disabled={!config.isRetakeAllowed}
//                 onChange={(e) =>
//                   setConfig({ ...config, maxAttempts: Math.max(1, +e.target.value || 1) })
//                 }
//                 className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//                 placeholder="Max Attempts"
//               />
//             </div>
//           </div>
//           <div className="mt-2">
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={config.isRetakeAllowed}
//                 onChange={(e) => {
//                   const checked = e.target.checked;
//                   setConfig((c) => ({
//                     ...c,
//                     isRetakeAllowed: checked,
//                     maxAttempts: checked ? Math.max(2, c.maxAttempts) : 1,
//                   }));
//                 }}
//                 className="rounded border-gray-400"
//               />
//               Allow Retakes
//             </label>
//             {!config.isRetakeAllowed && (
//               <p className="text-xs text-gray-500 mt-1">
//                 Attempts locked to 1 unless "Allow Retakes" is enabled.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Mode (Mutually Exclusive) */}
//         <div className="mb-4">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Mode</h4>
//           <div className="flex gap-6">
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="radio"
//                 name="mode"
//                 checked={config.isProctored}
//                 onChange={() =>
//                   setConfig((c) => ({ ...c, isProctored: true, isPreparationTest: false }))
//                 }
//               />
//               Proctored
//             </label>
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="radio"
//                 name="mode"
//                 checked={config.isPreparationTest}
//                 onChange={() =>
//                   setConfig((c) => ({ ...c, isProctored: false, isPreparationTest: true }))
//                 }
//               />
//               Preparation
//             </label>
//           </div>
//         </div>

//         {/* Proctored Options */}
//         {config.isProctored && (
//           <div className="mb-4">
//             <h4 className="text-sm font-medium text-gray-700 mb-2">Proctoring</h4>
//             <div className="flex flex-col">
//               <label className="text-sm mb-1">Malpractice Limit</label>
//               <input
//                 type="number"
//                 min={0}
//                 value={config.malpracticeLimit}
//                 onChange={(e) =>
//                   setConfig({ ...config, malpracticeLimit: Math.max(0, +e.target.value || 0) })
//                 }
//                 className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Number of allowed violations (tab switch, etc.)"
//               />
//             </div>
//           </div>
//         )}

//         {/* Scoring Options */}
//         <div className="mb-4">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Scoring</h4>
//           <div className="grid grid-cols-3 gap-3">
//             <div className="flex flex-col">
//               <label className="text-xs mb-1">Correct Mark</label>
//               <input
//                 type="number"
//                 min={0}
//                 value={config.correctMark}
//                 onChange={(e) => setConfig({ ...config, correctMark: Math.max(0, +e.target.value || 1) })}
//                 className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="text-xs mb-1">Negative Mark</label>
//               <input
//                 type="number"
//                 min={0}
//                 value={config.negativeMark}
//                 onChange={(e) => setConfig({ ...config, negativeMark: Math.max(0, +e.target.value || 0) })}
//                 className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="text-xs mb-1">Pass %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 value={config.passPercentage}
//                 onChange={(e) =>
//                   setConfig({
//                     ...config,
//                     passPercentage: Math.min(100, Math.max(0, +e.target.value || 40)),
//                   })
//                 }
//                 className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 rounded border hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onSave}
//             disabled={saving}
//             className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//           >
//             {saving ? "Saving..." : "Save Config"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConfigTestModal;

// //newflow