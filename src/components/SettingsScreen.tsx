import React, { useState } from 'react';
import { Moon, Sun, ChevronLeft, Bell, Shield, User, X, Mail, Smartphone, Lock, Trash2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onBack: () => void;
  onNavigateProfile: () => void;
  onNavigateManagePlaces?: () => void;
  currentUser?: { email: string; role: 'user' | 'admin' } | null;
}

export function SettingsScreen({ isDarkMode, onToggleDarkMode, onBack, onNavigateProfile }: SettingsScreenProps) {
  const [activeModal, setActiveModal] = useState<'notifications' | 'security' | null>(null);

  // Mock states for toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);

  return (
    <div className={`flex-1 w-full flex flex-col h-full overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917] text-[#FAF9F6]' : 'bg-white text-[#4B2E2A]'}`}>
      <div className="flex-1 p-6 space-y-6 pt-10 relative pb-32">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-white hover:bg-[#333333]' : 'bg-[#F6F1EA] border-[#E7E5E4] text-[#4B2E2A] hover:bg-white'}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="space-y-1">
              <h2 className="text-2xl font-black italic tracking-tighter">Pengaturan</h2>
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Kustomisasi Pengalaman Anda</p>
            </div>
          </div>
        </div>

        {/* Tampilan */}
        <div className="space-y-4">
          <h3 className={`text-[10px] uppercase font-bold tracking-[0.2em] px-4 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Tampilan & Tema</h3>
          <div className={`p-6 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#F6F1EA] border-[#E7E5E4]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#404040] text-[#FFB80E]' : 'bg-white text-[#FF611D]'}`}>
                  {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">Mode Gelap</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Ubah tampilan aplikasi menjadi gelap</p>
                </div>
              </div>
              
              <button 
                onClick={onToggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none border-2 ${isDarkMode ? 'bg-[#FF611D] border-[#FF611D]' : 'bg-[#D1D5DB] border-transparent'}`}
              >
                <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Akun & Keamanan */}
        <div className="space-y-4">
          <h3 className={`text-[10px] uppercase font-bold tracking-[0.2em] px-4 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Akun</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={onNavigateProfile}
              className={`p-6 rounded-[2.5rem] border text-left transition-all flex items-center gap-4 ${isDarkMode ? 'bg-[#262626] border-[#404040] hover:bg-[#333333]' : 'bg-[#F6F1EA] border-[#E7E5E4] hover:bg-white'}`}
            >
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#404040] text-orange-400' : 'bg-white text-orange-500'}`}>
                <User className="w-5 h-5" />
              </div>
              <span className="font-bold">Profile Saya</span>
            </button>
            <button 
              onClick={() => setActiveModal('notifications')}
              className={`p-6 rounded-[2.5rem] border text-left transition-all flex items-center gap-4 ${isDarkMode ? 'bg-[#262626] border-[#404040] hover:bg-[#333333]' : 'bg-[#F6F1EA] border-[#E7E5E4] hover:bg-white'}`}
            >
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#404040] text-blue-400' : 'bg-white text-blue-500'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-bold">Notifikasi</span>
            </button>
          </div>
        </div>

        {/* Keamanan */}
        <div className="space-y-4">
          <h3 className={`text-[10px] uppercase font-bold tracking-[0.2em] px-4 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Privasi</h3>
          <button 
            onClick={() => setActiveModal('security')}
            className={`w-full p-6 rounded-[2.5rem] border text-left transition-all flex items-center gap-4 ${isDarkMode ? 'bg-[#262626] border-[#404040] hover:bg-[#333333]' : 'bg-[#F6F1EA] border-[#E7E5E4] hover:bg-white'}`}
          >
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#404040] text-emerald-400' : 'bg-white text-emerald-500'}`}>
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold">Keamanan & Data</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-end justify-center sm:items-center"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl max-h-[85vh] overflow-hidden ${isDarkMode ? 'bg-[#262626] border border-[#404040]' : 'bg-white border border-[#E7E5E4]'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    activeModal === 'notifications' 
                      ? (isDarkMode ? 'bg-[#333333] text-blue-400' : 'bg-blue-50 text-blue-500')
                      : (isDarkMode ? 'bg-[#333333] text-emerald-400' : 'bg-emerald-50 text-emerald-500')
                  }`}>
                    {activeModal === 'notifications' ? <Bell className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
                    {activeModal === 'notifications' ? 'Pengaturan Notifikasi' : 'Keamanan & Data'}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'bg-[#333333] text-[#78716C] hover:bg-[#404040]' : 'bg-[#F6F1EA] text-[#78716C] hover:bg-[#E7E5E4]'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {activeModal === 'notifications' && (
                  <div className="space-y-4">
                    <p className={`text-sm ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Atur notifikasi apa saja yang ingin Anda terima dari Nemuin.</p>
                    
                    {[
                      { id: 'push', title: 'Notifikasi Push', desc: 'Terima peringatan di layar handphone Anda', icon: Smartphone, state: pushNotif, setter: setPushNotif, color: 'text-purple-500' },
                      { id: 'email', title: 'Email Informasi', desc: 'Pembaruan keamanan & aktivitas akun', icon: Mail, state: emailNotif, setter: setEmailNotif, color: 'text-blue-500' },
                      { id: 'promo', title: 'Promo & Diskon', desc: 'Kabar tempat makan baru dan promosi', icon: Bell, state: promoNotif, setter: setPromoNotif, color: 'text-orange-500' },
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-[#333333] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <div>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{item.title}</p>
                            <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{item.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => item.setter(!item.state)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${item.state ? 'bg-[#FF611D]' : isDarkMode ? 'bg-[#525252]' : 'bg-[#D1D5DB]'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${item.state ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === 'security' && (
                  <div className="space-y-4">
                    <p className={`text-sm ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Kelola kata sandi, opsi login, dan data akun Anda.</p>
                    
                    <button className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] hover:bg-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4] hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-indigo-500" />
                        <div className="text-left">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Ubah Kata Sandi</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Update password login akun Anda</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] hover:bg-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4] hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-emerald-500" />
                        <div className="text-left">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Autentikasi 2 Langkah</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Tambahkan keamanan ekstra (Tidak Aktif)</p>
                        </div>
                      </div>
                    </button>
                    
                    <div className={`mt-6 p-4 rounded-2xl border border-rose-200 ${isDarkMode ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
                      <h4 className="text-sm font-bold text-rose-500 mb-2 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Hapus Akun
                      </h4>
                      <p className={`text-xs mb-4 ${isDarkMode ? 'text-rose-400/80' : 'text-rose-600/80'}`}>Menghapus akun Anda bersifat permanen. Semua data Anda akan hilang selamanya.</p>
                      <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors">
                        Minta Penghapusan Akun
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
