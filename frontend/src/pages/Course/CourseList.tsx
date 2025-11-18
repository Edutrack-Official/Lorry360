import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { BookOpen, Power, Search, Calendar, Tag, Users, X, Building2, CheckCircle2 } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../db";
import Select from "react-select";

// Add these interfaces at the top
type Option = { value: string; label: string };

interface Institute {
  _id: string;
  name: string;
}

interface PopulatedInstitute {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  name: string;
  instituteId?: string | PopulatedInstitute | PopulatedInstitute[];
}

interface Enrollment {
  _id: string;
  courseId: string;
  batchId: Batch;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  courseCode: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  lastUpdatedBy: User;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Column selector dropdown
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Columns toggle (defaults)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "courseCode",
    "name",
    "startDate",
    "createdBy",
  ]);

  // Enrollment modal state (replicating CourseEnrollment functionality)
  const [enrollmentModal, setEnrollmentModal] = useState<{
    isOpen: boolean;
    courseId: string | null;
    courseName: string;
    mode: "enroll" | "status" | "edit";
    enrollment: Enrollment | null;
  }>({
    isOpen: false,
    courseId: null,
    courseName: "",
    mode: "enroll",
    enrollment: null,
  });

  // Enrollment form state
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedInstituteOption, setSelectedInstituteOption] = useState<Option | null>(null);
  const [selectedBatchOption, setSelectedBatchOption] = useState<Option | null>(null);
  const [savingEnrollment, setSavingEnrollment] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
          localStorage.removeItem("selectedModuleId"); // Clear the stored selection

      const res = await api.get(`/course/all`);
      setCourses(res.data.courses || []);
      db.modules.clear();
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const res = await api.get(`/institutes`);
      setInstitutes(res.data.institutes || []);
    } catch {
      toast.error("Failed to load institutes");
    }
  };

  const fetchBatches = async (instituteId: string) => {
    try {
      const res = await api.get(`/batch/institute/${instituteId}`);
      setBatches(res.data.batches || []);
    } catch {
      toast.error("Failed to load batches");
    }
  };

  const fetchEnrollment = async (courseId: string) => {
    try {
      const res = await api.get(`/enrollments/course/${courseId}`);
      const data = res.data;
      const first: Enrollment | null = Array.isArray(data) ? (data[0] ?? null) : data ?? null;
      return first;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstitutes();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/course/update/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Marked as ${!currentStatus ? "Active" : "Inactive"}`);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Helper function to pre-select institute and batch
  const preSelectInstituteAndBatch = async (enrollment: Enrollment) => {
    if (!enrollment?.batchId) return;

    try {
      // Get institute ID from batch
      const instituteId = getInstituteIdFromBatch(enrollment.batchId);

      if (instituteId) {
        // Find institute in the institutes list
        const institute = institutes.find(inst => inst._id === instituteId);
        if (institute) {
          setSelectedInstituteOption({
            value: institute._id,
            label: institute.name
          });

          // Fetch batches for this institute
          await fetchBatches(instituteId);

          // Pre-select the batch
          const batch = enrollment.batchId;
          if (batch?._id) {
            setSelectedBatchOption({
              value: batch._id,
              label: batch.name
            });
          }
        }
      }
    } catch (error) {
      console.error("Error pre-selecting institute and batch:", error);
    }
  };

  // Open enrollment modal and check existing enrollment
  const openEnrollmentModal = async (courseId: string, courseName: string) => {
    setLoadingEnrollment(true);

    // Check if course already has enrollment
    const existingEnrollment = await fetchEnrollment(courseId);

    if (existingEnrollment) {
      // Show enrollment status with pre-selected values
      setEnrollmentModal({
        isOpen: true,
        courseId,
        courseName,
        mode: "status",
        enrollment: existingEnrollment,
      });

      // Pre-select institute and batch for edit mode
      await preSelectInstituteAndBatch(existingEnrollment);
    } else {
      // Show enrollment form
      setEnrollmentModal({
        isOpen: true,
        courseId,
        courseName,
        mode: "enroll",
        enrollment: null,
      });
    }

    setLoadingEnrollment(false);
  };

  // Close enrollment modal
  const closeEnrollmentModal = () => {
    setEnrollmentModal({
      isOpen: false,
      courseId: null,
      courseName: "",
      mode: "enroll",
      enrollment: null,
    });
    setSelectedInstituteOption(null);
    setSelectedBatchOption(null);
    setBatches([]);
  };

  // Switch to edit mode
  const handleEditEnrollment = async () => {
    // If we don't have institutes yet, fetch them
    if (institutes.length === 0) {
      await fetchInstitutes();
    }

    // If we have an enrollment but no pre-selected values, pre-select them
    if (enrollmentModal.enrollment && !selectedInstituteOption) {
      await preSelectInstituteAndBatch(enrollmentModal.enrollment);
    }

    setEnrollmentModal(prev => ({
      ...prev,
      mode: "edit"
    }));
  };

  // Helper functions from CourseEnrollment
  const getInstituteIdFromBatch = (batch?: Batch): string | undefined => {
    if (!batch || batch.instituteId == null) return undefined;
    if (typeof batch.instituteId === "string") return batch.instituteId;
    if (Array.isArray(batch.instituteId)) return batch.instituteId[0]?._id;
    return batch.instituteId._id;
  };

  const getInstituteNameFromBatch = (batch?: Batch): string | undefined => {
    if (!batch || batch.instituteId == null) return undefined;
    if (typeof batch.instituteId === "string") return undefined;
    if (Array.isArray(batch.instituteId)) return batch.instituteId[0]?.name;
    return batch.instituteId.name;
  };

  const instituteOptions = institutes.map((i) => ({ value: i._id, label: i.name }));
  const batchOptions = batches.map((b) => ({ value: b._id, label: b.name }));

  // Handle enrollment submission
  const handleEnrollmentSubmit = async () => {
    if (!enrollmentModal.courseId || !selectedBatchOption) {
      toast.error("Please select a batch");
      return;
    }

    setSavingEnrollment(true);
    try {
      if (enrollmentModal.enrollment) {
        await api.put(`/enrollment/update/${enrollmentModal.enrollment._id}`, {
          batchId: selectedBatchOption.value,
          courseId: enrollmentModal.courseId,
        });
        toast.success("Enrollment updated!");
      } else {
        await api.post(`/enrollment/create`, {
          batchId: selectedBatchOption.value,
          courseId: enrollmentModal.courseId,
        });
        toast.success("Enrollment created!");
      }

      closeEnrollmentModal();
      fetchCourses(); // Refresh the list

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save enrollment");
    } finally {
      setSavingEnrollment(false);
    }
  };

  // Apply Search + Filters
  const filtered = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchText.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      course.tags?.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && course.isActive) ||
      (filterStatus === "inactive" && !course.isActive);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const allColumns = [
    { key: "courseCode", label: "Course Code" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "tags", label: "Tags" },
    { key: "createdBy", label: "Created By" },
    { key: "lastUpdatedBy", label: "Last Updated By" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];

  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setRowsPerPage(25);
    setCurrentPage(1);
    setVisibleColumns(["courseCode", "name", "startDate", "endDate", "tags", "createdBy"]);
  };

  // Helper function to get course status
  const getCourseStatus = (course: Course) => {
    if (!course.startDate || !course.endDate) return null;

    const now = new Date();
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);

    if (now < start) return { label: "Upcoming", color: "bg-blue-100 text-blue-800" };
    if (now > end) return { label: "Completed", color: "bg-gray-100 text-gray-800" };
    return { label: "Ongoing", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6 fade-in p-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-t-xl border shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Courses</h1>
            <BookOpen size={32} className="text-gray-800" />
          </div>

          <div className="flex items-center gap-3">
            {/* Filters Toggle */}
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <motion.span
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                ▼
              </motion.span>
              Filters
            </button>

            {/* Add Course */}
            <Link
              to="/courses/create"
              className="inline-flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
            >
              <FaPlus size={20} />
            </Link>
          </div>
        </div>

        {/* Filters (Animated Collapse) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {/* Search */}
                <div className="relative w-full md:w-60">
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input input-bordered pl-9 w-full"
                  />
                </div>

                {/* Status Filter */}
                <select
                  className="input input-bordered w-40"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as "all" | "active" | "inactive");
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Rows per page */}
                <select
                  className="input input-bordered w-40"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[25, 50, 75, 100].map((count) => (
                    <option key={count} value={count}>
                      {count} per page
                    </option>
                  ))}
                </select>

                {/* Right-aligned controls */}
                <div className="flex gap-4 ml-auto">
                  <div className="relative">
                    <button
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Select Columns ▼
                    </button>
                    {showColumnDropdown && (
                      <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 right-0">
                        {allColumns.map((col) => (
                          <label
                            key={col.key}
                            className="flex items-center gap-2 text-sm py-1"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns.includes(col.key)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setVisibleColumns([...visibleColumns, col.key]);
                                } else {
                                  setVisibleColumns(
                                    visibleColumns.filter((c) => c !== col.key)
                                  );
                                }
                              }}
                            />
                            {col.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-secondary" onClick={resetFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm">
            <tr>
              {allColumns
                .filter((col) => visibleColumns.includes(col.key))
                .map((col) => (
                  <th key={col.key} className="px-6 py-4 font-semibold">
                    {col.label}
                  </th>
                ))}
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.length > 0 ? (
              paginated.map((course) => (
                <tr
                  key={course._id}
                  className="group hover:bg-blue-50 transition-all cursor-pointer"
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <td key={col.key} className="px-6 py-4 text-gray-700">
                        {col.key === "createdAt" || col.key === "updatedAt" ? (
                          new Date(course[col.key]).toLocaleDateString()
                        ) : col.key === "startDate" || col.key === "endDate" ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {course[col.key] ? new Date(course[col.key] as string).toLocaleDateString() : "-"}
                            {col.key === "endDate" && getCourseStatus(course) && (
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCourseStatus(course)?.color}`}>
                                {getCourseStatus(course)?.label}
                              </span>
                            )}
                          </div>
                        ) : col.key === "tags" ? (
                          <div className="flex flex-wrap gap-1">
                            {course.tags && course.tags.length > 0 ? (
                              course.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))
                            ) : (
                              "-"
                            )}
                          </div>
                        ) : col.key === "description" ? (
                          <span className="text-gray-600">
                            {course.description
                              ? course.description.substring(0, 50) +
                              (course.description.length > 50 ? "..." : "")
                              : "-"}
                          </span>
                        ) : col.key === "createdBy" || col.key === "lastUpdatedBy" ? (
                          course[col.key as "createdBy" | "lastUpdatedBy"]?.name || "-"
                        ) : (
                          (course as any)[col.key] || "-"
                        )}
                      </td>
                    ))}
                  <td
                    className="px-6 py-4 flex items-center justify-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Enrollment Button */}
                    <button
                      onClick={() => openEnrollmentModal(course._id, course.name)}
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 shadow-md transition"
                      title="Enroll Course"
                      disabled={loadingEnrollment}
                    >
                      <Users className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <Link
                      to={`/courses/edit/${course._id}`}
                      className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 shadow-md transition"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </Link>

                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(course._id, course.isActive)}
                      className={`p-2 rounded-full transition ${course.isActive
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      title={course.isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="text-center py-10 text-gray-500 text-base font-medium"
                >
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white border border-gray-200 shadow-md rounded-b-xl mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm ${currentPage === 1
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-blue-600 bg-gray-50 hover:bg-blue-100"
              }`}
          >
            Prev
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm transition ${currentPage === page
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-50 text-gray-700 hover:bg-blue-100"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-3 py-1 rounded-md text-sm font-medium border shadow-sm ${currentPage === totalPages
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-blue-600 bg-gray-50 hover:bg-blue-100"
              }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Enrollment Modal */}
      <AnimatePresence>
        {enrollmentModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - Fixed to cover entire screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={closeEnrollmentModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-50"
            >
              {/* Enrollment Status Popup */}
              {enrollmentModal.mode === "status" && enrollmentModal.enrollment && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Course Enrolled</h3>
                    </div>
                    <button
                      onClick={closeEnrollmentModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Enrollment Details */}
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-800 mb-1">Course</h4>
                        <p className="text-blue-700">{enrollmentModal.courseName}</p>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600 block mb-1">Institute</span>
                          <p className="font-medium text-gray-900 text-lg">
                            {getInstituteNameFromBatch(enrollmentModal.enrollment.batchId) || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600 block mb-1">Batch</span>
                          <p className="font-medium text-gray-900 text-lg">
                            {enrollmentModal.enrollment.batchId?.name || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handleEditEnrollment}
                          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                          Change Enrollment
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Enrollment Form Popup */}
              {(enrollmentModal.mode === "enroll" || enrollmentModal.mode === "edit") && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {enrollmentModal.mode === "edit" ? "Update Enrollment" : "Enroll Course"}
                    </h3>
                    <button
                      onClick={closeEnrollmentModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Course Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-1">Course</h4>
                        <p className="text-blue-700">{enrollmentModal.courseName}</p>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Select Institute
                        </label>
                        <Select
                          isSearchable
                          isClearable
                          value={selectedInstituteOption}
                          options={instituteOptions}
                          placeholder="Search and select institute..."
                          onChange={(opt) => {
                            setSelectedInstituteOption(opt as Option | null);
                            setSelectedBatchOption(null);
                            if (opt?.value) fetchBatches(opt.value);
                            else setBatches([]);
                          }}
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderColor: '#d1d5db',
                              borderRadius: '8px',
                              '&:hover': { borderColor: '#3b82f6' },
                            }),
                          }}
                        />
                      </div>

                      {selectedInstituteOption && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Select Batch
                          </label>
                          <Select
                            isSearchable
                            isClearable
                            value={selectedBatchOption}
                            options={batchOptions}
                            placeholder="Search and select batch..."
                            onChange={(opt) => setSelectedBatchOption(opt as Option | null)}
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: '#d1d5db',
                                borderRadius: '8px',
                                '&:hover': { borderColor: '#3b82f6' },
                              }),
                            }}
                          />
                        </div>
                      )}

                      {/* Show loading state if we're in edit mode but data isn't ready */}
                      {enrollmentModal.mode === "edit" && !selectedInstituteOption && (
                        <div className="text-center py-4">
                          <div className="text-gray-500">Loading enrollment data...</div>
                        </div>
                      )}

                      {/* Help text for new enrollments */}
                      {enrollmentModal.mode === "enroll" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> After enrollment, you'll be able to access the Course Builder to add modules and content.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleEnrollmentSubmit}
                          disabled={savingEnrollment || !selectedBatchOption || (enrollmentModal.mode === "edit" && !selectedInstituteOption)}
                          className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingEnrollment ? "Saving..." : enrollmentModal.mode === "edit" ? "Update Enrollment" : "Enroll Course"}
                        </button>

                        <button
                          type="button"
                          onClick={closeEnrollmentModal}
                          className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition shadow-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseList;