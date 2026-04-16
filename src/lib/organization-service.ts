import type {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationSubscriptionType,
  Prisma,
  SubscriptionTier,
} from "@prisma/client";
import { z } from "zod";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_NAME = "GitHub Mastery User";
const emailSchema = z.string().trim().email();

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  domain: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  subscriptionType: z.enum(["team", "enterprise"]).optional(),
  seatCount: z.number().int().min(1).max(5000),
  members: z
    .array(
      z.object({
        email: emailSchema,
        role: z.enum(["admin", "member"]).optional(),
      })
    )
    .max(250)
    .optional(),
});

export const provisionOrganizationMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "member"]).optional(),
});

type ServiceError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

type ServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ServiceError;
    };

export type OrganizationRecord = {
  id: string;
  name: string;
  domain: string;
  subscriptionType: "team" | "enterprise";
  seatCount: number;
  createdAt: string;
};

export type OrganizationMemberRecord = {
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

export type OrganizationSeatUsage = {
  used: number;
  capacity: number;
  remaining: number;
};

export type OrganizationContextRecord = {
  organization: OrganizationRecord | null;
  members: OrganizationMemberRecord[];
  seatUsage: OrganizationSeatUsage | null;
};

function toOrganizationRecord(input: {
  id: string;
  name: string;
  domain: string;
  subscriptionType: OrganizationSubscriptionType;
  seatCount: number;
  createdAt: Date;
}): OrganizationRecord {
  return {
    id: input.id,
    name: input.name,
    domain: input.domain,
    subscriptionType: input.subscriptionType,
    seatCount: input.seatCount,
    createdAt: input.createdAt.toISOString(),
  };
}

function toMemberRecord(input: {
  id: string;
  email: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  invitedAt: Date;
  acceptedAt: Date | null;
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
}): OrganizationMemberRecord {
  return {
    id: input.id,
    email: input.email,
    role: input.role,
    status: input.status,
    invitedAt: input.invitedAt.toISOString(),
    acceptedAt: input.acceptedAt?.toISOString() ?? null,
    user: input.user,
    invitedBy: input.invitedBy,
  };
}

function toSeatUsage(seatCount: number, used: number): OrganizationSeatUsage {
  return {
    used,
    capacity: seatCount,
    remaining: Math.max(0, seatCount - used),
  };
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase();
}

function maxSubscriptionTier(
  current: SubscriptionTier | null | undefined,
  minimum: "team" | "enterprise"
): SubscriptionTier {
  if (minimum === "enterprise") {
    return "enterprise";
  }
  if (current === "enterprise" || current === "team") {
    return current;
  }
  return "team";
}

function mapSubscriptionTypeToTier(
  subscriptionType: OrganizationSubscriptionType
): "team" | "enterprise" {
  return subscriptionType === "enterprise" ? "enterprise" : "team";
}

function uniqueProvisionMembers(
  members: Array<{ email: string; role?: "admin" | "member" }> | undefined
): Array<{ email: string; role: "admin" | "member" }> {
  const map = new Map<string, { email: string; role: "admin" | "member" }>();
  for (const member of members ?? []) {
    const email = normalizeEmail(member.email);
    map.set(email, {
      email,
      role: member.role ?? "member",
    });
  }
  return [...map.values()];
}

function memberSelect() {
  return {
    id: true,
    email: true,
    role: true,
    status: true,
    invitedAt: true,
    acceptedAt: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    invitedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  } satisfies Prisma.OrganizationMemberSelect;
}

async function getActorUser(input: { email: string; name?: string | null }) {
  const email = normalizeEmail(input.email);
  return prisma.user.upsert({
    where: { email },
    update: {
      name: input.name ?? undefined,
    },
    create: {
      email,
      name: input.name ?? DEFAULT_USER_NAME,
      subscriptionTier: "free",
    },
  });
}

async function loadOrganizationForManagedUser(userId: string) {
  return prisma.organization.findFirst({
    where: {
      OR: [
        { adminUserId: userId },
        {
          members: {
            some: {
              userId,
              role: "admin",
              status: "active",
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      domain: true,
      subscriptionType: true,
      seatCount: true,
      createdAt: true,
    },
  });
}

async function loadOrganizationOwnedByUser(adminUserId: string) {
  return prisma.organization.findFirst({
    where: { adminUserId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      domain: true,
      subscriptionType: true,
      seatCount: true,
      createdAt: true,
    },
  });
}

async function loadMembersForOrganization(input: {
  organizationId: string;
  status?: OrganizationMemberStatus;
  limit?: number;
}) {
  return prisma.organizationMember.findMany({
    where: {
      organizationId: input.organizationId,
      ...(input.status ? { status: input.status } : {}),
    },
    orderBy: [{ role: "asc" }, { invitedAt: "asc" }],
    take: input.limit,
    select: memberSelect(),
  });
}

async function countOccupiedSeats(organizationId: string): Promise<number> {
  return prisma.organizationMember.count({
    where: {
      organizationId,
      status: {
        in: ["active", "invited"],
      },
    },
  });
}

export async function getOrganizationContextForUser(input: {
  userEmail: string;
  userName?: string | null;
  userRole?: string | null;
  userSubscriptionTier?: SubscriptionTier | null;
  memberStatus?: OrganizationMemberStatus;
  limit?: number;
}): Promise<ServiceResult<OrganizationContextRecord>> {
  const actor = await getActorUser({
    email: input.userEmail,
    name: input.userName,
  });
  if (input.userRole !== "org_admin" && input.userRole !== "admin") {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Organization admin role required to access organization context.",
        status: 403,
      },
    };
  }
  if (
    input.userSubscriptionTier !== "team" &&
    input.userSubscriptionTier !== "enterprise"
  ) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Team or enterprise subscription required for organization operations.",
        status: 403,
      },
    };
  }
  const organization = await loadOrganizationForManagedUser(actor.id);
  if (!organization) {
    return {
      ok: true,
      data: {
        organization: null,
        members: [],
        seatUsage: null,
      },
    };
  }
  const [members, usedSeats] = await Promise.all([
    loadMembersForOrganization({
      organizationId: organization.id,
      status: input.memberStatus,
      limit: input.limit,
    }),
    countOccupiedSeats(organization.id),
  ]);
  return {
    ok: true,
    data: {
      organization: toOrganizationRecord(organization),
      members: members.map((member) => toMemberRecord(member)),
      seatUsage: toSeatUsage(organization.seatCount, usedSeats),
    },
  };
}

export async function createOrganizationWithMembers(input: {
  userEmail: string;
  userName?: string | null;
  userRole?: string | null;
  userSubscriptionTier?: SubscriptionTier | null;
  payload: z.infer<typeof createOrganizationSchema>;
}): Promise<ServiceResult<OrganizationContextRecord>> {
  if (input.userRole !== "org_admin" && input.userRole !== "admin") {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Organization admin role required to create an organization.",
        status: 403,
      },
    };
  }
  if (
    input.userSubscriptionTier !== "team" &&
    input.userSubscriptionTier !== "enterprise"
  ) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Team or enterprise subscription required to create an organization.",
        status: 403,
      },
    };
  }

  const actor = await getActorUser({
    email: input.userEmail,
    name: input.userName,
  });

  const normalizedDomain = normalizeDomain(input.payload.domain);
  const existingDomain = await prisma.organization.findUnique({
    where: { domain: normalizedDomain },
    select: { id: true, name: true },
  });
  if (existingDomain) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "An organization with this domain already exists.",
        status: 409,
        details: { domain: normalizedDomain },
      },
    };
  }

  const existingOwnedOrganization = await loadOrganizationOwnedByUser(actor.id);
  if (existingOwnedOrganization) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "You already manage an organization. Use member provisioning instead.",
        status: 409,
        details: {
          organizationId: existingOwnedOrganization.id,
        },
      },
    };
  }

  const provisionMembers = uniqueProvisionMembers(input.payload.members).filter(
    (member) => member.email !== normalizeEmail(actor.email)
  );
  if (provisionMembers.length + 1 > input.payload.seatCount) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Seat count must cover admin plus all provisioned members.",
        status: 400,
        details: {
          requiredSeats: provisionMembers.length + 1,
          providedSeatCount: input.payload.seatCount,
        },
      },
    };
  }

  const subscriptionType = input.payload.subscriptionType ?? "team";
  const minTier = mapSubscriptionTypeToTier(subscriptionType);
  const now = new Date();
  const resolvedRole = input.userRole === "admin" ? "admin" : "org_admin";

  const created = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: input.payload.name.trim(),
        domain: normalizedDomain,
        subscriptionType,
        seatCount: input.payload.seatCount,
        adminUserId: actor.id,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        subscriptionType: true,
        seatCount: true,
        createdAt: true,
      },
    });

    await tx.user.update({
      where: { id: actor.id },
      data: {
        organization: organization.name,
        role: resolvedRole,
        subscriptionTier: maxSubscriptionTier(
          input.userSubscriptionTier ?? actor.subscriptionTier,
          minTier
        ),
      },
    });

    await tx.organizationMember.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: normalizeEmail(actor.email),
        },
      },
      update: {
        userId: actor.id,
        role: "admin",
        status: "active",
        acceptedAt: now,
      },
      create: {
        organizationId: organization.id,
        email: normalizeEmail(actor.email),
        userId: actor.id,
        role: "admin",
        status: "active",
        invitedByUserId: actor.id,
        invitedAt: now,
        acceptedAt: now,
      },
    });

    for (const member of provisionMembers) {
      const existingUser = await tx.user.findUnique({
        where: { email: member.email },
        select: {
          id: true,
          subscriptionTier: true,
        },
      });
      const status: OrganizationMemberStatus = existingUser ? "active" : "invited";
      await tx.organizationMember.upsert({
        where: {
          organizationId_email: {
            organizationId: organization.id,
            email: member.email,
          },
        },
        update: {
          role: member.role,
          userId: existingUser?.id ?? null,
          status,
          invitedByUserId: actor.id,
          invitedAt: now,
          acceptedAt: existingUser ? now : null,
        },
        create: {
          organizationId: organization.id,
          email: member.email,
          role: member.role,
          userId: existingUser?.id ?? null,
          status,
          invitedByUserId: actor.id,
          invitedAt: now,
          acceptedAt: existingUser ? now : null,
        },
      });

      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            organization: organization.name,
            subscriptionTier: maxSubscriptionTier(existingUser.subscriptionTier, minTier),
          },
        });
      }
    }

    const members = await tx.organizationMember.findMany({
      where: { organizationId: organization.id },
      orderBy: [{ role: "asc" }, { invitedAt: "asc" }],
      select: memberSelect(),
    });
    const occupiedSeatCount = members.filter(
      (member) => member.status === "active" || member.status === "invited"
    ).length;

    return {
      organization,
      members,
      occupiedSeatCount,
    };
  });

  return {
    ok: true,
    data: {
      organization: toOrganizationRecord(created.organization),
      members: created.members.map((member) => toMemberRecord(member)),
      seatUsage: toSeatUsage(created.organization.seatCount, created.occupiedSeatCount),
    },
  };
}

export async function provisionOrganizationMemberForUser(input: {
  userEmail: string;
  userName?: string | null;
  userRole?: string | null;
  payload: z.infer<typeof provisionOrganizationMemberSchema>;
}): Promise<ServiceResult<OrganizationContextRecord>> {
  if (input.userRole !== "org_admin" && input.userRole !== "admin") {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Organization admin role required to provision members.",
        status: 403,
      },
    };
  }

  const actor = await getActorUser({
    email: input.userEmail,
    name: input.userName,
  });
  const organization = await loadOrganizationForManagedUser(actor.id);
  if (!organization) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "Create an organization before provisioning members.",
        status: 404,
      },
    };
  }

  const memberEmail = normalizeEmail(input.payload.email);
  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: memberEmail,
      },
    },
    select: { id: true },
  });

  if (!existingMembership) {
    const usedSeats = await countOccupiedSeats(organization.id);
    if (usedSeats >= organization.seatCount) {
      return {
        ok: false,
        error: {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: "No available seats remain for additional members.",
          status: 409,
          details: {
            seatCount: organization.seatCount,
            usedSeats,
          },
        },
      };
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: memberEmail },
    select: {
      id: true,
      subscriptionTier: true,
    },
  });
  const status: OrganizationMemberStatus = existingUser ? "active" : "invited";
  const now = new Date();
  const minTier = mapSubscriptionTypeToTier(organization.subscriptionType);

  await prisma.$transaction(async (tx) => {
    await tx.organizationMember.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: memberEmail,
        },
      },
      update: {
        role: input.payload.role ?? "member",
        status,
        userId: existingUser?.id ?? null,
        invitedByUserId: actor.id,
        invitedAt: now,
        acceptedAt: existingUser ? now : null,
      },
      create: {
        organizationId: organization.id,
        email: memberEmail,
        role: input.payload.role ?? "member",
        status,
        userId: existingUser?.id ?? null,
        invitedByUserId: actor.id,
        invitedAt: now,
        acceptedAt: existingUser ? now : null,
      },
    });

    if (existingUser) {
      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          organization: organization.name,
          subscriptionTier: maxSubscriptionTier(existingUser.subscriptionTier, minTier),
        },
      });
    }
  });

  const [members, usedSeats] = await Promise.all([
    loadMembersForOrganization({ organizationId: organization.id }),
    countOccupiedSeats(organization.id),
  ]);

  return {
    ok: true,
    data: {
      organization: toOrganizationRecord(organization),
      members: members.map((member) => toMemberRecord(member)),
      seatUsage: toSeatUsage(organization.seatCount, usedSeats),
    },
  };
}
