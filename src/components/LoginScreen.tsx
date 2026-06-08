import React, { useState } from 'react';
import { Shield, User as UserIcon, Lock, Eye, EyeOff, UtensilsCrossed, AlertCircle, ArrowRight, CheckCircle, UserPlus, LogIn, Check } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: 'user' | 'admin', email: string) => void;
  isDarkMode?: boolean;
}

export function LoginScreen({ onLogin, isDarkMode }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dynamic Validation indicators for Registration Mode
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(trimmedEmail);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-[\]\\/`~+='";]/.test(password);
  const isLongEnough = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const inputEmail = email.trim();
    const inputPassword = password.trim();

    if (activeTab === 'register') {
      // 1. Validate email is @gmail.com
      if (!isGmail) {
        setError('Registrasi gagal. Email wajib menggunakan alamat @gmail.com yang asli (Contoh: budi@gmail.com).');
        setLoading(false);
        return;
      }

      // 2. Validate password combination and length
      if (!isLongEnough) {
        setError('Registrasi gagal. Password wajib minimal 8 karakter.');
        setLoading(false);
        return;
      }

      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        setError('Registrasi gagal. Password Anda harus berupa kombinasi huruf BESAR, huruf kecil, ANGKA, dan KARAKTER SPESIAL.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: inputEmail, password: inputPassword })
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Gagal mendaftarkan akun.');
          setLoading(false);
          return;
        }

        setSuccess('Pendaftaran berhasil! Akun Anda tersimpan di database.');
        
        // Auto-login registered user after a short delay
        setTimeout(() => {
          onLogin('user', inputEmail);
          setLoading(false);
        }, 1200);

      } catch (err) {
        console.error(err);
        setError('Gagal menghubungi database server.');
        setLoading(false);
      }
    } else {
      // Login flow
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: inputEmail, password: inputPassword })
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Email atau Kata Sandi salah.');
          setLoading(false);
          return;
        }

        if (data.isGuest) {
          setSuccess('Masuk sebagai Tamu Tanpa Akun!');
        } else {
          setSuccess(`Berhasil masuk! Selamat datang kembali, ${data.email}.`);
        }

        setTimeout(() => {
          onLogin(data.role, data.email);
          setLoading(false);
        }, 1000);

      } catch (err) {
        console.error(err);
        setError('Tidak dapat menghubungi database server. Menggunakan mode lokal cadangan...');
        
        setTimeout(() => {
          if (inputEmail === 'ADMIN NEMUIN 333' && inputPassword === 'NEMUIN.APP 2') {
            onLogin('admin', 'ADMIN NEMUIN 333');
          } else if (!inputEmail && !inputPassword) {
            onLogin('user', 'Pecinta Kuliner (Guest)');
          } else {
            setError('Masuk gagal. Database server offline.');
          }
          setLoading(false);
        }, 1000);
      }
    }
  };

  return (
    <div id="login-screen-v7" className={`min-h-screen w-full flex items-center justify-center p-4 lg:p-12 transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
      <div className={`w-full max-w-md rounded-[3rem] p-8 md:p-10 border transition-all duration-500 overflow-hidden relative shadow-[0_20px_50px_rgba(255,97,29,0.15)] ${
        isDarkMode 
          ? 'bg-[#262626] border-[#404040] shadow-[0_0_40px_rgba(255,97,29,0.15)]' 
          : 'bg-white border-[#E7E5E4] shadow-[0_20px_60px_rgba(255,97,29,0.1)]'
      }`}>
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 bg-[#FF611D]/10 rounded-[1.5rem] flex items-center justify-center mx-auto text-[#FF611D]">
            <UtensilsCrossed className="w-7 h-7 font-black" />
          </div>
          <div className="space-y-1">
            <h1 className={`text-3.5xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
              Nemuin<span className="text-[#FF611D]">.</span>
            </h1>
            <p className={`text-xs font-bold leading-relaxed max-w-[280px] mx-auto ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Temukan tempat kuliner terbaik & tersembunyi di Malang. Masuk untuk berjejaring sesama pecinta kuliner!
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className={`grid grid-cols-2 p-1.5 rounded-2xl mb-6 border ${
          isDarkMode ? 'bg-[#1C1917] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
        }`}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'login'
                ? 'bg-[#FF611D] text-white shadow-sm font-black'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-[#78716C] hover:text-[#4B2E2A]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>MASUK</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'register'
                ? 'bg-[#FF611D] text-white shadow-sm font-black'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-[#78716C] hover:text-[#4B2E2A]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>BUAT AKUN</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-500 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-500 text-xs font-bold">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              {activeTab === 'register' ? 'Alamat Email (@gmail.com)' : 'Email / Nama Anda'}
            </label>
            <div className={`h-14 rounded-2xl border flex items-center px-4 gap-3 transition-all focus-within:ring-2 focus-within:ring-[#FF611D] focus-within:border-transparent ${
              isDarkMode ? 'bg-[#1C1917] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
            }`}>
              <UserIcon className="w-4 h-4 text-[#FF611D] shrink-0" />
              <input 
                type="text"
                placeholder={activeTab === 'register' ? "contoh: budi@gmail.com" : "Kosongkan untuk masuk langsung sebagai Guest"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-transparent border-none focus:outline-none text-xs md:text-sm font-bold w-full transition-colors ${isDarkMode ? 'text-white placeholder:text-zinc-600' : 'text-[#4B2E2A] placeholder:text-[#A8A29E]'}`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              {activeTab === 'register' ? 'Password Kombinasi' : 'Kata Sandi'}
            </label>
            <div className={`h-14 rounded-2xl border flex items-center px-4 gap-3 transition-all focus-within:ring-2 focus-within:ring-[#FF611D] focus-within:border-transparent ${
              isDarkMode ? 'bg-[#1C1917] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
            }`}>
              <Lock className="w-4 h-4 text-[#FF611D] shrink-0" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-transparent border-none focus:outline-none text-xs md:text-sm font-bold w-full transition-colors ${isDarkMode ? 'text-white placeholder:text-zinc-600' : 'text-[#4B2E2A] placeholder:text-[#A8A29E]'}`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`hover:scale-110 active:scale-95 transition-all ${isDarkMode ? 'text-zinc-400' : 'text-[#78716C]'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dynamic Registration Criteria Indicators */}
          {activeTab === 'register' && (
            <div className={`p-4 rounded-2xl border space-y-2 text-[10px] font-bold transition-all ${
              isDarkMode ? 'bg-[#1C1917]/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <span className={`block uppercase tracking-wider text-[9px] font-black mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-[#4B2E2A]'}`}>Kriteria Pendaftaran:</span>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    isGmail ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={isGmail ? 'text-emerald-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}>Email wajib menggunakan @gmail.com</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    isLongEnough ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={isLongEnough ? 'text-emerald-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}>Minimal 8 Karakter</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    hasUpper ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={hasUpper ? 'text-emerald-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}>Minimal 1 Huruf Besar (A-Z)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    hasLower ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={hasLower ? 'text-emerald-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}>Minimal 1 Huruf Kecil (a-z)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    hasNumber ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={hasNumber ? 'text-emerald-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}>Minimal 1 Angka (0-9)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    hasSpecial ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-transparent text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={hasSpecial ? 'text-emerald-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}>Minimal 1 Karakter Spesial (!@#$% dll.)</span>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#FF611D] text-white rounded-2xl font-black italic tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'MEMPROSES...' : (
              <>
                <span>{activeTab === 'register' ? 'DAFTAR SEKARANG' : 'MASUK SEKARANG'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
