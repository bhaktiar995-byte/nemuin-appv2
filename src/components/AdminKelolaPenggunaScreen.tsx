import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Save, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminKelolaPenggunaScreenProps {
  isDarkMode: boolean;
}

export function AdminKelolaPenggunaScreen({ isDarkMode }: AdminKelolaPenggunaScreenProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track role changes before saving
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, email: string} | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const bgColor = isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]';
  const surfaceColor = isDarkMode ? 'bg-[#262626]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]';
  const textColor = isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]';
  const mutedColor = isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_auth')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setUsers(data);
      } else {
        console.error('Error fetching users:', error);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectChange = (userId: string, newRole: string) => {
    // If selecting the same role as current, remove from pending
    const currentUser = users.find(u => u.id === userId);
    if (currentUser && currentUser.role === newRole) {
      setPendingRoleChanges(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } else {
      setPendingRoleChanges(prev => ({
        ...prev,
        [userId]: newRole
      }));
    }
  };

  const handleSaveRole = async (userId: string) => {
    const newRole = pendingRoleChanges[userId];
    if (!newRole) return;
    
    setSavingId(userId);
    setSuccessId(null);

    try {
      // Use upsert-like approach: update the role column
      const { data, error } = await supabase
        .from('users_auth')
        .update({ role: newRole })
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('Error updating role:', error);
        alert(`Gagal mengubah role: ${error.message}`);
      } else if (data && data.length === 0) {
        console.error('Update ignored by RLS policy');
        alert('Gagal mengubah role di database. Akses ditolak oleh pengaturan keamanan (RLS) Supabase. Pastikan kebijakan Update RLS pada tabel users_auth diizinkan.');
      } else {
        // Re-fetch to ensure we have the latest data from DB
        await fetchUsers();
        setPendingRoleChanges(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        setSuccessId(userId);
        setTimeout(() => setSuccessId(null), 2000);
      }
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert(`Gagal mengubah role: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    
    setActionLoading(deleteConfirm.id);
    try {
      const { data, error } = await supabase
        .from('users_auth')
        .delete()
        .eq('id', deleteConfirm.id)
        .select();
        
      if (error) {
        console.error('Error deleting user:', error);
        alert(`Gagal menghapus pengguna: ${error.message}`);
      } else if (data && data.length === 0) {
        alert('Gagal menghapus pengguna. Akses ditolak oleh keamanan (RLS) Supabase, atau pengguna sudah terhapus. Pastikan policy Delete diizinkan untuk admin.');
      } else {
        await fetchUsers();
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Gagal menghapus pengguna: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden ${bgColor}`}>
      {/* Header Area */}
      <div className="p-4 md:p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-4">
        <div>
          <h2 className={`text-xl md:text-2xl font-black italic tracking-tight ${textColor} mb-1`}>Kelola Pengguna</h2>
          <p className={`text-xs md:text-sm ${mutedColor}`}>Kelola semua pengguna aplikasi Nemuin.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} w-full md:w-72`}>
            <Search className={`w-4 h-4 ${mutedColor}`} />
            <input 
              type="text" 
              placeholder="Cari email pengguna..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm w-full ${textColor} placeholder:${mutedColor}`}
            />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8 space-y-6">
        
        {/* Daftar Pengguna */}
        <div className={`${surfaceColor} rounded-2xl border ${borderColor} flex flex-col shadow-sm overflow-hidden`}>
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-transparent">
            <h3 className={`text-base md:text-lg font-bold italic tracking-tight ${textColor}`}>Daftar Pengguna ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
              <thead className={`${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
                <tr className={`border-b ${borderColor} ${textColor} text-[10px] md:text-xs font-bold uppercase tracking-wider`}>
                  <th className="px-4 md:px-6 py-3 md:py-4">Pengguna</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Role Saat Ini</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Tanggal Daftar</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">Memuat data pengguna...</td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const currentSelectedRole = pendingRoleChanges[user.id] ?? user.role ?? 'user';
                    const isChanged = user.id in pendingRoleChanges && pendingRoleChanges[user.id] !== user.role;
                    const isSaving = savingId === user.id;
                    const isSuccess = successId === user.id;

                    return (
                      <tr key={user.id} className={`hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50/50'} transition-colors`}>
                        <td className="px-4 md:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                              <UserIcon className={`w-4 h-4 ${mutedColor}`} />
                            </div>
                            <span className={`font-bold text-xs md:text-sm ${textColor}`}>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'admin' 
                              ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                              : 'text-green-600 bg-green-50 dark:bg-green-500/10'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className={`px-4 md:px-6 py-3 text-[10px] md:text-xs ${mutedColor}`}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              value={currentSelectedRole}
                              onChange={(e) => handleSelectChange(user.id, e.target.value)}
                              disabled={isSaving}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                                isChanged ? 'border-[#FF611D]' : borderColor
                              } bg-transparent ${textColor} outline-none cursor-pointer transition-colors disabled:opacity-50`}
                            >
                              <option value="user" className="text-black">User</option>
                              <option value="admin" className="text-black">Admin</option>
                            </select>
                            
                            {isChanged && (
                              <button
                                onClick={() => handleSaveRole(user.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1 bg-[#FF611D] hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                              </button>
                            )}

                            {isSuccess && (
                              <span className="flex items-center gap-1 text-green-500 text-xs font-bold">
                                <CheckCircle className="w-3.5 h-3.5" /> Tersimpan!
                              </span>
                            )}
                            
                            <button
                              onClick={() => setDeleteConfirm({id: user.id, email: user.email})}
                              disabled={isSaving}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada pengguna ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className={`relative w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-[#262626] shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black italic tracking-tighter text-rose-500 mb-2">Hapus Pengguna</h3>
            <p className={`text-sm mb-6 ${mutedColor}`}>
              Apakah Anda yakin ingin menghapus pengguna <span className="text-[#FF611D] font-bold">{deleteConfirm.email}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 h-11 rounded-xl text-sm font-bold border ${borderColor} ${mutedColor} transition-colors hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={actionLoading === deleteConfirm.id}
                className="flex-1 h-11 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading === deleteConfirm.id ? 'MENGHAPUS...' : 'YA, HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
