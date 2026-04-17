"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrganizationRecord = {
  id: string;
  name: string;
  domain: string;
  subscriptionType: "team" | "enterprise";
  seatCount: number;
  createdAt: string;
};

type OrganizationMemberRecord = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "invited" | "active" | "suspended";
  invitedAt: string;
  acceptedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type OrganizationSeatUsage = {
  used: number;
  capacity: number;
  remaining: number;
};

type OrganizationContext = {
  organization: OrganizationRecord | null;
  members: OrganizationMemberRecord[];
  seatUsage: OrganizationSeatUsage | null;
};

type OrganizationContextResponse = {
  ok: boolean;
  data?: OrganizationContext;
  error?: {
    message?: string;
  };
};

type CreateOrganizationPayload = {
  name: string;
  domain: string;
  subscriptionType: "team" | "enterprise";
  seatCount: number;
};

type ProvisionMemberPayload = {
  email: string;
  role: "admin" | "member";
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function OrgMembersControls() {
  const [context, setContext] = useState<OrganizationContext | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  const [creatingOrg, setCreatingOrg] = useState(false);
  const [provisioningMember, setProvisioningMember] = useState(false);

  const [orgForm, setOrgForm] = useState<CreateOrganizationPayload>({
    name: "",
    domain: "",
    subscriptionType: "team",
    seatCount: 10,
  });
  const [memberForm, setMemberForm] = useState<ProvisionMemberPayload>({
    email: "",
    role: "member",
  });

  const loadContext = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch("/api/org/organizations", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const payload = (await response.json()) as OrganizationContextResponse;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Unable to load organization context.");
      }
      setContext(payload.data);
      setLoadState("ready");
      setMessage(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error while loading organization data.";
      setMessage(errorMessage);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const hasOrganization = useMemo(() => Boolean(context?.organization), [context?.organization]);
  const members = context?.members ?? [];
  const seatUsage = context?.seatUsage;

  const handleCreateOrganization = useCallback(async () => {
    setCreatingOrg(true);
    setMessage(null);
    try {
      const response = await fetch("/api/org/organizations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm),
      });
      const payload = (await response.json()) as OrganizationContextResponse;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Unable to create organization.");
      }
      setContext(payload.data);
      setMessage("Organization created. You can now provision members.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error while creating organization.";
      setMessage(errorMessage);
    } finally {
      setCreatingOrg(false);
    }
  }, [orgForm]);

  const handleProvisionMember = useCallback(async () => {
    setProvisioningMember(true);
    setMessage(null);
    try {
      const response = await fetch("/api/org/members", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });
      const payload = (await response.json()) as OrganizationContextResponse;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Unable to provision organization member.");
      }
      setContext(payload.data);
      setMemberForm((current) => ({ ...current, email: "" }));
      setMessage("Member provisioned successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error while provisioning member.";
      setMessage(errorMessage);
    } finally {
      setProvisioningMember(false);
    }
  }, [memberForm]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Organization provisioning</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create your organization workspace and provision member seats.
        </p>
      </header>

      {message ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {loadState === "loading" ? <p className="text-sm text-slate-700">Loading organization...</p> : null}

      {loadState === "error" ? (
        <div className="space-y-2">
          <p className="text-sm text-amber-800">
            Could not load organization context. Try again.
          </p>
          <button
            type="button"
            onClick={() => void loadContext()}
            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loadState === "ready" && !hasOrganization ? (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-base font-semibold text-slate-900">Create organization</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Organization name</span>
              <input
                type="text"
                value={orgForm.name}
                onChange={(event) =>
                  setOrgForm((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Acme Engineering"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Domain</span>
              <input
                type="text"
                value={orgForm.domain}
                onChange={(event) =>
                  setOrgForm((current) => ({ ...current, domain: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="acme.com"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Subscription type</span>
              <select
                value={orgForm.subscriptionType}
                onChange={(event) =>
                  setOrgForm((current) => ({
                    ...current,
                    subscriptionType: event.target.value as "team" | "enterprise",
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="team">Team</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Seat count</span>
              <input
                type="number"
                min={1}
                max={5000}
                value={orgForm.seatCount}
                onChange={(event) =>
                  setOrgForm((current) => ({
                    ...current,
                    seatCount: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => void handleCreateOrganization()}
            disabled={creatingOrg}
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {creatingOrg ? "Creating organization..." : "Create organization"}
          </button>
        </section>
      ) : null}

      {loadState === "ready" && hasOrganization && context?.organization ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-900">{context.organization.name}</h3>
            <p className="mt-1 text-sm text-slate-700">
              {context.organization.domain} • {context.organization.subscriptionType.toUpperCase()} •
              Created {formatDate(context.organization.createdAt)}
            </p>
            {seatUsage ? (
              <p className="mt-1 text-sm text-slate-700">
                Seats used: {seatUsage.used}/{seatUsage.capacity} (remaining {seatUsage.remaining})
              </p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-900">Provision member</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Member email</span>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(event) =>
                    setMemberForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="developer@acme.com"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Role</span>
                <select
                  value={memberForm.role}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      role: event.target.value as "admin" | "member",
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => void handleProvisionMember()}
              disabled={provisioningMember}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {provisioningMember ? "Provisioning..." : "Provision member"}
            </button>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-900">Current members</h3>
            {members.length === 0 ? (
              <p className="mt-2 text-sm text-slate-700">No members provisioned yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    <p className="font-semibold text-slate-900">
                      {member.email} • {member.role.toUpperCase()} • {member.status.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-600">
                      Invited {formatDate(member.invitedAt)}
                      {member.acceptedAt ? ` • Accepted ${formatDate(member.acceptedAt)}` : ""}
                      {member.invitedBy ? ` • Invited by ${member.invitedBy.email}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
