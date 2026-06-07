import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";

export const BUSINESS = {
  brand: "The Lettering Lab",
  owner: "Tamilarasan",
  email: "tamizhmc96@gmail.com",
  phone: "+91 93441 76843",
  phoneHref: "+919344176843",
  location: "Chennai, Tamil Nadu, India",
} as const;

const POLICY_LINKS = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund", label: "Refund & Cancellation" },
  { to: "/shipping", label: "Shipping & Delivery" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function PolicyPage({
  title,
  updated = "6 June 2026",
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <header className="mx-auto max-w-3xl px-6 pt-10 pb-4 text-center">
        <Link to="/">
          <img
            src={logo}
            alt={BUSINESS.brand}
            className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg ring-1 ring-primary/10"
          />
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-3xl border border-primary/10 bg-card p-8 shadow-lg sm:p-10">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          <p className="mt-1 text-sm text-foreground/60">Last updated: {updated}</p>
          <div className="prose-policy mt-6 space-y-5 text-foreground/85">{children}</div>

          <div className="mt-10 border-t border-primary/10 pt-6 text-sm text-foreground/70">
            <p>
              <span className="font-semibold text-foreground">{BUSINESS.brand}</span> ·{" "}
              {BUSINESS.owner} · {BUSINESS.location}
            </p>
            <p className="mt-1">
              Email:{" "}
              <a className="font-medium text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
            </p>
            <p className="mt-1">
              Phone:{" "}
              <a className="font-medium text-primary hover:underline" href={`tel:${BUSINESS.phoneHref}`}>
                {BUSINESS.phone}
              </a>
            </p>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-foreground/60">
          <Link to="/" className="hover:text-primary hover:underline">
            Home
          </Link>
          {POLICY_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-primary hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </main>

      <footer className="border-t border-primary/10 py-6 text-center text-xs text-foreground/60">
        <p>
          © {new Date().getFullYear()} {BUSINESS.brand} · "The Art of Letters"
        </p>
      </footer>
    </div>
  );
}

/** Small section heading used inside policy bodies. */
export function PolicyHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 text-lg font-semibold text-primary">{children}</h2>;
}
