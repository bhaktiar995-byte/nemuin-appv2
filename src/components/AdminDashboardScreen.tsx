import React, { useState } from 'react';
import {
  Home,
  Clock,
  Users,
  Shield,
  BarChart2,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  Store,
  Hourglass,
  Star,
  Check,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  LogOut
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface AdminDashboardScreenProps {
  isDarkMode: boolean;
  onBack: () => void;
  currentUser: { email: string; role: string } | null;
}

const mockBarData = [
  { name: 'Jan', users: 40 },
  { name: 'Feb', users: 60 },
  { name: 'Mar', users: 80 },
  { name: 'Apr', users: 85 },
  { name: 'Mei', users: 95 },
  { name: 'Jun', users: 85 },
  { name: 'Jul', users: 100 },
  { name: 'Agu', users: 130 },
  { name: 'Sep', users: 100 },
  { name: 'Okt', users: 75 },
  { name: 'Nov', users: 95 },
  { name: 'Des', users: 65 },
];

const mockLineData = [
  { name: 'Jan', places: 60 },
  { name: 'Feb', places: 100 },
  { name: 'Mar', places: 180 },
  { name: 'Apr', places: 220 },
  { name: 'Mei', places: 280 },
  { name: 'Jun', places: 310 },
  { name: 'Jul', places: 350 },
  { name: 'Agu', places: 420 },
  { name: 'Sep', places: 380 },
  { name: 'Okt', places: 440 },
  { name: 'Nov', places: 480 },
  { name: 'Des', places: 550 },
];

const pendingApprovals = [
  {
    id: 1,
    name: 'Soto Pak Budi',
    category: 'Soto',
    submitter: 'Aditya Yusuf',
    date: 'Diajukan: 23/06/2025',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4b43b3130?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 2,
    name: 'Ayam Goreng Bu Tini',
    category: 'Ayam',
    submitter: 'Rina Amelia',
    date: 'Diajukan: 22/06/2025',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 3,
    name: 'Mie Ayam Bang Doel',
    category: 'Mie',
    submitter: 'Dimas Saputra',
    date: 'Diajukan: 21/06/2025',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 4,
    name: 'Nasi Goreng Mas Joko',
    category: 'Nasi Goreng',
    submitter: 'Budi Santoso',
    date: 'Diajukan: 20/06/2025',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=200'
  }
];

const recentUsers = [
  { name: 'Rina Amelia', email: 'rina.amelia@gmail.com', role: 'User', date: '23/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina' },
  { name: 'Dimas Saputra', email: 'dimas.saputra@gmail.com', role: 'User', date: '23/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas' },
  { name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'User', date: '22/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', role: 'User', date: '22/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
  { name: 'Andi Wijaya', email: 'andi.wijaya@gmail.com', role: 'User', date: '21/06/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi' },
];

const activeUsers = [
  { name: 'Aditya Yusuf', email: 'aditya.yusuf@gmail.com', role: 'Admin', status: 'Aktif', date: '10/01/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
  { name: 'Rina Amelia', email: 'rina.amelia@gmail.com', role: 'User', status: 'Aktif', date: '12/03/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina' },
  { name: 'Dimas Saputra', email: 'dimas.saputra@gmail.com', role: 'Moderator', status: 'Aktif', date: '15/03/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas' },
  { name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'User', status: 'Aktif', date: '18/03/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', role: 'User', status: 'Nonaktif', date: '20/03/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
];

const systemRoles = [
  { role: 'Super Admin', desc: 'Akses penuh ke semua fitur sistem', count: 1 },
  { role: 'Admin', desc: 'Mengelola data, user, dan pengaturan sistem', count: 3 },
  { role: 'Moderator', desc: 'Menyetujui tempat makan & kelola konten', count: 2 },
  { role: 'User', desc: 'Pengguna biasa yang dapat menambah tempat', count: 1244 },
];

export function AdminDashboardScreen({ isDarkMode, onBack, currentUser }: AdminDashboardScreenProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const menuItems = [
    { id: 'Dashboard', icon: Home, label: 'Dashboard' },
    { id: 'Approval', icon: Clock, label: 'Approval Tempat Makan' },
    { id: 'KelolaPengguna', icon: Users, label: 'Kelola Pengguna' },
    { id: 'KelolaRole', icon: Shield, label: 'Kelola Role' },
    { id: 'Statistik', icon: BarChart2, label: 'Statistik' },
    { id: 'Laporan', icon: FileText, label: 'Laporan' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  const bgColor = isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]';
  const surfaceColor = isDarkMode ? 'bg-[#262626]' : 'bg-white';
  const sidebarBgColor = isDarkMode ? 'bg-[#262626]' : 'bg-[#F6F1EA]';
  const borderColor = isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]';
  const textColor = isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]';
  const mutedColor = isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]';

  return (
    <div className={`flex w-full h-full overflow-hidden ${bgColor} text-sm font-sans`}>
      {/* Sidebar */}
      <aside className={`w-64 ${sidebarBgColor} border-r ${borderColor} flex flex-col h-full z-10 shrink-0 shadow-sm`}>
        <div className="p-6 cursor-pointer" onClick={onBack}>
          <h1 className={`text-2xl font-black italic tracking-tighter ${textColor}`}>
            Nemuin<span className="text-[#FF611D]">.</span>
          </h1>
          <p className={`text-[11px] font-medium italic ${mutedColor}`}>Admin Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === item.id
                  ? 'bg-[#FF611D] text-white shadow-[0_4px_12px_rgba(255,97,29,0.25)]'
                  : `${mutedColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-white'} hover:text-[#FF611D]`
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer: Profile above Exit Button */}
        <div className={`p-4 border-t ${borderColor} mx-4 my-2 flex flex-col gap-3`}>
          {/* Profile Details */}
          <div className={`p-3 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminAditya" 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-orange-200 bg-orange-50 shrink-0"
            />
            <div className="overflow-hidden">
              <p className={`font-bold truncate text-xs ${textColor}`}>Admin Aditya</p>
              <p className={`text-[10px] ${mutedColor} truncate`}>Super Admin</p>
            </div>
          </div>
          
          {/* Exit Button */}
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-rose-500 hover:bg-rose-500/10 cursor-pointer text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Menu Utama</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Pengguna', value: '1.250', subtitle: '+12 dari minggu lalu', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50', trend: true },
              { title: 'Total Tempat Makan', value: '532', subtitle: 'Dipublish', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50', trend: null },
              { title: 'Pending Approval', value: '18', subtitle: 'Menunggu ACC', icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-50', trend: false },
              { title: 'Total Review', value: '8.231', subtitle: '+102 dari minggu lalu', icon: Star, color: 'text-green-500', bg: 'bg-green-50', trend: true },
            ].map((card, i) => (
              <div key={i} className={`${surfaceColor} p-6 rounded-2xl border ${borderColor} flex items-center gap-5 shadow-sm`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${card.bg}`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${mutedColor} mb-1`}>{card.title}</p>
                  <h3 className={`text-3xl font-black tracking-tight ${textColor}`}>{card.value}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trend === true && <TrendingUp className="w-3 h-3 text-green-500" />}
                    <span className={`text-[11px] font-medium ${card.trend === true ? 'text-green-500' : card.trend === false ? 'text-orange-500' : mutedColor}`}>
                      {card.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className={`${surfaceColor} p-6 rounded-2xl border ${borderColor} shadow-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>User Baru Per Bulan</h3>
                <select className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${borderColor} bg-transparent ${mutedColor}`}>
                  <option>Tahun Ini</option>
                  <option>Tahun Lalu</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#404040' : '#E5E7EB'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} />
                    <RechartsTooltip cursor={{ fill: isDarkMode ? '#404040' : '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="users" fill="#FF611D" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            <div className={`${surfaceColor} p-6 rounded-2xl border ${borderColor} shadow-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>Tempat Makan Dipublish</h3>
                <select className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${borderColor} bg-transparent ${mutedColor}`}>
                  <option>Tahun Ini</option>
                  <option>Tahun Lalu</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#404040' : '#E5E7EB'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="places" stroke="#FF611D" strokeWidth={3} dot={{ r: 4, fill: '#FF611D', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Approvals & Recent Users */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Approvals */}
            <div className={`xl:col-span-2 ${surfaceColor} p-6 rounded-2xl border ${borderColor} shadow-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>Tempat Makan Menunggu Approval</h3>
                <button className={`text-xs font-bold px-4 py-1.5 rounded-lg border ${borderColor} text-[#FF611D] hover:bg-orange-50 transition-colors`}>
                  Lihat Semua
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className={`border ${borderColor} rounded-xl overflow-hidden hover:shadow-md transition-shadow`}>
                    <div className="h-28 w-full relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className={`font-bold text-sm mb-1 truncate ${textColor}`}>{item.name}</h4>
                      <div className={`text-[10px] space-y-0.5 ${mutedColor}`}>
                        <p>Kategori: {item.category}</p>
                        <p className="truncate">Pengaju: {item.submitter}</p>
                        <p>{item.date}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-[#FF611D] text-white text-[10px] font-bold py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-orange-600">
                          <Check className="w-3 h-3" /> Publish
                        </button>
                        <button className="flex-1 border border-red-200 text-red-500 text-[10px] font-bold py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-red-50">
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className={`${surfaceColor} p-6 rounded-2xl border ${borderColor} shadow-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>User Terbaru</h3>
                <button className={`text-xs font-bold px-4 py-1.5 rounded-lg border ${borderColor} text-[#FF611D] hover:bg-orange-50 transition-colors`}>
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-4">
                {recentUsers.map((user, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${textColor}`}>{user.name}</p>
                      <p className={`text-[11px] truncate ${mutedColor}`}>{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">
                        {user.role}
                      </span>
                      <span className={`text-[10px] ${mutedColor}`}>{user.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
            {/* Active Users Table */}
            <div className={`${surfaceColor} p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>Pengguna Aktif</h3>
                <button className={`text-xs font-bold px-4 py-1.5 rounded-lg border ${borderColor} text-[#FF611D] hover:bg-orange-50 transition-colors`}>
                  Lihat Semua
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className={`border-b ${borderColor} ${mutedColor} text-xs font-semibold`}>
                      <th className="pb-3 font-semibold">Nama</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Bergabung</th>
                      <th className="pb-3 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                    {activeUsers.map((user, i) => (
                      <tr key={i}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full bg-gray-100" />
                            <span className={`font-bold ${textColor}`}>{user.name}</span>
                          </div>
                        </td>
                        <td className={`py-3 ${mutedColor}`}>{user.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            user.role === 'Admin' ? 'bg-orange-100 text-orange-700' :
                            user.role === 'Moderator' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold ${user.status === 'Aktif' ? 'text-green-500' : 'text-red-500'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className={`py-3 ${mutedColor}`}>{user.date}</td>
                        <td className="py-3 text-center">
                          <button className={`${mutedColor} hover:${textColor}`}><MoreVertical className="w-4 h-4 mx-auto" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Roles Table */}
            <div className={`${surfaceColor} p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold italic tracking-tight ${textColor}`}>Role Sistem</h3>
                <button className="bg-[#FF611D] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-md hover:bg-orange-600 transition-colors">
                  <Plus className="w-4 h-4" /> Tambah Role
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className={`border-b ${borderColor} ${mutedColor} text-xs font-semibold`}>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Deskripsi</th>
                      <th className="pb-3 font-semibold">Jumlah User</th>
                      <th className="pb-3 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                    {systemRoles.map((role, i) => (
                      <tr key={i}>
                        <td className={`py-4 font-bold ${textColor}`}>{role.role}</td>
                        <td className={`py-4 ${mutedColor} text-xs truncate max-w-[200px]`}>{role.desc}</td>
                        <td className={`py-4 ${mutedColor}`}>{role.count.toLocaleString()}</td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
