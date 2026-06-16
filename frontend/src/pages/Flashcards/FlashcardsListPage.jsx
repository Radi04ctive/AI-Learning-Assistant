import { useState, useEffect } from "react";
import flashcardService from "../../services/flashcardService.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import FlashcardSetCard from "../../components/flashcards/FlashcardSetCard.jsx";
import toast from "react-hot-toast";

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const data = await flashcardService.getAllFlashcardSets();
        setFlashcardSets(data);
      } catch (error) {
        toast.error("Failed to fetch flashcard sets");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState title="No flashcard sets found" description="Create your first flashcard set to get started" />
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="All Flashcard Sets" subtitle="Manage and organize your flashcard sets" />
      {renderContent()}
    </div>
  );
};

export default FlashcardsListPage;
