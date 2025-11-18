import React from "react";
import Select from "react-select";
import { X, Plus } from "lucide-react";
import { TestLite } from "../types/course";

interface TestOption {
  value: string;
  label: string;
  type: string;
}

interface TestOptionGroup {
  label: string;
  options: TestOption[];
}

interface Props {
  testOptions: TestOptionGroup[];
  selectedTest: TestLite | null;
  onTestSelect: (test: TestLite | null) => void;
  onAdd: () => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

const AddTestDrawer: React.FC<Props> = ({
  testOptions,
  selectedTest,
  onTestSelect,
  onAdd,
  onClose,
  saving,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Add Test</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Test
          </label>
          <Select
            options={testOptions}
            value={
              selectedTest
                ? {
                    value: selectedTest._id,
                    label: selectedTest.name || selectedTest.title || selectedTest._id,
                    type: selectedTest.type,
                  }
                : null
            }
            onChange={(val) => {
              if (!val) return onTestSelect(null);

              const found = testOptions
                .flatMap((group) => group.options)
                .find((o) => o.value === (val as any).value);

              if (found)
                onTestSelect({
                  _id: found.value,
                  name: found.label,
                  type: found.type,
                } as TestLite);
            }}
            placeholder="Search & select a test..."
            isSearchable
            isClearable
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#d1d5db',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
            }}
          />

          {selectedTest && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-900 mb-1">Selected Test</p>
              <p className="text-sm text-purple-700">{selectedTest.name}</p>
              <p className="text-xs text-purple-600 mt-1 capitalize">{selectedTest.type} Test</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!selectedTest || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Adding…" : "Add Test"}
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

export default AddTestDrawer;