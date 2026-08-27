import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { emailSignIn } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

export function AuthView({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, USE_FIREBASE } = useAuth();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      if (USE_FIREBASE) {
        await emailSignIn(email, password);
      } else {
        login(email.split('@')[0] || 'Admin', email);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let message = err.message || 'Authentication failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid admin email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans w-full selection:bg-purple-100">
      
      {/* LEFT: Admin Form Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-white border-r border-slate-100">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <Logo size="default" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#6e2b8b] border border-purple-200/50">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12 md:px-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Heading */}
            <div className="mb-8 text-left">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-2">
                Admin Sign In
              </h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Organizer access to manage event galleries, photo folders, and facial indexing.
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6e2b8b] focus:border-[#6e2b8b] transition-all text-slate-900 text-sm font-medium"
                    placeholder="admin@photopic.app"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6e2b8b] focus:border-[#6e2b8b] transition-all text-slate-900 text-sm font-medium"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-[#6e2b8b] to-[#da7756] hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-950/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In as Organizer</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>GWC Verified Organizer Portal</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Visual Hero Graphic */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-purple-50 via-slate-50 to-orange-50 items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-md text-left space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-purple-100 shadow-sm text-xs font-bold text-[#6e2b8b]">
            <ShieldCheck className="w-4 h-4 text-[#da7756]" /> Organizer Dashboard
          </div>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Manage your AI photo galleries <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6e2b8b] to-[#da7756]">seamlessly.</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Create events, sync Google Drive folders, monitor guest facial matches, and export real-time analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
