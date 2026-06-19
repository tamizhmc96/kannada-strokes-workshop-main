// Shared, framework-agnostic content model used by BOTH the browser and the
// Vercel API functions. Keep this file free of React and Node-only imports.

export type Batch = { value: string; label: string };

export type SiteContent = {
  title: string;
  /** ISO date "YYYY-MM-DD" */
  startDate: string;
  /** ISO date "YYYY-MM-DD" */
  endDate: string;
  /** Whole-rupee price; this is the authoritative amount the server charges. */
  priceInr: number;
  tagline: string;
  heroIntro: string;
  batches: Batch[];
  learn: string[];
};

export const DEFAULT_CONTENT: SiteContent = {
  title: "12-Day Kannada Calligraphy Workshop",
  startDate: "2025-12-15",
  endDate: "2025-12-26",
  priceInr: 2200,
  tagline: "The Art of Letters",
  heroIntro:
    "Dive into the art of Kannada calligraphy and unlock the beauty of the script like never before. An immersive journey with The Lettering Lab.",
  batches: [
    { value: "noon", label: "Noon Batch · 2:00 PM – 3:00 PM" },
    { value: "evening", label: "Evening Batch · 5:00 PM – 6:00 PM" },
    { value: "night", label: "Night Batch · 9:00 PM – 10:00 PM" },
  ],
  learn: ["Basic Strokes", "ಸ್ವರಗಳು (Swara)", "ವ್ಯಂಜನಗಳು (Vanjanas)", "Word Formation", "Quote Composition"],
};

/** Merge unknown/partial stored data over the defaults so the app never breaks
 * on a missing or malformed field. */
export function mergeContent(partial: unknown): SiteContent {
  const p = (partial ?? {}) as Partial<SiteContent>;
  return {
    title: typeof p.title === "string" && p.title.trim() ? p.title : DEFAULT_CONTENT.title,
    startDate: isIsoDate(p.startDate) ? p.startDate! : DEFAULT_CONTENT.startDate,
    endDate: isIsoDate(p.endDate) ? p.endDate! : DEFAULT_CONTENT.endDate,
    priceInr:
      typeof p.priceInr === "number" && Number.isFinite(p.priceInr) && p.priceInr > 0
        ? Math.round(p.priceInr)
        : DEFAULT_CONTENT.priceInr,
    tagline: typeof p.tagline === "string" && p.tagline.trim() ? p.tagline : DEFAULT_CONTENT.tagline,
    heroIntro:
      typeof p.heroIntro === "string" && p.heroIntro.trim() ? p.heroIntro : DEFAULT_CONTENT.heroIntro,
    batches:
      Array.isArray(p.batches) && p.batches.length
        ? p.batches
            .filter((b): b is Batch => !!b && typeof b.value === "string" && typeof b.label === "string")
            .slice(0, 10)
        : DEFAULT_CONTENT.batches,
    learn:
      Array.isArray(p.learn) && p.learn.length
        ? p.learn.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, 30)
        : DEFAULT_CONTENT.learn,
  };
}

function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

// ---------------------------------------------------------------------------
// Derived display strings — all computed from startDate / endDate so there is
// only ever one place to change the workshop period.
// ---------------------------------------------------------------------------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ymd(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
}

function ordinal(d: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Number of inclusive days, e.g. 15th–26th → 12. */
export function durationDays(c: Pick<SiteContent, "startDate" | "endDate">): number {
  const a = ymd(c.startDate);
  const b = ymd(c.endDate);
  const days = Math.round((Date.UTC(b.y, b.m, b.d) - Date.UTC(a.y, a.m, a.d)) / 86_400_000) + 1;
  return Math.max(1, days);
}

/** "12-Day" */
export function durationLabel(c: Pick<SiteContent, "startDate" | "endDate">): string {
  return `${durationDays(c)}-Day`;
}

/** "15th – 26th December 2025" (collapses month/year when they match). */
export function formatDateRange(c: Pick<SiteContent, "startDate" | "endDate">): string {
  const a = ymd(c.startDate);
  const b = ymd(c.endDate);
  if (a.y === b.y && a.m === b.m) {
    return `${ordinal(a.d)} – ${ordinal(b.d)} ${MONTHS[a.m]} ${a.y}`;
  }
  if (a.y === b.y) {
    return `${ordinal(a.d)} ${MONTHS[a.m]} – ${ordinal(b.d)} ${MONTHS[b.m]} ${a.y}`;
  }
  return `${ordinal(a.d)} ${MONTHS[a.m]} ${a.y} – ${ordinal(b.d)} ${MONTHS[b.m]} ${b.y}`;
}

/** "Dec 15–26, 2025" — compact, for SEO/meta. */
export function formatDateRangeShort(c: Pick<SiteContent, "startDate" | "endDate">): string {
  const a = ymd(c.startDate);
  const b = ymd(c.endDate);
  const mon = (m: number) => MONTHS[m].slice(0, 3);
  if (a.y === b.y && a.m === b.m) return `${mon(a.m)} ${a.d}–${b.d}, ${a.y}`;
  if (a.y === b.y) return `${mon(a.m)} ${a.d} – ${mon(b.m)} ${b.d}, ${a.y}`;
  return `${mon(a.m)} ${a.d}, ${a.y} – ${mon(b.m)} ${b.d}, ${b.y}`;
}

/** "15 Dec 2025" — the start day, e.g. for "joining link emailed before …". */
export function formatStartDay(c: Pick<SiteContent, "startDate">): string {
  const a = ymd(c.startDate);
  return `${a.d} ${MONTHS[a.m].slice(0, 3)} ${a.y}`;
}

/** "15 December 2025" — the start day, long form. */
export function formatStartDayLong(c: Pick<SiteContent, "startDate">): string {
  const a = ymd(c.startDate);
  return `${a.d} ${MONTHS[a.m]} ${a.y}`;
}
