import React, { useEffect, useRef, useState } from "react";
import { Save, X, Edit2 } from "lucide-react";

interface Props {
  value: string;
  onSave: (newValue: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  textarea?: boolean;
}

const InlineEdit: React.FC<Props> = ({ value, onSave, placeholder, className, textarea }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => setVal(value), [value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    setEditing(false);
    if (val !== value) await onSave(val);
  };

  const cancel = () => {
    setVal(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!textarea && e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (textarea && (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (!editing) {
    return (
      <div
        className={`${className} cursor-text rounded-lg hover:bg-blue-50/50 px-2 py-1 -mx-2 -my-1 transition-all group relative`}
        onClick={() => setEditing(true)}
      >
        {value?.trim() ? (
          <span className="flex items-center gap-2">
            {value}
            <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        ) : (
          <span className="text-gray-400 flex items-center gap-2">
            {placeholder || "Click to edit"}
            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {textarea ? (
        <textarea
          ref={inputRef as any}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          rows={3}
        />
      ) : (
        <input
          ref={inputRef as any}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
        />
      )}
      <div className="mt-2 flex gap-2">
        <button
          onClick={commit}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 text-xs font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          onClick={cancel}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-200 transition-all border border-gray-300 transform hover:scale-105 active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InlineEdit;