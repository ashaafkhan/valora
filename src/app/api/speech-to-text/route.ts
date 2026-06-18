import { NextResponse } from "next/server";
import { groq } from "@/lib/ai";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { PRICING_LIMITS, type PlanType } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user to check limits
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const plan = (user.plan as PlanType) || "free";
    const limits = PRICING_LIMITS[plan];

    if (user.voiceInputUsed >= limits.voiceInput) {
      return NextResponse.json(
        { error: `You have reached your limit of ${limits.voiceInput} voice inputs for the ${plan} plan. Please upgrade.` },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
    });

    // Increment usage
    await db.user.update({
      where: { id: userId },
      data: { voiceInputUsed: { increment: 1 } },
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
