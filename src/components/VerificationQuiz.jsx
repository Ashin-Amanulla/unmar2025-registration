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
    correctAnswer: 3, // Index of correct answer
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
      "Pure Knowledge is Brahma",
      "Pace of Progress",
      "Education for Excellence",
    ],
    correctAnswer: 1,
  },
];

const VerificationQuiz = ({ onQuizComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  const handleAnswerSelect = (questionId, answerIndex) => {
    // Only allow changes if results are not being shown
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerIndex,
      }));
    }
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
    const newScore = questions.reduce((acc, question) => {
      return (
        acc + (selectedAnswers[question.id] === question.correctAnswer ? 1 : 0)
      );
    }, 0);

    // Need to get at least 2 correct to pass
    const passed = newScore >= 2;

    setScore(newScore);
    setIsPassed(passed);
    setShowResults(true);

    if (passed) {
      toast.success(
        `Quiz passed! You got ${newScore}/${questions.length} correct.`
      );
      setTimeout(() => {
        onQuizComplete(true);
      }, 2000); // Give user 2 seconds to see their results before proceeding
    } else {
      toast.error(
        `You got ${newScore}/${questions.length} correct. Need at least 2 correct answers.`
      );
    }

    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setIsPassed(false);
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
                className={`flex items-center p-3 space-x-3 cursor-pointer border rounded-md 
                  ${
                    showResults && optionIndex === q.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : ""
                  }
                  ${
                    showResults &&
                    selectedAnswers[q.id] === optionIndex &&
                    optionIndex !== q.correctAnswer
                      ? "border-red-500 bg-red-50"
                      : ""
                  }
                  ${
                    !showResults && selectedAnswers[q.id] === optionIndex
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }
                  ${
                    !showResults && selectedAnswers[q.id] !== optionIndex
                      ? "border-gray-200"
                      : ""
                  }
                  ${showResults ? "cursor-default" : "hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={selectedAnswers[q.id] === optionIndex}
                  onChange={() => handleAnswerSelect(q.id, optionIndex)}
                  disabled={showResults}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
                {showResults && optionIndex === q.correctAnswer && (
                  <span className="ml-auto text-green-600">✓ Correct</span>
                )}
                {showResults &&
                  selectedAnswers[q.id] === optionIndex &&
                  optionIndex !== q.correctAnswer && (
                    <span className="ml-auto text-red-600">✗ Incorrect</span>
                  )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            Object.keys(selectedAnswers).length < questions.length
          }
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Submit Answers"}
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg text-center ${
              isPassed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">
              {isPassed
                ? `Congratulations! You scored ${score}/${questions.length} and passed.`
                : `You scored ${score}/${questions.length}. At least 2 correct answers required.`}
            </p>
            {isPassed && (
              <p className="text-sm mt-1">Proceeding to the next step...</p>
            )}
          </div>

          {!isPassed && (
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationQuiz;
