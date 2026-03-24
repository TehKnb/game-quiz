"use client";

import { useEffect, useMemo, useState } from "react";
import ThankYouPage from "./ThankYouPage";
import { quizData } from "../data";

type AnswerNumber = 1 | 2 | 3 | 4;
type UserAnswers = Record<number, AnswerNumber>;
type ResultType = "red" | "yellow" | "green";

type QuizResultScreenProps = {
  score: number;
  totalQuestions: number;
  answers: UserAnswers;
};

type ResultContent = {
  type: ResultType;
  resultClassName: string;
  title: string;
  resultText: string;
  advice: string;
  nextLevelText: string;
};

const BONUS_DURATION_SECONDS = 5 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getResultContent(score: number): ResultContent {
  if (score <= 7) {
    return {
      type: "red",
      resultClassName: "bg-[#fdecec] text-[#d93025]",
      title: "Ви самозайнята особа.",
      resultText:
        "Наразі ви — головний двигун і серце свого бізнесу. Але це ваша пастка. Ви працюєте на бізнес, а не він працює на вас. Якщо ви зупинитесь — зупиниться все.",
      advice:
        "Вам потрібно ТЕРМІНОВО виходити з операційки. Почніть з опису процесів. Запишіть на папері, як ви робите те, що робите найкраще. Найміть асистента або делегуйте найпростішу рутину (наприклад, відповіді на дзвінки чи закупівлі), щоб звільнити 10 годин на тиждень для стратегічного мислення.",
      nextLevelText:
        "Вихід на новий рівень за 7 тижнів — це перехід від хаотичних дій до керування чіткою системою. Всі інструменти для цього можна отримати в нашій програмі «Стратегія керованого зростання у Бізнесі». За цей час ми з вами оцифруємо ваші фінанси, налаштуємо стабільний потік заявок та впровадимо системний найм сильної команди. У результаті ви отримаєте автономний бізнес, готовий до масштабування в 3 рази без вашої цілодобової участі.",
    };
  }

  if (score <= 13) {
    return {
      type: "yellow",
      resultClassName: "bg-[#fff7db] text-[#8a6700]",
      title: "Ви менеджер, але вже на перехідному етапі.",
      resultText:
        "Ви вже розумієте силу делегування та намагаєтесь будувати команду, але часто «провалюєтесь» назад в операційку. У вас є хаотичні процеси, які потребують систематизації.",
      advice:
        "Фокусуйтеся на контролі показників (KPI), а не за діями людей. Впровадьте CRM та фінансовий облік, якщо ще цього не зробили. Проаналізуйте, яке завдання ви досі боїтесь віддати іншим, і знайдіть фахівця, який зробить це краще за вас.",
      nextLevelText:
        "Вихід на новий рівень за 7 тижнів — це трансформація вашого хаотичного управління у прозору систему за допомогою програми «Стратегія керованого зростання у Бізнесі». Ми разом впровадимо контроль за KPI та фінансовий облік, щоб ви нарешті керували цифрами, а не діями людей. Ви налаштуєте стабільний потік заявок та автоматизуєте рутину, що дозволить вам остаточно вийти з операційки. Програма допоможе делегувати завдання, які ви досі боїтеся віддати, довіривши їх системі та підготовленим фахівцям. У результаті ви отримаєте автономний бізнес, готовий до масштабування у 3 рази без вашої постійної присутності в кожній дрібниці.",
    };
  }

  return {
    type: "green",
    resultClassName: "bg-[#e8f7ec] text-[#219653]",
    title: "Вітаємо, Ви — справжній підприємець!",
    resultText:
      "Ви мислите категоріями системи, активів та масштабів. Ваш бізнес вже може працювати автономно, а ви виконуєте роль архітектора.",
    advice:
      "Навіть ідеальну систему можна посилити, щоб вона приносила втричі більше прибутку за тих самих зусиль. Ваше завдання зараз — не «підкручувати гайки», а масштабуватися, виходити на нові ринки та автоматизувати те, що досі потребує вашої уваги як контролера.",
    nextLevelText:
      "Вихід на рівень кратного масштабування реалізується через впровадження програми «Стратегія керованого зростання у Бізнесі». Ми допоможемо вам перетворити вашу успішну модель на агресивну маркетингову машину та налаштувати систему продажів з високим чеком. Ви впровадите інструменти онлайн-упаковки та автоматизації, які дозволять системі працювати на пікових потужностях без збоїв. Програма надасть вам готові алгоритми для експансії та виходу з операційного контролю у стратегічне управління. У результаті ви отримаєте масштабований актив, здатний приносити в 3 рази більше чистого прибутку, зберігаючи вашу повну свободу.",
  };
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, 9);
}

function isValidUaPhone(localPhone: string) {
  return /^\d{9}$/.test(localPhone);
}

export default function QuizResultScreen({
  score,
  totalQuestions,
  answers,
}: QuizResultScreenProps) {
  const result = useMemo(() => getResultContent(score), [score]);

  const [timeLeft, setTimeLeft] = useState(BONUS_DURATION_SECONDS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; submit?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isExpired = timeLeft <= 0;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhone(value));
  };

  const validate = () => {
    const nextErrors: { name?: string; phone?: string; submit?: string } = {};

    if (!name.trim()) {
      nextErrors.name = "Вкажіть ім’я";
    }

    if (!phone.trim()) {
      nextErrors.phone = "Вкажіть номер телефону";
    } else if (!isValidUaPhone(phone)) {
      nextErrors.phone = "Введіть коректний номер телефону";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isExpired || isSubmitting || isSubmitted) return;
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrors({});

      const fullPhone = `380${phone}`;
      const searchParams = new URLSearchParams(window.location.search);

      const response = await fetch("/api/quiz-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: {
            name: name.trim(),
            phone: fullPhone,
            city: "",
          },
          score,
          totalQuestions,
          resultType: result.type,
          resultTitle: result.title,
          answers,
          quizUrl: window.location.href,
          utm: {
            utm_source: searchParams.get("utm_source") || "",
            utm_medium: searchParams.get("utm_medium") || "",
            utm_campaign: searchParams.get("utm_campaign") || "",
            utm_content: searchParams.get("utm_content") || "",
            utm_term: searchParams.get("utm_term") || "",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("SUBMIT_RESPONSE_ERROR:", response.status, errorText);
        throw new Error(`Submit failed: ${response.status}`);
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setErrors({
        submit: "Не вдалося відправити форму. Спробуйте ще раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <ThankYouPage />;
  }

  return (
    <section className="rounded-[24px] bg-white px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold leading-[1.25] text-[#111827] sm:text-[38px]">
            Результат готовий і в кінці сторінки ми приготували для вас БОНУС, який допоможе покращити ваш бізнес вже в недалекому майбутньому.
          </h1>
        </div>

        <div className="mb-6">
          <div
            className={`inline-flex rounded-[12px] px-4 py-2 text-[16px] font-semibold ${result.resultClassName}`}
          >
            Ваш результат: {score} з {totalQuestions}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 text-[22px] font-bold text-[#111827] sm:text-[28px]">
              Результат гри:
            </div>
            <div className="mb-3 text-[22px] font-semibold text-[#111827] sm:text-[26px]">
              {result.title}
            </div>
            <p className="text-[17px] leading-[1.65] text-[#374151]">
              {result.resultText}
            </p>
          </div>

          <div>
            <div className="mb-2 text-[22px] font-bold text-[#111827] sm:text-[28px]">
              Порада:
            </div>
            <p className="text-[17px] leading-[1.65] text-[#374151]">
              {result.advice}
            </p>
          </div>

          <div>
            <div className="mb-2 text-[22px] font-bold text-[#111827] sm:text-[28px]">
              Як вийти на новий рівень за 7 тижнів?
            </div>
            <p className="text-[17px] leading-[1.65] text-[#374151]">
              {result.nextLevelText}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-[24px] border border-[#e5e7eb] bg-[#fafafa] px-4 py-6 sm:px-6">
          <div className="mb-3 text-[26px] font-bold text-[#111827]">
            БОНУС
          </div>

          <p className="mb-2 text-[17px] leading-[1.65] text-[#374151]">
            Що саме вам заважає зростати в чистому прибутку дізнайтесь на персональній онлайн-консультації від нашого спеціаліста.
          </p>

          <p className="mb-5 text-[15px] leading-[1.5] text-[#6b7280]">
            *після закінчення таймеру форма буде недоступна.
          </p>

          <div className="mb-6 flex justify-center">
            <div className="rounded-[18px] bg-[#111827] px-8 py-5 text-center text-white">
              <div className="mb-1 text-[14px] uppercase tracking-[0.08em] text-white/70">
                Таймер
              </div>
              <div className="text-[42px] font-bold leading-none sm:text-[54px]">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isExpired || isSubmitting}
                placeholder="Ім’я*"
                className="h-[64px] w-full rounded-[18px] border border-transparent bg-[#eceff3] px-5 text-[20px] text-[#111827] outline-none placeholder:text-[#64748b] focus:border-[#2563eb]"
              />
              {errors.name && (
                <p className="mt-2 text-[14px] text-[#d93025]">{errors.name}</p>
              )}
            </div>

            <div>
              <div className="flex gap-3">
                <div className="flex h-[76px] min-w-[120px] items-center justify-center rounded-[18px] bg-[#eceff3] px-4 text-[18px] font-medium text-[#111827]">
                  UA&nbsp;&nbsp;+380
                </div>

                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  disabled={isExpired || isSubmitting}
                  placeholder="XX XXX XXXX*"
                  className="h-[76px] w-full rounded-[18px] border border-transparent bg-[#eceff3] px-5 text-[20px] text-[#111827] outline-none placeholder:text-[#64748b] focus:border-[#2563eb]"
                />
              </div>

              {errors.phone && (
                <p className="mt-2 text-[14px] text-[#d93025]">{errors.phone}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-[14px] text-[#d93025]">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isExpired || isSubmitting}
              className="mt-2 h-[58px] w-full rounded-[16px] bg-[#2563eb] px-5 text-[18px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExpired
                ? "Час вийшов"
                : isSubmitting
                ? "Відправляємо..."
                : "Отримати консультацію"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}