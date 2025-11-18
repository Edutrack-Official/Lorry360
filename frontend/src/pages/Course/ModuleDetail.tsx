import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import InlineEdit from "./InlineEdit";
import SectionContainer from "./Section/SectionContainer";
import type { ModuleItem, Section, TestLite } from "./types/course";
import api from "../../api/client";
import { db } from "../../db";
import type { Module } from "../../db";
import { GripVertical, Trash2, Plus, AlertTriangle } from "lucide-react";

interface Props {
  module: ModuleItem;
  userId: string;
  onChanged: (nextModuleId?: string | null) => void;
}

const ModuleDetail: React.FC<Props> = ({ module, userId, onChanged }) => {
  const [moduleData, setModuleData] = useState<ModuleItem>(module);
  const [allTests, setAllTests] = useState<TestLite[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [secName, setSecName] = useState("");
  const [secDesc, setSecDesc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setModuleData(module);
  }, [module]);

  const sortedSections = useMemo(
    () => (moduleData.sections || []).slice().sort((a, b) => a.order - b.order),
    [moduleData.sections]
  );

  const fetchTests = async () => {
    try {
      setLoadingTests(true);
      const res = await api.get(`/test/all`);
      setAllTests(res.data?.tests || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load tests");
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [moduleData._id]);

  const updateModuleInStorage = async (updatedModule: ModuleItem) => {
    try {
      const existing = await db.modules.get(updatedModule._id);
      if (existing) {
        await db.modules.put({
          ...existing,
          ...updatedModule,
          lastUpdatedBy: userId,
          updatedAt: new Date().toISOString(),
        } as Module);
      }

      setModuleData(updatedModule);
      onChanged();
    } catch (err) {
      console.error("Error updating module in DB:", err);
      toast.error("Failed to update module in DB");
    }
  };

  const handleSectionDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    const activeSections = (moduleData.sections || []).filter((s) => !s.isDeleted);
    const reordered = [...activeSections].sort((a, b) => a.order - b.order);

    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const updatedActiveSections = reordered.map((s, idx) => ({
      ...s,
      order: idx + 1,
      isUpdated: !s.isNew,
    }));

    const deletedSections = (moduleData.sections || []).filter((s) => s.isDeleted);
    const allUpdatedSections = [...updatedActiveSections, ...deletedSections];

    const updatedModule = {
      ...moduleData,
      sections: allUpdatedSections,
    };

    updateModuleInStorage(updatedModule);
    toast.success("Sections reordered");
  };

  const handleAddSection = () => {
    if (!secName.trim()) return toast.error("Section name is required");

    const activeSections = (moduleData.sections || []).filter((s) => !s.isDeleted);

    const newSection: Section = {
      _id: `local-section-${Date.now()}`,
      moduleId: moduleData._id,
      sectionName: secName.trim(),
      sectionDescription: secDesc.trim(),
      order: activeSections.length + 1,
      tests: [],
      isNew: true
    };

    const updatedModule = {
      ...moduleData,
      sections: [...(moduleData.sections || []), newSection],
    };

    updateModuleInStorage(updatedModule);
    setSecName("");
    setSecDesc("");
    toast.success("Section added");
  };

  const handleRenameModule = (newName: string) => {
    if (!newName.trim() || newName.trim() === moduleData.moduleName) return;

    const updatedModule = {
      ...moduleData,
      moduleName: newName.trim(),
      isUpdated: !moduleData.isNew,
    };

    updateModuleInStorage(updatedModule);
    toast.success("Module renamed");
  };

  const handleUpdateDescription = (newDesc: string) => {
    const updatedModule = {
      ...moduleData,
      moduleDescription: newDesc.trim(),
      isUpdated: !moduleData.isNew,
    };

    updateModuleInStorage(updatedModule);
    toast.success("Description updated");
  };

//   const handleDeleteModule = async () => {
//     try {
//       const modules: ModuleItem[] = await db.modules.where("courseId").equals(moduleData.courseId).toArray();

//       let updatedModules: ModuleItem[] = [];
//       let nextModuleId: string | null = null;

//       const currentOrder = moduleData.order;
//       const activeModules = modules.filter((m) => !m.isDeleted && m._id !== moduleData._id);
// console.log("activeModules",activeModules);
//       if (activeModules.length > 0) {
//         const sortedActiveModules = activeModules.sort((a, b) => a.order - b.order);
//         const nextModule = sortedActiveModules.find(m => m.order > currentOrder);
//         nextModuleId = nextModule ? nextModule._id : sortedActiveModules[sortedActiveModules.length - 1]._id;
//       }

//       if (moduleData.isNew) {
//         updatedModules = modules.filter((m) => m._id !== moduleData._id);
//         toast.success("Module deleted");
//       } else {
//         updatedModules = modules.map((m) =>
//           m._id === moduleData._id ? { ...m, isDeleted: true } : m
//         );
//         toast.success("Module deleted");
//       }

//       const deletedOrder = moduleData.order;
//       updatedModules = updatedModules.map((m) => {
//         if (!m.isDeleted && m.order > deletedOrder) {
//           return { ...m, order: m.order - 1, isUpdated: true };
//         }
//         return m;
//       });

//       await db.modules.bulkPut(updatedModules.map(m => ({
//         ...m,
//         updatedAt: new Date().toISOString(),
//         lastUpdatedBy: userId
//       }) as Module));

//       setShowDeleteConfirm(false);
//       onChanged(nextModuleId);
//     } catch (err) {
//       console.error("Error deleting module in DB:", err);
//       toast.error("Failed to delete module in DB");
//     }
//   };



const handleDeleteModule = async () => {
  try {
    // Check if module can be deleted
    console.log("came inside delete module");
    const response = await api.get(`/module/${moduleData._id}/can-delete`);
    const { canDelete, reason } = response.data;
    
    if (!canDelete) {
      toast.error(reason || "Cannot delete this module");
      return; // Just return, don't set showDeleteConfirm to false
    }
    
    // If eligible, show the confirmation popup
    console.log("Module can be deleted");
    setShowDeleteConfirm(true);
    
  } catch (error: any) {
    console.error("Error checking module deletion eligibility:", error);
    toast.error("Failed to check deletion eligibility");
  }
};

// Separate function for when user confirms deletion in popup
const confirmDeleteModule = async () => {
  try {
    const modules: ModuleItem[] = await db.modules.where("courseId").equals(moduleData.courseId).toArray();

    let updatedModules: ModuleItem[] = [];
    let nextModuleId: string | null = null;

    const currentOrder = moduleData.order;
    const activeModules = modules.filter((m) => !m.isDeleted && m._id !== moduleData._id);
    console.log("activeModules", activeModules);
    
    if (activeModules.length > 0) {
      const sortedActiveModules = activeModules.sort((a, b) => a.order - b.order);
      const nextModule = sortedActiveModules.find(m => m.order > currentOrder);
      nextModuleId = nextModule ? nextModule._id : sortedActiveModules[sortedActiveModules.length - 1]._id;
    }

    if (moduleData.isNew) {
      updatedModules = modules.filter((m) => m._id !== moduleData._id);
      toast.success("Module deleted");
    } else {
      updatedModules = modules.map((m) =>
        m._id === moduleData._id ? { ...m, isDeleted: true } : m
      );
      toast.success("Module deleted");
    }

    const deletedOrder = moduleData.order;
    updatedModules = updatedModules.map((m) => {
      if (!m.isDeleted && m.order > deletedOrder) {
        return { ...m, order: m.order - 1, isUpdated: true };
      }
      return m;
    });

    await db.modules.bulkPut(updatedModules.map(m => ({
      ...m,
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: userId
    }) as Module));

    setShowDeleteConfirm(false);
    onChanged(nextModuleId);
  } catch (err) {
    console.error("Error deleting module in DB:", err);
    toast.error("Failed to delete module in DB");
    setShowDeleteConfirm(false);
  }
};

  const handleSectionUpdate = (updatedSection: Section & { remove?: boolean }) => {
    let updatedSections: Section[] = [];

    if (updatedSection.remove) {
      updatedSections = (moduleData.sections || []).filter((s) => s._id !== updatedSection._id);
      const deletedOrder = updatedSection.order;
      updatedSections = updatedSections.map((s) => {
        if (!s.isDeleted && s.order > deletedOrder) {
          return { ...s, order: s.order - 1, isUpdated: true };
        }
        return s;
      });
    } else {
      updatedSections = (moduleData.sections || []).map((s) =>
        s._id === updatedSection._id ? updatedSection : s
      );

      if (updatedSection.isDeleted) {
        const deletedOrder = updatedSection.order;
        updatedSections = updatedSections.map((s) => {
          if (!s.isDeleted && s.order > deletedOrder) {
            return { ...s, order: s.order - 1, isUpdated: true };
          }
          return s;
        });
      }
    }

    const updatedModule = { ...moduleData, sections: updatedSections };
    updateModuleInStorage(updatedModule);
  };

  const activeSections = sortedSections.filter((s) => !s.isDeleted);

  return (
    <div className="h-full overflow-y-auto">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Module</h3>
            </div>
            
            <div className="p-5">
              <p className="text-gray-700 mb-1 font-medium text-sm">Are you sure you want to delete this module?</p>
              <p className="text-xs text-gray-500 mb-5">This action cannot be undone. All sections will be removed.</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteModule}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-5 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <InlineEdit
              value={moduleData.moduleName}
              onSave={handleRenameModule}
              placeholder="Module name"
              className="text-base font-bold text-gray-900"
            />
            <InlineEdit
              value={moduleData.moduleDescription || ""}
              onSave={handleUpdateDescription}
              placeholder="Add description..."
              className="text-xs text-gray-500 mt-0.5"
              textarea
            />
          </div>
          
          {/* Delete Icon Button */}
          <button
            onClick={handleDeleteModule}
            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
            title="Delete Module"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-3">
        {activeSections.length === 0 ? (
          <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-700 font-semibold">No sections yet</div>
            <div className="text-xs text-gray-500 mt-1">Add your first section below</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleSectionDragEnd}>
            <Droppable droppableId={`sections-${moduleData._id}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 ${
                    snapshot.isDraggingOver ? "bg-blue-50/50 rounded-xl p-2" : ""
                  } transition-colors`}
                >
                  {activeSections.map((section, index) => (
                    <Draggable
                      key={section._id}
                      draggableId={section._id}
                      index={index}
                      isDragDisabled={loadingTests}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            snapshot.isDragging
                              ? "shadow-2xl bg-white z-50 rotate-1 scale-105"
                              : ""
                          } transition-all duration-200`}
                        >
                          <div className="flex gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-start pt-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div
                              className={`flex-1 ${
                                snapshot.isDragging ? "pointer-events-none" : ""
                              }`}
                            >
                              <SectionContainer
                                key={section._id}
                                section={section}
                                userId={userId}
                                courseId={moduleData.courseId}
                                allTests={allTests}
                                loadingTests={loadingTests}
                                onChanged={handleSectionUpdate}
                              />
                            </div>
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
        )}

        {/* Add Section - Compact Card */}
        <div className="mt-3 border-2 border-dashed border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 hover:border-blue-500 hover:shadow-md transition-all">
          <div className="text-xs font-bold text-gray-800 mb-2.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            Add New Section
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Section Name</label>
              <input
                value={secName}
                onChange={(e) => setSecName(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Introduction"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={secDesc}
                onChange={(e) => setSecDesc(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Brief overview"
              />
            </div>
            <button
              onClick={handleAddSection}
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            >
              Add Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;