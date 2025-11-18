import React, { useState } from "react";
import { Eye, X, Check } from "lucide-react";

interface PreviewTabProps {
  formData: any;
  questions: Record<string, any[]>; // keyed by questionSetId
  handleSubmit: () => void;
  loading: boolean;
  editMode?: boolean; // ✅ to detect edit vs create
  onRemoveQuestion?: (sectionIdx: number, qId: string) => void;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-50 border-green-300",
  medium: "bg-yellow-50 border-yellow-300",
  hard: "bg-red-50 border-red-300",
};

const questionTypeColors: Record<string, string> = {
  SINGLE_CORRECT: "bg-blue-100 text-blue-800",
  MULTIPLE_CORRECT: "bg-purple-100 text-purple-800",
  NUMERICAL: "bg-orange-100 text-orange-800",
  INTEGER: "bg-amber-100 text-amber-800",
  COMPREHENSION: "bg-indigo-100 text-indigo-800",
};

const PreviewTab: React.FC<PreviewTabProps> = ({
  formData,
  questions,
  handleSubmit,
  loading,
  editMode = false,
  onRemoveQuestion,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewingComprehension, setViewingComprehension] = useState<any>(null);

  // ✅ Resolve selected questions + attach QS name
  const getSelectedQuestions = (section: any) => {
    if (!section.questions || section.questions.length === 0) return [];

    const selectedIds = section.questions;
    const resolved: any[] = [];

    (section.questionSets || []).forEach((qs: any) => {
      const qsId = typeof qs === "string" ? qs : qs._id;
      const qsName = typeof qs === "string" ? "" : qs.name;

      const qsQuestions = questions[qsId] || [];
      qsQuestions.forEach((q) => {
        if (selectedIds.includes(q._id)) {
          resolved.push({ 
            ...q, 
            questionSetName: qsName,
            // Find child questions for comprehension
            childQuestions: q.questionType === 'COMPREHENSION' 
              ? Object.values(questions).flat().filter(child => 
                  child.answers?.comprehensionParentId === q._id
                )
              : []
          });
        }
      });
    });

    return resolved;
  };

  // ✅ Render question content based on type
  const renderQuestionContent = (q: any) => {
    switch (q.questionType) {
      case 'SINGLE_CORRECT':
        return (
          <div className="mt-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Options:</div>
            <ul className="space-y-1">
              {q.answers?.options?.map((opt: string, i: number) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    q.answers?.correctIndex === i 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    q.answers?.correctIndex === i 
                      ? "bg-green-500 border-green-600" 
                      : "bg-white border-gray-400"
                  }`}>
                    {q.answers?.correctIndex === i && <Check size={10} className="text-white" />}
                  </div>
                  <span className={q.answers?.correctIndex === i ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt}
                  </span>
                  {q.answers?.correctIndex === i && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'MULTIPLE_CORRECT':
        return (
          <div className="mt-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Options (Multiple Correct):</div>
            <ul className="space-y-1">
              {q.answers?.options?.map((opt: string, i: number) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    q.answers?.correctIndices?.includes(i)
                      ? "bg-green-50 border border-green-200" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    q.answers?.correctIndices?.includes(i)
                      ? "bg-green-500 border-green-600" 
                      : "bg-white border-gray-400"
                  }`}>
                    {q.answers?.correctIndices?.includes(i) && <Check size={10} className="text-white" />}
                  </div>
                  <span className={q.answers?.correctIndices?.includes(i) ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt}
                  </span>
                  {q.answers?.correctIndices?.includes(i) && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Correct</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-500 mt-1">
              {q.answers?.correctIndices?.length || 0} correct answer(s) selected
            </div>
          </div>
        );

      case 'NUMERICAL':
      case 'INTEGER':
        return (
          <div className="mt-2 flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm font-semibold text-gray-700">Answer:</div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-semibold">
              {q.answers?.numericalValue}
            </div>
            <div className="text-xs text-gray-500 ml-auto">
              {q.questionType === 'INTEGER' ? 'Integer' : 'Numerical'}
            </div>
          </div>
        );

      case 'COMPREHENSION':
        const childCount = Object.values(questions)
          .flat()
          .filter(child => child.answers?.comprehensionParentId === q._id)
          .length;

        return (
          <div className="mt-2">
            <div className="text-sm font-semibold text-indigo-700 mb-1">Comprehension Passage</div>
            <div className="p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
              {q.answers?.passage?.substring(0, 150)}
              {q.answers?.passage?.length > 150 ? '...' : ''}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-600">
                Contains {childCount} child question{childCount !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setViewingComprehension(q)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
              >
                <Eye size={12} />
                View Details
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ✅ Render comprehension details popup
  const renderComprehensionPopup = () => {
    if (!viewingComprehension) return null;

    const q = viewingComprehension;
    const childQuestions = Object.values(questions)
      .flat()
      .filter(child => child.answers?.comprehensionParentId === q._id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Comprehension Passage Details
              </h3>
              <button
                onClick={() => setViewingComprehension(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-6">
              {/* Comprehension Passage */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Comprehension Passage:</h4>
                <div className="p-4 bg-blue-50 rounded border border-blue-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {q.answers?.passage || 'No passage available'}
                </div>
              </div>

              {/* Child Questions */}
              {childQuestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Child Questions ({childQuestions.length})
                  </h4>
                  <div className="space-y-3">
                    {childQuestions.map((child: any, index: number) => (
                      <div key={child._id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                          <span className={`px-2 py-1 text-xs rounded ${questionTypeColors[child.questionType]}`}>
                            {child.questionType.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${difficultyColors[child.difficulty?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
                            {child.difficulty}
                          </span>
                        </div>
                        
                        {/* Child Question Text with Images */}
                        <div className="text-gray-800 mb-2 prose max-w-none" dangerouslySetInnerHTML={{ __html: child.text || '' }} />
                        
                        {/* Child question content */}
                        {renderQuestionContent(child)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <button
              onClick={() => setViewingComprehension(null)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ count difficulty for popup
  const getStats = () => {
    let total = 0;
    const counts = { easy: 0, medium: 0, hard: 0, unknown: 0 };

    formData.sections.forEach((section: any) => {
      const selectedQuestions = getSelectedQuestions(section);
      total += selectedQuestions.length;

      selectedQuestions.forEach((q) => {
        const diff = (q.difficulty || "").toLowerCase();
        if (diff === "easy") counts.easy++;
        else if (diff === "medium") counts.medium++;
        else if (diff === "hard") counts.hard++;
        else counts.unknown++;
      });
    });

    return { total, counts };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Test meta */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Test Details</h2>
        <p>
          <strong>Name:</strong> {formData.name}
        </p>
        <p>
          <strong>Code:</strong> {formData.code}
        </p>
        <p>
          <strong>Description:</strong> {formData.description}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sections</h2>

        {formData.sections.map((section: any, sIdx: number) => {
          const selectedQuestions = getSelectedQuestions(section);

          return (
            <div key={sIdx} className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold mb-3">
                {section.sectionName || `Section ${sIdx + 1}`}
              </h3>

              {selectedQuestions.length === 0 ? (
                <p className="text-sm text-gray-500">No questions selected.</p>
              ) : (
                <div className="space-y-3">
                  {selectedQuestions.map((q, qIdx) => {
                    const diff = (q.difficulty || "unknown").toLowerCase();
                    const diffStyle =
                      difficultyColors[diff] ||
                      "bg-gray-50 border-gray-200";

                    return (
                      <div
                        key={q._id || `${sIdx}-${qIdx}`}
                        className={`border rounded-lg p-4 ${diffStyle}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Question header with metadata */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  difficultyColors[q.difficulty?.toLowerCase()] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {q.difficulty || "Unknown"}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  questionTypeColors[q.questionType] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {q.questionType?.replace('_', ' ') || "Unknown"}
                              </span>
                              {q.tags?.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 bg-white"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Question text with images */}
                            <div className="font-medium text-gray-800 mb-2">
                              <div className="text-sm text-gray-600 mb-1">Q{qIdx + 1}.</div>
                              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                            </div>

                            {/* Question content based on type */}
                            {renderQuestionContent(q)}

                            {/* Question Set Name */}
                            {q.questionSetId?.name && (
                              <p className="text-xs mt-2 text-blue-600 italic">
                                Question Set: {q.questionSetId.name}
                              </p>
                            )}
                          </div>

                          {onRemoveQuestion && (
                            <button
                              className="text-red-600 text-xs border border-red-300 rounded px-2 py-1 hover:bg-red-50 ml-2"
                              onClick={() => onRemoveQuestion(sIdx, q._id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Update */}
      <div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : editMode
            ? "Update Test"
            : "Submit Test"}
        </button>
      </div>

      {/* ✅ Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Confirm {editMode ? "Update" : "Create"} Test
            </h3>
            <p className="mb-2">
              Total Questions: <strong>{stats.total}</strong>
            </p>
            <ul className="mb-4 text-sm space-y-1">
              <li>Easy: {stats.counts.easy}</li>
              <li>Medium: {stats.counts.medium}</li>
              <li>Hard: {stats.counts.hard}</li>
              <li>Unknown: {stats.counts.unknown}</li>
            </ul>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehension Details Popup */}
      {renderComprehensionPopup()}
    </div>
  );
};

export default PreviewTab;