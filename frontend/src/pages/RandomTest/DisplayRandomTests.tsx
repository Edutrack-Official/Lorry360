import React, { useEffect, useState } from "react";
  import api from "../../api/client";

import { PlusCircle, Pencil, Eye, X, Search, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface RandomTest {
  _id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

const DisplayRandomTests = () => {
  const [tests, setTests] = useState<RandomTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<RandomTest | null>(null);

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRandomTests = async () => {
    try {
      const res = await api.get("/test/all?type=random");
      setTests(res.data.tests);
    } catch (error) {
      console.error("Failed to fetch random tests", error);
      toast.error("Failed to load random tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomTests();
  }, []);

  // ✅ Apply Search
  const filteredTests = tests?.filter((t) =>
    (t.name + t.code + t.description)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 md:px-10 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Random Tests</h1>
          <Shuffle size={32} className="text-gray-800" />
        </div>
        <Link
          to="/random-tests"
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Random Test
        </Link>
      </div>

      {/* 🔍 Search */}
      <div className="relative flex-1 mb-4">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-blue-600 text-left text-sm font-semibold text-white">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests?.map((test, idx) => (
                <tr
                  key={test._id}
                  className={`border-t transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } hover:bg-blue-100`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800 align-middle">
                    {test.name}
                  </td>
                  <td className="px-6 py-4 align-middle">{test.code || "-"}</td>
                  <td className="px-6 py-4 align-middle">
                    {test.description || "-"}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3 align-middle">
                    <Link
                      to={`/random-tests/edit/${test._id}`}
                      className="text-gray-500 hover:text-yellow-500 transition"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setSelectedTest(test)}
                      className="text-gray-500 hover:text-blue-600 transition"
                      title="Show More"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTests?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-500 align-middle"
                  >
                    No random tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:w-[90%] md:w-[600px] relative animate-fadeIn">
            <button
              onClick={() => setSelectedTest(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {selectedTest.name}
            </h2>
            <p className="text-gray-700 mb-2">
              <strong>Code:</strong> {selectedTest.code || "-"}
            </p>
            <p className="text-gray-700">
              <strong>Description:</strong>{" "}
              {selectedTest.description || "-"}
            </p>
            <p className="mt-4 text-xs text-gray-400 border-t pt-3">
              Created on: {new Date(selectedTest.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayRandomTests;
