import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";
import BackButton from "../../components/BackButton"


import {
    CheckCircle,
    XCircle,
    User,
    Eye,
    AlertTriangle,
    Filter,
    X,
    ChevronDown,
    FileText,
    Download,
    Clock,
    CheckSquare,
    Settings
} from "lucide-react";
import AttemptDetails from "./AttemptDetails";
import StudentDetails from "./StudentDetails";
import StudentOverrideModal from "./StudentOverrideModal";
import * as XLSX from 'xlsx';
import { API_BASE } from "../../api/client";

const ResultsPage = () => {
    const { courseId, testId } = useParams();
    const [results, setResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedAttempt, setSelectedAttempt] = useState(null);

    // Student override states
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [selectedStudentForOverride, setSelectedStudentForOverride] = useState(null);
    const [studentOverrides, setStudentOverrides] = useState({});
    const [savingOverride, setSavingOverride] = useState(false);
    const [testConfiguration, setTestConfiguration] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        status: 'all',
        attemptNumber: 'all',
        scoreRange: { min: '', max: '' },
        percentageRange: { min: '', max: '' },
        searchName: '',
        questionFilter: 'all'
    });

    const [showFilters, setShowFilters] = useState(false);
    const batchId = localStorage.getItem("selectedBatchId");

    console.log("Student Overrides:");



    useEffect(() => {
        const fetchData = async () => {


            try {
                // Fetch test results
                const resResults = await api.get(`/testresults/course/${courseId}/test/${testId}`);
                const resultsData = Array.isArray(resResults.data.results) ? resResults.data.results : [];

                const res = await api.get(`/enrollments/course/${courseId}`);

                const resStudents = await api.get(`/students/batch/${res.data[0].batchId._id}`);
                const studentsData = Array.isArray(resStudents.data.students) ? resStudents.data.students : [];

                // Fetch test configuration and overrides
                try {
                    const resConfig = await api.get(`/test-configuration/${courseId}/${testId}`);


                    if (resConfig.data) {
                        setTestConfiguration(resConfig.data);
                        if (resConfig.data.studentOverrides) {
                            const overridesMap = {};
                            resConfig.data.studentOverrides.forEach(override => {
                                overridesMap[override.studentId] = override;
                            });
                            setStudentOverrides(overridesMap);
                        }
                    }
                } catch (configError) {
                    console.warn("No test configuration found:", configError);
                }

                let extractedTestData = null;
                if (resultsData.length > 0) {
                    const firstResult = resultsData[0];
                    const testIdObj = firstResult.testId || {};

                    extractedTestData = {
                        name: testIdObj.name || 'Unknown Test',
                        code: testIdObj.code || '-',
                        totalQuestions: firstResult.answers ? firstResult.answers.length : 0,
                        sections: firstResult.sectionWiseMarks || []
                    };
                }

                setTestData(extractedTestData);
                setResults(resultsData);
                setStudents(studentsData);
            } catch (err) {
                console.error("Error fetching data:", err);
                setResults([]);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, testId, batchId]);

    // Helper functions
    const studentMap = students.reduce((acc, s) => {
        acc[s._id] = s;
        return acc;
    }, {});

    const getLatestResult = (studentId) => {
        const studentResults = results.filter(r => r.studentId === studentId);
        if (studentResults.length === 0) return null;
        return studentResults.reduce((latest, current) =>
            current.attemptNumber > latest.attemptNumber ? current : latest
        );
    };

    const getAllAttempts = (studentId) => {
        return results.filter(r => r.studentId === studentId)
            .sort((a, b) => b.attemptNumber - a.attemptNumber);
    };

    const getResultByAttempt = (studentId, attemptNumber) => {
        return results.find(r => r.studentId === studentId && r.attemptNumber === attemptNumber);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getQuestionById = (questionId, answers) => {
        if (!answers) return null;
        const answerWithQuestion = answers.find(answer => answer.questionId._id === questionId);
        return answerWithQuestion ? answerWithQuestion.questionId : null;
    };

    // Updated status handling with new statuses
    const getStatusColor = (status, remarks) => {
        if (remarks === "MAX_VIOLATIONS") {
            return "bg-orange-100 text-orange-800";
        }
        switch (status) {
            case "PASSED":
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "FAILED":
                return "bg-red-100 text-red-800";
            case "IN_PROGRESS":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status, remarks) => {
        if (remarks === "MAX_VIOLATIONS") {
            return <AlertTriangle size={16} className="mr-1" />;
        }
        switch (status) {
            case "PASSED":
            case "COMPLETED":
                return <CheckCircle size={16} className="mr-1" />;
            case "FAILED":
                return <XCircle size={16} className="mr-1" />;
            case "IN_PROGRESS":
                return <Clock size={16} className="mr-1" />;
            default:
                return <CheckSquare size={16} className="mr-1" />;
        }
    };

    const getStatusDisplayText = (status, remarks) => {
        if (remarks === "MAX_VIOLATIONS") return "Violations";
        switch (status) {
            case "PASSED": return "Passed";
            case "FAILED": return "Failed";
            case "COMPLETED": return "Completed";
            case "IN_PROGRESS": return "In Progress";
            default: return status;
        }
    };

    // Student override functions
    const handleOpenOverride = (student) => {
        setSelectedStudentForOverride(student);
        setShowOverrideModal(true);
    };

    const handleSaveOverride = async (overrideData) => {
        setSavingOverride(true);
        try {
            const response = await api.post(
                `/test-configuration/student-override`,
                {
                    courseId,
                    testId,
                    ...overrideData
                }
            );

            // Update local state
            setStudentOverrides(prev => ({
                ...prev,
                [overrideData.studentId]: overrideData
            }));

            setShowOverrideModal(false);
            setSelectedStudentForOverride(null);

            // Show success message (you can replace this with a toast notification)
            console.log("Student override saved successfully!");
        } catch (error) {
            console.error("Error saving student override:", error);
            alert("Error saving student override: " + (error.response?.data?.error || error.message));
        } finally {
            setSavingOverride(false);
        }
    };

    const handleCloseOverrideModal = () => {
        setShowOverrideModal(false);
        setSelectedStudentForOverride(null);
    };

    // Check if student has override
    const hasOverride = (studentId) => {
        return !!studentOverrides[studentId];
    };

    // Filter functions
    const applyFilters = (studentsList) => {
        return studentsList.filter(student => {
            // Search by name filter
            if (filters.searchName && !student.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
                return false;
            }

            const latestResult = getLatestResult(student._id);
            let relevantResult = latestResult;

            // Attempt-wise filter
            if (filters.attemptNumber !== 'all' && filters.attemptNumber !== 'latest') {
                const attemptNum = parseInt(filters.attemptNumber);
                relevantResult = getResultByAttempt(student._id, attemptNum);
                if (!relevantResult) return false;
            }

            // Status filter
            if (filters.status !== 'all') {
                if (filters.status === 'not-started' && relevantResult) return false;
                if (filters.status === 'not-started' && !relevantResult) return true;
                if (!relevantResult) return false;

                if (filters.status === 'passed' && relevantResult.status !== 'PASSED') return false;
                if (filters.status === 'failed' && relevantResult.status !== 'FAILED') return false;
                if (filters.status === 'completed' && relevantResult.status !== 'COMPLETED') return false;
                if (filters.status === 'in-progress' && relevantResult.status !== 'IN_PROGRESS') return false;
                if (filters.status === 'violations' && relevantResult.remarks !== 'MAX_VIOLATIONS') return false;
            }

            // Score range filter
            if (relevantResult && (filters.scoreRange.min !== '' || filters.scoreRange.max !== '')) {
                const score = relevantResult.obtainedMarks;
                if (filters.scoreRange.min !== '' && score < parseInt(filters.scoreRange.min)) return false;
                if (filters.scoreRange.max !== '' && score > parseInt(filters.scoreRange.max)) return false;
            }

            // Percentage range filter
            if (relevantResult && (filters.percentageRange.min !== '' || filters.percentageRange.max !== '')) {
                const percentage = relevantResult.percentage;
                if (filters.percentageRange.min !== '' && percentage < parseFloat(filters.percentageRange.min)) return false;
                if (filters.percentageRange.max !== '' && percentage > parseFloat(filters.percentageRange.max)) return false;
            }

            return true;
        });
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            attemptNumber: 'all',
            scoreRange: { min: '', max: '' },
            percentageRange: { min: '', max: '' },
            searchName: '',
            questionFilter: 'all'
        });
    };

    const getUniqueAttemptNumbers = () => {
        const attempts = new Set();
        results.forEach(result => attempts.add(result.attemptNumber));
        return Array.from(attempts).sort((a, b) => a - b);
    };

    // Excel export function
    const exportToExcel = () => {
        const filteredStudents = applyFilters(students);

        // Prepare data for Excel export
        const excelData = filteredStudents.map(student => {
            let displayResult;
            if (filters.attemptNumber === 'all' || filters.attemptNumber === 'latest') {
                displayResult = getLatestResult(student._id);
            } else {
                displayResult = getResultByAttempt(student._id, parseInt(filters.attemptNumber));
            }

            const totalAttempts = getAllAttempts(student._id).length;
            const hasCustomSettings = hasOverride(student._id);

            return {
                'Student Name': student.name,
                'Email': student.email,
                'Score': displayResult ? `${displayResult.obtainedMarks}/${displayResult.totalMarks}` : 'Not Attempted',
                'Percentage': displayResult ? `${displayResult.percentage}%` : '-',
                'Status': displayResult ? getStatusDisplayText(displayResult.status, displayResult.remarks) : 'Not Started',
                'Attempt Number': displayResult ? `#${displayResult.attemptNumber}` : '-',
                'Total Attempts': totalAttempts,
                'Custom Settings': hasCustomSettings ? 'Yes' : 'No',
                'Submission Date': displayResult ? formatDate(displayResult.submissionDate) : '-',
                'Time Taken': displayResult ? `${displayResult.timeTaken || 'N/A'}` : '-',
                'Obtained Marks': displayResult ? displayResult.obtainedMarks : 0,
                'Total Marks': displayResult ? displayResult.totalMarks : 0,
                'Remarks': displayResult ? displayResult.remarks || '-' : '-'
            };
        });

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Auto-size columns
        const colWidths = [];
        const headers = Object.keys(excelData[0] || {});
        headers.forEach((header, index) => {
            const maxLength = Math.max(
                header.length,
                ...excelData.map(row => String(row[header] || '').length)
            );
            colWidths[index] = { width: Math.min(maxLength + 2, 50) };
        });
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Test Results');

        // Generate filename with test name and current date
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const testName = testData?.name || 'Test';
        const filename = `${testName}_Results_${dateString}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    // Render AttemptDetails component
    if (selectedAttempt) {
        return (
            <AttemptDetails
                selectedAttempt={selectedAttempt}
                onBack={() => setSelectedAttempt(null)}
                filters={filters}
                setFilters={setFilters}
                formatDate={formatDate}
                getQuestionById={getQuestionById}
            />
        );
    }

    // Render StudentDetails component
    if (selectedStudent) {
        const studentAttempts = getAllAttempts(selectedStudent._id);

        return (
            <StudentDetails
                selectedStudent={selectedStudent}
                studentAttempts={studentAttempts}
                testData={testData}
                onBack={() => setSelectedStudent(null)}
                onViewAttempt={setSelectedAttempt}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
            />
        );
    }

    // Apply filters to students
    const filteredStudents = applyFilters(students);

    // Calculate statistics based on filtered results
    const totalStudents = students.length;
    const filteredTotalStudents = filteredStudents.length;
    const attemptedStudents = filteredStudents.filter(student => getLatestResult(student._id)).length;
    const passedStudents = filteredStudents.filter(student => {
        const result = getLatestResult(student._id);
        return result && (result.status === "PASSED" || result.status === "COMPLETED");
    }).length;
    const inProgressStudents = filteredStudents.filter(student => {
        const result = getLatestResult(student._id);
        return result && result.status === "IN_PROGRESS";
    }).length;

    const uniqueAttemptNumbers = getUniqueAttemptNumbers();
    const activeFiltersCount = Object.values(filters).filter(value => {
        if (typeof value === 'object') {
            return value.min !== '' || value.max !== '';
        }
        return value !== 'all' && value !== '';
    }).length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Student Override Modal */}
            {showOverrideModal && selectedStudentForOverride && (
                <StudentOverrideModal
                    student={selectedStudentForOverride}
                    override={studentOverrides[selectedStudentForOverride._id] || null}
                    onSave={handleSaveOverride}
                    onCancel={handleCloseOverrideModal}
                    saving={savingOverride}
                    defaultConfig={testConfiguration ? {
                        isRetakeAllowed: testConfiguration.isRetakeAllowed,
                        maxAttempts: testConfiguration.maxAttempts,
                        isResumeAllowed: testConfiguration.isResumeAllowed
                    } : undefined}
                />
            )}

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <BackButton />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {testData?.name || 'Test'} - Results
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">{testData?.description}</p>
                    </div>

                    {/* Excel Export Button */}
                    <button
                        onClick={exportToExcel}
                        disabled={filteredStudents.length === 0}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap self-start sm:self-auto"
                    >
                        <Download size={16} className="mr-2" />
                        Export to Excel ({filteredStudents.length})
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Filter size={16} className="mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                            <ChevronDown size={16} className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                                <X size={16} className="mr-1" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <p className="text-sm text-gray-600">
                        Showing {filteredTotalStudents} of {totalStudents} students
                    </p>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t">
                        {/* Search by Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search by Name
                            </label>
                            <input
                                type="text"
                                value={filters.searchName}
                                onChange={(e) => setFilters({ ...filters, searchName: e.target.value })}
                                placeholder="Enter student name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status Filter - Updated with new statuses */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="passed">Passed</option>
                                {/* <option value="completed">Completed</option> */}
                                <option value="failed">Failed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="violations">Violations</option>
                                <option value="not-started">Not Started</option>
                            </select>
                        </div>

                        {/* Attempt Number Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Attempt Number
                            </label>
                            <select
                                value={filters.attemptNumber}
                                onChange={(e) => setFilters({ ...filters, attemptNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Attempts</option>
                                <option value="latest">Latest Attempt</option>
                                {uniqueAttemptNumbers.map(num => (
                                    <option key={num} value={num.toString()}>Attempt #{num}</option>
                                ))}
                            </select>
                        </div>

                        {/* Score Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Score Range
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={filters.scoreRange.min}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        scoreRange: { ...filters.scoreRange, min: e.target.value }
                                    })}
                                    placeholder="Min"
                                    className="w-1/2 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    value={filters.scoreRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        scoreRange: { ...filters.scoreRange, max: e.target.value }
                                    })}
                                    placeholder="Max"
                                    className="w-1/2 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Percentage Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Percentage Range
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={filters.percentageRange.min}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        percentageRange: { ...filters.percentageRange, min: e.target.value }
                                    })}
                                    placeholder="Min %"
                                    min="0"
                                    max="100"
                                    className="w-1/2 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    value={filters.percentageRange.max}
                                    onChange={(e) => setFilters({
                                        ...filters,
                                        percentageRange: { ...filters.percentageRange, max: e.target.value }
                                    })}
                                    placeholder="Max %"
                                    min="0"
                                    max="100"
                                    className="w-1/2 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Statistics Cards - Updated with new status */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-blue-600">{filteredTotalStudents}</div>
                    <p className="text-sm text-gray-600">
                        {filteredTotalStudents !== totalStudents ? 'Filtered' : 'Total'} Students
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-green-600">{attemptedStudents}</div>
                    <p className="text-sm text-gray-600">Attempted</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-emerald-600">{passedStudents}</div>
                    <p className="text-sm text-gray-600">Passed</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-yellow-600">{inProgressStudents}</div>
                    <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-purple-600">
                        {attemptedStudents > 0 ? ((passedStudents / attemptedStudents) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-sm text-gray-600">Pass Rate</p>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {activeFiltersCount > 0 ? 'No students match the selected filters.' : 'No results available.'}
                    </p>
                    <p className="text-gray-400">
                        {activeFiltersCount > 0 ? 'Try adjusting your filter criteria.' : 'Students haven\'t attempted this test yet.'}
                    </p>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {filters.attemptNumber === 'all' ? 'Latest' : filters.attemptNumber === 'latest' ? 'Latest' : `Attempt #${filters.attemptNumber}`}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Attempts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Custom Settings
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map(student => {
                                    let displayResult;
                                    if (filters.attemptNumber === 'all' || filters.attemptNumber === 'latest') {
                                        displayResult = getLatestResult(student._id);
                                    } else {
                                        displayResult = getResultByAttempt(student._id, parseInt(filters.attemptNumber));
                                    }

                                    const totalAttempts = getAllAttempts(student._id).length;
                                    const hasCustomSettings = hasOverride(student._id);

                                    return (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User size={20} className="text-blue-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {student.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {displayResult ? (
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {displayResult.obtainedMarks}/{displayResult.totalMarks}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Not Attempted</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {displayResult ? (
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {displayResult.percentage}%
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {displayResult ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(displayResult.status, displayResult.remarks)}`}>
                                                        {getStatusIcon(displayResult.status, displayResult.remarks)}
                                                        {getStatusDisplayText(displayResult.status, displayResult.remarks)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Not Started
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {displayResult ? (
                                                    <span className="text-sm text-gray-900">
                                                        #{displayResult.attemptNumber}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {totalAttempts}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {hasCustomSettings ? (
                                                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                                        <Settings size={12} className="mr-1" />
                                                        Custom
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Default</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {displayResult && (
                                                        <button
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                                                            onClick={() => setSelectedStudent(student)}
                                                        >
                                                            <Eye size={14} className="mr-1" />
                                                            View Details
                                                        </button>
                                                    )}
                                                    <button
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                                        onClick={() => handleOpenOverride(student)}
                                                    >
                                                        <Settings size={14} className="mr-1" />
                                                        Configure
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsPage;