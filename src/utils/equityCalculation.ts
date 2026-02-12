/**
 * Shared equity calculation (fixed + dynamic, cap, redistribute).
 * Used by EquityPieChart, dashboard PDF, and Manage Team summary.
 */

export interface MemberForEquity {
  id: string;
  name: string;
  fixed_equity?: number | null;
  equity_cap?: number | null;
}

export interface ContributionForEquity {
  contributor_name?: string | null;
  risk_adjusted_value?: number | null;
}

export interface MemberEquitySummaryItem {
  memberId: string;
  totalPoints: number;
  equityPct: number;
}

/**
 * Computes total points per member and final equity % (with cap and redistribution).
 * Returns one entry per member in the same order as members.
 */
export function computeMemberEquitySummary(
  members: MemberForEquity[],
  contributions: ContributionForEquity[] = []
): MemberEquitySummaryItem[] {
  const memberList = members ?? [];
  const contribs = contributions ?? [];

  const totalFixedEquity = memberList.reduce(
    (sum, m) => sum + (Number(m.fixed_equity) || 0),
    0
  );
  const dynamicPoolAvailable = Math.max(0, 100 - totalFixedEquity);
  const totalRiskPoints = contribs.reduce(
    (sum, c) => sum + (Number(c.risk_adjusted_value) || 0),
    0
  );

  const theoretical: number[] = memberList.map((member) => {
    const memberName = member.name || "Unknown";
    const userFixed = Number(member.fixed_equity) || 0;
    const memberPoints = contribs
      .filter((c) => (c.contributor_name || "") === memberName)
      .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
    let userDynamic: number;
    if (totalRiskPoints > 0) {
      userDynamic = (memberPoints / totalRiskPoints) * dynamicPoolAvailable;
    } else {
      userDynamic =
        memberList.length > 0 ? dynamicPoolAvailable / memberList.length : 0;
    }
    return userFixed + userDynamic;
  });

  let rawSum = theoretical.reduce((s, v) => s + v, 0);
  let normalized = rawSum > 0 ? theoretical.map((v) => (v / rawSum) * 100) : theoretical.slice();

  const caps = memberList.map((m) =>
    m.equity_cap != null && m.equity_cap !== undefined ? Number(m.equity_cap) : null
  );
  let finalValues = normalized.slice();
  let excess = 0;
  for (let i = 0; i < finalValues.length; i++) {
    const cap = caps[i];
    if (cap != null && finalValues[i] > cap) {
      excess += finalValues[i] - cap;
      finalValues[i] = cap;
    }
  }
  let uncappedTheoreticalSum = 0;
  for (let i = 0; i < finalValues.length; i++) {
    const cap = caps[i];
    if (cap == null || normalized[i] <= cap) uncappedTheoreticalSum += normalized[i];
  }
  if (excess > 0 && uncappedTheoreticalSum > 0) {
    for (let i = 0; i < finalValues.length; i++) {
      const cap = caps[i];
      if (cap == null || normalized[i] <= cap)
        finalValues[i] += excess * (normalized[i] / uncappedTheoreticalSum);
    }
  }
  const totalAfter = finalValues.reduce((s, v) => s + v, 0);
  if (totalAfter > 0) finalValues = finalValues.map((v) => (v / totalAfter) * 100);

  const totalPointsByMember = memberList.map((member) => {
    const memberName = member.name || "Unknown";
    return contribs
      .filter((c) => (c.contributor_name || "") === memberName)
      .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
  });

  return memberList.map((m, i) => ({
    memberId: m.id,
    totalPoints: totalPointsByMember[i] ?? 0,
    equityPct: finalValues[i] ?? 0,
  }));
}
