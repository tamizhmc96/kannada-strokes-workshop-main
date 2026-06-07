// The workshop fee is fixed and authoritative on the server.
// Never trust an amount sent by the browser — that lets a user pay ₹1.
const WORKSHOP_AMOUNT_INR = 2200;

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

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: WORKSHOP_AMOUNT_INR * 100,
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
