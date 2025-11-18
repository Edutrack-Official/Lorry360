import React from "react";
import Select from "react-select";
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
  onCancel: () => void;
  saving: boolean;
}

const AddTestModal: React.FC<Props> = ({
  testOptions,
  selectedTest,
  onTestSelect,
  onAdd,
  onCancel,
  saving,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Add Test</h3>

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
          className="mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!selectedTest || saving}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTestModal;

//newflow