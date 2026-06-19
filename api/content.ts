import { mergeContent, type SiteContent } from "../src/lib/content-schema";

// Where the editable content lives in the repo. Saving commits this file via the
// GitHub API, which triggers a Vercel redeploy. The JSON file IS the store — no DB.
const OWNER = process.env.GITHUB_OWNER || "tamizhmc96";
const REPO = process.env.GITHUB_REPO || "kannada-strokes-workshop-main";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.CONTENT_PATH || "src/content.json";

function passwordOk(supplied: unknown): boolean {
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

async function commitContent(content: SiteContent): Promise<void> {
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
    sha = ((await getRes.json()) as { sha?: string }).sha;
  } else if (getRes.status !== 404) {
    throw new Error(`GitHub read failed (${getRes.status}): ${await getRes.text()}`);
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

  // Login check only — confirms the password and reports whether saving will work.
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
      const clean = mergeContent(content);
      await commitContent(clean);
      res.status(200).json({ ok: true, content: clean });
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? "Failed to save" });
    }
    return;
  }

  res.status(400).json({ error: "Unknown action" });
}
