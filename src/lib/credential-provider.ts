import { randomUUID } from "node:crypto";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { env, getCredentialProvider } from "@/lib/env";
import type {
  CredentialProviderName,
  CredentialProviderSync,
  CredentialProviderSyncStatus,
} from "@/lib/types";

type ProviderError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

type SyncInput = {
  verificationCode: string;
  tier: string;
  holderName: string;
  issuedAt: Date;
  expiresAt: Date | null;
  certificateUrl: string;
};

type SyncSuccess = {
  ok: true;
  data: CredentialProviderSync;
};

type SyncFailure = {
  ok: false;
  error: ProviderError;
};

function buildSyncRecord(input: {
  provider: CredentialProviderName;
  status: CredentialProviderSyncStatus;
  message: string;
  externalCredentialId?: string | null;
  externalUrl?: string | null;
}): CredentialProviderSync {
  return {
    provider: input.provider,
    status: input.status,
    syncedAt: new Date().toISOString(),
    externalCredentialId: input.externalCredentialId ?? null,
    externalUrl: input.externalUrl ?? null,
    message: input.message,
  };
}

async function syncMockCredential(input: SyncInput): Promise<SyncSuccess> {
  const externalCredentialId = `mock-${randomUUID()}`;
  return {
    ok: true,
    data: buildSyncRecord({
      provider: "mock",
      status: "synced",
      message: "Mock credential provider sync completed.",
      externalCredentialId,
      externalUrl: input.certificateUrl,
    }),
  };
}

function hasCredlyConfig() {
  return Boolean(env.CREDLY_API_TOKEN && env.CREDLY_ORGANIZATION_ID);
}

function hasBadgrConfig() {
  return Boolean(env.BADGR_API_TOKEN && env.BADGR_ISSUER_ID);
}

async function syncCredlyCredential(input: SyncInput): Promise<SyncSuccess | SyncFailure> {
  if (!hasCredlyConfig()) {
    return {
      ok: true,
      data: buildSyncRecord({
        provider: "credly",
        status: "skipped",
        message: "Credly provider selected but not configured; sync skipped.",
      }),
    };
  }

  // Step 64 integration scaffold: once API contract is finalized, replace this
  // simulated sync object with a real Credly API create credential call.
  return {
    ok: true,
    data: buildSyncRecord({
      provider: "credly",
      status: "synced",
      message: "Credly provider sync simulated successfully.",
      externalCredentialId: `credly-${randomUUID()}`,
      externalUrl: input.certificateUrl,
    }),
  };
}

async function syncBadgrCredential(input: SyncInput): Promise<SyncSuccess | SyncFailure> {
  if (!hasBadgrConfig()) {
    return {
      ok: true,
      data: buildSyncRecord({
        provider: "badgr",
        status: "skipped",
        message: "Badgr provider selected but not configured; sync skipped.",
      }),
    };
  }

  // Step 64 integration scaffold: once API contract is finalized, replace this
  // simulated sync object with a real Badgr API create assertion call.
  return {
    ok: true,
    data: buildSyncRecord({
      provider: "badgr",
      status: "synced",
      message: "Badgr provider sync simulated successfully.",
      externalCredentialId: `badgr-${randomUUID()}`,
      externalUrl: input.certificateUrl,
    }),
  };
}

export async function syncIssuedCredential(input: SyncInput): Promise<SyncSuccess | SyncFailure> {
  const provider = getCredentialProvider();

  try {
    if (provider === "mock") {
      return await syncMockCredential(input);
    }
    if (provider === "credly") {
      return await syncCredlyCredential(input);
    }
    return await syncBadgrCredential(input);
  } catch (error) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Credential provider sync failed.",
        status: 500,
        details: error instanceof Error ? error.message : "Unknown sync failure",
      },
    };
  }
}
