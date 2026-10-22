import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  PieChart,
  Cpu,
  Users,
  Sliders,
  BookOpen,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  collapsed,
  onToggleCollapse,
}) => {
  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
      ],
    },
    {
      group: 'ANALYTICS',
      items: [
        { id: 'drivers', label: 'Churn Drivers', icon: GitFork },
        { id: 'segments', label: 'Customer Segments', icon: PieChart },
        { id: 'models', label: 'Model Performance', icon: Cpu },
      ],
    },
    {
      group: 'RETENTION',
      items: [
        { id: 'explorer', label: 'Risk Explorer', icon: Users },
        { id: 'strategy', label: 'Retention Strategy', icon: Sliders },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'methodology', label: 'Methodology', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#10131D] border-r border-[#292F40] z-40 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-52 lg:w-56'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-[#292F40]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#6049EA] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-[#8B7CFF]/30">
                <Zap className="w-4 h-4 fill-white text-white" />
              </div>
              <div className="overflow-hidden">
                <div className="font-extrabold tracking-wider text-sm text-[#F3F5FA] flex items-center gap-1 font-sans">
                  RETAIN<span className="text-[#8B7CFF]">IQ</span>
                </div>
                <div className="text-[9px] text-[#9299AD] tracking-wider uppercase font-mono leading-none">
                  CUSTOMER INTELLIGENCE
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-7 h-7 rounded-lg bg-[#8B7CFF] flex items-center justify-center text-[#0B0D14] font-black text-sm">
              R
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-[#1C2130] text-[#9299AD] hover:text-[#F3F5FA] transition-colors hidden md:block"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-3 px-2 space-y-4">
          {navSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-[#9299AD]/60 font-mono">
                  {sec.group}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1C2130] text-[#8B7CFF] border-l-2 border-[#8B7CFF] shadow-sm'
                        : 'text-[#9299AD] hover:text-[#F3F5FA] hover:bg-[#171B27]'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-[#8B7CFF]' : 'text-[#9299AD]'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate tracking-tight">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Info */}
      <div className="p-3 border-t border-[#292F40] bg-[#0E111A]">
        {!collapsed ? (
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-1.5 text-[#55D9E8] font-mono">
              <Database className="w-3 h-3 text-[#55D9E8]" />
              <span className="truncate font-semibold">IBM Telco • 7,032</span>
            </div>
            <div className="text-[#9299AD] truncate text-[9px]">
              Understand. Predict. Protect.
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-[#8B7CFF]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </aside>
  );
};
