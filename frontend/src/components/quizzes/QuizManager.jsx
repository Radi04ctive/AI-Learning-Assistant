import { useEffect, useState } from "react";
import quizService from "../../services/quizService.js";
import toast from "react-hot-toast";
import aiService from "../../services/aiService.js";
import { Plus } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Spinner from "../common/Spinner.jsx";
import EmptyState from "../common/EmptyState.jsx";
import QuizCard from "./QuizCard.jsx";
import Modal from "../../components/common/Modal.jsx";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizTitle, setQuizTitle] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setselectedQuiz] = useState(null);

  useEffect(() => {
    async function fetchQuizzes() {
      setIsLoading(true);

      try {
        const response = await quizService.getQuizzesForDocument(documentId);
        setQuizzes(response);
      } catch (error) {
        toast.error("Failed to fetch the quizzes list.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

  async function handleGenerateQuiz(e) {
    e.preventDefault();
    setGenerating(true);

    try {
      const newQuiz = await aiService.generateQuiz(documentId, { numQuestions, title: quizTitle });
      toast.success("Quiz Generated");
      setIsGenerationModalOpen(false);
      setQuizzes((prev) => [...prev, newQuiz]);
      setQuizTitle("");
      setNumQuestions(5);
    } catch (error) {
      toast.error("Failed to generate Quiz.");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleConfirmDelete(e) {
    if(!selectedQuiz) return
    
    e.stopPropagation();
    setDeleting(true);

    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success("Quiz Deleted");
      setIsDeleteModalOpen(false);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id));
      setselectedQuiz(null);
    } catch (error) {
      toast.error("Failed to delete the quiz");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  function handleDeleteRequest(quiz) {
    setselectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  }

  function renderQuizContent() {
    if (isLoading) {
      return <Spinner />;
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState title="No Quiz Yet" description="Generate a quiz from your document to test your knowledge." />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 p-6 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="px-8">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Your Quizzes</h3>
          <p className="text-sm text-slate-500 mt-1">
            {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
          </p>
        </div>
        <Button onClick={() => setIsGenerationModalOpen(true)}>
          <Plus className="size-5" strokeWidth={2} />
          Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}

      {/* Generate Quiz */}
      <Modal
        isOpen={isGenerationModalOpen}
        onClose={() => {
          setIsGenerationModalOpen(false);
          setQuizTitle("");
          setNumQuestions(5);
        }}
        title="Generate New Quiz"
      >
        <form className="space-y-4" onSubmit={handleGenerateQuiz}>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Number of Questions</label>
            <input
              type="number"
              className="w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value)) || 1)}
              min="1"
              required
              placeholder="Number of Questions"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Title</label>
            <input
              type="text"
              className="w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Title for the Quiz"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsGenerationModalOpen(false);
                setQuizTitle("");
                setNumQuestions(5);
              }}
              disabled={generating}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={generating}>
              {generating ? (
                <span className="flex gap-1 items-center">
                  <dive className="size-4 border-2 border-t-white border-white/30 rounded-full animate-spin -translate-y-0.25" />
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Confirmation">
        <div className="space-y-6">
          <p className="text-sm text-slate-600">Are sure you want to delete this quiz? This action can't be undone.</p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={(e) => handleConfirmDelete(e)}
              className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 rounded-xl hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25 active:scale-95 disabled:active:scale-100"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="size-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizManager;
