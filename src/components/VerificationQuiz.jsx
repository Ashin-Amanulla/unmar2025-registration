import React, { useState } from "react";
import { toast } from "react-toastify";

const questions = [
  {
    id: 1,
    question: "What does UNMA stand for?",
    options: [
      "United Nations Mission Association",
      "United Navodaya Mission Association",
      "Universal Navodaya Mission Association",
      "United Navodaya Members Association",
    ],
    correctAnswer: 1, // Index of correct answer
  },
  {
    id: 2,
    question: "Which year was JNV scheme started?",
    options: ["1984", "1985", "1986", "1987"],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "What is the motto of JNV?",
    options: [
      "Education for All",
      "Quality Education",
      "Pace of Progress",
      "Education for Excellence",
    ],
    correctAnswer: 2,
  },
];

const VerificationQuiz = ({ onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast.error("Please answer all questions");
      setIsSubmitting(false);
      return;
    }

    // Calculate score
    const score = questions.reduce((acc, question) => {
      return (
        acc + (selectedAnswers[question.id] === question.correctAnswer ? 1 : 0)
      );
    }, 0);

    // Need to get at least 2 correct to pass
    const passed = score >= 2;

    if (passed) {
      toast.success("Quiz completed successfully!");
      onQuizComplete(true);
    } else {
      toast.error("Please try again. You need at least 2 correct answers.");
      // Reset answers
      setSelectedAnswers({});
      setCurrentQuestion(0);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Verification Quiz
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Please answer these questions to verify your JNV background. You need at
        least 2 correct answers to proceed.
      </p>

      {questions.map((q, index) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium text-gray-700 mb-3">
            {index + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={selectedAnswers[q.id] === optionIndex}
                  onChange={() => handleAnswerSelect(q.id, optionIndex)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSubmitting ? "Checking..." : "Submit Answers"}
      </button>
    </div>
  );
};

export default VerificationQuiz;
