import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, PolicyHeading, PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — The Lettering Lab" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        {BUSINESS.brand} ("we", "us", "our") respects your privacy. This policy explains what
        information we collect when you register for the 12-Day Kannada Calligraphy Workshop, how we
        use it, and the choices you have.
      </p>

      <PolicyHeading>Information We Collect</PolicyHeading>
      <p>
        When you register, we collect the details you provide: your full name, age, phone number,
        email address, postal address, pincode, and your preferred batch. During checkout, payment
        is processed by Razorpay; we receive a payment confirmation and reference ID but never your
        full card, UPI, or bank details.
      </p>

      <PolicyHeading>How We Use Your Information</PolicyHeading>
      <ul className="list-disc space-y-1 pl-5">
        <li>To confirm your registration and reserve your seat.</li>
        <li>To deliver your practice materials to the address you provide.</li>
        <li>To send your batch joining link, schedule, and certificate.</li>
        <li>To respond to your queries and provide customer support.</li>
      </ul>

      <PolicyHeading>Sharing Your Information</PolicyHeading>
      <p>
        We share information only as needed to run the Workshop: with{" "}
        <strong>Razorpay</strong> to process payments, and with our <strong>courier/delivery
        partner</strong> to ship your materials. We do not sell or rent your personal information to
        any third party.
      </p>

      <PolicyHeading>Data Retention</PolicyHeading>
      <p>
        We retain your registration details only as long as necessary to deliver the Workshop and to
        meet legal or accounting requirements, after which they are securely deleted.
      </p>

      <PolicyHeading>Security</PolicyHeading>
      <p>
        Payments are handled over secure, encrypted connections by Razorpay, a PCI-DSS compliant
        payment gateway. We take reasonable measures to protect the information you share with us.
      </p>

      <PolicyHeading>Your Rights</PolicyHeading>
      <p>
        You may request access to, correction of, or deletion of your personal information by
        emailing us at{" "}
        <a className="text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
          {BUSINESS.email}
        </a>
        .
      </p>

      <PolicyHeading>Contact</PolicyHeading>
      <p>
        For any privacy-related questions, contact {BUSINESS.owner} at{" "}
        <a className="text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
          {BUSINESS.email}
        </a>
        , {BUSINESS.location}.
      </p>
    </PolicyPage>
  );
}
