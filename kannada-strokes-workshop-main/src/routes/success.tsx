import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful — The Lettering Lab" },
      {
        name: "description",
        content: "Your seat for the 12-Day Kannada Calligraphy Workshop is confirmed.",
      },
    ],
  }),
  component: SuccessPage,
});

type BatchInfo = { label: string; time: string };

const BATCH_INFO: Record<string, BatchInfo> = {
  noon: { label: "Noon Batch", time: "2:00 PM – 3:00 PM IST" },
  evening: { label: "Evening Batch", time: "5:00 PM – 6:00 PM IST" },
  night: { label: "Night Batch", time: "9:00 PM – 10:00 PM IST" },
};

const WORKSHOP_DATES = "15th – 26th December 2025 (12 Days)";

function SuccessPage() {
  const search = Route.useSearch() as {
    payment_id?: string;
    batch?: string;
    amount?: string;
  };

  const paymentId = search.payment_id ?? "N/A";
  const batchKey = search.batch ?? "";
  const batch = BATCH_INFO[batchKey] ?? { label: batchKey || "N/A", time: "—" };
  const amount = search.amount ?? "2200";

  const [name, setName] = useState("—");
  const [email, setEmail] = useState("—");
  const [phone, setPhone] = useState("—");

  useEffect(() => {
    setName(sessionStorage.getItem("rzp_name") ?? "—");
    setEmail(sessionStorage.getItem("rzp_email") ?? "—");
    setPhone(sessionStorage.getItem("rzp_phone") ?? "—");
    sessionStorage.removeItem("rzp_name");
    sessionStorage.removeItem("rzp_email");
    sessionStorage.removeItem("rzp_phone");
  }, []);
  const issuedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const downloadReceipt = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 60;

    // Header band
    doc.setFillColor(30, 58, 111);
    doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("The Lettering Lab", 40, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Payment Receipt · The Art of Letters", 40, 65);

    y = 130;
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("12-Day Kannada Calligraphy Workshop", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(`Workshop Dates: ${WORKSHOP_DATES}`, 40, y);
    y += 14;
    doc.text(`Receipt issued: ${issuedAt}`, 40, y);

    y += 30;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, W - 40, y);
    y += 24;

    const row = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.text(label.toUpperCase(), 40, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(value, W - 240);
      doc.text(lines, 220, y);
      y += 14 * Math.max(1, lines.length) + 10;
    };

    row("Payment ID", paymentId);
    row("Name", name);
    row("Email", email);
    row("Phone", phone);
    row("Selected Batch", `${batch.label} · ${batch.time}`);
    row("Amount Paid", `INR ${amount}.00`);
    row("Status", "Paid · Confirmed");

    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, W - 40, y);
    y += 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 111);
    doc.text("What's next?", 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const notes = [
      "• Workshop materials will be shipped to your address.",
      "• Joining link for your batch will be emailed before 15 Dec 2025.",
      "• Certificate of completion will be issued at the end of the workshop.",
      "• For queries, reply to the confirmation email.",
    ];
    notes.forEach((n) => {
      doc.text(n, 40, y);
      y += 16;
    });

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "This is a system-generated receipt. Payment processed securely via Razorpay.",
      40,
      doc.internal.pageSize.getHeight() - 30,
    );

    doc.save(`TheLetteringLab-Receipt-${paymentId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <header className="mx-auto max-w-5xl px-6 pt-10 pb-4 text-center">
        <img
          src={logo}
          alt="The Lettering Lab"
          className="mx-auto h-28 w-28 rounded-full object-cover shadow-lg ring-1 ring-primary/10"
        />
      </header>

      <main className="mx-auto max-w-xl px-6 pt-4 pb-16 text-center">
        <div className="rounded-3xl border border-primary/10 bg-card p-8 shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-primary">Payment Successful!</h1>
          <p className="mt-2 text-foreground/70">
            Your seat is confirmed{name !== "—" ? `, ${name.split(" ")[0]}` : ""}. See you in class!
          </p>

          {/* Batch summary */}
          <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
              Your Batch
            </p>
            <p className="mt-2 text-xl font-bold text-primary">{batch.label}</p>
            <div className="mt-3 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
              <div>
                <span className="block text-xs uppercase text-muted-foreground">Timing</span>
                <span className="font-medium">{batch.time}</span>
              </div>
              <div>
                <span className="block text-xs uppercase text-muted-foreground">Dates</span>
                <span className="font-medium">{WORKSHOP_DATES}</span>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="mt-5 space-y-3 text-left">
            <div className="rounded-xl border border-primary/10 bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Razorpay Payment ID
              </p>
              <p className="mt-1 break-all font-mono text-base font-semibold text-foreground">
                {paymentId}
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount Paid</p>
              <p className="mt-1 text-base font-semibold text-foreground">₹{amount}.00</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={downloadReceipt}
              className="inline-block rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
            >
              Download Receipt (PDF)
            </button>
            <Link
              to="/"
              className="inline-block rounded-full border border-primary/30 bg-background px-7 py-3 text-base font-semibold text-primary transition hover:bg-primary/5"
            >
              Back to Home
            </Link>
          </div>

          <p className="mt-6 text-xs text-foreground/60">
            Materials will be shipped to your address. A joining link for {batch.label.toLowerCase()} will be emailed before 15 Dec 2025.
          </p>
        </div>
      </main>

      <footer className="border-t border-primary/10 py-6 text-center text-xs text-foreground/60">
        <p>© {new Date().getFullYear()} The Lettering Lab · "The Art of Letters"</p>
      </footer>
    </div>
  );
}
