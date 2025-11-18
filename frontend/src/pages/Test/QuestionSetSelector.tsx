import React from "react";
import Select from "react-select";

interface QuestionSetSelectorProps {
  questionSets: { _id: string; name: string }[];
  section: any;
  updateSection: (field: string, value: any) => void;
}

const QuestionSetSelector: React.FC<QuestionSetSelectorProps> = ({
  questionSets,
  section,
  updateSection,
}) => {
  const options = questionSets.map((qs) => ({
    value: qs._id,
    label: qs.name,
  }));

  // ✅ Map multiple selected IDs to react-select format
  const selectedOptions =
    section.questionSets && Array.isArray(section.questionSets)
      ? options.filter((opt) => section.questionSets.includes(opt.value))
      : [];

  return (
    <div className="space-y-2">
      <label className="block font-medium">Select Question Sets</label>
      <Select
        isMulti // ✅ allows multiple QB selection
        options={options}
        value={selectedOptions}
        onChange={(opts) =>
          updateSection(
            "questionSets",
            (opts || []).map((o) => o.value) // store only IDs
          )
        }
        className="w-full"
        placeholder="Choose one or more question sets..."
        isClearable={false} // ✅ prevent clearing all with one click, user can deselect manually
      />
    </div>
  );
};

export default QuestionSetSelector;
