import { NextResponse } from "next/server";
import { handleRouteError, parseJson, requireUserId } from "@/lib/api-route";
import { db } from "@/server/db";
import { z } from "zod";
import crypto from "crypto";

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseJson(request, verifyPaymentSchema);
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    // Retrieve payment from DB
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Order record not found" }, { status: 404 });
    }

    if (payment.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized order access" }, { status: 403 });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // Only perform signature check if real secret is configured
    if (keySecret && !razorpayOrderId.startsWith("order_mock_")) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        // Mark payment as failed in DB
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
        return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
      }
    }

    // Update payment record
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "captured",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // Update User plan and reset usage metrics
    await db.user.update({
      where: { id: userId },
      data: {
        plan: payment.plan,
        planResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        aiMessagesUsed: 0,
        voiceInputUsed: 0,
        emailComposeUsed: 0,
      },
    });

    return NextResponse.json({ success: true, plan: payment.plan });
  } catch (error) {
    return handleRouteError(error);
  }
}
