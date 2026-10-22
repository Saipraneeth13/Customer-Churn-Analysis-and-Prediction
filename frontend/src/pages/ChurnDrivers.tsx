import React, { useEffect, useState } from 'react';
import {
  GitFork,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend
} from 'recharts';
import { FeatureImportanceItem, SegmentMetric } from '../types';
import { api } from '../services/api';

export const ChurnDrivers: React.FC = () => {
  const [rfDrivers, setRfDrivers] = useState<FeatureImportanceItem[]>([]);
  const [lrDrivers, setLrDrivers] = useState<FeatureImportanceItem[]>([]);
  const [contractSegments, setContractSegments] = useState<SegmentMetric[]>([]);
  const [tenureSegments, setTenureSegments] = useState<SegmentMetric[]>([]);
  const [paymentSegments, setPaymentSegments] = useState<SegmentMetric[]>([]);
  const [internetSegments, setInternetSegments] = useState<SegmentMetric[]>([]);
  const [modelType, setModelType] = useState<'rf' | 'lr'>('rf');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [driversData, contractData, tenureData, paymentData, internetData] =
          await Promise.all([
            api.getChurnDrivers(),
            api.getChurnBySegment('Contract'),
            api.getChurnBySegment('tenure_group'),
            api.getChurnBySegment('PaymentMethod'),
            api.getChurnBySegment('InternetService'),
          ]);

        setRfDrivers(driversData.random_forest);
        setLrDrivers(driversData.logistic_regression);
        setContractSegments(contractData);
        setTenureSegments(tenureData);
        setPaymentSegments(paymentData);
        setInternetSegments(internetData);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#9299AD]">
        <div className="w-8 h-8 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono">Analyzing predictive signals & feature attribution...</p>
      </div>
    );
  }

  const activeDrivers = modelType === 'rf' ? rfDrivers : lrDrivers;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#10131D] border border-[#292F40] p-2.5 rounded text-xs space-y-1 font-mono">
          <p className="font-bold text-[#F3F5FA] font-sans">{data.label || label}</p>
          <p className="text-[#9299AD]">Category: {data.category}</p>
          {data.importance !== undefined && (
            <p className="text-[#8B7CFF] font-bold">
              {modelType === 'rf' ? 'Importance Weight' : 'Absolute Weight'}: {data.importance}
            </p>
          )}
          {data.raw_coefficient !== undefined && (
            <p className="text-[#9299AD]">
              Raw Coef: {data.raw_coefficient > 0 ? `+${data.raw_coefficient}` : data.raw_coefficient}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Explicit Causality vs Correlation Disclaimer */}
      <div className="card-panel p-3.5 bg-[#171B27] border-[#292F40] flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-[#55D9E8] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-[#55D9E8] font-mono block">
            Analytical Distinction: Observed Correlation vs. Predictive Attribution
          </span>
          <p className="text-[#9299AD] leading-relaxed">
            The bivariate segment cards demonstrate empirical churn rates measured in this observational snapshot. The machine learning feature importance illustrates statistical predictive attribution within our algorithms. <span className="text-[#F3F5FA] font-semibold">Important note:</span> feature importance does not establish causality; it reflects statistical association with churn outcomes.
          </p>
        </div>
      </div>

      {/* Feature Importance Card */}
      <div className="card-panel p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#292F40] pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-[#8B7CFF]" />
              <h2 className="text-sm font-bold text-[#F3F5FA]">
                Model Feature Importance & Signal Ranking
              </h2>
            </div>
            <p className="text-[11px] text-[#9299AD] mt-0.5 font-mono">
              Attribute importance weights extracted from fitted pipeline
            </p>
          </div>

          {/* Model Toggle Switch */}
          <div className="flex items-center gap-1 bg-[#10131D] p-1 rounded border border-[#292F40] text-xs font-mono">
            <button
              onClick={() => setModelType('rf')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                modelType === 'rf'
                  ? 'bg-[#1C2130] text-[#8B7CFF] shadow-sm'
                  : 'text-[#9299AD] hover:text-[#F3F5FA]'
              }`}
            >
              Random Forest (Gini Importance)
            </button>
            <button
              onClick={() => setModelType('lr')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                modelType === 'lr'
                  ? 'bg-[#1C2130] text-[#55D9E8] shadow-sm'
                  : 'text-[#9299AD] hover:text-[#F3F5FA]'
              }`}
            >
              Logistic Regression (Coefficients)
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeDrivers.slice(0, 10).reverse()}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke="#292F40" horizontal={false} />
              <XAxis type="number" stroke="#687187" fontSize={10} />
              <YAxis
                dataKey="label"
                type="category"
                stroke="#9299AD"
                fontSize={11}
                width={170}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="importance" radius={[0, 3, 3, 0]}>
                {activeDrivers.slice(0, 10).reverse().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      modelType === 'rf'
                        ? '#8B7CFF'
                        : entry.direction === 'increases_churn'
                        ? '#FF6B78'
                        : '#55D9E8'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#9299AD] pt-2 border-t border-[#292F40]/60 font-mono">
          <div className="flex items-center gap-3">
            {modelType === 'rf' ? (
              <span className="flex items-center gap-1.5 text-[#8B7CFF]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#8B7CFF]" />
                <span>Random Forest Gini Weight</span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-[#FF6B78]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6B78]" />
                  <span>Positive Coef (Increases Risk)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#55D9E8]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#55D9E8]" />
                  <span>Negative Coef (Retention Anchor)</span>
                </span>
              </>
            )}
          </div>
          <span>Leading driver: Contract_Month-to-month (0.176)</span>
        </div>
      </div>

      {/* Bivariate Association Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Contract */}
        <div className="card-panel p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <h3 className="text-xs font-bold text-[#F3F5FA] font-sans">
              Contract Agreement vs Baseline (26.6%)
            </h3>
            <span className="text-[10px] font-mono text-[#9299AD]">Delta pp</span>
          </div>

          <div className="space-y-1.5">
            {contractSegments.map((seg) => (
              <div
                key={seg.segment_name}
                className="p-2 rounded bg-[#1C2130] border border-[#292F40] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-[#F3F5FA] font-sans block">{seg.segment_name}</span>
                  <span className="text-[10px] text-[#9299AD]">
                    {seg.customers.toLocaleString()} accts ({((seg.customers / 7032) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#F3F5FA]">{seg.churn_rate}%</div>
                  <div
                    className={`text-[10px] font-bold ${
                      seg.rate_diff_from_average > 0 ? 'text-[#FF6B78]' : 'text-[#5DE2B1]'
                    }`}
                  >
                    {seg.rate_diff_from_average > 0 ? `+${seg.rate_diff_from_average}` : seg.rate_diff_from_average} pp
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenure */}
        <div className="card-panel p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <h3 className="text-xs font-bold text-[#F3F5FA] font-sans">
              Tenure Lifecycle vs Baseline (26.6%)
            </h3>
            <span className="text-[10px] font-mono text-[#9299AD]">Delta pp</span>
          </div>

          <div className="space-y-1.5">
            {tenureSegments.map((seg) => (
              <div
                key={seg.segment_name}
                className="p-2 rounded bg-[#1C2130] border border-[#292F40] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-[#F3F5FA] font-sans block">{seg.segment_name}</span>
                  <span className="text-[10px] text-[#9299AD]">
                    {seg.customers.toLocaleString()} accts ({((seg.customers / 7032) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#F3F5FA]">{seg.churn_rate}%</div>
                  <div
                    className={`text-[10px] font-bold ${
                      seg.rate_diff_from_average > 0 ? 'text-[#FF6B78]' : 'text-[#5DE2B1]'
                    }`}
                  >
                    {seg.rate_diff_from_average > 0 ? `+${seg.rate_diff_from_average}` : seg.rate_diff_from_average} pp
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="card-panel p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <h3 className="text-xs font-bold text-[#F3F5FA] font-sans">
              Payment Method vs Baseline (26.6%)
            </h3>
            <span className="text-[10px] font-mono text-[#9299AD]">Delta pp</span>
          </div>

          <div className="space-y-1.5">
            {paymentSegments.map((seg) => (
              <div
                key={seg.segment_name}
                className="p-2 rounded bg-[#1C2130] border border-[#292F40] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-[#F3F5FA] font-sans block">{seg.segment_name}</span>
                  <span className="text-[10px] text-[#9299AD]">
                    {seg.customers.toLocaleString()} accounts
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#F3F5FA]">{seg.churn_rate}%</div>
                  <div
                    className={`text-[10px] font-bold ${
                      seg.rate_diff_from_average > 0 ? 'text-[#FF6B78]' : 'text-[#5DE2B1]'
                    }`}
                  >
                    {seg.rate_diff_from_average > 0 ? `+${seg.rate_diff_from_average}` : seg.rate_diff_from_average} pp
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internet */}
        <div className="card-panel p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <h3 className="text-xs font-bold text-[#F3F5FA] font-sans">
              Internet Service vs Baseline (26.6%)
            </h3>
            <span className="text-[10px] font-mono text-[#9299AD]">Delta pp</span>
          </div>

          <div className="space-y-1.5">
            {internetSegments.map((seg) => (
              <div
                key={seg.segment_name}
                className="p-2 rounded bg-[#1C2130] border border-[#292F40] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-[#F3F5FA] font-sans block">{seg.segment_name}</span>
                  <span className="text-[10px] text-[#9299AD]">
                    {seg.customers.toLocaleString()} accounts
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#F3F5FA]">{seg.churn_rate}%</div>
                  <div
                    className={`text-[10px] font-bold ${
                      seg.rate_diff_from_average > 0 ? 'text-[#FF6B78]' : 'text-[#5DE2B1]'
                    }`}
                  >
                    {seg.rate_diff_from_average > 0 ? `+${seg.rate_diff_from_average}` : seg.rate_diff_from_average} pp
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
