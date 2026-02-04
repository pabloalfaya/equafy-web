export type ContributionType = "cash" | "work" | "tangible" | "intangible" | "others";
export type ProjectModel = "JUST_SPLIT" | "FLAT" | "CUSTOM";

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  model_type: ProjectModel;
  mult_cash: number;
  mult_work: number;
  mult_tangible: number;
  mult_intangible: number;
  mult_others: number;
  use_log_risk: boolean;
  current_valuation: number;
  created_at?: string;
}

export interface Contribution {
  id: string;
  project_id: string;
  contributor_name: string;
  type: ContributionType;
  concept?: string;
  amount: number;
  multiplier: number;
  risk_adjusted_value: number;
  created_at?: string;
}

export const DEFAULT_MULTIPLIERS: Record<ContributionType, number> = {
  cash: 4,
  work: 2,
  intangible: 2,
  tangible: 1,
  others: 1,
};