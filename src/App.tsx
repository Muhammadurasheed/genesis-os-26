import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { RevolutionaryLanding } from './components/landing/RevolutionaryLanding';
import { AuthForm } from './components/auth/AuthForm';
import { EnhancedWizardFlow } from './components/wizard/EnhancedWizardFlow';
import { Header } from './components/layout/Header';
import { BackendStatus } from './components/ui/BackendStatus';
import { ProductionReadinessDashboard } from './components/phase3/ProductionReadinessDashboard';
import { QuantumLoader } from './components/ui/QuantumLoader';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { MagicalBackground } from './components/ui/MagicalBackground';
import { getAuthErrorFromURL } from './lib/auth-utils';
// Import auto-executor to trigger Phase 4 completion
import './services/phase4AutoExecutor';
import { MainDashboard } from './components/pages/MainDashboard';
import { AgentsPage } from './components/pages/AgentsPage';
import { GuildsPage } from './components/pages/GuildsPage';
// import { MarketplacePage } from './components/pages/MarketplacePage';
import { Phase4CompletionDashboard } from './components/phase4/Phase4CompletionDashboard';
import { Phase2Canvas } from './components/canvas/Phase2Canvas';

type AppState = 'landing' | 'auth' | 'app';
type AppPage = 'dashboard' | 'guilds' | 'agents' | 'marketplace' | 'wizard' | 'analytics' | 'phase4' | 'canvas';

function App() {
  const { user, loading, initialize } = useAuthStore();
  const [appState, setAppState] = useState<AppState>('app');
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [guestMode, setGuestMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 Phase 1: Initializing GenesisOS Foundation...');
    initialize();
    
    // Check for auth errors in URL
    const errorFromURL = getAuthErrorFromURL();
    if (errorFromURL) {
      setAuthError(errorFromURL);
      setAppState('auth');
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user || guestMode) {
        console.log('✅ User authenticated - entering Genesis Platform:', user?.email || 'Guest Mode');
        setAppState('app');
      } else if (!guestMode) {
        console.log('👤 Anonymous user - showing landing experience');
        if (appState !== 'auth') {
          setAppState('landing');
        }
      }
    }
  }, [user, loading, guestMode]);

  

  if (loading) {
    return (
      <MagicalBackground variant="cosmic" intensity="subtle">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            {/* Animated Genesis Logo */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
              <span className="text-white font-bold text-3xl relative z-10">G</span>
            </div>
            
            {/* Quantum Loader */}
            <QuantumLoader size="lg" color="purple" />
            
            <div className="mt-8 space-y-2">
              <p className="text-white/90 text-lg font-medium">Initializing AI-Native Workspace</p>
              <p className="text-white/60 text-sm">Loading revolutionary platform...</p>
            </div>
            
            {/* Progress indicators */}
            <div className="mt-6 space-y-1 text-white/40 text-xs">
              <p>🧠 Loading neural networks...</p>
              <p>⚡ Establishing quantum connections...</p>
              <p>🌟 Preparing digital workforce...</p>
            </div>
          </div>
        </div>
        <BackendStatus />
      </MagicalBackground>
    );
  }

  if (appState === 'landing') {
    return (
      <>
        <RevolutionaryLanding 
          onGetStarted={() => setGuestMode(true)}
          onSignIn={() => setAppState('auth')}
        />
        <BackendStatus />
      </>
    );
  }

  if (appState === 'auth') {
    return (
      <>
        <AuthForm 
          initialError={authError}
          onBack={() => setAppState('landing')}
        />
        <BackendStatus />
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <MainDashboard onNavigate={setCurrentPage} />;
      case 'canvas':
        return <Phase2Canvas />;
      case 'guilds':
        return <GuildsPage />;
      case 'agents':
        return <AgentsPage />;
      case 'marketplace':
        return <ProductionReadinessDashboard workspaceId="demo-workspace" />;
      case 'wizard':
        return <EnhancedWizardFlow />;
      case 'analytics':
        return <AnalyticsDashboard guildId="main-guild" />;
      case 'phase4':
        return <Phase4CompletionDashboard />;
      default:
        return <MainDashboard onNavigate={setCurrentPage} />;
    }
  };

  // User is authenticated or in guest mode - show the main Genesis experience
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isGuest={guestMode} 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <main>
        {renderCurrentPage()}
      </main>
      <BackendStatus />
    </div>
  );
}

export default App;
