import React from "react";
import { ChevronLeft, User, CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react";

const StudentDetails = ({
    selectedStudent,
    studentAttempts,
    testData,
    onBack,
    onViewAttempt,
    formatDate,
    getStatusColor,
    getStatusIcon
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <button
                            onClick={onBack}
                            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Student Test Details</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Student Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={32} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h2>
                                <p className="text-gray-600">{selectedStudent.email}</p>
                                <p className="text-gray-600">{selectedStudent.mobile}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Attempts</p>
                            <p className="text-2xl font-bold text-blue-600">{studentAttempts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Test Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Test Name</p>
                            <p className="font-medium">{testData?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Test Code</p>
                            <p className="font-medium">{testData?.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Questions</p>
                            <p className="font-medium">
                                {testData?.totalQuestions || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attempts Cards */}
                {studentAttempts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                        <p className="text-gray-500">No attempts found for this student.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Test Attempts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {studentAttempts.map((attempt) => (
                                <div
                                    key={attempt._id}
                                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onViewAttempt(attempt)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            Attempt #{attempt.attemptNumber}
                                        </h4>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attempt.status, attempt.remarks)}`}>
                                            {getStatusIcon(attempt.status, attempt.remarks)}
                                            {attempt.remarks === "MAX_VIOLATIONS" ? "Violations" : attempt.status}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Score:</span>
                                            <span className="text-sm font-medium text-blue-600">
                                                {attempt.obtainedMarks}/{attempt.totalMarks}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Percentage:</span>
                                            <span className="text-sm font-medium text-green-600">
                                                {attempt.percentage}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Started:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDate(attempt.startedAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Submitted:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {attempt.submittedAt ? formatDate(attempt.submittedAt) : 'Not submitted'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                            <Eye size={14} className="mr-1" />
                                            View Details
                                        </button>
                                    </div>

                                    {attempt.remarks && (
                                        <div className="mt-3">
                                            <div className="bg-orange-50 border border-orange-200 rounded p-2">
                                                <p className="text-xs text-orange-800">
                                                    <strong>Remarks:</strong> {attempt.remarks}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;