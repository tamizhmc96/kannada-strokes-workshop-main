import { createHmac } from "crypto";

const RAZORPAY_KEY_ID = "rzp_test_Sq1SeyY1w1qQKJ";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== "number") {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    }),
  });

  if (!response.ok) {
    res.status(500).json({ error: "Order creation failed" });
    return;
  }

  const order = await response.json();
  res.json({ orderId: order.id });
}
