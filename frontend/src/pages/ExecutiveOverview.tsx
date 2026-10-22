import React, { useEffect, useState } from 'react';
import {
  Users,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  BarChart3,
  CreditCard,
  Search,
  Download,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import {
  KPISummary, KeyInsight, RiskBandSummary, SegmentMetric,
  MonthlyChargeBand, HistogramBin, FunnelStep, CustomerItem, GlobalFilters
} from '../types';
import { api } from '../services/api';

interface ExecutiveOverviewProps {
  filters: GlobalFilters;
  onFilterChange: (filters: GlobalFilters) => void;
  onSelectCustomer: (customerId: string) => void;
  onNavigateTo: (page: string) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  filters,
  onFilterChange,
  onSelectCustomer,
  onNavigateTo,
}) => {
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [riskDist, setRiskDist] = useState<RiskBandSummary[]>([]);
  const [chargesDist, setChargesDist] = useState<MonthlyChargeBand[]>([]);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [contractSegments, setContractSegments] = useState<SegmentMetric[]>([]);
  const [tenureSegments, setTenureSegments] = useState<SegmentMetric[]>([]);
  const [paymentSegments, setPaymentSegments] = useState<SegmentMetric[]>([]);
  const [internetSegments, setInternetSegments] = useState<SegmentMetric[]>([]);

  // Customer table state inside Command Center
  const [attentionCustomers, setAttentionCustomers] = useState<CustomerItem[]>([]);
  const [totalAttention, setTotalAttention] = useState(0);
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);
  const [tableRiskFilter, setTableRiskFilter] = useState('High');
  const [tableSearch, setTableSearch] = useState('');
  const [serviceInsightTab, setServiceInsightTab] = useState<'payment' | 'internet'>('payment');

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Overview Data
  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overviewData, contractData, tenureData, paymentData, internetData] =
          await Promise.all([
            api.getOverview(filters.contract, filters.tenure_group),
            api.getChurnBySegment('Contract'),
            api.getChurnBySegment('tenure_group'),
            api.getChurnBySegment('PaymentMethod'),
            api.getChurnBySegment('InternetService'),
          ]);

        setKpis(overviewData.kpis);
        setInsights(overviewData.insights);
        setRiskDist(overviewData.risk_distribution);
        setChargesDist(overviewData.monthly_charges_distribution);
        setFunnelSteps(overviewData.retention_funnel);
        setContractSegments(contractData);
        setTenureSegments(tenureData);
        setPaymentSegments(paymentData);
        setInternetSegments(internetData);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [filters.contract, filters.tenure_group]);

  // Load Bottom Attention Customer Table
  useEffect(() => {
    const fetchTableCustomers = async () => {
      setTableLoading(true);
      try {
        const data = await api.getCustomers({
          search: tableSearch.trim() || undefined,
          risk_band: tableRiskFilter !== 'all' ? tableRiskFilter : undefined,
          contract: filters.contract !== 'all' ? filters.contract : undefined,
          tenure_group: filters.tenure_group !== 'all' ? filters.tenure_group : undefined,
          sort_by: 'churn_probability',
          sort_desc: true,
          page: tablePage,
          limit: tableLimit,
        });
        setAttentionCustomers(data.items);
        setTotalAttention(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setTableLoading(false);
      }
    };

    fetchTableCustomers();
  }, [tableRiskFilter, tableSearch, tablePage, tableLimit, filters.contract, filters.tenure_group]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9299AD] font-mono">Loading RETAINIQ Command Center...</p>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="p-4 rounded-lg bg-[#FF6B78]/10 border border-[#FF6B78]/30 text-[#FF6B78] text-xs">
        <p className="font-bold">Failed to load command center data</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  // Donut data for churn breakdown
  const donutData = [
    { name: 'Retained', value: kpis.retained_customers, color: '#5DE2B1' },
    { name: 'Churned', value: kpis.churned_customers, color: '#FF6B78' },
  ];

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#10131D] border border-[#292F40] p-2.5 rounded shadow-xl text-[11px] space-y-1 font-mono">
          <p className="font-bold text-[#F3F5FA] font-sans">{label || data.name || data.segment_name || data.band}</p>
          {data.churn_rate !== undefined && (
            <p className="text-[#FF6B78]">
              Churn Rate: <span className="font-bold">{data.churn_rate}%</span>
            </p>
          )}
          {data.customers !== undefined && (
            <p className="text-[#9299AD]">
              Accounts: <span className="text-[#F3F5FA] font-bold">{data.customers.toLocaleString()}</span>
            </p>
          )}
          {data.count !== undefined && (
            <p className="text-[#9299AD]">
              Accounts: <span className="text-[#F3F5FA] font-bold">{data.count.toLocaleString()}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getRiskBadgeStyle = (band: string) => {
    switch (band) {
      case 'High':
        return 'bg-[#FF6B78]/15 text-[#FF6B78] border-[#FF6B78]/30';
      case 'Medium':
        return 'bg-[#FFBE69]/15 text-[#FFBE69] border-[#FFBE69]/30';
      case 'Low':
        return 'bg-[#5DE2B1]/15 text-[#5DE2B1] border-[#5DE2B1]/30';
      default:
        return 'bg-[#1C2130] text-[#9299AD]';
    }
  };

  const highBand = riskDist.find((b) => b.band === 'High');

  return (
    <div className="space-y-4 pb-12">
      {/* 0. ACTIVE FILTER SCOPE BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#171B27] border border-[#292F40] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8B7CFF]" />
          <span className="text-[#9299AD]">Population Scope:</span>
          <span className="text-[#F3F5FA] font-bold">
            {filters.contract !== 'all' ? `${filters.contract} Contract` : 'All Contracts'}
            {filters.tenure_group !== 'all' ? ` • ${filters.tenure_group}` : ''}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#1C2130] text-[#55D9E8] font-bold">
            {kpis.total_customers.toLocaleString()} accounts ({((kpis.total_customers / 7032) * 100).toFixed(1)}% of total database)
          </span>
        </div>
        {(filters.contract !== 'all' || filters.tenure_group !== 'all') && (
          <button
            onClick={() => onFilterChange({ contract: 'all', tenure_group: 'all' })}
            className="flex items-center gap-1 text-[11px] text-[#FF6B78] hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear filters (view full 7,032 database)</span>
          </button>
        )}
      </div>

      {/* 1. TOP ROW: SIX COMPACT KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Card 1: Total Customers */}
        <MetricCard
          title="Total Customers"
          value={kpis.total_customers.toLocaleString()}
          subtitle={filters.contract !== 'all' ? `${filters.contract} segment` : "IBM Telco full database"}
          badge={{ text: filters.contract !== 'all' ? 'Filtered' : 'Verified', variant: filters.contract !== 'all' ? 'cyan' : 'neutral' }}
          progressPercent={(kpis.total_customers / 7032) * 100}
          progressColor="#8B7CFF"
        />

        {/* Card 2: Churn Rate */}
        <MetricCard
          title="Churn Rate"
          value={`${kpis.overall_churn_rate}%`}
          subtitle={`vs ${(100 - kpis.overall_churn_rate).toFixed(1)}% retained`}
          badge={{ text: kpis.overall_churn_rate >= 30 ? 'Critical' : 'Elevated', variant: 'coral' }}
          progressPercent={kpis.overall_churn_rate}
          progressColor="#FF6B78"
          ratioLabel={`${kpis.overall_churn_rate}%`}
        />

        {/* Card 3: Churned Customers */}
        <MetricCard
          title="Churned Customers"
          value={kpis.churned_customers.toLocaleString()}
          subtitle={`${kpis.retained_customers.toLocaleString()} retained`}
          badge={{ text: 'Historical', variant: 'coral' }}
          progressPercent={(kpis.churned_customers / kpis.total_customers) * 100}
          progressColor="#FF6B78"
        />

        {/* Card 4: High-Risk Customers */}
        <MetricCard
          title="High-Risk Accounts"
          value={kpis.high_risk_customers.toLocaleString()}
          subtitle="Prob > 70% (model cutoff)"
          badge={{ text: 'Urgent', variant: 'coral' }}
          progressPercent={(kpis.high_risk_customers / kpis.total_customers) * 100}
          progressColor="#FF6B78"
          ratioLabel={`${((kpis.high_risk_customers / kpis.total_customers) * 100).toFixed(1)}%`}
        />

        {/* Card 5: Monthly Revenue Exposure */}
        <MetricCard
          title="Est. Revenue Exposure"
          value={`$${Math.round(kpis.monthly_revenue_at_risk).toLocaleString()}`}
          subtitle={`${kpis.monthly_revenue_at_risk_pct}% of scope MRR (Est.)`}
          badge={{ text: 'Exposure', variant: 'violet' }}
          progressPercent={kpis.monthly_revenue_at_risk_pct}
          progressColor="#8B7CFF"
        />

        {/* Card 6: Model ROC-AUC */}
        <MetricCard
          title="Model ROC-AUC"
          value="0.835"
          subtitle="Held-out 20% test split"
          badge={{ text: 'Verified', variant: 'cyan' }}
          progressPercent={83.5}
          progressColor="#55D9E8"
          ratioLabel="Recall 80.2%"
        />
      </div>

      {/* 2. MAIN VISUALIZATION GRID: 3-COLUMN COMPACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Card A: Churn Distribution Donut */}
        <div className="card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Card A: Churn Distribution
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Customer Retention Ratio
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2130] text-[#55D9E8] font-bold">
                {filters.contract !== 'all' ? `${filters.contract} Scope` : 'Full Scope'}
              </span>
              <span className="text-[10px] font-mono text-[#9299AD]">{kpis.total_customers.toLocaleString()} accounts</span>
            </div>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#10131D"
                  strokeWidth={2}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-extrabold font-mono text-[#F3F5FA]">
                {kpis.total_customers.toLocaleString()}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#9299AD] font-mono">
                Total Accts
              </span>
            </div>
          </div>

          <div className="flex items-center justify-around text-xs border-t border-[#292F40]/60 pt-2 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5DE2B1]" />
              <span className="text-[#9299AD]">Retained:</span>
              <span className="font-bold text-[#F3F5FA]">
                {kpis.retained_customers.toLocaleString()} ({((kpis.retained_customers / kpis.total_customers) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B78]" />
              <span className="text-[#9299AD]">Churned:</span>
              <span className="font-bold text-[#FF6B78]">
                {kpis.churned_customers.toLocaleString()} ({kpis.overall_churn_rate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card B: Contract Risk Horizontal Bars */}
        <div className="card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Card B: Contract Risk
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Churn Rate by Agreement
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 font-bold">
                Full-Dataset Benchmark
              </span>
              <span className="text-[10px] font-mono text-[#FF6B78] font-bold bg-[#FF6B78]/10 px-1.5 py-0.5 rounded">
                M2M: 42.7%
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contractSegments}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#292F40" horizontal={false} />
                <XAxis type="number" unit="%" stroke="#687187" fontSize={10} domain={[0, 50]} />
                <YAxis
                  dataKey="segment_name"
                  type="category"
                  stroke="#9299AD"
                  fontSize={11}
                  width={90}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="churn_rate"
                  fill="#8B7CFF"
                  radius={[0, 3, 3, 0]}
                  onClick={(entry) =>
                    onFilterChange({
                      ...filters,
                      contract: entry.segment_name === filters.contract ? 'all' : entry.segment_name,
                    })
                  }
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>Click bar to switch active contract filter</span>
            <span className="text-[#8B7CFF]">
              {filters.contract !== 'all' ? `Filtered to: ${filters.contract}` : 'All 3 Contracts (7,032)'}
            </span>
          </div>
        </div>

        {/* Card C: Customer Health Map (Segmented Risk Map) */}
        <div className="card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Card C: Customer Health Map
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Model Risk Calibration
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2130] text-[#55D9E8] font-bold">
                {filters.contract !== 'all' ? `${filters.contract} Scope` : 'Full Scope'}
              </span>
              <span className="text-[10px] font-mono text-[#8B7CFF]">Out-of-fold</span>
            </div>
          </div>

          <div className="space-y-2 py-1">
            {riskDist.map((band) => (
              <div
                key={band.band}
                className="p-2 rounded bg-[#1C2130] border border-[#292F40] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      band.band === 'High'
                        ? 'bg-[#FF6B78]'
                        : band.band === 'Medium'
                        ? 'bg-[#FFBE69]'
                        : 'bg-[#5DE2B1]'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-[#F3F5FA] font-sans">{band.band} Risk</span>
                    <span className="text-[10px] text-[#9299AD] ml-1.5">({band.probability_range})</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#F3F5FA]">
                    {band.customers.toLocaleString()} <span className="text-[10px] text-[#9299AD]">({band.customer_pct}%)</span>
                  </div>
                  <div className="text-[10px] text-[#9299AD]">
                    Est. Exp: ${Math.round(band.monthly_revenue_exposure).toLocaleString()}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>High Band Churn: {highBand ? `${highBand.churn_rate_in_band}%` : '62.9%'}</span>
            <span className="text-[#FF6B78]">
              Est. Exposure: ${highBand ? `${(highBand.monthly_revenue_exposure / 1000).toFixed(1)}k/mo` : '$141.3k/mo'}
            </span>
          </div>
        </div>

        {/* Card D: Customer Tenure Analysis */}
        <div className="card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Card D: Customer Tenure
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Lifecycle Churn Curve
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 font-bold">
                Full-Dataset Benchmark
              </span>
              <span className="text-[10px] font-mono text-[#55D9E8] font-bold bg-[#55D9E8]/10 px-1.5 py-0.5 rounded">
                0-12m: 47.7%
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tenureSegments}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#292F40" horizontal={false} />
                <XAxis type="number" unit="%" stroke="#687187" fontSize={10} domain={[0, 55]} />
                <YAxis
                  dataKey="segment_name"
                  type="category"
                  stroke="#9299AD"
                  fontSize={11}
                  width={85}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="churn_rate"
                  fill="#55D9E8"
                  radius={[0, 3, 3, 0]}
                  onClick={(entry) =>
                    onFilterChange({
                      ...filters,
                      tenure_group: entry.segment_name === filters.tenure_group ? 'all' : entry.segment_name,
                    })
                  }
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>5x drop: 47.7% to 9.5%</span>
            <span className="text-[#55D9E8]">
              {filters.tenure_group !== 'all' ? `Filtered to: ${filters.tenure_group}` : 'All 4 Lifecycle Tiers'}
            </span>
          </div>
        </div>

        {/* Card E: Monthly Charges Analysis */}
        <div className="card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Card E: Monthly Charges
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Binned Tier Risk
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2130] text-[#55D9E8] font-bold">
                {filters.contract !== 'all' ? `${filters.contract} Scope` : 'Full Scope'}
              </span>
              <span className="text-[10px] font-mono text-[#FFBE69] font-bold bg-[#FFBE69]/10 px-1.5 py-0.5 rounded">
                $60-90: 33.8%
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chargesDist}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#292F40" vertical={false} />
                <XAxis dataKey="band" stroke="#9299AD" fontSize={10} />
                <YAxis unit="%" stroke="#687187" fontSize={10} domain={[0, 40]} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="churn_rate" fill="#FFBE69" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>Lowest churn: &lt;$30 (9.8%)</span>
            <span className="text-[#FFBE69]">&gt;$60: elevated churn</span>
          </div>
        </div>

        {/* Card F: Payment & Service Insights */}
        <div className="card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Card F: Payment & Service
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  onClick={() => setServiceInsightTab('payment')}
                  className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded transition-colors ${
                    serviceInsightTab === 'payment'
                      ? 'bg-[#8B7CFF] text-[#0B0D14]'
                      : 'text-[#9299AD] hover:text-[#F3F5FA]'
                  }`}
                >
                  Payment Method
                </button>
                <button
                  onClick={() => setServiceInsightTab('internet')}
                  className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded transition-colors ${
                    serviceInsightTab === 'internet'
                      ? 'bg-[#55D9E8] text-[#0B0D14]'
                      : 'text-[#9299AD] hover:text-[#F3F5FA]'
                  }`}
                >
                  Internet Service
                </button>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 font-bold ml-auto">
                  Full-Dataset Benchmark
                </span>
              </div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceInsightTab === 'payment' ? paymentSegments : internetSegments}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#292F40" horizontal={false} />
                <XAxis type="number" unit="%" stroke="#687187" fontSize={10} domain={[0, 50]} />
                <YAxis
                  dataKey="segment_name"
                  type="category"
                  stroke="#9299AD"
                  fontSize={10}
                  width={95}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="churn_rate"
                  fill={serviceInsightTab === 'payment' ? '#FF6B78' : '#55D9E8'}
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>
              {serviceInsightTab === 'payment'
                ? 'E-Check friction: 45.3%'
                : 'Fiber Optic: 41.9%'}
            </span>
            <span className="text-[#F3F5FA]">Tooltips show counts</span>
          </div>
        </div>
      </div>

      {/* 3. MID ROW: RETENTION FUNNEL & SIGNALS WORTH WATCHING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Retention Funnel (5 cols) */}
        <div className="lg:col-span-5 card-panel p-3.5 space-y-3 flex flex-col justify-between">
          <div className="border-b border-[#292F40] pb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Analytical Progression
              </span>
              <h3 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8B7CFF]" />
                <span>Retention Targeting Funnel</span>
              </h3>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2130] text-[#55D9E8] font-bold">
              {filters.contract !== 'all' ? `${filters.contract} Scope` : 'Full Scope (7,032)'}
            </span>
          </div>

          <div className="space-y-2">
            {funnelSteps.map((step, idx) => (
              <div
                key={step.step_id}
                onClick={() => {
                  if (step.step_id === 'm2m_high_risk') {
                    onFilterChange({ ...filters, contract: 'Month-to-month' });
                  } else if (step.step_id === 'early_tenure_high_risk') {
                    onFilterChange({ contract: 'Month-to-month', tenure_group: '0-12 months' });
                  } else {
                    onFilterChange({ contract: 'all', tenure_group: 'all' });
                  }
                }}
                className="p-2.5 rounded bg-[#1C2130] border border-[#292F40] hover:border-[#8B7CFF]/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#10131D] text-[#8B7CFF] text-[10px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[#F3F5FA] group-hover:text-[#8B7CFF] transition-colors">
                      {step.name}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-[#F3F5FA]">{step.count.toLocaleString()}</span>
                    <span className="text-[10px] text-[#9299AD] ml-1">({step.percentage_of_total}%)</span>
                  </div>
                </div>

                <div className="w-full bg-[#10131D] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B7CFF] to-[#55D9E8] rounded-full"
                    style={{ width: `${step.percentage_of_total}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#9299AD] mt-1 font-mono">
                  <span>{step.description}</span>
                  <span className="text-[#55D9E8] font-semibold">${Math.round(step.monthly_revenue_exposure).toLocaleString()}/mo</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AD] border-t border-[#292F40]/60 pt-2 font-mono flex justify-between">
            <span>Click stage to filter customer table</span>
            <button
              onClick={() => onNavigateTo('strategy')}
              className="text-[#8B7CFF] hover:underline flex items-center gap-1 font-sans font-semibold"
            >
              <span>Launch Lab</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Signals Worth Watching (7 cols) */}
        <div className="lg:col-span-7 card-panel p-3.5 space-y-3 flex flex-col justify-between">
          <div className="border-b border-[#292F40] pb-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Empirical Signals
              </span>
              <h3 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5DE2B1]" />
                <span>Signals Worth Watching</span>
              </h3>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 font-bold">
              Full-Dataset Benchmark
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.slice(0, 4).map((ins) => (
              <div
                key={ins.id}
                className="p-2.5 rounded bg-[#1C2130] border border-[#292F40] hover:border-[#363E54] transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.2 rounded bg-[#10131D] text-[#8B7CFF]">
                    {ins.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#FF6B78] bg-[#FF6B78]/10 px-1.5 py-0.2 rounded">
                    {ins.impact}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#F3F5FA]">{ins.title}</div>
                <div className="text-[11px] text-[#9299AD] leading-snug">{ins.description}</div>

                <div className="text-[10px] text-[#5DE2B1] pt-1 border-t border-[#292F40]/60 leading-tight">
                  <span className="font-bold">Business relevance:</span> {ins.business_relevance}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AD] border-t border-[#292F40]/60 pt-2 font-mono flex items-center justify-between">
            <span>Deterministic templates from verified snapshot calculations</span>
            <button
              onClick={() => onNavigateTo('drivers')}
              className="text-[#5DE2B1] hover:underline flex items-center gap-1 font-sans font-semibold"
            >
              <span>View Churn Drivers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: CUSTOMERS REQUIRING ATTENTION TABLE */}
      <div className="card-panel p-4 space-y-3">
        {/* Table Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#292F40] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF6B78]" />
              <h3 className="text-sm font-bold text-[#F3F5FA]">
                Customers Requiring Attention
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2130] text-[#55D9E8] font-bold">
                {filters.contract !== 'all' ? `${filters.contract} Scope` : 'Full Scope'} ({totalAttention.toLocaleString()} matching)
              </span>
            </div>
            <p className="text-[11px] text-[#9299AD] mt-0.5 font-mono">
              Accounts sorted by predicted churn probability. Click row for intelligence drawer.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9299AD]" />
              <input
                type="text"
                placeholder="Search ID..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setTablePage(1);
                }}
                className="w-36 bg-[#10131D] border border-[#292F40] rounded pl-7 pr-2 py-1 text-xs text-[#F3F5FA] placeholder-[#9299AD]/60 focus:outline-none focus:border-[#8B7CFF]"
              />
            </div>

            <select
              value={tableRiskFilter}
              onChange={(e) => {
                setTableRiskFilter(e.target.value);
                setTablePage(1);
              }}
              className="bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-xs text-[#F3F5FA] focus:outline-none"
            >
              <option value="High">High Risk (&gt;70%)</option>
              <option value="Medium">Medium Risk (40-70%)</option>
              <option value="Low">Low Risk (≤40%)</option>
              <option value="all">All Accounts</option>
            </select>

            <button
              onClick={() => onNavigateTo('explorer')}
              className="text-xs font-semibold text-[#8B7CFF] hover:underline flex items-center gap-1 ml-1"
            >
              <span>Full Explorer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#10131D] text-[#9299AD] border-b border-[#292F40] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Predicted Risk</th>
                <th className="py-2.5 px-3">Churn Probability</th>
                <th className="py-2.5 px-3">Contract</th>
                <th className="py-2.5 px-3">Tenure</th>
                <th className="py-2.5 px-3">Monthly Charges</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Actual Churn Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292F40]/60 text-[#F3F5FA]">
              {tableLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#9299AD]">
                    <div className="w-5 h-5 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : attentionCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#9299AD]">
                    No accounts found matching search criteria.
                  </td>
                </tr>
              ) : (
                attentionCustomers.map((cust) => (
                  <tr
                    key={cust.customer_id}
                    onClick={() => onSelectCustomer(cust.customer_id)}
                    className="hover:bg-[#1C2130] cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-3 font-mono font-semibold text-[#F3F5FA] group-hover:text-[#8B7CFF]">
                      {cust.customer_id}
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border ${getRiskBadgeStyle(
                          cust.risk_band
                        )}`}
                      >
                        {cust.risk_band}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#10131D] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              cust.churn_probability > 0.70
                                ? 'bg-[#FF6B78]'
                                : cust.churn_probability > 0.40
                                ? 'bg-[#FFBE69]'
                                : 'bg-[#5DE2B1]'
                            }`}
                            style={{ width: `${cust.churn_probability * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold">
                          {(cust.churn_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-3 text-[#9299AD] font-medium">{cust.contract}</td>
                    <td className="py-2 px-3 font-mono">{cust.tenure} mos</td>
                    <td className="py-2 px-3 font-mono font-semibold text-[#F3F5FA]">
                      ${cust.monthly_charges.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-[#9299AD] truncate max-w-[140px]" title={cust.payment_method}>
                      {cust.payment_method}
                    </td>

                    <td className="py-2 px-3">
                      {cust.actual_churn === 1 ? (
                        <span className="text-[10px] text-[#FF6B78] font-mono bg-[#FF6B78]/10 px-1.5 py-0.5 rounded">
                          Churned
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#5DE2B1] font-mono bg-[#5DE2B1]/10 px-1.5 py-0.5 rounded">
                          Stayed
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(cust.customer_id);
                        }}
                        className="p-1 rounded bg-[#10131D] text-[#9299AD] group-hover:text-[#F3F5FA] group-hover:bg-[#292F40] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-[#9299AD] pt-2 border-t border-[#292F40] font-mono">
          <span>
            Showing {attentionCustomers.length} of {totalAttention.toLocaleString()} accounts
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={tablePage <= 1}
              onClick={() => setTablePage(tablePage - 1)}
              className="p-1 rounded bg-[#171B27] border border-[#292F40] text-[#9299AD] hover:text-[#F3F5FA] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Page {tablePage} of {Math.ceil(totalAttention / tableLimit) || 1}
            </span>
            <button
              disabled={tablePage >= Math.ceil(totalAttention / tableLimit)}
              onClick={() => setTablePage(tablePage + 1)}
              className="p-1 rounded bg-[#171B27] border border-[#292F40] text-[#9299AD] hover:text-[#F3F5FA] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
