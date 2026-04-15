import type { BillingSubscriptionStatus, Prisma } from "@prisma/client";

import { env } from "@/lib/env";
import { getPlanIdByPriceId, getPlanPrice } from "@/lib/billing/plans";
import { prisma } from "@/lib/prisma";
import type { BillingPlanId } from "@/lib/types";

type FinanceReportWindow = {
  from?: Date;
  to?: Date;
};

export type FinanceWindowPreset = "all" | "last_30_days" | "quarter_to_date" | "year_to_date";

const FINANCE_WINDOW_PRESETS: FinanceWindowPreset[] = [
  "all",
  "last_30_days",
  "quarter_to_date",
  "year_to_date",
];

type ResolvedPlanPrice = {
  planId: BillingPlanId | "unknown";
  interval: "month" | "year" | "custom" | "unknown";
  amountCents: number | null;
};

export type FinanceSummary = {
  generatedAt: string;
  window: {
    from: string | null;
    to: string | null;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    pastDue: number;
    canceled: number;
    unpaid: number;
    incomplete: number;
    incompleteExpired: number;
  };
  customers: {
    total: number;
    active: number;
  };
  recurringRevenue: {
    currency: "usd";
    monthlyCents: number;
    annualRunRateCents: number;
  };
  planBreakdown: Array<{
    planId: BillingPlanId | "unknown";
    subscriptions: number;
    activeSubscriptions: number;
    monthlyRevenueCents: number;
  }>;
};

type FinanceExportRow = {
  subscription_id: string;
  user_email: string;
  provider: string;
  plan_id: string;
  plan_code: string;
  interval: string;
  billing_amount_usd: string;
  estimated_mrr_usd: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: string;
  created_at: string;
  updated_at: string;
};

const REVENUE_ACTIVE_STATUSES: BillingSubscriptionStatus[] = ["active", "past_due"];
const ACTIVE_CUSTOMER_STATUSES: BillingSubscriptionStatus[] = ["active", "trialing", "past_due"];

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getQuarterStart(now: Date): Date {
  const quarterMonth = Math.floor(now.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(now.getUTCFullYear(), quarterMonth, 1));
}

function getYearStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
}

export function isFinanceWindowPreset(value: string): value is FinanceWindowPreset {
  return FINANCE_WINDOW_PRESETS.includes(value as FinanceWindowPreset);
}

export function getFinanceWindowFromPreset(
  preset: FinanceWindowPreset,
  now = new Date()
): FinanceReportWindow {
  if (preset === "last_30_days") {
    const today = startOfUtcDay(now);
    return {
      from: addDays(today, -30),
      to: now,
    };
  }
  if (preset === "quarter_to_date") {
    return {
      from: getQuarterStart(now),
      to: now,
    };
  }
  if (preset === "year_to_date") {
    return {
      from: getYearStart(now),
      to: now,
    };
  }
  return {};
}

function parseDateInput(value: string): Date | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function resolveFinanceWindow(input: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}): {
  ok: true;
  window: FinanceReportWindow;
  preset: FinanceWindowPreset | "custom";
} | {
  ok: false;
  error: string;
} {
  const fromRaw = input.from?.trim();
  const toRaw = input.to?.trim();
  const hasExplicitWindow = Boolean(fromRaw || toRaw);

  if (hasExplicitWindow) {
    const fromDate = fromRaw ? parseDateInput(fromRaw) : undefined;
    const toDate = toRaw ? parseDateInput(toRaw) : undefined;
    if ((fromRaw && !fromDate) || (toRaw && !toDate)) {
      return {
        ok: false,
        error: "Invalid date range. Use ISO-8601 date values for from/to.",
      };
    }
    if (fromDate && toDate && fromDate > toDate) {
      return {
        ok: false,
        error: "Invalid date range. `from` must be before or equal to `to`.",
      };
    }
    return {
      ok: true,
      window: {
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
      },
      preset: "custom",
    };
  }

  const requestedPreset = input.preset?.trim() ?? "all";
  if (!isFinanceWindowPreset(requestedPreset)) {
    return {
      ok: false,
      error:
        "Invalid preset. Expected one of: all, last_30_days, quarter_to_date, year_to_date.",
    };
  }

  return {
    ok: true,
    window: getFinanceWindowFromPreset(requestedPreset),
    preset: requestedPreset,
  };
}

function buildWindowWhere(window: FinanceReportWindow): Prisma.BillingSubscriptionWhereInput {
  if (!window.from && !window.to) {
    return {};
  }

  return {
    createdAt: {
      ...(window.from ? { gte: window.from } : {}),
      ...(window.to ? { lte: window.to } : {}),
    },
  };
}

function resolvePlanPrice(planCode: string): ResolvedPlanPrice {
  const knownPlan = getPlanIdByPriceId(planCode);
  if (knownPlan === "premium" || knownPlan === "team") {
    const monthly = getPlanPrice(knownPlan, "month");
    const yearly = getPlanPrice(knownPlan, "year");
    if (monthly?.priceId === planCode) {
      return {
        planId: knownPlan,
        interval: "month",
        amountCents: monthly.amount,
      };
    }
    if (yearly?.priceId === planCode) {
      return {
        planId: knownPlan,
        interval: "year",
        amountCents: yearly.amount,
      };
    }
  }

  const normalized = planCode.toLowerCase();
  if (env.STRIPE_PRICE_ENTERPRISE_MONTHLY === planCode || normalized.includes("enterprise")) {
    return {
      planId: "enterprise",
      interval: "custom",
      amountCents: null,
    };
  }
  if (normalized.includes("team")) {
    return {
      planId: "team",
      interval: "unknown",
      amountCents: getPlanPrice("team", "month")?.amount ?? null,
    };
  }
  if (normalized.includes("premium")) {
    return {
      planId: "premium",
      interval: "unknown",
      amountCents: getPlanPrice("premium", "month")?.amount ?? null,
    };
  }

  return {
    planId: "unknown",
    interval: "unknown",
    amountCents: null,
  };
}

function estimateMonthlyRevenueCents(
  amountCents: number | null,
  interval: ResolvedPlanPrice["interval"]
): number {
  if (amountCents === null) {
    return 0;
  }
  if (interval === "year") {
    return Math.round(amountCents / 12);
  }
  return amountCents;
}

function centsToUsdString(value: number): string {
  return (value / 100).toFixed(2);
}

function toIso(value: Date): string {
  return value.toISOString();
}

export async function getFinanceSummary(window: FinanceReportWindow = {}): Promise<FinanceSummary> {
  const subscriptions = await prisma.billingSubscription.findMany({
    where: buildWindowWhere(window),
    select: {
      planCode: true,
      status: true,
      providerCustomerId: true,
    },
  });

  let monthlyRevenueCents = 0;
  const totalCustomers = new Set<string>();
  const activeCustomers = new Set<string>();
  const planBreakdown = new Map<
    BillingPlanId | "unknown",
    {
      planId: BillingPlanId | "unknown";
      subscriptions: number;
      activeSubscriptions: number;
      monthlyRevenueCents: number;
    }
  >();

  const counts: FinanceSummary["subscriptions"] = {
    total: subscriptions.length,
    active: 0,
    trialing: 0,
    pastDue: 0,
    canceled: 0,
    unpaid: 0,
    incomplete: 0,
    incompleteExpired: 0,
  };

  for (const subscription of subscriptions) {
    totalCustomers.add(subscription.providerCustomerId);
    if (ACTIVE_CUSTOMER_STATUSES.includes(subscription.status)) {
      activeCustomers.add(subscription.providerCustomerId);
    }

    if (subscription.status === "active") {
      counts.active += 1;
    } else if (subscription.status === "trialing") {
      counts.trialing += 1;
    } else if (subscription.status === "past_due") {
      counts.pastDue += 1;
    } else if (subscription.status === "canceled") {
      counts.canceled += 1;
    } else if (subscription.status === "unpaid") {
      counts.unpaid += 1;
    } else if (subscription.status === "incomplete") {
      counts.incomplete += 1;
    } else if (subscription.status === "incomplete_expired") {
      counts.incompleteExpired += 1;
    }

    const resolvedPlan = resolvePlanPrice(subscription.planCode);
    const estimatedMrr = REVENUE_ACTIVE_STATUSES.includes(subscription.status)
      ? estimateMonthlyRevenueCents(resolvedPlan.amountCents, resolvedPlan.interval)
      : 0;

    monthlyRevenueCents += estimatedMrr;

    const existing = planBreakdown.get(resolvedPlan.planId);
    if (existing) {
      existing.subscriptions += 1;
      if (REVENUE_ACTIVE_STATUSES.includes(subscription.status)) {
        existing.activeSubscriptions += 1;
      }
      existing.monthlyRevenueCents += estimatedMrr;
      continue;
    }

    planBreakdown.set(resolvedPlan.planId, {
      planId: resolvedPlan.planId,
      subscriptions: 1,
      activeSubscriptions: REVENUE_ACTIVE_STATUSES.includes(subscription.status) ? 1 : 0,
      monthlyRevenueCents: estimatedMrr,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    window: {
      from: window.from ? toIso(window.from) : null,
      to: window.to ? toIso(window.to) : null,
    },
    subscriptions: counts,
    customers: {
      total: totalCustomers.size,
      active: activeCustomers.size,
    },
    recurringRevenue: {
      currency: "usd",
      monthlyCents: monthlyRevenueCents,
      annualRunRateCents: monthlyRevenueCents * 12,
    },
    planBreakdown: Array.from(planBreakdown.values()).sort((a, b) => {
      if (a.monthlyRevenueCents === b.monthlyRevenueCents) {
        return b.subscriptions - a.subscriptions;
      }
      return b.monthlyRevenueCents - a.monthlyRevenueCents;
    }),
  };
}

function toCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function buildCsv(rows: FinanceExportRow[]): string {
  const headers = [
    "subscription_id",
    "user_email",
    "provider",
    "plan_id",
    "plan_code",
    "interval",
    "billing_amount_usd",
    "estimated_mrr_usd",
    "status",
    "current_period_start",
    "current_period_end",
    "cancel_at_period_end",
    "created_at",
    "updated_at",
  ] as const;

  const lines = rows.map((row) =>
    headers.map((header) => toCsvCell(row[header])).join(",")
  );
  return `${headers.join(",")}\n${lines.join("\n")}`;
}

export async function getFinanceExportCsv(window: FinanceReportWindow = {}): Promise<{
  filename: string;
  rowCount: number;
  csv: string;
}> {
  const subscriptions = await prisma.billingSubscription.findMany({
    where: buildWindowWhere(window),
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      provider: true,
      planCode: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const rows: FinanceExportRow[] = subscriptions.map((subscription) => {
    const resolvedPlan = resolvePlanPrice(subscription.planCode);
    const amountCents = resolvedPlan.amountCents;
    const estimatedMrr = estimateMonthlyRevenueCents(amountCents, resolvedPlan.interval);

    return {
      subscription_id: subscription.id,
      user_email: subscription.user.email,
      provider: subscription.provider,
      plan_id: resolvedPlan.planId,
      plan_code: subscription.planCode,
      interval: resolvedPlan.interval,
      billing_amount_usd: amountCents === null ? "" : centsToUsdString(amountCents),
      estimated_mrr_usd: centsToUsdString(estimatedMrr),
      status: subscription.status,
      current_period_start: subscription.currentPeriodStart.toISOString(),
      current_period_end: subscription.currentPeriodEnd.toISOString(),
      cancel_at_period_end: String(subscription.cancelAtPeriodEnd),
      created_at: subscription.createdAt.toISOString(),
      updated_at: subscription.updatedAt.toISOString(),
    };
  });

  const fileDate = new Date().toISOString().slice(0, 10);
  return {
    filename: `finance-report-${fileDate}.csv`,
    rowCount: rows.length,
    csv: buildCsv(rows),
  };
}
