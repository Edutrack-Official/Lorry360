import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import ModuleList from "./ModuleList";
import ModuleDetail from "./ModuleDetail";
import type { ModuleItem, Section, TestLite } from "./types/course";
import { db } from "../../db";
import { Save, BookOpen, FileText, Loader } from "lucide-react";
import api from "../../api/client";
import LoadingSpinner from "../../components/LoadingSpinner";

interface Props {
  courseId: string;
  batchId?: string | null;
  currentUserId?: string;
}

const DEFAULT_USER_ID = "system";

const CourseBuilder: React.FC<Props> = ({ courseId, batchId, currentUserId }) => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = currentUserId || DEFAULT_USER_ID;
const coursename=localStorage.getItem("coursename");
;

  /** Sanitize modules before saving or displaying */
  const sanitizeModules = (modules: ModuleItem[]): ModuleItem[] => {
    return modules.map((m) => ({
      ...m,
      sections: Array.isArray(m.sections)
        ? m.sections.map((s: Section) => ({
          ...s,
          tests: Array.isArray(s.tests) ? s.tests : [],
          isNew: s.isNew ?? false,
          isUpdated: s.isUpdated ?? false,
          isDeleted: s.isDeleted ?? false,
        }))
        : [],
      isNew: m.isNew ?? false,
      isUpdated: m.isUpdated ?? false,
      isDeleted: m.isDeleted ?? false,
    }));
  };

  /** Load modules (IndexedDB first, then API) */
  // const loadModules = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const cached = await db.modules.where("courseId").equals(courseId).toArray();

  //     if (cached && cached.length > 0) {
  //       const safeModules = sanitizeModules(cached);
  //       console.log("loaded modules from IndexedDB:", safeModules);
  //       setModules(safeModules);

  //       const activeModules = safeModules.filter((m) => !m.isDeleted);
  //       if (activeModules.length > 0 && !selectedModuleId) {
  //         setSelectedModuleId(activeModules[0]._id ?? null);
  //       }
   
  //     } else {
  //       const res = await api.get(`/module/course/${courseId}`);
  //       let list: ModuleItem[] = res.data?.modules || [];
  //       list = sanitizeModules(list);
  //       console.log("inside else",list)

  //       setModules(list);

  //       await db.modules.where("courseId").equals(courseId).delete();
  //       await db.modules.bulkPut(list as any);

  //       if (list.length > 0) setSelectedModuleId(list[0]._id ?? null);
  //     }
  //   } catch (err: any) {
  //     console.error(err);
  //     toast.error(err.response?.data?.message || "Failed to load modules");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [courseId, selectedModuleId]);


  const loadModules = useCallback(async () => {
  setLoading(true);
  try {
    const cached = await db.modules.where("courseId").equals(courseId).toArray();

    if (cached && cached.length > 0) {
      const safeModules = sanitizeModules(cached);
      console.log("loaded modules from IndexedDB:", safeModules);
      setModules(safeModules);

      const activeModules = safeModules.filter((m) => !m.isDeleted);
      
      // Fix: Check if previously selected module still exists and is active
      if (activeModules.length > 0) {
        const previouslySelectedModule = localStorage.getItem("selectedModuleId");
        const moduleStillExists = activeModules.some(m => m._id === previouslySelectedModule);
        
        if (previouslySelectedModule && moduleStillExists) {
          setSelectedModuleId(previouslySelectedModule);
        } else {
          setSelectedModuleId(activeModules[0]._id ?? null);
        }
      }
    } else {
      // ... rest of your API fallback code
      const res = await api.get(`/module/course/${courseId}`);
      let list: ModuleItem[] = res.data?.modules || [];
      list = sanitizeModules(list);
      console.log("inside else", list)

      setModules(list);

      await db.modules.where("courseId").equals(courseId).delete();
      await db.modules.bulkPut(list as any);

      if (list.length > 0) {
        const previouslySelectedModule = localStorage.getItem("selectedModuleId");
        const moduleStillExists = list.some(m => m._id === previouslySelectedModule);
        
        if (previouslySelectedModule && moduleStillExists) {
          setSelectedModuleId(previouslySelectedModule);
        } else {
          setSelectedModuleId(list[0]._id ?? null);
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to load modules");
  } finally {
    setLoading(false);
  }
}, [courseId]); // Remove selectedModuleId from dependencies to avoid infinite loops


  useEffect(() => {
    if (!courseId) return;
    loadModules();
  }, [loadModules, batchId]);

  /** Refresh modules from IndexedDB */
  const refreshModules = useCallback(
    async (nextModuleIdToSelect?: string | null) => {
      const cached = await db.modules.where("courseId").equals(courseId).toArray();
      const safeModules = sanitizeModules(cached);
      setModules(safeModules);

      if (nextModuleIdToSelect !== undefined) {
        setSelectedModuleId(nextModuleIdToSelect);
      }
    },
    [courseId]
  );

  /** Save course to backend */
  const handleSaveCourse = async () => {
    try {
      setSaving(true);

      const cached = await db.modules.where("courseId").equals(courseId).toArray();
      if (!cached || cached.length === 0) {
        toast.error("No changes to save");
        return;
      }

      const payload = {
        courseId,
        modules: sanitizeModules(cached),
        updatedBy: userId,
      };

      const response = await api.post(`/course/save-modules`, payload);
      toast.success("Course saved successfully!");

      let list: ModuleItem[] = response.data?.modules || [];
      list = sanitizeModules(list);

      let newSelectedModuleId = selectedModuleId;
      if (selectedModuleId) {
        const currentModule = modules.find((m) => m._id === selectedModuleId);
        if (currentModule) {
          const matchingModule = list.find(
            (m) =>
              m.order === currentModule.order &&
              m.moduleName === currentModule.moduleName &&
              !m.isDeleted
          );
          if (matchingModule) {
            newSelectedModuleId = matchingModule._id;
          } else {
            const activeModules = list.filter((m) => !m.isDeleted);
            newSelectedModuleId =
              activeModules.length > 0 ? activeModules[0]._id : null;
          }
        }
      }

      setModules(list);

      await db.modules.where("courseId").equals(courseId).delete();
      await db.modules.bulkPut(list as any);

      setSelectedModuleId(newSelectedModuleId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const activeModules = modules
    .filter((m) => !m.isDeleted)
    .sort((a, b) => a.order - b.order);
  const selectedModule = activeModules.find((m) => m._id === selectedModuleId) || null;

  // Calculate total tests across all modules
  const totalTests = activeModules.reduce((count, module) => {
    const sections = module.sections || [];
    const testsInModule = sections.reduce((sectionCount, section) => {
      return sectionCount + (section.tests?.length || 0);
    }, 0);
    return count + testsInModule;
  }, 0);

  return (
    <div className="relative flex flex-col h-screen">
  {/* Main Content Area - Full height */}
  <div className="flex flex-1 rounded-lg bg-white border overflow-hidden">
    {/* Sidebar */}
    <ModuleList
      modules={modules}
      selectedModuleId={selectedModuleId}
      onSelect={setSelectedModuleId}
      courseId={courseId}
      userId={userId}
      loading={loading}
      onChanged={() => refreshModules()}
    />

    {/* Main content */}
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {loading ? (
     <LoadingSpinner text="Loading..." />
) : selectedModule && activeModules.length ? (
        <ModuleDetail
          module={selectedModule}
          userId={userId}
          onChanged={refreshModules}
        />
      ) : (
        <div className="p-6 text-gray-600 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-2">No modules available</h3>
            <p className="text-sm text-gray-500 mb-4">
              {modules.length === 0
                ? 'Get started by creating your first module using the "Add Module" button in the sidebar.'
                : "All modules have been deleted. Create a new module to continue building your course."}
            </p>
            <div className="text-xs text-gray-400">
              Tip: Modules help organize your course content into logical sections
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Footer - Fixed at bottom */}
  <div className="bg-white p-3 border-t shadow-sm">
    <div className="flex items-center justify-between">
      {/* Course Info and Stats */}
      <div className="flex items-center gap-6">
        {/* Course Name */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-700">Course:</span>
            <span className="text-xs font-bold text-blue-600">
              {coursename || "Loading..."}
            </span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-gray-700">
              Modules: <span className="text-green-600 font-bold">{activeModules.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-gray-700">
              Tests: <span className="text-purple-600 font-bold">{totalTests}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveCourse}
        disabled={saving}
        className={`
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          text-sm text-white font-medium
          shadow-md
          transition-all duration-200
          ${saving 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }
        `}
      >
        <Save className="w-4 h-4" />
        <span>{saving ? "Saving..." : "Save"}</span>
      </button>
    </div>
  </div>
</div>
  );
};

export default CourseBuilder;