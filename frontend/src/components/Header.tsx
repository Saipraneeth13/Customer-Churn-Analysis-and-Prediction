import React, { useState } from 'react';
import {
  RotateCcw,
  Clock,
  Download,
  Search,
  Database,
  CheckCircle2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { GlobalFilters } from '../types';

interface HeaderProps {
  currentSection: string;
  currentPageTitle: string;
  lastUpdated: string;
  filters: GlobalFilters;
  onFilterChange: (filters: GlobalFilters) => void;
  onRefresh: () => void;
  onExportClick: () => void;
  onSearchCustomer?: (customerId: string) => void;
  sidebarCollapsed: boolean;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  currentPageTitle,
  lastUpdated,
  filters,
  onFilterChange,
  onRefresh,
  onExportClick,
  onSearchCustomer,
  sidebarCollapsed,
  refreshing,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && onSearchCustomer) {
      onSearchCustomer(searchValue.trim().toUpperCase());
    }
  };

  return (
    <header
      className={`h-14 bg-[#10131D]/90 backdrop-blur-md border-b border-[#292F40] fixed top-0 right-0 z-30 flex items-center justify-between px-4 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-52 lg:left-56'
      }`}
    >
      {/* Left: Breadcrumbs & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#9299AD]">
          <span className="uppercase tracking-wider text-[10px] text-[#9299AD]/70">
            {currentSection}
          </span>
          <span>/</span>
          <span className="font-semibold text-[#F3F5FA] font-sans">{currentPageTitle}</span>
        </div>

        {/* Dataset Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#171B27] border border-[#292F40] text-[10px] text-[#5DE2B1] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5DE2B1] animate-pulse" />
          <span>IBM Telco • Verified Snapshot</span>
        </div>
      </div>

      {/* Right: Search, Filter, Refresh, Export, Last-updated */}
      <div className="flex items-center gap-2">
        {/* Quick Customer Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9299AD]" />
          <input
            type="text"
            placeholder="Search ID (e.g. 7590-VHVEG)..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-48 lg:w-56 bg-[#171B27] border border-[#292F40] rounded-md pl-8 pr-3 py-1 text-xs text-[#F3F5FA] placeholder-[#9299AD]/60 focus:outline-none focus:border-[#8B7CFF] transition-colors"
          />
        </form>

        {/* Global Contract Quick Filter */}
        <div className="hidden xl:flex items-center gap-1 bg-[#171B27] border border-[#292F40] rounded-md px-2 py-1 text-[11px]">
          <span className="text-[#9299AD]">Contract:</span>
          <select
            value={filters.contract || 'all'}
            onChange={(e) => onFilterChange({ ...filters, contract: e.target.value })}
            className="bg-transparent text-[#F3F5FA] font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#171B27]">All</option>
            <option value="Month-to-month" className="bg-[#171B27]">Month-to-month</option>
            <option value="One year" className="bg-[#171B27]">One year</option>
            <option value="Two year" className="bg-[#171B27]">Two year</option>
          </select>
        </div>

        {/* Refresh Control */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-md bg-[#171B27] border border-[#292F40] text-[#9299AD] hover:text-[#F3F5FA] hover:bg-[#1C2130] transition-colors disabled:opacity-50"
          title="Reload dataset and recalculate metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#8B7CFF]' : ''}`} />
        </button>

        {/* Real CSV Export */}
        <button
          onClick={onExportClick}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[#8B7CFF] hover:bg-[#7968FA] text-[#0B0D14] px-2.5 py-1 rounded-md transition-colors shadow-sm shadow-[#8B7CFF]/20"
          title="Download filtered dataset with risk probabilities as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Last updated timestamp */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-[#9299AD] border-l border-[#292F40] pl-2 font-mono">
          <Clock className="w-3 h-3 text-[#9299AD]/60" />
          <span>{lastUpdated ? lastUpdated.split(' ')[0] : 'Synced'}</span>
        </div>
      </div>
    </header>
  );
};
