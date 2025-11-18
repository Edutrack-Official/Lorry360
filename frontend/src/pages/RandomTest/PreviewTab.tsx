// // components/RandomTestBuilder/PreviewTab.tsx
// import React from "react";
// import { RandomTestForm } from "./RandomTest";

// interface Props {
//   formData: RandomTestForm;
//   setNameById: Record<string, string>;
//   handleSubmit: () => void;
//   loading: boolean;
// }

// const PreviewTab: React.FC<Props> = ({ formData, setNameById, handleSubmit, loading }) => {
//   return (
//     <div className="space-y-6">
//       <h2 className="text-xl font-semibold">Preview</h2>

//       <div className="border p-4 rounded space-y-2">
//         <p><strong>Code:</strong> {formData.code}</p>
//         <p><strong>Name:</strong> {formData.name}</p>
//         <p><strong>Description:</strong> {formData.description}</p>
//       </div>

//       {formData.sections.map((section, idx) => (
//         <div key={idx} className="border rounded p-4 space-y-2">
//           <h3 className="font-semibold">{section.sectionName}</h3>
//           <p>{section.sectionDescription}</p>
//           <ul className="list-disc pl-6">
//             {section.questionSets.map((qs, qIdx) => (
//               <li key={qIdx}>
//                 <strong>{setNameById[qs.questionSetId] || "Unknown Set"}</strong> → 
//                 Easy: {qs.distribution.easy}, Medium: {qs.distribution.medium}, Hard: {qs.distribution.hard}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}

//       <button
//         className="bg-blue-600 text-white px-6 py-2 rounded"
//         onClick={handleSubmit}
//         disabled={loading}
//       >
//         {loading ? "Saving..." : "Save Test"}
//       </button>
//     </div>
//   );
// };

// export default PreviewTab;
