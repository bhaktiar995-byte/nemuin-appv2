import { Store, Camera, ChevronLeft, Lock } from 'lucide-react';

interface CreateMenuScreenProps {
  onSelect: (action: 'add_resto' | 'add_post') => void;
  onBack: () => void;
  isDarkMode?: boolean;
  isAdmin?: boolean;
}

export function CreateMenuScreen({ onSelect, onBack, isDarkMode, isAdmin = false }: CreateMenuScreenProps) {
  return (
    <div className={`flex-1 w-full h-full flex flex-col p-4 pt-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack} 
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border transition-colors mr-3 ${
            isDarkMode 
              ? 'bg-[#262626] text-white border-[#404040] hover:bg-[#333333]' 
              : 'bg-white text-[#4B2E2A] border-[#E7E5E4] hover:bg-[#E7E5E4]'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Tambah Sesuatu</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Post Option: available for both */}
        <button 
          onClick={() => onSelect('add_post')}
          className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 ${
            isDarkMode 
              ? 'bg-[#262626] border-[#404040] hover:border-[#FF611D]/50' 
              : 'bg-white border-[#E7E5E4] hover:border-[#FF611D]/50'
          }`}
        >
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 ${isDarkMode ? 'bg-[#FF611D]/20' : 'bg-[#FF611D]/10'}`}>
            <Camera className="w-7 h-7 text-[#FF611D]" />
          </div>
          <div>
            <h2 className={`text-lg font-bold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Tulis Postingan Tempat Makan</h2>
            <p className={`text-sm leading-snug transition-colors ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Berbagi pengalaman makan enak dan temukan hidden gem makanan di sekitarmu.</p>
          </div>
        </button>

        {/* Resto Option: Admin restricts or locks */}
        <button 
          disabled={!isAdmin}
          onClick={() => {
            if (isAdmin) {
              onSelect('add_resto');
            }
          }}
          className={`p-6 rounded-3xl border text-left flex items-start gap-4 relative transition-all ${
            !isAdmin 
              ? 'opacity-65 cursor-not-allowed bg-zinc-100/50 dark:bg-zinc-900/30 border-dashed border-zinc-300 dark:border-zinc-800' 
              : isDarkMode 
                ? 'bg-[#262626] border-[#404040] hover:border-[#FF611D]/50 hover:shadow-md' 
                : 'bg-white border-[#E7E5E4] hover:border-[#FF611D]/50 hover:shadow-md'
          }`}
        >
          {!isAdmin && (
            <div className="absolute top-4 right-4 bg-amber-500/15 text-amber-500 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-500/20">
              <Lock className="w-3 h-3" />
              <span>AKSES ADMIN</span>
            </div>
          )}

          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 border transition-colors ${
            !isAdmin 
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 border-none'
              : isDarkMode 
                ? 'bg-[#404040] border-[#525252]' 
                : 'bg-[#4B2E2A]/5 border-[#E7E5E4]'
          }`}>
            <Store className={`w-7 h-7 transition-colors ${
              !isAdmin 
                ? 'text-zinc-400 dark:text-zinc-600' 
                : isDarkMode 
                  ? 'text-[#FF611D]' 
                  : 'text-[#4B2E2A]'
            }`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold mb-1 transition-colors ${
              !isAdmin 
                ? 'text-zinc-400 dark:text-zinc-500' 
                : isDarkMode ? 'text-white' : 'text-[#4B2E2A]'
            }`}>
              Tambah Tempat Makan
            </h2>
            <p className={`text-sm leading-snug transition-colors ${
              !isAdmin 
                ? 'text-zinc-400 dark:text-zinc-600' 
                : isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'
            }`}>
              {!isAdmin 
                ? 'Masuk sebagai akun Admin di profil untuk dapat menambahkan warung/resto kuliner baru.'
                : 'Daftarkan tempat makan baru agar orang lain dapat menemukannya di peta.'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
