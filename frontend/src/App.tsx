import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CustomerDrawer } from './components/CustomerDrawer';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { ChurnRiskExplorer } from './pages/ChurnRiskExplorer';
import { ChurnDrivers } from './pages/ChurnDrivers';
import { CustomerSegments } from './pages/CustomerSegments';
import { RetentionStrategyLab } from './pages/RetentionStrategyLab';
import { ModelPerformance } from './pages/ModelPerformance';
import { Methodology } from './pages/Methodology';
import { GlobalFilters } from './types';
import { api } from './services/api';

export function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Global filters
  const [filters, setFilters] = useState<GlobalFilters>({
    contract: 'all',
    tenure_group: 'all',
  });

  const [lastUpdated, setLastUpdated] = useState('');

  const loadMetadata = async () => {
    try {
      const data = await api.getOverview(filters.contract, filters.tenure_group);
      setLastUpdated(data.last_updated);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, [filters.contract, filters.tenure_group]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.reloadData();
      setLastUpdated(res.last_updated);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const navMeta: Record<string, { section: string; title: string }> = {
    overview: { section: 'OVERVIEW', title: 'Command Center' },
    drivers: { section: 'ANALYTICS', title: 'Churn Drivers' },
    segments: { section: 'ANALYTICS', title: 'Customer Segments' },
    models: { section: 'ANALYTICS', title: 'Model Performance' },
    explorer: { section: 'RETENTION', title: 'Risk Explorer' },
    strategy: { section: 'RETENTION', title: 'Retention Strategy' },
    methodology: { section: 'SYSTEM', title: 'Methodology & Architecture' },
  };

  const currentMeta = navMeta[currentPage] || { section: 'OVERVIEW', title: 'Command Center' };

  const handleExportCSV = () => {
    const url = api.getExportUrl({
      contract: filters.contract,
      tenure_group: filters.tenure_group,
    });
    window.open(url, '_blank');
  };

  const handleSearchCustomer = (id: string) => {
    setSelectedCustomerId(id);
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F3F5FA] flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace */}
      <div
        className={`flex-1 min-h-screen transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'ml-16' : 'ml-52 lg:ml-56'
        }`}
      >
        {/* Top Toolbar */}
        <Header
          currentSection={currentMeta.section}
          currentPageTitle={currentMeta.title}
          lastUpdated={lastUpdated}
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={handleRefresh}
          onExportClick={handleExportCSV}
          onSearchCustomer={handleSearchCustomer}
          sidebarCollapsed={sidebarCollapsed}
          refreshing={refreshing}
        />

        {/* Dynamic Canvas */}
        <main className="flex-1 p-3.5 sm:p-5 mt-14 max-w-[1600px] w-full mx-auto">
          {currentPage === 'overview' && (
            <ExecutiveOverview
              filters={filters}
              onFilterChange={setFilters}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onNavigateTo={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'drivers' && <ChurnDrivers />}

          {currentPage === 'segments' && (
            <CustomerSegments
              onSelectSegment={(dim, val) => {
                if (dim === 'Contract') setFilters({ ...filters, contract: val });
                if (dim === 'tenure_group') setFilters({ ...filters, tenure_group: val });
                setCurrentPage('overview');
              }}
            />
          )}

          {currentPage === 'models' && <ModelPerformance />}

          {currentPage === 'explorer' && (
            <ChurnRiskExplorer
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
            />
          )}

          {currentPage === 'strategy' && <RetentionStrategyLab />}

          {currentPage === 'methodology' && <Methodology />}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#292F40] px-5 py-2.5 text-[10px] text-[#9299AD] flex items-center justify-between bg-[#0E111A]">
          <div>
            <span className="font-bold text-[#F3F5FA]">RETAINIQ</span> • Customer Retention Command Center
          </div>
          <div className="font-mono text-[#9299AD]/80">
            IBM Telco Dataset (7,032 records) • Scikit-Learn 1.6 • FastAPI • React 18
          </div>
        </footer>
      </div>

      {/* Slide-over Customer Intelligence Drawer */}
      <CustomerDrawer
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onTargetInLab={() => {
          setCurrentPage('strategy');
        }}
      />
    </div>
  );
}

export default App;
