import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import api from "../../../api/client";
import { X, Users, Save, AlertCircle } from "lucide-react";

interface Group {
  _id: string;
  name: string;
}

interface Candidate {
  _id: string;
  name: string;
}

interface TestVisibility {
  _id?: string;
  includeGroups: string[];
  excludeGroups: string[];
  includeCandidates: string[];
  excludeCandidates: string[];
}

interface Props {
  courseId: string;
  testId: string;
  onClose: () => void;
}


const TestVisibilityDrawer: React.FC<Props> = ({ courseId, testId, onClose }) => {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [visibility, setVisibility] = useState<TestVisibility>({
    includeGroups: [],
    excludeGroups: [],
    includeCandidates: [],
    excludeCandidates: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [hasEnrollment, setHasEnrollment] = useState(true); // Track if enrollment exists

  // Step 1: fetch batchId
  useEffect(() => {
    const fetchBatchId = async () => {
      try {
        const res = await api.get(`/enrollments/course/${courseId}`);

        console.log(res.data);
        
        if (res.data && res.data.length > 0) {
          setBatchId(res.data[0].batchId._id);
          setHasEnrollment(true);
        } else {
             setLoading(false);

          setHasEnrollment(false);
          // toast.error("No enrollment found for this course");
        }
      } catch (err) {
        console.error(err);
        setHasEnrollment(false);
        toast.error("Failed to fetch enrollment data");
      }
    };
    fetchBatchId();
  }, [courseId]);

  // Step 2: fetch groups, candidates, and existing visibility
  useEffect(() => {
    if (!batchId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/batches/${batchId}/details`);
        console.log("res.data", res.data);

        setGroups(res.data.groups);
        setCandidates(res.data.students);

        const visRes = await api.get(
          `/test-visibility/${courseId}/${testId}`
        );

        console.log("visRes", visRes);
        if (visRes.data && visRes.data._id) {
          setIsExistingRecord(true);
          setVisibility({
            _id: visRes.data._id,
            includeGroups: visRes.data.includeGroups.map((g: any) => g._id),
            excludeGroups: visRes.data.excludeGroups.map((g: any) => g._id),
            includeCandidates: visRes.data.includeCandidates.map((c: any) => c._id),
            excludeCandidates: visRes.data.excludeCandidates.map((c: any) => c._id),
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batchId, courseId, testId]);

  // Step 3: handle select change
  const handleSelectChange = (
    field: keyof TestVisibility,
    selected: { value: string; label: string }[]
  ) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: selected.map((s) => s.value),
    }));
  };

  // Step 4: Save or update visibility
  const handleSave = async () => {
    try {
      setSaving(true);
      if (isExistingRecord && visibility._id) {
        await api.put(
          `/test-visibility/update/${visibility._id}`,
          visibility
        );
        toast.success("Test visibility updated successfully");
      } else {
        await api.post(`/test-visibility/create`, {
          ...visibility,
          courseId,
          testId,
        });
        toast.success("Test visibility created successfully");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save test visibility");
    } finally {
      setSaving(false);
    }
  };

  // Determine which sections are selected
  const groupSelected = Boolean(
    visibility.includeGroups.length || visibility.excludeGroups.length
  );
  const candidateSelected = Boolean(
    visibility.includeCandidates.length || visibility.excludeCandidates.length
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Test Visibility</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : !hasEnrollment ? (
            // No Enrollment State
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-800">No Enrollment Found</h4>
              <p className="text-gray-600 max-w-sm">
                This course is not enrolled to any batch. Please enroll the course first to set test visibility.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You need to enroll this course to a batch before you can manage test visibility settings.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Groups Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                  Groups
                </h4>
                <div className="space-y-3">
                  {/* Include Groups */}
                  <div>
                    <label className="block text-xs font-semibold text-green-600 mb-1">
                      Include Groups
                    </label>
                    <Select
                      isMulti
                      isSearchable
                      options={groups.map((g) => ({ value: g._id, label: g.name }))}
                      value={groups
                        .filter((g) => visibility.includeGroups.includes(g._id))
                        .map((g) => ({ value: g._id, label: g.name }))}
                      onChange={(selected) =>
                        handleSelectChange("includeGroups", selected as any)
                      }
                      placeholder="Select groups to include"
                      isDisabled={candidateSelected || visibility.excludeGroups.length > 0}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
                          borderWidth: "2px",
                          borderRadius: "0.5rem",
                          padding: "0.125rem",
                          boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                      }}
                    />
                    {(candidateSelected || visibility.excludeGroups.length > 0) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {candidateSelected
                          ? "Disabled: Candidates are selected"
                          : "Disabled: Exclude groups are selected"}
                      </p>
                    )}
                  </div>

                  {/* Exclude Groups */}
                  <div>
                    <label className="block text-xs font-semibold text-red-600 mb-1">
                      Exclude Groups
                    </label>
                    <Select
                      isMulti
                      isSearchable
                      options={groups.map((g) => ({ value: g._id, label: g.name }))}
                      value={groups
                        .filter((g) => visibility.excludeGroups.includes(g._id))
                        .map((g) => ({ value: g._id, label: g.name }))}
                      onChange={(selected) =>
                        handleSelectChange("excludeGroups", selected as any)
                      }
                      placeholder="Select groups to exclude"
                      isDisabled={candidateSelected || visibility.includeGroups.length > 0}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
                          borderWidth: "2px",
                          borderRadius: "0.5rem",
                          padding: "0.125rem",
                          boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                      }}
                    />
                    {(candidateSelected || visibility.includeGroups.length > 0) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {candidateSelected
                          ? "Disabled: Candidates are selected"
                          : "Disabled: Include groups are selected"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Candidates Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                  Candidates
                </h4>
                <div className="space-y-3">
                  {/* Include Candidates */}
                  <div>
                    <label className="block text-xs font-semibold text-green-600 mb-1">
                      Include Candidates
                    </label>
                    <Select
                      isMulti
                      isSearchable
                      options={candidates.map((c) => ({ value: c._id, label: c.name }))}
                      value={candidates
                        .filter((c) => visibility.includeCandidates.includes(c._id))
                        .map((c) => ({ value: c._id, label: c.name }))}
                      onChange={(selected) =>
                        handleSelectChange("includeCandidates", selected as any)
                      }
                      placeholder="Select candidates to include"
                      isDisabled={groupSelected || visibility.excludeCandidates.length > 0}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
                          borderWidth: "2px",
                          borderRadius: "0.5rem",
                          padding: "0.125rem",
                          boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                      }}
                    />
                    {(groupSelected || visibility.excludeCandidates.length > 0) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {groupSelected
                          ? "Disabled: Groups are selected"
                          : "Disabled: Exclude candidates are selected"}
                      </p>
                    )}
                  </div>

                  {/* Exclude Candidates */}
                  <div>
                    <label className="block text-xs font-semibold text-red-600 mb-1">
                      Exclude Candidates
                    </label>
                    <Select
                      isMulti
                      isSearchable
                      options={candidates.map((c) => ({ value: c._id, label: c.name }))}
                      value={candidates
                        .filter((c) => visibility.excludeCandidates.includes(c._id))
                        .map((c) => ({ value: c._id, label: c.name }))}
                      onChange={(selected) =>
                        handleSelectChange("excludeCandidates", selected as any)
                      }
                      placeholder="Select candidates to exclude"
                      isDisabled={groupSelected || visibility.includeCandidates.length > 0}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
                          borderWidth: "2px",
                          borderRadius: "0.5rem",
                          padding: "0.125rem",
                          boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                      }}
                    />
                    {(groupSelected || visibility.includeCandidates.length > 0) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {groupSelected
                          ? "Disabled: Groups are selected"
                          : "Disabled: Include candidates are selected"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Visibility Rules</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• You can select either Groups OR Candidates, not both</li>
                  <li>• Include and Exclude options are mutually exclusive</li>
                  <li>• Include: Only selected entities can see the test</li>
                  <li>• Exclude: All except selected entities can see the test</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !hasEnrollment}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : isExistingRecord ? "Update Visibility" : "Save Visibility"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default TestVisibilityDrawer;