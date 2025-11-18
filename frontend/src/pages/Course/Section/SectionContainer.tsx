import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, Plus, ChevronDown, ChevronUp, AlertTriangle, X } from "lucide-react";
import InlineEdit from "../InlineEdit";
import TestList from "./TestList";
import AddTestDrawer from "./AddTestDrawer";
import ConfigTestDrawer from "./ConfigTestDrawer";
import TestVisibilityDrawer from "./Testvisibilitydrawer";
import type { ModuleItem, Section, SectionTest, TestLite } from "../types/course";
import api from "../../../api/client";
import { db } from "../../../db";
import { set } from "mongoose";


interface Props {
  section: Section;
  userId: string;
  courseId: string;
  allTests: TestLite[];
  loadingTests: boolean;
  onChanged: (updatedSection: Section) => void;
}

type ConfigState = {
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  maxAttempts: number;
  isRetakeAllowed: boolean;
  isResumeAllowed: boolean; // Added this field
  isProctored: boolean;
  isPreparationTest: boolean;
  correctMark: number;
  negativeMark: number;
  passPercentage: number;
  enableVideoProctoring: boolean;
  maxTabSwitch: number;
  videoProctoringViolationLimit: number;
};

const SectionContainer: React.FC<Props> = ({
  section,
  userId,
  courseId,
  allTests,
  loadingTests,
  onChanged,
}) => {
  const navigate = useNavigate();
  const [sectionData, setSectionData] = useState<Section>(section);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestLite | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [configTestId, setConfigTestId] = useState("");
  const [showVisibilityDrawer, setShowVisibilityDrawer] = useState(false); // ✅ Updated state name
  const [visibilityTestId, setVisibilityTestId] = useState<string | null>(null);
  const [configDocId, setConfigDocId] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToRemove, setTestToRemove] = useState<string | null>(null);
 const [config, setConfig] = useState<ConfigState>({
    startTime: "",
    endTime: "",
    durationInMinutes: 60,
    maxAttempts: 1,
    isRetakeAllowed: false,
    isResumeAllowed: true, // Default to true
    isProctored: false,
    isPreparationTest: false,
    correctMark: 1,
    negativeMark: 0,
    passPercentage: 40,
    enableVideoProctoring: false,
    maxTabSwitch: 0,
    videoProctoringViolationLimit: 0,
  });

  useEffect(() => {
    setSectionData(section);
  }, [section]);

  const updateSection = (updated: Section) => {
    setSectionData(updated);
    onChanged(updated);
  };

  const handleRenameSectionName = (newName: string) => {
    if (!newName.trim() || newName.trim() === sectionData.sectionName) return;
    const updatedSection: Section = {
      ...sectionData,
      sectionName: newName.trim(),
      isUpdated: !sectionData.isNew,
    };
    updateSection(updatedSection);
    toast.success("Section name updated");
  };

  const handleUpdateSectionDescription = (newDesc: string) => {
    const updatedSection: Section = {
      ...sectionData,
      sectionDescription: newDesc.trim(),
      isUpdated: !sectionData.isNew,
    };
    updateSection(updatedSection);
    toast.success("Section description updated");
  };

  const testOptions = useMemo(() => {
    const normal = allTests
      .filter((t) => t.type === "normal")
      .map((t) => ({ value: t._id, label: t.name || t.title || t._id, type: "normal" }));
    const random = allTests
      .filter((t) => t.type === "random")
      .map((t) => ({ value: t._id, label: t.name || t.title || t._id, type: "random" }));
    return [
      { label: "Tests", options: normal },
      { label: "Random Tests", options: random },
    ];
  }, [allTests]);

  const getTestName = (testId: string) =>
    allTests.find((t) => t._id === testId)?.name || testId;

  const handleAddTest = async (): Promise<void> => {
    if (!selectedTest) {
      toast.error("Select a test");
      return;
    }

    const modules: ModuleItem[] = await db.modules.where("courseId").equals(courseId).toArray();

    for (const module of modules) {
      for (const section of module.sections || []) {
        const found = (section.tests || []).some(
          (t) => !t.isDeleted && t.testId === selectedTest._id
        );
        if (found) {
          toast.error(`Test already added in ${module.moduleName} - ${section.sectionName}`);
          return;
        }
      }
    }

    const newTest: SectionTest = {
      _id: `local-test-${Date.now()}`,
      sectionId: sectionData._id,
      testId: selectedTest._id,
      order: ((sectionData.tests || []).filter((t) => !t.isDeleted).length || 0) + 1,
      type: selectedTest.type,
      isNew: true,
    };

    updateSection({
      ...sectionData,
      tests: [...(sectionData.tests || []), newTest],
    });

    setSelectedTest(null);
    setShowAddDrawer(false);
    toast.success("Test added");
  };

  const handleRemoveTest = async (sectionTestId: string) => {
    setTestToRemove(sectionTestId);
  };

  const confirmRemoveTest = async () => {
    if (!testToRemove) return;

    let updatedTests = (sectionData.tests || []).filter((t) => {
      if (t._id === testToRemove) {
        if (t.isNew) return false;
        else t.isDeleted = true;
      }
      return true;
    });

    updatedTests = updatedTests.map((t, idx) => {
      if (!t.isDeleted) {
        return { ...t, order: idx + 1, isUpdated: !t.isNew };
      }
      return t;
    });

    updateSection({ ...sectionData, tests: updatedTests });
    toast.success("Test removed");
    setTestToRemove(null);
  };

  const handleReorderTests = async (reorderedTests: SectionTest[]) => {
    updateSection({
      ...sectionData,
      tests: reorderedTests.map((t, idx) => ({
        ...t,
        order: idx + 1,
        isUpdated: !t.isNew && !t.isDeleted ? true : t.isUpdated,
      })),
    });
    toast.success("Tests reordered");
  };

  // const handleDeleteSection = () => {
  //   if (sectionData.isNew) {
  //     onChanged({ ...sectionData, isDeleted: true, remove: true } as any);
  //     toast.success("Section deleted");
  //   } else {
  //     const updatedSection: Section = { ...sectionData, isDeleted: true };
  //     onChanged(updatedSection);
  //     toast.success("Section marked as deleted");
  //   }
  //   setShowDeleteConfirm(false);
  // };

const handleDeleteSection = async () => {
  try {
    // Check if section can be deleted
    console.log("came inside delete section");
    const response = await api.get(`/section/${sectionData._id}/can-delete`);
    const { canDelete, reason } = response.data;
    
    if (!canDelete) {
      toast.error(reason || "Cannot delete this section");
      return; // Just return, don't set showDeleteConfirm to false
    }
    
    // If eligible, show the confirmation popup
    console.log("Section can be deleted");
    setShowDeleteConfirm(true);
    
  } catch (error: any) {
    console.error("Error checking section deletion eligibility:", error);
    toast.error("Failed to check deletion eligibility");
  }
};

// Separate function for when user confirms deletion in popup
const confirmDeleteSection = async () => {
  // If eligible, proceed with deletion
  if (sectionData.isNew) {
    onChanged({ ...sectionData, isDeleted: true, remove: true } as any);
    toast.success("Section deleted");
  } else {
    const updatedSection: Section = { ...sectionData, isDeleted: true };
    onChanged(updatedSection);
    toast.success("Section deleted");
  }
  setShowDeleteConfirm(false);
};

  const openConfigDrawer = async (testId: string) => {
    try {
      setConfigTestId(testId);
      setSaving(true);
      const res = await api.get(`/test-configuration/${courseId}/${testId}`);
      if (res.data && Object.keys(res.data).length > 0 ) {
        
        const isProctored = !!res.data.isProctored;
        const isPreparation = !!res.data.isPreparationTest;
        setConfigDocId(res.data._id);
        setConfig({
          startTime: toDateTimeLocal(res.data.startTime),
          endTime: toDateTimeLocal(res.data.endTime),
          durationInMinutes: res.data.durationInMinutes || 60,
          maxAttempts: res.data.maxAttempts || 1,
          isRetakeAllowed: !!res.data.isRetakeAllowed,
          isResumeAllowed: res.data.isResumeAllowed !== false, // Default to true if not specified
          isProctored,
          isPreparationTest: isProctored ? false : isPreparation,
          correctMark: res.data.correctMark ?? 1,
          negativeMark: res.data.negativeMark ?? 0,
          passPercentage: res.data.passPercentage ?? 40,
          enableVideoProctoring: res.data.enableVideoProctoring ?? false,
          maxTabSwitch: res.data.maxTabSwitch ?? 0,
          videoProctoringViolationLimit: res.data.videoProctoringViolationLimit ?? 0,
        });
      } else {

      console.log("inside else");
      
        setConfigDocId("");
       setConfig({
      startTime: "",
      endTime: "",
      durationInMinutes: 60,
      maxAttempts: 1,
      isRetakeAllowed: false,
      isResumeAllowed: true, // Default to true
      isProctored: false,
      isPreparationTest: false,
      correctMark: 1,
      negativeMark: 0,
      passPercentage: 40,
      enableVideoProctoring: false,
      maxTabSwitch: 0,
      videoProctoringViolationLimit: 0,
    });
      }

      setShowConfigDrawer(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load config");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);

   const body = {
        testId: configTestId,
        courseId,
        startTime: fromDateTimeLocal(config.startTime),
        endTime: fromDateTimeLocal(config.endTime),
        durationInMinutes: config.durationInMinutes,
        isRetakeAllowed: config.isRetakeAllowed,
        isResumeAllowed: config.isResumeAllowed, // Added this field
        maxAttempts: config.isRetakeAllowed ? config.maxAttempts : 1,
        isProctored: config.isProctored,
        isPreparationTest: !config.isProctored && config.isPreparationTest,
        correctMark: config.correctMark,
        negativeMark: config.negativeMark,
        passPercentage: config.passPercentage,
        // New proctoring fields
        enableVideoProctoring: config.enableVideoProctoring,
        maxTabSwitch: config.maxTabSwitch,
        videoProctoringViolationLimit: config.videoProctoringViolationLimit,
        lastUpdatedBy: userId,
        createdBy: userId,
      };

      if (configDocId) {
        await api.put(`/test-configuration/update/${configDocId}`, body);
      } else {
        await api.post(`/test-configuration/create`, body);
      }

      toast.success("Configuration saved");
      setShowConfigDrawer(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  const toDateTimeLocal = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fromDateTimeLocal = (localStr: string) => {
    if (!localStr) return "";
    return new Date(localStr).toISOString();
  };

  const handleViewResults = (testId: any) => {
    navigate(`/results/${courseId}/${testId}`);
  };

  const activeTests = (sectionData.tests || []).filter((t) => !t.isDeleted);

  return (
    <div className="relative">
      {/* Remove Test Confirmation */}
      {testToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Remove Test</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700 mb-1 font-medium text-sm">Are you sure you want to remove this test?</p>
              <p className="text-xs text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTestToRemove(null)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveTest}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Section</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700 mb-1 font-medium text-sm">Are you sure?</p>
              <p className="text-xs text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSection}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Section Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all mb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <InlineEdit
              value={sectionData.sectionName}
              onSave={handleRenameSectionName}
              placeholder="Section name"
              className="font-semibold text-base text-gray-900"
            />
            <InlineEdit
              value={sectionData.sectionDescription || ""}
              onSave={handleUpdateSectionDescription}
              placeholder="Description (optional)"
              className="text-xs text-gray-500 mt-0.5"
              textarea
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddDrawer(true)}
              className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
              title="Add Test"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteSection}
              className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm hover:shadow-md transform hover:scale-110 active:scale-95"
              title="Delete Section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Tests */}
        {isExpanded && (
          <div>
            {activeTests.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-xs text-gray-500">No tests assigned</p>
              </div>
            ) : (
              <TestList
                tests={activeTests}
                getTestName={getTestName}
                onReorder={handleReorderTests}
                onConfigure={openConfigDrawer}
                onRemove={handleRemoveTest}
                onVisibility={(testId) => {
                  setVisibilityTestId(testId);
                  setShowVisibilityDrawer(true); // ✅ Updated to use drawer state
                }}
                onViewResults={handleViewResults}
                saving={saving}
                sectionId={sectionData._id}
                 courseId={courseId}

              />
            )}
          </div>
        )}
      </div>

      {/* Add Test Drawer */}
      {showAddDrawer && (
        <AddTestDrawer
          testOptions={testOptions}
          selectedTest={selectedTest}
          onTestSelect={setSelectedTest}
          onAdd={handleAddTest}
          onClose={() => setShowAddDrawer(false)}
          saving={saving}
        />
      )}

      {/* Config Test Drawer */}
      {showConfigDrawer && (
        <ConfigTestDrawer
          config={config}
          onConfigChange={setConfig}
          onSave={handleSaveConfig}
          onClose={() => setShowConfigDrawer(false)}
          saving={saving}
        />
      )}

      {/* ✅ Test Visibility Drawer - UPDATED */}
      {showVisibilityDrawer && visibilityTestId && (
        <TestVisibilityDrawer
          courseId={courseId}
          testId={visibilityTestId}
          onClose={() => {
            setShowVisibilityDrawer(false);
            setVisibilityTestId(null);
          }}
        />
      )}
    </div>
  );
};

export default SectionContainer;