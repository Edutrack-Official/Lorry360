import React from "react";
import { ChevronLeft, BookOpen, CheckCircle, XCircle, MinusCircle } from "lucide-react";

const AttemptDetails = ({
    selectedAttempt,
    onBack,
    filters,
    setFilters,
    formatDate
}) => {
    // Helper to check if question is answered
    const isQuestionAnswered = (answer) => {
        const qType = answer.questionId?.questionType;
        
        if (qType === 'MULTIPLE_CORRECT') {
            return answer.selectedOptionIndices && answer.selectedOptionIndices.length > 0;
        }
        if (qType === 'NUMERICAL' || qType === 'INTEGER') {
            return answer.numericalAnswer !== null && answer.numericalAnswer !== undefined;
        }
        return answer.selectedOptionIndex !== null && answer.selectedOptionIndex !== undefined;
    };

    // Process answers to group comprehension questions
    const processAnswers = (answers) => {
        if (!answers) return [];

        const processedAnswers = [];
        const parentMap = new Map();

        // First pass: identify all comprehension parent questions
        answers.forEach(answer => {
            const question = answer.questionId;

            if (question && question.questionType === 'COMPREHENSION') {
                const parentId = question.answers.comprehensionParentId?._id || question.answers.comprehensionParentId;

                if (question.answers.isComprehensionParent) {
                    // This is a parent question
                    if (!parentMap.has(question._id)) {
                        parentMap.set(question._id, {
                            ...answer,
                            childQuestions: [],
                            isParent: true,
                            parentData: question
                        });
                    }
                } else if (parentId) {
                    // This is a child question
                    if (!parentMap.has(parentId)) {
                        // Create parent placeholder if not exists
                        parentMap.set(parentId, {
                            _id: `parent-${parentId}`,
                            childQuestions: [answer],
                            isParent: true,
                            parentData: null // Will be filled when we find the actual parent
                        });
                    } else {
                        // Add to existing parent
                        const parent = parentMap.get(parentId);
                        parent.childQuestions.push(answer);
                    }
                } else {
                    // Standalone comprehension question (shouldn't happen, but handle it)
                    processedAnswers.push(answer);
                }
            } else {
                // Non-comprehension question
                processedAnswers.push(answer);
            }
        });

        // Second pass: find actual parent data for placeholder parents and add parents to final array
        answers.forEach(answer => {
            const question = answer.questionId;

            if (question && question.questionType === 'COMPREHENSION' && question.answers.isComprehensionParent) {
                const parentInMap = parentMap.get(question._id);
                if (parentInMap && !parentInMap.parentData) {
                    parentInMap.parentData = question;
                }
            }
        });

        // Add all parents with children to final answers
        parentMap.forEach(parent => {
            if (parent.childQuestions && parent.childQuestions.length > 0) {
                processedAnswers.push(parent);
            }
        });

        // Sort to maintain original order as much as possible
        return processedAnswers.sort((a, b) => {
            const getOriginalIndex = (answer) => {
                if (answer.isParent) {
                    // For parent, use the index of its first child
                    return selectedAttempt.answers.findIndex(ans =>
                        ans._id === (answer.childQuestions[0]?._id)
                    );
                }
                return selectedAttempt.answers.findIndex(ans => ans._id === answer._id);
            };

            const indexA = getOriginalIndex(a);
            const indexB = getOriginalIndex(b);
            return indexA - indexB;
        });
    };

    const processedAnswers = processAnswers(selectedAttempt.answers);

    const filterQuestions = (answers) => {
        if (!answers) return [];

        return answers.filter(answer => {
            if (filters.questionFilter === 'all') return true;

            // For parent questions in filtered view
            if (answer.childQuestions && answer.childQuestions.length > 0) {
                const hasMatchingChildren = answer.childQuestions.some(child => {
                    const isChildAnswered = isQuestionAnswered(child);

                    if (filters.questionFilter === 'correct' && child.isCorrect) return true;
                    if (filters.questionFilter === 'incorrect' && !child.isCorrect && isChildAnswered) return true;
                    if (filters.questionFilter === 'unanswered' && !isChildAnswered) return true;
                    return false;
                });
                return hasMatchingChildren;
            }

            // For regular questions
            const isAnswered = isQuestionAnswered(answer);

            if (filters.questionFilter === 'correct' && !answer.isCorrect) return false;
            if (filters.questionFilter === 'incorrect' && (answer.isCorrect || !isAnswered)) return false;
            if (filters.questionFilter === 'unanswered' && isAnswered) return false;

            return true;
        });
    };

    const filteredAnswers = filterQuestions(processedAnswers);

    // Helper function to get correct answer
    const getCorrectAnswer = (question) => {
        if (!question) return null;

        switch (question.questionType) {
            case 'SINGLE_CORRECT':
                return question.answers.correctIndex !== undefined
                    ? `${String.fromCharCode(65 + question.answers.correctIndex)}. ${question.answers.options[question.answers.correctIndex]}`
                    : null;
            case 'MULTIPLE_CORRECT':
                return question.answers.correctIndices
                    ? question.answers.correctIndices.map(idx =>
                        `${String.fromCharCode(65 + idx)}. ${question.answers.options[idx]}`
                    ).join(', ')
                    : null;
            case 'NUMERICAL':
            case 'INTEGER':
                return question.answers.numericalValue !== undefined
                    ? String(question.answers.numericalValue)
                    : null;
            default:
                return null;
        }
    };

    // Helper function to get student answer display
    const getStudentAnswerDisplay = (answer, question) => {
        if (!question) return "Not Answered";

        switch (question.questionType) {
            case 'SINGLE_CORRECT':
                if (answer.selectedOptionIndex === null || answer.selectedOptionIndex === undefined) {
                    return "Not Answered";
                }
                return question.answers.options
                    ? `${String.fromCharCode(65 + answer.selectedOptionIndex)}. ${question.answers.options[answer.selectedOptionIndex]}`
                    : `Option ${answer.selectedOptionIndex + 1}`;

            case 'MULTIPLE_CORRECT':
                if (!answer.selectedOptionIndices || answer.selectedOptionIndices.length === 0) {
                    return "Not Answered";
                }
                return answer.selectedOptionIndices
                    .map(idx => `${String.fromCharCode(65 + idx)}. ${question.answers.options[idx]}`)
                    .join(', ');

            case 'NUMERICAL':
            case 'INTEGER':
                if (answer.numericalAnswer === null || answer.numericalAnswer === undefined) {
                    return "Not Answered";
                }
                return String(answer.numericalAnswer);

            default:
                return "Not Answered";
        }
    };

    // Helper function to render question options
    const renderQuestionOptions = (answer, question) => {
        if (!question.answers.options || question.answers.options.length === 0) {
            return null;
        }

        return question.answers.options.map((option, optionIndex) => {
            let optionClass = "p-2 rounded border bg-white border-gray-200";
            let indicators = [];

            const isCorrectOption =
                (question.questionType === 'SINGLE_CORRECT' && question.answers.correctIndex === optionIndex) ||
                (question.questionType === 'MULTIPLE_CORRECT' && question.answers.correctIndices?.includes(optionIndex));

            const isSelected =
                (question.questionType === 'SINGLE_CORRECT' && answer.selectedOptionIndex === optionIndex) ||
                (question.questionType === 'MULTIPLE_CORRECT' &&
                    answer.selectedOptionIndices &&
                    Array.isArray(answer.selectedOptionIndices) &&
                    answer.selectedOptionIndices.includes(optionIndex));

            if (isCorrectOption && isSelected) {
                optionClass = "p-2 rounded border bg-green-100 border-green-300 font-medium";
                indicators.push(<span key="correct" className="ml-2 text-green-600 text-sm">✓ Correct & Selected</span>);
            } else if (isCorrectOption) {
                optionClass = "p-2 rounded border bg-green-50 border-green-200";
                indicators.push(<span key="correct" className="ml-2 text-green-600 text-sm">✓ Correct</span>);
            } else if (isSelected) {
                optionClass = "p-2 rounded border bg-red-100 border-red-300 font-medium";
                indicators.push(<span key="selected" className="ml-2 text-red-600 text-sm">✗ Selected (Incorrect)</span>);
            }

            return (
                <div key={optionIndex} className={optionClass}>
                    <span className="font-medium">
                        {String.fromCharCode(65 + optionIndex)}.
                    </span> {option}
                    {indicators}
                </div>
            );
        });
    };

    // Render numerical question
    const renderNumericalQuestion = (answer, question) => {
        const correctAnswer = getCorrectAnswer(question);

        return (
            <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Student Answer:</p>
                    <p className="font-medium">
                        {answer.numericalAnswer !== null && answer.numericalAnswer !== undefined
                            ? answer.numericalAnswer
                            : 'Not Answered'}
                    </p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-sm text-gray-600">Correct Answer:</p>
                    <p className="font-medium text-green-800">{correctAnswer}</p>
                </div>
            </div>
        );
    };

    // Updated renderRegularQuestion function to include question numbers
    const renderRegularQuestion = (answer, question, originalIndex) => {
        const correctAnswer = getCorrectAnswer(question);
        const studentAnswer = getStudentAnswerDisplay(answer, question);

        // Check if this is a comprehension child question
        const isComprehensionChild = question.answers?.comprehensionParentId;
        const parentPassage = isComprehensionChild
            ? (typeof question.answers.comprehensionParentId === 'object'
                ? question.answers.comprehensionParentId.answers?.passage
                : '')
            : '';

        return (
            <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                {/* Display Parent Passage if this is a comprehension child */}
                {isComprehensionChild && parentPassage && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-blue-900 mb-2 text-lg flex items-center gap-2">
                            📖 Reading Passage
                        </h4>
                        <div
                            className="text-gray-800 leading-relaxed prose max-w-none whitespace-pre-line text-sm bg-white p-3 rounded border"
                            dangerouslySetInnerHTML={{ __html: parentPassage }}
                        />
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-start gap-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium mt-1">
                            Q{originalIndex + 1}
                        </span>
                        <h5
                            className="font-medium text-gray-900"
                            dangerouslySetInnerHTML={{ __html: question.text }}
                        />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${question.questionType === 'SINGLE_CORRECT' ? 'bg-blue-100 text-blue-700' :
                        question.questionType === 'MULTIPLE_CORRECT' ? 'bg-purple-100 text-purple-700' :
                            question.questionType === 'NUMERICAL' ? 'bg-green-100 text-green-700' :
                                question.questionType === 'INTEGER' ? 'bg-teal-100 text-teal-700' :
                                    'bg-gray-100 text-gray-700'
                        }`}>
                        {question.questionType.replace('_', ' ')}
                        {isComprehensionChild && ' (Comprehension)'}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        {(question.questionType === 'SINGLE_CORRECT' || question.questionType === 'MULTIPLE_CORRECT') && (
                            <>
                                <p className="font-medium text-gray-700">Options:</p>
                                {renderQuestionOptions(answer, question)}
                            </>
                        )}
                        {(question.questionType === 'NUMERICAL' || question.questionType === 'INTEGER') && (
                            <div className="space-y-3">
                                {renderNumericalQuestion(answer, question)}
                            </div>
                        )}
                    </div>

                    {(question.questionType !== 'NUMERICAL' && question.questionType !== 'INTEGER') && (
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded border">
                                <p className="text-sm text-gray-600">Student Answer:</p>
                                <p className="font-medium">{studentAnswer}</p>
                            </div>

                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                <p className="text-sm text-gray-600">Correct Answer:</p>
                                <p className="font-medium text-green-800">{correctAnswer}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded border text-center ${
                                    answer.isCorrect ? 'bg-green-50 border-green-200' :
                                    !isQuestionAnswered(answer) ? 'bg-gray-50 border-gray-200' :
                                    'bg-red-50 border-red-200'
                                }`}>
                                    <p className="text-sm text-gray-600">Result</p>
                                    <p className={`font-bold ${
                                        answer.isCorrect ? 'text-green-800' :
                                        !isQuestionAnswered(answer) ? 'text-gray-800' :
                                        'text-red-800'
                                    }`}>
                                        {!isQuestionAnswered(answer) ? "Not Answered" :
                                            answer.isCorrect ? "Correct" : "Incorrect"}
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
                                    <p className="text-sm text-gray-600">Marks</p>
                                    <p className="font-bold text-blue-800">
                                        {answer.marksAwarded || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Explanation:</p>
                        <p className="text-sm text-gray-700 mt-1">{question.explanation}</p>
                    </div>
                )}
            </div>
        );
    };

    // Calculate overall statistics
    const totalQuestions = selectedAttempt.answers?.length || 0;
    const correctCount = selectedAttempt.correctCount || 0;
    const wrongCount = selectedAttempt.wrongCount || 0;
    const unattemptedCount = selectedAttempt.unattemptedCount || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Question Analysis - Attempt #{selectedAttempt.attemptNumber}
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedAttempt.testId?.name || 'Test'} • {formatDate(selectedAttempt.submittedAt || selectedAttempt.startedAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <select
                                value={filters.questionFilter}
                                onChange={(e) => setFilters({ ...filters, questionFilter: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Questions</option>
                                <option value="correct">Correct</option>
                                <option value="incorrect">Incorrect</option>
                                <option value="unanswered">Unanswered</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Overall Performance Summary */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen size={20} />
                        Overall Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                                {selectedAttempt.obtainedMarks}/{selectedAttempt.totalMarks}
                            </div>
                            <p className="text-sm text-gray-600">Total Score</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">
                                {selectedAttempt.percentage}%
                            </div>
                            <p className="text-sm text-gray-600">Percentage</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">
                                #{selectedAttempt.attemptNumber}
                            </div>
                            <p className="text-sm text-gray-600">Attempt</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-sm font-bold text-gray-600">
                                {formatDate(selectedAttempt.startedAt)}
                            </div>
                            <p className="text-sm text-gray-600">Started</p>
                        </div>
                        <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="text-sm font-bold text-gray-600">
                                {selectedAttempt.submittedAt ? formatDate(selectedAttempt.submittedAt) : 'Not submitted'}
                            </div>
                            <p className="text-sm text-gray-600">Submitted</p>
                        </div>
                    </div>
                </div>

                {/* Section-wise Marks */}
                {selectedAttempt.sectionWiseMarks && selectedAttempt.sectionWiseMarks.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            📊 Section-wise Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedAttempt.sectionWiseMarks.map((section, index) => (
                                <div key={section.sectionId || index} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                            {section.sectionName || `Section ${index + 1}`}
                                        </h4>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {section.obtainedMarks}/{section.totalMarks}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 flex items-center gap-1">
                                                <CheckCircle size={14} />
                                                Correct:
                                            </span>
                                            <span className="font-medium">{section.correctCount || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-red-600 flex items-center gap-1">
                                                <XCircle size={14} />
                                                Incorrect:
                                            </span>
                                            <span className="font-medium">{section.wrongCount || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <MinusCircle size={14} />
                                                Unattempted:
                                            </span>
                                            <span className="font-medium">{section.unattemptedCount || 0}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Accuracy:</span>
                                            <span className="font-medium text-blue-600">
                                                {section.correctCount + section.wrongCount > 0
                                                    ? Math.round((section.correctCount / (section.correctCount + section.wrongCount)) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Question Statistics */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Question Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                                <CheckCircle size={20} />
                                {correctCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Correct Answers</p>
                            <p className="text-xs text-gray-500">
                                {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                                <XCircle size={20} />
                                {wrongCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Incorrect Answers</p>
                            <p className="text-xs text-gray-500">
                                {totalQuestions > 0 ? Math.round((wrongCount / totalQuestions) * 100) : 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-2xl font-bold text-gray-600 flex items-center justify-center gap-2">
                                <MinusCircle size={20} />
                                {unattemptedCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Unattempted</p>
                            <p className="text-xs text-gray-500">
                                {totalQuestions > 0 ? Math.round((unattemptedCount / totalQuestions) * 100) : 0}%
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                            <p className="text-sm text-gray-600 mt-1">Total Questions</p>
                            <p className="text-xs text-gray-500">100%</p>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg">Questions Analysis</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {filters.questionFilter === 'all'
                                    ? `Showing all ${filteredAnswers.length} questions`
                                    : `Showing ${filteredAnswers.length} ${filters.questionFilter} questions`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                Filtered by:
                            </span>
                            <select
                                value={filters.questionFilter}
                                onChange={(e) => setFilters({ ...filters, questionFilter: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="all">All Questions</option>
                                <option value="correct">Correct Only</option>
                                <option value="incorrect">Incorrect Only</option>
                                <option value="unanswered">Unanswered Only</option>
                            </select>
                        </div>
                    </div>

                    {filteredAnswers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-lg font-medium">No questions match the selected filter</p>
                            <p className="text-sm mt-2">
                                Try changing the filter criteria to see more questions
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredAnswers.map((answer, index) => {
                                const question = answer.questionId;
                                if (!question) return null;

                                return (
                                    <div key={answer._id}>
                                        {renderRegularQuestion(answer, question, index)}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttemptDetails;