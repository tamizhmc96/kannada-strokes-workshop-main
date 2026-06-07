import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, PolicyHeading, PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [{ title: "Refund & Cancellation Policy — The Lettering Lab" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <PolicyPage title="Refund & Cancellation Policy">
      <p>
        This policy explains how cancellations and refunds work for the 12-Day Kannada Calligraphy
        Workshop offered by {BUSINESS.brand}. Please read it carefully before making a payment.
      </p>

      <PolicyHeading>Fees Are Non-Refundable</PolicyHeading>
      <p>
        Because each registration reserves a limited seat and we dispatch physical practice
        materials ahead of the Workshop, the Workshop fee of ₹2,200 is{" "}
        <strong>non-refundable</strong> once your registration is confirmed. This includes, but is
        not limited to, change of mind, inability to attend, missed sessions, or partial attendance.
      </p>

      <PolicyHeading>When We Issue a Refund</PolicyHeading>
      <p>
        A refund is issued <strong>only if {BUSINESS.brand} cancels your batch</strong> and we are
        unable to offer you a suitable alternative batch. In that event, you will receive a full
        refund of the fee paid.
      </p>

      <PolicyHeading>How Refunds Are Processed</PolicyHeading>
      <p>
        Approved refunds are processed to your original payment method through Razorpay and
        typically reflect in your account within 5–7 working days, depending on your bank or payment
        provider. We do not offer cash refunds.
      </p>

      <PolicyHeading>How to Request</PolicyHeading>
      <p>
        If your batch has been cancelled by us, or you have a question about a charge, email us at{" "}
        <a className="text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
          {BUSINESS.email}
        </a>{" "}
        with your Razorpay Payment ID. We will respond within 1–2 working days.
      </p>
    </PolicyPage>
  );
}
