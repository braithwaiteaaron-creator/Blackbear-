"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CredentialProviderSync, UserCertification } from "@/lib/types";

const DEFAULT_CERTIFICATION_PURCHASE_TIER = "advanced";

function resolveCertificationTierForPurchaseFlow(
  value: string | undefined
): "foundation" | "developing" | "advanced" | "expert" {
  return value === "foundation" ||
    value === "developing" ||
    value === "advanced" ||
    value === "expert"
    ? value
    : DEFAULT_CERTIFICATION_PURCHASE_TIER;
}

type CertificationPurchase = {
  id: string;
  certificationTier: string;
  status: string;
  amountCents: number;
  currency: string;
  completedAt: string | null;
};

type CertificationsResponse = {
  ok: boolean;
  data: {
    certifications: UserCertification[];
  };
  error?: {
    message?: string;
  };
};

type IssueCertificationResponse = {
  ok: boolean;
  data: {
    certification: UserCertification;
    sourceSessionId: string;
  };
  meta?: {
    created?: boolean;
    providerSync?: CredentialProviderSync;
  };
  error?: {
    code?: string;
    message?: string;
    details?: {
      requiredCertificationTier?: "foundation" | "developing" | "advanced" | "expert";
    };
  };
};

type PurchasesResponse = {
  ok: boolean;
  data: {
    purchases: CertificationPurchase[];
  };
  error?: {
    message?: string;
  };
};

function formatTierLabel(tier: UserCertification["tier"]): string {
  return tier
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function CertificationsPanel() {
  const [items, setItems] = useState<UserCertification[]>([]);
  const [purchases, setPurchases] = useState<CertificationPurchase[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [issueState, setIssueState] = useState<"idle" | "issuing">("idle");
  const [checkoutState, setCheckoutState] = useState<"idle" | "redirecting">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const loadCertifications = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch("/api/certifications/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json()) as CertificationsResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Unable to load certifications.");
      }

      const purchasesResponse = await fetch("/api/certifications/purchases/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      });
      const purchasesPayload = (await purchasesResponse.json()) as PurchasesResponse;
      if (!purchasesResponse.ok || !purchasesPayload.ok) {
        throw new Error(purchasesPayload.error?.message ?? "Unable to load certification purchases.");
      }

      setItems(payload.data.certifications);
      setPurchases(purchasesPayload.data.purchases);
      setLoadState("ready");
      setMessage(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error while loading certifications.";
      setMessage(errorMessage);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadCertifications();
  }, [loadCertifications]);

  const handleIssue = useCallback(async () => {
    setIssueState("issuing");
    setMessage(null);
    try {
      const response = await fetch("/api/certifications/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const payload = (await response.json()) as IssueCertificationResponse;
      if (!response.ok || !payload.ok) {
        if (response.status === 402 || payload.error?.code === "PAYMENT_REQUIRED") {
          const requiredTier = resolveCertificationTierForPurchaseFlow(
            payload.error?.details?.requiredCertificationTier
          );
          const checkoutResponse = await fetch("/api/certifications/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ certificationTier: requiredTier }),
          });
          const checkoutPayload = (await checkoutResponse.json()) as {
            ok: boolean;
            data?: { checkoutUrl?: string };
            error?: { message?: string };
          };
          if (
            checkoutResponse.ok &&
            checkoutPayload.ok &&
            checkoutPayload.data?.checkoutUrl
          ) {
            setCheckoutState("redirecting");
            window.location.assign(checkoutPayload.data.checkoutUrl);
            return;
          }
          throw new Error(
            checkoutPayload.error?.message ??
              "Certification purchase is required before issuance."
          );
        }
        throw new Error(payload.error?.message ?? "Unable to issue certification.");
      }
      setItems((current) => {
        const next = current.filter((item) => item.id !== payload.data.certification.id);
        return [payload.data.certification, ...next];
      });
      const created = payload.meta?.created !== false;
      setMessage(
        created
          ? `Certification issued from session ${payload.data.sourceSessionId.slice(0, 8)}.${
              payload.meta?.providerSync
                ? ` Provider: ${payload.meta.providerSync.provider} (${payload.meta.providerSync.status}).`
                : ""
            }`
          : "Active certification already exists for your current proficiency tier."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error while issuing certification.";
      setMessage(errorMessage);
    } finally {
      setIssueState("idle");
    }
  }, []);

  const hasCertifications = useMemo(() => items.length > 0, [items.length]);
  const hasPurchases = useMemo(() => purchases.length > 0, [purchases.length]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Certificate generation pipeline</h2>
          <p className="mt-1 text-sm text-slate-600">
            Issue a PDF certificate from your latest quiz result and keep downloadable records.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Provider integrations support mock, Credly, and Badgr modes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleIssue}
          disabled={issueState === "issuing" || checkoutState === "redirecting"}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {checkoutState === "redirecting"
            ? "Redirecting to checkout..."
            : issueState === "issuing"
              ? "Issuing..."
              : "Issue certificate from latest score"}
        </button>
      </header>

      {message ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {loadState === "loading" ? (
        <p className="text-sm text-slate-700">Loading certifications...</p>
      ) : null}

      {loadState === "error" ? (
        <div className="space-y-2">
          <p className="text-sm text-amber-800">
            Could not load certifications. Try refreshing or issue a new one.
          </p>
          <button
            type="button"
            onClick={() => void loadCertifications()}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loadState === "ready" && !hasCertifications ? (
        <p className="text-sm text-slate-700">
          No issued certificates yet. Complete a quiz session, then issue your first certificate.
        </p>
      ) : null}

      {loadState === "ready" && hasPurchases ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Certification purchases
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {purchases.slice(0, 3).map((purchase) => (
              <li key={purchase.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">
                  {purchase.certificationTier.toUpperCase()} •{" "}
                  {(purchase.amountCents / 100).toFixed(2)} {purchase.currency.toUpperCase()}
                </p>
                <p className="text-xs text-slate-600">
                  Status: {purchase.status}
                  {purchase.completedAt
                    ? ` • Completed ${new Date(purchase.completedAt).toLocaleString()}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {loadState === "ready" && hasCertifications ? (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {formatTierLabel(item.tier)} Certification
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Issued {formatDate(item.issuedAt)}
                {item.expiresAt ? ` • Expires ${formatDate(item.expiresAt)}` : ""}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Verification code: <span className="font-mono">{item.verificationCode}</span>
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Status: {item.isActive ? "Active" : "Expired"}
              </p>
              <a
                href={item.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Download PDF
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
