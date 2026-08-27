import { useState, useEffect } from 'react';
import { PublicGallery } from './PublicGallery';
import { apiFetch } from '../lib/api';
import { Sparkles, CheckCircle2, ChevronRight, RefreshCw, Eye } from 'lucide-react';

export function LivePreview({ defaultEventId }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await apiFetch('/api/events');
      const data = await res.json();
      if (data.events && data.events.length > 0) {
        setEvents(data.events);
        const initial = defaultEventId 
          ? data.events.find(e => e.eventId === defaultEventId) || data.events[0]
          : data.events[0];
        setSelectedEvent(initial);
      }
    } catch (e) {
      console.error('Failed to load events in LivePreview:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (eventObj) => {
    setSelectedEvent(eventObj);
    // Clear selfie state so admin starts fresh on new event
    try {
      localStorage.removeItem('photopic_matched_photos');
      localStorage.removeItem('photopic_selfie');
      sessionStorage.removeItem('photopic_matched_photos');
      sessionStorage.removeItem('photopic_selfie');
    } catch (e) {}
    setRefreshKey(prev => prev + 1);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('photopic_matched_photos');
      localStorage.removeItem('photopic_selfie');
      sessionStorage.removeItem('photopic_matched_photos');
      sessionStorage.removeItem('photopic_selfie');
    } catch (e) {}
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <div className="w-5 h-5 border-2 border-[#6e2b8b] border-t-transparent rounded-full animate-spin" />
          <span>Loading Live Preview...</span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-12 text-center space-y-3">
        <h3 className="text-xl font-bold text-slate-900">No Events Available</h3>
        <p className="text-sm font-medium text-slate-500">Create an event in the Dashboard first to test the selfie and results experience.</p>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-900 font-sans text-left space-y-6">
      
      {/* Top Event Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Testing Event:
          </span>
          {events.map((ev) => {
            const isSelected = selectedEvent?.eventId === ev.eventId;
            return (
              <button
                key={ev.eventId}
                onClick={() => handleSelectEvent(ev)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-100/80 border-purple-200 text-[#6e2b8b] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#6e2b8b]" />}
                <span>{ev.eventName}</span>
              </button>
            );
          })}
        </div>

        {/* Reset / Fresh Selfie Scan button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>New Selfie Test</span>
        </button>
      </div>

      {/* Native Embedded Public Gallery (Selfie Capture & Results View) */}
      <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 sm:p-8 min-h-[600px]">
        {selectedEvent && (
          <PublicGallery
            key={`${selectedEvent.eventId}-${refreshKey}`}
            eventData={selectedEvent}
            onBack={() => handleReset()}
          />
        )}
      </div>

    </div>
  );
}
