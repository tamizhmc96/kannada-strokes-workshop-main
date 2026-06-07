import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact Us — The Lettering Lab" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PolicyPage title="Contact Us">
      <p>
        We'd love to hear from you. For any questions about the 12-Day Kannada Calligraphy
        Workshop — registration, payments, materials delivery, or your batch — please reach out
        using the details below.
      </p>

      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
        <p className="text-sm">
          <span className="font-semibold text-primary">Business name:</span> {BUSINESS.brand}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-primary">Proprietor:</span> {BUSINESS.owner}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-primary">Email:</span>{" "}
          <a className="text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
            {BUSINESS.email}
          </a>
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-primary">Phone:</span>{" "}
          <a className="text-primary hover:underline" href={`tel:${BUSINESS.phoneHref}`}>
            {BUSINESS.phone}
          </a>
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-primary">Location:</span> {BUSINESS.location}
        </p>
      </div>

      <p>
        We typically respond within 1–2 working days. You can reach us by email or phone using the
        details above.
      </p>
    </PolicyPage>
  );
}
