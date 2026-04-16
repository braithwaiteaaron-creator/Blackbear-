"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AdminCertificationRecord = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  tier: "foundation" | "developing" | "advanced" | "expert";
  issuedAt: string;
  expiresAt: string | null;
  verificationCode: string;
  certificateUrl: string;
  status: "active" | "revoked" | "expired";
};

type ListCertificationsResponse = {
  ok: boolean;
  data?: {
    certifications: AdminCertificationRecord[];
  };
  error?: {
    message?: string;
  };
};

type ApiErrorPayload = {
  ok: false;
  error?: {
    message?: string;
  };
};

type ReissueResponse = {
  ok: boolean;
  data?: {
    certification: {
      verificationCode: string;
    };
    sourceSessionId: string | null;
  };
  meta?: {
    providerSync?: {
      provider: "mock" | "credly" | "badgr";
      status: "synced" | "skipped" | "failed";
    } | null;
  };
  error?: {
    message?: string;
  };
};

const CERTIFICATION_TIERS: Array<AdminCertificationRecord["tier"]> = [
  "foundation",
  "developing",
  "advanced",
  "expert",
];

function toTierLabel(value: AdminCertificationRecord["tier"]): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AdminCertificationControls() {
  const [certifications, setCertifications] = useState<AdminCertificationRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [reissuing, setReissuing] = useState(false);
  const [reissueEmail, setReissueEmail] = useState("");
  const [reissueTier, setReissueTier] = useState<AdminCertificationRecord["tier"]>("advanced");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCertifications = useCallback(async () => {
    setLoadState((prev) => (prev === "loading" ? "loading" : "ready"));
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/certifications?limit=100", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json()) as ListCertificationsResponse;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Unable to load certifications.");
      }
      setCertifications(payload.data.certifications);
      setLoadState("ready");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "Unable to load certifications.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCertifications();
  }, [loadCertifications]);

  const handleRevoke = useCallback(
    async (certificationId: string) => {
      setRevokingId(certificationId);
      setMessage(null);
      try {
        const response = await fetch(`/api/admin/certifications/${certificationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason: "Revoked by admin control panel" }),
        });
        if (!response.ok) {
          const payload = (await response.json()) as ApiErrorPayload;
          throw new Error(payload.error?.message ?? "Unable to revoke certification.");
        }
        setMessage("Certification revoked.");
        await loadCertifications();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to revoke certification.");
      } finally {
        setRevokingId(null);
      }
    },
    [loadCertifications]
  );

  const handleReissue = useCallback(async () => {
    if (!reissueEmail.trim()) {
      setMessage("Target user email is required for reissue.");
      return;
    }
    setReissuing(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/certifications/reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetUserEmail: reissueEmail.trim(),
          certificationTier: reissueTier,
          reason: "Reissued by admin control panel",
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as ApiErrorPayload;
        throw new Error(payload.error?.message ?? "Unable to reissue certification.");
      }
      setMessage(`Certification reissued for ${reissueEmail.trim()}.`);
      await loadCertifications();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reissue certification.");
    } finally {
      setReissuing(false);
    }
  }, [loadCertifications, reissueEmail, reissueTier]);

  const filteredCertifications = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) {
      return certifications;
    }
    return certifications.filter((certification) => {
      return (
        certification.userEmail.toLowerCase().includes(needle) ||
        (certification.userName ?? "").toLowerCase().includes(needle) ||
        certification.verificationCode.toLowerCase().includes(needle)
      );
    });
  }, [certifications, searchQuery]);

  const hasCertifications = certifications.length > 0;

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Certification revoke/reissue controls</h2>
          <p className="mt-1 text-sm text-slate-600">
            Admin-only controls to revoke active credentials and issue replacement credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadCertifications()}
          disabled={isRefreshing}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Reissue certification
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
          <input
            type="email"
            value={reissueEmail}
            onChange={(event) => setReissueEmail(event.target.value)}
            placeholder="learner@example.com"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2"
          />
          <select
            value={reissueTier}
            onChange={(event) => setReissueTier(event.target.value as AdminCertificationRecord["tier"])}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2"
          >
            {CERTIFICATION_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {toTierLabel(tier)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleReissue()}
            disabled={reissuing}
            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {reissuing ? "Reissuing..." : "Reissue"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-semibold uppercase tracking-wide text-slate-600" htmlFor="cert-search">
          Search certifications
        </label>
        <input
          id="cert-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Filter by user email, name, or verification code"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2"
        />
      </section>

      {message ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {loadState === "loading" ? <p className="text-sm text-slate-700">Loading certifications...</p> : null}
      {loadState === "error" ? (
        <p className="text-sm text-amber-700">
          Unable to load certification records. Refresh and try again.
        </p>
      ) : null}

      {loadState === "ready" && !hasCertifications ? (
        <p className="text-sm text-slate-700">No certification records found.</p>
      ) : null}

      {loadState === "ready" && hasCertifications && filteredCertifications.length === 0 ? (
        <p className="text-sm text-slate-700">No certification records match your search.</p>
      ) : null}

      {loadState === "ready" && filteredCertifications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">User</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Tier</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Issued</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Verification</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCertifications.map((certification) => (
                <tr key={certification.id}>
                  <td className="px-3 py-2 text-slate-800">
                    <p className="font-semibold">{certification.userName || certification.userEmail}</p>
                    <p className="text-xs text-slate-500">{certification.userEmail}</p>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{toTierLabel(certification.tier)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        certification.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : certification.status === "revoked"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {certification.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {new Date(certification.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-slate-700">
                    {certification.verificationCode}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {certification.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => void handleRevoke(certification.id)}
                        disabled={revokingId === certification.id}
                        className="inline-flex items-center rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
                      >
                        {revokingId === certification.id ? "Revoking..." : "Revoke"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
