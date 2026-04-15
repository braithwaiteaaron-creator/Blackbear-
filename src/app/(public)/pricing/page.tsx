import { getPublicBillingPlans } from "@/lib/billing";
import { PricingPlans } from "@/components/pricing-plans";
import { PageShell } from "@/components/page-shell";

export default function PricingPage() {
  const plans = getPublicBillingPlans();

  return (
    <PageShell title="Pricing" description="Transparent subscription and certification pricing.">
      <PricingPlans plans={plans} />
    </PageShell>
  );
}
