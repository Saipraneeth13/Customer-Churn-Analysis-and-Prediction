import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Layers,
  Filter,
  DollarSign,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { SegmentMetric, RiskBandSummary } from '../types';
import { api } from '../services/api';

interface CustomerSegmentsProps {
  onSelectSegment?: (dimension: string, value: string) => void;
}

export const CustomerSegments: React.FC<CustomerSegmentsProps> = ({ onSelectSegment }) => {
  const [contractSegments, setContractSegments] = useState<SegmentMetric[]>([]);
  const [tenureSegments, setTenureSegments] = useState<SegmentMetric[]>([]);
  const [paymentSegments, setPaymentSegments] = useState<SegmentMetric[]>([]);
  const [internetSegments, setInternetSegments] = useState<SegmentMetric[]>([]);
  const [riskBands, setRiskBands] = useState<RiskBandSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllSegments = async () => {
      setLoading(true);
      try {
        const [contracts, tenures, payments, internets, bands] = await Promise.all([
          api.getChurnBySegment('Contract'),
          api.getChurnBySegment('tenure_group'),
          api.getChurnBySegment('PaymentMethod'),
          api.getChurnBySegment('InternetService'),
          api.getRiskDistribution(),
        ]);
        setContractSegments(contracts);
        setTenureSegments(tenures);
        setPaymentSegments(payments);
        setInternetSegments(internets);
        setRiskBands(bands);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAllSegments();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#9299AD]">
        <div className="w-8 h-8 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono">Aggregating multidimensional customer segments...</p>
      </div>
    );
  }

  const renderSegmentTable = (title: string, data: SegmentMetric[], dimensionName: string) => (
    <div className="card-panel p-3.5 space-y-2">
      <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
        <h3 className="text-xs font-bold text-[#F3F5FA] font-sans">{title}</h3>
        <span className="text-[10px] text-[#9299AD] font-mono">Total 7,032 accounts</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#10131D] text-[#9299AD] border-b border-[#292F40] uppercase text-[9px]">
            <tr>
              <th className="py-2 px-2.5">Segment Name</th>
              <th className="py-2 px-2.5">Customers</th>
              <th className="py-2 px-2.5">Churn Rate</th>
              <th className="py-2 px-2.5">Monthly Billing</th>
              <th className="py-2 px-2.5">Lost MRR</th>
              <th className="py-2 px-2.5 text-right">Baseline Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292F40]/60 text-[#F3F5FA]">
            {data.map((seg) => (
              <tr
                key={seg.segment_name}
                onClick={() => onSelectSegment && onSelectSegment(dimensionName, seg.segment_name)}
                className="hover:bg-[#1C2130] cursor-pointer transition-colors"
              >
                <td className="py-2 px-2.5 font-sans font-semibold text-[#F3F5FA]">
                  {seg.segment_name}
                </td>
                <td className="py-2 px-2.5">
                  {seg.customers.toLocaleString()}{' '}
                  <span className="text-[10px] text-[#9299AD]">
                    ({((seg.customers / 7032) * 100).toFixed(1)}%)
                  </span>
                </td>
                <td className="py-2 px-2.5">
                  <span
                    className={`font-bold ${
                      seg.churn_rate > 35
                        ? 'text-[#FF6B78]'
                        : seg.churn_rate > 20
                        ? 'text-[#FFBE69]'
                        : 'text-[#5DE2B1]'
                    }`}
                  >
                    {seg.churn_rate}%
                  </span>
                </td>
                <td className="py-2 px-2.5 text-[#9299AD]">
                  ${Math.round(seg.monthly_revenue).toLocaleString()}
                </td>
                <td className="py-2 px-2.5 text-[#FF6B78]">
                  ${Math.round(seg.monthly_revenue_at_risk).toLocaleString()}
                </td>
                <td className="py-2 px-2.5 text-right">
                  <span
                    className={`font-bold ${
                      seg.rate_diff_from_average > 0 ? 'text-[#FF6B78]' : 'text-[#5DE2B1]'
                    }`}
                  >
                    {seg.rate_diff_from_average > 0 ? `+${seg.rate_diff_from_average}` : seg.rate_diff_from_average} pp
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Banner */}
      <div className="card-panel p-4 bg-gradient-to-r from-[#171B27] to-[#1C2130] border-[#292F40] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#F3F5FA] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#8B7CFF]" />
            <span>Multidimensional Customer Segmentation Matrix</span>
          </h2>
          <p className="text-xs text-[#9299AD] mt-0.5">
            Empirical segment size, churn hazard rates, and recurring revenue exposure across core subscription dimensions
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#55D9E8] bg-[#10131D] px-2.5 py-1 rounded border border-[#292F40]">
          Verified Denominator: 7,032 Accounts
        </span>
      </div>

      {/* Risk Band Sizing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {riskBands.map((band) => (
          <div
            key={band.band}
            className={`card-panel p-3.5 space-y-2 border ${
              band.band === 'High'
                ? 'border-[#FF6B78]/40 bg-[#FF6B78]/5'
                : band.band === 'Medium'
                ? 'border-[#FFBE69]/40 bg-[#FFBE69]/5'
                : 'border-[#5DE2B1]/40 bg-[#5DE2B1]/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                  band.band === 'High'
                    ? 'text-[#FF6B78] border-[#FF6B78]/40'
                    : band.band === 'Medium'
                    ? 'text-[#FFBE69] border-[#FFBE69]/40'
                    : 'text-[#5DE2B1] border-[#5DE2B1]/40'
                }`}
              >
                {band.band} Risk Band
              </span>
              <span className="text-xs font-mono text-[#9299AD]">{band.probability_range}</span>
            </div>

            <div className="text-xl font-extrabold font-mono text-[#F3F5FA]">
              {band.customers.toLocaleString()} <span className="text-xs text-[#9299AD] font-sans font-normal">({band.customer_pct}%)</span>
            </div>

            <div className="text-xs text-[#9299AD] font-mono">
              Monthly Exposure: <span className="text-[#F3F5FA] font-bold">${Math.round(band.monthly_revenue_exposure).toLocaleString()}/mo</span>
            </div>

            <div className="text-[10px] text-[#9299AD] pt-1.5 border-t border-[#292F40]/60 flex justify-between font-mono">
              <span>Segment Empirical Churn:</span>
              <span className="font-bold text-[#F3F5FA]">{band.churn_rate_in_band}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Segment Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {renderSegmentTable('Contract Agreement Breakdown', contractSegments, 'Contract')}
        {renderSegmentTable('Tenure Lifecycle Cohorts', tenureSegments, 'tenure_group')}
        {renderSegmentTable('Payment Method Channels', paymentSegments, 'PaymentMethod')}
        {renderSegmentTable('Internet Service Infrastructure', internetSegments, 'InternetService')}
      </div>
    </div>
  );
};
