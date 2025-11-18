import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api from "../api/client";

interface Option {
  _id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  subject: string;
  topic: string;
  difficulty: string;
  options: Option[];
}

const AddQuestionsPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/questions');
      setQuestions(res.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!testId) return;

    try {
      await api.patch(`/tests/${testId}/add-questions`, {
        questionIds: selectedQuestionIds,
      });
      toast.success('Questions added to test');
      navigate(`/tests`);
    } catch (error) {
      console.error('Error adding questions:', error);
      toast.error('Failed to add questions to test');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Questions to Test</h1>
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={selectedQuestionIds.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Selected ({selectedQuestionIds.length})
        </button>
      </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q) => (
            <div
              key={q._id}
              className={`p-4 border rounded-lg shadow-sm cursor-pointer ${
                selectedQuestionIds.includes(q._id)
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-200'
              }`}
              onClick={() => handleToggleSelect(q._id)}
            >
              <p className="font-medium mb-2">{q.question}</p>

              <ul className="list-disc list-inside text-sm mb-2">
                {Array.isArray(q.options) && q.options.length > 0 ? (
                  q.options.map((opt) => (
                    <li key={opt._id}>
                      {opt.text} {opt.isCorrect && <span className="text-green-600 font-semibold">(Correct)</span>}
                    </li>
                  ))
                ) : (
                  <li className="text-red-500 italic">No options</li>
                )}
              </ul>

              <div className="text-xs text-gray-500">
                <span className="mr-4">Subject: {q.subject}</span>
                <span className="mr-4">Topic: {q.topic}</span>
                <span>Difficulty: {q.difficulty}</span>
              </div>

              {selectedQuestionIds.includes(q._id) && (
                <div className="text-sm text-blue-600 mt-2 font-semibold">Selected</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddQuestionsPage;
