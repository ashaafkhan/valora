import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { PRICING_PRICES, PlanType } from "@/lib/pricing";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PRICING_PRICES[plan as PlanType]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const amount = PRICING_PRICES[plan as PlanType].amount;
    
    // Amount is in INR. Razorpay expects paise (amount * 100)
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Math.random().toString(36).substring(7)}`,
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment in DB
    await db.payment.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: order.id,
        plan: plan,
        amount: amount * 100,
        status: "created",
      },
    });

    return NextResponse.json({ orderId: order.id, amount: options.amount });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
