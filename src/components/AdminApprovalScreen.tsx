import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Hourglass, RefreshCw, Store, Eye, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminApprovalScreenProps {
  isDarkMode: boolean;
  currentUserEmail?: string;
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
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  menu_items: any[];
  created_at: string;
}

export function AdminApprovalScreen({ isDarkMode, currentUserEmail }: AdminApprovalScreenProps) {
  const [activeTab, setActiveTab] = useState('Semua');
  const [places, setPlaces] = useState<PendingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState<PendingPlace | null>(null);

  // Fetch all pending_places from Supabase
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_places')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaces(data || []);
    } catch (err: any) {
      console.error('Error fetching pending places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Approve a place: move data to restaurants table + update status
  const handleApprove = async (place: PendingPlace) => {
    setActionLoading(place.id);
    try {
      // 1. Insert into restaurants table
      const { data: restoData, error: restoError } = await supabase
        .from('restaurants')
        .insert({
          name: place.name,
          type: place.type,
          food_categories: place.food_categories,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          price_range: place.price_range,
          phone: place.phone,
          hours: place.hours,
          image: place.image,
          rating: 0,
          review_count: 0,
          is_available_online: true
        })
        .select()
        .single();

      if (restoError) throw restoError;

      // 2. Insert menu items from JSONB
      if (place.menu_items && place.menu_items.length > 0 && restoData) {
        const menuToInsert = place.menu_items.map((item: any) => ({
          restaurant_id: restoData.id,
          name: item.name,
          price: item.price,
          image: item.image || '',
          description: item.description || '',
          category: item.category || 'Main Course'
        }));

        const { error: menuError } = await supabase.from('menu_items').insert(menuToInsert);
        if (menuError) {
          console.error('Error inserting menu items:', menuError);
        }
      }

      // 3. Update pending_places status
      const { error: updateError } = await supabase
        .from('pending_places')
        .update({
          status: 'disetujui',
          reviewed_by: currentUserEmail || 'admin',
          reviewed_at: new Date().toISOString(),
          admin_notes: 'Disetujui dan dipublikasikan.'
        })
        .eq('id', place.id);

      if (updateError) throw updateError;

      await fetchPlaces();
    } catch (err: any) {
      console.error('Error approving place:', err);
      alert('Gagal menyetujui tempat: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  // Reject a place
  const handleReject = async (placeId: string) => {
    if (!rejectReason.trim()) {
      alert('Masukkan alasan penolakan.');
      return;
    }
    
    setActionLoading(placeId);
    try {
      const { error } = await supabase
        .from('pending_places')
        .update({
          status: 'ditolak',
          reviewed_by: currentUserEmail || 'admin',
          reviewed_at: new Date().toISOString(),
          admin_notes: rejectReason
        })
        .eq('id', placeId);

      if (error) throw error;

      setRejectModalId(null);
      setRejectReason('');
      await fetchPlaces();
    } catch (err: any) {
      console.error('Error rejecting place:', err);
      alert('Gagal menolak tempat: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const statusMap: Record<string, string> = {
    'menunggu': 'Menunggu',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak'
  };

  const tabFilterMap: Record<string, string> = {
    'Semua': '',
    'Menunggu': 'menunggu',
    'Disetujui': 'disetujui',
    'Ditolak': 'ditolak'
  };

  const tabs = [
    { id: 'Semua', label: 'Semua', count: places.length, icon: Filter, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { id: 'Menunggu', label: 'Menunggu', count: places.filter(p => p.status === 'menunggu').length, icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { id: 'Disetujui', label: 'Disetujui', count: places.filter(p => p.status === 'disetujui').length, icon: Check, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    { id: 'Ditolak', label: 'Ditolak', count: places.filter(p => p.status === 'ditolak').length, icon: X, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  ];

  // Apply filters
  let filteredPlaces = activeTab === 'Semua' 
    ? places 
    : places.filter(p => p.status === tabFilterMap[activeTab]);

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPlaces = filteredPlaces.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.submitter_name?.toLowerCase().includes(q) || 
      p.submitter_email.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
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

  const bgColor = isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]';
  const surfaceColor = isDarkMode ? 'bg-[#262626]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]';
  const textColor = isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]';
  const mutedColor = isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]';

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden`}>
      {/* Header Area */}
      <div className="p-8 pb-4 shrink-0 flex justify-between items-start">
        <div>
          <h2 className={`text-2xl font-black italic tracking-tight ${textColor} mb-1`}>Approval Tempat Makan</h2>
          <p className={`text-sm ${mutedColor}`}>Kelola dan verifikasi tempat makan yang diajukan oleh pengguna sebelum dipublish.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchPlaces}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} text-sm font-semibold ${mutedColor} hover:text-[#FF611D] transition-colors`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} w-72`}>
            <Search className={`w-4 h-4 ${mutedColor}`} />
            <input 
              type="text" 
              placeholder="Cari tempat makan atau pengaju..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm w-full ${textColor} placeholder:${mutedColor}`}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 pb-4 shrink-0">
        <div className={`inline-flex items-center gap-1 p-1.5 rounded-2xl ${surfaceColor} border ${borderColor}`}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? `shadow-sm ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} ${tab.color}`
                    : `${mutedColor} hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`
                }`}
              >
                {isActive && <tab.icon className="w-4 h-4" />}
                {!isActive && <tab.icon className="w-4 h-4 opacity-50" />}
                {tab.label}
                <span className={`px-2 py-0.5 rounded-lg text-[11px] ${isActive ? tab.bg : (isDarkMode ? 'bg-zinc-800' : 'bg-gray-100')} ${isActive ? tab.color : mutedColor}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden px-8 pb-8">
        <div className={`${surfaceColor} rounded-2xl border ${borderColor} h-full flex flex-col shadow-sm`}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className={`w-8 h-8 animate-spin ${mutedColor}`} />
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Store className={`w-12 h-12 ${isDarkMode ? 'text-[#404040]' : 'text-[#E7E5E4]'}`} />
              <p className={`text-sm font-bold ${mutedColor}`}>
                {searchQuery ? 'Tidak ada data yang cocok.' : 'Belum ada pengajuan tempat makan.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
                    <tr className={`border-b ${borderColor} ${textColor} text-xs font-bold`}>
                      <th className="px-6 py-4">Tempat Makan</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Pengaju</th>
                      <th className="px-6 py-4">Tanggal Pengajuan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-[#404040]' : 'divide-gray-100'}`}>
                    {filteredPlaces.map((item) => (
                      <tr key={item.id} className={`hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50/50'} transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-16 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                            ) : (
                              <div className={`w-16 h-12 rounded-lg flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                                <Store className={`w-5 h-5 ${mutedColor}`} />
                              </div>
                            )}
                            <div>
                              <p className={`font-bold ${textColor} mb-0.5`}>{item.name}</p>
                              <p className={`text-xs ${mutedColor} whitespace-pre-line`}>{item.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.submitter_name || item.submitter_email}`} 
                              alt={item.submitter_name || ''} 
                              className="w-8 h-8 rounded-full bg-gray-100 shrink-0" 
                            />
                            <div>
                              <p className={`font-bold text-xs ${textColor}`}>{item.submitter_name || item.submitter_email.split('@')[0]}</p>
                              <p className={`text-[10px] ${mutedColor}`}>{item.submitter_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`font-bold text-xs ${textColor}`}>{formatDate(item.created_at)}</p>
                            <p className={`text-[10px] ${mutedColor}`}>{formatTime(item.created_at)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'menunggu' 
                              ? (isDarkMode ? 'text-orange-400 bg-orange-500/10' : 'text-orange-500 bg-orange-50')
                              : item.status === 'disetujui' 
                                ? (isDarkMode ? 'text-green-400 bg-green-500/10' : 'text-green-500 bg-green-50')
                                : (isDarkMode ? 'text-red-400 bg-red-500/10' : 'text-red-500 bg-red-50')
                          }`}>
                            {statusMap[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === 'menunggu' ? (
                              <>
                                <button 
                                  onClick={() => handleApprove(item)}
                                  disabled={actionLoading === item.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF611D] text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
                                >
                                  {actionLoading === item.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  Publish
                                </button>
                                <button 
                                  onClick={() => { setRejectModalId(item.id); setRejectReason(''); }}
                                  disabled={actionLoading === item.id}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 ${isDarkMode ? 'bg-transparent hover:bg-red-500/10' : 'bg-white hover:bg-red-50'} text-xs font-bold transition-colors shadow-sm disabled:opacity-50`}
                                >
                                  <X className="w-3.5 h-3.5" /> Tolak
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => setDetailModal(item)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${borderColor} ${mutedColor} text-xs font-bold hover:text-[#FF611D] transition-colors`}
                              >
                                <Eye className="w-3.5 h-3.5" /> Detail
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Info */}
              <div className={`p-4 border-t ${borderColor} flex items-center justify-between ${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
                <p className={`text-xs font-medium ${mutedColor}`}>
                  Menampilkan {filteredPlaces.length} dari {places.length} data
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModalId(null)} />
          <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
            <h3 className={`text-lg font-black italic tracking-tighter mb-2 ${textColor}`}>Tolak Pengajuan</h3>
            <p className={`text-xs mb-4 ${mutedColor}`}>Berikan alasan penolakan agar pengguna bisa memperbaiki pengajuannya.</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className={`w-full h-28 rounded-xl p-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] resize-none transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#4B2E2A]'}`}
            />
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setRejectModalId(null)}
                className={`flex-1 h-11 rounded-xl text-sm font-bold border ${borderColor} ${mutedColor} transition-colors hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}
              >
                Batal
              </button>
              <button 
                onClick={() => handleReject(rejectModalId)}
                disabled={actionLoading === rejectModalId}
                className="flex-1 h-11 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModalId ? 'Memproses...' : 'Tolak Pengajuan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailModal(null)} />
          <div className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border max-h-[80vh] overflow-y-auto ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
            <h3 className={`text-lg font-black italic tracking-tighter mb-4 ${textColor}`}>Detail Pengajuan</h3>
            
            {detailModal.image && (
              <img src={detailModal.image} alt={detailModal.name} className="w-full h-40 object-cover rounded-xl mb-4" />
            )}
            
            <div className="space-y-3">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Nama Tempat</p>
                <p className={`text-sm font-bold ${textColor}`}>{detailModal.name}</p>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Alamat</p>
                <p className={`text-sm ${textColor}`}>{detailModal.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Kategori</p>
                  <p className={`text-sm ${textColor}`}>{detailModal.type}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Harga</p>
                  <p className={`text-sm ${textColor}`}>{detailModal.price_range}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Telepon</p>
                  <p className={`text-sm ${textColor}`}>{detailModal.phone}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Jam Buka</p>
                  <p className={`text-sm ${textColor}`}>{detailModal.hours}</p>
                </div>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Pengaju</p>
                <p className={`text-sm ${textColor}`}>{detailModal.submitter_name} ({detailModal.submitter_email})</p>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                  detailModal.status === 'disetujui' 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {statusMap[detailModal.status] || detailModal.status}
                </span>
              </div>
              {detailModal.admin_notes && (
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Catatan Admin</p>
                  <p className={`text-sm ${textColor}`}>{detailModal.admin_notes}</p>
                </div>
              )}
              {detailModal.menu_items && detailModal.menu_items.length > 0 && (
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>Menu ({detailModal.menu_items.length} item)</p>
                  <div className="space-y-2">
                    {detailModal.menu_items.map((menu: any, idx: number) => (
                      <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl ${isDarkMode ? 'bg-[#333333]' : 'bg-[#FAF9F6]'}`}>
                        {menu.image && (
                          <img src={menu.image} alt={menu.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${textColor}`}>{menu.name}</p>
                          <p className={`text-[10px] ${mutedColor}`}>Rp {Number(menu.price).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setDetailModal(null)}
              className={`w-full h-11 rounded-xl text-sm font-bold border mt-6 ${borderColor} ${mutedColor} transition-colors hover:text-[#FF611D]`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
