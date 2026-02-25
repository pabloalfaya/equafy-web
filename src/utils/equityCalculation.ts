/**
 * Shared equity calculation: Fixed Equity, Dynamic Pool, Caps with spillover, Shadow Points.
 *
 * Shadow Points: totalPoints per member = full sum of contribution points. The cap NEVER
 * reduces accumulation; it only caps the displayed %.
 *
 * Algorithm:
 * 1. Base: each user gets their Fixed Equity (0% if none).
 * 2. Dynamic Pool = 100% - sum(all Fixed Equity).
 * 3. Initial split: distribute the Dynamic Pool among ALL users (fixed or not) strictly
 *    proportionally by their totalPoints.
 * 4. Theoretical % = Fixed + dynamic share from step 3.
 * 5. Caps & spillover: if theoretical > Cap, final = Cap. The excess is redistributed
 *    proportionally by points among users who haven't hit their cap. Iterate until
 *    no spillover remains.
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

const EPS = 1e-6;

/**
 * Computes total points per member (shadow: full accumulation) and final equity %
 * using: fixed base + dynamic pool split by points among ALL, then iterative cap + spillover.
 */
export function computeMemberEquitySummary(
  members: MemberForEquity[],
  contributions: ContributionForEquity[] = []
): MemberEquitySummaryItem[] {
  const memberList = members ?? [];
  const contribs = contributions ?? [];

  // Shadow: per-member total points (always full sum)
  const totalPointsByMember = memberList.map((member) => {
    const memberName = member.name || "Unknown";
    return contribs
      .filter((c) => (c.contributor_name || "") === memberName)
      .reduce<number>((sum, c) => sum + (Number(c.risk_adjusted_value) || 0), 0);
  });

  const totalRiskPoints = totalPointsByMember.reduce<number>((s, v) => s + v, 0);
  const caps = memberList.map((m) => parseCap(m));
  const fixedValues = memberList.map((m) => Number(m.fixed_equity) || 0);

  const totalFixed = fixedValues.reduce<number>((s, v) => s + v, 0);
  const dynamicPool = Math.max(0, 100 - totalFixed);

  // Initial dynamic share for EVERYONE proportionally by points
  const dynamicShare = memberList.map((_, i) => {
    if (totalRiskPoints <= 0)
      return memberList.length > 0 ? dynamicPool / memberList.length : 0;
    return (totalPointsByMember[i]! / totalRiskPoints) * dynamicPool;
  });

  // Theoretical % = fixed + dynamic
  const theoreticalTotal = memberList.map((_, i) => fixedValues[i]! + dynamicShare[i]!);

  // Apply cap initially; allocation = min(theoretical, cap or +inf)
  const allocation = theoreticalTotal.map((t, i) =>
    caps[i] != null ? Math.min(t, caps[i]!) : t
  );

  let excess = 100 - allocation.reduce<number>((s, v) => s + v, 0);

  // Iterative spillover: redistribute excess to uncapped users by points until stable
  while (excess > EPS) {
    const uncapped = memberList
      .map((_, i) => i)
      .filter((i) => caps[i] == null || allocation[i]! < caps[i]!);
    if (uncapped.length === 0) break;

    const totalP = uncapped.reduce<number>((s, i) => s + totalPointsByMember[i]!, 0);
    if (totalP <= 0) {
      uncapped.forEach((i) => (allocation[i] = (allocation[i] ?? 0) + excess / uncapped.length));
      break;
    }

    let spill = 0;
    for (const i of uncapped) {
      const add = excess * (totalPointsByMember[i]! / totalP);
      allocation[i] = (allocation[i] ?? 0) + add;
      if (caps[i] != null && allocation[i]! > caps[i]!) {
        spill += allocation[i]! - caps[i]!;
        allocation[i] = caps[i]!;
      }
    }
    excess = spill;
  }

  // Normalize to 100% in case of floating point drift
  const totalAlloc = allocation.reduce<number>((s, v) => s + (v ?? 0), 0);
  const finalPct =
    totalAlloc > 0 ? allocation.map((a) => ((a ?? 0) / totalAlloc) * 100) : allocation.slice();

  return memberList.map((m, i) => ({
    memberId: m.id,
    totalPoints: totalPointsByMember[i] ?? 0,
    equityPct: finalPct[i] ?? 0,
  }));
}
