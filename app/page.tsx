"use client";

import { useMemo, useState } from "react";
import QuizHeader from "./components/QuizHeader";
import QuizQuestionCard from "./components/QuizQuestionCard";
import { quizData } from "./data";

type AnswerNumber = 1 | 2 | 3 | 4;
type UserAnswers = Record<number, AnswerNumber>;

export default function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  const totalQuestions = quizData.length;
  const currentQuestion = quizData[currentIndex];
  const currentQuestionNumber = currentIndex + 1;

  const correctCount = useMemo(() => {
    return quizData.reduce((total, question) => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return total;
      return userAnswer === question.correctAnswer ? total + 1 : total;
    }, 0);
  }, [answers]);

  const wrongCount = useMemo(() => {
    return quizData.reduce((total, question) => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return total;
      return userAnswer !== question.correctAnswer ? total + 1 : total;
    }, 0);
  }, [answers]);

  const handleAnswer = (answer: AnswerNumber) => {
    const questionId = currentQuestion.id;
    if (answers[questionId]) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectedAnswer = answers[currentQuestion.id] ?? null;

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8">
      <div className="mx-auto w-full max-w-[920px]">
        <div className="pt-[5px]">
          <QuizHeader
            currentQuestion={currentQuestionNumber}
            totalQuestions={totalQuestions}
            correctCount={correctCount}
            wrongCount={wrongCount}
          />
        </div>

        <div className="pt-[25px]">
          <QuizQuestionCard
            totalQuestions={totalQuestions}
            questionData={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirstQuestion={currentIndex === 0}
            isLastQuestion={currentIndex === totalQuestions - 1}
          />
        </div>
      </div>
    </main>
  );
}