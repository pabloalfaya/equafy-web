/**
 * Builds time-series data for the Equity Evolution chart from real contributions and members.
 * Contributions are sorted by date (oldest first) and aggregated by period (day, week, month, year).
 */

export type TimeScale = "daily" | "weekly" | "monthly" | "annual";

export type ContributionForEvolution = {
  date?: string;
  contributor_name?: string | null;
  type?: string | null;
  risk_adjusted_value?: number | null;
};

export type MemberForEvolution = {
  id: string;
  name: string;
  fixed_equity?: number | null;
  equity_cap?: number | null;
  equityCap?: number | null;
};

/** One row per month for the chart. monthKey = "YYYY-MM", monthLabel = "Jan 2025". */
export type ByMemberRow = { monthKey: string; monthLabel: string; [memberName: string]: string | number };
export type TotalValueRow = { monthKey: string; monthLabel: string; total: number };
export type ByTypeRow = { monthKey: string; monthLabel: string; [type: string]: string | number };
export type ContributionCountRow = { monthKey: string; monthLabel: string; count: number };

import { computeMemberEquitySummary } from "./equityCalculation";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_LABELS[month]} ${year}`;
}

/** Contributions in the period [startDate, endDate] inclusive. */
function contributionsInPeriod(
  sorted: (ContributionForEvolution & { date: string })[],
  startDate: Date,
  endDate: Date
): number {
  return sorted.filter((c) => {
    const d = new Date(c.date);
    return d >= startDate && d <= endDate;
  }).length;
}

/** Contributions up to and including the given end date (inclusive). */
function contributionsUpTo(
  sorted: (ContributionForEvolution & { date: string })[],
  endDate: Date
): (ContributionForEvolution & { date: string })[] {
  return sorted.filter((c) => new Date(c.date) <= endDate);
}

/** End of day for a given date. */
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** End of ISO week (Sunday) containing d. */
function endOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  x.setDate(x.getDate() + diff);
  return endOfDay(x);
}

/** End of month. */
function endOfMonth(year: number, month: number): Date {
  return endOfDay(new Date(year, month + 1, 0));
}

/** End of year. */
function endOfYear(year: number): Date {
  return endOfDay(new Date(year, 11, 31));
}

export function buildEquityEvolutionData(
  contributions: ContributionForEvolution[],
  members: MemberForEvolution[],
  timeScale: TimeScale = "monthly"
) {
  const contribs = [...(contributions ?? [])].filter(
    (c): c is ContributionForEvolution & { date: string } => Boolean(c.date)
  );
  contribs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (contribs.length === 0) {
    return {
      byMember: [] as ByMemberRow[],
      totalValue: [] as TotalValueRow[],
      byType: [] as ByTypeRow[],
      contributionCount: [] as ContributionCountRow[],
      memberNames: [] as string[],
      typeNames: [] as string[],
    };
  }

  const first = new Date(contribs[0].date);
  const last = new Date(contribs[contribs.length - 1].date);

  type Period = { startDate: Date; endDate: Date; key: string; label: string };
  const periods: Period[] = [];

  if (timeScale === "daily") {
    const d = new Date(first);
    d.setHours(0, 0, 0, 0);
    const lastDay = new Date(last);
    lastDay.setHours(0, 0, 0, 0);
    while (d <= lastDay) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = endOfDay(d);
      periods.push({
        startDate: start,
        endDate: end,
        key: d.toISOString().slice(0, 10),
        label: `${d.getDate()} ${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
      });
      d.setDate(d.getDate() + 1);
    }
  } else if (timeScale === "weekly") {
    let d = new Date(first);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + toMonday);
    while (d <= last) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = endOfWeek(d);
      if (end >= first) {
        periods.push({
          startDate: start,
          endDate: end,
          key: `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, "0")}`,
          label: `${d.getDate()} ${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
        });
      }
      d.setDate(d.getDate() + 7);
    }
    if (periods.length === 0) {
      const start = new Date(first);
      start.setHours(0, 0, 0, 0);
      const end = endOfWeek(first);
      periods.push({
        startDate: start,
        endDate: end,
        key: first.toISOString().slice(0, 10),
        label: `${first.getDate()} ${MONTH_LABELS[first.getMonth()]} ${first.getFullYear()}`,
      });
    }
  } else if (timeScale === "annual") {
    for (let y = first.getFullYear(); y <= last.getFullYear(); y++) {
      periods.push({
        startDate: new Date(y, 0, 1, 0, 0, 0),
        endDate: endOfYear(y),
        key: String(y),
        label: String(y),
      });
    }
  } else {
    for (let y = first.getFullYear(), m = first.getMonth(); y < last.getFullYear() || (y === last.getFullYear() && m <= last.getMonth()); m++) {
      if (m > 11) {
        m = -1;
        y++;
        continue;
      }
      periods.push({
        startDate: new Date(y, m, 1, 0, 0, 0),
        endDate: endOfMonth(y, m),
        key: `${y}-${String(m + 1).padStart(2, "0")}`,
        label: formatMonthLabel(y, m),
      });
    }
  }

  const memberNames = (members ?? []).map((m) => m.name || "Unknown").filter(Boolean);
  const typeSet = new Set<string>();
  contribs.forEach((c) => {
    const t = (c.type ?? "OTHERS").toString().toUpperCase();
    typeSet.add(t);
  });
  const typeNames = Array.from(typeSet).sort();

  const byMember: ByMemberRow[] = [];
  const totalValue: TotalValueRow[] = [];
  const byType: ByTypeRow[] = [];
  const contributionCount: ContributionCountRow[] = [];

  for (const { startDate, endDate, key, label } of periods) {
    const upTo = contributionsUpTo(contribs, endDate);

    const contribsForEquity = upTo.map((c) => ({
      contributor_name: c.contributor_name,
      risk_adjusted_value: Number(c.risk_adjusted_value) || 0,
    }));

    const summary = computeMemberEquitySummary(
      members as { id: string; name: string; fixed_equity?: number | null; equity_cap?: number | null }[],
      contribsForEquity
    );

    const byMemberRow: ByMemberRow = { monthKey: key, monthLabel: label };
    memberNames.forEach((name, i) => {
      const pct = summary[i]?.equityPct ?? 0;
      byMemberRow[name] = Math.round(pct * 10) / 10;
    });
    byMember.push(byMemberRow);

    const total = upTo.reduce((s, c) => s + (Number(c.risk_adjusted_value) || 0), 0);
    totalValue.push({ monthKey: key, monthLabel: label, total });

    const typeSums: Record<string, number> = {};
    typeNames.forEach((t) => (typeSums[t] = 0));
    upTo.forEach((c) => {
      const t = (c.type ?? "OTHERS").toString().toUpperCase();
      if (typeSums[t] !== undefined) typeSums[t] += Number(c.risk_adjusted_value) || 0;
    });
    const byTypeRow: ByTypeRow = { monthKey: key, monthLabel: label };
    typeNames.forEach((t) => (byTypeRow[t] = Math.round(typeSums[t] * 100) / 100));
    byType.push(byTypeRow);

    const count = contributionsInPeriod(contribs, startDate, endDate);
    contributionCount.push({ monthKey: key, monthLabel: label, count });
  }

  return {
    byMember,
    totalValue,
    byType,
    contributionCount,
    memberNames,
    typeNames,
  };
}
