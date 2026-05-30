import React, { useState } from 'react';
import { Shield, User as UserIcon, Lock, Eye, EyeOff, UtensilsCrossed, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: 'user' | 'admin', email: string) => void;
  isDarkMode?: boolean;
}

export function LoginScreen({ onLogin, isDarkMode }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    // Simulating login validation
    setTimeout(() => {
      const inputEmail = email.trim();
      const inputPassword = password.trim();

      // Check for exact Admin credentials requested:
      // Email: ADMIN NEMUIN 333 (case-insensitive checks)
      // Password: NEMUIN.APP 2
      if (
        inputEmail.toUpperCase() === 'ADMIN NEMUIN 333' && 
        inputPassword === 'NEMUIN.APP 2'
      ) {
        onLogin('admin', 'ADMIN NEMUIN 333');
      } else {
        // Any other input or empty can log in as a normal user
        onLogin('user', inputEmail || 'Pecinta Kuliner');
      }
      setLoading(false);
    }, 850);
  };

  return (
    <div id="login-screen-v7" className={`min-h-screen w-full flex items-center justify-center p-4 lg:p-12 transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
      <div className={`w-full max-w-md rounded-[3rem] p-8 md:p-12 border transition-all duration-500 overflow-hidden relative shadow-[0_20px_50px_rgba(255,97,29,0.15)] ${
        isDarkMode 
          ? 'bg-[#262626] border-[#404040] shadow-[0_0_40px_rgba(255,97,29,0.15)]' 
          : 'bg-white border-[#E7E5E4] shadow-[0_20px_60px_rgba(255,97,29,0.1)]'
      }`}>
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="w-16 h-16 bg-[#FF611D]/10 rounded-[1.75rem] flex items-center justify-center mx-auto text-[#FF611D] animate-pulse">
            <UtensilsCrossed className="w-8 h-8 font-black" />
          </div>
          <div className="space-y-1">
            <h1 className={`text-4xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
              Nemuin<span className="text-[#FF611D]">.</span>
            </h1>
            <p className={`text-xs font-bold leading-relaxed max-w-[280px] mx-auto ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Temukan tempat kuliner terbaik & tersembunyi di Malang. Masuk untuk berjejaring sesama pecinta kuliner!
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Email / Nama Anda</label>
            <div className={`h-14 rounded-2xl border flex items-center px-4 gap-3 transition-all focus-within:ring-2 focus-within:ring-[#FF611D] focus-within:border-transparent ${
              isDarkMode ? 'bg-[#1C1917] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
            }`}>
              <UserIcon className="w-4 h-4 text-[#FF611D] shrink-0" />
              <input 
                type="text"
                placeholder="Isi bebas atau kosongkan untuk masuk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-transparent border-none focus:outline-none text-xs md:text-sm font-bold w-full transition-colors ${isDarkMode ? 'text-white placeholder:text-zinc-600' : 'text-[#4B2E2A] placeholder:text-[#A8A29E]'}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Kata Sandi</label>
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

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#FF611D] text-white rounded-2xl font-black italic tracking-tighter shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'MEMPROSES...' : (
              <>
                <span>MASUK SEKARANG</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
