import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  BarChart2,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { CustomerItem, RiskBandSummary, HistogramBin } from '../types';
import { api } from '../services/api';

interface ChurnRiskExplorerProps {
  onSelectCustomer: (customerId: string) => void;
}

export const ChurnRiskExplorer: React.FC<ChurnRiskExplorerProps> = ({
  onSelectCustomer,
}) => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [histogramData, setHistogramData] = useState<HistogramBin[]>([]);
  const [riskBands, setRiskBands] = useState<RiskBandSummary[]>([]);

  // Filters state
  const [search, setSearch] = useState('');
  const [riskBand, setRiskBand] = useState('all');
  const [contract, setContract] = useState('all');
  const [tenureGroup, setTenureGroup] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [internetService, setInternetService] = useState('all');
  const [actualChurn, setActualChurn] = useState<number>(-1);

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('churn_probability');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Load summary metrics on mount
  useEffect(() => {
    const loadOverviewDist = async () => {
      try {
        const [hist, bands] = await Promise.all([
          api.getProbabilityHistogram(),
          api.getRiskDistribution(),
        ]);
        setHistogramData(hist);
        setRiskBands(bands);
      } catch (e) {
        console.error(e);
      }
    };
    loadOverviewDist();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers({
        search: search.trim() || undefined,
        risk_band: riskBand !== 'all' ? riskBand : undefined,
        contract: contract !== 'all' ? contract : undefined,
        tenure_group: tenureGroup !== 'all' ? tenureGroup : undefined,
        payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
        internet_service: internetService !== 'all' ? internetService : undefined,
        actual_churn: actualChurn !== -1 ? actualChurn : undefined,
        sort_by: sortBy,
        sort_desc: sortDesc,
        page,
        limit,
      });

      setCustomers(data.items);
      setTotalCount(data.total);
      setTotalPages(data.pages);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [
    search, riskBand, contract, tenureGroup, paymentMethod, internetService,
    actualChurn, sortBy, sortDesc, page, limit
  ]);

  const handleResetFilters = () => {
    setSearch('');
    setRiskBand('all');
    setContract('all');
    setTenureGroup('all');
    setPaymentMethod('all');
    setInternetService('all');
    setActualChurn(-1);
    setPage(1);
  };

  const handleSortToggle = (col: string) => {
    if (sortBy === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(col);
      setSortDesc(true);
    }
    setPage(1);
  };

  const handleExport = () => {
    const url = api.getExportUrl({
      search: search.trim() || undefined,
      risk_band: riskBand !== 'all' ? riskBand : undefined,
      contract: contract !== 'all' ? contract : undefined,
      tenure_group: tenureGroup !== 'all' ? tenureGroup : undefined,
      payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
      internet_service: internetService !== 'all' ? internetService : undefined,
      actual_churn: actualChurn !== -1 ? actualChurn : undefined,
    });
    window.open(url, '_blank');
  };

  const getRiskBadge = (band: string) => {
    switch (band) {
      case 'High':
        return 'bg-[#FF6B78]/15 text-[#FF6B78] border-[#FF6B78]/40';
      case 'Medium':
        return 'bg-[#FFBE69]/15 text-[#FFBE69] border-[#FFBE69]/40';
      case 'Low':
        return 'bg-[#5DE2B1]/15 text-[#5DE2B1] border-[#5DE2B1]/40';
      default:
        return 'bg-[#1C2130] text-[#9299AD]';
    }
  };

  const hasActiveFilters = Boolean(
    search ||
    riskBand !== 'all' ||
    contract !== 'all' ||
    tenureGroup !== 'all' ||
    paymentMethod !== 'all' ||
    internetService !== 'all' ||
    actualChurn !== -1
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Risk Histogram & Exposure Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Probability Histogram (7 cols) */}
        <div className="lg:col-span-7 card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Model Probability Distribution
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Customer Volume by Churn Probability Decile
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8B7CFF]">10 Decile Bins</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#292F40" vertical={false} />
                <XAxis dataKey="bin_range" stroke="#9299AD" fontSize={9} />
                <YAxis stroke="#687187" fontSize={9} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#10131D] border border-[#292F40] p-2 rounded text-xs font-mono">
                          <p className="font-bold text-[#F3F5FA]">{d.bin_range}</p>
                          <p className="text-[#8B7CFF]">Accounts: {d.count.toLocaleString()}</p>
                          <p className="text-[#FF6B78]">Empirical Churn: {d.churn_rate}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#8B7CFF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>Low Deciles (&lt;20%): 2,398 accts</span>
            <span className="text-[#FF6B78]">High Deciles (&gt;80%): 1,039 accts (71% churn)</span>
          </div>
        </div>

        {/* Risk Bands & Revenue Exposure (5 cols) */}
        <div className="lg:col-span-5 card-panel p-3.5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                Exposure by Band
              </span>
              <span className="text-xs font-semibold text-[#F3F5FA]">
                Revenue Exposure & Cutoffs
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#55D9E8]">$455.7k total MRR</span>
          </div>

          <div className="space-y-2 py-1">
            {riskBands.map((band) => (
              <div
                key={band.band}
                onClick={() => setRiskBand(band.band)}
                className={`p-2 rounded bg-[#1C2130] border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                  riskBand === band.band ? 'border-[#8B7CFF]' : 'border-[#292F40] hover:border-[#363E54]'
                }`}
              >
                <div>
                  <div className="font-bold text-[#F3F5FA] flex items-center gap-1.5 font-sans">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        band.band === 'High'
                          ? 'bg-[#FF6B78]'
                          : band.band === 'Medium'
                          ? 'bg-[#FFBE69]'
                          : 'bg-[#5DE2B1]'
                      }`}
                    />
                    <span>{band.band} Risk ({band.probability_range})</span>
                  </div>
                  <div className="text-[10px] text-[#9299AD]">
                    {band.customers.toLocaleString()} accounts ({band.customer_pct}%)
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#F3F5FA]">
                    ${Math.round(band.monthly_revenue_exposure).toLocaleString()}/mo
                  </div>
                  <div className="text-[10px] text-[#55D9E8]">{band.revenue_pct}% of total billing</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-[#9299AD] flex items-center justify-between border-t border-[#292F40]/60 pt-2 font-mono">
            <span>Click band to filter table</span>
            <span className="text-[#8B7CFF]">Standard: ≤40%, 40-70%, &gt;70%</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-panel p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9299AD]" />
            <input
              type="text"
              placeholder="Search Customer ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded pl-8 pr-3 py-1.5 text-xs text-[#F3F5FA] placeholder-[#9299AD]/60 focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#FF6B78] bg-[#FF6B78]/10 border border-[#FF6B78]/30 rounded hover:bg-[#FF6B78]/20 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#0B0D14] bg-[#8B7CFF] hover:bg-[#7968FA] rounded transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Query CSV</span>
            </button>
          </div>
        </div>

        {/* 6 Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-1 border-t border-[#292F40]/60">
          <div>
            <label className="text-[10px] font-bold text-[#9299AD] uppercase font-mono block mb-1">
              Risk Band
            </label>
            <select
              value={riskBand}
              onChange={(e) => {
                setRiskBand(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-[#F3F5FA] focus:outline-none focus:border-[#8B7CFF]"
            >
              <option value="all">All Bands</option>
              <option value="High">High (&gt;70%)</option>
              <option value="Medium">Medium (40-70%)</option>
              <option value="Low">Low (≤40%)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9299AD] uppercase font-mono block mb-1">
              Contract
            </label>
            <select
              value={contract}
              onChange={(e) => {
                setContract(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-[#F3F5FA] focus:outline-none focus:border-[#8B7CFF]"
            >
              <option value="all">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9299AD] uppercase font-mono block mb-1">
              Tenure
            </label>
            <select
              value={tenureGroup}
              onChange={(e) => {
                setTenureGroup(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-[#F3F5FA] focus:outline-none focus:border-[#8B7CFF]"
            >
              <option value="all">All Tenures</option>
              <option value="0-12 months">0-12 months</option>
              <option value="13-24 months">13-24 months</option>
              <option value="25-48 months">25-48 months</option>
              <option value="49+ months">49+ months</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9299AD] uppercase font-mono block mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-[#F3F5FA] focus:outline-none focus:border-[#8B7CFF]"
            >
              <option value="all">All Methods</option>
              <option value="Electronic check">Electronic check</option>
              <option value="Mailed check">Mailed check</option>
              <option value="Bank transfer (automatic)">Bank transfer (auto)</option>
              <option value="Credit card (automatic)">Credit card (auto)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9299AD] uppercase font-mono block mb-1">
              Internet Service
            </label>
            <select
              value={internetService}
              onChange={(e) => {
                setInternetService(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-[#F3F5FA] focus:outline-none focus:border-[#8B7CFF]"
            >
              <option value="all">All Services</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="DSL">DSL</option>
              <option value="No">No Internet</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9299AD] uppercase font-mono block mb-1">
              Historical Outcome
            </label>
            <select
              value={actualChurn}
              onChange={(e) => {
                setActualChurn(Number(e.target.value));
                setPage(1);
              }}
              className="w-full bg-[#10131D] border border-[#292F40] rounded px-2 py-1 text-[#F3F5FA] focus:outline-none focus:border-[#8B7CFF]"
            >
              <option value={-1}>All Statuses</option>
              <option value={1}>Churned (Yes)</option>
              <option value={0}>Retained (No)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="card-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#10131D] text-[#9299AD] border-b border-[#292F40] font-mono uppercase text-[10px]">
              <tr>
                <th onClick={() => handleSortToggle('customer_id')} className="py-2.5 px-3 cursor-pointer hover:text-[#F3F5FA]">
                  Customer ID
                </th>
                <th onClick={() => handleSortToggle('churn_probability')} className="py-2.5 px-3 cursor-pointer hover:text-[#F3F5FA]">
                  Risk Probability
                </th>
                <th className="py-2.5 px-3">Band</th>
                <th className="py-2.5 px-3">Contract</th>
                <th onClick={() => handleSortToggle('tenure')} className="py-2.5 px-3 cursor-pointer hover:text-[#F3F5FA]">
                  Tenure
                </th>
                <th onClick={() => handleSortToggle('monthly_charges')} className="py-2.5 px-3 cursor-pointer hover:text-[#F3F5FA]">
                  Monthly Charges
                </th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Historical Outcome</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292F40]/60 text-[#F3F5FA]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-[#9299AD]">
                    <div className="w-6 h-6 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-[#9299AD]">
                    No accounts match the current filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.customer_id}
                    onClick={() => onSelectCustomer(c.customer_id)}
                    className="hover:bg-[#1C2130] cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#F3F5FA] group-hover:text-[#8B7CFF]">
                      {c.customer_id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#10131D] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              c.churn_probability > 0.70
                                ? 'bg-[#FF6B78]'
                                : c.churn_probability > 0.40
                                ? 'bg-[#FFBE69]'
                                : 'bg-[#5DE2B1]'
                            }`}
                            style={{ width: `${c.churn_probability * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold">
                          {(c.churn_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border ${getRiskBadge(c.risk_band)}`}>
                        {c.risk_band}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#9299AD] font-medium">{c.contract}</td>
                    <td className="py-2.5 px-3 font-mono">{c.tenure} mos</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#F3F5FA]">
                      ${c.monthly_charges.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-[#9299AD] truncate max-w-[140px]" title={c.payment_method}>
                      {c.payment_method}
                    </td>

                    <td className="py-2.5 px-3">
                      {c.actual_churn === 1 ? (
                        <span className="text-[10px] text-[#FF6B78] font-mono bg-[#FF6B78]/10 px-1.5 py-0.5 rounded">
                          Churned
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#5DE2B1] font-mono bg-[#5DE2B1]/10 px-1.5 py-0.5 rounded">
                          Stayed
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(c.customer_id);
                        }}
                        className="p-1 rounded bg-[#10131D] text-[#9299AD] group-hover:text-[#F3F5FA] group-hover:bg-[#292F40] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#10131D] border-t border-[#292F40] flex items-center justify-between text-xs text-[#9299AD] font-mono">
          <span>
            Page {page} of {totalPages} ({totalCount.toLocaleString()} total accounts)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded bg-[#171B27] border border-[#292F40] hover:bg-[#1C2130] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded bg-[#171B27] border border-[#292F40] hover:bg-[#1C2130] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
