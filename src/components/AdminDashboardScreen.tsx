import React, { useState, useEffect } from 'react';
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
  LogOut,
  Menu
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import { AdminApprovalScreen } from './AdminApprovalScreen';
import { AdminKelolaPenggunaScreen } from './AdminKelolaPenggunaScreen';
import { supabase } from '@/lib/supabase';

interface AdminDashboardScreenProps {
  isDarkMode: boolean;
  onBack: () => void;
  currentUser: { email: string; role: string } | null;
}



export function AdminDashboardScreen({ isDarkMode, onBack, currentUser }: AdminDashboardScreenProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingApprovalItems, setPendingApprovalItems] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRestos, setTotalRestos] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States for charts
  const [userChartData, setUserChartData] = useState<any[]>([]);
  const [restoChartData, setRestoChartData] = useState<any[]>([]);
  const [postChartData, setPostChartData] = useState<any[]>([]);

  // States for user tables (connected to database)
  const [dbRecentUsers, setDbRecentUsers] = useState<any[]>([]);
  const [dbAllUsers, setDbAllUsers] = useState<any[]>([]);
  const [dynamicRoles, setDynamicRoles] = useState<{role: string; desc: string; count: number}[]>([]);

  // States for admin profile
  const [adminName, setAdminName] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');

  // Fetch data from database
  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        const { data, error } = await supabase
          .from('pending_places')
          .select('*')
          .eq('status', 'menunggu')
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data) {
          setPendingApprovalItems(data);
        }

        // Get total count of pending approval
        const { count, error: countError } = await supabase
          .from('pending_places')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'menunggu');

        if (!countError && count !== null) {
          setPendingCount(count);
        }

        // Get total users count
        const { data: usersChartRaw, count: usersCount, error: usersError } = await supabase
          .from('users_auth')
          .select('created_at', { count: 'exact' });
        
        if (!usersError && usersCount !== null) {
          setTotalUsers(usersCount);
        }

        // Get total restaurants count
        const { data: restosChartRaw, count: restosCount, error: restosError } = await supabase
          .from('restaurants')
          .select('created_at', { count: 'exact' });

        if (!restosError && restosCount !== null) {
          setTotalRestos(restosCount);
        }

        // Get total reviews count
        const { count: reviewsCount, error: reviewsError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        if (!reviewsError && reviewsCount !== null) {
          setTotalReviews(reviewsCount);
        }

        // Fetch all users for dashboard tables
        const { data: allUsersData, error: allUsersError } = await supabase
          .from('users_auth')
          .select('*')
          .order('created_at', { ascending: false });

        if (!allUsersError && allUsersData) {
          setDbAllUsers(allUsersData);
          setDbRecentUsers(allUsersData.slice(0, 5));

          // Calculate role counts dynamically
          const adminCount = allUsersData.filter((u: any) => u.role === 'admin').length;
          const userCount = allUsersData.filter((u: any) => u.role === 'user' || !u.role).length;
          setDynamicRoles([
            { role: 'Admin', desc: 'Mengelola data, user, approval, dan dashboard', count: adminCount },
            { role: 'User', desc: 'Pengguna biasa yang dapat menambah tempat makan', count: userCount },
          ]);
        }

        // Get posts count and raw data
        const { data: postsChartRaw } = await supabase
          .from('posts')
          .select('created_at');

        // Helper to format chart data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        const processMonthlyData = (rawData: any[], keyName: string) => {
          const counts = Array(12).fill(0);
          rawData?.forEach(item => {
            if (item.created_at) {
              const m = new Date(item.created_at).getMonth();
              counts[m]++;
            }
          });
          return months.map((name, index) => ({
            name,
            [keyName]: counts[index]
          }));
        };

        const processCumulativeData = (rawData: any[], keyName: string) => {
          const counts = Array(12).fill(0);
          rawData?.forEach(item => {
            if (item.created_at) {
              const m = new Date(item.created_at).getMonth();
              counts[m]++;
            }
          });
          let cumulativeSum = 0;
          return months.map((name, index) => {
            cumulativeSum += counts[index];
            return {
              name,
              [keyName]: cumulativeSum
            };
          });
        };

        setUserChartData(processMonthlyData(usersChartRaw || [], 'users'));
        setRestoChartData(processCumulativeData(restosChartRaw || [], 'places'));
        setPostChartData(processMonthlyData(postsChartRaw || [], 'posts'));

        // Get admin profile metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAdminName(user.user_metadata?.name || '');
          setAdminAvatar(user.user_metadata?.avatar || '');
        }


      } catch (err) {
        console.error('Error fetching pending data:', err);
      }
    };

    fetchPendingData();
  }, [activeMenu]);

  const menuItems = [
    { id: 'Dashboard', icon: Home, label: 'Dashboard' },
    { id: 'Approval', icon: Clock, label: 'Approval Tempat Makan' },
    { id: 'KelolaPengguna', icon: Users, label: 'Kelola Pengguna' },
  ];

  const bgColor = isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]';
  const surfaceColor = isDarkMode ? 'bg-[#262626]' : 'bg-white';
  const sidebarBgColor = isDarkMode ? 'bg-[#262626]' : 'bg-[#F6F1EA]';
  const borderColor = isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]';
  const textColor = isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]';
  const mutedColor = isDarkMode ? 'text-[#A8A29E]' : 'text-[#71717A]';

  return (
    <div className={`flex w-full h-full overflow-hidden ${bgColor} text-sm font-sans relative`}>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 ${sidebarBgColor} border-r ${borderColor} flex flex-col h-full z-30 shrink-0 shadow-sm fixed md:relative transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 cursor-pointer flex justify-between items-center" onClick={onBack}>
          <div>
            <h1 className={`text-2xl font-black italic tracking-tighter ${textColor}`}>
            Nemuin<span className="text-[#FF611D]">.</span>
          </h1>
          <p className={`text-[11px] font-medium italic ${mutedColor}`}>Admin Dashboard</p>
          </div>
          <button 
            className={`md:hidden p-2 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-[#333333] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(false);
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveMenu(item.id); setIsMobileMenuOpen(false); }}
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

        <div className={`p-4 border-t ${borderColor} mx-4 my-2 flex flex-col gap-3`}>
          <div className={`p-3 rounded-xl flex items-center gap-3 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
            <img 
              src={adminAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'Admin'}`} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-orange-200 bg-orange-50 shrink-0 object-cover"
            />
            <div className="overflow-hidden">
              <p className={`font-bold truncate text-xs ${textColor}`}>{adminName || currentUser?.email?.split('@')[0] || 'Admin User'}</p>
              <p className={`text-[10px] ${mutedColor} truncate capitalize`}>{currentUser?.role || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-rose-500 hover:bg-rose-500/10 cursor-pointer text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Menu Utama</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className={`md:hidden flex items-center justify-between p-4 border-b ${borderColor} ${isDarkMode ? 'bg-[#1C1917]/90' : 'bg-white/90'} sticky top-0 z-10 backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className={`p-2.5 rounded-2xl border transition-all shadow-sm active:scale-95 ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-[#F6F1EA] border-[#E7E5E4] text-[#78716C]'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className={`text-xl font-black italic tracking-tighter leading-none ${textColor}`}>
                Nemuin<span className="text-[#FF611D]">.</span>
              </h1>
              <span className={`text-[9px] font-black tracking-widest uppercase mt-0.5 ${mutedColor}`}>Admin Panel</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-full border-2 ${isDarkMode ? 'border-[#404040]' : 'border-orange-200'} overflow-hidden shrink-0 shadow-sm`}>
             <img src={adminAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'Admin'}`} alt="Admin" className="w-full h-full object-cover" />
          </div>
        </div>

        {activeMenu === 'Dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Total Pengguna', value: String(totalUsers), subtitle: 'Terdaftar di database', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50', trend: null },
              { title: 'Total Tempat Makan', value: String(totalRestos), subtitle: 'Dipublish', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50', trend: null },
              { title: 'Pending Approval', value: String(pendingCount), subtitle: 'Menunggu ACC', icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-50', trend: false },
              { title: 'Total Review', value: String(totalReviews), subtitle: 'Ulasan terkumpul', icon: Star, color: 'text-green-500', bg: 'bg-green-50', trend: null },
            ].map((card, i) => (
              <div key={i} className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} flex items-center gap-4 md:gap-5 shadow-sm`}>
                <div className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 ${card.bg}`}>
                  <card.icon className={`w-5 h-5 md:w-7 md:h-7 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs md:text-sm font-semibold ${mutedColor} mb-0.5 md:mb-1 truncate`}>{card.title}</p>
                  <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${textColor}`}>{card.value}</h3>
                  <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                    {card.trend === true && <TrendingUp className="w-3 h-3 text-green-500" />}
                    <span className={`text-[10px] md:text-[11px] font-medium ${card.trend === true ? 'text-green-500' : card.trend === false ? 'text-orange-500' : mutedColor}`}>
                      {card.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Bar Chart - User Baru */}
            <div className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>User Baru Per Bulan</h3>
              </div>
              <div className="h-48 md:h-64 -ml-4 md:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#404040' : '#E5E7EB'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} />
                    <RechartsTooltip cursor={{ fill: isDarkMode ? '#404040' : '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="users" fill="#FF611D" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart - Tempat Makan */}
            <div className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>Tempat Makan Dipublish</h3>
              </div>
              <div className="h-48 md:h-64 -ml-4 md:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={restoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#404040' : '#E5E7EB'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="places" stroke="#FF611D" strokeWidth={3} dot={{ r: 4, fill: '#FF611D', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart - Growth Resto */}
            <div className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>Pertumbuhan Resto</h3>
              </div>
              <div className="h-48 md:h-64 -ml-4 md:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={postChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF611D" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#FF611D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#404040' : '#E5E7EB'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#A8A29E' : '#6B7280' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="posts" stroke="#FF611D" fillOpacity={1} fill="url(#colorPosts)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Approvals & Recent Users */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            <div className={`xl:col-span-2 ${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>Menunggu Persetujuan</h3>
                <button 
                  onClick={() => setActiveMenu('Approval')}
                  className="text-xs font-bold text-[#FF611D] hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${borderColor} ${mutedColor} text-xs uppercase tracking-wider`}>
                        <th className="pb-3 font-semibold min-w-[150px]">Nama Tempat</th>
                        <th className="pb-3 font-semibold min-w-[120px]">Kategori</th>
                        <th className="pb-3 font-semibold min-w-[100px]">Tipe</th>
                        <th className="pb-3 font-semibold min-w-[120px]">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {pendingApprovalItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                          <td className="py-3 font-bold text-sm">{item.name}</td>
                          <td className="py-3 text-xs">{item.type}</td>
                          <td className="py-3 text-xs">{item.category}</td>
                          <td className="py-3 text-xs">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm`}>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>User Terbaru</h3>
                <button 
                  onClick={() => setActiveMenu('KelolaPengguna')}
                  className="text-xs font-bold text-[#FF611D] hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                {dbRecentUsers.length > 0 ? dbRecentUsers.map((user: any, i: number) => (
                  <div key={user.id || i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                      <Users className={`w-4 h-4 md:w-5 md:h-5 ${mutedColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs md:text-sm font-bold truncate ${textColor}`}>{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      <span className={`text-[10px] ${mutedColor} hidden sm:inline`}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className={`text-xs text-center py-4 ${mutedColor}`}>Belum ada pengguna terdaftar.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {dynamicRoles.map((roleInfo, i) => (
              <div key={i} className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm flex items-center justify-between gap-4`}>
                <div>
                  <p className={`text-xs ${mutedColor}`}>{roleInfo.role}</p>
                  <p className={`text-xl font-black ${textColor}`}>{roleInfo.count}</p>
                </div>
                <div className="text-xs text-orange-500 font-medium">{roleInfo.desc}</div>
              </div>
            ))}
          </div>

          {/* Pengguna Terdaftar Row */}
          <div className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>Pengguna Terdaftar</h3>
              <button 
                  onClick={() => setActiveMenu('KelolaPengguna')}
                  className="text-xs font-bold text-[#FF611D] hover:underline"
                >
                  Lihat Detail
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-4 md:px-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${borderColor} ${mutedColor} text-xs uppercase tracking-wider`}>
                      <th className="pb-3 font-semibold min-w-[150px]">Email</th>
                      <th className="pb-3 font-semibold min-w-[100px]">Role</th>
                      <th className="pb-3 font-semibold min-w-[120px]">Tanggal Bergabung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {dbAllUsers.length > 0 ? dbAllUsers.slice(0, 5).map((user: any, i: number) => (
                      <tr key={user.id || i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
                              <Users className={`w-3 h-3 ${mutedColor}`} />
                            </div>
                            <span className={`font-bold ${textColor}`}>{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className={`py-3 ${mutedColor}`}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className={`py-8 text-center text-xs ${mutedColor}`}>Belum ada data pengguna.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

            {/* System Roles Table */}
            <div className={`${surfaceColor} p-4 md:p-6 rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className={`text-sm md:text-lg font-bold italic tracking-tight ${textColor}`}>Role Sistem</h3>
              </div>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className={`border-b ${borderColor} ${mutedColor} text-xs font-semibold uppercase tracking-wider`}>
                        <th className="pb-3 font-semibold min-w-[80px]">Role</th>
                        <th className="pb-3 font-semibold min-w-[150px]">Deskripsi</th>
                        <th className="pb-3 font-semibold min-w-[100px]">Jumlah User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                      {dynamicRoles.map((role, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                          <td className="py-3 md:py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              role.role === 'Admin' ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50'
                            }`}>
                              {role.role}
                            </span>
                          </td>
                          <td className={`py-3 md:py-4 ${mutedColor} text-xs truncate max-w-[200px]`}>{role.desc}</td>
                          <td className={`py-3 md:py-4 font-bold ${textColor}`}>{role.count.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeMenu === 'Approval' && (
          <AdminApprovalScreen isDarkMode={isDarkMode} currentUserEmail={currentUser?.email} />
        )}

        {activeMenu === 'KelolaPengguna' && (
          <AdminKelolaPenggunaScreen isDarkMode={isDarkMode} />
        )}

        {activeMenu !== 'Dashboard' && activeMenu !== 'Approval' && activeMenu !== 'KelolaPengguna' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <h2 className={`text-2xl font-bold ${textColor}`}>Segera Hadir</h2>
            <p className={`${mutedColor} mt-2`}>Fitur ini sedang dalam tahap pengembangan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
