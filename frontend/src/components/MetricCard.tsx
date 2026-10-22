import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: {
    text: string;
    variant: 'violet' | 'cyan' | 'mint' | 'amber' | 'coral' | 'neutral';
  };
  icon?: LucideIcon;
  progressPercent?: number;
  progressColor?: string;
  ratioLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  progressPercent,
  progressColor = '#8B7CFF',
  ratioLabel,
}) => {
  const getBadgeStyle = (variant: string) => {
    switch (variant) {
      case 'violet':
        return 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/30';
      case 'cyan':
        return 'bg-[#55D9E8]/15 text-[#55D9E8] border-[#55D9E8]/30';
      case 'mint':
        return 'bg-[#5DE2B1]/15 text-[#5DE2B1] border-[#5DE2B1]/30';
      case 'amber':
        return 'bg-[#FFBE69]/15 text-[#FFBE69] border-[#FFBE69]/30';
      case 'coral':
        return 'bg-[#FF6B78]/15 text-[#FF6B78] border-[#FF6B78]/30';
      default:
        return 'bg-[#1C2130] text-[#9299AD] border-[#292F40]';
    }
  };

  return (
    <div className="card-panel p-3.5 transition-all duration-200 hover:border-[#363E54] flex flex-col justify-between group">
      <div>
        {/* Title row */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9299AD] truncate font-mono">
            {title}
          </span>
          {badge && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${getBadgeStyle(
                badge.variant
              )}`}
            >
              {badge.text}
            </span>
          )}
        </div>

        {/* Large Value */}
        <div className="text-xl lg:text-2xl font-extrabold text-[#F3F5FA] tracking-tight font-mono leading-none my-1">
          {value}
        </div>
      </div>

      <div>
        {/* Mini progress bar if provided */}
        {progressPercent !== undefined && (
          <div className="w-full bg-[#10131D] h-1 rounded-full overflow-hidden my-1.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        )}

        {/* Subtitle & Ratio */}
        <div className="flex items-center justify-between text-[10px] text-[#9299AD] mt-1 pt-1 border-t border-[#292F40]/60 font-sans">
          <span className="truncate">{subtitle}</span>
          {ratioLabel && (
            <span className="font-mono text-[#F3F5FA] ml-1 font-semibold flex-shrink-0">
              {ratioLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
