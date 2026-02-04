export type ContributionType = "cash" | "work" | "tangible" | "intangible" | "others";
export type ProjectModel = "JUST_SPLIT" | "FLAT" | "CUSTOM";

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  model_type: ProjectModel;
  mult_cash: number;
  mult_work: number;       // Renombrado de mult_labor
  mult_tangible: number;   // Renombrado de mult_assets
  mult_intangible: number; // Renombrado de mult_ip
  mult_others: number;     // Nueva categoría
  use_log_risk: boolean;
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

// Valores por defecto para el modelo "Just Split" con los nuevos nombres
export const DEFAULT_MULTIPLIERS: Record<ContributionType, number> = {
  cash: 4,
  work: 2,
  intangible: 2,
  tangible: 1,
  others: 1,
};