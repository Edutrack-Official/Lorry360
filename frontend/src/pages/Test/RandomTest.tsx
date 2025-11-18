import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";


const tabs = ["Details", "Sections", "Question Sets", "Preview"] as const;
type Tab = (typeof tabs)[number];

type Difficulty = "Easy" | "Medium" | "Hard";

type Distribution = {
  easy: number;
  medium: number;
  hard: number;
};

type Availability = {
  easy: number;
  medium: number;
  hard: number;
};

type QuestionSet = {
  _id: string;
  name: string;
};

type SectionQS = {
  questionSetId: string; // UI field
  distribution: Distribution; // what user chooses
};

type Section = {
  sectionName: string;
  sectionDescription?: string;
  questionSets: SectionQS[];
};

type RandomTestForm = {
  _id: string;
  code: string;
  name: string;
  description: string;
  sections: Section[];
};

const emptyDistribution = (): Distribution => ({ easy: 0, medium: 0, hard: 0 });

const RandomTestBuilder: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState<Tab>("Details");
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [availabilityBySet, setAvailabilityBySet] = useState<
    Record<string, Availability>
  >({}); // per setId: available counts per difficulty
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

  const [formData, setFormData] = useState<RandomTestForm>({
    _id: "",
    code: "",
    name: "",
    description: "",
    sections: [
      {
        sectionName: "",
        sectionDescription: "",
        questionSets: [],
      },
    ],
  });

  // ---------- Load Question Sets ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/questionset/all`);
        setQuestionSets(res.data?.questionSets || []);
      } catch {
        toast.error("Failed to load question sets");
      }
    })();
  }, []);

  // ---------- Load Test (edit) ----------
  useEffect(() => {
    const fromState = (location as any)?.state?.test;
    if (id) {
      fetchTestDetails(id);
    } else if (fromState) {
      normalizeAndInitialize(fromState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTestDetails = async (testId: string) => {
    try {
      console.log("testId"+testId);
      
      const res = await api.get(`/test/${testId}`);
      console.log("res fetchTestDetails"+JSON.stringify(res.data));
      
      normalizeAndInitialize(res.data);
    } catch {
      toast.error("Failed to load test details");
    }
  };

  // ---------- Normalize edit payload -> UI shape ----------
// ---------- Normalize edit payload -> UI shape ----------
const normalizeAndInitialize = async (test: any) => {
  const normalizedSections: Section[] =
    (test.sections || []).map((s: any) => ({
      sectionName: s.sectionName || "",
      sectionDescription: s.sectionDescription || "",
      questionSets:
        (s.questionSets || []).map((qs: any) => ({
          questionSetId:
            typeof qs.questionSet === "string"
              ? qs.questionSet
              : qs.questionSet?._id || "",
          distribution: {
            easy: Number(qs.distribution?.easy || 0),
            medium: Number(qs.distribution?.medium || 0),
            hard: Number(qs.distribution?.hard || 0),
          },
        })) || [],
    })) || [];

  setFormData({
    _id: test._id || "",
    code: test.code || "",
    name: test.name || "",
    description: test.description || "",
    sections: normalizedSections.length
      ? normalizedSections
      : [
          {
            sectionName: "",
            sectionDescription: "",
            questionSets: [],
          },
        ],
  });

  // Preload availability for any selected sets
  const uniqueSetIds = Array.from(
    new Set(
      normalizedSections.flatMap((sec) =>
        sec.questionSets.map((qs) => qs.questionSetId).filter(Boolean)
      )
    )
  );
  for (const setId of uniqueSetIds) {
    await ensureAvailability(setId);
  }

  setActiveTab("Preview");
};


  // ---------- Availability ----------
  const ensureAvailability = async (setId: string) => {
    if (!setId) return;
    if (availabilityBySet[setId]) return; // already cached
    try {
      const res = await api.get(`/question/questionset/${setId}`);
      const questions = res.data || [];
      const counts: Availability = { easy: 0, medium: 0, hard: 0 };
      for (const q of questions) {
        const d = (q.difficulty || "").toLowerCase();
        if (d === "easy") counts.easy += 1;
        else if (d === "medium") counts.medium += 1;
        else if (d === "hard") counts.hard += 1;
      }
      setAvailabilityBySet((prev) => ({ ...prev, [setId]: counts }));
    } catch {
      toast.error("Failed to load availability for selected set");
    }
  };

  // ---------- Details ops ----------
  const updateDetail = (field: keyof Omit<RandomTestForm, "sections" | "_id">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Section ops ----------
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { sectionName: "", sectionDescription: "", questionSets: [] },
      ],
    }));
  };

  const removeSection = (idx: number) => {
    setFormData((prev) => {
      const updated = prev.sections.filter((_, i) => i !== idx);
      return { ...prev, sections: updated.length ? updated : [{ sectionName: "", sectionDescription: "", questionSets: [] }] };
    });
  };

  const updateSectionField = (
    idx: number,
    field: "sectionName" | "sectionDescription",
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  // ---------- Question Set ops per section ----------
  const addQuestionSet = (sectionIdx: number) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[sectionIdx] = {
        ...updated[sectionIdx],
        questionSets: [
          ...(updated[sectionIdx].questionSets || []),
          { questionSetId: "", distribution: emptyDistribution() },
        ],
      };
      return { ...prev, sections: updated };
    });
  };

  const removeQuestionSet = (sectionIdx: number, qsIdx: number) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      const list = [...(updated[sectionIdx].questionSets || [])].filter(
        (_, i) => i !== qsIdx
      );
      updated[sectionIdx] = { ...updated[sectionIdx], questionSets: list };
      return { ...prev, sections: updated };
    });
  };

  const updateQuestionSetId = async (
    sectionIdx: number,
    qsIdx: number,
    newId: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      const qs = [...(updated[sectionIdx].questionSets || [])];
      // changing set -> reset distribution
      qs[qsIdx] = { questionSetId: newId, distribution: emptyDistribution() };
      updated[sectionIdx] = { ...updated[sectionIdx], questionSets: qs };
      return { ...prev, sections: updated };
    });
    if (newId) await ensureAvailability(newId);
  };

  const updateDistribution = (
    sectionIdx: number,
    qsIdx: number,
    difficulty: keyof Distribution,
    value: number
  ) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      const qs = [...(updated[sectionIdx].questionSets || [])];
      const setId = qs[qsIdx].questionSetId;
      const avail = availabilityBySet[setId] || { easy: 0, medium: 0, hard: 0 };

      const max =
        difficulty === "easy"
          ? avail.easy
          : difficulty === "medium"
          ? avail.medium
          : avail.hard;

      // clamp
      const safe = Math.max(0, Math.min(Number(value) || 0, max));

      qs[qsIdx] = {
        ...qs[qsIdx],
        distribution: {
          ...qs[qsIdx].distribution,
          [difficulty]: safe,
        },
      };
      updated[sectionIdx] = { ...updated[sectionIdx], questionSets: qs };
      return { ...prev, sections: updated };
    });
  };

  const setNameById = useMemo(
    () =>
      Object.fromEntries(questionSets.map((s) => [s._id, s.name])) as Record<
        string,
        string
      >,
    [questionSets]
  );

  // ---------- Save ----------
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Build backend payload shape
      const cleanedSections = formData.sections
        .filter((s) => s.sectionName.trim().length > 0)
        .map((s) => ({
          sectionName: s.sectionName,
          sectionDescription: s.sectionDescription || "",
          questionSets: (s.questionSets || [])
            .filter((qs) => qs.questionSetId)
            .map((qs) => ({
              questionSet: qs.questionSetId,
              distribution: {
                easy: Number(qs.distribution.easy || 0),
                medium: Number(qs.distribution.medium || 0),
                hard: Number(qs.distribution.hard || 0),
              },
            })),
        }));

      // Basic guard
      if (!formData.code || !formData.name) {
        toast.error("Please enter code and name");
        setActiveTab("Details");
        return;
      }
      if (!cleanedSections.length) {
        toast.error("Please add at least one section");
        setActiveTab("Sections");
        return;
      }
      const hasAnyQS = cleanedSections.some(
        (s: any) => s.questionSets && s.questionSets.length > 0
      );
      if (!hasAnyQS) {
        toast.error("Please add at least one Question Set");
        setActiveTab("Question Sets");
        return;
      }


      const payload = {
        code: formData.code,
        name: formData.name,
        type:"random",
        description: formData.description,
        sections: cleanedSections,
        createdBy: user?.id,
        lastUpdatedBy: user?.id,
      };

      console.log(payload)

      if (formData._id) {
        await api.put(
          `/test/update/${formData._id}`,
          payload
        );
        toast.success("Random Test updated successfully");
      } else {
        await api.post(`/test/create`, payload);
        toast.success("Random Test created successfully");
      }

      // Reset
      setFormData({
        _id: "",
        code: "",
        name: "",
        description: "",
        sections: [
          { sectionName: "", sectionDescription: "", questionSets: [] },
        ],
      });
      setActiveTab("Details");
      navigate('/view-random-tests');
    } catch (e: any) {
      toast.error(
        e?.response?.data?.error || e?.message || "Failed to save test"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Tabs flow ----------
  const goToTab = (nextTab: Tab) => {
    // validate minimal fields when moving forward
    const currentIdx = tabs.indexOf(activeTab);
    const nextIdx = tabs.indexOf(nextTab);
    if (nextIdx <= currentIdx) {
      setActiveTab(nextTab);
      return;
    }

    if (activeTab === "Details") {
      if (!formData.name || !formData.code || !formData.description) {
        toast.error("Please fill all required fields");
        return;
      }
    }
    if (activeTab === "Sections") {
      if (
        formData.sections.length === 0 ||
        formData.sections.some((s) => !s.sectionName)
      ) {
        toast.error("Please add at least one section with a name");
        return;
      }
    }
    if (activeTab === "Question Sets") {
      const hasQS = formData.sections.some(
        (s) => (s.questionSets || []).length > 0
      );
      if (!hasQS) {
        toast.error("Please add at least one Question Set");
        return;
      }
    }

    setActiveTab(nextTab);
  };

  // ---------- Render ----------
  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${
              activeTab === tab
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => goToTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Details */}
      {activeTab === "Details" && (
        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="block font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded p-2 w-full"
              placeholder="RandomTest Name"
              value={formData.name}
              onChange={(e) => updateDetail("name", e.target.value)}
            />
          </div>

          {/* Code */}
          <div>
            <label className="block font-medium mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded p-2 w-full"
              placeholder="Unique Code"
              value={formData.code}
              onChange={(e) => updateDetail("code", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="border rounded p-2 w-full"
              placeholder="RandomTest Description"
              value={formData.description}
              onChange={(e) => updateDetail("description", e.target.value)}
            />
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => goToTab("Sections")}
          >
            Next: Sections
          </button>
        </div>
      )}

      {/* Sections */}
      {activeTab === "Sections" && (
        <div className="space-y-4">
          {formData.sections.map((section, idx) => (
            <div key={idx} className="border p-4 rounded-xl space-y-3 relative">
              <button
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                onClick={() => removeSection(idx)}
                title="Remove section"
              >
                ✕
              </button>

              <div>
                <label className="block font-medium mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="border rounded p-2 w-full"
                  placeholder="Enter Section Name"
                  value={section.sectionName}
                  onChange={(e) =>
                    updateSectionField(idx, "sectionName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Section Description
                </label>
                <textarea
                  className="border rounded p-2 w-full"
                  placeholder="Optional"
                  value={section.sectionDescription || ""}
                  onChange={(e) =>
                    updateSectionField(idx, "sectionDescription", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={addSection}
            >
              Add Section
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => goToTab("Question Sets")}
            >
              Next: Question Sets
            </button>
          </div>
        </div>
      )}

      {/* Question Sets */}
      {activeTab === "Question Sets" && (
        <div className="space-y-6">
          {formData.sections.map((section, sIdx) => (
            <div key={sIdx} className="border p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {section.sectionName || `Section ${sIdx + 1}`}
                </h3>
                <button
                  className="bg-gray-200 px-3 py-1 rounded"
                  onClick={() => addQuestionSet(sIdx)}
                >
                  + Add Question Set
                </button>
              </div>

              {(section.questionSets || []).length === 0 ? (
                <p className="text-sm text-gray-600">
                  No question sets added for this section yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {section.questionSets.map((qs, qsIdx) => {
                    const avail = availabilityBySet[qs.questionSetId];
                    const hasSet = !!qs.questionSetId;
                    return (
                      <div
                        key={qsIdx}
                        className="border rounded-lg p-3 bg-gray-50 space-y-3"
                      >
                        <div className="flex gap-2 items-center">
                          <select
                            className="border rounded p-2"
                            value={qs.questionSetId}
                            onChange={(e) =>
                              updateQuestionSetId(
                                sIdx,
                                qsIdx,
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Question Set</option>
                            {questionSets.map((set) => (
                              <option key={set._id} value={set._id}>
                                {set.name}
                              </option>
                            ))}
                          </select>

                          <button
                            className="ml-auto text-red-600"
                            onClick={() => removeQuestionSet(sIdx, qsIdx)}
                            title="Remove this question set from section"
                          >
                            ✕
                          </button>
                        </div>

                        {hasSet && (
                          <>
                            <div className="text-sm">
                              {avail ? (
                                <div className="flex flex-wrap gap-3">
                                  <span>
                                    <strong>Available</strong> — Easy:{" "}
                                    {avail.easy}, Medium: {avail.medium}, Hard:{" "}
                                    {avail.hard}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500">
                                  Loading availability…
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium">
                                  Easy
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={avail?.easy ?? 0}
                                  value={qs.distribution.easy}
                                  onChange={(e) =>
                                    updateDistribution(
                                      sIdx,
                                      qsIdx,
                                      "easy",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border rounded p-2 w-full"
                                  disabled={!avail}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  max {avail?.easy ?? 0}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium">
                                  Medium
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={avail?.medium ?? 0}
                                  value={qs.distribution.medium}
                                  onChange={(e) =>
                                    updateDistribution(
                                      sIdx,
                                      qsIdx,
                                      "medium",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border rounded p-2 w-full"
                                  disabled={!avail}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  max {avail?.medium ?? 0}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium">
                                  Hard
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={avail?.hard ?? 0}
                                  value={qs.distribution.hard}
                                  onChange={(e) =>
                                    updateDistribution(
                                      sIdx,
                                      qsIdx,
                                      "hard",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border rounded p-2 w-full"
                                  disabled={!avail}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  max {avail?.hard ?? 0}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => goToTab("Preview")}
            >
              Next: Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {activeTab === "Preview" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview Random Test</h2>

          <div className="border rounded p-4 bg-gray-50">
            <p>
              <strong>Name:</strong> {formData.name}
            </p>
            <p>
              <strong>Code:</strong> {formData.code}
            </p>
            <p>
              <strong>Description:</strong> {formData.description || "-"}
            </p>
          </div>

          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div key={index} className="border p-4 rounded space-y-2">
                <h3 className="font-bold">
                  Section {index + 1}: {section.sectionName || "(unnamed)"}
                </h3>
                <p className="text-sm text-gray-600">
                  {section.sectionDescription || "No description"}
                </p>

                {(section.questionSets || []).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No Question Sets configured.
                  </p>
                ) : (
                  <table className="w-full text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Question Set</th>
                        <th className="border p-2">Easy</th>
                        <th className="border p-2">Medium</th>
                        <th className="border p-2">Hard</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.questionSets.map((qs, i) => (
                        <tr key={i}>
                          <td className="border p-2">
                            {setNameById[qs.questionSetId] ||
                              qs.questionSetId ||
                              "—"}
                          </td>
                          <td className="border p-2 text-center">
                            {qs.distribution.easy}
                          </td>
                          <td className="border p-2 text-center">
                            {qs.distribution.medium}
                          </td>
                          <td className="border p-2 text-center">
                            {qs.distribution.hard}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>

          <button
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Save Random Test"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RandomTestBuilder;
