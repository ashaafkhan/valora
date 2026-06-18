import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update payment record
    const payment = await db.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
      },
    });

    // Upgrade user plan and reset limits
    await db.user.update({
      where: { id: session.user.id },
      data: {
        plan: payment.plan,
        planResetDate: new Date(),
        aiMessagesUsed: 0,
        voiceInputUsed: 0,
        emailComposeUsed: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
