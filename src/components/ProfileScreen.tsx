import { User, Settings, LogOut, ChevronRight, Award, Heart, MessageSquare, Moon, Sun, ChevronLeft, CreditCard, Edit, Crown, Check, X, Camera, Trophy, MapPin, Settings2, Plus, Store, Clock, Trash2, MessageCircle, Send, ImagePlus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

interface ProfileScreenProps {
  isDarkMode?: boolean;
  onBack?: () => void;
  userRole?: 'user' | 'admin';
  userEmail?: string;
  onLogout?: () => void;
}

export function ProfileScreen({ isDarkMode, onBack, userRole = 'user', userEmail = 'user@nemuin.com', onLogout }: ProfileScreenProps) {
  const [activeSubView, setActiveSubView] = useState<'profile' | 'edit' | 'subscription' | 'account' | 'ad_options' | 'ad_settings' | 'posts'>('profile');
  const [currentTier, setCurrentTier] = useState<'free' | 'lite' | 'pro' | 'business'>(userRole === 'admin' ? 'pro' : 'free');
  
  // Edit Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    email: userEmail,
    phone: '',
    joinDate: '',
    avatar: ''
  });

  const [adSettings, setAdSettings] = useState({
    personalized: true,
    locationBased: true,
    thirdParty: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Post comments state
  const [showPostComments, setShowPostComments] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [loadingPostComments, setLoadingPostComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit post with image state
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostImagePreview, setEditPostImagePreview] = useState<string | null>(null);
  const [editPostImageFile, setEditPostImageFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'prompt' | 'confirm' | 'alert';
    title: string;
    message?: string;
    defaultValue?: string;
    placeholder?: string;
    isPassword?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    onConfirm: (val: string) => void;
    onCancel?: () => void;
  } | null>(null);

  const showModal = (config: Omit<typeof modalConfig, 'isOpen' | 'onConfirm' | 'onCancel'>) => {
    return new Promise<string | null>((resolve) => {
      setModalConfig({
        ...config,
        isOpen: true,
        onConfirm: (val) => {
          setModalConfig(null);
          resolve(val);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(null);
        }
      });
    });
  };

  useEffect(() => {
    if (activeSubView === 'posts') {
      fetchUserPosts();
    }
  }, [activeSubView]);

  const fetchUserPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const authorName = profileData.email?.split('@')[0] || '';
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author', authorName)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUserPosts(data || []);
    } catch (err: any) {
      console.error(err);
      alert('Gagal memuat postingan.');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Format post date from created_at
  const formatPostDate = (createdAt: string | null, fallbackDate?: string) => {
    if (!createdAt) return fallbackDate || 'Baru saja';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setEditPostImagePreview(post.image || null);
    setEditPostImageFile(null);
  };

  const handleSaveEditPost = async () => {
    if (!editingPost) return;
    setSavingEdit(true);
    try {
      let imageUrl = editingPost.image;
      if (editPostImageFile) {
        const fileExt = editPostImageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, editPostImageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const updatePayload: any = { content: editPostContent };
      if (imageUrl !== editingPost.image) updatePayload.image = imageUrl;

      const { error } = await supabase.from('posts').update(updatePayload).eq('id', editingPost.id);
      if (error) throw error;
      setUserPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...updatePayload } : p));
      setEditingPost(null);
      await showModal({ type: 'alert', title: 'Berhasil', message: 'Postingan berhasil diedit!', confirmText: 'OK' });
    } catch (err: any) {
      await showModal({ type: 'alert', title: 'Gagal', message: 'Gagal mengedit postingan: ' + err.message, confirmText: 'Tutup', confirmColor: 'bg-rose-500' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Fetch comments for a specific post
  const fetchPostComments = async (postId: string) => {
    setLoadingPostComments(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setPostComments(data);
      } else {
        setPostComments([]);
      }
    } catch {
      setPostComments([]);
    } finally {
      setLoadingPostComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !showPostComments || !userEmail) return;
    setSubmittingComment(true);
    try {
      const authorName = userEmail.split('@')[0];
      const { data, error } = await supabase.from('post_comments').insert({
        post_id: showPostComments,
        user_email: userEmail,
        user_name: authorName,
        content: commentText.trim()
      }).select().single();

      if (error) throw error;
      setPostComments(prev => [...prev, data]);
      setCommentText('');

      // Update comment count
      const post = userPosts.find(p => p.id === showPostComments);
      if (post) {
        const newCount = (post.comments || 0) + 1;
        await supabase.from('posts').update({ comments: newCount }).eq('id', showPostComments);
        setUserPosts(prev => prev.map(p => p.id === showPostComments ? { ...p, comments: newCount } : p));
      }
    } catch (err: any) {
      console.error('Gagal menambahkan komentar:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteMyPost = async (postId: string) => {
    const confirmed = await showModal({
      type: 'confirm',
      title: 'Hapus Postingan',
      message: 'Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus',
      confirmColor: 'bg-rose-500'
    });
    if (!confirmed) return;
    
    try {
      await supabase.from('post_comments').delete().eq('post_id', postId);
      await supabase.from('post_likes').delete().eq('post_id', postId);
      
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      
      setUserPosts(prev => prev.filter(p => p.id !== postId));
      await showModal({ type: 'alert', title: 'Berhasil', message: 'Postingan berhasil dihapus!', confirmText: 'OK' });
    } catch (err: any) {
      await showModal({ type: 'alert', title: 'Gagal', message: 'Gagal menghapus postingan: ' + err.message, confirmText: 'Tutup', confirmColor: 'bg-rose-500' });
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileData(prev => ({
          ...prev,
          name: user.user_metadata?.name || prev.name,
          bio: user.user_metadata?.bio || prev.bio,
          location: user.user_metadata?.location || prev.location,
          phone: user.user_metadata?.phone || prev.phone,
          avatar: user.user_metadata?.avatar || prev.avatar,
          email: user.email || prev.email,
          joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : prev.joinDate,
        }));
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          avatar: profileData.avatar,
        }
      });
      if (error) {
        alert('Gagal menyimpan profil: ' + error.message);
      } else {
        setActiveSubView('profile');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfileData(prev => ({ ...prev, avatar: data.publicUrl }));
    } catch (error: any) {
      alert('Gagal mengupload gambar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const handleChangeEmail = async () => {
    const newEmail = await showModal({
      type: 'prompt',
      title: 'Ubah Email',
      message: 'Masukkan email baru Anda:',
      defaultValue: profileData.email,
      confirmText: 'Simpan Email'
    });
    if (!newEmail || newEmail === profileData.email) return;

    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setProfileData(prev => ({ ...prev, email: newEmail }));
      await showModal({ type: 'alert', title: 'Berhasil', message: 'Berhasil mengubah email. Anda mungkin perlu melakukan verifikasi pada email baru Anda.', confirmText: 'OK' });
    } catch (err: any) {
      await showModal({ type: 'alert', title: 'Gagal', message: 'Gagal mengubah email: ' + err.message, confirmText: 'Tutup', confirmColor: 'bg-rose-500' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhone = async () => {
    const newPhone = await showModal({
      type: 'prompt',
      title: 'Ubah Nomor HP',
      message: 'Masukkan nomor HP baru Anda:',
      defaultValue: profileData.phone,
      confirmText: 'Simpan Nomor'
    });
    if (!newPhone || newPhone === profileData.phone) return;

    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({ data: { phone: newPhone } });
      if (error) throw error;
      setProfileData(prev => ({ ...prev, phone: newPhone }));
      await showModal({ type: 'alert', title: 'Berhasil', message: 'Berhasil mengubah nomor HP.', confirmText: 'OK' });
    } catch (err: any) {
      await showModal({ type: 'alert', title: 'Gagal', message: 'Gagal mengubah nomor HP: ' + err.message, confirmText: 'Tutup', confirmColor: 'bg-rose-500' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const newPassword = await showModal({
      type: 'prompt',
      title: 'Ubah Kata Sandi',
      message: 'Masukkan kata sandi baru Anda (minimal 8 karakter):',
      isPassword: true,
      confirmText: 'Simpan Sandi'
    });
    if (!newPassword) return;
    
    if (newPassword.length < 8) {
      await showModal({ type: 'alert', title: 'Peringatan', message: 'Kata sandi harus minimal 8 karakter.', confirmText: 'Mengerti', confirmColor: 'bg-amber-500' });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      await showModal({ type: 'alert', title: 'Berhasil', message: 'Berhasil mengubah kata sandi.', confirmText: 'OK' });
    } catch (err: any) {
      await showModal({ type: 'alert', title: 'Gagal', message: 'Gagal mengubah kata sandi: ' + err.message, confirmText: 'Tutup', confirmColor: 'bg-rose-500' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showModal({
      type: 'confirm',
      title: 'Hapus Akun Permanen',
      message: 'Apakah Anda yakin ingin menghapus akun secara permanen? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus Akun',
      confirmColor: 'bg-rose-500'
    });
    if (confirmed) {
      await showModal({ type: 'alert', title: 'Hubungi Tim Dukungan', message: 'Untuk keamanan, penghapusan akun permanen memerlukan verifikasi. Silakan hubungi tim dukungan kami di support@nemuin.com.', confirmText: 'Mengerti' });
    }
  };

  const renderAdOptions = () => (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setActiveSubView('profile')}
    >
      <motion.div 
        className={`w-full max-w-md rounded-[2.5rem] p-6 pb-12 overflow-hidden shadow-2xl relative ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={() => setActiveSubView('profile')}
          className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${isDarkMode ? 'bg-[#1C1917] text-[#A8A29E] hover:text-white' : 'bg-[#FAF9F6] text-[#78716C] hover:text-[#4B2E2A]'}`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-1.5 bg-[#E7E5E4] dark:bg-[#404040] rounded-full mx-auto mb-8" />
        
        <h2 className={`text-xl font-black italic tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>LANGGANAN IKLAN</h2>
        <p className={`text-xs font-bold mb-8 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Kelola bagaimana konten sponsor muncul di aplikasi Anda.</p>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setActiveSubView('subscription')}
            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all group ${
              isDarkMode ? 'bg-[#1C1917] border-[#404040] hover:border-[#FF611D]' : 'bg-[#FAF9F6] border-[#E7E5E4] hover:border-[#FF611D]'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FF611D]/10 flex items-center justify-center text-[#FF611D] mb-4 group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8" />
            </div>
            <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Pilih Paket</span>
            <span className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-[#78716C]' : 'text-[#78716C]'}`}>Bebas iklan & fitur premium</span>
          </button>

          <button 
            onClick={() => setActiveSubView('ad_settings')}
            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all group ${
              isDarkMode ? 'bg-[#1C1917] border-[#404040] hover:border-amber-500' : 'bg-[#FAF9F6] border-[#E7E5E4] hover:border-amber-500'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
              <Settings2 className="w-8 h-8" />
            </div>
            <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Atur Iklan</span>
            <span className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-[#78716C]' : 'text-[#78716C]'}`}>Kustomisasi preferensi iklan</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderAdSettings = () => {
    const isFree = currentTier === 'free';
    
    return (
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className={`fixed inset-0 z-[160] flex flex-col ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}
      >
        <div className={`p-4 flex items-center justify-between border-b mt-10 md:mt-0 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
          <button onClick={() => setActiveSubView('ad_options')} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <h2 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>KUSTOMISASI IKLAN</h2>
            <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${
              currentTier === 'free' ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 
              currentTier === 'lite' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
              currentTier === 'pro' ? 'bg-[#FF611D]/10 text-[#FF611D] border-[#FF611D]/20' :
              'bg-[#4B2E2A]/10 text-[#4B2E2A] border-[#4B2E2A]/20'
            }`}>
              AKUN {currentTier}
            </div>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Promote Place Section */}
          <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF611D]">Promosi Tempat</h3>
              {isFree && (
                <div className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[8px] font-black rounded-full flex items-center gap-1">
                  <X className="w-2.5 h-2.5" />
                  TERKUNCI
                </div>
              )}
            </div>
            
            {isFree ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                  <Store className="w-6 h-6 opacity-30" />
                </div>
                <p className={`text-[10px] font-bold leading-relaxed max-w-[200px] ${isDarkMode ? 'text-[#78716C]' : 'text-[#78716C]'}`}>
                  Berlangganan untuk mulai mempromosikan tempat makan Anda di map dan feed.
                </p>
                <button 
                  onClick={() => setActiveSubView('subscription')}
                  className="mt-4 text-[10px] font-black text-[#FF611D] uppercase tracking-widest border-b border-[#FF611D]"
                >
                  Lihat Paket
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button className={`w-full p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#FF611D]/5 hover:border-[#FF611D] ${
                  isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-[#FF611D]/10 flex items-center justify-center text-[#FF611D]">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Tambah Tempat Promosi</span>
                </button>
                
                <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
                  <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=100" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Warung Ayam Bakar Madu</p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                      <Clock className="w-3 h-3" />
                      Aktif • 12 Hari Lagi
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-[#FF611D]">EDIT</button>
                </div>
              </div>
            )}
          </div>

          <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF611D] mb-6">Preferensi Privasi</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Iklan Personalisasi</p>
                    {isFree && <X className="w-3 h-3 text-rose-500" />}
                  </div>
                  <p className="text-[10px] font-medium text-[#78716C] mt-1">Tampilkan iklan berdasarkan minat dan riwayat pencarian Anda.</p>
                </div>
                <button 
                  disabled={isFree}
                  onClick={() => setAdSettings({...adSettings, personalized: !adSettings.personalized})}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${isFree ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${adSettings.personalized ? 'bg-[#FF611D]' : 'bg-zinc-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${adSettings.personalized ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Iklan Berbasis Lokasi</p>
                    {isFree && <X className="w-3 h-3 text-rose-500" />}
                  </div>
                  <p className="text-[10px] font-medium text-[#78716C] mt-1">Gunakan lokasi Anda untuk merekomendasikan promo terdekat.</p>
                </div>
                <button 
                  disabled={isFree}
                  onClick={() => setAdSettings({...adSettings, locationBased: !adSettings.locationBased})}
                  className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${isFree ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${adSettings.locationBased ? 'bg-[#FF611D]' : 'bg-zinc-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${adSettings.locationBased ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {currentTier === 'business' && (
                <div className="flex items-center justify-between pt-6 border-t border-dashed border-[#E7E5E4] dark:border-[#404040]">
                  <div className="flex-1 pr-4">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-[#FF611D]' : 'text-[#FF611D]'}`}>Nonaktifkan Iklan</p>
                    <p className="text-[10px] font-medium text-[#78716C] mt-1">Sembunyikan semua konten sponsor (Eksklusif Business).</p>
                  </div>
                  <button 
                    onClick={() => setAdSettings({...adSettings, thirdParty: !adSettings.thirdParty})}
                    className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${adSettings.thirdParty ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${adSettings.thirdParty ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              )}
            </div>

            {isFree && (
              <div className="mt-8 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-3">
                <Crown className="w-5 h-5 text-rose-500" />
                <p className="text-[9px] font-bold text-rose-600 leading-tight">Gunakan Akun LITE atau lebih tinggi untuk membuka kontrol privasi penuh.</p>
              </div>
            )}
          </div>

          <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Tentang Iklan</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Data Anda digunakan untuk memberikan pengalaman yang lebih relevan. Kami tidak pernah menjual informasi pribadi Anda kepada pihak ketiga tanpa izin.
            </p>
            <div className="mt-6 flex items-center justify-between pt-6 border-t border-dashed border-[#E7E5E4] dark:border-[#404040]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">Your Ad ID</span>
              <span className={`text-[10px] font-mono font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>MLG-992-0XC-ADV</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEditProfile = () => (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-0 z-[120] flex flex-col ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}
    >
      <div className={`p-4 flex items-center justify-between border-b mt-10 md:mt-0 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
        <button onClick={() => setActiveSubView('profile')} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>EDIT PROFIL</h2>
        <button onClick={handleSaveProfile} disabled={isSaving} className={`font-black italic text-sm tracking-tighter ${isSaving ? 'text-zinc-500' : 'text-[#FF611D]'}`}>
          {isSaving ? 'MENYIMPAN...' : 'SIMPAN'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <label className="cursor-pointer block relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#FF611D]/10 border-4 border-[#FF611D]/20 overflow-hidden relative">
                <img 
                  src={profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.name || 'User'}&background=random`} 
                  alt="Avatar" 
                  className={`w-full h-full object-cover transition-all ${isSaving ? 'opacity-50 blur-sm' : ''}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=random' }}
                />
                {isSaving && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 p-3 bg-[#FF611D] text-white rounded-2xl shadow-lg border-4 border-white dark:border-[#1C1917] active:scale-90 transition-all">
                <Camera className="w-5 h-5" />
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSaving} />
            </label>
          </div>
          <p className="mt-4 text-xs font-bold text-[#78716C]/60 uppercase tracking-widest">Sentuh untuk ganti foto</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Nama Lengkap</label>
            <input 
              type="text" 
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className={`w-full h-14 bg-transparent border-b-2 font-bold px-1 transition-all focus:border-[#FF611D] outline-none ${isDarkMode ? 'text-white border-[#404040]' : 'text-[#4B2E2A] border-[#E7E5E4]'}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Bio</label>
            <textarea 
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className={`w-full min-h-[100px] bg-transparent border-b-2 font-bold px-1 transition-all focus:border-[#FF611D] outline-none resize-none ${isDarkMode ? 'text-white border-[#404040]' : 'text-[#4B2E2A] border-[#E7E5E4]'}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Lokasi</label>
            <input 
              type="text" 
              value={profileData.location}
              onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              className={`w-full h-14 bg-transparent border-b-2 font-bold px-1 transition-all focus:border-[#FF611D] outline-none ${isDarkMode ? 'text-white border-[#404040]' : 'text-[#4B2E2A] border-[#E7E5E4]'}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Nomor HP</label>
            <input 
              type="text" 
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className={`w-full h-14 bg-transparent border-b-2 font-bold px-1 transition-all focus:border-[#FF611D] outline-none ${isDarkMode ? 'text-white border-[#404040]' : 'text-[#4B2E2A] border-[#E7E5E4]'}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSubscription = () => (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-0 z-[120] flex flex-col ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}
    >
      <div className={`p-4 flex items-center justify-between border-b mt-10 md:mt-0 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
        <button onClick={() => setActiveSubView('profile')} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>LANGGANAN IKLAN</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#FF611D]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-[#FF611D]" />
          </div>
          <h3 className={`text-2xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Promosikan Bisnismu</h3>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Tingkatkan visibilitas restoranmu ke jutaan pecinta kuliner.</p>
        </div>

        <div className="flex flex-col gap-4 pb-10">
          {[
            { name: 'Lite', id: 'lite' as const, price: 'IDR 50k', period: '/bulan', color: 'bg-emerald-500', benefits: ['Muncul di atas Feed', 'Badge Verifikasi', 'Analitik Dasar'] },
            { name: 'Pro', id: 'pro' as const, price: 'IDR 150k', period: '/bulan', color: 'bg-[#FF611D]', benefits: ['Semua fitur Lite', 'Highlight di Map', 'Pop-up Rekomendasi', 'Analitik Lanjutan'], recommended: true },
            { name: 'Business', id: 'business' as const, price: 'IDR 400k', period: '/bulan', color: 'bg-[#4B2E2A]', benefits: ['Semua fitur Pro', 'Iklan Full-screen', 'Dukungan Prioritas', 'Kustom Promo'] },
          ].map((plan) => (
            <div key={plan.name} className={`relative p-6 rounded-[2.5rem] border-2 transition-all ${plan.recommended ? 'border-[#FF611D] scale-[1.02]' : isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF611D] text-white text-[10px] font-black uppercase tracking-widest rounded-full">TERPOPULER</div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{plan.name}</h4>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{plan.price}</span>
                    <span className="text-xs font-bold text-[#78716C] ml-1">{plan.period}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${plan.color} rounded-2xl flex items-center justify-center`}>
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#78716C]'}`}>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  setCurrentTier(plan.id);
                  setActiveSubView('profile');
                }}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                plan.id === currentTier ? 'bg-zinc-400 text-white border-none cursor-default' :
                plan.recommended ? 'bg-[#FF611D] text-white' : isDarkMode ? 'bg-[#333333] text-white border border-[#404040]' : 'bg-[#FAF9F6] text-[#4B2E2A] border border-[#E7E5E4]'
              }`}>
                {plan.id === currentTier ? 'PAKET AKTIF' : 'PILIH PAKET'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-0 z-[120] flex flex-col ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}
    >
      <div className={`p-4 flex items-center justify-between border-b mt-10 md:mt-0 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
        <button onClick={() => setActiveSubView('profile')} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>INFORMASI AKUN</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-6">
          <div className={`p-6 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDarkMode ? 'text-[#FF611D]' : 'text-[#FF611D]'}`}>Data Login</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-[#E7E5E4] dark:border-[#404040]">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-[#78716C]' : 'text-[#78716C]'}`}>Email</p>
                  <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{profileData.email}</p>
                </div>
                <button onClick={handleChangeEmail} disabled={isSaving} className="text-[10px] font-black text-[#FF611D] uppercase">Ubah</button>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-dashed border-[#E7E5E4] dark:border-[#404040]">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-[#78716C]' : 'text-[#78716C]'}`}>Nomor HP</p>
                  <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{profileData.phone}</p>
                </div>
                <button onClick={handleChangePhone} disabled={isSaving} className="text-[10px] font-black text-[#FF611D] uppercase">Ubah</button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-[#78716C]' : 'text-[#78716C]'}`}>Terdaftar Sejak</p>
                  <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{profileData.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`}>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDarkMode ? 'text-[#FF611D]' : 'text-[#FF611D]'}`}>Keamanan</h3>
            
            <div className="space-y-4">
              <button onClick={handleChangePassword} disabled={isSaving} className={`w-full p-4 rounded-xl flex items-center justify-between border transition-colors ${isDarkMode ? 'bg-[#1C1917] border-[#404040] hover:bg-[#333333]' : 'bg-white border-[#E7E5E4] hover:bg-[#F6F1EA]'}`}>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Ubah Kata Sandi</span>
                <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
              </button>
            </div>
          </div>

          <button onClick={handleDeleteAccount} className="w-full py-4 text-rose-500 text-[10px] font-black uppercase tracking-widest border-2 border-rose-500/20 rounded-2xl hover:bg-rose-500/5 transition-all">
            HAPUS AKUN PERMANEN
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderPosts = () => (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-0 z-[120] flex flex-col ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}
    >
      <div className={`p-4 flex items-center justify-between border-b mt-10 md:mt-0 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
        <button onClick={() => setActiveSubView('profile')} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>POSTINGAN SAYA</h2>
        <div className="w-10"></div>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
        {isLoadingPosts ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-8 h-8 border-4 border-[#FF611D] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Memuat postingan...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 max-w-sm mx-auto">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${isDarkMode ? 'bg-[#262626] text-[#A8A29E]' : 'bg-[#F6F1EA] text-[#A8A29E]'}`}>
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-black italic tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
              Belum ada postingan
            </h3>
            <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Anda belum membuat postingan apapun. Yuk, bagikan pengalaman kuliner Anda!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto pb-12">
            {userPosts.map(post => (
              <div key={post.id} className={`rounded-[2.5rem] overflow-hidden border transition-all duration-500 flex flex-col h-full group ${
                isDarkMode 
                  ? 'bg-[#262626] border-[#404040] shadow-[0_0_30px_rgba(255,97,29,0.25)] hover:shadow-[0_0_60px_rgba(255,97,29,0.5)] hover:border-[#FF611D]/50' 
                  : 'bg-white border-[#E7E5E4] shadow-[0_15px_40px_rgba(255,97,29,0.15)] hover:shadow-[0_25px_60px_rgba(255,97,29,0.35)] hover:border-[#FF611D]/50'
              }`}>
                {/* Post Header */}
                <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#333333]' : 'border-[#F6F1EA]'}`}>
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.user_avatar} 
                      alt="Avatar" 
                      className={`w-10 h-10 rounded-full object-cover border group-hover:scale-110 group-hover:border-[#FF611D] transition-all duration-300 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`} 
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${post.author}&background=random` }}
                    />
                    <div>
                      <h3 className={`text-sm font-bold hover:underline cursor-pointer transition-all duration-300 group-hover:text-[#FF611D] group-hover:drop-shadow-[0_0_8px_rgba(255,97,29,0.3)] ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{post.author}</h3>
                      <p className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider">{formatPostDate(post.created_at, post.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditPost(post)} 
                      className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FF611D]/20 active:scale-90 transition-all ${isDarkMode ? 'bg-[#333333] hover:text-[#FF611D]' : 'bg-[#F6F1EA] hover:text-[#FF611D]'}`}
                      title="Edit Postingan"
                    >
                      <Edit className="w-4 h-4 text-[#A8A29E] transition-colors group-hover:text-[#FF611D]" />
                    </button>
                    <button 
                      onClick={() => handleDeleteMyPost(post.id)} 
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/25 active:scale-90 transition-all"
                      title="Hapus Postingan"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>

                {/* Post Image */}
                <div className="w-full bg-[#E7E5E4] relative aspect-[4/3] overflow-hidden group">
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' }}
                  />
                  {post.location && (
                    <div className="absolute bottom-4 left-4 bg-[#4B2E2A]/80 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg border border-white/20">
                      <MapPin className="w-3.5 h-3.5 text-[#FF611D]" />
                      {post.location}
                    </div>
                  )}
                </div>

                {/* Post Text */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className={`text-sm leading-relaxed mb-6 line-clamp-3 italic transition-colors ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>"{post.content}"</p>
                  
                  {/* Actions */}
                  <div className={`mt-auto flex items-center justify-between border-t pt-5 ${isDarkMode ? 'border-[#333333]' : 'border-[#F6F1EA]'}`}>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[#78716C]">
                        <Heart className="w-5 h-5" />
                        <span className="text-xs font-bold">{post.likes || 0}</span>
                      </div>
                      <button
                        onClick={() => {
                          setShowPostComments(post.id);
                          fetchPostComments(post.id);
                        }}
                        className="flex items-center gap-2 text-[#78716C] hover:text-[#FF611D] transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-bold">{post.comments || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Post Full Screen */}
      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed inset-0 z-[200] flex flex-col ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}
          >
            <div className={`p-4 flex items-center justify-between border-b mt-10 md:mt-0 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
              <button onClick={() => setEditingPost(null)} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-white border-[#E7E5E4] text-[#78716C]'}`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>EDIT POSTINGAN</h2>
              <button onClick={handleSaveEditPost} disabled={savingEdit} className={`font-black italic text-sm tracking-tighter ${savingEdit ? 'text-zinc-500' : 'text-[#FF611D]'}`}>
                {savingEdit ? 'MENYIMPAN...' : 'SIMPAN'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Editor */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Foto Postingan</label>
                <div className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                  isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#F6F1EA] border-[#E7E5E4]'
                }`}>
                  {editPostImagePreview ? (
                    <img src={editPostImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#A8A29E]">
                      <ImagePlus className="w-10 h-10" />
                      <span className="text-xs font-bold">Pilih Foto</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditPostImageFile(file);
                        const reader = new FileReader();
                        reader.onload = () => setEditPostImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {editPostImagePreview && (
                    <div className="absolute bottom-3 right-3 p-2.5 bg-[#FF611D] text-white rounded-xl shadow-lg border-2 border-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Teks Postingan</label>
                <textarea
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  className={`w-full min-h-[120px] rounded-2xl p-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors resize-y ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#4B2E2A]'}`}
                  placeholder="Tulis konten postingan..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Bottom Sheet */}
      <AnimatePresence>
        {showPostComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-end"
            onClick={() => setShowPostComments(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full rounded-t-3xl h-[75%] flex flex-col shadow-2xl ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header */}
              <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Komentar</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${isDarkMode ? 'bg-[#333333] text-[#A8A29E]' : 'bg-[#F6F1EA] text-[#78716C]'}`}>
                    {postComments.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowPostComments(null)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'bg-[#333333] text-[#78716C] hover:bg-[#404040]' : 'bg-[#F6F1EA] text-[#78716C] hover:bg-[#E7E5E4]'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingPostComments ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#FF611D] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : postComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-[#404040]' : 'text-[#E7E5E4]'}`} />
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-[#78716C]' : 'text-[#A8A29E]'}`}>Belum ada komentar</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#525252]' : 'text-[#D6D3D1]'}`}>Jadilah yang pertama berkomentar!</p>
                  </div>
                ) : (
                  postComments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_name}`}
                        alt=""
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{comment.user_name}</span>
                          <span className="text-[10px] text-[#A8A29E]">{formatPostDate(comment.created_at)}</span>
                        </div>
                        <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-[#D6D3D1]' : 'text-[#57534E]'}`}>{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className={`p-4 border-t flex items-center gap-3 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Tulis komentar..."
                  className={`flex-1 h-11 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white placeholder-[#78716C]' : 'bg-[#F6F1EA] border-[#E7E5E4] text-[#4B2E2A] placeholder-[#A8A29E]'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                />
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || submittingComment}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${commentText.trim() ? 'bg-[#FF611D] text-white' : isDarkMode ? 'bg-[#333333] text-[#78716C]' : 'bg-[#E7E5E4] text-[#A8A29E]'}`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className={`flex-1 w-full flex flex-col h-full overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
      <AnimatePresence>
        {activeSubView === 'edit' && renderEditProfile()}
        {activeSubView === 'subscription' && renderSubscription()}
        {activeSubView === 'account' && renderAccount()}
        {activeSubView === 'ad_options' && renderAdOptions()}
        {activeSubView === 'ad_settings' && renderAdSettings()}
        {activeSubView === 'posts' && renderPosts()}
      </AnimatePresence>

      {/* Header Profile */}
      <div className={`pt-16 pb-8 px-6 border-b flex flex-col items-center relative transition-colors duration-300 ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#F6F1EA] border-[#E7E5E4]'}`}>
        {onBack && (
          <button 
            onClick={onBack}
            className={`absolute top-10 left-6 p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#404040] border-[#525252] text-white hover:bg-[#333333]' : 'bg-white border-[#E7E5E4] text-[#4B2E2A] hover:bg-[#F6F1EA]'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-[#FF611D] p-1 bg-white shadow-lg overflow-hidden">
            <img 
              src={profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.name || 'User'}&background=random`} 
              alt="User" 
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=random' }}
            />
          </div>
          <div className={`absolute bottom-1 right-1 bg-[#FF611D] p-1.5 rounded-full border-2 shadow-sm ${isDarkMode ? 'border-[#262626]' : 'border-white'}`}>
            <Award className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{profileData.name || 'Pengguna Baru'}</h2>
        <p className={`text-sm font-medium transition-colors mb-4 line-clamp-2 px-8 text-center ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
          {profileData.bio || 'Belum ada bio.'} {profileData.location ? `• ${profileData.location}` : ''}
        </p>
        
        <button 
          onClick={() => setActiveSubView('edit')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm ${
            isDarkMode 
              ? 'bg-[#333333] border-[#525252] text-white hover:bg-[#404040]' 
              : 'bg-white border-[#E7E5E4] text-[#4B2E2A] hover:bg-gray-50'
          }`}
        >
          <Edit className="w-3.5 h-3.5 text-[#FF611D]" />
          Edit Profil
        </button>
      </div>

      {/* Profile Sections */}
      <div className="p-4 flex flex-col gap-6 pb-24">
        {/* Menu Section */}
        <div className="space-y-3">
          <h3 className={`px-4 text-[10px] uppercase font-bold tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Menu Utama</h3>
          <div className="flex flex-col gap-2">
            {[
              { icon: User, label: 'Akun', color: 'text-amber-500', action: () => setActiveSubView('account') },
              { icon: Heart, label: 'Postingan', color: 'text-rose-500', action: () => setActiveSubView('posts') },
              { icon: Crown, label: 'Langganan Iklan', color: 'text-[#FF611D]', action: () => setActiveSubView('ad_options') },
              { icon: LogOut, label: 'Keluar', color: 'text-rose-600', action: () => { if (onLogout) onLogout(); } },
            ].map((item, idx) => (
              <button 
                key={idx} 
                onClick={item.action}
                className={`w-full p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all active:scale-95 duration-300 ${
                  isDarkMode 
                    ? 'bg-[#262626] border-[#404040] hover:bg-[#333333]' 
                    : 'bg-white border-[#E7E5E4] hover:bg-[#F6F1EA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'} ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Modal Overlay */}
      <AnimatePresence>
        {modalConfig && modalConfig.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border-t border-l border-white/10 ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}
            >
              <h3 className={`text-lg font-black italic mb-2 tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{modalConfig.title}</h3>
              {modalConfig.message && (
                <p className={`text-xs font-bold leading-relaxed mb-6 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{modalConfig.message}</p>
              )}
              
              {modalConfig.type === 'prompt' && (
                <textarea 
                  autoFocus
                  defaultValue={modalConfig.defaultValue}
                  placeholder={modalConfig.placeholder}
                  id="modal-input"
                  className={`w-full min-h-[50px] rounded-2xl p-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors mb-6 resize-y ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-[#F6F1EA] border-[#E7E5E4] text-[#4B2E2A]'}`}
                  rows={modalConfig.isPassword ? 1 : (modalConfig.defaultValue && modalConfig.defaultValue.length > 50 ? 4 : 2)}
                  style={modalConfig.isPassword ? { resize: 'none' } : {}}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const val = (document.getElementById('modal-input') as HTMLTextAreaElement)?.value;
                      modalConfig.onConfirm(val);
                    }
                  }}
                />
              )}

              <div className="flex gap-3">
                {modalConfig.type !== 'alert' && (
                  <button 
                    onClick={() => modalConfig.onCancel?.()}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${isDarkMode ? 'bg-[#333333] text-[#A8A29E] border-[#404040] hover:bg-[#404040]' : 'bg-[#F6F1EA] text-[#78716C] border-[#E7E5E4] hover:bg-[#E7E5E4]'}`}
                  >
                    {modalConfig.cancelText || 'Batal'}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (modalConfig.type === 'prompt') {
                      const val = (document.getElementById('modal-input') as HTMLTextAreaElement)?.value;
                      modalConfig.onConfirm(val);
                    } else {
                      modalConfig.onConfirm("true");
                    }
                  }}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-white shadow-lg hover:opacity-90 active:scale-95 ${modalConfig.confirmColor || 'bg-[#FF611D] shadow-orange-900/20'}`}
                >
                  {modalConfig.confirmText || 'Simpan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

