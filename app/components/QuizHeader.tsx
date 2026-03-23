type QuizHeaderProps = {
  currentQuestion: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
};

export default function QuizHeader({
  currentQuestion,
  totalQuestions,
  correctCount,
  wrongCount,
}: QuizHeaderProps) {
  return (
    <section className="flex items-center gap-4 rounded-[16px] bg-transparent px-[10px] py-[8px]">
      <div className="grid flex-1 grid-cols-20 gap-[2px]">
        {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            const isActive = questionNumber === currentQuestion;

            return (
            <div
                key={questionNumber}
                className={[
                "h-[7px] rounded-[2px] border border-[#2f80ed]",
                isActive ? "bg-[#2f80ed]" : "bg-transparent",
                ].join(" ")}
            />
            );
        })}
        </div>

      <div className="whitespace-nowrap text-[16px] font-semibold text-[#1f2937]">
        {currentQuestion} з {totalQuestions}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-[36px] min-w-[54px] items-center gap-1.5 rounded-[10px] bg-[#e8f7ec] px-3 font-bold text-[#219653]">
          <span>✓</span>
          <span>{correctCount}</span>
        </div>

        <div className="flex h-[36px] min-w-[54px] items-center gap-1.5 rounded-[10px] bg-[#fdecec] px-3 font-bold text-[#eb5757]">
          <span>✕</span>
          <span>{wrongCount}</span>
        </div>
      </div>
    </section>
  );
}