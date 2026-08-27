import { Home, PlusCircle, BarChart3, Settings, Eye } from 'lucide-react';
import { Logo } from './Logo';
import { motion } from 'motion/react';

export function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const adminNavItems = [
    { id: 'organizer', icon: Home, label: 'Dashboard' },
    { id: 'create_event', icon: PlusCircle, label: 'Create Event' },
    { id: 'preview', icon: Eye, label: 'Live Preview' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0 flex flex-col justify-between py-8 px-5 h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Top: Logo & Navigation */}
      <div className="flex flex-col gap-8">
        <div className="px-2">
          <Logo onClick={() => { setActiveTab('organizer'); setMobileMenuOpen(false); }} />
        </div>
        
        {/* Navigation Group */}
        <div className="space-y-1">
          <nav className="flex flex-col gap-1 relative">
            {adminNavItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'organizer' && activeTab === 'dashboard');
              return (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-semibold transition-all text-sm relative select-none text-left cursor-pointer ${
                    isActive 
                      ? 'text-slate-900 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {/* Active pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="adminSidebarActiveBg"
                      className="absolute inset-0 bg-purple-50/80 border border-purple-100 rounded-2xl -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  {/* Dot indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="adminSidebarActiveDot"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-[#6e2b8b] to-[#da7756] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? 'text-[#6e2b8b] opacity-100' : 'opacity-60'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div />
    </aside>
  );
}
