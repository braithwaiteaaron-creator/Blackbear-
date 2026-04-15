"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type PricingTier = {
  name: "Free" | "Premium" | "Team" | "Enterprise";
  price: string;
  details: string;
};

type CheckoutApiResponse = {
  ok: true;
  data: {
    checkoutUrl: string;
  };
};

const SUBSCRIPTION_TIERS: PricingTier[] = [
  { name: "Free", price: "$0", details: "Beginner quiz and foundational library access." },
  {
    name: "Premium",
    price: "$19/mo",
    details: "Full assessment, analytics, badges, and complete library.",
  },
  { name: "Team", price: "$199/mo", details: "Premium for 25 members with team dashboards." },
  { name: "Enterprise", price: "Custom", details: "Unlimited seats, SSO, and advanced reporting." },
];

export function PricingPlans() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStartCheckout = status === "authenticated" && Boolean(session?.user?.email);

  const startPremiumCheckout = async () => {
    setError(null);
    if (!canStartCheckout || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: "premium",
        }),
      });

      const payload = (await response.json()) as
        | CheckoutApiResponse
        | { ok: false; error?: { message?: string } };

      if (!response.ok || !payload.ok) {
        setError(payload.ok ? "Unable to start checkout." : payload.error?.message ?? "Unable to start checkout.");
        return;
      }

      window.location.assign(payload.data.checkoutUrl);
    } catch {
      setError("Unable to start checkout right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {SUBSCRIPTION_TIERS.map((tier) => {
        const isPremium = tier.name === "Premium";

        return (
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

            {isPremium ? (
              <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                <button
                  disabled={!canStartCheckout || isSubmitting}
                  onClick={startPremiumCheckout}
                  style={{
                    cursor: canStartCheckout && !isSubmitting ? "pointer" : "not-allowed",
                    borderRadius: 8,
                    border: "1px solid #1d4ed8",
                    background: canStartCheckout && !isSubmitting ? "#1d4ed8" : "#93c5fd",
                    color: "#fff",
                    fontWeight: 600,
                    padding: "0.5rem 0.75rem",
                  }}
                  type="button"
                >
                  {isSubmitting ? "Redirecting..." : "Upgrade to Premium"}
                </button>
                {!canStartCheckout ? (
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
                    Sign in to start Premium checkout.
                  </p>
                ) : null}
                {error ? (
                  <p style={{ margin: 0, color: "#b91c1c", fontSize: "0.875rem" }}>{error}</p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
