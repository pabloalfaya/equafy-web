/**
 * Shared equity calculation: Fixed Equity, Caps, and Shadow Points.
 *
 * Rule 1 (Shadow Points): totalPoints per member always = sum of their contribution
 * points. The cap NEVER stops accumulation; it only caps the displayed %.
 *
 * Rule 2 (100% split):
 * - Assign fixed % to members with fixed_equity.
 * - Assign cap % to members with a cap (they never get more than cap).
 * - remaining = 100 - sum(fixed for non-capped) - sum(caps).
 * - Divide remaining strictly proportionally among FREE members (no fixed, no cap) by points.
 *
 * Validation: When a capped user gains more points, every other user's % stays exactly the same.
 */

export interface MemberForEquity {
  id: string;
  name: string;
  fixed_equity?: number | null;
  equity_cap?: number | null;
  equityCap?: number | null;
}

/** Parse equity_cap / equityCap to number; null if missing or invalid. */
export function parseCap(m: MemberForEquity): number | null {
  const raw = m.equity_cap ?? (m as { equityCap?: number | null }).equityCap;
  if (raw == null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export interface ContributionForEquity {
  contributor_name?: string | null;
  risk_adjusted_value?: number | null;
}

export interface MemberEquitySummaryItem {
  memberId: string;
  /** Shadow points: always full sum of contribution points (cap does not reduce this). */
  totalPoints: number;
  equityPct: number;
}

/**
 * Computes total points per member (shadow: full accumulation) and final equity %
 * using: fixed first, then cap blocks %, then remaining split among free users by points.
 */
export function computeMemberEquitySummary(
  members: MemberForEquity[],
  contributions: ContributionForEquity[] = []
): MemberEquitySummaryItem[] {
  const memberList = members ?? [];
  const contribs = contributions ?? [];

  // Per-member total points (shadow): always full sum — cap never reduces this
  const totalPointsByMember = memberList.map((member) => {
    const memberName = member.name || "Unknown";
    return contribs
      .filter((c) => (c.contributor_name || "") === memberName)
      .reduce((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
  });

  const totalRiskPoints = totalPointsByMember.reduce((s, v) => s + v, 0);
  const caps = memberList.map((m) => parseCap(m));
  const fixedValues = memberList.map((m) => Number(m.fixed_equity) || 0);

  // Allocated to fixed (only for members WITHOUT cap) and to cap (for members WITH cap)
  const totalFixedNoCap = memberList.reduce((sum, m, i) => {
    const cap = caps[i];
    const fixed = fixedValues[i];
    if (cap != null) return sum; // capped members don't consume fixed pool for allocation
    return sum + fixed;
  }, 0);
  const sumCaps = caps.reduce((sum, c) => sum + (c ?? 0), 0);
  let remaining = 100 - totalFixedNoCap - sumCaps;
  if (remaining < 0) remaining = 0;

  // Free = no fixed, no cap (strictly: fixed === 0 and cap === null)
  const isFree = (i: number) => fixedValues[i] === 0 && caps[i] == null;
  const freeIndices = memberList.map((_, i) => i).filter(isFree);
  const freePoints = freeIndices.reduce((s, i) => s + totalPointsByMember[i], 0);

  const finalPct: number[] = memberList.map((_, i) => {
    if (caps[i] != null) return caps[i]!;
    if (fixedValues[i] > 0) return fixedValues[i];
    if (freePoints > 0 && freeIndices.includes(i))
      return (totalPointsByMember[i]! / freePoints) * remaining;
    if (freeIndices.length > 0 && freeIndices.includes(i)) return remaining / freeIndices.length;
    return 0;
  });

  return memberList.map((m, i) => ({
    memberId: m.id,
    totalPoints: totalPointsByMember[i] ?? 0,
    equityPct: finalPct[i] ?? 0,
  }));
}
