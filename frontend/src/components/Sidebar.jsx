import { Home, FolderHeart, PlusCircle, BarChart3, Settings, ShieldCheck, User } from 'lucide-react';
import { Logo } from './Logo';
import { motion } from 'motion/react';

export function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const userNavItems = [
    { id: 'events', icon: FolderHeart, label: 'My Events' },
  ];

  const adminNavItems = [
    { id: 'organizer', icon: Home, label: 'Dashboard' },
    { id: 'create_event', icon: PlusCircle, label: 'Create Event' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderNavGroup = (items, title, icon) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex flex-col gap-0.5 relative">
        {items.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'organizer' && activeTab === 'dashboard');
          return (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm relative select-none text-left cursor-pointer ${
                isActive 
                  ? 'text-slate-900 dark:text-zinc-50 font-bold' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              {/* Subtle active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveBg"
                  className="absolute inset-0 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100/80 dark:border-purple-900/40 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              {/* Small dot active indicator on left edge */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveDot"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-[#6e2b8b] to-[#da7756] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <item.icon className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? 'text-[#6e2b8b] dark:text-[#da7756] opacity-100' : 'opacity-60'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-r border-slate-100 dark:border-zinc-800/40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0 flex flex-col justify-between py-8 px-5 h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Top: Logo */}
      <div className="flex flex-col gap-8">
        <div className="px-2">
          <Logo onClick={() => { setActiveTab('organizer'); setMobileMenuOpen(false); }} />
        </div>
        
        {/* Navigation Groups */}
        <nav className="space-y-6">
          {/* User Side */}
          {renderNavGroup(userNavItems, 'User Portal', <User className="w-3 h-3 text-[#da7756]" />)}

          {/* Admin Side */}
          {renderNavGroup(adminNavItems, 'Admin Management', <ShieldCheck className="w-3 h-3 text-[#6e2b8b]" />)}
        </nav>
      </div>
    </aside>
  );
}
