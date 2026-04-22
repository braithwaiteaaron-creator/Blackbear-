import type { OrganizationMemberStatus } from "@prisma/client";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getOrganizationContextForUser } from "@/lib/organization-service";

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

export type OrganizationDashboardMetrics = {
  organization: {
    id: string;
    name: string;
    domain: string;
    subscriptionType: "team" | "enterprise";
    seatCount: number;
    createdAt: string;
  };
  members: {
    total: number;
    active: number;
    invited: number;
    suspended: number;
    admins: number;
  };
  seatUsage: {
    used: number;
    capacity: number;
    remaining: number;
    utilizationPercent: number;
  };
  assessments: {
    totalAssessments: number;
    latestGeneratedAt: string | null;
    latestReportUrl: string | null;
    currentAverages: {
      overall: number | null;
      beginner: number | null;
      intermediate: number | null;
      advanced: number | null;
    };
    topKnowledgeGaps: string[];
  };
};

function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    const parsed = Number(value.toString());
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeGapList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean)
    .slice(0, 5);
}

async function countMembersByStatus(
  organizationId: string,
  status: OrganizationMemberStatus
): Promise<number> {
  return prisma.organizationMember.count({
    where: { organizationId, status },
  });
}

export async function getOrganizationDashboardMetrics(input: {
  userEmail: string;
  userName?: string | null;
  userRole?: string | null;
  userSubscriptionTier?: "team" | "enterprise" | null;
}): Promise<ServiceResult<OrganizationDashboardMetrics>> {
  const context = await getOrganizationContextForUser({
    userEmail: input.userEmail,
    userName: input.userName,
    userRole: input.userRole,
    userSubscriptionTier: input.userSubscriptionTier,
  });
  if (!context.ok) {
    return context;
  }
  if (!context.data.organization || !context.data.seatUsage) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "No managed organization found for this account.",
        status: 404,
      },
    };
  }

  const organization = context.data.organization;
  const seatUsage = context.data.seatUsage;

  const [activeCount, invitedCount, suspendedCount, adminCount, assessmentStats] =
    await Promise.all([
      countMembersByStatus(organization.id, "active"),
      countMembersByStatus(organization.id, "invited"),
      countMembersByStatus(organization.id, "suspended"),
      prisma.organizationMember.count({
        where: {
          organizationId: organization.id,
          role: "admin",
          status: {
            in: ["active", "invited"],
          },
        },
      }),
      prisma.organizationAssessment.findMany({
        where: { organizationId: organization.id },
        orderBy: { generatedAt: "desc" },
        select: {
          id: true,
          averageScore: true,
          beginnerAvg: true,
          intermediateAvg: true,
          advancedAvg: true,
          topKnowledgeGaps: true,
          generatedAt: true,
          reportUrl: true,
        },
        take: 12,
      }),
    ]);

  const latestAssessment = assessmentStats[0] ?? null;
  const currentOverall = decimalToNumber(latestAssessment?.averageScore ?? null);
  const currentBeginner = decimalToNumber(latestAssessment?.beginnerAvg ?? null);
  const currentIntermediate = decimalToNumber(latestAssessment?.intermediateAvg ?? null);
  const currentAdvanced = decimalToNumber(latestAssessment?.advancedAvg ?? null);
  const utilizationPercent =
    seatUsage.capacity > 0 ? Math.round((seatUsage.used / seatUsage.capacity) * 100) : 0;

  return {
    ok: true,
    data: {
      organization,
      members: {
        total: context.data.members.length,
        active: activeCount,
        invited: invitedCount,
        suspended: suspendedCount,
        admins: adminCount,
      },
      seatUsage: {
        ...seatUsage,
        utilizationPercent,
      },
      assessments: {
        totalAssessments: assessmentStats.length,
        latestGeneratedAt: latestAssessment?.generatedAt.toISOString() ?? null,
        latestReportUrl: latestAssessment?.reportUrl ?? null,
        currentAverages: {
          overall: currentOverall,
          beginner: currentBeginner,
          intermediate: currentIntermediate,
          advanced: currentAdvanced,
        },
        topKnowledgeGaps: normalizeGapList(latestAssessment?.topKnowledgeGaps ?? null),
      },
    },
  };
}
