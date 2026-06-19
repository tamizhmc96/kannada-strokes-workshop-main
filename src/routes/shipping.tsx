import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, PolicyHeading, PolicyPage } from "@/components/policy-page";
import { useSiteContent } from "@/lib/content";
import { formatStartDayLong } from "@/lib/content-schema";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [{ title: "Shipping & Delivery Policy — The Lettering Lab" }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const content = useSiteContent();
  return (
    <PolicyPage title="Shipping & Delivery Policy">
      <p>
        The 12-Day Kannada Calligraphy Workshop includes physical practice materials that are
        shipped to the address you provide at registration. This policy explains how delivery works.
      </p>

      <PolicyHeading>What Is Shipped</PolicyHeading>
      <p>
        Registered participants receive a kit of calligraphy practice materials required for the
        Workshop. The live sessions and certificate are delivered online.
      </p>

      <PolicyHeading>Delivery Area</PolicyHeading>
      <p>We currently ship across India.</p>

      <PolicyHeading>Dispatch &amp; Delivery Timeline</PolicyHeading>
      <p>
        Materials are dispatched in time to reach you before the Workshop begins on{" "}
        {formatStartDayLong(content)}. Orders are typically processed within a few working days of
        registration and sent via a third-party courier service. Delivery timelines may vary based
        on your location and the courier.
      </p>

      <PolicyHeading>Accurate Address</PolicyHeading>
      <p>
        Please ensure your delivery address and pincode are complete and accurate at registration.
        {" "}{BUSINESS.brand} is not responsible for delays or failed deliveries caused by an
        incorrect or incomplete address.
      </p>

      <PolicyHeading>Delivery Issues</PolicyHeading>
      <p>
        If your materials have not arrived close to the Workshop start date, please contact us at{" "}
        <a className="text-primary hover:underline" href={`mailto:${BUSINESS.email}`}>
          {BUSINESS.email}
        </a>{" "}
        and we will help track your shipment.
      </p>
    </PolicyPage>
  );
}
