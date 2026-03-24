import { NextResponse } from "next/server";
import { quizData } from "../../data";

const WEBHOOK_URL = process.env.NETHUNT_WEBHOOK_URL;

type AnswerNumber = 1 | 2 | 3 | 4;
type IncomingAnswers = Record<number, AnswerNumber>;

type RequestBody = {
  contact: {
    name: string;
    phone: string;
    city?: string;
  };
  answers: IncomingAnswers;
  score: number;
  totalQuestions: number;
  resultType?: string;
  resultTitle?: string;
  quizUrl?: string;
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
};

function normalizePhoneServer(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");

  if (digits.startsWith("380") && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return "38" + digits.slice(1);
  }
  if (digits.length === 9) {
    return "380" + digits;
  }

  return digits;
}

function buildQaFields(answers: IncomingAnswers) {
  const qaFields: Record<string, string> = {};

  quizData.forEach((question, index) => {
    const number = index + 1;
    const answerNumber = answers[question.id];
    const answerText =
      answerNumber && question.options[answerNumber - 1]
        ? question.options[answerNumber - 1]
        : "";

    qaFields[`Q${number}`] = question.question;
    qaFields[`A${number}`] = answerText;
  });

  return qaFields;
}

async function sendToCRM(body: RequestBody) {
  if (!WEBHOOK_URL) {
    console.error("CRM_WEBHOOK_STATUS: FAILED (no NETHUNT_WEBHOOK_URL)");
    throw new Error("Missing NETHUNT_WEBHOOK_URL");
  }

  const { contact, answers, quizUrl, utm } = body;

  const payload = {
    name: "Заявка на безкоштовну консультацію: Квіз, гра",
    "client-name": contact.name?.trim() || "",
    city: "",
    phone: normalizePhoneServer(contact.phone),
    джерело: "Заявка на безкоштовну консультацію (Квіз, гра)",
    quizUrl: quizUrl || "",
    aiText: "Без використання ШІ",
    videoUrl: "Без відео",
    usedOpenAI: false,
    timestamp: "",
    targetologist: "",
    utm_source: utm?.utm_source || "",
    utm_medium: utm?.utm_medium || "",
    utm_campaign: utm?.utm_campaign || "",
    utm_content: utm?.utm_content || "",
    utm_term: utm?.utm_term || "",
    ...buildQaFields(answers),
  };

  console.log("CRM_PAYLOAD:", payload);

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log("CRM_RESPONSE_STATUS:", response.status);
  console.log("CRM_RESPONSE_TEXT:", responseText);

  if (!response.ok) {
    throw new Error(`CRM webhook failed with status ${response.status}`);
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    console.log("QUIZ_RESULT_BODY:", body);

    const contactName = body.contact?.name?.trim() || "";
    const phone = normalizePhoneServer(body.contact?.phone || "");

    if (!contactName) {
      return NextResponse.json(
        { ok: false, error: "Missing name" },
        { status: 400 }
      );
    }

    if (!/^380\d{9}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone format" },
        { status: 400 }
      );
    }

    await sendToCRM({
      ...body,
      contact: {
        ...body.contact,
        name: contactName,
        phone,
        city: "",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ROUTE_FATAL_ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}