import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, ArrowLeft, Sparkles, Brain } from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService.js";
import aiService from "../../services/aiService.js";
import Spinner from "../../components/common/Spinner.jsx";
import Modal from "../../components/common/Modal.jsx";
import Flashcard from "./Flashcard";
import FlashcardSetCard from "./FlashcardSetCard.jsx";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setselectedSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    async function fetchFlashcardSet() {
      setIsLoading(true);
      try {
        const response = await flashcardService.getFlashcardsForDocument(documentId);
        setFlashcardSets(response);
      } catch (error) {
        toast.error("Failed to fetch flashcard set.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (documentId) {
      fetchFlashcardSet();
    }
  }, [documentId]);

  async function handleGenerateFlashcards() {
    setGenerating(true);
    try {
      const newFlashcardSet = await aiService.generateFlashcards(documentId);
      toast.success("New flashcards generated successfully.");
      setFlashcardSets((prev) => [...prev, newFlashcardSet]);
      // fetchFlashcardSet()
    } catch (error) {
      toast.error("Failed to generate new flashcards");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  }

  function handleNextCard() {
    if (selectedSet) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
      setIsFlipped(false);
    }
  }

  function handlePrevCard() {
    if (selectedSet) {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
      setIsFlipped(false);
    }
  }

  async function handleReviw() {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id);
      //   toast.success("Flasshcard reviewed");
      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === currentCard._id ? { ...card, reviewCount: card.reviewCount + 1 } : card,
          );
          return { ...set, cards: updatedCards };
        }
        return set;
      });

      setFlashcardSets(updatedSets);
      setselectedSet(updatedSets.find((set) => set._id === selectedSet._id));
    } catch (error) {
      toast.error("Failed to review flashcard");
      console.error(error);
    }
  }

  async function handleToggleStar(cardId) {
    try {
      await flashcardService.toggleStar(cardId);
      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === cardId ? { ...card, isStarred: !card.isStarred } : card,
          );
          return { ...set, cards: updatedCards };
        }
        return set;
      });

      setFlashcardSets(updatedSets);
      setselectedSet(updatedSets.find((set) => set._id === selectedSet._id));

      const updatedStarStatus = updatedSets
        .find((set) => set._id === selectedSet._id)
        .cards.find((card) => card._id === cardId).isStarred;

      toast.success(updatedStarStatus ? "⭐ added to stars" : "removed from stars");
    } catch (error) {
      toast.error("Failed to add this card to stars");
      console.error(error);
    }
  }

  function handleDeleteRequest(e, set) {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!setToDelete) return;
    setDeleting(true);

    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard set deleted successfully");
      setIsDeleteModalOpen(false);
      setFlashcardSets((prev) => prev.filter((set) => set._id !== setToDelete._id));
      setSetToDelete(null);
    } catch (error) {
      toast.error("Failed to deelete the flashcard set");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  function handleSelectSet(set) {
    setselectedSet(set);
    setCurrentCardIndex(0);
  }

  function renderFlashcardViewer() {
    const currentCard = selectedSet.cards[currentCardIndex];

    return (
      <div className="space-y-8">
        {/* Back Button */}
        <button
          className="group inline-flex items-center gap-2 text-sm font-medium text-shadow-slate-600 hover:text-emerald-600 transition-colors duration-200 hover:cursor-pointer"
          onClick={() => {
            setselectedSet(null);
            setIsFlipped(false);
          }}
        >
          <ArrowLeft strokeWidth={2} className="size-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Sets
        </button>

        {/* Flashcard display */}
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-2xl">
            <Flashcard
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
              onReview={handleReviw}
              isFlipped={isFlipped}
              setIsFlipped={setIsFlipped}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrevCard}
              disabled={selectedSet.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <ChevronLeft
                className="size-4 group-hover:-translate-x-0.5 transition-all duration-200"
                strokeWidth={2}
              />
              Previous
            </button>
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                {currentCardIndex + 1} <span className="text-slate-400 font-normal">/</span> {selectedSet.cards.length}
              </span>
            </div>

            <button
              onClick={handleNextCard}
              disabled={selectedSet.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              Next
              <ChevronRight
                className="size-4 group-hover:translate-x-0.5 transition-all duration-200"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderSetList() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16  px-6">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-6">
            <Brain className="size-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">No Flashcard Yet</h3>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-xs">
            Generate flashcards from your document to start learning and reinforce your knowledge
          </p>
          <button
            className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            onClick={handleGenerateFlashcards}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="size-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" strokeWidth={2} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header + generate button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Your Flashcard Sets</h3>
            <p className="text-sm text-slate-500 mt-1">
              {flashcardSets.length} {flashcardSets.length === 1 ? "set" : "sets"}
            </p>
          </div>
          <button
            className="group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            onClick={handleGenerateFlashcards}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="size-4 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="size-4" strokeWidth={2.5} />
                Generate New Set
              </>
            )}
          </button>
        </div>

        {/* Flasshcard Sets Gride */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {flashcardSets.map((set) => (
            <FlashcardSetCard
              key={set._id}
              flashcardSet={set}
              onStudy={handleSelectSet}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl  shadow-xl shadow-slate-200/50 p-8">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={"Delete Flashcard Set?"}>
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are sure you want to delete this flashcard set? This action can't be undone.
          </p>
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
              onClick={handleConfirmDelete}
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
    </>
  );
};

export default FlashcardManager;
