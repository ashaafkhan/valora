import { NextResponse } from "next/server";
import { groq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
    });

    return NextResponse.json({ text: transcription.text }, { status: 200 });
  } catch (error: any) {
    console.error("Speech to text error:", error);
    return NextResponse.json(
      { error: error.message || "Server error or missing API key" },
      { status: 500 }
    );
  }
}
