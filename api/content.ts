// Self-contained on purpose: no imports from ../src (those crash the Vercel
// function at runtime). Validation is inlined. Saving commits content.json back
// to GitHub, which triggers a redeploy. The JSON file is the store — no DB.

const OWNER = process.env.GITHUB_OWNER || "tamizhmc96";
const REPO = process.env.GITHUB_REPO || "kannada-strokes-workshop-main";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.CONTENT_PATH || "src/content.json";

const DEFAULT_BATCHES = [
  { value: "noon", label: "Noon Batch · 2:00 PM – 3:00 PM" },
  { value: "evening", label: "Evening Batch · 5:00 PM – 6:00 PM" },
  { value: "night", label: "Night Batch · 9:00 PM – 10:00 PM" },
];
const DEFAULT_LEARN = ["Basic Strokes", "Swara", "Vanjanas", "Word Formation", "Quote Composition"];

function str(v: any, fb: string): string {
  return typeof v === "string" && v.trim() ? v : fb;
}

// Coerce/validate the incoming content so we never commit garbage to the repo.
function sanitize(input: any) {
  const p = input ?? {};
  const batches = Array.isArray(p.batches)
    ? p.batches
        .filter((b: any) => b && typeof b.value === "string" && typeof b.label === "string" && b.label.trim())
        .slice(0, 10)
    : [];
  const learn = Array.isArray(p.learn)
    ? p.learn.filter((s: any) => typeof s === "string" && s.trim()).slice(0, 30)
    : [];
  return {
    title: str(p.title, "12-Day Kannada Calligraphy Workshop"),
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(p.startDate) ? p.startDate : "2025-12-15",
    endDate: /^\d{4}-\d{2}-\d{2}$/.test(p.endDate) ? p.endDate : "2025-12-26",
    priceInr:
      typeof p.priceInr === "number" && Number.isFinite(p.priceInr) && p.priceInr > 0
        ? Math.round(p.priceInr)
        : 2200,
    tagline: str(p.tagline, "The Art of Letters"),
    heroIntro: str(p.heroIntro, "An immersive journey with The Lettering Lab."),
    batches: batches.length ? batches : DEFAULT_BATCHES,
    learn: learn.length ? learn : DEFAULT_LEARN,
  };
}

function passwordOk(supplied: any): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || typeof supplied !== "string") return false;
  if (supplied.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function ghConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

async function commitContent(content: any): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(FILE_PATH)}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "lettering-lab-admin",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // Need the current file SHA to update it.
  let sha: string | undefined;
  const getRes = await fetch(`${url}?ref=${BRANCH}`, { headers });
  if (getRes.ok) {
    sha = ((await getRes.json()) as any).sha;
  } else if (getRes.status !== 404) {
    throw new Error(`GitHub read failed (${getRes.status})`);
  }

  const body = {
    message: "chore(content): update site content via admin",
    content: Buffer.from(JSON.stringify(content, null, 2) + "\n").toString("base64"),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };
  const putRes = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!putRes.ok) throw new Error(`GitHub write failed (${putRes.status}): ${await putRes.text()}`);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }

  if (!process.env.ADMIN_PASSWORD) {
    res.status(500).json({ error: "Admin is not configured (ADMIN_PASSWORD missing)." });
    return;
  }

  const { action, password, content } = req.body ?? {};
  if (!passwordOk(password)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  if (action === "verify") {
    res.status(200).json({ ok: true, configured: ghConfigured() });
    return;
  }

  if (action === "save") {
    if (!ghConfigured()) {
      res.status(500).json({ error: "Saving is not connected (GITHUB_TOKEN missing)." });
      return;
    }
    try {
      const clean = sanitize(content);
      await commitContent(clean);
      res.status(200).json({ ok: true, content: clean });
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? "Failed to save" });
    }
    return;
  }

  res.status(400).json({ error: "Unknown action" });
}
