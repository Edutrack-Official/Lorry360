import React from "react";

interface SectionSidebarProps {
  sections: any[];
  activeSectionIdx: number | null;
  setActiveSectionIdx: (idx: number) => void;
  questions: Record<string, any[]>; // ✅ grouped by QB ID
  removeSection: (idx: number) => void;
}

const SectionSidebar: React.FC<SectionSidebarProps> = ({
  sections,
  activeSectionIdx,
  setActiveSectionIdx,
  questions,
  removeSection,
}) => {
  return (
    <div className="w-1/4 border-r pr-4 space-y-2 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
      <h4 className="font-semibold mb-2">Sections</h4>

      {sections.length === 0 && (
        <p className="text-sm text-gray-500">No sections added yet</p>
      )}

      {sections.map((section, idx) => {
        // ✅ Merge all questions from selected QBs
        const mergedQuestions = (section.questionSets || [])
          .flatMap((qbId: string) => questions[qbId] || []);

        // ✅ Count difficulties
        const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
        (section.questions || []).forEach((id: string) => {
          const q = mergedQuestions.find((x) => x._id === id);
          if (q?.difficulty) {
            difficultyCount[q.difficulty]++;
          }
        });

        return (
          <div
            key={idx}
            className={`flex items-start gap-2 p-2 rounded border transition ${
              activeSectionIdx === idx
                ? "bg-blue-100 border-blue-400 font-semibold"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {/* Section select button */}
            <button
              className="flex-1 text-left"
              onClick={() => setActiveSectionIdx(idx)}
            >
              <div className="truncate">
                {section.sectionName || `Section ${idx + 1}`}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Selected: {(section.questions || []).length} | E:{difficultyCount.Easy} | M:
                {difficultyCount.Medium} | H:{difficultyCount.Hard}
              </div>
            </button>

            {/* Remove section button */}
            <button
              onClick={() => removeSection(idx)}
              className="text-red-500 hover:text-red-700 text-sm px-1"
              title="Remove section"
            >
              ❌
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SectionSidebar;
