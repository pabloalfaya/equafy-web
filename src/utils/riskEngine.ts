/**
 * Smart Multipliers — Algoritmo de Dilución Dinámica de Riesgo.
 * Fórmula logarítmica: a mayor acumulación, menor multiplicador (riesgo decreciente).
 */

const MIN_MULTIPLIER = 1.0;

export interface DynamicMultiplierResult {
  cash: number;
  work: number;
}

/**
 * Calcula multiplicadores dinámicos según el total acumulado del proyecto.
 * - safeTotal = max(totalContributions, 3000) para evitar log(0) o valores muy pequeños.
 * - baseMultiplier = 32 / ln(safeTotal)
 * - cash = baseMultiplier (redondeado 2 decimales), mínimo 1.00
 * - work = baseMultiplier / 2 (redondeado 2 decimales), mínimo 1.00
 */
export function calculateDynamicMultiplier(
  totalContributions: number
): DynamicMultiplierResult {
  const safeTotal = Math.max(totalContributions, 3000);
  const ln = Math.log(safeTotal);
  if (!Number.isFinite(ln) || ln <= 0) {
    return { cash: MIN_MULTIPLIER, work: MIN_MULTIPLIER };
  }
  const baseMultiplier = 32 / ln;
  const cash = Math.max(
    MIN_MULTIPLIER,
    Math.round(baseMultiplier * 100) / 100
  );
  const work = Math.max(
    MIN_MULTIPLIER,
    Math.round((baseMultiplier / 2) * 100) / 100
  );
  return { cash, work };
}
