import { useState, useEffect, useRef } from 'react';
import { Organizer } from './views/Organizer';
import { AuthView } from './views/AuthView';
import { Settings } from './views/Settings';
import { Menu, X, ChevronDown, LogOut, Settings as SettingsIcon, Shield } from 'lucide-react';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { PageTransition } from './components/PageTransition';
import { GridBackground } from './components/GridBackground';

export default function App() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['organizer', 'create_event', 'analytics', 'settings', 'auth'];
    if (validTabs.includes(hash)) return hash;
    return 'organizer';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Listen for browser Back and Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['organizer', 'create_event', 'analytics', 'settings', 'auth'];
      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab('organizer');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync hash
  useEffect(() => {
    if (activeTab && activeTab !== 'auth') {
      if (window.location.hash !== `#${activeTab}`) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      setActiveTab('auth');
    } catch (e) {
      console.error('Logout error:', e);
      setActiveTab('auth');
    }
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'organizer':
        return (
          <PageTransition key="organizer-dash">
            <Organizer initialView="dashboard" onNavigate={(tab) => setActiveTab(tab)} />
          </PageTransition>
        );
      case 'create_event':
        return (
          <PageTransition key="create-event-dash">
            <Organizer initialView="create" onNavigate={(tab) => setActiveTab(tab)} />
          </PageTransition>
        );
      case 'analytics':
        return (
          <PageTransition key="analytics-dash">
            <Organizer initialView="analytics" onNavigate={(tab) => setActiveTab(tab)} />
          </PageTransition>
        );
      case 'settings':
        return (
          <PageTransition key="settings">
            <Settings onBack={() => setActiveTab('organizer')} />
          </PageTransition>
        );
      default:
        return (
          <PageTransition key="default-dash">
            <Organizer initialView="dashboard" onNavigate={(tab) => setActiveTab(tab)} />
          </PageTransition>
        );
    }
  };

  const getDashboardTitle = () => {
    switch (activeTab) {
      case 'organizer': return 'Dashboard';
      case 'create_event': return 'Create Event';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Admin Dashboard';
    }
  };

  // If not logged in, render Admin Login
  if (!user || activeTab === 'auth') {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans relative selection:bg-purple-100">
        <GridBackground />
        <PageTransition key="auth" className="w-full min-h-screen relative z-10 bg-transparent">
          <AuthView onLoginSuccess={() => setActiveTab('organizer')} />
        </PageTransition>
      </div>
    );
  }

  // Admin Dashboard Shell
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans flex flex-col md:flex-row selection:bg-purple-100 relative z-10">
      <GridBackground />

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-100 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
        <Logo onClick={() => setActiveTab('organizer')} />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleLogout()}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200/50 cursor-pointer"
          >
            Logout
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="content-container" className="flex-1 bg-white overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100 relative z-20">
        <header className="hidden md:flex bg-white/80 backdrop-blur-xl h-16 items-center px-10 sticky top-0 z-30 justify-between border-b border-slate-100">
          <h1 className="text-base font-semibold tracking-tight text-slate-900">
            {getDashboardTitle()}
          </h1>
          <div className="flex items-center gap-6">
            {/* Admin Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition-all cursor-pointer select-none"
                aria-expanded={dropdownOpen}
              >
                <span className="text-sm font-semibold text-slate-900">
                  {user?.displayName || 'Admin Organizer'}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6e2b8b] to-[#da7756] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user?.displayName ? user.displayName[0] : 'A'}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-left"
                  >
                    <div className="p-3 rounded-xl bg-slate-50 mb-1 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6e2b8b] to-[#da7756] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0">
                          {user?.displayName ? user.displayName[0] : 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user?.displayName || 'Admin Organizer'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {user?.email || 'admin@photopic.app'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Shield className="w-2.5 h-2.5" /> Super Admin
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">Active</span>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button 
                        onClick={() => { setActiveTab('settings'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </button>

                      <div className="h-px bg-slate-100 my-1" />

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-10 max-w-[1400px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-between">
          <div>
            {renderDashboardContent()}
          </div>
          
          <footer className="mt-16 pt-8 border-t border-slate-100 text-xs text-slate-400 font-medium flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>GWC PhotoSync Engine 1.0</span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} GWC DATA.AI. All rights reserved.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
