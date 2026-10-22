import React, { useEffect, useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
  TrendingUp,
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { ModelMetrics } from '../types';
import { api } from '../services/api';

export const ModelPerformance: React.FC = () => {
  const [models, setModels] = useState<Record<string, ModelMetrics> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await api.getModelPerformance();
        setModels(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#9299AD]">
        <div className="w-8 h-8 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono">Evaluating held-out test set predictions...</p>
      </div>
    );
  }

  if (!models) {
    return (
      <div className="p-4 rounded bg-[#FF6B78]/10 border border-[#FF6B78]/30 text-[#FF6B78] text-xs">
        Failed to load model performance evaluation.
      </div>
    );
  }

  const lr = models['Logistic Regression'];
  const rf = models['Random Forest'];

  const combinedRocData = lr.roc_curve.map((lrPt, idx) => {
    const rfPt = rf.roc_curve[idx] || rf.roc_curve[rf.roc_curve.length - 1];
    return {
      fpr: lrPt.fpr,
      lr_tpr: lrPt.tpr,
      rf_tpr: rfPt.tpr,
      random: lrPt.fpr,
    };
  });

  const CustomRocTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#10131D] border border-[#292F40] p-2.5 rounded text-xs space-y-1 font-mono">
          <p className="text-[#9299AD]">FPR (1 - Spec): <span className="text-[#F3F5FA] font-bold">{data.fpr}</span></p>
          <p className="text-[#8B7CFF]">Logistic Regression TPR: <span className="font-bold">{data.lr_tpr}</span></p>
          <p className="text-[#55D9E8]">Random Forest TPR: <span className="font-bold">{data.rf_tpr}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Governance Banner */}
      <div className="card-panel p-3.5 bg-gradient-to-r from-[#171B27] to-[#1C2130] border-[#292F40] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#8B7CFF]" />
          <div>
            <h2 className="text-xs font-bold text-[#F3F5FA] font-sans">
              Model Evaluation Governance & Split Methodology
            </h2>
            <p className="text-[11px] text-[#9299AD]">
              Evaluated on 20% stratified holdout (1,407 test accounts: 1,033 Stayed, 374 Churned). Out-of-fold scoring used for customer explorer.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#5DE2B1] bg-[#10131D] px-2.5 py-1 rounded border border-[#292F40]">
          class_weight="balanced"
        </span>
      </div>

      {/* Head-to-Head Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Logistic Regression Card */}
        <div className="card-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <h3 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-[#8B7CFF]" />
                <span>Logistic Regression</span>
              </h3>
              <p className="text-[10px] text-[#9299AD] font-mono">Linear baseline with L2 penalty</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#8B7CFF] bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 px-2 py-0.5 rounded">
              ROC-AUC {lr.roc_auc}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">Recall</span>
              <span className="text-sm font-bold text-[#8B7CFF]">{(lr.recall * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">Precision</span>
              <span className="text-sm font-bold text-[#F3F5FA]">{(lr.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">F1 Score</span>
              <span className="text-sm font-bold text-[#F3F5FA]">{lr.f1_score}</span>
            </div>
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">Accuracy</span>
              <span className="text-sm font-bold text-[#F3F5FA]">{(lr.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
              Test Confusion Matrix (n=1,407)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">True Negatives (Stayed)</div>
                <div className="text-base font-bold text-[#5DE2B1]">{lr.confusion_matrix.tn}</div>
              </div>
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">False Positives (Type I)</div>
                <div className="text-base font-bold text-[#FFBE69]">{lr.confusion_matrix.fp}</div>
              </div>
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">False Negatives (Type II)</div>
                <div className="text-base font-bold text-[#FF6B78]">{lr.confusion_matrix.fn}</div>
              </div>
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">True Positives (Churned)</div>
                <div className="text-base font-bold text-[#8B7CFF]">{lr.confusion_matrix.tp}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Random Forest Card */}
        <div className="card-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
            <div>
              <h3 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-[#55D9E8]" />
                <span>Random Forest</span>
              </h3>
              <p className="text-[10px] text-[#9299AD] font-mono">Ensemble 300 estimators, max_depth=8</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#55D9E8] bg-[#55D9E8]/10 border border-[#55D9E8]/30 px-2 py-0.5 rounded">
              ROC-AUC {rf.roc_auc}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">Recall</span>
              <span className="text-sm font-bold text-[#55D9E8]">{(rf.recall * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">Precision</span>
              <span className="text-sm font-bold text-[#F3F5FA]">{(rf.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">F1 Score</span>
              <span className="text-sm font-bold text-[#F3F5FA]">{rf.f1_score}</span>
            </div>
            <div className="p-2 rounded bg-[#10131D] border border-[#292F40]">
              <span className="text-[9px] text-[#9299AD] block font-sans">Accuracy</span>
              <span className="text-sm font-bold text-[#F3F5FA]">{(rf.accuracy * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] font-mono block">
              Test Confusion Matrix (n=1,407)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">True Negatives (Stayed)</div>
                <div className="text-base font-bold text-[#5DE2B1]">{rf.confusion_matrix.tn}</div>
              </div>
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">False Positives (Type I)</div>
                <div className="text-base font-bold text-[#FFBE69]">{rf.confusion_matrix.fp}</div>
              </div>
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">False Negatives (Type II)</div>
                <div className="text-base font-bold text-[#FF6B78]">{rf.confusion_matrix.fn}</div>
              </div>
              <div className="p-2 rounded bg-[#1C2130] border border-[#292F40]">
                <div className="text-[9px] text-[#9299AD] font-sans">True Positives (Churned)</div>
                <div className="text-base font-bold text-[#55D9E8]">{rf.confusion_matrix.tp}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROC Curves */}
      <div className="card-panel p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#292F40] pb-2">
          <div>
            <h3 className="text-xs font-bold text-[#F3F5FA]">
              ROC Comparison Curves
            </h3>
            <p className="text-[10px] text-[#9299AD] font-mono">
              True Positive Rate vs False Positive Rate sweep
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-[#8B7CFF]">
              <span className="w-2.5 h-0.5 bg-[#8B7CFF]" />
              <span>Logistic Regression (0.835)</span>
            </span>
            <span className="flex items-center gap-1 text-[#55D9E8]">
              <span className="w-2.5 h-0.5 bg-[#55D9E8]" />
              <span>Random Forest (0.835)</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedRocData} margin={{ top: 10, right: 20, left: 10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#292F40" />
              <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#687187" fontSize={10} />
              <YAxis type="number" domain={[0, 1]} stroke="#687187" fontSize={10} />
              <Tooltip content={<CustomRocTooltip />} />
              <Line type="monotone" dataKey="lr_tpr" stroke="#8B7CFF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rf_tpr" stroke="#55D9E8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="linear" dataKey="random" stroke="#475569" strokeWidth={1} strokeDasharray="2 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decision Threshold Economics */}
      <div className="card-panel p-4 space-y-2">
        <h4 className="text-xs font-bold text-[#F3F5FA] flex items-center gap-1.5 font-sans">
          <Scale className="w-4 h-4 text-[#8B7CFF]" />
          <span>Decision Threshold & Telecom Retention Economics</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#9299AD] leading-relaxed">
          <div className="p-3 rounded bg-[#10131D] border border-[#292F40] space-y-1">
            <span className="text-[#8B7CFF] font-bold block text-[11px]">Why Recall Protects Value</span>
            <p className="text-[11px]">
              Missing an actual churner results in irreversible loss of recurring revenue ($139,131/mo across this dataset). With class-balanced training, our Logistic Regression model captures <span className="text-[#F3F5FA] font-bold">80.2% of churners</span> (300 of 374).
            </p>
          </div>
          <div className="p-3 rounded bg-[#10131D] border border-[#292F40] space-y-1">
            <span className="text-[#55D9E8] font-bold block text-[11px]">Why Precision Governs Budget</span>
            <p className="text-[11px]">
              Targeting false alarms wastes expensive retention incentives on customers who intended to stay anyway. Random Forest delivers <span className="text-[#F3F5FA] font-bold">52.5% precision</span>, preventing offer waste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
