export type ContributionType = "cash" | "labor" | "ip" | "assets";

export interface Project {
  id: string;
  name: string;
  model_type: string;
  mult_cash: number;
  mult_labor: number;
  mult_ip?: number;
  mult_assets?: number;
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

export const DEFAULT_MULTIPLIERS: Record<ContributionType, number> = {
  cash: 4,    // CASH x4
  labor: 2,   // LABOR x2
  ip: 2,      // IP x2
  assets: 1,  // ASSETS x1
};
