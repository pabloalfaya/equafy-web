import type { SupabaseClient } from "@supabase/supabase-js";
import { BRAND } from "@/lib/brand";

export type AuditActionType =
  | "ADD_CONTRIBUTION"
  | "EDIT_CONTRIBUTION"
  | "REMOVE_CONTRIBUTION"
  | "DELETE_CONTRIBUTION"
  | "CHANGE_MULTIPLIER"
  | "UPDATE_MULTIPLIERS"
  | "UPDATE_RISK"
  | "UPDATE_FIXED_EQUITY"
  | "UPDATE_EQUITY_CAPS"
  | "ADD_MEMBER"
  | "EDIT_MEMBER"
  | "UPDATE_MEMBER"
  | "REMOVE_MEMBER"
  | "CREATE_PROJECT"
  | "UPDATE_PROJECT";

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

  const userEmail = user?.email ?? BRAND.auditFallbackEmail;

  const data = {
    project_id: projectId,
    action_type: actionType,
    description,
    user_email: userEmail,
  };

  console.log("Intento de Audit:", data);

  const { error } = await supabase
    .from("project_audit_log")
    .insert(data);

  if (error) {
    console.error("Error Audit:", error);
    throw error;
  } else {
    console.log("✅ Audit guardado correctamente");
  }
}
