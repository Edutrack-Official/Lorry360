// // components/RandomTestBuilder/DetailsTab.tsx
// import React from "react";
// import { RandomTestForm, Tab } from "./RandomTest";

// interface Props {
//   formData: RandomTestForm;
//   setFormData: React.Dispatch<React.SetStateAction<RandomTestForm>>;
//   setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
// }

// const DetailsTab: React.FC<Props> = ({ formData, setFormData, setActiveTab }) => {
//   const handleChange = (field: keyof RandomTestForm, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block font-medium">Code *</label>
//         <input
//           className="border rounded px-3 py-2 w-full"
//           value={formData.code}
//           onChange={(e) => handleChange("code", e.target.value)}
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Name *</label>
//         <input
//           className="border rounded px-3 py-2 w-full"
//           value={formData.name}
//           onChange={(e) => handleChange("name", e.target.value)}
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Description</label>
//         <textarea
//           className="border rounded px-3 py-2 w-full"
//           rows={3}
//           value={formData.description}
//           onChange={(e) => handleChange("description", e.target.value)}
//         />
//       </div>

//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         onClick={() => setActiveTab("Sections")}
//       >
//         Next → Sections
//       </button>
//     </div>
//   );
// };

// export default DetailsTab;
