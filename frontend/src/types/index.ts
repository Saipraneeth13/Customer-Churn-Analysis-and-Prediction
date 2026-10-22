export interface KPISummary {
  total_customers: number;
  overall_churn_rate: number;
  churned_customers: number;
  retained_customers: number;
  total_monthly_revenue: number;
  monthly_revenue_at_risk: number;
  monthly_revenue_at_risk_pct: number;
  high_risk_customers: number;
  high_risk_revenue_exposure: number;
  actual_churn_revenue_lost: number;
  model_roc_auc: number;
  retention_pulse: string;
  retention_pulse_status: 'critical' | 'warning' | 'healthy';
}

export interface KeyInsight {
  id: string;
  title: string;
  description: string;
  impact: string;
  metric_value: string;
  benchmark?: string;
  business_relevance: string;
  category: string;
  rank: number;
}

export interface SegmentMetric {
  segment_name: string;
  customers: number;
  churned: number;
  retained: number;
  churn_rate: number;
  monthly_revenue: number;
  monthly_revenue_at_risk: number;
  rate_diff_from_average: number;
}

export interface MonthlyChargeBand {
  band: string;
  count: number;
  churned: number;
  retained: number;
  churn_rate: number;
  monthly_revenue: number;
}

export interface HistogramBin {
  bin_range: string;
  count: number;
  churned: number;
  churn_rate: number;
}

export interface FunnelStep {
  step_id: string;
  name: string;
  description: string;
  count: number;
  percentage_of_total: number;
  monthly_revenue_exposure: number;
}

export interface RiskBandSummary {
  band: 'Low' | 'Medium' | 'High';
  probability_range: string;
  customers: number;
  customer_pct: number;
  churned_in_band: number;
  churn_rate_in_band: number;
  monthly_revenue_exposure: number;
  revenue_pct: number;
}

export interface CustomerItem {
  customer_id: string;
  gender: string;
  senior_citizen: number;
  partner: string;
  dependents: string;
  tenure: number;
  tenure_group: string;
  phone_service: string;
  multiple_lines: string;
  internet_service: string;
  online_security: string;
  online_backup: string;
  device_protection: string;
  tech_support: string;
  streaming_tv: string;
  streaming_movies: string;
  contract: string;
  paperless_billing: string;
  payment_method: string;
  monthly_charges: number;
  total_charges: number;
  actual_churn: number;
  churn_probability: number;
  risk_band: 'Low' | 'Medium' | 'High';
}

export interface CustomerDetail extends CustomerItem {
  risk_factors: string[];
  protective_factors: string[];
  recommended_action: string;
  potential_saving_monthly: number;
  percentile_monthly_charges: number;
  segment_churn_context: string;
}

export interface CustomersResponse {
  items: CustomerItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  category: string;
  direction?: 'increases_churn' | 'reduces_churn';
  raw_coefficient?: number;
}

export interface ConfusionMatrixData {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
  total: number;
}

export interface ROCCurvePoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

export interface ModelMetrics {
  model_name: string;
  roc_auc: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  confusion_matrix: ConfusionMatrixData;
  roc_curve: ROCCurvePoint[];
}

export interface RetentionScenarioRequest {
  target_segment: string;
  custom_min_probability?: number;
  custom_contract?: string;
  custom_max_tenure?: number;
  offer_cost_per_customer: number;
  assumed_success_rate: number;
  target_customer_limit?: number;
}

export interface RetentionScenarioResponse {
  target_segment_name: string;
  eligible_customers: number;
  targeted_customers: number;
  average_monthly_charges: number;
  total_monthly_revenue_exposure: number;
  total_campaign_cost: number;
  assumed_retained_customers: number;
  estimated_monthly_revenue_protected: number;
  estimated_net_benefit: number;
  break_even_success_rate: number;
  break_even_customers_needed: number;
  roi_multiple: number;
  assumptions_note: string;
}

export interface MetadataResponse {
  last_updated: string;
  dataset_name: string;
  record_count: number;
  model_version: string;
  status: string;
}

export interface GlobalFilters {
  contract?: string;
  tenure_group?: string;
}
