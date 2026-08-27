import { useState, useEffect } from 'react';
import { PublicGallery } from './views/PublicGallery';
import { MyEvents } from './views/MyEvents';
import { Logo } from './components/Logo';
import { ThemeToggle } from './components/ThemeToggle';
import { PageTransition } from './components/PageTransition';
import { GridBackground } from './components/GridBackground';

export default function App() {
  const [publicData, setPublicData] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    if (eventId) {
      return { eventId, orgName: 'Event Guest', eventName: 'Photo Gallery' };
    }
    try {
      const saved = localStorage.getItem('photopic_public_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('event')) return 'public';
    const hash = window.location.hash.replace('#', '');
    if (hash === 'public') return 'public';
    return 'events';
  });

  // Listen for browser Back and Forward button navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('event');
      const hash = window.location.hash.replace('#', '');

      if (eventId) {
        setPublicData({ eventId, orgName: 'Event Guest', eventName: 'Photo Gallery' });
        setActiveTab('public');
      } else if (hash === 'public') {
        setActiveTab('public');
      } else {
        setActiveTab('events');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync activeTab and publicData with URL and localStorage across reloads
  useEffect(() => {
    if (activeTab === 'public') {
      if (publicData?.eventId) {
        localStorage.setItem('photopic_public_data', JSON.stringify(publicData));
        if (!window.location.search.includes(`event=${publicData.eventId}`)) {
          window.history.replaceState(null, '', `/?event=${publicData.eventId}`);
        }
      }
    } else {
      localStorage.setItem('photopic_active_tab', 'events');
      if (window.location.search || window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [activeTab, publicData]);

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-300 antialiased overflow-x-hidden selection:bg-purple-100 dark:selection:bg-purple-950/40">
      
      {/* Background Graphic Grid */}
      <GridBackground />

      {activeTab === 'public' ? (
        /* Public Gallery & Selfie Scanner */
        <PageTransition key="public" className="w-full relative z-10 min-h-screen bg-transparent">
          <PublicGallery 
            eventData={publicData} 
            onBack={() => setActiveTab('events')} 
          />
        </PageTransition>
      ) : (
        /* Public Events Catalog for Attendees */
        <PageTransition key="events-portal" className="min-h-screen bg-transparent font-sans text-slate-900 dark:text-zinc-50 flex flex-col selection:bg-purple-100">
          {/* User Top Header */}
          <header className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800/40 sticky top-0 z-40">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo onClick={() => setActiveTab('events')} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#6e2b8b] dark:text-[#da7756] border border-purple-200/50 dark:border-purple-900/40 hidden sm:inline-block">
                  Events Portal
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* User Content */}
          <main className="max-w-[1400px] mx-auto px-6 py-10 flex-1 w-full">
            <MyEvents 
              onSelectEvent={(data) => {
                setPublicData(data);
                setActiveTab('public');
              }}
            />
          </main>
        </PageTransition>
      )}
    </div>
  );
}
