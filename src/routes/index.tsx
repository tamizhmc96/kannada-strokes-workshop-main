import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ?? "";
const AMOUNT_INR = 10;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "12-Day Kannada Calligraphy Workshop — The Lettering Lab" },
      {
        name: "description",
        content:
          "Join The Lettering Lab's 12-day online Kannada Calligraphy Workshop (Dec 15–26, 2025). Three flexible batches. ₹2200. Materials delivered. Certificate included.",
      },
      { property: "og:title", content: "12-Day Kannada Calligraphy Workshop" },
      {
        property: "og:description",
        content:
          "Dive into the art of Kannada calligraphy with The Lettering Lab. 12 days online. ₹2200.",
      },
    ],
  }),
  component: LandingPage,
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

type FormState = {
  name: string;
  age: string;
  phone: string;
  address: string;
  pincode: string;
  batch: string;
  email: string;
};

const initialForm: FormState = {
  name: "",
  age: "",
  phone: "",
  address: "",
  pincode: "",
  batch: "",
  email: "",
};

const BATCHES = [
  { value: "noon", label: "Noon Batch · 2:00 PM – 3:00 PM" },
  { value: "evening", label: "Evening Batch · 5:00 PM – 6:00 PM" },
  { value: "night", label: "Night Batch · 9:00 PM – 10:00 PM" },
];

function LandingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): string | null => {
    if (!form.name.trim() || form.name.length > 100) return "Please enter your full name";
    const age = Number(form.age);
    if (!age || age < 8 || age > 100) return "Age must be 8 or above";
    if (!/^\d{10}$/.test(form.phone)) return "Enter a valid 10-digit phone number";
    if (!form.email.includes("@") || form.email.length > 255) return "Enter a valid email";
    if (!form.address.trim() || form.address.length > 300) return "Please enter your address";
    if (!/^\d{6}$/.test(form.pincode)) return "Enter a valid 6-digit pincode";
    if (!form.batch) return "Please select a batch";
    return null;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    if (!window.Razorpay) {
      toast.error("Payment SDK still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);
    try {
      const { orderId } = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: AMOUNT_INR }),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to create order");
        return r.json();
      });

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: AMOUNT_INR * 100,
        currency: "INR",
        order_id: orderId,
        name: "The Lettering Lab",
        description: "12-Day Kannada Calligraphy Workshop",
        image: logo,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { batch: form.batch, age: form.age, address: form.address, pincode: form.pincode },
        theme: { color: "#1e3a6f" },
        method: { upi: true, card: true, netbanking: true, wallet: true, paylater: true },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verification = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            }).then((r) => {
              if (!r.ok) throw new Error("Verification request failed");
              return r.json();
            });
            if (!verification.verified) throw new Error("Payment signature invalid");
            sessionStorage.setItem("rzp_name", form.name);
            sessionStorage.setItem("rzp_email", form.email);
            sessionStorage.setItem("rzp_phone", form.phone);
            navigate({
              to: "/success",
              search: {
                payment_id: response.razorpay_payment_id,
                batch: form.batch,
                amount: String(AMOUNT_INR),
              },
            });
          } catch {
            toast.error("Payment verification failed. Please contact support with your payment ID.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        toast.error(`Payment failed: ${resp.error?.description ?? "Unknown error"}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Toaster richColors position="top-center" />

      {/* Header / Logo */}
      <header className="mx-auto max-w-5xl px-6 pt-10 pb-4 text-center">
        <img
          src={logo}
          alt="The Lettering Lab"
          className="mx-auto h-40 w-40 rounded-full object-cover shadow-lg ring-1 ring-primary/10"
        />
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-4 pb-10 text-center">
        <p className="font-script text-3xl text-primary">The Art of Letters</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-primary sm:text-5xl">
          12-Day Kannada Calligraphy Workshop
        </h1>
        <p className="mt-3 text-base text-primary/70">Online · 15th – 26th December 2025</p>
        <p className="mt-5 text-lg text-foreground/80">
          Dive into the art of Kannada calligraphy and unlock the beauty of the script like never before.
          An immersive 12-day journey with The Lettering Lab.
        </p>
        <a
          href="#register"
          className="mt-7 inline-block rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
        >
          Reserve Your Seat · ₹{AMOUNT_INR}
        </a>
      </section>

      {/* Content */}
      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-10 md:grid-cols-2">
        <div className="rounded-2xl border border-primary/10 bg-card p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-primary">Choose Your Batch</h2>
          <p className="mt-1 text-sm text-foreground/70">Three flexible online batches to fit your day.</p>
          <ul className="mt-5 space-y-3 text-foreground/90">
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" /> Noon Batch · 2:00 PM – 3:00 PM</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" /> Evening Batch · 5:00 PM – 6:00 PM</li>
            <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" /> Night Batch · 9:00 PM – 10:00 PM</li>
          </ul>
          <p className="mt-5 text-sm text-foreground/70">Age 8 years and above can join.</p>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-card p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-primary">What You'll Learn</h2>
          <ul className="mt-5 space-y-2 text-foreground/90">
            <li>• Basic Strokes</li>
            <li>• ಸ್ವರಗಳು (Swara)</li>
            <li>• ವ್ಯಂಜನಗಳು (Vanjanas)</li>
            <li>• Word Formation</li>
            <li>• Quote Composition</li>
          </ul>
          <div className="mt-6 space-y-2 text-sm text-foreground/80">
            <p>✓ Materials delivered to your doorstep</p>
            <p>✓ Certificate of completion provided</p>
            <p>✓ Limited seats — reserve today!</p>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-3xl border border-primary/10 bg-card p-8 shadow-lg">
          <h2 className="text-center text-3xl font-bold text-primary">Register & Pay</h2>
          <p className="mt-1 text-center text-sm text-foreground/70">
            Complete your details and pay securely via Razorpay.
          </p>

          <form onSubmit={handlePay} className="mt-7 space-y-4">
            <Field label="Full Name" value={form.name} onChange={update("name")} placeholder="Your name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Age" type="number" value={form.age} onChange={update("age")} placeholder="8+" />
              <Field label="Phone Number" value={form.phone} onChange={update("phone")} placeholder="10-digit mobile" />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
              <textarea
                value={form.address}
                onChange={update("address")}
                placeholder="House / Street / City / State"
                rows={3}
                className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Field label="Pincode" value={form.pincode} onChange={update("pincode")} placeholder="6-digit" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Preferred Batch</label>
              <select
                value={form.batch}
                onChange={update("batch")}
                className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a batch…</option>
                {BATCHES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Processing…" : `Buy now · ₹${AMOUNT_INR}`}
            </button>

            <p className="pt-2 text-center text-xs text-foreground/60">
              You agree to share information entered on this page with Razorpay, adhering to applicable laws.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-primary/10 py-6 text-center text-xs text-foreground/60">
        <p>© {new Date().getFullYear()} The Lettering Lab · "The Art of Letters"</p>
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <a href="/terms" className="hover:text-primary hover:underline">Terms</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-primary hover:underline">Privacy</a>
          <span>·</span>
          <a href="/refund" className="hover:text-primary hover:underline">Refund</a>
          <span>·</span>
          <a href="/shipping" className="hover:text-primary hover:underline">Shipping</a>
          <span>·</span>
          <a href="/contact" className="hover:text-primary hover:underline">Contact</a>
        </nav>
      </footer>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
