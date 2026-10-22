from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class KPISummary(BaseModel):
    total_customers: int
    overall_churn_rate: float
    churned_customers: int
    retained_customers: int
    total_monthly_revenue: float
    monthly_revenue_at_risk: float  # revenue exposure of high-risk customers (>0.60)
    monthly_revenue_at_risk_pct: float
    high_risk_customers: int
    high_risk_revenue_exposure: float
    actual_churn_revenue_lost: float  # actual historical churned customers' monthly charges
    model_roc_auc: float
    retention_pulse: str
    retention_pulse_status: str  # "critical", "warning", "healthy"

class KeyInsight(BaseModel):
    id: str
    title: str
    description: str
    impact: str
    metric_value: str
    benchmark: Optional[str] = None
    business_relevance: str
    category: str
    rank: int

class SegmentMetric(BaseModel):
    segment_name: str
    customers: int
    churned: int
    retained: int
    churn_rate: float
    monthly_revenue: float
    monthly_revenue_at_risk: float
    rate_diff_from_average: float

class MonthlyChargeBand(BaseModel):
    band: str
    count: int
    churned: int
    retained: int
    churn_rate: float
    monthly_revenue: float

class HistogramBin(BaseModel):
    bin_range: str
    count: int
    churned: int
    churn_rate: float

class FunnelStep(BaseModel):
    step_id: str
    name: str
    description: str
    count: int
    percentage_of_total: float
    monthly_revenue_exposure: float

class CustomerItem(BaseModel):
    customer_id: str
    gender: str
    senior_citizen: int
    partner: str
    dependents: str
    tenure: int
    tenure_group: str
    phone_service: str
    multiple_lines: str
    internet_service: str
    online_security: str
    online_backup: str
    device_protection: str
    tech_support: str
    streaming_tv: str
    streaming_movies: str
    contract: str
    paperless_billing: str
    payment_method: str
    monthly_charges: float
    total_charges: float
    actual_churn: int
    churn_probability: float
    risk_band: str

class CustomerDetail(CustomerItem):
    risk_factors: List[str]
    protective_factors: List[str]
    recommended_action: str
    potential_saving_monthly: float
    percentile_monthly_charges: float
    segment_churn_context: str

class CustomersResponse(BaseModel):
    items: List[CustomerItem]
    total: int
    page: int
    limit: int
    pages: int

class RiskBandSummary(BaseModel):
    band: str
    probability_range: str
    customers: int
    customer_pct: float
    churned_in_band: int
    churn_rate_in_band: float
    monthly_revenue_exposure: float
    revenue_pct: float

class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float
    category: str
    direction: Optional[str] = None  # "increases_churn" or "reduces_churn"
    raw_coefficient: Optional[float] = None

class ConfusionMatrixData(BaseModel):
    tn: int
    fp: int
    fn: int
    tp: int
    total: int

class ROCCurvePoint(BaseModel):
    fpr: float
    tpr: float
    threshold: float

class ModelMetrics(BaseModel):
    model_name: str
    roc_auc: float
    precision: float
    recall: float
    f1_score: float
    accuracy: float
    confusion_matrix: ConfusionMatrixData
    roc_curve: List[ROCCurvePoint]

class RetentionScenarioRequest(BaseModel):
    target_segment: str = Field(..., description="'month_to_month_high_risk', 'first_year_high_risk', 'high_charge_high_risk', 'all_high_risk', or 'custom'")
    custom_min_probability: Optional[float] = 0.60
    custom_contract: Optional[str] = None
    custom_max_tenure: Optional[int] = None
    offer_cost_per_customer: float = Field(default=25.0, ge=0.0)
    assumed_success_rate: float = Field(default=0.20, ge=0.0, le=1.0)
    target_customer_limit: Optional[int] = None

class RetentionScenarioResponse(BaseModel):
    target_segment_name: str
    eligible_customers: int
    targeted_customers: int
    average_monthly_charges: float
    total_monthly_revenue_exposure: float
    total_campaign_cost: float
    assumed_retained_customers: int
    estimated_monthly_revenue_protected: float
    estimated_net_benefit: float
    break_even_success_rate: float
    break_even_customers_needed: int
    roi_multiple: float
    assumptions_note: str

class MetadataResponse(BaseModel):
    last_updated: str
    dataset_name: str
    record_count: int
    model_version: str
    status: str
