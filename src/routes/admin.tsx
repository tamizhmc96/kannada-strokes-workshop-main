import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_CONTENT, durationLabel, formatDateRange, type Batch, type SiteContent } from "@/lib/content-schema";
import { SITE_CONTENT } from "@/lib/content";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — The Lettering Lab" }] }),
  component: AdminPage,
});

const PW_KEY = "tll_admin_pw";

function AdminPage() {
  const [phase, setPhase] = useState<"login" | "editor">("login");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<SiteContent>(DEFAULT_CONTENT);
  const [learnText, setLearnText] = useState(DEFAULT_CONTENT.learn.join("\n"));

  // Try to resume a previous session silently.
  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) void unlock(saved, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unlock(pw: string, silent = false) {
    setBusy(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password: pw }),
      });
      if (!res.ok) {
        if (!silent) toast.error(res.status === 401 ? "Incorrect password" : "Admin not configured");
        sessionStorage.removeItem(PW_KEY);
        return;
      }
      const info = (await res.json()) as { configured?: boolean };
      if (!info.configured)
        toast.warning("Saving isn't connected yet — add GITHUB_TOKEN in Vercel to enable Save.");
      const current = SITE_CONTENT;
      setPassword(pw);
      setDraft(current);
      setLearnText(current.learn.join("\n"));
      sessionStorage.setItem(PW_KEY, pw);
      setPhase("editor");
    } catch {
      if (!silent) toast.error("Could not reach the server");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const content: SiteContent = {
        ...draft,
        learn: learnText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", password, content }),
      });
      const data = (await res.json()) as { error?: string; content?: SiteContent };
      if (!res.ok) {
        toast.error(data.error ?? "Save failed");
        return;
      }
      if (data.content) {
        setDraft(data.content);
        setLearnText(data.content.learn.join("\n"));
      }
      toast.success("Saved! Your site will update for all visitors in about a minute (redeploying).");
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setBusy(false);
    }
  }

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setBatch(i: number, label: string) {
    setDraft((d) => ({ ...d, batches: d.batches.map((b, j) => (j === i ? { ...b, label } : b)) }));
  }
  function addBatch() {
    setDraft((d) => ({ ...d, batches: [...d.batches, { value: `batch-${Date.now()}`, label: "" } as Batch] }));
  }
  function removeBatch(i: number) {
    setDraft((d) => ({ ...d, batches: d.batches.filter((_, j) => j !== i) }));
  }

  if (phase === "login") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
        <p className="mt-1 text-sm text-foreground/70">Enter the admin password to edit site content.</p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void unlock(password);
          }}
        >
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputCls}
          />
          <button type="submit" disabled={busy || !password} className={btnCls}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
        <Link to="/" className="mt-4 inline-block text-xs text-foreground/60 hover:text-primary hover:underline">
          ← Back to site
        </Link>
      </Shell>
    );
  }

  const preview = { startDate: draft.startDate, endDate: draft.endDate };

  return (
    <Shell wide>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Edit Site Content</h1>
        <Link to="/" className="text-xs text-foreground/60 hover:text-primary hover:underline">
          View site ↗
        </Link>
      </div>
      <p className="mt-1 text-sm text-foreground/70">
        Changes go live for <strong>everyone</strong> about a minute after you save.
      </p>

      <div className="mt-6 space-y-5">
        <Group label="Workshop title">
          <input value={draft.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </Group>

        <div className="grid gap-4 sm:grid-cols-2">
          <Group label="Start date">
            <input type="date" value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
          </Group>
          <Group label="End date">
            <input type="date" value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
          </Group>
        </div>
        <p className="-mt-2 text-xs text-foreground/60">
          Preview: <span className="font-medium text-primary">{durationLabel(preview)} · {formatDateRange(preview)}</span>
        </p>

        <Group label="Price (₹, whole rupees)">
          <input
            type="number"
            min={1}
            value={draft.priceInr}
            onChange={(e) => set("priceInr", Number(e.target.value))}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-foreground/60">This is the amount customers are actually charged.</p>
        </Group>

        <Group label="Tagline (script line under the logo)">
          <input value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
        </Group>

        <Group label="Hero intro paragraph">
          <textarea rows={3} value={draft.heroIntro} onChange={(e) => set("heroIntro", e.target.value)} className={inputCls} />
        </Group>

        <Group label="Batches">
          <div className="space-y-2">
            {draft.batches.map((b, i) => (
              <div key={b.value} className="flex gap-2">
                <input
                  value={b.label}
                  onChange={(e) => setBatch(i, e.target.value)}
                  placeholder="e.g. Noon Batch · 2:00 PM – 3:00 PM"
                  className={inputCls}
                />
                <button type="button" onClick={() => removeBatch(i)} className="shrink-0 rounded-lg border border-primary/20 px-3 text-sm text-foreground/70 hover:bg-primary/5">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addBatch} className="rounded-lg border border-primary/20 px-3 py-1.5 text-sm text-primary hover:bg-primary/5">
              + Add batch
            </button>
          </div>
        </Group>

        <Group label="What you'll learn (one per line)">
          <textarea rows={6} value={learnText} onChange={(e) => setLearnText(e.target.value)} className={inputCls} />
        </Group>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => void save()} disabled={busy} className={btnCls}>
            {busy ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(PW_KEY);
              setPassword("");
              setPhase("login");
            }}
            className="text-sm text-foreground/60 hover:text-primary hover:underline"
          >
            Log out
          </button>
        </div>
      </div>
    </Shell>
  );
}

const inputCls =
  "w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const btnCls =
  "rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60";

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-hero-gradient px-6 py-12">
      <Toaster richColors position="top-center" />
      <div className={`mx-auto rounded-3xl border border-primary/10 bg-card p-8 shadow-lg ${wide ? "max-w-2xl" : "max-w-md"}`}>
        {children}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
