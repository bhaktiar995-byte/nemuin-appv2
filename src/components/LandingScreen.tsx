import React from 'react';
import { ArrowRight, Play, Star, MapPin, MessageSquare, RefreshCw, Flame, Search, List, Share2 } from 'lucide-react';

interface LandingScreenProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  isDarkMode?: boolean;
}

export function LandingScreen({ onNavigateAuth, isDarkMode }: LandingScreenProps) {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden ${isDarkMode ? 'bg-[#1C1917] text-white' : 'bg-[#FAF9F6] text-[#4B2E2A]'}`}>
      {/* Navigation */}
      <nav className={`px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md ${isDarkMode ? 'bg-[#1C1917]/80' : 'bg-[#FAF9F6]/80'}`}>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black italic tracking-tighter">
            Nemuin<span className="text-[#FF611D]">.</span>
          </h1>
          <p className={`text-[10px] font-bold italic tracking-tight ${isDarkMode ? 'text-zinc-400' : 'text-[#78716C]'}`}>
            Semuanya pasti ketemu di nemuin
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigateAuth('login')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${isDarkMode ? 'border-zinc-700 hover:bg-zinc-800' : 'bg-white border-[#E7E5E4] hover:bg-zinc-50 shadow-sm'}`}
          >
            Masuk
          </button>
          <button 
            onClick={() => onNavigateAuth('register')}
            className="px-5 py-2.5 bg-[#FF611D] text-white rounded-full font-bold text-sm shadow-lg shadow-[#FF611D]/30 hover:scale-105 active:scale-95 transition-all"
          >
            Daftar Sekarang
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-20 flex flex-col lg:flex-row items-center">
        {/* Background Decorative blob */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF611D]/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4"></div>

        {/* Left Content */}
        <div className="flex-1 space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF611D]/30 bg-[#FF611D]/5 text-[#FF611D]">
            <Star className="w-4 h-4 fill-[#FF611D]" />
            <span className="text-sm font-bold">Aplikasi Rekomendasi Kuliner #1 di Indonesia</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
            Semua Kuliner <br />
            Favoritmu, <br />
            Cuma di <span className="text-[#FF611D]">Nemuin.</span>
          </h2>

          <p className={`text-lg md:text-xl max-w-xl font-medium leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-[#78716C]'}`}>
            Temukan rekomendasi kuliner terbaik berdasarkan lokasi, rating teman, dan menu viral. Pesan lebih cepat tanpa bingung memilih.
          </p>

          {/* Feature Icons Row */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { icon: MapPin, text: '500+', sub: 'Tempat Makan' },
              { icon: Star, text: 'Review Asli', sub: 'Pengguna' },
              { icon: RefreshCw, text: 'Lucky Spin', sub: 'Rekomendasi' },
              { icon: Flame, text: 'Kuliner Viral', sub: 'Setiap Hari' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF611D]/10 flex items-center justify-center text-[#FF611D]">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black">{feature.text}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{feature.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={() => onNavigateAuth('login')}
              className="px-8 py-4 bg-[#FF611D] text-white rounded-full font-black text-sm flex items-center gap-2 shadow-[0_8px_25px_rgba(255,97,29,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Jelajahi Sekarang <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={scrollToHowItWorks}
              className={`px-8 py-4 rounded-full font-black text-sm flex items-center gap-2 transition-all border ${isDarkMode ? 'border-zinc-700 hover:bg-zinc-800' : 'bg-white border-[#E7E5E4] hover:bg-zinc-50 shadow-sm'}`}
            >
              <Play className="w-4 h-4" /> Lihat Cara Kerja
            </button>
          </div>
        </div>

        {/* Right Content - Mockups */}
        <div className="flex-1 relative mt-16 lg:mt-0 min-h-[600px] w-full lg:ml-24 flex justify-center items-center lg:translate-x-8">
            {/* Base orange circle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-gradient-to-tr from-[#FF611D] to-orange-400 rounded-full z-0 overflow-hidden">
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            </div>

            {/* Mockups Container */}
            <div className="relative z-10 w-full h-full flex justify-center items-center gap-4 lg:gap-6 perspective-[1000px] transform-gpu">
                {/* Left Mockup (Feed/Explore) */}
                <div className="w-[220px] h-[400px] rounded-[2rem] border-[6px] border-black bg-[#FAF9F6] shadow-2xl overflow-hidden transform rotate-[-10deg] translate-y-12 translate-x-12 z-10 relative shrink-0">
                    <img src="/mockup-feed.png" alt="Feed Mockup" className="w-full h-full object-contain object-center scale-[1.02]" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'; }} />
                    {/* Notch placeholder */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-xl z-20"></div>
                </div>

                {/* Center Mockup (Detail) */}
                <div className="w-[260px] h-[470px] rounded-[2.5rem] border-[8px] border-black bg-[#FAF9F6] shadow-2xl overflow-hidden transform z-30 -translate-y-4 relative shrink-0">
                    <img src="/mockup-home.png" alt="Home Mockup" className="w-full h-full object-contain object-center scale-[1.02]" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400'; }} />
                    {/* Notch placeholder */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-20"></div>
                </div>

                {/* Right Mockup (Lucky Spin) */}
                <div className="w-[220px] h-[400px] rounded-[2rem] border-[6px] border-black bg-[#FAF9F6] shadow-2xl overflow-hidden transform rotate-[10deg] translate-y-12 -translate-x-12 z-20 relative shrink-0">
                    <img src="/mockup-spin.png" alt="Spin Mockup" className="w-full h-full object-contain object-center scale-[1.02]" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'; }} />
                    {/* Notch placeholder */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-xl z-20"></div>
                </div>
            </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" className={`py-24 relative overflow-hidden ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
        {/* Background Dots Pattern */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
              How it <span className="text-[#FF611D]">Works.</span>
            </h2>
            <p className={`text-sm md:text-base font-medium ${isDarkMode ? 'text-zinc-400' : 'text-[#78716C]'}`}>
              Empat langkah mudah untuk menemukan kuliner terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-20 left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-[#FF611D]/30 z-0"></div>

            {[
              { num: 1, icon: Search, title: 'Pencarian Instan', desc: 'Cari makanan atau restoran berdasarkan nama, kategori, atau lokasi terdekat.' },
              { num: 2, icon: List, title: 'Jelajahi Feeds', desc: 'Lihat postingan kuliner terbaru dari pengguna lain, rekomendasi tempat makan, makanan viral, dan promo menarik.' },
              { num: 3, icon: RefreshCw, title: 'Lucky Spin Menu', desc: 'Bingung mau makan apa? Putar Lucky Spin untuk mendapatkan rekomendasi menu atau restoran secara acak.' },
              { num: 4, icon: MessageSquare, title: 'Review & Bagikan', desc: 'Berikan rating, ulasan, dan foto makananmu untuk membantu pengguna lain menemukan kuliner terbaik.' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center mb-6 relative shadow-lg ${isDarkMode ? 'bg-[#262626]' : 'bg-[#FAF9F6]'}`}>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#FF611D] text-white font-black flex items-center justify-center text-sm shadow-md">
                    {step.num}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#FF611D]/10 flex items-center justify-center text-[#FF611D]">
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-lg font-black mb-3">{step.title}</h3>
                <p className={`text-xs leading-relaxed max-w-[200px] ${isDarkMode ? 'text-zinc-400' : 'text-[#78716C]'}`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
