import React, { useEffect, useState } from "react";
import api from "../../api/client";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useParams } from "react-router-dom";

import SectionSidebar from "./SectionSidebar";
import QuestionSetSelector from "./QuestionSetSelector";
import QuestionList from "./QuestionList";
import PreviewTab from "./PreviewTab";

const tabs = ["Details", "Sections", "Questions", "Preview"];

const TestBuilder: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("Details");
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  const [formData, setFormData] = useState({
    _id: "",
    code: "",
    name: "",
    description: "",
    sections: [
      {
        sectionName: "",
        questionSets: [] as string[],
        questions: [] as string[], // ✅ will store questionIds, persists across sets
        questionSearch: "",
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number | null>(0);

  // ---------- Load Question Sets + Test ----------
  useEffect(() => {
    fetchQuestionSets();
  }, []);

  useEffect(() => {
    if (id) {
      fetchTestDetails(id);
    } else if (location.state?.test) {
      normalizeAndInitialize(location.state.test);
    }
  }, [id]);

  const fetchQuestionSets = async () => {
    try {
      const res = await api.get("/questionset/all");
      setQuestionSets(res.data.questionSets || []);
    } catch {
      toast.error("Failed to load question sets");
    }
  };

  const fetchTestDetails = async (testId: string) => {
    try {
      const res = await api.get(`/test/${testId}`);
      normalizeAndInitialize(res.data);
    } catch {
      toast.error("Failed to load test details");
    }
  };

  // ---------- Normalize edit payload ----------
  const normalizeAndInitialize = (test: any) => {
    const normalizedSections =
      (test.sections || []).map((s: any) => {
        const rawQs = s.questions || [];
        const first = rawQs[0];
        const isObjectArray = !!first && typeof first === "object";

        const derivedSets: string[] = s.questionSets?.length
          ? s.questionSets
          : isObjectArray
            ? [...new Set(rawQs.map((q: any) => q.questionSetId || ""))]
            : [];

        const ids: string[] = isObjectArray
          ? rawQs.map((q: any) => q._id)
          : rawQs;

        // preload questions for each set
        if (isObjectArray) {
          derivedSets.forEach((setId) => {
            const qsForSet = rawQs.filter((q: any) => q.questionSetId === setId);
            if (qsForSet.length) {
              setQuestions((prev) => {
                const existing = prev[setId] || [];
                const map = new Map<string, any>();
                [...existing, ...qsForSet].forEach((q: any) => map.set(q._id, q));
                return { ...prev, [setId]: Array.from(map.values()) };
              });
            }
          });
        }

        return {
          sectionName: s.sectionName || "",
          questionSets: derivedSets,
          questions: ids,
          questionSearch: "",
        };
      }) || [];

    setFormData({
      _id: test._id || "",
      code: test.code || "",
      name: test.name || "",
      description: test.description || "",
      sections: normalizedSections,
    });

    normalizedSections.forEach((sec: { questionSets: string[]; }) => {
      sec.questionSets.forEach((setId: string) => fetchQuestions(setId));
    });

    if (normalizedSections.length) setActiveSectionIdx(0);
    setActiveTab("Preview");
  };

  // ---------- Questions API ----------
  const fetchQuestions = async (setId: string) => {
    if (!setId) return;
    if (questions[setId]?.length) return;
    try {
      const res = await api.get(
        `/question/questionset/${setId}`
      );
      console.log("res.data", res.data);

      setQuestions((prev) => ({ ...prev, [setId]: res.data || [] }));
    } catch {
      toast.error("Failed to load questions");
    }
  };

  // ---------- Section ops ----------
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { sectionName: "", questionSets: [], questions: [], questionSearch: "" },
      ],
    }));
    if (activeSectionIdx === null) setActiveSectionIdx(0);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const updated = [...formData.sections];

    if (field === "questionSets") {
      const prevSets = updated[index].questionSets;
      const removedSets = prevSets.filter((s) => !value.includes(s));

      // ✅ Update sets
      updated[index].questionSets = value;

      // ✅ Remove questions belonging to removed sets
      if (removedSets.length) {
        updated[index].questions = updated[index].questions.filter((qId) => {
          const q = Object.values(questions).flat().find((x: any) => x._id === qId);
          return q && !removedSets.includes(q.questionSetId);
        });
      }

      // ✅ Fetch questions for newly added sets
      value.forEach((setId: string) => fetchQuestions(setId));
    } else {
      updated[index][field as keyof (typeof updated)[number]] = value;
    }

    setFormData({ ...formData, sections: updated });
  };


  const toggleQuestion = (sectionIdx: number, qId: string) => {
    const updated = [...formData.sections];
    const exists = updated[sectionIdx].questions.includes(qId);
    updated[sectionIdx].questions = exists
      ? updated[sectionIdx].questions.filter((id) => id !== qId)
      : [...updated[sectionIdx].questions, qId];
    setFormData({ ...formData, sections: updated });
  };

  const toggleSelectAll = (
    sectionIdx: number,
    allIds: string[],
    filter: string
  ) => {
    const updated = [...formData.sections];
    const selectedNow = updated[sectionIdx].questions;

    // filter current set’s questions by difficulty
    const filterIds =
      filter === "All"
        ? allIds
        : allIds.filter((id) => {
          const q = Object.values(questions)
            .flat()
            .find((x: any) => x._id === id);
          return q?.difficulty === filter;
        });

    const allSelected = filterIds.every((id) => selectedNow.includes(id));

    // ✅ only toggle relevant IDs (don’t wipe unrelated)
    updated[sectionIdx].questions = allSelected
      ? selectedNow.filter((id) => !filterIds.includes(id)) // remove just these
      : [...new Set([...selectedNow, ...filterIds])]; // add new ones

    setFormData({ ...formData, sections: updated });
  };

  const removeSection = (idx: number) => {
    setFormData((prev: any) => {
      let updatedSections = prev.sections.filter((_: any, i: number) => i !== idx);
      if (updatedSections.length === 0) {
        updatedSections = [
          { sectionName: "", questionSets: [], questions: [] },
        ];
        setActiveSectionIdx(0);
        setActiveTab("Sections");
      } else {
        if (activeSectionIdx !== null) {
          if (idx === activeSectionIdx) {
            setActiveSectionIdx(0);
          } else if (idx < activeSectionIdx) {
            setActiveSectionIdx((prevIdx) =>
              prevIdx !== null ? prevIdx - 1 : null
            );
          }
        }
      }
      return { ...prev, sections: updatedSections };
    });
  };

  // ---------- Save ----------
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const cleanedSections = formData.sections
        .filter((s) => s.questions && s.questions.length > 0)
        .map((s) => ({
          sectionName: s.sectionName,
          questions: s.questions,
        }));

      const payload = {
        code: formData.code,
        type: "normal",
        name: formData.name,
        description: formData.description,
        sections: cleanedSections,
        createdBy: user?.id,
        lastUpdatedBy: user?.id,
      };
      console.log("payload", payload);


      if (formData._id) {
        await api.put(
          `/test/update/${formData._id}`,
          payload
        );
        toast.success("Test updated successfully");
      } else {
        await api.post("/test/create", payload);
        toast.success("Test created successfully");
      }

      setFormData({
        _id: "",
        code: "",
        name: "",
        description: "",
        sections: [],
      });
      setActiveSectionIdx(null);
      setActiveTab("Details");
    } catch {
      toast.error("Failed to save test");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestion = (sectionIdx: number, qId: string) => {
    setFormData((prev: any) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIdx].questions = updatedSections[
        sectionIdx
      ].questions.filter((q: any) =>
        typeof q === "string" ? q !== qId : q._id !== qId
      );
      return { ...prev, sections: updatedSections };
    });
  };

  // ---------- Tabs ----------
  const goToNextTab = (nextTab: string) => {
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
    if (activeTab === "Questions") {
      const hasQuestions = formData.sections.some((s) => s.questions.length > 0);
      if (!hasQuestions) {
        toast.error("Please select at least one question");
        return;
      }
    }
    setActiveTab(nextTab);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
              }`}
            onClick={() => goToNextTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Details */}
      {activeTab === "Details" && (
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded p-2 w-full"
              placeholder="Test Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Code Field */}
          <div>
            <label className="block font-medium mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded p-2 w-full"
              placeholder="Unique Code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="border rounded p-2 w-full"
              placeholder="Test Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => goToNextTab("Sections")}
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
              >
                ✕
              </button>

              <label className="block font-medium mb-1">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input
                className="border rounded p-2 w-full"
                placeholder="Enter Section Name"
                value={section.sectionName}
                onChange={(e) => updateSection(idx, "sectionName", e.target.value)}
              />
            </div>
          ))}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addSection}
          >
            Add Section
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded ml-2"
            onClick={() => goToNextTab("Questions")}
          >
            Next: Questions
          </button>
        </div>
      )}

      {/* Questions */}
      {activeTab === "Questions" && (
        <div className="flex gap-6">
          <SectionSidebar
            sections={formData.sections}
            activeSectionIdx={activeSectionIdx}
            setActiveSectionIdx={setActiveSectionIdx}
            questions={questions}
            removeSection={removeSection}
          />

          <div className="w-3/4 space-y-4">
            {activeSectionIdx !== null &&
              formData.sections[activeSectionIdx] && (
                <>
                  <QuestionSetSelector
                    questionSets={questionSets}
                    section={formData.sections[activeSectionIdx]}
                    updateSection={(field, val) =>
                      updateSection(activeSectionIdx, field, val)
                    }
                  />

                  <QuestionList
                    section={formData.sections[activeSectionIdx]}
                    questions={questions}
                    toggleQuestion={(id) => toggleQuestion(activeSectionIdx, id)}
                    toggleSelectAll={(allIds, filter) =>
                      toggleSelectAll(activeSectionIdx, allIds, filter)
                    }
                    updateSection={(field, val) =>
                      updateSection(activeSectionIdx, field, val)
                    }
                  />
                </>
              )}
          </div>
        </div>
      )}

      {/* Preview */}
      {activeTab === "Preview" && (
        <PreviewTab
          formData={formData}
          questions={questions}
          handleSubmit={handleSubmit}
          loading={loading}
          onRemoveQuestion={handleRemoveQuestion}
        />
      )}
    </div>
  );
};

export default TestBuilder;
