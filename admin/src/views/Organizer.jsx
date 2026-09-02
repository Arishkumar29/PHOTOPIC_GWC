import { useState, useEffect, useRef } from 'react';
import { Home, PlusCircle, BarChart3, Settings, ArrowRight, CheckCircle2, Link as LinkIcon, Building2, Calendar, Copy, Loader2, Sparkles, UploadCloud, Trash2, Image as ImageIcon, Eye, Users, CalendarRange, MapPin, AlertCircle, Camera, Zap, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { googleSignIn } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

const PRESET_COVERS = [
  { id: 'celebration', name: 'Celebration', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80' },
  { id: 'corporate', name: 'Corporate', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80' },
  { id: 'festival', name: 'Festival', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&auto=format&fit=crop&q=80' },
  { id: 'travel', name: 'Outdoor', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop&q=80' },
];

function CountUp({ end, duration = 1 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function CustomAreaChart({ timeline }) {
  const height = 240;
  const width = 640;
  const padding = 40;

  const dates = timeline?.labels || [];
  const values = timeline?.data || [];

  const maxVal = Math.max(...values, 10) * 1.1;
  const roundedMax = Math.ceil(maxVal / 10) * 10;
  const gridLines = [
    roundedMax,
    Math.round(roundedMax * 0.8),
    Math.round(roundedMax * 0.6),
    Math.round(roundedMax * 0.4),
    Math.round(roundedMax * 0.2),
    0
  ];

  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const getY = (val) => {
    const norm = val / roundedMax;
    return height - padding - norm * chartHeight;
  };

  const getX = (idx) => {
    if (dates.length <= 1) return padding + chartWidth / 2;
    return padding + (idx / (dates.length - 1)) * chartWidth;
  };

  const points = values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
  const pathD = points.length > 0 ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}` : '';
  const areaD = points.length > 0 ? `${pathD} L ${getX(dates.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z` : '';

  return (
    <div className="w-full overflow-x-auto scrollbar-none bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative">
      <div className="min-w-[600px] relative">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="areaNeutralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6e2b8b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6e2b8b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {gridLines.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  className="stroke-slate-100" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 12} 
                  y={y + 3.5} 
                  textAnchor="end" 
                  className="text-[10px] font-semibold fill-slate-400 font-sans"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {dates.map((date, idx) => {
            const x = getX(idx);
            return (
              <text 
                key={date}
                x={x}
                y={height - padding + 22}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-400 font-sans"
              >
                {date}
              </text>
            );
          })}

          <motion.path 
            d={areaD}
            fill="url(#areaNeutralGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.5 }}
          />

          <motion.path 
            d={pathD}
            fill="none"
            stroke="#6e2b8b"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {points.map((p, idx) => (
            <motion.circle 
              key={idx}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#6e2b8b"
              className="stroke-white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export function Organizer({ initialView = 'dashboard', onNavigate, onOpenPreview }) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState(initialView);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  useEffect(() => {
    if (viewMode === 'create') {
      if (window.location.hash !== '#create_event') window.history.replaceState(null, '', '#create_event');
    } else if (viewMode === 'analytics') {
      if (window.location.hash !== '#analytics') window.history.replaceState(null, '', '#analytics');
    } else if (viewMode === 'dashboard') {
      if (window.location.hash !== '#organizer' && window.location.hash !== '') {
        window.history.replaceState(null, '', '#organizer');
      }
    }
  }, [viewMode]);

  const [events, setEvents] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [startDate, setStartDate] = useState('2026-07-04');
  const [endDate, setEndDate] = useState('2026-07-04');
  const [eventType, setEventType] = useState('Wedding');
  const [eventLocation, setEventLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [cloudProvider, setCloudProvider] = useState('onedrive'); // 'onedrive' | 'gdrive'
  const [folderLink, setFolderLink] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [eventId, setEventId] = useState('');
  const [syncError, setSyncError] = useState('');

  const [errors, setErrors] = useState({});
  const wizardFileRef = useRef(null);

  // Analytics sub-tabs
  const [analyticsSubTab, setAnalyticsSubTab] = useState('Analytics');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30');
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState('Month');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showGroupByDropdown, setShowGroupByDropdown] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    visits: 0,
    views: 0,
    downloads: 0,
    faceScans: 0,
    timeline: { labels: [], data: [] }
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await apiFetch(`/api/analytics?period=${analyticsPeriod}`);
      const data = await res.json();
      setAnalyticsData(data);
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'analytics') {
      fetchAnalytics();
    }
  }, [viewMode, analyticsPeriod]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await apiFetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event gallery permanently?")) return;
    try {
      const res = await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.eventId !== id));
        fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [editingEvent, setEditingEvent] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editCoverFileInputRef = useRef(null);

  const openEditModal = (eventObj) => {
    setEditingEvent({
      eventId: eventObj.eventId,
      eventName: eventObj.eventName || '',
      orgName: eventObj.orgName || '',
      coverImage: eventObj.coverImage || PRESET_COVERS[0].url,
      description: eventObj.description || '',
      eventLocation: eventObj.eventLocation || '',
      eventType: eventObj.eventType || 'Wedding',
      folderId: eventObj.folderId === 'local_upload' ? '' : (eventObj.folderId || '')
    });
  };

  const handleEditCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditingEvent(prev => ({ ...prev, coverImage: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!editingEvent || !editingEvent.eventId) return;
    setIsSavingEdit(true);
    try {
      let resolvedFolderId = editingEvent.folderId;
      if (resolvedFolderId && resolvedFolderId.includes('drive.google.com')) {
        const match = resolvedFolderId.match(/folders\/([a-zA-Z0-9_-]+)/);
        if (match) resolvedFolderId = match[1];
      }

      const payload = {
        ...editingEvent,
        folderId: resolvedFolderId ? resolvedFolderId.trim() : 'local_upload'
      };

      const res = await apiFetch(`/api/events/${editingEvent.eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEvents(prev => prev.map(ev => ev.eventId === editingEvent.eventId ? { ...ev, ...payload } : ev));
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to update event:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep1 = () => {
    const errs = {};
    if (!eventName.trim()) errs.eventName = "Event name is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleDriveSync = async () => {
    if (!folderLink) return;
    setIsSyncing(true);
    setSyncError('');
    try {
      const isOneDrive = cloudProvider === 'onedrive' || folderLink.includes('1drv.ms') || folderLink.includes('onedrive.live.com') || folderLink.includes('sharepoint.com');
      let folderId = folderLink.trim();
      let accessToken = 'public_sync_token';

      if (!isOneDrive) {
        try {
          const authResult = await googleSignIn();
          if (authResult?.accessToken) accessToken = authResult.accessToken;
        } catch (e) {
          // non-fatal for public Google Drive links
        }
        const match = folderLink.match(/folders\/([a-zA-Z0-9-_]+)/);
        if (match) folderId = match[1];
      }
      
      const newEventId = "evt_" + Math.random().toString(36).substring(2, 9);
      
      const response = await apiFetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: newEventId,
          folderId,
          accessToken,
          orgName: orgName || user?.displayName || 'GWC PhotoSync host',
          eventName: eventName,
          coverImage: coverImage
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || errData?.message || 'Unable to connect to the server. Please check your setup.');
      }
      
      setEventId(newEventId);
      setStep(3);
      fetchEvents();
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      console.error(err);
      setSyncError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const totalPhotosSynced = events.reduce((sum, e) => sum + (e.photos?.length || 0), 0);
  const userAppUrl = window.location.port === '5174' ? 'http://localhost:5173' : window.location.origin;
  const publicLink = eventId ? `${userAppUrl}/?event=${eventId}` : '';

  const handleOpenPublicView = (e) => {
    if (onOpenPreview) {
      onOpenPreview(e);
    } else {
      const targetUrl = `${userAppUrl}/?event=${e.eventId}`;
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="w-full text-slate-900 font-sans text-left">
      <AnimatePresence mode="wait">
        
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Welcome banner */}
            <div className="bg-gradient-to-br from-purple-50/80 via-white to-orange-50/60 border border-purple-100 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#6e2b8b]/10 to-[#da7756]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/70 text-[#6e2b8b] text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200/60 select-none">
                  <Sparkles className="w-3.5 h-3.5 text-[#da7756]" /> Organizer Dashboard
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-slate-900 mb-3">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756] font-serif italic">{user?.displayName || 'Admin'}.</span>
                </h2>
                <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                  Upload galleries to Google Drive, index photos with high-accuracy AI facial recognition, and share QR codes with guests.
                </p>
              </div>

              <div className="relative z-10 shrink-0 hidden sm:flex items-center justify-center -my-6 sm:-my-8 md:-my-10 -mr-2 sm:-mr-4 md:-mr-6">
                <motion.img 
                  src="/welcome_mascot.png" 
                  alt="GWC Mascot" 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-40 sm:w-48 md:w-56 lg:w-64 max-h-[220px] md:max-h-[260px] h-auto object-contain drop-shadow-[0_15px_30px_rgba(110,43,139,0.18)] select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Events', val: events.length },
                { label: 'Photos Synced', val: totalPhotosSynced },
                { label: 'Guests Reached', val: events.length * 14 },
                { label: 'Downloads', val: events.length * 28 },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ type: 'spring', bounce: 0.3 }}
                  className="bg-white border border-purple-100/70 p-6 rounded-[1.75rem] flex flex-col justify-between min-h-[120px] hover:shadow-md transition-all hover:border-[#6e2b8b]/30"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
                  <span className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">
                    <CountUp end={stat.val} />
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Workflow strip */}
            <div className="bg-gradient-to-r from-[#6e2b8b] via-[#8c35b0] to-[#da7756] rounded-[1.75rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl shadow-purple-950/20 text-white">
              <div className="absolute inset-0 pointer-events-none grid grid-cols-8 grid-rows-2 gap-6 opacity-10 p-6">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-6 h-6 flex items-center justify-center">
                    {i % 2 === 0 ? <Camera className="w-full h-full text-white"/> : <Zap className="w-full h-full text-white"/>}
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <h4 className="text-lg sm:text-xl font-semibold tracking-tight text-white">The GWC FaceSync Workflow</h4>
                <p className="text-sm font-medium text-white/85 mt-1">Create Gallery → Connect Drive / Upload </p>
              </div>
              <button 
                onClick={() => setViewMode('create')}
                className="bg-white hover:bg-slate-100 text-[#6e2b8b] font-bold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl shrink-0 relative z-10 whitespace-nowrap cursor-pointer hover:scale-102"
              >
                Create Gallery
              </button>
            </div>

            {/* Recent galleries */}
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-medium tracking-tight">Recent Galleries</h3>
              </div>
              
              {events.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-[1.75rem] p-12 text-center">
                  <h4 className="text-xl font-medium tracking-tight text-slate-900 mb-2">No galleries yet</h4>
                  <p className="text-slate-500 font-medium">Create your first event gallery to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {events.slice(0, 3).map((e, i) => (
                    <motion.div
                      key={e.eventId}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ type: 'spring', bounce: 0.2, delay: i * 0.08 }}
                      className="bg-slate-50 border border-slate-100 rounded-[1.75rem] overflow-hidden flex flex-col hover:shadow-lg transition-shadow group"
                    >
                      <div className="h-36 relative bg-slate-200 overflow-hidden">
                        {e.coverImage ? (
                          <img src={e.coverImage} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                        )}
                        <span className="absolute top-3 left-3 text-[9px] bg-white/90 text-slate-900 backdrop-blur font-bold px-2 py-0.5 rounded-full border border-slate-100 uppercase">
                          {e.folderId === 'local_upload' ? 'Draft' : 'Live'}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="font-medium text-base tracking-tight truncate text-slate-900">{e.eventName}</h5>
                          <p className="text-xs text-slate-500 font-medium mt-1">{e.orgName}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          <button 
                            onClick={() => handleOpenPublicView(e)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            Preview
                          </button>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => openEditModal(e)}
                              className="text-xs font-semibold text-[#6e2b8b] hover:underline transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteEvent(e.eventId)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {viewMode === 'create' && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 md:p-10 relative overflow-hidden min-h-[580px] flex flex-col justify-between"
          >
            {/* Step indicator */}
            <div className="flex justify-center items-center gap-6 sm:gap-10 mb-10 pb-6 border-b border-slate-200/60 shrink-0">
              {[
                { n: 1, label: 'Event Details' },
                { n: 2, label: 'Cloud Storage' },
                { n: 3, label: 'Review & Publish' },
              ].map((s, idx) => (
                <div key={s.n} className="flex items-center gap-2.5">
                  {idx > 0 && <div className="w-8 sm:w-14 h-px bg-slate-200 shrink-0 -ml-4 mr-2.5" />}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step >= s.n
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>{s.n}</div>
                  <span className={`text-xs font-medium tracking-tight hidden sm:block ${
                    step >= s.n ? 'text-slate-900' : 'text-slate-400'
                  }`}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 pb-20">
              <AnimatePresence mode="wait">
                 {step === 1 && (
                  <motion.div 
                    key="step1" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start"
                  >
                    <div className="lg:col-span-3 space-y-6 text-left">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Event Name</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={eventName}
                            onChange={e => { setEventName(e.target.value); setErrors({...errors, eventName: null}); }}
                            className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:outline-none font-medium text-base text-slate-900 placeholder:text-slate-400 transition-colors ${
                              errors.eventName
                                ? 'border-red-400'
                                : 'border-slate-200 focus:border-slate-900'
                            }`}
                            placeholder="e.g. Wedding 2026"
                          />
                          {errors.eventName && <AlertCircle className="absolute right-4 top-4 text-red-400 w-5 h-5" />}
                        </div>
                        {errors.eventName && <p className="text-xs text-red-500 font-medium mt-1.5 ml-1">{errors.eventName}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Start Date</label>
                          <input 
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-slate-900 font-medium text-sm text-slate-900 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">End Date</label>
                          <input 
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-slate-900 font-medium text-sm text-slate-900 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Event Type</label>
                          <div className="flex flex-wrap gap-1.5">
                            {['Wedding', 'Corporate', 'Concert', 'School', 'Sports', 'Other'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setEventType(type)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  eventType === type
                                    ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756] text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-purple-300'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Location <span className="normal-case text-slate-400">(optional)</span></label>
                          <input 
                            type="text"
                            value={eventLocation}
                            onChange={e => setEventLocation(e.target.value)}
                            className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-slate-900 font-medium text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
                            placeholder="City, Venue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Description <span className="normal-case text-slate-400">(optional)</span></label>
                        <textarea 
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          rows={2}
                          className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-slate-900 font-medium text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-colors"
                          placeholder="A brief description of this event…"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Gallery Cover Page</label>
                          <button 
                            onClick={() => wizardFileRef.current?.click()}
                            className="text-xs font-semibold text-slate-500 hover:opacity-60 transition-opacity flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Upload Custom
                          </button>
                          <input type="file" ref={wizardFileRef} onChange={handleCustomCoverUpload} accept="image/*" className="hidden" />
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                          {PRESET_COVERS.map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => setCoverImage(preset.url)}
                              className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.03] ${
                                coverImage === preset.url
                                  ? 'border-slate-900 scale-[1.03] shadow-lg'
                                  : 'border-transparent hover:border-slate-200'
                              }`}
                            >
                              <img src={preset.url} className="w-full h-full object-cover" />
                              {coverImage === preset.url && (
                                <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />
                                </div>
                              )}
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                <p className="text-white text-[9px] font-semibold text-center">{preset.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-white border border-purple-100 text-slate-900 rounded-[2rem] overflow-hidden shadow-lg relative">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={coverImage} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/20">
                            {eventType}
                          </div>
                          <div className="absolute top-3 right-3 bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-100">
                            @{user?.displayName?.split(' ')[0]?.toLowerCase() || 'admin'}
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6e2b8b] mb-1">Gallery Preview</div>
                            <h4 className="text-xl font-semibold tracking-tight text-slate-900 leading-tight">
                              {eventName || <span className="text-slate-400 italic">Untitled Event</span>}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            {eventLocation && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {eventLocation}
                              </span>
                            )}
                            {startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {startDate}
                              </span>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex gap-1.5">
                              {[1,2,3].map(n => (
                                <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= 1 ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756]' : 'bg-slate-200'}`} />
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold mt-2">Step 1 of 3 — Event Details</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="max-w-2xl mx-auto space-y-8 text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-[#6e2b8b] mb-3">Step 2 of 3</div>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-[1.05] mb-3">
                          Connect your <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756]">Cloud Storage.</span>
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                          Link your cloud folder. All event photos are streamed and matched directly from the cloud without using local server storage.
                        </p>
                      </div>
                      <div className="shrink-0 hidden sm:block">
                        <img src="/mascot_handshake.png" alt="Cloud Partner" className="w-32 h-auto object-contain drop-shadow-md" />
                      </div>
                    </div>

                    {/* Cloud Storage Provider Selector */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2.5">
                        Choose Cloud Storage Provider
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => { setCloudProvider('onedrive'); setFolderLink(''); }}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                            cloudProvider === 'onedrive'
                              ? 'border-[#0078D4] bg-blue-50/50 shadow-sm ring-2 ring-[#0078D4]/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="w-11 h-11 rounded-xl bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center font-bold text-xl shrink-0">
                            ☁️
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                              Microsoft OneDrive
                              <span className="text-[10px] bg-blue-100 text-[#0078D4] font-bold px-1.5 py-0.5 rounded-full">Recommended</span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">1drv.ms or onedrive.live.com</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setCloudProvider('gdrive'); setFolderLink(''); }}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                            cloudProvider === 'gdrive'
                              ? 'border-[#6e2b8b] bg-purple-50/50 shadow-sm ring-2 ring-[#6e2b8b]/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="w-11 h-11 rounded-xl bg-[#6e2b8b]/10 text-[#6e2b8b] flex items-center justify-center font-bold text-xl shrink-0">
                            📁
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">Google Drive</div>
                            <div className="text-xs text-slate-500 font-medium">drive.google.com folder</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Step-by-step guidance */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {cloudProvider === 'onedrive' ? [
                        { n: '01', title: 'Open OneDrive', body: 'Go to onedrive.live.com and open or create your event folder or album.' },
                        { n: '02', title: 'Share Folder', body: 'Right-click folder → Share → set access to “Anyone with the link can view”.' },
                        { n: '03', title: 'Paste Link', body: 'Paste your 1drv.ms/… or OneDrive link below to index cloud photos.' },
                      ].map((card) => (
                        <div key={card.n} className="bg-white border border-blue-100 rounded-[1.5rem] p-5 text-slate-900 shadow-sm">
                          <div className="text-2xl font-bold tracking-tight text-[#0078D4] mb-3">{card.n}</div>
                          <h4 className="font-semibold text-base mb-1.5">{card.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{card.body}</p>
                        </div>
                      )) : [
                        { n: '01', title: 'Open Drive', body: 'Go to drive.google.com and create or open a folder with your event photos.' },
                        { n: '02', title: 'Share Folder', body: 'Right-click the folder → Share → set link access to “Anyone with link can view”.' },
                        { n: '03', title: 'Paste Link', body: 'Copy the folder link and paste it in the field below to connect your gallery.' },
                      ].map((card) => (
                        <div key={card.n} className="bg-white border border-purple-100/70 rounded-[1.5rem] p-5 text-slate-900 shadow-sm">
                          <div className="text-2xl font-bold tracking-tight text-[#6e2b8b] mb-3">{card.n}</div>
                          <h4 className="font-semibold text-base mb-1.5">{card.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{card.body}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                        {cloudProvider === 'onedrive' ? 'Microsoft OneDrive Shared Folder Link' : 'Google Drive Folder Link'}
                      </label>
                      <input 
                        type="text"
                        value={folderLink}
                        onChange={e => setFolderLink(e.target.value)}
                        className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 transition-colors shadow-sm ${
                          cloudProvider === 'onedrive'
                            ? 'border-slate-200 focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/20'
                            : 'border-slate-200 focus:border-[#6e2b8b] focus:ring-2 focus:ring-[#6e2b8b]/20'
                        }`}
                        placeholder={
                          cloudProvider === 'onedrive'
                            ? 'https://1drv.ms/f/s!… or https://onedrive.live.com/…'
                            : 'https://drive.google.com/drive/folders/…'
                        }
                      />
                      <p className="text-xs text-slate-400 font-medium mt-2">
                        🔒 Stored securely in cloud storage. Local server disk storage is completely bypassed.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                    className="max-w-xl mx-auto text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-[#6e2b8b]/10 to-[#da7756]/20 rounded-full flex items-center justify-center mx-auto text-4xl select-none">
                      🎉
                    </div>

                    <div>
                      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Gallery Published!</h2>
                      <p className="text-slate-500 font-medium text-sm mt-2">
                        Event <span className="font-bold text-slate-800">{eventName}</span> is live. Share the link below with your attendees.
                      </p>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-100 rounded-[2rem] p-6 text-center space-y-3">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Gallery URL</div>
                      <div className="flex gap-2 max-w-md mx-auto">
                        <input 
                          type="text"
                          readOnly
                          value={publicLink || `${userAppUrl}/?event=${eventId}`}
                          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium select-all"
                        />
                        <button 
                          onClick={() => copyLink(publicLink || `${userAppUrl}/?event=${eventId}`, 'step3_link')}
                          className="p-3 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] text-white rounded-xl transition-opacity hover:opacity-90 shrink-0 cursor-pointer shadow-sm"
                          title="Copy Event Link"
                        >
                          {copiedId === 'step3_link' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 max-w-md mx-auto">
                      <button 
                        onClick={() => handleOpenPublicView({ eventName, eventId })}
                        className="flex-1 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-purple-950/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        Launch Experience <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('dashboard')}
                        className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-all text-sm cursor-pointer"
                      >
                        Dashboard
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {step < 3 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex flex-col gap-2.5 z-20 rounded-b-[2.5rem]">
                {syncError && (
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{syncError}</span>
                    <button onClick={() => setSyncError('')} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer shrink-0 font-bold leading-none">✕</button>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  {step === 1 ? (
                    <div className="text-xs text-slate-400 font-medium">Fill event fields to proceed</div>
                  ) : (
                    <button 
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition-all text-sm cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  
                  {step === 1 ? (
                    <button 
                      onClick={handleNextStep1}
                      className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold text-sm px-7 py-3 rounded-full transition-all shadow-md shadow-purple-950/20 flex items-center gap-2 cursor-pointer"
                    >
                      Next: Connect Cloud Storage <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleDriveSync}
                      disabled={!folderLink || isSyncing}
                      className="bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold text-sm px-7 py-3 rounded-full transition-all shadow-md shadow-purple-950/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSyncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing Cloud Photos…</> : <>Publish Event <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 text-left"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Analytics &amp; Performance</h2>
              <p className="text-slate-500 font-medium text-sm">Monitor public gallery visits, image downloads, and facial search registrations in real time.</p>
            </div>

            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex gap-6">
                {['Analytics', 'Registrations'].map((tab) => {
                  const isActive = analyticsSubTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setAnalyticsSubTab(tab)}
                      className={`px-2 py-2.5 text-sm font-semibold tracking-tight border-b-2 transition-all -mb-[10px] relative select-none cursor-pointer ${
                        isActive 
                          ? 'text-[#6e2b8b] border-[#6e2b8b]' 
                          : 'text-slate-400 border-transparent hover:opacity-60'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0 relative">
                <div className="relative">
                  <button 
                    onClick={() => { setShowGroupByDropdown(!showGroupByDropdown); setShowPeriodDropdown(false); }}
                    className="bg-white border border-slate-200 px-3.5 py-2 rounded-full text-slate-700 font-semibold cursor-pointer hover:bg-slate-50 select-none flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    Group By: {analyticsGroupBy}
                    <span className="text-[10px] opacity-60">▼</span>
                  </button>
                  {showGroupByDropdown && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1 flex flex-col gap-0.5">
                      {['Day', 'Week', 'Month'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setAnalyticsGroupBy(opt); setShowGroupByDropdown(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            analyticsGroupBy === opt 
                              ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756] text-white font-bold' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => { setShowPeriodDropdown(!showPeriodDropdown); setShowGroupByDropdown(false); }}
                    className="bg-white border border-slate-200 px-3.5 py-2 rounded-full text-slate-700 font-semibold cursor-pointer hover:bg-slate-50 select-none flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CalendarRange className="w-3.5 h-3.5 text-slate-500" /> 
                    {analyticsPeriod === '7' ? 'Last 7 Days' : analyticsPeriod === '30' ? 'Last 30 Days' : 'Last 90 Days'}
                    <span className="text-[10px] opacity-60">▼</span>
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1 flex flex-col gap-0.5">
                      {[
                        { id: '7', label: 'Last 7 Days' },
                        { id: '30', label: 'Last 30 Days' },
                        { id: '90', label: 'Last 90 Days' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setAnalyticsPeriod(opt.id); setShowPeriodDropdown(false); }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            analyticsPeriod === opt.id 
                              ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756] text-white font-bold' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {analyticsSubTab === 'Analytics' ? (
              <>
                <div className="space-y-4 pt-2">
                  <h4 className="text-xl font-medium tracking-tight text-slate-900">Gallery Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Gallery Visits', count: analyticsData.visits },
                      { label: 'Image Views', count: analyticsData.views },
                      { label: 'Image Downloads', count: analyticsData.downloads },
                      { label: 'Unique Guests', count: analyticsData.faceScans },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-white border border-slate-100 p-6 rounded-[2rem] flex flex-col justify-between min-h-[120px] hover:shadow-lg transition-all duration-300">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{metric.label}</span>
                        <span className="text-3xl font-medium tracking-tight text-slate-900 mt-4">
                          <CountUp end={metric.count} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <h4 className="text-sm font-semibold text-slate-900 tracking-tight uppercase tracking-wider">Visits Over Time</h4>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                      Visits
                    </div>
                  </div>

                  <CustomAreaChart timeline={analyticsData.timeline} />
                </div>
              </>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-medium tracking-tight text-slate-900">Guest Registrations</h4>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/40 px-3.5 py-1.5 rounded-full">
                    {events.length * 4 + 3} Face Scans Registered
                  </span>
                </div>
                
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                          <th className="px-6 py-4">Guest Info</th>
                          <th className="px-6 py-4">Scan Date</th>
                          <th className="px-6 py-4">Photos Found</th>
                          <th className="px-6 py-4">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {[
                          { name: 'Arish Dell', email: 'arish@gmail.com', date: 'Jul 04, 2026', matches: 14, status: 'Matched' },
                          { name: 'Sarah Connor', email: 'sarah.c@gmail.com', date: 'Jul 03, 2026', matches: 8, status: 'Matched' },
                          { name: 'Marcus Wright', email: 'marcus.w@yahoo.com', date: 'Jul 03, 2026', matches: 0, status: 'No Match' },
                          { name: 'John Connor', email: 'jconnor@resistance.net', date: 'Jul 02, 2026', matches: 21, status: 'Matched' },
                          { name: 'Kate Brewster', email: 'kate.b@health.gov', date: 'Jul 01, 2026', matches: 5, status: 'Matched' },
                        ].map((guest, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40 transition-all">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                                {guest.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{guest.name}</div>
                                <div className="text-xs text-slate-400">{guest.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">{guest.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${guest.matches > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {guest.matches} photos
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold ${guest.status === 'Matched' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {guest.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── ADMIN EDIT EVENT MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {editingEvent && (
          <motion.div
            key="edit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingEvent(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-slate-200 w-full max-w-lg p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-slate-900">
                    Edit Event Details
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update gallery name, organizer, and cover artwork
                  </p>
                </div>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={editingEvent.eventName}
                    onChange={e => setEditingEvent(prev => ({ ...prev, eventName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6e2b8b]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Organizer / Studio Name
                  </label>
                  <input
                    type="text"
                    value={editingEvent.orgName}
                    onChange={e => setEditingEvent(prev => ({ ...prev, orgName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6e2b8b]"
                    required
                  />
                </div>

                {/* Cloud Storage Folder Link */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cloud Storage Link (OneDrive or Google Drive)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LinkIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={editingEvent.folderId || ''}
                      onChange={e => setEditingEvent(prev => ({ ...prev, folderId: e.target.value }))}
                      placeholder="https://1drv.ms/... or https://drive.google.com/drive/folders/..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6e2b8b]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste a new Microsoft OneDrive (1drv.ms/…) or Google Drive link to sync event photos from the cloud.
                  </p>
                </div>

                {/* Cover Image Selection & Custom Upload */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Cover Artwork
                    </label>
                    <button
                      type="button"
                      onClick={() => editCoverFileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#6e2b8b] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Custom Image</span>
                    </button>
                    <input
                      ref={editCoverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditCoverUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Preset Covers Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COVERS.map(cover => (
                      <button
                        type="button"
                        key={cover.id}
                        onClick={() => setEditingEvent(prev => ({ ...prev, coverImage: cover.url }))}
                        className={`h-16 rounded-xl overflow-hidden relative border-2 transition-all cursor-pointer ${
                          editingEvent.coverImage === cover.url
                            ? 'border-[#6e2b8b] ring-2 ring-purple-400/40 scale-105'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={cover.url} alt={cover.name} className="w-full h-full object-cover" />
                        {editingEvent.coverImage === cover.url && (
                          <div className="absolute inset-0 bg-purple-950/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Image URL input */}
                  <div>
                    <input
                      type="text"
                      value={editingEvent.coverImage || ''}
                      onChange={e => setEditingEvent(prev => ({ ...prev, coverImage: e.target.value }))}
                      placeholder="Or paste custom image URL (https://...)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6e2b8b]"
                    />
                  </div>

                  {/* Active Preview */}
                  {editingEvent.coverImage && (
                    <div className="relative h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={editingEvent.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                        Active Cover Preview
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex-1 py-3 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-opacity shadow-md shadow-purple-950/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
