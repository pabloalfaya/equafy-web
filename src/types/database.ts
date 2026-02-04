export type ContributionType = "cash" | "labor" | "ip" | "assets";
export type ProjectModel = "JUST_SPLIT" | "FLAT" | "CUSTOM"; // Añadido para los 3 modelos

export interface Project {
  id: string;
  name: string;
  owner_id: string; // Importante para la seguridad RLS
  model_type: ProjectModel; // Usamos el tipo específico
  mult_cash: number;
  mult_labor: number;
  mult_ip: number;
  mult_assets: number;
  use_log_risk: boolean; // Para el futuro interruptor
  current_valuation: number;
  created_at?: string;
}

export interface Contribution {
  id?: string;
  project_id: string;
  contributor_name: string;
  type: ContributionType;
  amount: number;
  risk_multiplier: number;
  risk_adjusted_value: number;
  created_at?: string;
}

// Estos son los valores por defecto del modelo "Just Split"
export const DEFAULT_MULTIPLIERS: Record<ContributionType, number> = {
  cash: 4,
  labor: 2,
  ip: 2,
  assets: 1,
};