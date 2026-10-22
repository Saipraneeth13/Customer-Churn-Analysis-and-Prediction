import React from 'react';
import {
  BookOpen,
  Database,
  Cpu,
  Layers,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div className="space-y-4 pb-12 max-w-5xl">
      {/* Header */}
      <div className="card-panel p-4 bg-gradient-to-r from-[#171B27] to-[#1C2130] border-[#292F40]">
        <h2 className="text-sm font-bold text-[#F3F5FA] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8B7CFF]" />
          <span>RETAINIQ Analytical Methodology & System Architecture</span>
        </h2>
        <p className="text-xs text-[#9299AD] mt-0.5">
          Technical specifications, data validation rules, cross-validation scoring, and observational constraints
        </p>
      </div>

      {/* Grid of 4 Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Card 1: Data Preprocessing */}
        <div className="card-panel p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#8B7CFF] font-bold text-xs uppercase font-mono border-b border-[#292F40] pb-2">
            <Database className="w-4 h-4" />
            <span>1. Dataset Scope & Cleaning</span>
          </div>
          <p className="text-[#9299AD] leading-relaxed">
            The source dataset is the public <span className="text-[#F3F5FA] font-semibold">IBM Telco Customer Churn</span> dataset containing 7,043 initial records.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#F3F5FA]/90 text-[11px]">
            <li>11 records had blank strings in <code className="text-[#8B7CFF]">TotalCharges</code> corresponding to brand-new accounts with zero tenure. These were dropped following standard practices, leaving <span className="font-bold text-[#5DE2B1]">7,032 verified clean customer records</span>.</li>
            <li>No duplicate customer IDs exist in the cleaned dataset.</li>
            <li>Repeated categories such as "No internet service" and "No phone service" were normalized to "No".</li>
          </ul>
        </div>

        {/* Card 2: Dual ML Scoring Architecture */}
        <div className="card-panel p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#55D9E8] font-bold text-xs uppercase font-mono border-b border-[#292F40] pb-2">
            <Cpu className="w-4 h-4" />
            <span>2. Out-of-Fold vs. Test Evaluation</span>
          </div>
          <p className="text-[#9299AD] leading-relaxed">
            To prevent data leakage, RETAINIQ rigorously separates customer risk scoring from model evaluation:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#F3F5FA]/90 text-[11px]">
            <li><span className="font-bold text-[#55D9E8]">Model Performance Metrics:</span> Evaluated exclusively on a held-out 20% stratified test split (1,407 records: 1,033 Stayed, 374 Churned).</li>
            <li><span className="font-bold text-[#8B7CFF]">Customer Explorer Risk Scores:</span> Generated via 5-fold cross-validation (<code className="text-[#8B7CFF]">cross_val_predict</code>). Every customer probability was produced by an estimator that never saw that customer in training.</li>
          </ul>
        </div>

        {/* Card 3: Risk Band Calibration */}
        <div className="card-panel p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#5DE2B1] font-bold text-xs uppercase font-mono border-b border-[#292F40] pb-2">
            <Layers className="w-4 h-4" />
            <span>3. Risk Band Thresholds</span>
          </div>
          <p className="text-[#9299AD] leading-relaxed">
            Customer risk bands are defined using calibrated thresholds documented in the project pipeline:
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="p-1.5 rounded bg-[#10131D] flex justify-between">
              <span className="text-[#5DE2B1] font-bold">Low Risk:</span>
              <span className="text-[#9299AD]">≤ 0.40 probability (3,539 accts, 50.3%)</span>
            </div>
            <div className="p-1.5 rounded bg-[#10131D] flex justify-between">
              <span className="text-[#FFBE69] font-bold">Medium Risk:</span>
              <span className="text-[#9299AD]">0.40 – 0.70 probability (1,723 accts, 24.5%)</span>
            </div>
            <div className="p-1.5 rounded bg-[#10131D] flex justify-between">
              <span className="text-[#FF6B78] font-bold">High Risk:</span>
              <span className="text-[#9299AD]">&gt; 0.70 probability (1,770 accts, 25.2%)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Financial Definitions */}
        <div className="card-panel p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#FFBE69] font-bold text-xs uppercase font-mono border-b border-[#292F40] pb-2">
            <Scale className="w-4 h-4" />
            <span>4. Financial Definitions & Assumptions</span>
          </div>
          <p className="text-[#9299AD] leading-relaxed">
            All financial figures in RETAINIQ adhere to explicit definitions:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#F3F5FA]/90 text-[11px]">
            <li><span className="font-bold text-[#F3F5FA]">Monthly Revenue Exposure:</span> Sum of MonthlyCharges for a cohort. This represents monthly billing value, not gross margin or net profit.</li>
            <li><span className="font-bold text-[#F3F5FA]">Protected MRR:</span> Assumed retained accounts multiplied by average monthly charges under user-configured scenario parameters.</li>
            <li><span className="font-bold text-[#F3F5FA]">Break-Even Rate:</span> Exact conversion rate where protected MRR matches total campaign cost.</li>
          </ul>
        </div>
      </div>

      {/* Observational Limitations Notice */}
      <div className="card-panel p-4 border-[#292F40] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[#FF6B78] font-bold uppercase font-mono text-[11px]">
          <AlertTriangle className="w-4 h-4" />
          <span>Observational Dataset Limitations</span>
        </div>
        <p className="text-[#9299AD] leading-relaxed">
          The IBM Telco dataset is a single cross-sectional snapshot without longitudinal event logs or customer interaction timestamps. Churn timing cannot be modeled with hazard/survival curves. Furthermore, observed associations between customer features (e.g., month-to-month contracts, electronic checks) and churn rates reflect correlation, not causal evidence from randomized A/B tests.
        </p>
      </div>
    </div>
  );
};
