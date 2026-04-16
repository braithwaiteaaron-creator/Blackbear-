"use client";

import { useMemo, useState } from "react";

import type { CertificationVerificationRecord } from "@/lib/types";

type VerificationApiResponse = {
  ok: boolean;
  data?: {
    credential: CertificationVerificationRecord;
  };
  error?: {
    message?: string;
  };
};

function formatDate(value: string | null): string {
  if (!value) {
    return "N/A";
  }
  return new Date(value).toLocaleString();
}

function normalizeVerificationCode(value: string): string {
  return value.trim().toUpperCase();
}

export function CredentialVerificationPanel() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<CertificationVerificationRecord | null>(null);

  const isSubmitDisabled = useMemo(
    () => loading || normalizeVerificationCode(code).length === 0,
    [code, loading]
  );

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = normalizeVerificationCode(code);
    if (!normalizedCode) {
      setError("Enter a verification code.");
      setCredential(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/v1/certifications/verify/${encodeURIComponent(normalizedCode)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const payload = (await response.json()) as VerificationApiResponse;
      if (!response.ok || !payload.ok || !payload.data?.credential) {
        throw new Error(payload.error?.message ?? "Credential verification failed.");
      }

      setCredential(payload.data.credential);
      setCode(normalizedCode);
    } catch (unknownError) {
      setCredential(null);
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Unexpected error while verifying credential."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Verify a credential</h2>
      <p className="mt-2 text-sm text-slate-700">
        Enter a certificate verification code to validate status, issuer, and artifact metadata.
      </p>

      <form onSubmit={handleVerify} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="CERT-EXPERT-ABC123-XYZ789"
          aria-label="Credential verification code"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      {credential ? (
        <article className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-base font-semibold text-slate-900">Verification result</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-900">Code:</span>{" "}
              <span className="font-mono">{credential.verificationCode}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-900">Tier:</span>{" "}
              <span className="capitalize">{credential.tier}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-900">Status:</span>{" "}
              <span className="capitalize">{credential.status}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-900">Holder:</span>{" "}
              {credential.holder.name}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Issued:</span>{" "}
              {formatDate(credential.issuedAt)}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Expires:</span>{" "}
              {formatDate(credential.expiresAt)}
            </p>
            <p className="md:col-span-2">
              <span className="font-semibold text-slate-900">Issuer:</span>{" "}
              {credential.issuer.name}
            </p>
          </div>
          <a
            href={credential.artifact.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open certificate PDF
          </a>
          <a
            href={credential.issuer.url}
            target="_blank"
            rel="noreferrer"
            className="ml-2 mt-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Visit issuer
          </a>
        </article>
      ) : null}
    </section>
  );
}
