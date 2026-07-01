import { useState, useEffect } from 'react';
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
  BarChart2,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ManagePlacesProps {
  onBack: () => void;
  isDarkMode?: boolean;
  currentUserEmail?: string;
  onEditPlace?: (place: PendingPlace) => void;
}

interface PendingPlace {
  id: string;
  name: string;
  address: string;
  type: string;
  food_categories: string[];
  lat: number;
  lng: number;
  price_range: string;
  phone: string;
  hours: string;
  image: string;
  submitter_email: string;
  submitter_name: string;
  status: string; // 'menunggu' | 'disetujui' | 'ditolak'
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  menu_items: any[];
  created_at: string;
  updated_at: string;
}

export function UserManagePlacesScreen({ onBack, isDarkMode, currentUserEmail, onEditPlace }: ManagePlacesProps) {
  const [activeTab, setActiveTab] = useState('semua');
  const [places, setPlaces] = useState<PendingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const tabs = [
    { id: 'semua', label: 'Semua Tempat', icon: Store },
    { id: 'menunggu', label: 'Menunggu Review', icon: Clock },
    { id: 'disetujui', label: 'Dipublikasikan', icon: CheckCircle2 },
    { id: 'ditolak', label: 'Ditolak', icon: XCircle },
  ];

  // Fetch places from Supabase
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_places')
        .select('*')
        .eq('submitter_email', currentUserEmail || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaces(data || []);
    } catch (err: any) {
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [currentUserEmail]);

  // Delete a pending place
  const handleDelete = async (placeId: string) => {
    try {
      const { error } = await supabase
        .from('pending_places')
        .delete()
        .eq('id', placeId);

      if (error) throw error;
      setDeleteConfirm(null);
      await fetchPlaces();
    } catch (err: any) {
      console.error('Error deleting place:', err);
      alert('Gagal menghapus tempat: ' + (err.message || 'Unknown error'));
    }
  };

  // Compute stats
  const stats = [
    { 
      id: 'menunggu', 
      count: places.filter(p => p.status === 'menunggu').length, 
      label: 'Menunggu Review', 
      desc: 'Tempat sedang ditinjau admin', 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200' 
    },
    { 
      id: 'disetujui', 
      count: places.filter(p => p.status === 'disetujui').length, 
      label: 'Dipublikasikan', 
      desc: 'Tempat sudah tayang', 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200' 
    },
    { 
      id: 'ditolak', 
      count: places.filter(p => p.status === 'ditolak').length, 
      label: 'Ditolak', 
      desc: 'Perlu diperbaiki', 
      icon: XCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50', 
      border: 'border-rose-200' 
    },
    { 
      id: 'total', 
      count: places.length, 
      label: 'Total Tempat', 
      desc: 'Semua tempat yang ditambahkan', 
      icon: Store, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200' 
    },
  ];

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Menunggu Review
          </span>
        );
      case 'disetujui':
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

  // Filter places
  let filteredPlaces = activeTab === 'semua' 
    ? places 
    : places.filter(p => p.status === activeTab);

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPlaces = filteredPlaces.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.address.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

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
          <button 
            onClick={fetchPlaces}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-[#262626] text-[#A8A29E] hover:text-white border border-[#404040]' : 'bg-[#F6F1EA] text-[#78716C] hover:text-[#4B2E2A] border border-[#E7E5E4]'}`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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

        {/* Search Bar */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
          <Search className={`w-4 h-4 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`} />
          <input 
            type="text"
            placeholder="Cari tempat makan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`bg-transparent border-none outline-none text-sm font-medium w-full ${isDarkMode ? 'text-white placeholder:text-[#525252]' : 'text-[#4B2E2A] placeholder:text-[#A8A29E]'}`}
          />
        </div>

        {/* Data Table */}
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`} />
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Store className={`w-12 h-12 ${isDarkMode ? 'text-[#404040]' : 'text-[#E7E5E4]'}`} />
              <p className={`text-sm font-bold ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                {searchQuery ? 'Tidak ada tempat yang cocok dengan pencarian.' : 'Belum ada tempat yang ditambahkan.'}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-[#525252]' : 'text-[#A8A29E]'}`}>
                Tambahkan tempat makan baru melalui menu "Tambah Tempat Makan".
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-[#333333] border-[#404040] text-[#A8A29E]' : 'bg-[#F6F1EA] border-[#E7E5E4] text-[#78716C]'}`}>
                      <th className="p-4">Tempat</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Tanggal Ditambahkan</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Catatan Admin</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-[#404040]' : 'divide-[#E7E5E4]'}`}>
                    {filteredPlaces.map((place) => (
                      <tr key={place.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#333333]' : 'hover:bg-[#FAF9F6]'}`}>
                        <td className="p-4 flex items-center gap-4">
                          {place.image ? (
                            <img src={place.image} alt={place.name} className="w-14 h-14 rounded-xl object-cover border border-[#E7E5E4] shrink-0" />
                          ) : (
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'}`}>
                              <Store className={`w-6 h-6 ${isDarkMode ? 'text-[#525252]' : 'text-[#A8A29E]'}`} />
                            </div>
                          )}
                          <div>
                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{place.name}</h4>
                            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{place.address}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${isDarkMode ? 'bg-[#404040] text-[#FAF9F6]' : 'bg-orange-50 text-[#FF611D]'}`}>
                            {place.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>{formatDate(place.created_at)}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{formatTime(place.created_at)}</p>
                        </td>
                        <td className="p-4">
                          {renderStatusPill(place.status)}
                        </td>
                        <td className="p-4 max-w-[200px]">
                          {place.admin_notes ? (
                            <div className="flex items-start gap-1.5">
                              <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${place.status === 'ditolak' ? 'text-rose-500' : 'text-emerald-500'}`} />
                              <p className={`text-xs ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{place.admin_notes}</p>
                            </div>
                          ) : (
                            <p className={`text-xs italic ${isDarkMode ? 'text-[#525252]' : 'text-[#A8A29E]'}`}>-</p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {deleteConfirm === place.id ? (
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleDelete(place.id)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                                >
                                  Ya, Hapus
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirm(null)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${isDarkMode ? 'border-[#404040] text-[#A8A29E]' : 'border-[#E7E5E4] text-[#78716C]'}`}
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <>
                                {place.status === 'disetujui' && (
                                  <span className={`text-[10px] font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    ✓ Live
                                  </span>
                                )}
                                {onEditPlace && (
                                  <button 
                                    onClick={() => onEditPlace(place)}
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-[#404040] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' : 'border-blue-200 text-blue-500 bg-blue-50 hover:bg-blue-100'}`}
                                    title="Edit Tempat"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setDeleteConfirm(place.id)}
                                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isDarkMode ? 'border-rose-500/30 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' : 'border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100'}`}
                                  title="Hapus Tempat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={`p-4 border-t flex items-center justify-between text-sm font-bold ${isDarkMode ? 'border-[#404040] text-[#A8A29E]' : 'border-[#E7E5E4] text-[#78716C]'}`}>
                <span>Menampilkan {filteredPlaces.length} dari {places.length} tempat</span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
