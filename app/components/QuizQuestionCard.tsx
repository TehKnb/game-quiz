"use client";

import { useEffect, useMemo, useState } from "react";

type AnswerNumber = 1 | 2 | 3 | 4;

type QuizQuestion = {
  id: number;
  question: string;
  correctAnswer: AnswerNumber;
  options: [string, string, string, string];
  responses: [string, string, string, string];
  hint: string;
};

type QuizQuestionCardProps = {
  totalQuestions: number;
  questionData: QuizQuestion;
  selectedAnswer: AnswerNumber | null;
  onAnswer: (answer: AnswerNumber) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
};

const optionLetters = ["А.", "Б.", "В.", "Г."];

export default function QuizQuestionCard({
  questionData,
  selectedAnswer,
  onAnswer,
  onNext,
  onPrev,
  isFirstQuestion,
  isLastQuestion,
}: QuizQuestionCardProps) {
  const [isHintOpen, setIsHintOpen] = useState(false);

  useEffect(() => {
    setIsHintOpen(false);
  }, [questionData.id]);

  const isAnswered = selectedAnswer !== null;

  const visibleExpandedOptions = useMemo(() => {
    if (!selectedAnswer) return [];

    if (selectedAnswer === questionData.correctAnswer) {
      return [selectedAnswer];
    }

    return [selectedAnswer, questionData.correctAnswer];
  }, [selectedAnswer, questionData.correctAnswer]);

  const handleAnswerClick = (answerNumber: AnswerNumber) => {
    if (isAnswered) return;
    onAnswer(answerNumber);
  };

  const getOptionState = (answerNumber: AnswerNumber) => {
    if (!selectedAnswer) return "default";

    if (selectedAnswer === questionData.correctAnswer) {
      if (answerNumber === selectedAnswer) return "correct";
      return "disabled";
    }

    if (answerNumber === selectedAnswer) return "wrong";
    if (answerNumber === questionData.correctAnswer) return "correct";

    return "disabled";
  };

  return (
    <section className="rounded-[24px] bg-transparent px-2 py-4 shadow-none sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <h2 className="m-0 text-[22px] font-semibold leading-[1.3] text-[#111827] sm:text-[30px]">
          {questionData.question}
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {questionData.options.map((option, index) => {
          const answerNumber = (index + 1) as AnswerNumber;
          const state = getOptionState(answerNumber);
          const isExpanded = visibleExpandedOptions.includes(answerNumber);
          const responseText = questionData.responses[index];

          return (
            <button
              key={answerNumber}
              type="button"
              onClick={() => handleAnswerClick(answerNumber)}
              disabled={isAnswered}
              className={[
                "w-full rounded-[18px] px-2 py-3 text-left transition sm:px-5 sm:py-5",
                state === "correct"
                  ? "bg-[#dff3e5]"
                  : state === "wrong"
                  ? "bg-[#f9e3e3]"
                  : "bg-[#e5e7eb]",
                !isAnswered ? "hover:bg-[#dfe3e8]" : "",
                isAnswered ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-start gap-1.5 sm:gap-3.5">
                <div className="min-w-[24px] text-[16px] font-medium leading-[1.5] text-[#374151] sm:min-w-[28px] sm:text-[18px]">
                  {optionLetters[index]}
                </div>

                <div className="text-[16px] font-normal leading-[1.5] text-[#1f2937] sm:text-[18px]">
                  {option}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t border-black/10 pt-4">
                  <div
                    className={[
                      "mb-2 text-[18px] font-bold",
                      state === "correct" ? "text-[#169c4a]" : "text-[#d93025]",
                    ].join(" ")}
                  >
                    {state === "correct" ? "Правильно!" : "Не зовсім"}
                  </div>

                  <div className="text-[14px] leading-[1.5] text-[#374151] sm:text-[17px]">
                    {responseText}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[10px] px-2 py-1 text-[18px] text-[#374151] transition hover:bg-[#f3f4f6]"
          onClick={() => setIsHintOpen((prev) => !prev)}
        >
          <span>Показати підказку</span>
         <span className="inline-block text-[18px] leading-none">▾</span>
        </button>

        {isHintOpen && (
          <div className="mt-3 flex items-start gap-2 rounded-[14px] bg-[#fff7db] px-4 py-3 text-[16px] leading-[1.5] text-[#5b4a00]">
            <span>💡</span>
            <span>{questionData.hint}</span>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        {!isFirstQuestion ? (
          <button
            type="button"
            onClick={onPrev}
            className="h-[46px] min-w-[132px] rounded-[12px] bg-[#eef2f7] px-4 text-[16px] font-semibold text-[#1f2937]"
          >
            Назад
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!isAnswered}
          className="h-[46px] min-w-[132px] rounded-[12px] bg-[#2563eb] px-4 text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion ? "Завершити" : "Далі"}
        </button>
      </div>
    </section>
  );
}