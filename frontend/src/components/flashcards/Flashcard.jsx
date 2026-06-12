import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-72" style={{ perspective: "1000px" }}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer`}
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"}}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* front of the card (question) */}
        <div
          className="absolute inset-0 w-ful h-full bg-white/80 border-2 border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50 p-8 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Star button*/}
          <div className="flex items-center justify-between ">
            <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase">
              {flashcard?.difficulty}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              className={`size-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-linear-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadowambe500/25"
                  : "bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-slate-200"
              }`}
            >
              <Star className="size-4" strokeWidth={2} fill={flashcard.isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Quesstion Content */}
          <div className="flex-1 items-center justify-center px-4 py-6">
            <p className="text-lg text-shadow-slate-900 font-semibold text-center leading-relaxed">
              {flashcard.question}
            </p>
          </div>

          {/* Flip Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <RotateCcw className="size-4 -translate-y-0.5" strokeWidth={2} />
            <span>Answer</span>
          </div>
        </div>

        {/* back of the card (answer) */}
        <div
          className="absolute inset-0 w-full h-full bg-linear-to-br from-emerald-500 to-teal-500 border border-emerald-500/60 rounded-2xl shadow-xl shadow-emerald-400/30 p-8 flex flex-col  justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* star button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              className={`size-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-white/30 backdrop-blur-sm text-white border border-white/40"
                  : "bg-white/20 backdrop-blur-sm text-white/70 hover:bg-white/30 hover:text-white border border-white/20"
              }`}
            >
              <Star className="size-4" strokeWidth={2} fill={flashcard.isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          {/* answer content */}
          <div className="flex-1 items-center justify-center px-4 py-6">
            <p className="text-base text-white text-center leading-relaxed font-medium">{flashcard.answer}</p>
          </div>

          {/* Flip Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-medium">
            <RotateCcw className="size-4 -translate-y-0.5" strokeWidth={2} />
            <span>Question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
