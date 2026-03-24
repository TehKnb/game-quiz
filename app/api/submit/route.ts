import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, phone, score, totalQuestions, resultType, resultTitle } = body ?? {};

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^380\d{9}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone format" },
        { status: 400 }
      );
    }

    console.log("QUIZ LEAD:", {
      name,
      phone,
      score,
      totalQuestions,
      resultType,
      resultTitle,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("QUIZ RESULT ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}