import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Shield, Bell, FileDown, BarChart3, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function Settings({ onBack }) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('account');

  const [notifications, setNotifications] = useState(true);
  const [highRes, setHighRes] = useState(true);

  // Analytics Settings States
  const [trackViews, setTrackViews] = useState(true);
  const [trackDownloads, setTrackDownloads] = useState(true);
  const [trackFaceScan, setTrackFaceScan] = useState(true);
  const [anonymizeIP, setAnonymizeIP] = useState(true);
  const [retentionPeriod, setRetentionPeriod] = useState('90');

  const sections = [
    { id: 'account', label: 'Profile', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'analytics', label: 'Analytics Config', icon: BarChart3 },
  ];

  const handleExport = (format) => {
    const dummyData = {
      platform: "GWC DATA.AI - Event FaceSync",
      exportedAt: new Date().toISOString(),
      retentionSetting: retentionPeriod === 'lifetime' ? 'Lifetime' : `${retentionPeriod} Days`,
      trackingConfiguration: {
        trackViews,
        trackDownloads,
        trackFaceScan,
        anonymizeIP
      },
      metrics: {
        totalViews: 456,
        totalDownloads: 198,
        successfulFaceScans: 89,
        failedFaceScans: 4
      }
    };
    
    let fileData = "";
    let filename = `gwc_analytics_${new Date().toISOString().slice(0,10)}`;
    let mimeType = "application/json";
    
    if (format === 'json') {
      fileData = JSON.stringify(dummyData, null, 2);
      filename += '.json';
    } else if (format === 'csv') {
      mimeType = "text/csv";
      filename += '.csv';
      fileData = `Metric,Value\nTotal Views,${dummyData.metrics.totalViews}\nTotal Downloads,${dummyData.metrics.totalDownloads}\nSuccessful Face Scans,${dummyData.metrics.successfulFaceScans}\nFailed Face Scans,${dummyData.metrics.failedFaceScans}\nRetention Policy,${dummyData.retentionSetting}\nExported At,${dummyData.exportedAt}`;
    }
    
    const blob = new Blob([fileData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAnalytics = () => {
    if (confirm("Are you sure you want to purge all historical analytics databases? This action is irreversible.")) {
      alert("Analytics database successfully cleared.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full text-slate-900 text-left space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-2">Settings</h2>
        <p className="text-slate-500 font-medium text-sm">Manage configuration variables and preferences across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-full max-w-xl border border-slate-200/60 relative">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold transition-all relative cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] rounded-full z-0 shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 transition-colors ${
                isActive 
                  ? 'text-white font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}>
                <section.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{section.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Container */}
      <div className="w-full mt-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeSection === 'account' && (
            <motion.div 
              key="account"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm space-y-8 relative overflow-hidden"
            >
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Account Profile</h3>
                <p className="text-xs text-slate-400 font-semibold">Admin credentials and session profile.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6e2b8b] to-[#da7756] text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md">
                  {user?.displayName ? user.displayName[0] : 'A'}
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-slate-900">{user?.displayName || 'Admin Organizer'}</div>
                  <div className="text-slate-500 text-sm font-semibold mt-0.5">{user?.email || 'admin@photopic.app'}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#6e2b8b] flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Admin Privileges</div>
                      <div className="text-xs text-slate-400">Super Administrator (Full read/write permissions)</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-50 text-[#6e2b8b] font-bold text-xs rounded-full border border-purple-200/40">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'preferences' && (
            <motion.div 
              key="preferences"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Notification card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                    <Bell className="w-5 h-5 text-[#6e2b8b]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">FaceScan Notifications</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">Alerts when AI is done indexing new images.</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors relative cursor-pointer shrink-0 ${notifications ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756]' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${notifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Delivery resolution card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                    <FileDown className="w-5 h-5 text-[#6e2b8b]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">High Resolution Downloads</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">Allow guests to export raw high-definition files directly.</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button 
                  onClick={() => setHighRes(!highRes)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors relative cursor-pointer shrink-0 ${highRes ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756]' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${highRes ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Telemetry Configuration</h3>
                  <p className="text-xs text-slate-400 font-semibold">Granular privacy toggles for attendee telemetry tracking.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Track Gallery Page Views</div>
                      <div className="text-xs text-slate-400">Record visits to public QR event pages.</div>
                    </div>
                    <button 
                      onClick={() => setTrackViews(!trackViews)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${trackViews ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756]' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${trackViews ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Track Photo Downloads</div>
                      <div className="text-xs text-slate-400">Log image export actions from attendees.</div>
                    </div>
                    <button 
                      onClick={() => setTrackDownloads(!trackDownloads)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${trackDownloads ? 'bg-gradient-to-r from-[#6e2b8b] to-[#da7756]' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${trackDownloads ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
