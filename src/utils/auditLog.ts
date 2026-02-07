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
 * Obtiene el userId del usuario autenticado actual.
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

  await supabase.from("project_audit_log").insert({
    project_id: projectId,
    user_id: user?.id ?? null,
    action_type: actionType,
    description,
  });
}
