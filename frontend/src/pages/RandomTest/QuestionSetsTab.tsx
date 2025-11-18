// // components/RandomTestBuilder/QuestionSetsTab.tsx
// import React from "react";
// import {
//   RandomTestForm,
//   QuestionSet,
//   Availability,
//   Tab,
//   SectionQS,
// } from "./RandomTest";

// interface Props {
//   formData: RandomTestForm;
//   setFormData: React.Dispatch<React.SetStateAction<RandomTestForm>>;
//   questionSets: QuestionSet[];
//   availabilityBySet: Record<string, Availability>;
//   ensureAvailability: (setId: string) => Promise<void>;
//   setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
// }

// const QuestionSetsTab: React.FC<Props> = ({
//   formData,
//   setFormData,
//   questionSets,
//   availabilityBySet,
//   ensureAvailability,
//   setActiveTab,
// }) => {
//   const addQS = (sIdx: number) => {
//     const updated = [...formData.sections];
//     updated[sIdx].questionSets.push({
//       questionSetId: "",
//       distribution: { easy: 0, medium: 0, hard: 0 },
//     });
//     setFormData({ ...formData, sections: updated });
//   };

//   const removeQS = (sIdx: number, qsIdx: number) => {
//     const updated = [...formData.sections];
//     updated[sIdx].questionSets.splice(qsIdx, 1);
//     setFormData({ ...formData, sections: updated });
//   };

//   const updateQSId = async (sIdx: number, qsIdx: number, id: string) => {
//     const updated = [...formData.sections];
//     updated[sIdx].questionSets[qsIdx].questionSetId = id;
//     setFormData({ ...formData, sections: updated });
//     await ensureAvailability(id);
//   };

//   const updateDistribution = (
//     sIdx: number,
//     qsIdx: number,
//     difficulty: "easy" | "medium" | "hard",
//     value: number
//   ) => {
//     const updated = [...formData.sections];
//     updated[sIdx].questionSets[qsIdx].distribution[difficulty] = value;
//     setFormData({ ...formData, sections: updated });
//   };

//   return (
//     <div className="space-y-6">
//       {formData.sections.map((section, sIdx) => (
//         <div key={sIdx} className="border rounded p-4 space-y-3">
//           <h3 className="font-semibold">{section.sectionName || `Section ${sIdx + 1}`}</h3>

//           {section.questionSets.map((qs, qsIdx) => {
//             const availability = availabilityBySet[qs.questionSetId] || { easy: 0, medium: 0, hard: 0 };
//             return (
//               <div key={qsIdx} className="border p-3 rounded space-y-2">
//                 <select
//                   className="border px-2 py-1 rounded w-full"
//                   value={qs.questionSetId}
//                   onChange={(e) => updateQSId(sIdx, qsIdx, e.target.value)}
//                 >
//                   <option value="">-- Select Question Set --</option>
//                   {questionSets.map((set) => (
//                     <option key={set._id} value={set._id}>
//                       {set.name}
//                     </option>
//                   ))}
//                 </select>

//                 {["easy", "medium", "hard"].map((level) => (
//                   <div key={level} className="flex items-center gap-2">
//                     <label className="capitalize">{level}:</label>
//                     <input
//                       type="text"
//                       className="border rounded px-2 py-1 w-24"
//                       value={qs.distribution[level as keyof SectionQS["distribution"]]}
//                       onChange={(e) =>
//                         updateDistribution(
//                           sIdx,
//                           qsIdx,
//                           level as "easy" | "medium" | "hard",
//                           Number(e.target.value) || 0
//                         )
//                       }
//                     />
//                     <span className="text-sm text-gray-500">
//                       (Available: {availability[level as keyof Availability] || 0})
//                     </span>
//                   </div>
//                 ))}

//                 <button
//                   className="bg-red-500 text-white px-3 py-1 rounded"
//                   onClick={() => removeQS(sIdx, qsIdx)}
//                 >
//                   Remove Question Set
//                 </button>
//               </div>
//             );
//           })}

//           <button
//             className="bg-green-600 text-white px-3 py-1 rounded"
//             onClick={() => addQS(sIdx)}
//           >
//             + Add Question Set
//           </button>
//         </div>
//       ))}

//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         onClick={() => setActiveTab("Preview")}
//       >
//         Next → Preview
//       </button>
//     </div>
//   );
// };

// export default QuestionSetsTab;
