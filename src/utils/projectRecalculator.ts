import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_MULTIPLIERS = {
  mult_cash: 4,
  mult_work: 2,
  mult_tangible: 1,
  mult_intangible: 2,
  mult_others: 1,
};

/**
 * Recalcula el total acumulado del proyecto y el multiplicador de riesgo
 * basándose en todas las aportaciones actuales.
 * Actualiza projects.current_valuation y, si use_log_risk, los multiplicadores.
 */
export async function recalculateAndPersistProjectValuation(
  supabase: SupabaseClient,
  projectId: string,
  projectConfig?: {
    use_log_risk?: boolean;
    mult_cash?: number;
    mult_work?: number;
    mult_tangible?: number;
    mult_intangible?: number;
    mult_others?: number;
  }
): Promise<{ error: Error | null }> {
  try {
    // 1. Obtener todas las aportaciones del proyecto
    const { data: contributions, error: fetchError } = await supabase
      .from("contributions")
      .select("risk_adjusted_value")
      .eq("project_id", projectId);

    if (fetchError) return { error: fetchError };

    // 2. Calcular el nuevo total acumulado
    const newTotal = (contributions ?? []).reduce(
      (sum, c) => sum + (Number(c.risk_adjusted_value) || 0),
      0
    );

    // 3. Preparar actualización del proyecto
    const updatePayload: Record<string, number> = {
      current_valuation: newTotal,
    };

    // 4. Si use_log_risk está activo, recalcular multiplicadores con decay logarítmico
    if (projectConfig?.use_log_risk) {
      // Fórmula: mult_new = mult_base / (1 + ln(1 + total/1000))
      const scale = 1 + Math.log(1 + newTotal / 1000);
      const base = {
        mult_cash: Number(projectConfig.mult_cash) || DEFAULT_MULTIPLIERS.mult_cash,
        mult_work: Number(projectConfig.mult_work) || DEFAULT_MULTIPLIERS.mult_work,
        mult_tangible: Number(projectConfig.mult_tangible) || DEFAULT_MULTIPLIERS.mult_tangible,
        mult_intangible: Number(projectConfig.mult_intangible) || DEFAULT_MULTIPLIERS.mult_intangible,
        mult_others: Number(projectConfig.mult_others) || DEFAULT_MULTIPLIERS.mult_others,
      };
      updatePayload.mult_cash = Math.max(0.5, base.mult_cash / scale);
      updatePayload.mult_work = Math.max(0.5, base.mult_work / scale);
      updatePayload.mult_tangible = Math.max(0.5, base.mult_tangible / scale);
      updatePayload.mult_intangible = Math.max(0.5, base.mult_intangible / scale);
      updatePayload.mult_others = Math.max(0.5, base.mult_others / scale);
    }

    // 5. Persistir en la base de datos
    const { error: updateError } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId);

    if (updateError) return { error: updateError };

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

const TYPE_TO_MULT_KEY: Record<string, string> = {
  cash: "mult_cash",
  work: "mult_work",
  tangible: "mult_tangible",
  intangible: "mult_intangible",
  others: "mult_others",
};

/**
 * Recalculates all contributions' risk_adjusted_value and multiplier when project multipliers change.
 * Called after changing equity model (e.g. Just Split → Flat).
 */
export async function recalculateContributionsWithMultipliers(
  supabase: SupabaseClient,
  projectId: string,
  mults: { cash: number; work: number; tangible: number; intangible: number; others: number }
): Promise<{ error: Error | null }> {
  try {
    const { data: contributions, error: fetchError } = await supabase
      .from("contributions")
      .select("id, type, amount, multiplier")
      .eq("project_id", projectId);

    if (fetchError) return { error: fetchError };

    const multMap: Record<string, number> = {
      mult_cash: Number(mults.cash) || 1,
      mult_work: Number(mults.work) || 1,
      mult_tangible: Number(mults.tangible) || 1,
      mult_intangible: Number(mults.intangible) || 1,
      mult_others: Number(mults.others) || 1,
    };

    let newTotal = 0;
    for (const c of contributions ?? []) {
      const typeKey = TYPE_TO_MULT_KEY[(c.type || "").toLowerCase()] || "mult_others";
      const mult = multMap[typeKey] ?? 1;
      const amount = Number(c.amount) || 0;
      const riskAdjusted = amount * mult;

      const { error: updErr } = await supabase
        .from("contributions")
        .update({ multiplier: mult, risk_adjusted_value: riskAdjusted })
        .eq("id", c.id);

      if (updErr) return { error: updErr };
      newTotal += riskAdjusted;
    }

    const { error: projectErr } = await supabase
      .from("projects")
      .update({ current_valuation: newTotal })
      .eq("id", projectId);

    return projectErr ? { error: projectErr } : { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
