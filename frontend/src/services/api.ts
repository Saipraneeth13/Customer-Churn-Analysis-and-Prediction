import {
  KPISummary, KeyInsight, SegmentMetric, RiskBandSummary,
  CustomersResponse, CustomerDetail, ModelMetrics, FeatureImportanceItem,
  RetentionScenarioRequest, RetentionScenarioResponse, MetadataResponse,
  MonthlyChargeBand, HistogramBin, FunnelStep
} from '../types';

const API_BASE = '/api';

export const api = {
  async getOverview(contract?: string, tenure_group?: string): Promise<{
    kpis: KPISummary;
    insights: KeyInsight[];
    risk_distribution: RiskBandSummary[];
    monthly_charges_distribution: MonthlyChargeBand[];
    probability_histogram: HistogramBin[];
    retention_funnel: FunnelStep[];
    last_updated: string;
  }> {
    const params = new URLSearchParams();
    if (contract && contract !== 'all') params.append('contract', contract);
    if (tenure_group && tenure_group !== 'all') params.append('tenure_group', tenure_group);
    
    const res = await fetch(`${API_BASE}/overview?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load overview data');
    return res.json();
  },

  async reloadData(): Promise<{ status: string; records: number; last_updated: string }> {
    const res = await fetch(`${API_BASE}/reload`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reload data');
    return res.json();
  },

  async getChurnBySegment(dimension: string, contract?: string, tenure_group?: string): Promise<SegmentMetric[]> {
    const params = new URLSearchParams({ dimension });
    if (contract && contract !== 'all') params.append('contract', contract);
    if (tenure_group && tenure_group !== 'all') params.append('tenure_group', tenure_group);
    const res = await fetch(`${API_BASE}/churn-by-segment?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to load segments for ${dimension}`);
    return res.json();
  },

  async getMonthlyChargesDistribution(): Promise<MonthlyChargeBand[]> {
    const res = await fetch(`${API_BASE}/monthly-charges-distribution`);
    if (!res.ok) throw new Error('Failed to load charges distribution');
    return res.json();
  },

  async getProbabilityHistogram(): Promise<HistogramBin[]> {
    const res = await fetch(`${API_BASE}/probability-histogram`);
    if (!res.ok) throw new Error('Failed to load probability histogram');
    return res.json();
  },

  async getRetentionFunnel(): Promise<FunnelStep[]> {
    const res = await fetch(`${API_BASE}/retention-funnel`);
    if (!res.ok) throw new Error('Failed to load retention funnel');
    return res.json();
  },

  async getRiskDistribution(): Promise<RiskBandSummary[]> {
    const res = await fetch(`${API_BASE}/risk-distribution`);
    if (!res.ok) throw new Error('Failed to load risk distribution');
    return res.json();
  },

  async getCustomers(params: {
    search?: string;
    risk_band?: string;
    contract?: string;
    tenure_group?: string;
    internet_service?: string;
    payment_method?: string;
    actual_churn?: number;
    sort_by?: string;
    sort_desc?: boolean;
    page?: number;
    limit?: number;
  }): Promise<CustomersResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.risk_band && params.risk_band !== 'all') query.append('risk_band', params.risk_band);
    if (params.contract && params.contract !== 'all') query.append('contract', params.contract);
    if (params.tenure_group && params.tenure_group !== 'all') query.append('tenure_group', params.tenure_group);
    if (params.internet_service && params.internet_service !== 'all') query.append('internet_service', params.internet_service);
    if (params.payment_method && params.payment_method !== 'all') query.append('payment_method', params.payment_method);
    if (params.actual_churn !== undefined && params.actual_churn !== -1) query.append('actual_churn', String(params.actual_churn));
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_desc !== undefined) query.append('sort_desc', String(params.sort_desc));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/customers?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomerDetail(customerId: string): Promise<CustomerDetail> {
    const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}`);
    if (!res.ok) throw new Error(`Customer ${customerId} not found`);
    return res.json();
  },

  async getModelPerformance(): Promise<Record<string, ModelMetrics>> {
    const res = await fetch(`${API_BASE}/model-performance`);
    if (!res.ok) throw new Error('Failed to load model performance metrics');
    return res.json();
  },

  async getChurnDrivers(): Promise<{
    random_forest: FeatureImportanceItem[];
    logistic_regression: FeatureImportanceItem[];
  }> {
    const res = await fetch(`${API_BASE}/churn-drivers`);
    if (!res.ok) throw new Error('Failed to load churn drivers');
    return res.json();
  },

  async calculateRetentionScenario(req: RetentionScenarioRequest): Promise<RetentionScenarioResponse> {
    const res = await fetch(`${API_BASE}/retention-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to calculate retention scenario');
    return res.json();
  },

  async getMetadata(): Promise<MetadataResponse> {
    const res = await fetch(`${API_BASE}/metadata`);
    if (!res.ok) throw new Error('Failed to load metadata');
    return res.json();
  },

  getExportUrl(params: {
    search?: string;
    risk_band?: string;
    contract?: string;
    tenure_group?: string;
    internet_service?: string;
    payment_method?: string;
    actual_churn?: number;
  }): string {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.risk_band && params.risk_band !== 'all') query.append('risk_band', params.risk_band);
    if (params.contract && params.contract !== 'all') query.append('contract', params.contract);
    if (params.tenure_group && params.tenure_group !== 'all') query.append('tenure_group', params.tenure_group);
    if (params.internet_service && params.internet_service !== 'all') query.append('internet_service', params.internet_service);
    if (params.payment_method && params.payment_method !== 'all') query.append('payment_method', params.payment_method);
    if (params.actual_churn !== undefined && params.actual_churn !== -1) query.append('actual_churn', String(params.actual_churn));
    return `${API_BASE}/export/customers?${query.toString()}`;
  }
};
