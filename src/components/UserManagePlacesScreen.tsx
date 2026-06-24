import { useState } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Store, 
  Eye, 
  MousePointerClick, 
  Heart,
  Calendar,
  Timer,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Award,
  BarChart2
} from 'lucide-react';

interface ManagePlacesProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

export function UserManagePlacesScreen({ onBack, isDarkMode }: ManagePlacesProps) {
  const [activeTab, setActiveTab] = useState('semua');

  const tabs = [
    { id: 'semua', label: 'Semua Tempat', icon: Store },
    { id: 'menunggu', label: 'Menunggu Review', icon: Clock },
    { id: 'dipublikasikan', label: 'Dipublikasikan', icon: CheckCircle2 },
    { id: 'ditolak', label: 'Ditolak', icon: XCircle },
  ];

  const stats = [
    { id: 'menunggu', count: 2, label: 'Menunggu Review', desc: 'Tempat sedang ditinjau admin', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'dipublikasikan', count: 8, label: 'Dipublikasikan', desc: 'Tempat sudah tayang', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'ditolak', count: 1, label: 'Ditolak', desc: 'Perlu diperbaiki', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    { id: 'total', count: 11, label: 'Total Tempat', desc: 'Semua tempat yang ditambahkan', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  ];

  const places = [
    {
      id: 1,
      name: 'Soto Pak Budi',
      address: 'Jl. Merdeka No. 12, Jakarta Selatan',
      category: 'Soto',
      dateAdded: '23/06/2025',
      timeAdded: '10:30',
      status: 'menunggu',
      views: 124,
      image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 2,
      name: 'Ayam Goreng Bu Tini',
      address: 'Jl. Kramat Raya No. 45, Jakarta Pusat',
      category: 'Ayam',
      dateAdded: '23/06/2025',
      timeAdded: '09:15',
      status: 'dipublikasikan',
      views: 256,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 3,
      name: 'Mie Ayam Bang Doel',
      address: 'Jl. Suryakencana No. 8, Bogor',
      category: 'Mie',
      dateAdded: '22/06/2025',
      timeAdded: '16:45',
      status: 'dipublikasikan',
      views: 189,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 4,
      name: 'Nasi Goreng Mas Joko',
      address: 'Jl. Pajajaran No. 21, Bogor',
      category: 'Nasi Goreng',
      dateAdded: '22/06/2025',
      timeAdded: '14:20',
      status: 'ditolak',
      views: 78,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=150&h=150'
    },
    {
      id: 5,
      name: 'Bakso Beranak Pak Kumis',
      address: 'Jl. Raya Condet No. 33, Jakarta Timur',
      category: 'Bakso',
      dateAdded: '21/06/2025',
      timeAdded: '11:05',
      status: 'dipublikasikan',
      views: 312,
      image: 'https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=150&h=150'
    }
  ];

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Menunggu Review
          </span>
        );
      case 'dipublikasikan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dipublikasikan
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPlaces = activeTab === 'semua' 
    ? places 
    : places.filter(p => p.status === activeTab);

  return (
    <div className={`flex-1 h-full flex flex-col overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-[100] px-8 py-6 border-b backdrop-blur-xl ${isDarkMode ? 'bg-[#1D1B19]/90 border-[#404040]' : 'bg-white/90 border-[#E7E5E4]'}`}>
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-[#262626] text-[#A8A29E] hover:text-white border border-[#404040]' : 'bg-[#F6F1EA] text-[#78716C] hover:text-[#4B2E2A] border border-[#E7E5E4]'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
              Kelola Tempat
            </h1>
            <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Kelola semua tempat makan yang telah Anda tambahkan.
            </p>
          </div>
          <div className="w-10 h-10 invisible" />
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Tabs */}
        <div className={`flex gap-6 border-b ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 text-sm font-bold relative transition-colors ${
                activeTab === tab.id 
                  ? 'text-[#FF611D]' 
                  : isDarkMode ? 'text-[#A8A29E] hover:text-white' : 'text-[#78716C] hover:text-[#4B2E2A]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF611D] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.id} className={`p-5 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border ${isDarkMode ? 'bg-[#333333] border-[#404040] ' + stat.color : stat.bg + ' ' + stat.border + ' ' + stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
                  {stat.count}
                </h3>
                <p className={`text-xs font-bold mb-0.5 ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>{stat.label}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-[#333333] border-[#404040] text-[#A8A29E]' : 'bg-[#F6F1EA] border-[#E7E5E4] text-[#78716C]'}`}>
                  <th className="p-4">Tempat</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Tanggal Ditambahkan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Dilihat</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-[#404040]' : 'divide-[#E7E5E4]'}`}>
                {filteredPlaces.map((place) => (
                  <tr key={place.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#333333]' : 'hover:bg-[#FAF9F6]'}`}>
                    <td className="p-4 flex items-center gap-4">
                      <img src={place.image} alt={place.name} className="w-14 h-14 rounded-xl object-cover border border-[#E7E5E4]" />
                      <div>
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{place.name}</h4>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{place.address}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${isDarkMode ? 'bg-[#404040] text-[#FAF9F6]' : 'bg-orange-50 text-[#FF611D]'}`}>
                        {place.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>{place.dateAdded}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{place.timeAdded}</p>
                    </td>
                    <td className="p-4">
                      {renderStatusPill(place.status)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{place.views}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isDarkMode ? 'border-[#404040] text-[#A8A29E] hover:text-white' : 'border-[#E7E5E4] text-[#78716C] hover:text-[#4B2E2A]'}`}>
                          Lihat Detail
                        </button>
                        <button className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'border-amber-200 text-amber-500 bg-amber-50 hover:bg-amber-100'}`}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-rose-500/30 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' : 'border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100'}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`p-4 border-t flex items-center justify-between text-sm font-bold ${isDarkMode ? 'border-[#404040] text-[#A8A29E]' : 'border-[#E7E5E4] text-[#78716C]'}`}>
            <span>Menampilkan 1 - 5 dari 11 tempat</span>
            <div className="flex gap-1">
              <button className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-[#404040] hover:bg-[#333333]' : 'border-[#E7E5E4] hover:bg-[#F6F1EA]'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#FF611D] text-white flex items-center justify-center">1</button>
              <button className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-[#404040] hover:bg-[#333333]' : 'border-[#E7E5E4] hover:bg-[#F6F1EA]'}`}>2</button>
              <button className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-[#404040] hover:bg-[#333333]' : 'border-[#E7E5E4] hover:bg-[#F6F1EA]'}`}>3</button>
              <button className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-[#404040] hover:bg-[#333333]' : 'border-[#E7E5E4] hover:bg-[#F6F1EA]'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscription & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {/* Subscription */}
          <div className="flex flex-col">
            <h3 className={`text-lg font-black italic tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
              Langganan Iklan Anda
            </h3>
            <p className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Kelola paket iklan untuk mempromosikan tempat Anda.
            </p>
            <div className={`p-6 rounded-2xl border flex-1 flex flex-col justify-between ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#FF611D]/20'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Paket Premium 30 Hari</h4>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Iklan tempat Anda akan tampil di halaman utama dan hasil pencarian.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-500 border border-emerald-200">
                  Aktif
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`} />
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Mulai</span>
                  </div>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>20/06/2025</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`} />
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Berakhir</span>
                  </div>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>20/07/2025</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Timer className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`} />
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Sisa Waktu</span>
                  </div>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>20 hari lagi</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${isDarkMode ? 'border-[#404040] text-[#A8A29E] hover:text-white' : 'border-[#E7E5E4] text-[#78716C] hover:text-[#4B2E2A]'}`}>
                  Lihat Detail Paket
                </button>
              </div>
            </div>
          </div>

          {/* Ad Stats */}
          <div className="flex flex-col">
            <h3 className={`text-lg font-black italic tracking-tighter mb-2 opacity-0`}>
              Space
            </h3>
            <p className={`text-xs font-bold mb-4 opacity-0`}>
              Space
            </p>
            <div className={`p-6 rounded-2xl border flex-1 flex flex-col lg:flex-row gap-6 ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
              {/* Feature List */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-[#FF611D]" />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>Tampil di halaman utama</span>
                </div>
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-[#FF611D]" />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>Prioritas di hasil pencarian</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-[#FF611D]" />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>Label "Rekomendasi"</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4 text-[#FF611D]" />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>Statistik performa iklan</span>
                </div>
              </div>

              {/* Stats & Renew */}
              <div className={`flex-1 p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#333333] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
                <div>
                  <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Statistik Iklan</h4>
                  <p className={`text-[10px] mb-4 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Selama 30 hari terakhir</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-2">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Dilihat</p>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>1.250</p>
                    </div>
                    <div>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-2">
                        <MousePointerClick className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Klik</p>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>178</p>
                    </div>
                    <div>
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-2">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Favorit</p>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>45</p>
                    </div>
                  </div>
                </div>

                <button className="w-full h-10 bg-[#FF611D] text-white rounded-xl text-xs font-black italic tracking-tighter shadow-md hover:opacity-90 active:scale-95 transition-all">
                  Perpanjang / Ubah Paket
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
