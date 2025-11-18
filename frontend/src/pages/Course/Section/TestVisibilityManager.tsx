import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import api from "../../../api/client";

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

const TestVisibilityManager: React.FC<{ courseId: string; testId: string }> = ({
  courseId,
  testId,
}) => {
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
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  // Step 1: fetch batchId
  useEffect(() => {
    const fetchBatchId = async () => {
      try {
        const res = await api.get(`/enrollments/course/${courseId}`);
        if (res.data && res.data.length > 0) {
          setBatchId(res.data[0].batchId._id);
        } else {
          toast.error("No batch found for this course");
        }
      } catch (err) {
        console.error(err);
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
        console.log("res.data",res.data);
        
        setGroups(res.data.groups);
        setCandidates(res.data.students);

        const visRes = await api.get(
          `/test-visibility/${courseId}/${testId}`
        );

        console.log("visRes",visRes);
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
    } catch (err) {
      console.error(err);
      toast.error("Failed to save test visibility");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading...</p>;
  }

  // Determine which sections are selected
  const groupSelected = Boolean(
    visibility.includeGroups.length || visibility.excludeGroups.length
  );
  const candidateSelected = Boolean(
    visibility.includeCandidates.length || visibility.excludeCandidates.length
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">

      {/* Groups */}
      <div>
        <h3 className="text-lg font-medium mb-2">Groups</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Include Groups */}
          <div>
            <label className="block text-green-600 font-medium mb-1">
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
            />
          </div>

          {/* Exclude Groups */}
          <div>
            <label className="block text-red-600 font-medium mb-1">
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
            />
          </div>
        </div>
      </div>

      {/* Candidates */}
      <div>
        <h3 className="text-lg font-medium mb-2">Candidates</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Include Candidates */}
          <div>
            <label className="block text-green-600 font-medium mb-1">
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
            />
          </div>

          {/* Exclude Candidates */}
          <div>
            <label className="block text-red-600 font-medium mb-1">
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
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isExistingRecord ? "Update Visibility" : "Save Visibility"}
        </button>
      </div>
    </div>
  );
};

export default TestVisibilityManager;
