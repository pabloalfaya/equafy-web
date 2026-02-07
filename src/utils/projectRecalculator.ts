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
