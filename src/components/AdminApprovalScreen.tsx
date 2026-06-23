import React, { useState } from 'react';
import { Search, Filter, Check, X, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Hourglass } from 'lucide-react';

interface AdminApprovalScreenProps {
  isDarkMode: boolean;
}

const mockApprovals = [
  {
    id: 1,
    name: 'Soto Pak Budi',
    address: 'Jl. Merdeka No. 12,\nJakarta Selatan',
    category: 'Soto',
    categoryColor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
    submitter: 'Aditya Yusuf',
    submitterEmail: 'aditya.yusuf@gmail.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
    date: '23/06/2025',
    time: '10:30',
    status: 'Menunggu',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4b43b3130?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 2,
    name: 'Ayam Goreng Bu Tini',
    address: 'Jl. Kramat Raya No. 45,\nJakarta Pusat',
    category: 'Ayam',
    categoryColor: 'text-red-500 bg-red-50 dark:bg-red-500/10',
    submitter: 'Rina Amelia',
    submitterEmail: 'rina.amelia@gmail.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina',
    date: '23/06/2025',
    time: '09:15',
    status: 'Menunggu',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 3,
    name: 'Mie Ayam Bang Doel',
    address: 'Jl. Suryakencana No. 8,\nBogor',
    category: 'Mie',
    categoryColor: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    submitter: 'Dimas Saputra',
    submitterEmail: 'dimas.saputra@gmail.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimas',
    date: '22/06/2025',
    time: '16:45',
    status: 'Menunggu',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 4,
    name: 'Nasi Goreng Mas Joko',
    address: 'Jl. Pajajaran No. 21,\nBogor',
    category: 'Nasi Goreng',
    categoryColor: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
    submitter: 'Budi Santoso',
    submitterEmail: 'budi.santoso@gmail.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    date: '22/06/2025',
    time: '14:20',
    status: 'Menunggu',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 5,
    name: 'Bakso Beranak Pak Kumis',
    address: 'Jl. Raya Condet No. 33,\nJakarta Timur',
    category: 'Bakso',
    categoryColor: 'text-green-500 bg-green-50 dark:bg-green-500/10',
    submitter: 'Siti Nurhaliza',
    submitterEmail: 'siti.nurhaliza@gmail.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    date: '21/06/2025',
    time: '11:05',
    status: 'Menunggu',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 6,
    name: 'Es Teh Jumbo',
    address: 'Jl. Margonda Raya No. 78,\nDepok',
    category: 'Minuman',
    categoryColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10',
    submitter: 'Andi Wijaya',
    submitterEmail: 'andi.wijaya@gmail.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
    date: '21/06/2025',
    time: '08:50',
    status: 'Menunggu',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=200'
  }
];

export function AdminApprovalScreen({ isDarkMode }: AdminApprovalScreenProps) {
  const [activeTab, setActiveTab] = useState('Semua');

  const tabs = [
    { id: 'Semua', label: 'Semua', count: 18, icon: Filter, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { id: 'Menunggu', label: 'Menunggu', count: 18, icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { id: 'Disetujui', label: 'Disetujui', count: 0, icon: Check, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    { id: 'Ditolak', label: 'Ditolak', count: 0, icon: X, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  ];

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
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} text-sm font-semibold ${mutedColor} hover:${isDarkMode ? 'bg-zinc-800' : 'bg-gray-50'} transition-colors`}>
            <Filter className="w-4 h-4" />
            Semua Status
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${borderColor} ${surfaceColor} w-72`}>
            <Search className={`w-4 h-4 ${mutedColor}`} />
            <input 
              type="text" 
              placeholder="Cari tempat makan atau pengaju..." 
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
              <tbody className="divide-y divide-gray-100 dark:divide-[#404040]">
                {mockApprovals.map((item) => (
                  <tr key={item.id} className={`hover:${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <div>
                          <p className={`font-bold ${textColor} mb-0.5`}>{item.name}</p>
                          <p className={`text-xs ${mutedColor} whitespace-pre-line`}>{item.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.categoryColor}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.submitterAvatar} alt={item.submitter} className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                        <div>
                          <p className={`font-bold text-xs ${textColor}`}>{item.submitter}</p>
                          <p className={`text-[10px] ${mutedColor}`}>{item.submitterEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-bold text-xs ${textColor}`}>{item.date}</p>
                        <p className={`text-[10px] ${mutedColor}`}>{item.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Menunggu' ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' : item.status === 'Disetujui' ? 'text-green-500 bg-green-50 dark:bg-green-500/10' : 'text-red-500 bg-red-50 dark:bg-red-500/10'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF611D] text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm">
                          <Check className="w-3.5 h-3.5" /> Publish
                        </button>
                        <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 ${isDarkMode ? 'bg-transparent hover:bg-red-500/10' : 'bg-white hover:bg-red-50'} text-xs font-bold transition-colors shadow-sm`}>
                          <X className="w-3.5 h-3.5" /> Tolak
                        </button>
                        <button className={`p-1.5 rounded-lg border ${borderColor} ${mutedColor} hover:${textColor} ${isDarkMode ? 'bg-transparent hover:bg-zinc-800' : 'bg-white hover:bg-gray-50'} transition-colors`}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`p-4 border-t ${borderColor} flex items-center justify-between ${isDarkMode ? 'bg-[#262626]' : 'bg-[#FDFCFB]'}`}>
            <p className={`text-xs font-medium ${mutedColor}`}>
              Menampilkan 1 - 6 dari 18 data
            </p>
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
      </div>
    </div>
  );
}
