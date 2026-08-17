import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const body = document.body;
    if (theme === 'midnight') {
      body.className = 'bg-[#060814] text-[#f3f4f6]';
    } else {
      body.className = 'bg-[#030712] text-[#f3f4f6]';
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060814]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Initializing DFOLIO Session...</p>
        </div>
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
    <div className={`min-h-screen flex relative overflow-hidden transition-all duration-300 ${
      theme === 'midnight' 
        ? 'bg-gradient-to-br from-[#060814] via-[#02040b] to-[#0d1527]' 
        : 'bg-gradient-to-br from-[#030712] via-[#010307] to-[#0e1625]'
    }`}>
      {/* Background Lighting Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

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
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Suspense fallback={
            <div className="glass-card p-16 text-center rounded-2xl animate-fade-in">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Page Module...</p>
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
