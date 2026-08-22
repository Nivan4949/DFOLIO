import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Categories = lazy(() => import('./pages/Categories'));
const SubWorks = lazy(() => import('./pages/SubWorks'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Snags = lazy(() => import('./pages/Snags'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const ContractorPortal = lazy(() => import('./pages/ContractorPortal'));
const Settings = lazy(() => import('./pages/Settings'));

const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'midnight'>('midnight');
  const [simulatedRole, setSimulatedRole] = useState<string>('PROJECT_MANAGER');
  const [appReady, setAppReady] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.className = 'bg-[#121316] text-[#F4F2ED] antialiased selection:bg-[#F4F2ED] selection:text-[#121316]';
    } else {
      root.classList.remove('dark');
      document.body.className = 'bg-[#FAF8F5] text-[#16171A] antialiased selection:bg-[#16171A] selection:text-[#FAF8F5]';
    }
  }, [theme]);

  // Initial brand loading animation sequence
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const timer = setTimeout(() => setAppReady(true), 600);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  if (isLoading || (isAuthenticated && !appReady)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] dark:bg-[#121316] text-[#16171A] dark:text-[#F4F2ED] transition-colors duration-500">
        <div className="text-center space-y-4 max-w-xs w-full px-6">
          <div className="w-12 h-12 bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] flex items-center justify-center font-serif text-2xl font-bold mx-auto">
            d.
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight">d.folio</h1>
            <p className="text-[9px] font-medium text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-[0.25em] mt-1">
              ARCHITECTURAL PROJECT CONTROL
            </p>
          </div>

          {/* Minimal animated thin progress line */}
          <div className="w-full h-[1.5px] bg-[#E8E5DF] dark:bg-[#2B2D34] overflow-hidden relative mt-6">
            <div className="absolute left-0 top-0 bottom-0 bg-[#16171A] dark:bg-[#F4F2ED] animate-[arch-loading_1.2s_ease-in-out_infinite] w-1/2" />
          </div>
        </div>

        <style>{`
          @keyframes arch-loading {
            0% { left: -50%; width: 30%; }
            50% { left: 30%; width: 60%; }
            100% { left: 100%; width: 10%; }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'rooms':
        return <Rooms />;
      case 'categories':
        return <Categories />;
      case 'subworks':
        return <SubWorks />;
      case 'tasks':
        return <Tasks />;
      case 'timeline':
        return <Timeline />;
      case 'snags':
        return <Snags />;
      case 'reports':
      case 'photos':
        return <Reports />;
      case 'users':
        return <Users />;
      case 'client':
        return <ClientPortal />;
      case 'contractor':
        return <ContractorPortal />;
      case 'settings':
        return (
          <Settings 
            simulatedRole={simulatedRole} 
            setSimulatedRole={setSimulatedRole} 
            theme={theme} 
            setTheme={setTheme} 
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex relative bg-[#FAF8F5] dark:bg-[#121316] text-[#16171A] dark:text-[#F4F2ED] transition-colors duration-300">
      {/* Sidebar Layout */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      {/* Main Layout Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'pl-20' : 'pl-20 md:pl-64'
      }`}>
        <Topbar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab}
          theme={theme} 
          setTheme={setTheme} 
        />
        
        {/* Page Content area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-fade-in">
          <Suspense fallback={
            <div className="p-16 text-center border border-[#E8E5DF] dark:border-[#2B2D34] bg-white dark:bg-[#1C1D23] rounded-sm">
              <div className="w-8 h-8 bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] flex items-center justify-center font-serif text-sm font-bold mx-auto mb-3">
                d.
              </div>
              <p className="text-[#6E7179] dark:text-[#A0A4AD] text-xs font-medium uppercase tracking-widest">Loading Module...</p>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
