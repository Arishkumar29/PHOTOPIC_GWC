import { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Folder, Copy, CheckCircle, ExternalLink, SlidersHorizontal, Image as ImageIcon, Camera, ChevronDown, Check, FolderArchive, Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch, resolveMediaUrl } from '../lib/api';
import { downloadPhotosAsZip } from '../lib/zipHelper';

export function MyEvents({ onSelectEvent, onBack }) {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [zippingEventId, setZippingEventId] = useState(null);
  const [zipProgress, setZipProgress] = useState(null);
  const sortRef = useRef(null);

  const handleDownloadEventZip = async (eventObj) => {
    const photos = eventObj.photos || [];
    if (photos.length === 0 || zippingEventId) return;
    setZippingEventId(eventObj.eventId);
    setZipProgress({ current: 0, total: photos.length });
    try {
      const resolvedUrls = photos.map(p => resolveMediaUrl(p));
      const safeName = (eventObj.eventName || 'event').replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadPhotosAsZip(resolvedUrls, `${safeName}_all_photos.zip`, (current, total) => {
        setZipProgress({ current, total });
      });
    } catch (err) {
      console.error("Failed to download event zip:", err);
    } finally {
      setZippingEventId(null);
      setZipProgress(null);
    }
  };

  useEffect(() => { 
    fetchEvents(); 
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortDropdownOpen]);

  const fetchEvents = async () => {
    try {
      const res = await apiFetch('/api/events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) { 
      console.error(e); 
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { 
      return 'Jun 15, 2026'; 
    }
  };

  const filteredEvents = events
    .filter(e => {
      const q = searchTerm.toLowerCase();
      return e.eventName.toLowerCase().includes(q) || (e.orgName || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return b.eventId.localeCompare(a.eventId);
      if (sortBy === 'Oldest') return a.eventId.localeCompare(b.eventId);
      if (sortBy === 'Name') return a.eventName.localeCompare(b.eventName);
      return 0;
    });

  const sortOptions = [
    { value: 'Newest', label: 'Newest first' },
    { value: 'Oldest', label: 'Oldest first' },
    { value: 'Name', label: 'By name (A–Z)' }
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Newest first';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2 }}
      className="space-y-8 text-left font-sans text-slate-900 dark:text-zinc-50"
    >
      {/* ─── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6e2b8b] dark:text-[#da7756] mb-2">
            Event Galleries
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">
            My <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756]">Events.</span>
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mt-1">
            Select an event to launch the selfie finder or view its guest QR code.
          </p>
        </div>
      </div>

      {/* ─── TOOLBAR: SEARCH + SORT + TABS ───────────────────────── */}
      <div className="space-y-4 relative z-30">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-[#6e2b8b] transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6e2b8b] font-medium text-sm text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors shadow-sm"
              placeholder="Search event galleries…"
            />
          </div>

          {/* Custom Sort Dropdown */}
          <div className="relative shrink-0 z-40" ref={sortRef}>
            <button
              onClick={() => setSortDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-zinc-100 shadow-sm transition-all cursor-pointer select-none"
              aria-expanded={sortDropdownOpen}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#6e2b8b] dark:text-[#da7756]" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.2 }}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 z-50 space-y-0.5"
                >
                  {sortOptions.map(option => {
                    const isSelected = sortBy === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-[#6e2b8b] dark:text-[#da7756]'
                            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#6e2b8b] dark:text-[#da7756]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── EVENT GRID ──────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredEvents.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 rounded-[2.5rem] p-16 text-center max-w-lg mx-auto shadow-sm"
          >
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Folder className="w-7 h-7 text-[#6e2b8b] dark:text-[#da7756]" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mb-2">
              No galleries found
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm leading-relaxed">
              {searchTerm ? `No results for "${searchTerm}"` : 'No event galleries available yet.'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((e, i) => {
              return (
                <motion.div
                  layout
                  key={e.eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', bounce: 0.2, delay: i * 0.05 }}
                  className="group bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                >
                  {/* Cover image */}
                  <div 
                    onClick={() => onSelectEvent(e)}
                    className="relative h-44 bg-slate-100 dark:bg-zinc-800 overflow-hidden cursor-pointer"
                  >
                    {e.coverImage ? (
                      <img
                        src={e.coverImage}
                        alt={e.eventName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-7 h-7 text-slate-400 dark:text-zinc-600" />
                        <span className="text-xs font-medium text-slate-400 dark:text-zinc-600">Event Gallery</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#da7756]" /> Open Selfie Finder
                      </span>
                    </div>

                    {/* Live Status badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-white border border-emerald-400/40 backdrop-blur-md shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live
                    </span>

                    {/* Photo count pill */}
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-sm">
                      {e.photos?.length || 0} photos
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 
                        onClick={() => onSelectEvent(e)}
                        className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-50 truncate cursor-pointer hover:text-[#6e2b8b] dark:hover:text-[#da7756] transition-colors"
                      >
                        {e.eventName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(e.createdAt)}
                        </span>
                        <span>by {e.orgName || 'Organizer'}</span>
                      </div>
                    </div>

                    {/* User Action buttons: Direct Selfie Page & Download ZIP */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800/40">
                      {/* 1. Open Selfie Page */}
                      <button
                        onClick={() => onSelectEvent(e)}
                        className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/20 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Open Gallery</span>
                      </button>

                      {/* 2. Download ZIP */}
                      <button
                        onClick={() => handleDownloadEventZip(e)}
                        disabled={zippingEventId === e.eventId}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Download all event photos as ZIP"
                      >
                        {zippingEventId === e.eventId ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 text-[#6e2b8b] animate-spin" />
                            <span>Zipping...</span>
                          </>
                        ) : (
                          <>
                            <FolderArchive className="w-3.5 h-3.5 text-[#da7756]" />
                            <span>Download ZIP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
