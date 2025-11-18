// // components/RandomTestBuilder/SectionsTab.tsx
// import React from "react";
// import { RandomTestForm, Section, Tab } from "./RandomTest";

// interface Props {
//   formData: RandomTestForm;
//   setFormData: React.Dispatch<React.SetStateAction<RandomTestForm>>;
//   setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
// }

// const SectionsTab: React.FC<Props> = ({ formData, setFormData, setActiveTab }) => {
//   const addSection = () => {
//     setFormData((prev) => ({
//       ...prev,
//       sections: [...prev.sections, { sectionName: "", sectionDescription: "", questionSets: [] }],
//     }));
//   };

//   const removeSection = (idx: number) => {
//     const updated = [...formData.sections];
//     updated.splice(idx, 1);
//     setFormData({ ...formData, sections: updated });
//   };

//   const updateSectionField = (idx: number, field: keyof Section, value: string) => {
//     const updated = [...formData.sections];
//     (updated[idx] as any)[field] = value;
//     setFormData({ ...formData, sections: updated });
//   };

//   return (
//     <div className="space-y-4">
//       {formData.sections.map((section, idx) => (
//         <div key={idx} className="border p-4 rounded space-y-2">
//           <div>
//             <label className="block font-medium">Section Name *</label>
//             <input
//               className="border rounded px-3 py-2 w-full"
//               value={section.sectionName}
//               onChange={(e) => updateSectionField(idx, "sectionName", e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block font-medium">Section Description</label>
//             <input
//               className="border rounded px-3 py-2 w-full"
//               value={section.sectionDescription}
//               onChange={(e) => updateSectionField(idx, "sectionDescription", e.target.value)}
//             />
//           </div>

//           <button
//             className="bg-red-500 text-white px-3 py-1 rounded"
//             onClick={() => removeSection(idx)}
//           >
//             Remove Section
//           </button>
//         </div>
//       ))}

//       <button
//         className="bg-green-600 text-white px-4 py-2 rounded"
//         onClick={addSection}
//       >
//         + Add Section
//       </button>

//       <div>
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={() => setActiveTab("Question Sets")}
//         >
//           Next → Question Sets
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SectionsTab;
