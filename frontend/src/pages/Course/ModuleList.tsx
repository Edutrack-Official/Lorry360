import React, { useState } from "react";
import toast from "react-hot-toast";
import { ModuleItem } from "./types/course";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { db } from "../../db";
import type { Module } from "../../db";
import { GripVertical, Plus, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  modules: ModuleItem[];
  selectedModuleId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void;
  courseId: string;
  userId: string;
  loading?: boolean;
}

const ModuleList: React.FC<Props> = ({
  modules,
  selectedModuleId,
  onSelect,
  onChanged,
  courseId,
  userId,
  loading,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Module name is required");

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const activeModules = modules.filter((m) => !m.isDeleted);

      const newModule: Module = {
        _id: `local-${crypto.randomUUID()}`,
        courseId,
        moduleName: name.trim(),
        moduleDescription: desc.trim(),
        order: activeModules.length + 1,
        createdBy: userId,
        lastUpdatedBy: userId,
        createdAt: now,
        updatedAt: now,
        isNew: true,
        isUpdated: false,
        isDeleted: false,
      };

      await db.modules.add(newModule);
      toast.success("Module created");

      setName("");
      setDesc("");
      setShowAdd(false);

      onChanged();
      onSelect(newModule._id);
    } catch (err) {
      console.error("Error creating module:", err);
      toast.error("Failed to create module");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const activeModules = modules.filter((m) => !m.isDeleted).sort((a, b) => a.order - b.order);
    const [moved] = activeModules.splice(source.index, 1);
    activeModules.splice(destination.index, 0, moved);

    const updatedActiveModules = activeModules.map((m, idx) => ({
      ...m,
      order: idx + 1,
      isUpdated: !m.isNew,
    }));

    const deletedModules = modules.filter((m) => m.isDeleted);
    const allUpdatedModules = [...updatedActiveModules, ...deletedModules];

    await db.modules.where("courseId").equals(courseId).delete();
    await db.modules.bulkPut(allUpdatedModules as Module[]);

    toast.success("Modules reordered");
    onChanged();
  };

  const activeModules = modules.filter((m) => !m.isDeleted).sort((a, b) => a.order - b.order);

  return (
    <aside className="w-[280px] border-r h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
     <div className="px-4 py-3 border-b bg-white flex items-center gap-3">
  <button 
    onClick={() => navigate("/courses")}
    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
  >
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <div className="text-sm font-semibold text-gray-800">Modules</div>
</div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeModules.length === 0 && !loading ? (
          <div className="p-4 text-center">
            <div className="text-xs text-gray-500">No modules yet</div>
            <div className="text-xs text-gray-400 mt-1">Create your first module</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="modules">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-1 ${snapshot.isDraggingOver ? "bg-blue-50/50 rounded-lg p-1" : ""} transition-colors`}
                >
                  {activeModules.map((m, index) => (
                    <Draggable key={m._id} draggableId={m._id} index={index} isDragDisabled={loading}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            rounded-lg transition-all duration-200
                            ${snapshot.isDragging ? "shadow-xl bg-white z-50 scale-105 rotate-1" : ""}
                          `}
                        >
                          <div
                            className={`
                              flex items-center gap-2 rounded-lg overflow-hidden
                              ${m._id === selectedModuleId 
                                ? "bg-blue-100 border border-blue-300 shadow-sm" 
                                : "bg-white border border-gray-200 hover:border-blue-200 hover:shadow-sm"
                              }
                              transition-all
                            `}
                          >
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="px-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical className="w-3 h-3" />
                            </div>

                            {/* Module Content */}
                            <button
                              onClick={() =>
                                {
                                   onSelect(m._id)
                                    localStorage.setItem("selectedModuleId",m._id);
                                }
                              }
                              className={`
                                flex-1 text-left py-2.5 pr-3
                                ${snapshot.isDragging ? "pointer-events-none" : ""}
                              `}
                            >
                              <div className="flex items-center gap-1.5">
                                <div className={`
                                  text-xs font-medium truncate
                                  ${m._id === selectedModuleId ? "text-blue-900" : "text-gray-800"}
                                `}>
                                  {m.moduleName}
                                </div>
                                {m.isNew && (
                                  <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                    New
                                  </span>
                                )}
                                {m.isUpdated && !m.isNew && (
                                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                    Edit
                                  </span>
                                )}
                              </div>
                              {!!m.sections?.filter(s => !s.isDeleted).length && (
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  {m.sections.filter(s => !s.isDeleted).length} sections
                                </div>
                              )}
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
        )}
      </div>

      {/* Add Module Section */}
      <div className="border-t bg-white p-3">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5"
            disabled={loading}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Module
          </button>
        ) : (
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Module name"
              autoFocus
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 text-white px-3 py-2 text-xs font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" />
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setName("");
                  setDesc("");
                }}
                className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ModuleList;