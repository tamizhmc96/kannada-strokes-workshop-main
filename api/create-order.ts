import contentData from "../src/content.json";
import { mergeContent } from "../src/lib/content-schema";

// The workshop fee is authoritative on the server — read from the bundled
// content.json (admin-editable, redeployed on save), never from the browser.
// That prevents a user from tampering the amount they pay.

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!secret || !keyId) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const amountInr = mergeContent(contentData).priceInr;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: amountInr * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    }),
  });

  if (!response.ok) {
    res.status(500).json({ error: "Order creation failed" });
    return;
  }

  const order = await response.json();
  res.json({ orderId: order.id, amount: amountInr });
}
