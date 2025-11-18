// import React, { useState, useEffect } from "react";
// import { Eye, X, Check, Square } from "lucide-react";

// const difficultyColors: Record<string, string> = {
//   Easy: "bg-green-200 text-green-800",
//   Medium: "bg-yellow-200 text-yellow-800",
//   Hard: "bg-red-200 text-red-800",
// };

// const questionTypeColors: Record<string, string> = {
//   SINGLE_CORRECT: "bg-blue-100 text-blue-800",
//   MULTIPLE_CORRECT: "bg-purple-100 text-purple-800",
//   NUMERICAL: "bg-orange-100 text-orange-800",
//   INTEGER: "bg-amber-100 text-amber-800",
//   COMPREHENSION: "bg-indigo-100 text-indigo-800",
// };

// interface QuestionListProps {
//   section: any;
//   questions: Record<string, any[]>; // grouped by QS id
//   toggleQuestion: (id: string) => void;
//   toggleSelectAll: (allIds: string[], filter: string) => void;
//   updateSection: (field: string, value: any) => void;
// }

// const QuestionList: React.FC<QuestionListProps> = ({
//   section,
//   questions,
//   toggleQuestion,
//   toggleSelectAll,
//   updateSection,
// }) => {
//   const [globalSearch, setGlobalSearch] = useState("");
//   const [globalDifficulty, setGlobalDifficulty] = useState("All");
//   const [globalQuestionType, setGlobalQuestionType] = useState("All");
//   const [qsFilters, setQsFilters] = useState<
//     Record<string, { search: string; difficulty: string; questionType: string }>
//   >({});
//   const [openQS, setOpenQS] = useState<string | null>(null);
//   const [viewingComprehension, setViewingComprehension] = useState<any>(null);

//   const selected: string[] = section.questions || [];

//   // ✅ Cleanup effect: remove questions if their QS is removed
//   useEffect(() => {
//     if (!section.questionSets) return;

//     // gather all valid question IDs from active QS (excluding comprehension children)
//     const validIds = section.questionSets.flatMap(
//       (qsId: string) => (questions[qsId] || [])
//         .filter(q => !q.answers?.comprehensionParentId) // Exclude comprehension child questions
//         .map((q) => q._id)
//     );

//     // keep only valid ones
//     const cleaned = selected.filter((id) => validIds.includes(id));

//     if (cleaned.length !== selected.length) {
//       updateSection("questions", cleaned);
//     }
//   }, [section.questionSets, questions]);

//   const updateQsFilter = (qsId: string, field: string, value: string) => {
//     setQsFilters((prev) => ({
//       ...prev,
//       [qsId]: {
//         search: prev[qsId]?.search || "",
//         difficulty: prev[qsId]?.difficulty || "All",
//         questionType: prev[qsId]?.questionType || "All",
//         [field]: value,
//       },
//     }));
//   };

//   const handleToggleSelectAll = (qsId: string, allIds: string[]) => {
//     const qsFilter = qsFilters[qsId] || { difficulty: "All", questionType: "All" };
//     toggleSelectAll(allIds, `${qsFilter.difficulty}|${qsFilter.questionType}`);
//   };

//   // Helper function to render child question content
//   const renderChildQuestionContent = (child: any) => {
//     switch (child.questionType) {
//       case 'SINGLE_CORRECT':
//         return (
//           <div className="space-y-2">
//             <div className="text-sm font-semibold text-gray-700">Options:</div>
//             <ul className="space-y-1">
//               {child.answers?.options?.map((opt: string, i: number) => (
//                 <li
//                   key={i}
//                   className={`flex items-center gap-2 p-2 rounded ${
//                     child.answers?.correctIndex === i 
//                       ? "bg-green-50 border border-green-200" 
//                       : "bg-gray-50"
//                   }`}
//                 >
//                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
//                     child.answers?.correctIndex === i 
//                       ? "bg-green-500 border-green-600" 
//                       : "bg-white border-gray-400"
//                   }`}>
//                     {child.answers?.correctIndex === i && <Check size={10} className="text-white" />}
//                   </div>
//                   <span className={child.answers?.correctIndex === i ? "font-semibold text-green-700" : "text-gray-700"}>
//                     {opt}
//                   </span>
//                   {child.answers?.correctIndex === i && (
//                     <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         );

//       case 'MULTIPLE_CORRECT':
//         return (
//           <div className="space-y-2">
//             <div className="text-sm font-semibold text-gray-700">Options (Multiple Correct):</div>
//             <ul className="space-y-1">
//               {child.answers?.options?.map((opt: string, i: number) => (
//                 <li
//                   key={i}
//                   className={`flex items-center gap-2 p-2 rounded ${
//                     child.answers?.correctIndices?.includes(i)
//                       ? "bg-green-50 border border-green-200" 
//                       : "bg-gray-50"
//                   }`}
//                 >
//                   <div className={`w-4 h-4 rounded border flex items-center justify-center ${
//                     child.answers?.correctIndices?.includes(i)
//                       ? "bg-green-500 border-green-600" 
//                       : "bg-white border-gray-400"
//                   }`}>
//                     {child.answers?.correctIndices?.includes(i) && <Check size={10} className="text-white" />}
//                   </div>
//                   <span className={child.answers?.correctIndices?.includes(i) ? "font-semibold text-green-700" : "text-gray-700"}>
//                     {opt}
//                   </span>
//                   {child.answers?.correctIndices?.includes(i) && (
//                     <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
//                   )}
//                 </li>
//               ))}
//             </ul>
//             <div className="text-xs text-gray-500 mt-1">
//               {child.answers?.correctIndices?.length || 0} correct answer(s) selected
//             </div>
//           </div>
//         );

//       case 'NUMERICAL':
//       case 'INTEGER':
//         return (
//           <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
//             <div className="text-sm font-semibold text-gray-700">Answer:</div>
//             <div className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-semibold">
//               {child.answers?.numericalValue}
//             </div>
//             <div className="text-xs text-gray-500 ml-auto">
//               {child.questionType === 'INTEGER' ? 'Integer' : 'Numerical'}
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Helper function to render question content based on type
//   const renderQuestionContent = (q: any) => {
//     switch (q.questionType) {
//       case 'SINGLE_CORRECT':
//         return (
//           <ul className="list-disc pl-5 text-sm mt-1">
//             {q.answers?.options?.map((opt: string, i: number) => (
//               <li
//                 key={i}
//                 className={
//                   q.answers?.correctIndex === i
//                     ? "font-bold text-green-600"
//                     : ""
//                 }
//               >
//                 {opt}
//               </li>
//             ))}
//           </ul>
//         );

//       case 'MULTIPLE_CORRECT':
//         return (
//           <ul className="list-disc pl-5 text-sm mt-1">
//             {q.answers?.options?.map((opt: string, i: number) => (
//               <li
//                 key={i}
//                 className={
//                   q.answers?.correctIndices?.includes(i)
//                     ? "font-bold text-green-600"
//                     : ""
//                 }
//               >
//                 {opt}
//               </li>
//             ))}
//           </ul>
//         );

//       case 'NUMERICAL':
//       case 'INTEGER':
//         return (
//           <div className="text-sm mt-1">
//             <span className="font-semibold">Answer: </span>
//             <span className="text-green-600">{q.answers?.numericalValue}</span>
//           </div>
//         );

//       case 'COMPREHENSION':
//         return (
//           <div className="text-sm mt-1">
//             <div className="font-semibold text-indigo-700 mb-1">Comprehension Passage</div>
//             <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
//               {q.answers?.passage?.substring(0, 200)}
//               {q.answers?.passage?.length > 200 ? '...' : ''}
//             </div>
//             <div className="flex justify-between items-center mt-2">
//               {q.childQuestions && (
//                 <div className="text-xs text-gray-600">
//                   Contains {q.childQuestions.length} child question{q.childQuestions.length !== 1 ? 's' : ''}
//                 </div>
//               )}
//               <button
//                 onClick={() => setViewingComprehension(q)}
//                 className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
//               >
//                 <Eye size={12} />
//                 View Full Passage & Questions
//               </button>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Helper function to render question preview text
//   const renderQuestionPreview = (q: any) => {
//     const text = q.text?.replace(/<[^>]*>/g, '') || '';
//     return text.length > 150 ? text.substring(0, 150) + '...' : text;
//   };

//   // Render comprehension details popup
// // Render comprehension details popup
// const renderComprehensionPopup = () => {
//   if (!viewingComprehension) return null;

//   const q = viewingComprehension;

//   // Find all child questions for this comprehension from ALL question sets
//   const childQuestions = Object.values(questions)
//     .flat()
//     .filter(child => child.answers?.comprehensionParentId === q._id);

//   // Calculate child question statistics
//   const childStats = childQuestions.reduce((acc: Record<string, number>, child: any) => {
//     acc.total = (acc.total || 0) + 1;
//     acc[child.questionType] = (acc[child.questionType] || 0) + 1;
//     acc[child.difficulty] = (acc[child.difficulty] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="border-b border-gray-200 p-6 bg-white">
//           <div className="flex justify-between items-start">
//             <div className="flex-1">
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 Comprehension Passage Details
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 <span className={`px-3 py-1 text-sm rounded ${difficultyColors[q.difficulty]}`}>
//                   {q.difficulty}
//                 </span>
//                 <span className={`px-3 py-1 text-sm rounded ${questionTypeColors[q.questionType]}`}>
//                   {q.questionType.replace('_', ' ')}
//                 </span>
//                 {q.tags?.map((tag: string) => (
//                   <span
//                     key={tag}
//                     className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <button
//               onClick={() => setViewingComprehension(null)}
//               className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 ml-4"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="overflow-y-auto flex-1 p-6">
//           <div className="max-w-4xl mx-auto space-y-8">
//             {/* Question Title */}
//             <div>
//               <h4 className="font-semibold text-gray-800 mb-3 text-lg">Question Title:</h4>
//               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                 <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
//               </div>
//             </div>

//             {/* Comprehension Passage */}
//             <div>
//               <h4 className="font-semibold text-gray-800 mb-3 text-lg">Comprehension Passage:</h4>
//               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
//                 {q.answers?.passage || 'No passage available'}
//               </div>
//               <div className="text-sm text-gray-500 mt-2 flex justify-between">
//                 <span>Characters: {q.answers?.passage?.length || 0}</span>
//                 <span>Words: {q.answers?.passage?.split(/\s+/).filter(Boolean).length || 0}</span>
//               </div>
//             </div>

//             {/* Child Questions */}
//             {childQuestions.length > 0 ? (
//               <div>
//                 {/* Child Questions Header with Stats */}
//                 <div className="flex items-center justify-between mb-6">
//                   <h4 className="font-semibold text-gray-800 text-lg">
//                     Child Questions ({childQuestions.length})
//                   </h4>
//                   {childStats && (
//                     <div className="flex flex-wrap gap-3 text-sm text-gray-600">
//                       <div className="flex items-center gap-1">
//                         <span className="font-medium">Types:</span>
//                         {Object.entries(childStats)
//                           .filter(([key]) => key !== 'total' && !['Easy', 'Medium', 'Hard'].includes(key))
//                           .map(([type, count]) => (
//                             <span key={type} className={`px-2 py-1 text-xs rounded ${questionTypeColors[type]}`}>
//                               {type.replace('_', ' ')}: {count}
//                             </span>
//                           ))
//                         }
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <span className="font-medium">Difficulty:</span>
//                         {['Easy', 'Medium', 'Hard'].map(diff => 
//                           childStats[diff] ? (
//                             <span key={diff} className={`px-2 py-1 text-xs rounded ${difficultyColors[diff]}`}>
//                               {diff}: {childStats[diff]}
//                             </span>
//                           ) : null
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Child Questions List */}
//                 <div className="space-y-6">
//                   {childQuestions.map((child: any, index: number) => (
//                     <div key={child._id} className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
//                       {/* Child Question Header */}
//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-center gap-3 flex-wrap">
//                           <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
//                             Question {index + 1}
//                           </span>
//                           <span className={`px-3 py-1 text-sm rounded ${questionTypeColors[child.questionType]}`}>
//                             {child.questionType.replace('_', ' ')}
//                           </span>
//                           <span className={`px-3 py-1 text-sm rounded ${difficultyColors[child.difficulty]}`}>
//                             {child.difficulty}
//                           </span>
//                         </div>
//                       </div>
                      
//                       {/* Child Question Text */}
//                       <div className="mb-4">
//                         <div className="text-sm font-medium text-gray-600 mb-2">Question:</div>
//                         <p className="text-gray-800 text-lg leading-relaxed">{child.text}</p>
//                       </div>
                      
//                       {/* Child Question Content */}
//                       <div className="mb-4">
//                         {renderChildQuestionContent(child)}
//                       </div>

//                       {/* Tags */}
//                       {child.tags && child.tags.length > 0 && (
//                         <div className="flex items-center gap-2 mb-4">
//                           <span className="text-sm font-medium text-gray-600">Tags:</span>
//                           <div className="flex flex-wrap gap-1">
//                             {child.tags.map((tag: string) => (
//                               <span
//                                 key={tag}
//                                 className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
//                               >
//                                 {tag}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Explanation */}
//                       {child.explanation && (
//                         <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                           <div className="text-sm font-semibold text-blue-800 mb-2">Explanation:</div>
//                           <div className="text-sm text-blue-700 leading-relaxed">{child.explanation}</div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <div className="text-lg mb-2">No Child Questions Found</div>
//                 <p className="text-sm">This comprehension passage doesn't have any child questions attached yet.</p>
//               </div>
//             )}

//             {/* Parent Question Explanation */}
//             {q.explanation && (
//               <div>
//                 <h4 className="font-semibold text-gray-800 mb-3 text-lg">Explanation:</h4>
//                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                   {q.explanation}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t border-gray-200 p-6 bg-gray-50">
//           <div className="max-w-4xl mx-auto flex justify-between items-center">
//             <div className="text-sm text-gray-600">
//               {childQuestions.length} child question(s) attached to this comprehension
//             </div>
//             <button
//               onClick={() => setViewingComprehension(null)}
//               className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

//   return (
//     <div className="space-y-4">
//       {/* Global filters */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//         <input
//           className="border rounded p-2"
//           placeholder="Global search across all QS"
//           value={globalSearch}
//           onChange={(e) => setGlobalSearch(e.target.value)}
//         />
//         <select
//           className="border rounded p-2"
//           value={globalDifficulty}
//           onChange={(e) => setGlobalDifficulty(e.target.value)}
//         >
//           <option value="All">All Difficulties</option>
//           <option value="Easy">Easy</option>
//           <option value="Medium">Medium</option>
//           <option value="Hard">Hard</option>
//         </select>
//         <select
//           className="border rounded p-2"
//           value={globalQuestionType}
//           onChange={(e) => setGlobalQuestionType(e.target.value)}
//         >
//           <option value="All">All Types</option>
//           <option value="SINGLE_CORRECT">Single Correct</option>
//           <option value="MULTIPLE_CORRECT">Multiple Correct</option>
//           <option value="NUMERICAL">Numerical</option>
//           <option value="INTEGER">Integer</option>
//           <option value="COMPREHENSION">Comprehension</option>
//         </select>
//       </div>

//       {/* Loop QS */}
//       {(section.questionSets || []).map((qsId: string) => {
//         const qsFilter = qsFilters[qsId] || { 
//           search: "", 
//           difficulty: "All", 
//           questionType: "All" 
//         };
        
//         // Filter questions: exclude comprehension children and apply filters
//         const qsQuestions = (questions[qsId] || [])
//           .filter(q => !q.answers?.comprehensionParentId) // Exclude child questions
//           .filter((q) =>
//             q.text?.toLowerCase().includes(globalSearch.toLowerCase()) ||
//             q.answers?.passage?.toLowerCase().includes(globalSearch.toLowerCase())
//           )
//           .filter((q) =>
//             globalDifficulty === "All" ? true : q.difficulty === globalDifficulty
//           )
//           .filter((q) =>
//             globalQuestionType === "All" ? true : q.questionType === globalQuestionType
//           )
//           .filter((q) =>
//             q.text?.toLowerCase().includes(qsFilter.search.toLowerCase()) ||
//             q.answers?.passage?.toLowerCase().includes(qsFilter.search.toLowerCase())
//           )
//           .filter((q) =>
//             qsFilter.difficulty === "All"
//               ? true
//               : q.difficulty === qsFilter.difficulty
//           )
//           .filter((q) =>
//             qsFilter.questionType === "All"
//               ? true
//               : q.questionType === qsFilter.questionType
//           );

//         const allIds = qsQuestions.map((q) => q._id);

//         const diffCount = { Easy: 0, Medium: 0, Hard: 0 };
//         const typeCount = {
//           SINGLE_CORRECT: 0,
//           MULTIPLE_CORRECT: 0,
//           NUMERICAL: 0,
//           INTEGER: 0,
//           COMPREHENSION: 0
//         };

//         selected.forEach((id) => {
//           const q = (questions[qsId] || []).find((x) => x._id === id);
//           if (q?.difficulty && (q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard")) diffCount[q.difficulty as "Easy" | "Medium" | "Hard"]++;
//           if (q?.questionType && q.questionType in typeCount) typeCount[q.questionType as keyof typeof typeCount]++;
//         });

//         return (
//           <div key={qsId} className="border rounded-lg overflow-hidden">
//             {/* QS header */}
//             <div
//               className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
//               onClick={() => setOpenQS(openQS === qsId ? null : qsId)}
//             >
//               <div className="flex items-center gap-3">
//                 <span className="font-semibold text-gray-800">
//                   {questions[qsId]?.[0]?.questionSetId?.name || "Unnamed QS"}
//                 </span>
//                 <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
//                   {qsQuestions.length} questions
//                 </span>
//               </div>
//               <div className="flex gap-3 text-sm text-gray-600">
//                 <span className="font-medium">Selected: {diffCount.Easy + diffCount.Medium + diffCount.Hard}</span>
//                 <span className="text-green-600">E:{diffCount.Easy}</span>
//                 <span className="text-yellow-600">M:{diffCount.Medium}</span>
//                 <span className="text-red-600">H:{diffCount.Hard}</span>
//               </div>
//             </div>

//             {openQS === qsId && (
//               <div className="p-4 space-y-4 bg-white">
//                 {/* Per-QS filters */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
//                   <input
//                     className="border rounded p-2 text-sm"
//                     placeholder="Search in this QS..."
//                     value={qsFilter.search}
//                     onChange={(e) =>
//                       updateQsFilter(qsId, "search", e.target.value)
//                     }
//                   />
//                   <select
//                     className="border rounded p-2 text-sm"
//                     value={qsFilter.difficulty}
//                     onChange={(e) =>
//                       updateQsFilter(qsId, "difficulty", e.target.value)
//                     }
//                   >
//                     <option value="All">All Difficulties</option>
//                     <option value="Easy">Easy</option>
//                     <option value="Medium">Medium</option>
//                     <option value="Hard">Hard</option>
//                   </select>
//                   <select
//                     className="border rounded p-2 text-sm"
//                     value={qsFilter.questionType}
//                     onChange={(e) =>
//                       updateQsFilter(qsId, "questionType", e.target.value)
//                     }
//                   >
//                     <option value="All">All Types</option>
//                     <option value="SINGLE_CORRECT">Single Correct</option>
//                     <option value="MULTIPLE_CORRECT">Multiple Correct</option>
//                     <option value="NUMERICAL">Numerical</option>
//                     <option value="INTEGER">Integer</option>
//                     <option value="COMPREHENSION">Comprehension</option>
//                   </select>
//                 </div>

//                 {/* Select All and Stats */}
//                 <div className="flex justify-between items-center">
//                   <button
//                     className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
//                     onClick={() => handleToggleSelectAll(qsId, allIds)}
//                   >
//                     Select/Unselect All in QS
//                   </button>
//                   <div className="text-sm text-gray-600">
//                     Showing {qsQuestions.length} of {questions[qsId]?.filter(q => !q.answers?.comprehensionParentId).length} questions
//                   </div>
//                 </div>

//                 {/* Questions */}
//                 <div className="space-y-3">
//                   {qsQuestions.map((q) => (
//                     <div
//                       key={q._id}
//                       className={`border rounded-lg p-4 transition-all ${
//                         selected.includes(q._id) 
//                           ? "bg-green-50 border-green-300 shadow-sm" 
//                           : "bg-white hover:bg-gray-50 border-gray-200"
//                       }`}
//                     >
//                       <label className="flex items-start gap-4 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(q._id)}
//                           onChange={() => toggleQuestion(q._id)}
//                           className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
//                         />
//                         <div className="flex-1 min-w-0">
//                           {/* Question header with metadata */}
//                           <div className="flex flex-wrap items-center gap-2 mb-3">
//                             <span
//                               className={`px-3 py-1 text-sm rounded ${
//                                 difficultyColors[q.difficulty]
//                               }`}
//                             >
//                               {q.difficulty}
//                             </span>
//                             <span
//                               className={`px-3 py-1 text-sm rounded ${
//                                 questionTypeColors[q.questionType]
//                               }`}
//                             >
//                               {q.questionType.replace('_', ' ')}
//                             </span>
//                             {q.tags?.map((tag: string) => (
//                               <span
//                                 key={tag}
//                                 className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
//                               >
//                                 {tag}
//                               </span>
//                             ))}
//                           </div>

//                           {/* Question text */}
//                           <p className="font-medium text-gray-800 mb-3 text-lg leading-relaxed">
//                             {renderQuestionPreview(q)}
//                           </p>

//                           {/* Question content based on type */}
//                           {renderQuestionContent(q)}

//                           {/* Explanation if exists */}
//                           {q.explanation && (
//                             <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
//                               <div className="text-sm font-semibold text-blue-800 mb-1">Explanation:</div>
//                               <div className="text-sm text-blue-700">{q.explanation}</div>
//                             </div>
//                           )}
//                         </div>
//                       </label>
//                     </div>
//                   ))}
//                 </div>

//                 {qsQuestions.length === 0 && (
//                   <div className="text-center py-12 text-gray-500">
//                     <div className="text-lg mb-2">No questions found</div>
//                     <p className="text-sm">Try adjusting your search or filter criteria.</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         );
//       })}

//       {/* Comprehension Details Popup */}
//       {renderComprehensionPopup()}
//     </div>
//   );
// };

// export default QuestionList;


import React, { useState, useEffect } from "react";
import { Eye, X, Check, Square } from "lucide-react";

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-200 text-green-800",
  Medium: "bg-yellow-200 text-yellow-800",
  Hard: "bg-red-200 text-red-800",
};

const questionTypeColors: Record<string, string> = {
  SINGLE_CORRECT: "bg-blue-100 text-blue-800",
  MULTIPLE_CORRECT: "bg-purple-100 text-purple-800",
  NUMERICAL: "bg-orange-100 text-orange-800",
  INTEGER: "bg-amber-100 text-amber-800",
  COMPREHENSION: "bg-indigo-100 text-indigo-800",
};

interface QuestionListProps {
  section: any;
  questions: Record<string, any[]>; // grouped by QS id
  toggleQuestion: (id: string) => void;
  toggleSelectAll: (allIds: string[], filter: string) => void;
  updateSection: (field: string, value: any) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  section,
  questions,
  toggleQuestion,
  toggleSelectAll,
  updateSection,
}) => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalDifficulty, setGlobalDifficulty] = useState("All");
  const [globalQuestionType, setGlobalQuestionType] = useState("All");
  const [qsFilters, setQsFilters] = useState<
    Record<string, { search: string; difficulty: string; questionType: string }>
  >({});
  const [openQS, setOpenQS] = useState<string | null>(null);
  const [viewingComprehension, setViewingComprehension] = useState<any>(null);

  const selected: string[] = section.questions || [];

  // ✅ Cleanup effect: remove questions if their QS is removed
  useEffect(() => {
    if (!section.questionSets) return;

    // gather all valid question IDs from active QS (excluding comprehension children)
    const validIds = section.questionSets.flatMap(
      (qsId: string) => (questions[qsId] || [])
        .filter(q => !q.answers?.comprehensionParentId) // Exclude comprehension child questions
        .map((q) => q._id)
    );

    // keep only valid ones
    const cleaned = selected.filter((id) => validIds.includes(id));

    if (cleaned.length !== selected.length) {
      updateSection("questions", cleaned);
    }
  }, [section.questionSets, questions]);

  const updateQsFilter = (qsId: string, field: string, value: string) => {
    setQsFilters((prev) => ({
      ...prev,
      [qsId]: {
        search: prev[qsId]?.search || "",
        difficulty: prev[qsId]?.difficulty || "All",
        questionType: prev[qsId]?.questionType || "All",
        [field]: value,
      },
    }));
  };

  const handleToggleSelectAll = (qsId: string, allIds: string[]) => {
    const qsFilter = qsFilters[qsId] || { difficulty: "All", questionType: "All" };
    toggleSelectAll(allIds, `${qsFilter.difficulty}|${qsFilter.questionType}`);
  };

  // Helper function to render child question content
  const renderChildQuestionContent = (child: any) => {
    switch (child.questionType) {
      case 'SINGLE_CORRECT':
        return (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Options:</div>
            <ul className="space-y-1">
              {child.answers?.options?.map((opt: string, i: number) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    child.answers?.correctIndex === i 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    child.answers?.correctIndex === i 
                      ? "bg-green-500 border-green-600" 
                      : "bg-white border-gray-400"
                  }`}>
                    {child.answers?.correctIndex === i && <Check size={10} className="text-white" />}
                  </div>
                  <span className={child.answers?.correctIndex === i ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt}
                  </span>
                  {child.answers?.correctIndex === i && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'MULTIPLE_CORRECT':
        return (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Options (Multiple Correct):</div>
            <ul className="space-y-1">
              {child.answers?.options?.map((opt: string, i: number) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    child.answers?.correctIndices?.includes(i)
                      ? "bg-green-50 border border-green-200" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    child.answers?.correctIndices?.includes(i)
                      ? "bg-green-500 border-green-600" 
                      : "bg-white border-gray-400"
                  }`}>
                    {child.answers?.correctIndices?.includes(i) && <Check size={10} className="text-white" />}
                  </div>
                  <span className={child.answers?.correctIndices?.includes(i) ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt}
                  </span>
                  {child.answers?.correctIndices?.includes(i) && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-500 mt-1">
              {child.answers?.correctIndices?.length || 0} correct answer(s) selected
            </div>
          </div>
        );

      case 'NUMERICAL':
      case 'INTEGER':
        return (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm font-semibold text-gray-700">Answer:</div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-semibold">
              {child.answers?.numericalValue}
            </div>
            <div className="text-xs text-gray-500 ml-auto">
              {child.questionType === 'INTEGER' ? 'Integer' : 'Numerical'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Helper function to render question content based on type
  const renderQuestionContent = (q: any) => {
    switch (q.questionType) {
      case 'SINGLE_CORRECT':
        return (
          <div className="mt-2">
            <div className="text-sm font-semibold text-gray-700 mb-1">Options:</div>
            <ul className="space-y-1">
              {q.answers?.options?.map((opt: string, i: number) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    q.answers?.correctIndex === i 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border ${
                    q.answers?.correctIndex === i 
                      ? "bg-green-500 border-green-600" 
                      : "bg-white border-gray-400"
                  }`}></div>
                  <span className={q.answers?.correctIndex === i ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt}
                  </span>
                  {q.answers?.correctIndex === i && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'MULTIPLE_CORRECT':
        return (
          <div className="mt-2">
            <div className="text-sm font-semibold text-gray-700 mb-1">Options (Multiple Correct):</div>
            <ul className="space-y-1">
              {q.answers?.options?.map((opt: string, i: number) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    q.answers?.correctIndices?.includes(i)
                      ? "bg-green-50 border border-green-200" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border ${
                    q.answers?.correctIndices?.includes(i)
                      ? "bg-green-500 border-green-600" 
                      : "bg-white border-gray-400"
                  }`}></div>
                  <span className={q.answers?.correctIndices?.includes(i) ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt}
                  </span>
                  {q.answers?.correctIndices?.includes(i) && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-500 mt-1">
              {q.answers?.correctIndices?.length || 0} correct answer(s) selected
            </div>
          </div>
        );

      case 'NUMERICAL':
      case 'INTEGER':
        return (
          <div className="mt-2 flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm font-semibold text-gray-700">Answer:</div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-semibold">
              {q.answers?.numericalValue}
            </div>
            <div className="text-xs text-gray-500 ml-auto">
              {q.questionType === 'INTEGER' ? 'Integer' : 'Numerical'}
            </div>
          </div>
        );

      case 'COMPREHENSION':
        // Find child questions count for this comprehension
        const childQuestionsCount = Object.values(questions)
          .flat()
          .filter(child => child.answers?.comprehensionParentId === q._id)
          .length;

        return (
          <div className="text-sm mt-1">
            <div className="font-semibold text-indigo-700 mb-1">Comprehension Passage</div>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
              {q.answers?.passage?.substring(0, 200)}
              {q.answers?.passage?.length > 200 ? '...' : ''}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-600">
                Contains {childQuestionsCount} child question{childQuestionsCount !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setViewingComprehension(q)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
              >
                <Eye size={12} />
                View Full Passage & Questions
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render comprehension details popup
  const renderComprehensionPopup = () => {
    if (!viewingComprehension) return null;

    const q = viewingComprehension;

    // Find all child questions for this comprehension from ALL question sets
    const childQuestions = Object.values(questions)
      .flat()
      .filter(child => child.answers?.comprehensionParentId === q._id);

    // Calculate child question statistics
    const childStats = childQuestions.reduce((acc: Record<string, number>, child: any) => {
      acc.total = (acc.total || 0) + 1;
      acc[child.questionType] = (acc[child.questionType] || 0) + 1;
      acc[child.difficulty] = (acc[child.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Comprehension Passage Details
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-sm rounded ${difficultyColors[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded ${questionTypeColors[q.questionType]}`}>
                    {q.questionType.replace('_', ' ')}
                  </span>
                  {q.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setViewingComprehension(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 ml-4"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Question Title */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Question Title:</h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                </div>
              </div>

              {/* Comprehension Passage */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">Comprehension Passage:</h4>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {q.answers?.passage || 'No passage available'}
                </div>
                <div className="text-sm text-gray-500 mt-2 flex justify-between">
                  <span>Characters: {q.answers?.passage?.length || 0}</span>
                  <span>Words: {q.answers?.passage?.split(/\s+/).filter(Boolean).length || 0}</span>
                </div>
              </div>

              {/* Child Questions */}
              {childQuestions.length > 0 ? (
                <div>
                  {/* Child Questions Header with Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-gray-800 text-lg">
                      Child Questions ({childQuestions.length})
                    </h4>
                    {childStats && (
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Types:</span>
                          {Object.entries(childStats)
                            .filter(([key]) => key !== 'total' && !['Easy', 'Medium', 'Hard'].includes(key))
                            .map(([type, count]) => (
                              <span key={type} className={`px-2 py-1 text-xs rounded ${questionTypeColors[type]}`}>
                                {type.replace('_', ' ')}: {count}
                              </span>
                            ))
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Difficulty:</span>
                          {['Easy', 'Medium', 'Hard'].map(diff => 
                            childStats[diff] ? (
                              <span key={diff} className={`px-2 py-1 text-xs rounded ${difficultyColors[diff]}`}>
                                {diff}: {childStats[diff]}
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Child Questions List */}
                  <div className="space-y-6">
                    {childQuestions.map((child: any, index: number) => (
                      <div key={child._id} className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        {/* Child Question Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                              Question {index + 1}
                            </span>
                            <span className={`px-3 py-1 text-sm rounded ${questionTypeColors[child.questionType]}`}>
                              {child.questionType.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 text-sm rounded ${difficultyColors[child.difficulty]}`}>
                              {child.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        {/* Child Question Text */}
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-600 mb-2">Question:</div>
                          <div className="text-gray-800 text-lg leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: child.text || '' }} />
                        </div>
                        
                        {/* Child Question Content */}
                        <div className="mb-4">
                          {renderChildQuestionContent(child)}
                        </div>

                        {/* Tags */}
                        {child.tags && child.tags.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium text-gray-600">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                              {child.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Explanation */}
                        {child.explanation && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-semibold text-blue-800 mb-2">Explanation:</div>
                            <div className="text-sm text-blue-700 leading-relaxed">{child.explanation}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">No Child Questions Found</div>
                  <p className="text-sm">This comprehension passage doesn't have any child questions attached yet.</p>
                </div>
              )}

              {/* Parent Question Explanation */}
              {q.explanation && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 text-lg">Explanation:</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {childQuestions.length} child question(s) attached to this comprehension
              </div>
              <button
                onClick={() => setViewingComprehension(null)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Global filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          className="border rounded p-2"
          placeholder="Global search across all QS"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={globalDifficulty}
          onChange={(e) => setGlobalDifficulty(e.target.value)}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          className="border rounded p-2"
          value={globalQuestionType}
          onChange={(e) => setGlobalQuestionType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="SINGLE_CORRECT">Single Correct</option>
          <option value="MULTIPLE_CORRECT">Multiple Correct</option>
          <option value="NUMERICAL">Numerical</option>
          <option value="INTEGER">Integer</option>
          <option value="COMPREHENSION">Comprehension</option>
        </select>
      </div>

      {/* Loop QS */}
      {(section.questionSets || []).map((qsId: string) => {
        const qsFilter = qsFilters[qsId] || { 
          search: "", 
          difficulty: "All", 
          questionType: "All" 
        };
        
        // Filter questions: exclude comprehension children and apply filters
        const qsQuestions = (questions[qsId] || [])
          .filter(q => !q.answers?.comprehensionParentId) // Exclude child questions
          .filter((q) =>
            q.text?.toLowerCase().includes(globalSearch.toLowerCase()) ||
            q.answers?.passage?.toLowerCase().includes(globalSearch.toLowerCase())
          )
          .filter((q) =>
            globalDifficulty === "All" ? true : q.difficulty === globalDifficulty
          )
          .filter((q) =>
            globalQuestionType === "All" ? true : q.questionType === globalQuestionType
          )
          .filter((q) =>
            q.text?.toLowerCase().includes(qsFilter.search.toLowerCase()) ||
            q.answers?.passage?.toLowerCase().includes(qsFilter.search.toLowerCase())
          )
          .filter((q) =>
            qsFilter.difficulty === "All"
              ? true
              : q.difficulty === qsFilter.difficulty
          )
          .filter((q) =>
            qsFilter.questionType === "All"
              ? true
              : q.questionType === qsFilter.questionType
          );

        const allIds = qsQuestions.map((q) => q._id);

        const diffCount = { Easy: 0, Medium: 0, Hard: 0 };
        const typeCount = {
          SINGLE_CORRECT: 0,
          MULTIPLE_CORRECT: 0,
          NUMERICAL: 0,
          INTEGER: 0,
          COMPREHENSION: 0
        };

        selected.forEach((id) => {
          const q = (questions[qsId] || []).find((x) => x._id === id);
          if (q?.difficulty && (q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard")) diffCount[q.difficulty as "Easy" | "Medium" | "Hard"]++;
          if (q?.questionType && q.questionType in typeCount) typeCount[q.questionType as keyof typeof typeCount]++;
        });

        return (
          <div key={qsId} className="border rounded-lg overflow-hidden">
            {/* QS header */}
            <div
              className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => setOpenQS(openQS === qsId ? null : qsId)}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">
                  {questions[qsId]?.[0]?.questionSetId?.name || "Unnamed QS"}
                </span>
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                  {qsQuestions.length} questions
                </span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <span className="font-medium">Selected: {diffCount.Easy + diffCount.Medium + diffCount.Hard}</span>
                <span className="text-green-600">E:{diffCount.Easy}</span>
                <span className="text-yellow-600">M:{diffCount.Medium}</span>
                <span className="text-red-600">H:{diffCount.Hard}</span>
              </div>
            </div>

            {openQS === qsId && (
              <div className="p-4 space-y-4 bg-white">
                {/* Per-QS filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input
                    className="border rounded p-2 text-sm"
                    placeholder="Search in this QS..."
                    value={qsFilter.search}
                    onChange={(e) =>
                      updateQsFilter(qsId, "search", e.target.value)
                    }
                  />
                  <select
                    className="border rounded p-2 text-sm"
                    value={qsFilter.difficulty}
                    onChange={(e) =>
                      updateQsFilter(qsId, "difficulty", e.target.value)
                    }
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <select
                    className="border rounded p-2 text-sm"
                    value={qsFilter.questionType}
                    onChange={(e) =>
                      updateQsFilter(qsId, "questionType", e.target.value)
                    }
                  >
                    <option value="All">All Types</option>
                    <option value="SINGLE_CORRECT">Single Correct</option>
                    <option value="MULTIPLE_CORRECT">Multiple Correct</option>
                    <option value="NUMERICAL">Numerical</option>
                    <option value="INTEGER">Integer</option>
                    <option value="COMPREHENSION">Comprehension</option>
                  </select>
                </div>

                {/* Select All and Stats */}
                <div className="flex justify-between items-center">
                  <button
                    className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    onClick={() => handleToggleSelectAll(qsId, allIds)}
                  >
                    Select/Unselect All in QS
                  </button>
                  <div className="text-sm text-gray-600">
                    Showing {qsQuestions.length} of {questions[qsId]?.filter(q => !q.answers?.comprehensionParentId).length} questions
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-3">
                  {qsQuestions.map((q) => (
                    <div
                      key={q._id}
                      className={`border rounded-lg p-4 transition-all ${
                        selected.includes(q._id) 
                          ? "bg-green-50 border-green-300 shadow-sm" 
                          : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <label className="flex items-start gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.includes(q._id)}
                          onChange={() => toggleQuestion(q._id)}
                          className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Question header with metadata */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className={`px-3 py-1 text-sm rounded ${
                                difficultyColors[q.difficulty]
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span
                              className={`px-3 py-1 text-sm rounded ${
                                questionTypeColors[q.questionType]
                              }`}
                            >
                              {q.questionType.replace('_', ' ')}
                            </span>
                            {q.tags?.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Question text with images */}
                          <div className="font-medium text-gray-800 mb-3 text-lg leading-relaxed">
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                          </div>

                          {/* Question content based on type */}
                          {renderQuestionContent(q)}

                          {/* Explanation if exists */}
                          {q.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="text-sm font-semibold text-blue-800 mb-1">Explanation:</div>
                              <div className="text-sm text-blue-700">{q.explanation}</div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {qsQuestions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-lg mb-2">No questions found</div>
                    <p className="text-sm">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Comprehension Details Popup */}
      {renderComprehensionPopup()}
    </div>
  );
};

export default QuestionList;