import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditActionType =
  | "ADD_CONTRIBUTION"
  | "EDIT_CONTRIBUTION"
  | "REMOVE_CONTRIBUTION"
  | "CHANGE_MULTIPLIER"
  | "UPDATE_FIXED_EQUITY"
  | "ADD_MEMBER"
  | "EDIT_MEMBER"
  | "REMOVE_MEMBER";

interface LogAuditParams {
  supabase: SupabaseClient;
  projectId: string;
  actionType: AuditActionType;
  description: string;
}

/**
 * Registra una entrada en el audit log del proyecto.
 * Captura el usuario autenticado (userId y email) para trazabilidad.
 * Usa email por defecto si no hay sesión para evitar que falle.
 */
export async function logAudit({
  supabase,
  projectId,
  actionType,
  description,
}: LogAuditParams): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? "admin@equily.com";
  const userId = user?.id ?? null;

  console.log("--- AUDIT LOG INTENTO ---", userEmail, actionType);

  const { error } = await supabase.from("project_audit_log").insert({
    project_id: projectId,
    user_id: userId,
    user_email: userEmail,
    action_type: actionType,
    description,
  });

  if (error) {
    console.error("❌ ERROR GUARDANDO AUDIT LOG:", error);
    throw error;
  }

  console.log("--- AUDIT LOG ÉXITO ---");
}
