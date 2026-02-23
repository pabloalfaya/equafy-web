/**
 * Builds time-series data for the Equity Evolution chart from real contributions and members.
 * Contributions are sorted by date (oldest first) and aggregated by month.
 */

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

import { computeMemberEquitySummary } from "./equityCalculation";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_LABELS[month]} ${year}`;
}

/** Contributions up to and including the given year-month (inclusive). */
function contributionsUpTo(
  sorted: (ContributionForEvolution & { date: string })[],
  year: number,
  month: number
): (ContributionForEvolution & { date: string })[] {
  const end = new Date(year, month + 1, 0); // last day of month
  return sorted.filter((c) => new Date(c.date) <= end);
}

export function buildEquityEvolutionData(
  contributions: ContributionForEvolution[],
  members: MemberForEvolution[]
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
      memberNames: [] as string[],
      typeNames: [] as string[],
    };
  }

  const first = new Date(contribs[0].date);
  const last = new Date(contribs[contribs.length - 1].date);
  const months: { year: number; month: number }[] = [];
  for (let y = first.getFullYear(), m = first.getMonth(); y < last.getFullYear() || (y === last.getFullYear() && m <= last.getMonth()); m++) {
    if (m > 11) {
      m = -1;
      y++;
      continue;
    }
    months.push({ year: y, month: m });
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

  for (const { year, month } of months) {
    const upTo = contributionsUpTo(contribs, year, month);
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthLabel = formatMonthLabel(year, month);

    const contribsForEquity = upTo.map((c) => ({
      contributor_name: c.contributor_name,
      risk_adjusted_value: Number(c.risk_adjusted_value) || 0,
    }));

    const summary = computeMemberEquitySummary(
      members as { id: string; name: string; fixed_equity?: number | null; equity_cap?: number | null }[],
      contribsForEquity
    );

    const byMemberRow: ByMemberRow = { monthKey, monthLabel };
    memberNames.forEach((name, i) => {
      const pct = summary[i]?.equityPct ?? 0;
      byMemberRow[name] = Math.round(pct * 10) / 10;
    });
    byMember.push(byMemberRow);

    const total = upTo.reduce((s, c) => s + (Number(c.risk_adjusted_value) || 0), 0);
    totalValue.push({ monthKey, monthLabel, total });

    const typeSums: Record<string, number> = {};
    typeNames.forEach((t) => (typeSums[t] = 0));
    upTo.forEach((c) => {
      const t = (c.type ?? "OTHERS").toString().toUpperCase();
      if (typeSums[t] !== undefined) typeSums[t] += Number(c.risk_adjusted_value) || 0;
    });
    const byTypeRow: ByTypeRow = { monthKey, monthLabel };
    typeNames.forEach((t) => (byTypeRow[t] = Math.round(typeSums[t] * 100) / 100));
    byType.push(byTypeRow);
  }

  return {
    byMember,
    totalValue,
    byType,
    memberNames,
    typeNames,
  };
}
