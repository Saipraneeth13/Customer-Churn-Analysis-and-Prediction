import React, { useEffect, useState } from 'react';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  Sparkles,
  Calculator,
  RefreshCw,
  Scale
} from 'lucide-react';
import { RetentionScenarioRequest, RetentionScenarioResponse } from '../types';
import { api } from '../services/api';

export const RetentionStrategyLab: React.FC = () => {
  const presets = [
    {
      id: 'month_to_month_high_risk',
      name: 'Month-to-Month High Risk',
      description: 'Month-to-month subscribers with >70% predicted churn risk',
      recommendedOffer: 25,
      recommendedSuccessRate: 0.20,
      priority: 'Highest Leverage'
    },
    {
      id: 'first_year_high_risk',
      name: 'First-Year High Risk (0-12m)',
      description: 'Tenure ≤ 12 months accounts with >70% predicted churn risk',
      recommendedOffer: 30,
      recommendedSuccessRate: 0.22,
      priority: 'Early Lifecycle'
    },
    {
      id: 'high_charge_high_risk',
      name: 'High ARPU High Risk ($70+/mo)',
      description: 'Premium revenue accounts with >70% predicted churn risk',
      recommendedOffer: 40,
      recommendedSuccessRate: 0.18,
      priority: 'MRR Protection'
    },
    {
      id: 'all_high_risk',
      name: 'All High-Risk Accounts (>70%)',
      description: 'Entire predicted high-risk population across all contracts',
      recommendedOffer: 20,
      recommendedSuccessRate: 0.15,
      priority: 'Broad Target'
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState(presets[0].id);
  const [offerCost, setOfferCost] = useState(presets[0].recommendedOffer);
  const [successRate, setSuccessRate] = useState(presets[0].recommendedSuccessRate);
  const [targetLimit, setTargetLimit] = useState<number | undefined>(undefined);

  const [scenarioResult, setScenarioResult] = useState<RetentionScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<RetentionScenarioResponse[]>([]);

  const calculateScenario = async (
    segment: string,
    cost: number,
    rate: number,
    limit?: number
  ) => {
    setLoading(true);
    try {
      const res = await api.calculateRetentionScenario({
        target_segment: segment,
        offer_cost_per_customer: cost,
        assumed_success_rate: rate,
        target_customer_limit: limit,
      });
      setScenarioResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateScenario(selectedPreset, offerCost, successRate, targetLimit);
  }, [selectedPreset, offerCost, successRate, targetLimit]);

  useEffect(() => {
    const loadComparisons = async () => {
      try {
        const promises = presets.map((p) =>
          api.calculateRetentionScenario({
            target_segment: p.id,
            offer_cost_per_customer: p.recommendedOffer,
            assumed_success_rate: p.recommendedSuccessRate,
          })
        );
        const results = await Promise.all(promises);
        setComparisonResults(results);
      } catch (e) {
        console.error(e);
      }
    };
    loadComparisons();
  }, []);

  const handleSelectPreset = (p: typeof presets[0]) => {
    setSelectedPreset(p.id);
    setOfferCost(p.recommendedOffer);
    setSuccessRate(p.recommendedSuccessRate);
    setTargetLimit(undefined);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Editorial Header */}
      <div className="card-panel p-4 bg-gradient-to-r from-[#171B27] via-[#1C2130] to-[#171B27] border-[#292F40] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#F3F5FA] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8B7CFF]" />
            <span>Retention Strategy & Economic Simulation Lab</span>
          </h2>
          <p className="text-xs text-[#9299AD] mt-0.5">
            Interactive financial sensitivity modeling: test offer costs and assumed conversion rates to determine campaign break-even thresholds
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#55D9E8] bg-[#10131D] px-2.5 py-1 rounded border border-[#292F40]">
          <Scale className="w-3.5 h-3.5 text-[#55D9E8]" />
          <span>Interactive Sensitivity Engine</span>
        </div>
      </div>

      {/* Preset Strategy Cards */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
          1. Select Strategy Cohort
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'bg-[#1C2130] border-[#8B7CFF] shadow-sm shadow-[#8B7CFF]/10'
                    : 'bg-[#171B27] border-[#292F40] hover:border-[#363E54]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-[#8B7CFF] text-[#0B0D14]'
                        : 'bg-[#10131D] text-[#9299AD]'
                    }`}
                  >
                    {preset.priority}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#8B7CFF]" />}
                </div>

                <div className="text-xs font-bold text-[#F3F5FA] mb-0.5">{preset.name}</div>
                <div className="text-[10px] text-[#9299AD] leading-tight mb-2">{preset.description}</div>

                <div className="pt-1.5 border-t border-[#292F40]/60 flex items-center justify-between text-[10px] font-mono text-[#9299AD]">
                  <span>Offer: ${preset.recommendedOffer}/cust</span>
                  <span>Assumed: {(preset.recommendedSuccessRate * 100).toFixed(0)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 card-panel p-4 space-y-4">
          <div className="border-b border-[#292F40] pb-2">
            <h3 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#8B7CFF]" />
              <span>2. Campaign Assumption Controls</span>
            </h3>
            <p className="text-[10px] text-[#9299AD] mt-0.5 font-mono">
              Adjust variables to test financial sensitivity
            </p>
          </div>

          {/* Offer Cost Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#F3F5FA]">
                Offer Incentive Cost per Customer
              </label>
              <span className="font-mono font-bold text-[#8B7CFF] text-sm">
                ${offerCost.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={offerCost}
              onChange={(e) => setOfferCost(Number(e.target.value))}
              className="w-full accent-[#8B7CFF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9299AD] font-mono">
              <span>$5 (Credit)</span>
              <span>$50 (Bundle)</span>
              <span>$100 (Upgrade)</span>
            </div>
          </div>

          {/* Assumed Success Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#F3F5FA]">
                Assumed Retention Conversion Rate
              </label>
              <span className="font-mono font-bold text-[#55D9E8] text-sm">
                {(successRate * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.60}
              step={0.01}
              value={successRate}
              onChange={(e) => setSuccessRate(Number(e.target.value))}
              className="w-full accent-[#55D9E8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9299AD] font-mono">
              <span>5% (Conservative)</span>
              <span>20% (Benchmark)</span>
              <span>60% (Optimistic)</span>
            </div>
          </div>

          {/* Volume Target Cap */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#F3F5FA]">
                Targeted Volume Cap
              </label>
              <span className="font-mono text-[11px] text-[#9299AD]">
                {targetLimit ? `${targetLimit} accounts` : 'All Eligible'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[undefined, 250, 500, 1000].map((lim, idx) => (
                <button
                  key={idx}
                  onClick={() => setTargetLimit(lim)}
                  className={`py-1 rounded border font-mono text-[11px] transition-colors ${
                    targetLimit === lim
                      ? 'bg-[#1C2130] border-[#8B7CFF] text-[#8B7CFF] font-bold'
                      : 'bg-[#10131D] border-[#292F40] text-[#9299AD] hover:text-[#F3F5FA]'
                  }`}
                >
                  {lim ? lim.toLocaleString() : 'Full'}
                </button>
              ))}
            </div>
          </div>

          {/* Labeling Notice */}
          <div className="p-3 rounded bg-[#10131D] border border-[#292F40] space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[#FFBE69] text-[10px] font-bold uppercase font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Financial Definitions Notice</span>
            </div>
            <p className="text-[10px] text-[#9299AD] leading-relaxed">
              Monthly charges multiplied by customer count represents monthly recurring revenue exposure, not guaranteed profit. Success rates and offer costs are user-controlled modeling assumptions.
            </p>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 card-panel p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
              <div>
                <h3 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#5DE2B1]" />
                  <span>3. Dynamic Financial Outcomes</span>
                </h3>
                <p className="text-[10px] text-[#9299AD] mt-0.5 font-mono">
                  {scenarioResult ? scenarioResult.target_segment_name : 'Simulating...'}
                </p>
              </div>

              {scenarioResult && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${
                    scenarioResult.estimated_net_benefit >= 0
                      ? 'bg-[#5DE2B1]/15 text-[#5DE2B1] border-[#5DE2B1]/30'
                      : 'bg-[#FF6B78]/15 text-[#FF6B78] border-[#FF6B78]/30'
                  }`}
                >
                  Net Benefit: {scenarioResult.estimated_net_benefit >= 0 ? '+' : ''}${Math.round(scenarioResult.estimated_net_benefit).toLocaleString()}/mo
                </span>
              )}
            </div>

            {loading || !scenarioResult ? (
              <div className="py-14 text-center text-[#9299AD]">
                <div className="w-6 h-6 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                <p className="text-xs font-mono">Calculating financial outcomes...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded bg-[#1C2130] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] uppercase block font-sans font-bold">
                      Targeted Accounts
                    </span>
                    <span className="text-xl font-bold text-[#F3F5FA]">
                      {scenarioResult.targeted_customers.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#9299AD] block">
                      of {scenarioResult.eligible_customers.toLocaleString()} eligible
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[#1C2130] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] uppercase block font-sans font-bold">
                      Total Campaign Cost
                    </span>
                    <span className="text-xl font-bold text-[#FF6B78]">
                      ${Math.round(scenarioResult.total_campaign_cost).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#9299AD] block">
                      @ ${offerCost.toFixed(2)} / customer
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[#1C2130] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] uppercase block font-sans font-bold">
                      Assumed Retained
                    </span>
                    <span className="text-xl font-bold text-[#55D9E8]">
                      {scenarioResult.assumed_retained_customers.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#9299AD] block">
                      @ {(successRate * 100).toFixed(0)}% conversion
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[#1C2130] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] uppercase block font-sans font-bold">
                      Monthly MRR Protected
                    </span>
                    <span className="text-xl font-bold text-[#5DE2B1]">
                      ${Math.round(scenarioResult.estimated_monthly_revenue_protected).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#9299AD] block">
                      Avg MRR: ${scenarioResult.average_monthly_charges}/mo
                    </span>
                  </div>
                </div>

                {/* Break-even box */}
                <div className="p-3 rounded bg-[#10131D] border border-[#292F40] space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F3F5FA] font-sans font-bold flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#5DE2B1]" />
                      Break-Even Conversion Rate:
                    </span>
                    <span className="text-sm font-bold text-[#5DE2B1]">
                      {scenarioResult.break_even_success_rate}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9299AD] font-sans leading-relaxed">
                    Campaign breaks even on monthly revenue by retaining at least{' '}
                    <span className="text-[#5DE2B1] font-bold font-mono">
                      {scenarioResult.break_even_customers_needed.toLocaleString()} accounts
                    </span>{' '}
                    ({scenarioResult.break_even_success_rate}% conversion).
                  </p>
                  <div className="flex justify-between text-[10px] text-[#9299AD] pt-1 border-t border-[#292F40]/60">
                    <span>Target Cohort Monthly Exposure:</span>
                    <span className="text-[#F3F5FA] font-bold">
                      ${Math.round(scenarioResult.total_monthly_revenue_exposure).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {scenarioResult && (
            <div className="text-[10px] text-[#9299AD] border-t border-[#292F40] pt-2">
              <span className="font-semibold text-[#F3F5FA]">Assumptions: </span>
              {scenarioResult.assumptions_note}
            </div>
          )}
        </div>
      </div>

      {/* Strategy Comparison Table */}
      <div className="card-panel p-4 space-y-2">
        <div className="border-b border-[#292F40] pb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#F3F5FA]">
            Cross-Cohort Strategy Comparison
          </h3>
          <span className="text-[10px] font-mono text-[#9299AD]">Standardized simulation comparison</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#10131D] text-[#9299AD] border-b border-[#292F40] uppercase text-[9px]">
              <tr>
                <th className="py-2 px-3">Strategy Cohort</th>
                <th className="py-2 px-3">Eligible Size</th>
                <th className="py-2 px-3">Avg Monthly Bill</th>
                <th className="py-2 px-3">Campaign Cost</th>
                <th className="py-2 px-3">Protected MRR</th>
                <th className="py-2 px-3">Net Benefit</th>
                <th className="py-2 px-3">Break-Even</th>
                <th className="py-2 px-3 text-right">ROI Multiple</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292F40]/60 text-[#F3F5FA]">
              {comparisonResults.map((comp, idx) => (
                <tr key={idx} className="hover:bg-[#1C2130] transition-colors">
                  <td className="py-2 px-3 font-sans font-bold text-[#F3F5FA]">
                    {comp.target_segment_name}
                  </td>
                  <td className="py-2 px-3">{comp.eligible_customers.toLocaleString()}</td>
                  <td className="py-2 px-3 text-[#9299AD]">${comp.average_monthly_charges}</td>
                  <td className="py-2 px-3 text-[#FF6B78]">
                    ${Math.round(comp.total_campaign_cost).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-[#5DE2B1] font-bold">
                    ${Math.round(comp.estimated_monthly_revenue_protected).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`font-bold ${
                        comp.estimated_net_benefit >= 0 ? 'text-[#5DE2B1]' : 'text-[#FF6B78]'
                      }`}
                    >
                      {comp.estimated_net_benefit >= 0 ? '+' : ''}${Math.round(comp.estimated_net_benefit).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#9299AD]">{comp.break_even_success_rate}%</td>
                  <td className="py-2 px-3 text-right font-bold text-[#8B7CFF]">{comp.roi_multiple}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
