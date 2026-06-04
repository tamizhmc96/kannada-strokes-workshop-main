import { createServerFn } from "@tanstack/react-start";

const RAZORPAY_KEY_ID = "rzp_test_Sq1SeyY1w1qQKJ";

function getKeySecret(): string {
  const s = process.env.RAZORPAY_KEY_SECRET;
  if (!s) throw new Error("RAZORPAY_KEY_SECRET env var is not set");
  return s;
}

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { amount: number }) => d)
  .handler(async ({ data }) => {
    const secret = getKeySecret();
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${secret}`)}`,
      },
      body: JSON.stringify({
        amount: data.amount * 100,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      }),
    });
    if (!res.ok) throw new Error(`Razorpay order creation failed: ${await res.text()}`);
    const order = (await res.json()) as { id: string };
    return { orderId: order.id };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((d: { orderId: string; paymentId: string; signature: string }) => d)
  .handler(async ({ data }) => {
    const secret = getKeySecret();
    const expected = await hmacSHA256(secret, `${data.orderId}|${data.paymentId}`);
    if (expected !== data.signature) {
      throw new Error("Payment signature mismatch — possible tampering detected");
    }
    return { verified: true };
  });
