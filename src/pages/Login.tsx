import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('กรุณาระบุอีเมลและรหัสผ่าน');
      return;
    }

    const success = await login(email, password);
    if (success) {
      // Check role or redirect accordingly
      if (email.toLowerCase().includes('admin')) {
        onNavigate('/admin/dashboard');
      } else {
        onNavigate('/dashboard');
      }
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass).then((success) => {
      if (success) {
        if (demoEmail.includes('admin')) {
          onNavigate('/admin/dashboard');
        } else {
          onNavigate('/dashboard');
        }
      }
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl mx-auto shadow-md shadow-emerald-500/20">
            🍓
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">เข้าสู่ระบบ FactFruit</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและเลือกซื้อผลไม้สดคุณภาพ
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              อีเมล (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
            บัญชีทดสอบระบบ (Quick Demo)
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@factfruit.com', 'Admin12345')}
              className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin ผู้ดูแล</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">admin@factfruit.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user@factfruit.com', 'User12345')}
              className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                <UserCheck className="w-3.5 h-3.5" />
                <span>User ลูกค้า</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">user@factfruit.com</p>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          ยังไม่มีบัญชีสมาชิก?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            สมัครสมาชิกใหม่
          </button>
        </div>
      </motion.div>
    </div>
  );
};
