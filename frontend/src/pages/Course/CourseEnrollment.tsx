import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { Building2, Users, CheckCircle2 } from "lucide-react";

const API_BASE = "http://localhost:7071/api";

type Option = { value: string; label: string };

interface Institute {
  _id: string;
  name: string;
}

interface PopulatedInstitute {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  name: string;
  instituteId?:
    | string
    | PopulatedInstitute
    | PopulatedInstitute[];
}

interface Enrollment {
  _id: string;
  courseId: string;
  batchId: Batch;
}

interface Props {
}

const CourseEnrollment: React.FC<Props> = ({ }) => {
  const { courseId } = useParams<{ courseId: string }>();

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedInstituteOption, setSelectedInstituteOption] = useState<Option | null>(null);
  const [selectedBatchOption, setSelectedBatchOption] = useState<Option | null>(null);

  const getInstituteIdFromBatch = (batch?: Batch): string | undefined => {
    if (!batch || batch.instituteId == null) return undefined;
    if (typeof batch.instituteId === "string") return batch.instituteId;
    if (Array.isArray(batch.instituteId)) return batch.instituteId[0]?._id;
    return batch.instituteId._id;
  };

  const getInstituteNameFromBatch = (batch?: Batch): string | undefined => {
    if (!batch || batch.instituteId == null) return undefined;
    if (typeof batch.instituteId === "string") return undefined;
    if (Array.isArray(batch.instituteId)) return batch.instituteId[0]?.name;
    return batch.instituteId.name;
  };

  const instituteOptions = useMemo<Option[]>(
    () => institutes.map((i) => ({ value: i._id, label: i.name })),
    [institutes]
  );
  const batchOptions = useMemo<Option[]>(
    () => batches.map((b) => ({ value: b._id, label: b.name })),
    [batches]
  );

  useEffect(() => {
    if (!courseId) return;
    fetchEnrollment();
    fetchInstitutes();
  }, [courseId]);

  const fetchEnrollment = async () => {
    if (!courseId) return;
    try {
      const res = await api.get(`/enrollments/course/${courseId}`);
      const data = res.data;
      console.log(" res.data", res.data);
      
      const first: Enrollment | null = Array.isArray(data) ? (data[0] ?? null) : data ?? null;
      setEnrollment(first);
      
      if (first?.batchId?._id) {
        localStorage.setItem("selectedBatchId", first.batchId._id);
      }
    } catch {
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const res = await api.get(`/institutes`);
      setInstitutes(res.data.institutes || []);
    } catch {
      toast.error("Failed to load institutes");
    }
  };

  const fetchBatches = async (instituteId: string) => {
    try {
      const res = await api.get(`/batch/institute/${instituteId}`);
      setBatches(res.data.batches || []);
    } catch {
      toast.error("Failed to load batches");
    }
  };

  useEffect(() => {
    if (!editing || !enrollment || institutes.length === 0) return;

    const inferredInstituteId = getInstituteIdFromBatch(enrollment.batchId);
    if (!inferredInstituteId) {
      setSelectedInstituteOption(null);
      setSelectedBatchOption(null);
      return;
    }

    const inst = institutes.find((i) => i._id === inferredInstituteId);
    const instOption = inst ? { value: inst._id, label: inst.name } : null;
    setSelectedInstituteOption(instOption);

    (async () => {
      await fetchBatches(inferredInstituteId);
      const batch = enrollment.batchId;
      if (batch?._id) {
        setSelectedBatchOption({ value: batch._id, label: batch.name });
      }
    })();
  }, [editing, enrollment, institutes]);

  const handleSave = async () => {
    if (!selectedBatchOption || !courseId) {
      toast.error("Please select a batch");
      return;
    }

    setSaving(true);
    try {
      if (enrollment) {
        await api.put(`/enrollment/update/${enrollment._id}`, {
          batchId: selectedBatchOption.value,
          courseId,
        });
        toast.success("Enrollment updated!");
      } else {
        await api.post(`/enrollment/create`, {
          batchId: selectedBatchOption.value,
          courseId,
        });
        toast.success("Enrollment created!");
      }
      
      setEditing(false);
      setSelectedBatchOption(null);
      setSelectedInstituteOption(null);
      await fetchEnrollment();
      
   
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save enrollment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading enrollment...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Existing enrollment (read-only) */}
      {enrollment && !editing ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Course Enrolled</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <span className="text-sm text-gray-600">Institute</span>
                <p className="font-medium text-gray-900">
                  {getInstituteNameFromBatch(enrollment.batchId) || "N/A"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <span className="text-sm text-gray-600">Batch</span>
                <p className="font-medium text-gray-900">
                  {enrollment.batchId?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-6 w-full px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Change Enrollment
          </button>
        </div>
      ) : (
        // Create/Edit form
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {enrollment ? "Update Enrollment" : "Enroll Course"}
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Institute
              </label>
              <Select
                isSearchable
                isClearable
                value={selectedInstituteOption}
                options={instituteOptions}
                placeholder="Search and select institute..."
                onChange={(opt) => {
                  setSelectedInstituteOption(opt as Option | null);
                  setSelectedBatchOption(null);
                  if (opt?.value) fetchBatches(opt.value);
                  else setBatches([]);
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' },
                  }),
                }}
              />
            </div>

            {selectedInstituteOption && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Select Batch
                </label>
                <Select
                  isSearchable
                  isClearable
                  value={selectedBatchOption}
                  options={batchOptions}
                  placeholder="Search and select batch..."
                  onChange={(opt) => setSelectedBatchOption(opt as Option | null)}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' },
                    }),
                  }}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !selectedBatchOption}
                className="flex-1 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : enrollment ? "Update Enrollment" : "Enroll"}
              </button>
              
              {(enrollment || editing) && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setSelectedInstituteOption(null);
                    setSelectedBatchOption(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition shadow-md"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helpful tip for new users */}
      {!enrollment && !editing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> You need to enroll this course to a batch before you can add modules and content in the Builder.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseEnrollment;