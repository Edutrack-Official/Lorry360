import React from "react";
import InlineEdit from "../InlineEdit";

interface Props {
  sectionName: string;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

const SectionHeader: React.FC<Props> = ({ sectionName, onRename, onDelete }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <InlineEdit
        value={sectionName}
        onSave={onRename}
        placeholder="Section name"
        className="font-semibold text-lg"
      />
      <button
        onClick={onDelete}
        className="rounded px-3 py-1 bg-red-600 text-white text-sm hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  );
};

export default SectionHeader;

//newflow