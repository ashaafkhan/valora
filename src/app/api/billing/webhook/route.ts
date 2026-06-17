import { NextResponse } from "next/server";
import { db } from "@/server/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(bodyText);
    const eventType = event.event;

    if (eventType === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        const payment = await db.payment.findUnique({
          where: { razorpayOrderId },
        });

        if (payment && payment.status !== "captured") {
          // Update payment status
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: "captured",
              razorpayPaymentId,
            },
          });

          // Update user plan
          await db.user.update({
            where: { id: payment.userId },
            data: {
              plan: payment.plan,
              planResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              aiMessagesUsed: 0,
              voiceInputUsed: 0,
              emailComposeUsed: 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Razorpay Webhook Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
