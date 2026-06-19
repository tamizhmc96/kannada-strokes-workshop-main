import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, PolicyHeading, PolicyPage } from "@/components/policy-page";
import { useSiteContent } from "@/lib/content";
import { formatDateRange } from "@/lib/content-schema";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms & Conditions — The Lettering Lab" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const content = useSiteContent();
  return (
    <PolicyPage title="Terms & Conditions">
      <p>
        These Terms &amp; Conditions govern your registration for and participation in the 12-Day
        Kannada Calligraphy Workshop ("the Workshop") offered by {BUSINESS.brand} ("we", "us",
        "our"), operated by {BUSINESS.owner}, {BUSINESS.location}. By registering and making a
        payment, you agree to these terms.
      </p>

      <PolicyHeading>1. The Workshop</PolicyHeading>
      <p>
        The Workshop is an online Kannada calligraphy program conducted from {formatDateRange(content)}{" "}
        across multiple batch timings. It includes live online sessions, physical practice materials
        delivered to your address, and a certificate of completion.
      </p>

      <PolicyHeading>2. Eligibility</PolicyHeading>
      <p>
        The Workshop is open to participants aged 8 years and above. If the participant is a minor,
        a parent or guardian must consent to and complete the registration on their behalf.
      </p>

      <PolicyHeading>3. Fees &amp; Payment</PolicyHeading>
      <p>
        The Workshop fee is ₹{content.priceInr.toLocaleString("en-IN")} (Indian Rupees), inclusive of materials and certificate. All
        payments are processed securely through Razorpay. Your seat is confirmed only after
        successful payment. We do not store your card, UPI, or bank credentials.
      </p>

      <PolicyHeading>4. Registration Details</PolicyHeading>
      <p>
        You are responsible for providing accurate registration details, including your name,
        contact information, and delivery address. We are not liable for failed delivery or missed
        communication resulting from incorrect details provided by you.
      </p>

      <PolicyHeading>5. Cancellations &amp; Refunds</PolicyHeading>
      <p>
        Please refer to our <a className="text-primary hover:underline" href="/refund">Refund &amp; Cancellation Policy</a>{" "}
        for full details. In summary, fees are non-refundable except where {BUSINESS.brand} cancels
        a batch.
      </p>

      <PolicyHeading>6. Code of Conduct</PolicyHeading>
      <p>
        Participants agree to attend sessions respectfully and not to record, reproduce, or
        redistribute any session content, course materials, or resources without written
        permission. We reserve the right to remove participants who disrupt sessions, without
        refund.
      </p>

      <PolicyHeading>7. Intellectual Property</PolicyHeading>
      <p>
        All course content, designs, worksheets, and materials remain the intellectual property of
        {" "}{BUSINESS.brand}. They are provided for your personal learning use only.
      </p>

      <PolicyHeading>8. Limitation of Liability</PolicyHeading>
      <p>
        The Workshop is provided on an "as is" basis. To the maximum extent permitted by law, our
        liability for any claim arising from the Workshop is limited to the fee paid by you.
      </p>

      <PolicyHeading>9. Changes</PolicyHeading>
      <p>
        We may update these terms from time to time. The version published on this page applies to
        your registration. We may also reschedule sessions where necessary and will notify you by
        email.
      </p>

      <PolicyHeading>10. Governing Law</PolicyHeading>
      <p>
        These terms are governed by the laws of India, and any disputes are subject to the
        jurisdiction of the courts of Chennai, Tamil Nadu.
      </p>

      <PolicyHeading>11. Contact</PolicyHeading>
      <p>
        For any questions about these terms, email us at{" "}
        <a className="text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
          {BUSINESS.email}
        </a>
        .
      </p>
    </PolicyPage>
  );
}
