import React, { useEffect, useState } from 'react';
import {
  X,
  AlertCircle,
  ShieldCheck,
  Zap,
  DollarSign,
  Calendar,
  CreditCard,
  Wifi,
  Phone,
  User,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { CustomerDetail } from '../types';
import { api } from '../services/api';

interface CustomerDrawerProps {
  customerId: string | null;
  onClose: () => void;
  onTargetInLab?: (customerId: string) => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  customerId,
  onClose,
  onTargetInLab,
}) => {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      return;
    }

    const loadCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getCustomerDetail(customerId);
        setCustomer(data);
      } catch (err: any) {
        setError(err.message || 'Error loading customer details');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!customerId) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-[#10131D] border-l border-[#292F40] shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-[#292F40] flex items-center justify-between bg-[#171B27]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-[#F3F5FA]">
                  {customerId}
                </span>
                {customer && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase font-mono ${getRiskBadge(
                      customer.risk_band
                    )}`}
                  >
                    {customer.risk_band} Risk
                  </span>
                )}
                {customer && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      customer.actual_churn === 1
                        ? 'bg-[#FF6B78]/20 text-[#FF6B78] border border-[#FF6B78]/40'
                        : 'bg-[#5DE2B1]/20 text-[#5DE2B1] border border-[#5DE2B1]/40'
                    }`}
                  >
                    Outcome: {customer.actual_churn === 1 ? 'Churned' : 'Stayed'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9299AD] mt-0.5">
                Account risk profile & segment context
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded bg-[#1C2130] text-[#9299AD] hover:text-[#F3F5FA] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 flex-1 text-xs">
            {loading ? (
              <div className="py-20 text-center text-[#9299AD] space-y-2">
                <div className="w-6 h-6 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono">Loading profile...</p>
              </div>
            ) : error ? (
              <div className="p-3 bg-[#FF6B78]/10 border border-[#FF6B78]/30 rounded text-[#FF6B78] text-xs">
                {error}
              </div>
            ) : customer ? (
              <>
                {/* Predicted Probability Score */}
                <div className="p-3.5 rounded-lg bg-[#171B27] border border-[#292F40] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono">
                      Predicted Churn Probability
                    </span>
                    <span className="text-xl font-black font-mono text-[#8B7CFF]">
                      {(customer.churn_probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-[#10131D] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        customer.churn_probability > 0.70
                          ? 'bg-[#FF6B78]'
                          : customer.churn_probability > 0.40
                          ? 'bg-[#FFBE69]'
                          : 'bg-[#5DE2B1]'
                      }`}
                      style={{ width: `${customer.churn_probability * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] text-[#9299AD] font-mono">
                    <span>Low (≤40%)</span>
                    <span>Medium (40-70%)</span>
                    <span>High (&gt;70%)</span>
                  </div>
                </div>

                {/* Key Billing Figures */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded bg-[#171B27] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] block font-mono">Monthly Charges</span>
                    <span className="text-sm font-bold font-mono text-[#F3F5FA]">
                      ${customer.monthly_charges.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-[#9299AD]/80 block">
                      {customer.percentile_monthly_charges}th %ile
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#171B27] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] block font-mono">Tenure</span>
                    <span className="text-sm font-bold font-mono text-[#F3F5FA]">
                      {customer.tenure} mos
                    </span>
                    <span className="text-[9px] text-[#9299AD]/80 block">{customer.tenure_group}</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#171B27] border border-[#292F40]">
                    <span className="text-[9px] text-[#9299AD] block font-mono">Total Cumulative</span>
                    <span className="text-sm font-bold font-mono text-[#F3F5FA]">
                      ${customer.total_charges.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-[#9299AD]/80 block">Lifetime</span>
                  </div>
                </div>

                {/* Account & Service Matrix */}
                <div className="p-3 rounded-lg bg-[#171B27] border border-[#292F40] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                    Account & Service Attributes
                  </span>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px]">
                    <div>
                      <span className="text-[#9299AD] block">Contract:</span>
                      <span className="font-semibold text-[#F3F5FA]">{customer.contract}</span>
                    </div>
                    <div>
                      <span className="text-[#9299AD] block">Payment:</span>
                      <span className="font-semibold text-[#F3F5FA]">{customer.payment_method}</span>
                    </div>
                    <div>
                      <span className="text-[#9299AD] block">Internet Service:</span>
                      <span className="font-semibold text-[#F3F5FA]">{customer.internet_service}</span>
                    </div>
                    <div>
                      <span className="text-[#9299AD] block">Paperless Billing:</span>
                      <span className="font-semibold text-[#F3F5FA]">{customer.paperless_billing}</span>
                    </div>
                    <div>
                      <span className="text-[#9299AD] block">Online Security:</span>
                      <span className="font-semibold text-[#F3F5FA]">{customer.online_security}</span>
                    </div>
                    <div>
                      <span className="text-[#9299AD] block">Tech Support:</span>
                      <span className="font-semibold text-[#F3F5FA]">{customer.tech_support}</span>
                    </div>
                  </div>
                </div>

                {/* Segment Context */}
                <div className="p-3 rounded-lg bg-[#1C2130] border border-[#292F40] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#55D9E8] font-mono">
                    <Info className="w-3.5 h-3.5" />
                    <span>Segment Historical Context</span>
                  </div>
                  <p className="text-[11px] text-[#F3F5FA]">
                    {customer.segment_churn_context}
                  </p>
                </div>

                {/* Risk Drivers vs Protective Factors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
                    Customer Signals
                  </span>

                  {customer.risk_factors.length > 0 && (
                    <div className="p-2.5 rounded bg-[#FF6B78]/10 border border-[#FF6B78]/25 space-y-1">
                      <div className="text-[10px] font-bold text-[#FF6B78] flex items-center gap-1.5 font-mono uppercase">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Elevated Risk Signals</span>
                      </div>
                      <ul className="text-[11px] text-[#F3F5FA]/90 space-y-1 pl-4 list-disc">
                        {customer.risk_factors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {customer.protective_factors.length > 0 && (
                    <div className="p-2.5 rounded bg-[#5DE2B1]/10 border border-[#5DE2B1]/25 space-y-1">
                      <div className="text-[10px] font-bold text-[#5DE2B1] flex items-center gap-1.5 font-mono uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Retention Stabilizers</span>
                      </div>
                      <ul className="text-[11px] text-[#F3F5FA]/90 space-y-1 pl-4 list-disc">
                        {customer.protective_factors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommended Playbook */}
                <div className="p-3 rounded-lg bg-[#171B27] border border-[#8B7CFF]/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B7CFF] uppercase font-mono">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Recommended Retention Action</span>
                  </div>
                  <p className="text-[11px] text-[#F3F5FA] font-medium leading-relaxed">
                    {customer.recommended_action}
                  </p>
                  <div className="text-[10px] text-[#9299AD] pt-1 border-t border-[#292F40] flex justify-between font-mono">
                    <span>Monthly Exposure:</span>
                    <span className="font-bold text-[#8B7CFF]">${customer.potential_saving_monthly.toFixed(2)}/mo</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#292F40] bg-[#171B27] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#9299AD] hover:text-[#F3F5FA] transition-colors"
            >
              Close
            </button>
            {customer && customer.risk_band === 'High' && onTargetInLab && (
              <button
                onClick={() => {
                  onTargetInLab(customer.customer_id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#8B7CFF] hover:bg-[#7968FA] text-[#0B0D14] text-xs font-bold rounded transition-colors shadow-sm"
              >
                <span>Simulate in Strategy Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
