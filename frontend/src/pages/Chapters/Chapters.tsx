import React, { useEffect, useState } from 'react';
import api from "../../api/client";
import { CheckCircle, XCircle, Plus, Edit3, Eye, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useParams, useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

interface Chapter {
  _id: string;
  name: string;
  chapterCode: string;
  isActive: boolean;
  examId: string;
  subjectId: string | { _id: string; name: string };
  instituteId?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | { _id: string; email: string };
}

interface Subject {
  _id: string;
  name: string;
}

interface Institute {
  _id: string;
  name: string;
}

const Chapters = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleChapter, setToggleChapter] = useState<Chapter | null>(null);

  const [searchText, setSearchText] = useState('');
  const [filterInstitute, setFilterInstitute] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // ✅ helper functions
  const getSubjectId = (chapter: Chapter): string =>
    typeof chapter.subjectId === 'string' ? chapter.subjectId : chapter.subjectId?._id;

  const getCreatedBy = (chapter: Chapter): string =>
    typeof chapter.createdBy === 'string' ? chapter.createdBy : chapter.createdBy?.email;

  const fetchData = async () => {
    if (!subjectId) return;
    try {
      const [subjectRes, chapterRes, instRes] = await Promise.all([
        api.get(`/subject/${subjectId}`),
        api.get(`/chapter/all`),
        api.get(`/institutes`),
      ]);

      setSubject(subjectRes.data);

      // ✅ filter by subjectId safely
      setChapters(
        chapterRes.data.chapters.filter(
          (c: Chapter) => getSubjectId(c)?.toString() === subjectId
        )
      );

      setInstitutes(instRes.data.institutes || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const handleToggleStatus = async (chapter: Chapter) => {
    try {
      await api.put(`/chapter/update/${chapter._id}`, {
        isActive: !chapter.isActive,
      });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredChapters = chapters.filter((chapter) => {
    const matchesSearch = chapter.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesInstitute =
      filterInstitute === 'all' || chapter.instituteId?.includes(filterInstitute);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && chapter.isActive) ||
      (filterStatus === 'inactive' && !chapter.isActive);
    return matchesSearch && matchesInstitute && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <BackButton />

      {subject && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-xl shadow-md text-white">
          <h2 className="text-3xl font-bold">{subject.name}</h2>
          <p className="text-sm mt-1 opacity-90">
            Subject ID: <span className="font-mono">{subject._id}</span>
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Chapters</h1>
        <button
          onClick={() => navigate(`/subjects/${subjectId}/chapters/add`)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Chapter
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input input-bordered pl-9 w-full"
            />
          </div>

          <select
            className="input input-bordered w-40"
            value={filterInstitute}
            onChange={(e) => setFilterInstitute(e.target.value)}
          >
            <option value="all">All Institutes</option>
            {institutes.map((i) => (
              <option key={i._id} value={i._id}>
                {i.name}
              </option>
            ))}
          </select>

          <select
            className="input input-bordered w-36"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          className="btn btn-secondary flex items-center gap-2"
          onClick={() => {
            setSearchText('');
            setFilterInstitute('all');
            setFilterStatus('all');
          }}
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      </div>

      {/* Chapters */}
      {loading ? (
        <p className="text-center text-gray-500">Loading chapters...</p>
      ) : filteredChapters.length === 0 ? (
        <p className="text-center text-gray-500">No chapters found for this subject.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter._id}
              className="bg-white p-5 rounded-lg border shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">{chapter.name}</h2>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() =>
                      navigate(`/subjects/${subjectId}/chapters/add?edit=${chapter._id}`)
                    }
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setToggleChapter(chapter)}
                    className={`rounded-full p-1 ${
                      chapter.isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                    title={chapter.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {chapter.isActive ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">Code: {chapter.chapterCode}</p>

              <div className="mt-3 text-[11px] text-gray-500 space-y-1 leading-tight">
                <div>
                  <span className="font-semibold text-gray-600">Created:</span>{' '}
                  {new Date(chapter.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Updated:</span>{' '}
                  {new Date(chapter.updatedAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">By:</span>{' '}
                  <span className="truncate">{getCreatedBy(chapter)}</span>
                </div>
              </div>

              {/* View Details */}
              <div className="mt-3">
                <Link
                  to={`/chapters/${chapter._id}/details`}
                  className="inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toggle Confirmation */}
      {toggleChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">
              {toggleChapter.isActive ? 'Deactivate' : 'Activate'} this chapter?
            </h3>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setToggleChapter(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleToggleStatus(toggleChapter);
                  setToggleChapter(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chapters;
