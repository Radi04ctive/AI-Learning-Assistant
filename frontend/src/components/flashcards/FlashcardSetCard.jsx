import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import moment from "moment";

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards.filter((card) => card.lastReviewed).length;
  const totalCards = flashcardSet.cards.length;
  const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;
  return (
    <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between" onClick={handleStudyNow}>
      <div className="space-y-4">
        {/* Icon and Title */}
        <div className="flex items-center gap-4">
          <div className="shrink-0 size-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <BookOpen className="size-6 text-emerald-600" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold line-clamp-2 text-slate-900 mb-1">{flashcardSet?.documentId?.title}</h3>
            <p className="text-xs font-medium textslate-500 uppercase tracking-wide">Created {moment(flashcardSet?.createdAt).fromNow()}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-700">
              {totalCards} {totalCards > 1 ? "Cards" : "Card"}
            </span>
          </div>
          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingUp className="size-4 text-emerald-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-emerald-700">{progressPercentage}%</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Progress</span>{' '}
              <span className="text-xs font-medium text-slate-600">
                {reviewedCount} / {totalCards}
              </span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden ">
              <div className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Study Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          className="w-full h-11 bg-linear-to-br from-emerald-50 to-teal-100 hover:from-emerald-600 hover:to-teal-600 text-emerald-700 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="size-4" strokeWidth={2} />
            Study Now
          </span>
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;
