// Self-contained on purpose: a Vercel serverless function must not import from
// ../src — those imports fail to resolve at runtime and crash the function
// (FUNCTION_INVOCATION_FAILED). The authoritative price is read from content.json
// on GitHub (admin-editable, public repo) with a safe fallback.

const OWNER = process.env.GITHUB_OWNER || "tamizhmc96";
const REPO = process.env.GITHUB_REPO || "kannada-strokes-workshop-main";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const CONTENT_PATH = process.env.CONTENT_PATH || "src/content.json";
const FALLBACK_PRICE_INR = 2200;

async function getPriceInr(): Promise<number> {
  try {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${CONTENT_PATH}`;
    const r = await fetch(url, { headers: { "cache-control": "no-cache" } });
    if (r.ok) {
      const data: any = await r.json();
      const p = data?.priceInr;
      if (typeof p === "number" && Number.isFinite(p) && p > 0) return Math.round(p);
    }
  } catch {
    /* fall through to fallback */
  }
  return FALLBACK_PRICE_INR;
}

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

  const amountInr = await getPriceInr();

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
