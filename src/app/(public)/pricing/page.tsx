import { PageShell } from "@/components/page-shell";

const subscriptionTiers = [
  { name: "Free", price: "$0", details: "Beginner quiz and foundational library access." },
  { name: "Premium", price: "$19/mo", details: "Full assessment, analytics, badges, and complete library." },
  { name: "Team", price: "$199/mo", details: "Premium for 25 members with team dashboards." },
  { name: "Enterprise", price: "Custom", details: "Unlimited seats, SSO, and advanced reporting." },
];

export default function PricingPage() {
  return (
    <PageShell title="Pricing" description="Transparent subscription and certification pricing.">
      <div style={{ display: "grid", gap: "1rem" }}>
        {subscriptionTiers.map((tier) => (
          <article
            key={tier.name}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "1rem",
              background: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{tier.name}</h3>
            <p style={{ marginBottom: ".25rem", fontWeight: 700 }}>{tier.price}</p>
            <p style={{ margin: 0, color: "#475569" }}>{tier.details}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
