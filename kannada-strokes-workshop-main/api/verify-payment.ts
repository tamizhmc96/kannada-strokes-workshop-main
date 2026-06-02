import { createHmac } from "crypto";

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

  const { orderId, paymentId, signature } = req.body;
  if (!orderId || !paymentId || !signature) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expected !== signature) {
    res.status(400).json({ error: "Signature mismatch" });
    return;
  }

  res.json({ verified: true });
}
