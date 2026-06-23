import React from 'react';
import { Search, Filter, Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface AdminKelolaPenggunaScreenProps {
  isDarkMode: boolean;
}

const mockRecentUsers = [
  { id: 1, name: 'Rina Amelia', email: 'rina.amelia@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', date: '23/06/2025 14:20', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina' },
  { id: 2, name: 'Dimas Saputra', email: 'dimas.saputra@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', date: '23/06/2025 13:45', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas' },
  { id: 3, name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', date: '22/06/2025 16:10', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { id: 4, name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', date: '22/06/2025 11:25', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
  { id: 5, name: 'Andi Wijaya', email: 'andi.wijaya@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', date: '21/06/2025 09:50', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi' },
];

const mockActiveUsers = [
  { id: 1, name: 'Aditya Yusuf', email: 'aditya.yusuf@gmail.com', role: 'Admin', roleColor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10', status: 'Aktif', lastActive: 'Online', isOnline: true, joined: '10/01/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
  { id: 2, name: 'Rina Amelia', email: 'rina.amelia@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', status: 'Aktif', lastActive: '10 menit lalu', isOnline: false, joined: '23/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina' },
  { id: 3, name: 'Dimas Saputra', email: 'dimas.saputra@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', status: 'Aktif', lastActive: '1 jam lalu', isOnline: false, joined: '22/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas' },
  { id: 4, name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', status: 'Aktif', lastActive: '2 jam lalu', isOnline: false, joined: '22/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { id: 5, name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', role: 'User', roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10', status: 'Aktif', lastActive: '3 jam lalu', isOnline: false, joined: '22/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
];

const mockSystemRoles = [
  { 
    id: 1, 
    role: 'Super Admin', 
    roleColor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
    desc: 'Akses penuh ke semua fitur sistem', 
    count: 1,
    access: ['Semua akses', 'Pengaturan sistem', 'Kelola pengguna & role']
  },
  { 
    id: 2, 
    role: 'Admin', 
    roleColor: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    desc: 'Mengelola data, user, dan pengaturan sistem', 
    count: 3,
    access: ['Kelola tempat makan', 'Kelola pengguna', 'Laporan & statistik']
  },
  { 
    id: 3, 
    role: 'Moderator', 
    roleColor: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
    desc: 'Menyetujui tempat makan & kelola konten', 
    count: 2,
    access: ['Approval tempat makan', 'Kelola konten']
  },
  { 
    id: 4, 
    role: 'User', 
    roleColor: 'text-green-600 bg-green-50 dark:bg-green-500/10',
    desc: 'Pengguna biasa yang dapat menambah tempat', 
    count: 1244,
    access: ['Tambah tempat makan', 'Like & komentar', 'Profil pribadi']
  },
];

export function AdminKelolaPenggunaScreen({ isDarkMode }: AdminKelolaPenggunaScreenProps) {
  const bgColor = isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]';
  const surfaceColor = isDarkMode ? 'bg-[#262626]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]';
  const textColor = isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]';
  const mutedColor = isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]';

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden ${bgColor}`}>
      {/* Header Area */}
      <div className="p-8 pb-4 flex justify-between items-start shrink-0">
        <div>
          <h2 className={`text-2xl font-black italic tracking-tight ${textColor} mb-1`}>Kelola Pengguna</h2>
          <p className={`text-sm ${mutedColor}`}>Kelola semua pengguna aplikasi Nemuin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} text-sm font-semibold ${mutedColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors`}>
            <Filter className="w-4 h-4" />
            Semua Role
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} w-72`}>
            <Search className={`w-4 h-4 ${mutedColor}`} />
            <input 
              type="text" 
              placeholder="Cari nama atau email pengguna..." 
              className={`bg-transparent border-none outline-none text-sm w-full ${textColor} placeholder:${mutedColor}`}
            />
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        
        {/* User Terbaru */}
        <div className={`${surfaceColor} rounded-2xl border ${borderColor} flex flex-col shadow-sm overflow-hidden`}>
          <div className="flex justify-between items-center p-6 border-b border-transparent">
            <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>User Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className={`${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
                <tr className={`border-b ${borderColor} ${textColor} text-xs font-bold`}>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                {mockRecentUsers.map((user) => (
                  <tr key={user.id} className={`hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                        <span className={`font-bold text-xs ${textColor}`}>{user.name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-3 text-xs ${mutedColor}`}>{user.email}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.roleColor}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-xs ${mutedColor}`}>{user.date}</td>
                    <td className="px-6 py-3">
                      <span className="text-green-500 text-xs font-bold bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className={`p-1.5 rounded-lg border-none ${mutedColor} hover:${textColor} transition-colors`}>
                        <MoreVertical className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengguna Aktif */}
        <div className={`${surfaceColor} rounded-2xl border ${borderColor} flex flex-col shadow-sm overflow-hidden`}>
          <div className="flex justify-between items-center p-6 border-b border-transparent">
            <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>Pengguna Aktif</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className={`${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
                <tr className={`border-b ${borderColor} ${textColor} text-xs font-bold`}>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Terakhir Aktif</th>
                  <th className="px-6 py-4">Bergabung</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                {mockActiveUsers.map((user) => (
                  <tr key={user.id} className={`hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                        <span className={`font-bold text-xs ${textColor}`}>{user.name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-3 text-xs ${mutedColor}`}>{user.email}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.roleColor}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-green-500 text-xs font-bold bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={`text-xs ${user.isOnline ? 'text-green-500 font-semibold' : mutedColor}`}>
                          {user.lastActive}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-3 text-xs ${mutedColor}`}>{user.joined}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-orange-500 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-md transition-colors shadow-sm"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className={`p-4 border-t ${borderColor} flex justify-end ${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
            <div className="flex items-center gap-1">
              <button className={`p-1.5 rounded-lg border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-[#FF611D] text-white shadow-sm`}>
                1
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                2
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                3
              </button>
              <button className={`p-1.5 rounded-lg border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Role Sistem */}
        <div className={`${surfaceColor} rounded-2xl border ${borderColor} flex flex-col shadow-sm overflow-hidden`}>
          <div className="flex justify-between items-center p-6 border-b border-transparent">
            <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>Role Sistem</h3>
            <button className="bg-[#FF611D] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-md hover:bg-orange-600 transition-colors">
              <Plus className="w-4 h-4" /> Tambah Role
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className={`${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
                <tr className={`border-b ${borderColor} ${textColor} text-xs font-bold`}>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Jumlah Pengguna</th>
                  <th className="px-6 py-4">Akses Utama</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                {mockSystemRoles.map((role) => (
                  <tr key={role.id} className={`hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${role.roleColor}`}>
                        {role.role}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs ${mutedColor}`}>{role.desc}</td>
                    <td className={`px-6 py-4 text-xs ${textColor} font-semibold`}>{role.count.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <ul className="space-y-1">
                        {role.access.map((item, idx) => (
                          <li key={idx} className={`text-[11px] ${mutedColor} flex items-center gap-1.5`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF611D]"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-orange-500 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-md transition-colors shadow-sm"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className={`p-4 border-t ${borderColor} flex justify-end ${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
            <div className="flex items-center gap-1">
              <button className={`p-1.5 rounded-lg border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-[#FF611D] text-white shadow-sm`}>
                1
              </button>
              <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                2
              </button>
              <button className={`p-1.5 rounded-lg border ${borderColor} ${mutedColor} hover:${textColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors ${isDarkMode ? 'bg-transparent' : 'bg-white'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
