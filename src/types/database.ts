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
  subscription_status?: string;
  /** Stripe subscription ID; set when project was ever activated. Used to deny trial on reactivation. */
  stripe_subscription_id?: string | null;
  /** 'active' | 'finalized'. Default in DB should be 'active'. */
  status?: string;
  /** If false, show the equity model onboarding modal on first dashboard visit. */
  model_onboarding_dismissed?: boolean;
  /** When the user accepted Terms of Service before checkout. */
  terms_accepted_at?: string | null;
  /** When the user accepted Privacy Policy before checkout. */
  privacy_accepted_at?: string | null;
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