// import React from "react";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
// import { GripVertical, Settings, Eye, Trash2, BarChart3 } from "lucide-react";
// import type { SectionTest } from "../types/course";

// interface Props {
//   tests: SectionTest[];
//   getTestName: (testId: string) => string;
//   onReorder: (reorderedTests: SectionTest[]) => Promise<void>;
//   onConfigure: (testId: string) => void;
//   onRemove: (sectionTestId: string) => Promise<void>;
//   onVisibility: (testId: string) => void;
//   onViewResults: (testId: string) => void;
//   saving: boolean;
//   sectionId: string;
// }

// const TestList: React.FC<Props> = ({
//   tests,
//   getTestName,
//   onReorder,
//   onConfigure,
//   onRemove,
//   onVisibility,
//   onViewResults,
//   saving,
//   sectionId,
// }) => {
//   const handleDragEnd = async (result: DropResult) => {
//     if (!result.destination) return;

//     const { source, destination } = result;
//     if (source.index === destination.index) return;

//     const reordered = Array.from(tests).sort((a, b) => a.order - b.order);
//     const [moved] = reordered.splice(source.index, 1);
//     reordered.splice(destination.index, 0, moved);

//     const updated = reordered.map((t, idx) => ({ ...t, order: idx + 1 }));
//     await onReorder(updated);
//   };
  
//   console.log("tests",tests);
  

//   return (
//     <DragDropContext onDragEnd={handleDragEnd}>
//       <Droppable droppableId={`droppable-${sectionId}`}>
//         {(provided, snapshot) => (
//           <div 
//             ref={provided.innerRef} 
//             {...provided.droppableProps}
//             className={`space-y-2 ${
//               snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg p-2" : ""
//             } transition-colors`}
//           >
//             {tests
//               .slice()
//               .sort((a, b) => a.order - b.order)
//               .map((t, idx) => (
//                 <Draggable key={t._id} draggableId={t._id} index={idx}>
//                   {(drag, dragSnapshot) => (
//                     <div
//                       ref={drag.innerRef}
//                       {...drag.draggableProps}
//                       className={`flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-all ${
//                         dragSnapshot.isDragging
//                           ? "shadow-xl bg-white z-50 scale-105 rotate-1"
//                           : ""
//                       }`}
//                     >
//                       {/* Drag Handle */}
//                       <div
//                         {...drag.dragHandleProps}
//                         className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 transition-colors"
//                       >
//                         <GripVertical className="w-4 h-4" />
//                       </div>

//                       {/* Test Name */}
//                       <div className={`flex-1 min-w-0 ${
//                         dragSnapshot.isDragging ? "pointer-events-none" : ""
//                       }`}>
//                         <span className="font-medium text-sm text-gray-900 truncate block">
//                           {t.testId ? getTestName(t.testId) : "Unnamed Test"}
//                         </span>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className={`flex items-center gap-1.5 ${
//                         dragSnapshot.isDragging ? "pointer-events-none" : ""
//                       }`}>
//                         {/* Configure */}
//                         <button
//                           onClick={() => t.testId && onConfigure(t.testId)}
//                           disabled={!t.testId}
//                           className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                           title="Configure"
//                         >
//                           <Settings className="w-3.5 h-3.5" />
//                         </button>

//                         {/* Visibility */}
//                         <button
//                           onClick={() => t.testId && onVisibility(t.testId)}
//                           disabled={!t.testId}
//                           className="p-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                           title="Visibility"
//                         >
//                           <Eye className="w-3.5 h-3.5" />
//                         </button>

//                         {/* View Results */}
//                         <button
//                           onClick={() => t.testId && onViewResults(t.testId)}
//                           disabled={!t.testId}
//                           className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                           title="View Results"
//                         >
//                           <BarChart3 className="w-3.5 h-3.5" />
//                         </button>

//                         {/* Remove */}
//                         <button
//                           onClick={() => onRemove(t._id)}
//                           disabled={saving}
//                           className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                           title="Remove"
//                         >
//                           <Trash2 className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//             {provided.placeholder}
//           </div>
//         )}
//       </Droppable>
//     </DragDropContext>
//   );
// };

// export default TestList;



import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Settings, Eye, Trash2, BarChart3 } from "lucide-react";
import type { SectionTest } from "../types/course";
import toast from "react-hot-toast";
import api from "../../../api/client";

interface Props {
  tests: SectionTest[];
  getTestName: (testId: string) => string;
  onReorder: (reorderedTests: SectionTest[]) => Promise<void>;
  onConfigure: (testId: string) => void;
  onRemove: (sectionTestId: string) => Promise<void>;
  onVisibility: (testId: string) => void;
  onViewResults: (testId: string) => void;
  saving: boolean;
  sectionId: string;
  courseId: string;
}

const TestList: React.FC<Props> = ({
  tests,
  getTestName,
  onReorder,
  onConfigure,
  onRemove,
  onVisibility,
  onViewResults,
  saving,
  sectionId,
  courseId,
}) => {
  const handleRemoveClick = async (test: SectionTest) => {
    if (!test.testId) {
      // If no testId, it's probably a local test that can be deleted directly
      await onRemove(test._id);
      return;
    }

    try {
      const response = await api.get(`/test/${test.testId}/can-delete?courseId=${courseId}`);
      const { canDelete, reason } = response.data;
      
      if (canDelete) {
        await onRemove(test._id);
      } else {
        toast.error(reason || "Cannot delete this test");
      }
    } catch (error: any) {
      console.error("Error checking test deletion eligibility:", error);
      toast.error("Failed to check deletion eligibility");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    const reordered = Array.from(tests).sort((a, b) => a.order - b.order);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const updated = reordered.map((t, idx) => ({ ...t, order: idx + 1 }));
    await onReorder(updated);
  };
  
  console.log("tests", tests);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`droppable-${sectionId}`}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps}
            className={`space-y-2 ${
              snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg p-2" : ""
            } transition-colors`}
          >
            {tests
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((t, idx) => (
                <Draggable key={t._id} draggableId={t._id} index={idx}>
                  {(drag, dragSnapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-all ${
                        dragSnapshot.isDragging
                          ? "shadow-xl bg-white z-50 scale-105 rotate-1"
                          : ""
                      }`}
                    >
                      {/* Drag Handle */}
                      <div
                        {...drag.dragHandleProps}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Test Name */}
                      <div className={`flex-1 min-w-0 ${
                        dragSnapshot.isDragging ? "pointer-events-none" : ""
                      }`}>
                        <span className="font-medium text-sm text-gray-900 truncate block">
                          {t.testId ? getTestName(t.testId) : "Unnamed Test"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className={`flex items-center gap-1.5 ${
                        dragSnapshot.isDragging ? "pointer-events-none" : ""
                      }`}>
                        {/* Configure */}
                        <button
                          onClick={() => t.testId && onConfigure(t.testId)}
                          disabled={!t.testId}
                          className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Configure"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>

                        {/* Visibility */}
                        <button
                          onClick={() => t.testId && onVisibility(t.testId)}
                          disabled={!t.testId}
                          className="p-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Visibility"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* View Results */}
                        <button
                          onClick={() => t.testId && onViewResults(t.testId)}
                          disabled={!t.testId}
                          className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View Results"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveClick(t)}
                          disabled={saving}
                          className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TestList;