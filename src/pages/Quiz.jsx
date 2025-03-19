import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Sample quiz questions
const navodayaQuiz = [
  {
    id: 1,
    question: "What is the full form of JNV?",
    options: [
      "Jawahar Navodaya Vidyalaya",
      "Junior National Vidyalaya",
      "Jawahar National Vidyapith",
      "Junior Navodaya Vidyapith",
    ],
    correctAnswer: "Jawahar Navodaya Vidyalaya",
  },
  {
    id: 2,
    question: "In which year did the Navodaya Vidyalaya Scheme start?",
    options: ["1985", "1986", "1989", "1990"],
    correctAnswer: "1986",
  },
  {
    id: 3,
    question: "What is the Navodaya Vidyalaya motto?",
    options: [
      "Education for All",
      "Prosperity through Education",
      "Discipline and Hard Work",
      "Unity and Discipline",
    ],
    correctAnswer: "Unity and Discipline",
  },
  {
    id: 4,
    question: "Which ministry oversees the Navodaya Vidyalaya Samiti?",
    options: [
      "Ministry of Education",
      "Ministry of Human Resource Development",
      "Ministry of Culture",
      "Ministry of Rural Development",
    ],
    correctAnswer: "Ministry of Education",
  },
  {
    id: 5,
    question:
      "The migration scheme of Navodaya Vidyalayas allows students to migrate to which region?",
    options: [
      "Within the same district",
      "Within the same state",
      "To a different linguistic region",
      "To any Navodaya of their choice",
    ],
    correctAnswer: "To a different linguistic region",
  },
  {
    id: 6,
    question:
      "What percentage of seats are reserved for girls in Navodaya Vidyalayas?",
    options: ["25%", "30%", "33%", "40%"],
    correctAnswer: "33%",
  },
  {
    id: 7,
    question:
      "Which of the following is NOT a criterion for admission to Class VI in JNVs?",
    options: [
      "Rural background",
      "Performance in entrance exam",
      "Family income",
      "Age limit",
    ],
    correctAnswer: "Family income",
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, selected) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selected,
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < navodayaQuiz.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Submit quiz
  const submitQuiz = () => {
    // Calculate score
    let correctCount = 0;
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = navodayaQuiz.find((q) => q.id === parseInt(questionId));
      if (question && question.correctAnswer === answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setQuizComplete(true);
  };

  // Continue to payment
  const continueToPayment = () => {
    // In a real app, you would save the quiz results to the backend
    navigate("/payment");
  };

  // Show quiz results
  if (quizComplete) {
    return (
      <div className="py-32 bg-gray-50 min-h-screen">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-8">
                <h1 className="text-primary mb-4">Quiz Results</h1>
                <div className="text-5xl font-bold mb-4">
                  {Math.round((score / navodayaQuiz.length) * 100)}%
                </div>
                <p className="text-xl">
                  You got{" "}
                  <span className="font-bold text-primary">{score}</span> out of{" "}
                  <span className="font-bold">{navodayaQuiz.length}</span>{" "}
                  questions right
                </p>
              </div>

              {score >= 4 ? (
                <div className="mb-8">
                  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
                    <p className="font-medium text-center">
                      Congratulations! You've passed the Navodaya quiz.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary w-full"
                    onClick={continueToPayment}
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
                    <p className="font-medium text-center">
                      You need to get at least 4 questions right to continue.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => {
                      setQuizComplete(false);
                      setCurrentQuestion(0);
                      setTimeLeft(300);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Review Your Answers
                </h3>
                <div className="space-y-4">
                  {navodayaQuiz.map((question) => (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-lg ${
                        answers[question.id] === question.correctAnswer
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p className="font-medium mb-2">{question.question}</p>
                      <p>
                        Your answer:{" "}
                        <span
                          className={
                            answers[question.id] === question.correctAnswer
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {answers[question.id] || "No answer"}
                        </span>
                      </p>
                      {answers[question.id] !== question.correctAnswer && (
                        <p className="text-green-600 font-medium">
                          Correct answer: {question.correctAnswer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-32 bg-gray-50 min-h-screen">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-primary">Navodaya Quiz</h1>
              <div className="bg-gray-100 px-4 py-2 rounded-full">
                <span
                  className={`font-mono font-medium ${
                    timeLeft < 60 ? "text-red-600" : ""
                  }`}
                >
                  Time Left: {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>
                  Question {currentQuestion + 1} of {navodayaQuiz.length}
                </span>
                <span>{Object.keys(answers).length} answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / navodayaQuiz.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-lg font-medium text-gray-800 mb-4">
                {navodayaQuiz[currentQuestion].question}
              </div>
              <div className="space-y-3">
                {navodayaQuiz[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                      answers[navodayaQuiz[currentQuestion].id] === option
                        ? "border-primary bg-primary bg-opacity-10"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-primary"
                        name={`question-${navodayaQuiz[currentQuestion].id}`}
                        value={option}
                        checked={
                          answers[navodayaQuiz[currentQuestion].id] === option
                        }
                        onChange={() =>
                          handleAnswerSelect(
                            navodayaQuiz[currentQuestion].id,
                            option
                          )
                        }
                      />
                      <span className="ml-3">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                className="btn btn-outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>

              {currentQuestion === navodayaQuiz.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length < navodayaQuiz.length}
                >
                  Submit Quiz
                </button>
              ) : (
                <button className="btn btn-primary" onClick={nextQuestion}>
                  Next
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> This quiz is designed to verify your
              connection to Navodaya. You need to score at least 4 out of 7 to
              proceed with registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
