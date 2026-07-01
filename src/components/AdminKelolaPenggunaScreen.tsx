import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Save, CheckCircle } from 'lucide-react';
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
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center">Atur Role</th>
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
    </div>
  );
}
