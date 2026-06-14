import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizSerrvice from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      try {
        const data = await quizSerrvice.getQuizById(quizId);
        setQuiz(data);
        toast.success("get the quiz successfully");
      } catch (error) {
        toast.error("Failed to fetch the quiz");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  function handleOptionChange(questionId, optionIndex) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }

  async function handleSubmitQuiz() {
    if (Object.keys(selectedAnswers).length !== quiz.questions.length) {
      toast.error("Please answer all questions then submit.");
      return
    }

    setSubmitting(true);

    try {
      const formattedAnswers = Object.keys(selectedAnswers).map(qusId => {
        const question = quiz.questions.find(q => q._id === qusId)
        const questionIndex = quiz.questions.findIndex(q => q._id === qusId)
        const optionIndex = selectedAnswers[qusId]
        const selectedAnswer = question.options[optionIndex]
        return {questionIndex, selectedAnswer}
      })
      await quizSerrvice.submitQuiz(quizId, formattedAnswers);
      toast.success('Submit Quiz successfully')
      navigate(`/quizzes/${quizId}/results`)
    } catch (error) {
      toast.error('Failed to submit the quiz')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600  text-lg">Quiz not found or has no questions.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);
  const answersCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={quiz.title || "Take Quiz"} />

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-shadow-slate-700 font-semibold">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm text-slate-500 font-medium">{answersCount} answered</span>
        </div>
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden ">
          <div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quesstion Card */}
      <div className="bg-white/80 border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl mb-8">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700">Question {currentQuestionIndex + 1}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-6 leading-relaxed">{currentQuestion.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, index) => {
            const isSlected = selectedAnswers[currentQuestion._id] === index;
            return (
              <label
                key={index}
                className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSlected
                    ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                    : "border-slate-200 bg-slate-50/50  hover:border-slate-300 hover:bg-white hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={index}
                  checked={isSlected}
                  onChange={() => handleOptionChange(currentQuestion._id, index)}
                  className="sr-only"
                />

                {/* Custom Radio Button */}
                <div
                  className={`shrink-0 size-5 rounded-full border-2 transition-all duration-200 ${
                    isSlected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 bg-white group-hover:border-emerald-400 "
                  }`}
                >
                  {isSlected && (
                    <div className="size-full flex items-center justify-center">
                      <div className="size-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Options text */}
                <span
                  className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                    isSlected ? "text-emerald-700" : "text-slate-700 group-hover:text-slate-900"
                  }`}
                >
                  {opt}
                </span>

                {/* Selected checkmark */}
                {isSlected && <CheckCircle2 className="ml-auto size-5 text-emerald-600" strokeWidth={2.5} />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || submitting}
          variant="secondary"
          className="group"
        >
          <ChevronLeft
            className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200"
            strokeWidth={2}
          />
          Previous
        </Button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            className="group relative px-8 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden"
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" strokeWidth={2.5} />
                  Submit Quiz
                </>
              )}
            </span>
          </button>
        ) : (
          <Button onClick={handleNextQuestion} disabled={submitting} variant="primary" className="group">
            Next
            <ChevronRight
              className="size-4 group-hover:translate-x-0.5 transition-transform duration-200"
              strokeWidth={2}
            />
          </Button>
        )}
      </div>

      {/* Question Navigation Dots */}
      <div className="mt-0 flex items-center justify-center gap-2 flex-wrap">
        {quiz.questions.map((q, index) => {
          const isAnswerdQuestion = selectedAnswers.hasOwnProperty(q._id);
          const iscurrent = index === currentQuestionIndex;

          return (
            <button
              className={`size-8 rounded-lg font-semibold text-xs transition-all duration-200 ${
                iscurrent
                  ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-110"
                  : isAnswerdQuestion
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              disabled={submitting}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default QuizTakePage;
