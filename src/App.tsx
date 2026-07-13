/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home, List as MenuIcon, MapPin, Compass, PlusCircle, User, UtensilsCrossed, RefreshCw, Dices, Search, Settings, Rss, X, SlidersHorizontal, Shield, Store, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MapScreen } from './components/MapScreen';
import { ListScreen } from './components/ListScreen';
import { DetailScreen } from './components/DetailScreen';
import { ChatScreen } from './components/ChatScreen';
import { OrderScreen } from './components/OrderScreen';
import { FeedScreen } from './components/FeedScreen';
import { CreateMenuScreen } from './components/CreateMenuScreen';
import { AddFormsScreen } from './components/AddFormsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SpinWheelScreen } from './components/SpinWheelScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { UserManagePlacesScreen } from './components/UserManagePlacesScreen';
import { LandingScreen } from './components/LandingScreen';
import { Restaurant, FoodPost, calculateDistance } from './data/mock';

type ViewMode = 'map' | 'list' | 'detail' | 'chat' | 'order' | 'feed' | 'create_menu' | 'create_resto' | 'create_post' | 'profile' | 'spin' | 'settings' | 'admin' | 'manage_places' | 'edit_resto';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ email: string; role: 'user' | 'admin' } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'auth'>('landing');
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>('login');

  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase belum terkonfigurasi. Silakan tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Settings > Secrets.");
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.email) {
          const { data } = await supabase
            .from('users_auth')
            .select('role')
            .eq('email', session.user.email)
            .single();
          
          setCurrentUser({ 
            email: session.user.email, 
            role: data?.role || 'user' 
          });
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setIsSessionChecked(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && session.user.email) {
        // Prevent unnecessary state updates if we already have the user
        setCurrentUser(prev => {
          if (prev?.email === session.user.email) return prev;
          
          // If different, fetch role and update
          supabase.from('users_auth').select('role').eq('email', session.user.email).single()
            .then(({ data }) => {
              setCurrentUser({ email: session.user.email!, role: data?.role || 'user' });
            });
            
          return { email: session.user.email, role: 'user' }; // Optimistic
        });
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [view, setView] = useState<ViewMode>('list');
  const [prevView, setPrevView] = useState<ViewMode>('list');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [placeToEdit, setPlaceToEdit] = useState<any>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [] as string[],
    minRating: 0,
  });
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [showLoginAdModal, setShowLoginAdModal] = useState(false);
  const [activeAd, setActiveAd] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Error watching position:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const fetchRestaurants = async () => {
    console.log("Fetching restaurants... isConfigured:", isSupabaseConfigured);
    if (!isSupabaseConfigured) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Supabase Call: restaurants with menu_items and reviews");
      // Fetch restaurants with related menu_items and reviews
      const { data: restos, error: restoError } = await supabase
        .from('restaurants')
        .select('*, menu_items(*), reviews(*)');

      if (restoError) {
        console.error("Supabase Error (restaurants):", restoError);
        throw restoError;
      }

      console.log("Mapping restaurants, count:", restos?.length);
      const mappedRestos: Restaurant[] = (restos || []).map(r => ({
        id: r.id,
        name: r.name || 'Unnamed',
        type: r.type || 'Restoran',
        foodCategories: r.food_categories || [],
        rating: r.rating || 0,
        reviewCount: r.review_count || 0,
        distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], r.lat || 0, r.lng || 0) : '---',
        priceRange: r.price_range || '$$',
        address: r.address || '',
        phone: r.phone || '',
        hours: r.hours || '',
        image: r.image || '',
        coords: [r.lat || 0, r.lng || 0] as [number, number],
        isAvailableOnline: r.is_available_online || false,
        submitter_email: r.submitter_email,
        menu: (r.menu_items || []).map((m: any) => ({
          id: m.id,
          name: m.name || 'Menu',
          description: m.description || '',
          price: m.price || 0,
          image: m.image || '',
          category: m.category || 'Main Course',
          rating: m.rating,
          reviewCount: m.review_count
        })),
        reviews: (r.reviews || []).map((rev: any) => ({
          id: rev.id,
          user: rev.user || 'Anonymous',
          rating: rev.rating || 0,
          comment: rev.comment || ''
        }))
      }));

      // Fetch posts
      console.log("Supabase Call: posts");
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error("Supabase Error (posts):", postsError);
        throw postsError;
      }

      console.log("Mapping posts, count:", postsData?.length);

      // Fetch Pro tiers from users_auth to attach to posts
      const { data: proUsers } = await supabase
        .from('users_auth')
        .select('email, tier')
        .eq('tier', 'pro');
      const proEmailSet = new Set(
        (proUsers || []).map((u: any) => u.email?.split('@')[0].toLowerCase())
      );

      const mappedPosts: FoodPost[] = (postsData || []).map(p => ({
        id: p.id,
        user: p.author || 'Anonymous',
        userAvatar: p.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.author}`,
        content: p.content || '',
        image: p.image || '',
        likes: p.likes || 0,
        comments: p.comments || 0,
        timeAgo: p.created_at 
          ? new Date(p.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
          : (p.date || 'Baru Saja'),
        location: p.location,
        isPro: proEmailSet.has((p.author || '').toLowerCase())
      }));

      setRestaurants(mappedRestos);
      setPosts(mappedPosts);
    } catch (err: any) {
      console.error("Supabase Fetch Error:", err);
      setError(err.message || "Gagal menghubungi database Supabase");
    } finally {
      setLoading(false);
    }
  };

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedFeed = async () => {
    setIsSeeding(true);
    try {
      const postsToInsert = [
        {
          author: "Ahmad_Foodie",
          user_avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100",
          content: "Nemu hidden gem nasi goreng rempah porsi kuli di daerah Merjosari! Rempahnya beneran kerasa dan irisan dagingnya nggak pelit. Mantap pol buat makan malam abis nugas! 🤤🍛",
          image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800",
          likes: 124,
          comments: 18,
          date: "2 jam yang lalu",
          location: "Nasi Goreng Rempah Jaya"
        },
        {
          author: "Siti Kulinery",
          user_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
          content: "Cuaca Malang lagi dingin enaknya ngebakso. Kuah kaldu Sengkaling ini beneran the best sih, anget dan gurihnya pas. Tahu baksonya juara! 🍜✨",
          image: "https://images.unsplash.com/photo-1634261899147-ece64a8523c0?auto=format&fit=crop&q=80&w=800",
          likes: 89,
          comments: 5,
          date: "5 jam yang lalu",
          location: "Bakso Sengkaling"
        }
      ];

      // Insert posts schema: table is 'posts' with columns: author, user_avatar, content, image, likes, comments, date, location
      const { error: seedError } = await supabase.from('posts').insert(postsToInsert);
      if (seedError) throw seedError;

      // Seed standard restaurants as well if empty so that the whole app has data!
      const { data: currentRestos } = await supabase.from('restaurants').select('id');
      if (!currentRestos || currentRestos.length === 0) {
        const restosToInsert = [
          {
            name: "Ayam Bawang Cak Per",
            type: "Lalapan",
            food_categories: ["Indonesian", "Ayam", "Sambal", "Lalapan"],
            rating: 4.8,
            review_count: 342,
            price_range: "Rp 15.000 - Rp 35.000",
            address: "Jl. Raya Tlogomas No.12, Malang (Dekat Kampus 3 UMM)",
            phone: "0812-3456-7890",
            hours: "09:00 - 22:00",
            image: "https://images.unsplash.com/photo-1549488344-c1fb6724b07f?auto=format&fit=crop&q=80&w=800",
            lat: -7.921500,
            lng: 112.598000,
            is_available_online: true
          },
          {
            name: "Bakso Sengkaling",
            type: "Bakso",
            food_categories: ["Indonesian", "Soup", "Meatball", "Bakso"],
            rating: 4.6,
            review_count: 521,
            price_range: "Rp 12.000 - Rp 25.000",
            address: "Jl. Raya Sengkaling, Malang",
            phone: "0822-9876-5432",
            hours: "10:00 - 21:00",
            image: "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=800",
            lat: -7.918000,
            lng: 112.601000,
            is_available_online: false
          }
        ];

        for (const item of restosToInsert) {
          const { data: insertedResto, error: rErr } = await supabase.from('restaurants').insert(item).select('id').single();
          if (!rErr && insertedResto) {
            const menuToInsert = [
              {
                restaurant_id: insertedResto.id,
                name: item.type === "Bakso" ? "Bakso Campur" : "Paket Ayam Bawang",
                price: item.type === "Bakso" ? 18000 : 22000,
                image: item.image,
                description: "Menu lezat khas daerah",
                category: "Main Course"
              }
            ];
            await supabase.from('menu_items').insert(menuToInsert);
          }
        }
      }

      await fetchRestaurants();
    } catch (err: any) {
      console.error("Seeding error:", err);
      alert("Gagal melakukan seeding: " + (err.message || err.details || "Pastikan RLS table posts & restaurants dinonaktifkan / diset public anon insert."));
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (restaurants.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const restaurantId = params.get('restaurantId');
      if (restaurantId) {
        const found = restaurants.find(r => r.id === restaurantId);
        if (found) {
          setSelectedRestaurant(found);
          setIsDetailModalOpen(true);
          
          // Clear query parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('restaurantId');
          window.history.replaceState({}, '', url.pathname + url.search);
        }
      }
      
      const postId = params.get('postId');
      if (postId) {
        setView('feed');
      }
    }
  }, [restaurants]);


  const handleUpdateRestaurant = (updated: Restaurant) => {
    setRestaurants(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelectedRestaurant(updated);
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      console.log("Deleting menu items for restaurant_id:", restaurantId);
      const { error: menuError } = await supabase
        .from('menu_items')
        .delete()
        .eq('restaurant_id', restaurantId);
      if (menuError) {
        console.error("Error deleting menu items from Supabase:", menuError);
      }

      console.log("Deleting reviews for restaurant_id:", restaurantId);
      const { error: reviewsError } = await supabase
        .from('reviews')
        .delete()
        .eq('restaurant_id', restaurantId);
      if (reviewsError) {
        console.error("Error deleting reviews from Supabase:", reviewsError);
      }

      console.log("Deleting restaurant of id:", restaurantId);
      const { error: restoError } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);

      if (restoError) {
        throw restoError;
      }

      console.log("Restaurant deleted successfully");
      setIsDetailModalOpen(false);
      setView('list');
      await fetchRestaurants();
    } catch (err: any) {
      console.error("Supabase Delete Error:", err);
      alert("Gagal menghapus tempat kuliner: " + (err.message || "Pastikan policy delete Supabase diizinkan/publik."));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      console.log("Deleting comments for post_id:", postId);
      const { error: commentsError } = await supabase
        .from('post_comments')
        .delete()
        .eq('post_id', postId);
      if (commentsError) {
        console.error("Error deleting post comments:", commentsError);
      }

      console.log("Deleting likes for post_id:", postId);
      const { error: likesError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId);
      if (likesError) {
        console.error("Error deleting post likes:", likesError);
      }

      console.log("Deleting post of id:", postId);
      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (postError) {
        throw postError;
      }

      console.log("Post deleted successfully");
      await fetchRestaurants();
    } catch (err: any) {
      console.error("Supabase Delete Post Error:", err);
      alert("Gagal menghapus postingan: " + (err.message || "Pastikan policy delete Supabase diizinkan/publik."));
    }
  };

  const handleSelectRestaurant = (restaurant: Restaurant, from: 'map' | 'list') => {
    setSelectedRestaurant(restaurant);
    setPrevView(view);
    if (view === 'list' || view === 'spin') {
      setIsDetailModalOpen(true);
    } else {
      setView('detail');
    }
  };

  const handleUpdateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const newQ = Math.max(0, (prev[itemId] || 0) + delta);
      const newCart = { ...prev };
      if (newQ === 0) delete newCart[itemId];
      else newCart[itemId] = newQ;
      return newCart;
    });
  };

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917] text-[#FAF9F6]' : 'bg-white text-[#4B2E2A]'}`}>
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9F6]">
          <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-[#FF611D]" />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter text-[#4B2E2A] mb-2">Konfigurasi Dibutuhkan</h2>
          <p className="text-sm font-bold text-[#78716C] max-w-md mb-8 leading-relaxed">
            {error}
          </p>
          <div className="p-4 bg-white border border-[#E7E5E4] rounded-2xl text-left max-w-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Langkah selanjutnya:</p>
            <ol className="text-xs font-bold text-[#4B2E2A] space-y-2 list-decimal ml-4">
              <li>Buka menu <b>Settings</b> (ikon gerigi) di pojok kiri bawah AI Studio.</li>
              <li>Pilih tab <b>Secrets</b>.</li>
              <li>Tambahkan <b>VITE_SUPABASE_URL</b> dan <b>VITE_SUPABASE_ANON_KEY</b>.</li>
              <li>Refresh halaman ini.</li>
            </ol>
          </div>
        </div>
      ) : (!isSessionChecked || loading) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9F6]">
          <RefreshCw className="w-12 h-12 text-[#FF611D] animate-spin mb-4" />
          <h2 className="text-xl font-black italic tracking-tighter text-[#4B2E2A]">Mencari tempat terbaik...</h2>
        </div>
      ) : !currentUser ? (
        authView === 'landing' ? (
          <LandingScreen 
            onNavigateAuth={(mode) => {
              setInitialAuthMode(mode);
              setAuthView('auth');
            }} 
            isDarkMode={isDarkMode} 
          />
        ) : (
          <LoginScreen 
            initialMode={initialAuthMode}
            onBack={() => setAuthView('landing')}
            onLogin={(role, email) => {
              setCurrentUser({ role, email });
              fetchRestaurants(); // Refetch data to get latest likes and comments
              
              // Trigger pop-up ad
              const savedAd = localStorage.getItem('pro_popup_ad');
              if (savedAd) {
                try {
                  const parsed = JSON.parse(savedAd);
                  if (parsed && parsed.active) {
                    setActiveAd(parsed);
                    setShowLoginAdModal(true);
                  }
                } catch (e) {
                  console.error("Error parsing popup ad", e);
                }
              } else {
                // Seed a default active ad for demo if not configured yet
                const defaultAd = {
                  restaurantId: '',
                  restaurantName: 'Ayam Bawang Cak Per',
                  promoTitle: 'Diskon Spesial 25%!',
                  promoDesc: 'Dapatkan diskon 25% khusus pengguna baru aplikasi Nemuin!',
                  imageUrl: 'https://images.unsplash.com/photo-1549488344-c1fb6724b07f?auto=format&fit=crop&q=80&w=800',
                  active: true
                };
                localStorage.setItem('pro_popup_ad', JSON.stringify(defaultAd));
                setActiveAd(defaultAd);
                setShowLoginAdModal(true);
              }
            }} 
            isDarkMode={isDarkMode} 
          />
        )
      ) : (
        <>
          {/* Top Global Header (Dynamic based on View) */}
      {(view === 'list' || view === 'feed' || view === 'map') && !['settings', 'profile', 'spin', 'admin'].includes(view) && (
        <header className={`shrink-0 z-[120] sticky top-0 transition-colors duration-300 border-b shadow-sm ${isDarkMode ? 'bg-[#1D1B19] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'} backdrop-blur-xl`}>
          <div className="p-4 md:p-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-8 w-full">
            {/* Row 1: Branding and Mobile Actions */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="space-y-0 cursor-pointer group shrink-0" onClick={() => setView('list')}>
                <h1 className={`text-xl md:text-3xl font-black italic tracking-tighter transition-all duration-500 group-hover:text-[#FF611D] ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
                  Nemuin<span className="text-[#FF611D]">.</span>
                </h1>
                <p className={`text-[8px] md:text-[10px] font-bold italic tracking-tight transition-colors leading-none ${isDarkMode ? 'text-[#FAF9F6]/60' : 'text-[#78716C]'}`}>
                  Semuanya pasti ketemu di nemuin
                </p>
              </div>

              {/* Mobile Actions: Lucky Spin, Manage Places, & Profile */}
              <div className="flex items-center gap-2 md:hidden">
                {view === 'list' && (
                  <button 
                    onClick={() => setView('spin')}
                    className="h-10 w-10 bg-[#FF611D] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    title="Lucky Spin"
                  >
                    <Dices className="w-5 h-5 animate-spin-slow" />
                  </button>
                )}
                {view === 'list' && currentUser?.role === 'user' && (
                  <button 
                    onClick={() => setView('manage_places')}
                    className="h-10 w-10 bg-[#FF611D] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    title="Kelola Tempat"
                  >
                    <Store className="w-5 h-5" />
                  </button>
                )}
                {view === 'list' && currentUser?.role === 'admin' && (
                  <button 
                    onClick={() => setView('admin')}
                    className="h-10 w-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                )}
                {view !== 'map' && view !== 'feed' && (
                  <button
                    onClick={() => setView('profile')}
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center border transition-all ${
                      view === 'profile' 
                        ? 'bg-[#FF611D] text-white border-[#FF611D]' 
                        : isDarkMode 
                          ? 'bg-[#262626] border-[#404040] text-[#A8A29E]'
                          : 'bg-white border-[#E7E5E4] text-[#78716C]'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2 (Mobile) / Middle (Desktop): Search & Desktop Spin */}
            <div className="flex-1 flex items-center gap-2 md:gap-4 w-full md:max-w-3xl">
              {/* Search Bar */}
              {(view === 'list' || view === 'map') && (
                <div className={`h-11 md:h-12 flex-1 rounded-2xl border flex items-center px-4 gap-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] transition-all focus-within:ring-2 focus-within:ring-[#FF611D] focus-within:border-transparent focus-within:shadow-xl focus-within:scale-[1.01] ${
                  isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'
                }`}>
                  <Search className="w-4 h-4 text-[#FF611D] shrink-0" />
                  <input 
                    type="text" 
                    placeholder={view === 'map' ? "Cari di peta..." : "Lagi pengen apa?"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-transparent border-none focus:outline-none text-xs md:text-sm font-bold w-full transition-colors ${isDarkMode ? 'text-white placeholder:text-[#525252]' : 'text-[#4B2E2A]'}`}
                  />
                  <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-orange-50'}`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#FF611D]" />
                  </button>
                </div>
              )}

              {/* Desktop Only Lucky Spin Button */}
              {view === 'list' && (
                <button 
                  onClick={() => setView('spin')}
                  className="hidden md:flex h-12 px-6 bg-[#FF611D] text-white rounded-2xl font-black italic tracking-tighter items-center gap-3 shadow-[0_8px_20px_rgba(255,97,29,0.3)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Dices className="w-4 h-4 animate-spin-slow shrink-0" />
                  <span>LUCKY SPIN</span>
                </button>
              )}
            </div>

            {/* Desktop Only Profile Button */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser && (
                <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-wider flex items-center gap-1.5 shadow-sm uppercase ${
                  currentUser.role === 'admin' 
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-500' 
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === 'admin' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  <span>{currentUser.role === 'admin' ? 'Curator (Admin)' : 'Pencinta Kuliner (User)'}</span>
                </div>
              )}
              {currentUser?.role === 'user' && view !== 'map' && view !== 'feed' && (
                <button
                  onClick={() => setView('manage_places')}
                  className="h-10 px-3.5 bg-[#FF611D] text-white rounded-xl text-[10px] font-black italic tracking-tighter flex items-center gap-1.5 shadow-[0_4px_10px_rgba(255,97,29,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase shrink-0"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Kelola Tempat</span>
                </button>
              )}
              {currentUser?.role === 'admin' && view !== 'map' && view !== 'feed' && (
                <button
                  onClick={() => setView('admin')}
                  className="h-10 px-3.5 bg-rose-500 text-white rounded-xl text-[10px] font-black italic tracking-tighter flex items-center gap-1.5 shadow-[0_4px_10px_rgba(244,63,94,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase shrink-0"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              )}
              {view !== 'map' && view !== 'feed' && (
                <button
                  onClick={() => setView('profile')}
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                    view === 'profile' 
                      ? 'bg-[#FF611D] text-white border-[#FF611D]' 
                      : isDarkMode 
                        ? 'bg-[#262626] border-[#404040] text-[#A8A29E] hover:text-[#FF611D]'
                        : 'bg-white border-[#E7E5E4] text-[#78716C] hover:text-[#FF611D]'
                  }`}
                  title="Lihat Profil"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Sidebar Navigation - Full Height (Desktop) */}
        {!['spin', 'create_resto', 'create_post', 'create_menu', 'profile', 'settings', 'detail', 'chat', 'order', 'admin', 'manage_places', 'edit_resto'].includes(view) && !isCommentOpen && (
          <div 
            className={`hidden md:flex flex-col h-full transition-all duration-500 z-[115] border-r w-20 hover:w-64 group/sidebar ${
              isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#F6F1EA] border-[#E7E5E4]'
            }`}
          >
            <div className="flex flex-col h-full py-8 px-3">
              <nav className="flex flex-col gap-4">
                {[
                  { id: 'list', label: 'Home', icon: Home },
                  { id: 'map', label: 'Explore Map', icon: MapPin },
                  { id: 'feed', label: 'Feeds', icon: Rss },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => (
                  <div key={item.id} className="relative group flex items-center">
                    <button
                      onClick={() => { setView(item.id as any); setPrevView('list'); }}
                      className={`flex items-center rounded-2xl transition-all duration-300 font-bold h-12 w-full overflow-hidden ${
                        view === item.id 
                          ? 'bg-[#FF611D] text-white shadow-[0_0_15px_rgba(255,97,29,0.4)]' 
                          : isDarkMode 
                            ? 'text-[#A8A29E] hover:text-[#FF611D] hover:bg-[#404040]'
                            : 'text-[#78716C] hover:text-[#FF611D] hover:bg-white border border-transparent hover:border-[#E7E5E4]'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      
                      {/* Sliding Label on Hover */}
                      <span className="truncate whitespace-nowrap opacity-0 -translate-x-4 invisible group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:w-32 ml-2 transition-all duration-300">
                        {item.label}
                      </span>
                    </button>
                  </div>
                ))}
              </nav>

                {/* Logout Button at Bottom */}
                <div className="mt-auto">
                  <button
                    onClick={() => { setCurrentUser(null); setView('list'); }}
                    className={`flex items-center rounded-2xl transition-all duration-300 font-bold h-12 w-full overflow-hidden ${isDarkMode ? 'text-[#A8A29E] hover:text-[#FF611D] hover:bg-[#404040]' : 'text-[#78716C] hover:text-[#FF611D] hover:bg-white border border-transparent hover:border-[#E7E5E4]'}`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="truncate whitespace-nowrap opacity-0 -translate-x-4 invisible group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:visible group-hover/sidebar:w-32 ml-2 transition-all duration-300">
                      Logout
                    </span>
                  </button>
                </div>
                {/* Mobile/Floating Spin shortcut removed if redundant, but user asked it specifically next to search */}
            </div>
          </div>
        )}

        <main className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Main Content Area */}
            <div className={`w-full h-full overflow-hidden flex flex-col relative z-0 transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
              <div className="flex-1 overflow-hidden relative">
            {view === 'map' && (
              <MapScreen 
                restaurants={restaurants} 
                onSelect={(r) => handleSelectRestaurant(r, 'map')} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenFilters={() => setIsFilterModalOpen(true)}
                userLocation={userLocation}
                isDarkMode={isDarkMode}
              />
            )}
            {view === 'list' && (
              <ListScreen 
                restaurants={restaurants} 
                onSelect={(r) => handleSelectRestaurant(r, 'list')} 
                onOpenSpinWheel={() => setView('spin')}
                userLocation={userLocation}
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={activeFilters}
                onRefresh={fetchRestaurants}
              />
            )}
            {view === 'spin' && (
              <SpinWheelScreen
                restaurants={restaurants}
                onSelect={(r) => handleSelectRestaurant(r, 'list')}
                onBack={() => setView('list')}
                isDarkMode={isDarkMode}
              />
            )}
            {view === 'detail' && selectedRestaurant && (
              <DetailScreen 
                restaurant={selectedRestaurant} 
                onBack={() => setView(prevView)} 
                onChat={() => setView('chat')}
                onUpdateRestaurant={handleUpdateRestaurant}
                onDeleteRestaurant={currentUser?.role === 'admin' ? handleDeleteRestaurant : undefined}
                userLocation={userLocation}
                isDarkMode={isDarkMode}
              />
            )}
            {view === 'chat' && selectedRestaurant && (
              <ChatScreen 
                restaurant={selectedRestaurant} 
                onBack={() => setView('detail')} 
                isDarkMode={isDarkMode}
              />
            )}
            {view === 'order' && selectedRestaurant && (
              <OrderScreen 
                restaurant={selectedRestaurant} 
                cart={cart}
                onBack={() => setView('detail')} 
                onSuccess={() => {
                  setCart({});
                  setView('list');
                }}
                isDarkMode={isDarkMode}
              />
            )}
            {view === 'feed' && (
              <FeedScreen 
                posts={posts} 
                isDarkMode={isDarkMode} 
                onSeed={handleSeedFeed}
                isSeeding={isSeeding}
                onCommentStateChange={setIsCommentOpen}
                currentUser={currentUser}
                onDeletePost={handleDeletePost}
                onRefresh={fetchRestaurants}
              />
            )}
            {view === 'create_menu' && (
              <CreateMenuScreen 
                onSelect={(action) => setView(action === 'add_resto' ? 'create_resto' : 'create_post')} 
                onBack={() => setView(prevView)} 
                isDarkMode={isDarkMode}
                isAdmin={currentUser?.role === 'admin'}
              />
            )}
            {view === 'create_resto' && (
              <AddFormsScreen 
                type="resto" 
                onBack={() => setView('create_menu')} 
                onSuccess={() => {
                  setView('list');
                  fetchRestaurants();
                }} 
                isDarkMode={isDarkMode} 
                currentUser={currentUser}
              />
            )}
            {view === 'create_post' && (
              <AddFormsScreen 
                type="post" 
                onBack={() => setView('create_menu')} 
                onSuccess={() => {
                  setView('feed');
                  fetchRestaurants();
                }} 
                isDarkMode={isDarkMode} 
                currentUser={currentUser}
              />
            )}
            {view === 'profile' && (
              <ProfileScreen 
                isDarkMode={isDarkMode} 
                onBack={() => {
                  setView(prevView);
                  fetchRestaurants();
                }}
                userRole={currentUser?.role}
                userEmail={currentUser?.email}
                onLogout={() => {
                  localStorage.removeItem('user_tier');
                  setCurrentUser(null);
                  setView('list');
                }}
                restaurants={restaurants}
              />
            )}
            {view === 'settings' && (
              <SettingsScreen 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
                onBack={() => setView(prevView)}
                onNavigateProfile={() => setView('profile')}
                onNavigateManagePlaces={() => setView('manage_places')}
                currentUser={currentUser}
              />
            )}
            {view === 'admin' && currentUser?.role === 'admin' && (
              <AdminDashboardScreen 
                isDarkMode={isDarkMode} 
                onBack={() => setView(prevView)}
                currentUser={currentUser}
              />
            )}
            {view === 'manage_places' && (
              <UserManagePlacesScreen 
                isDarkMode={isDarkMode}
                onBack={() => setView('list')}
                currentUserEmail={currentUser?.email}
                onEditPlace={(place) => {
                  setPlaceToEdit(place);
                  setView('edit_resto');
                }}
              />
            )}
            {view === 'edit_resto' && (
              <AddFormsScreen 
                type="resto" 
                editData={placeToEdit}
                onBack={() => setView('manage_places')} 
                onSuccess={() => {
                  setView('manage_places');
                  fetchRestaurants();
                }} 
                isDarkMode={isDarkMode} 
                currentUser={currentUser}
              />
            )}
          </div>
        </div>
      </div>

          {/* Floating Action Button (FAB) for Creating Content */}
          {(view === 'list' || (view === 'feed' && !isCommentOpen)) && (
            <div className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 z-[105] hidden md:flex flex-col gap-4 items-end animate-in slide-in-from-right duration-500">
               {/* Quick Add Label */}
               <div className={`px-4 py-2 rounded-2xl border text-sm font-black italic tracking-tighter shadow-lg transform transition-all hover:scale-110 cursor-pointer hidden md:block ${
                 isDarkMode ? 'bg-[#FF611D] border-[#FF611D] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'
               }`} onClick={() => { setPrevView(view); setView('create_menu'); }}>
                 TAMBAH POST / TEMPAT?
               </div>
               <button 
                onClick={() => { setPrevView(view); setView('create_menu'); }}
                className="w-16 h-16 lg:w-20 lg:h-20 bg-[#FF611D] text-white rounded-[1.75rem] lg:rounded-[2.25rem] flex items-center justify-center shadow-[0_15px_40px_rgba(255,97,29,0.5)] hover:scale-110 active:scale-90 transition-all group"
               >
                 <PlusCircle className="w-8 h-8 lg:w-10 lg:h-10 group-hover:rotate-90 transition-transform duration-300" />
               </button>
            </div>
          )}

          {/* Filter Modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setIsFilterModalOpen(false)}
              />
              <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-300 ${
                isDarkMode ? 'bg-[#1C1917] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'
              }`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black italic tracking-tighter">Filter Makan</h3>
                  <button 
                    onClick={() => setIsFilterModalOpen(false)}
                    className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Price Range */}
                  <div className="space-y-4">
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Range Harga</h4>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                        { id: '0-15000', label: '< Rp 15.000' },
                        { id: '15000-25000', label: 'Rp 15.000 - 25.000' },
                        { id: '25000-35000', label: 'Rp 25.000 - 35.000' },
                        { id: '35000-999999', label: '> Rp 35.000' }
                      ].map((range) => (
                        <button
                          key={range.id}
                          onClick={() => {
                            const newRanges = activeFilters.priceRange.includes(range.id)
                              ? activeFilters.priceRange.filter(r => r !== range.id)
                              : [...activeFilters.priceRange, range.id];
                            setActiveFilters({ ...activeFilters, priceRange: newRanges });
                          }}
                          className={`h-12 rounded-xl text-[10px] font-black italic tracking-tighter border transition-all ${
                            activeFilters.priceRange.includes(range.id)
                              ? 'bg-[#FF611D] border-[#FF611D] text-white'
                              : isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-[#F6F1EA] border-transparent text-[#78716C]'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-4">
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Rating Minimal</h4>
                    <div className="flex gap-2">
                      {[3, 4, 4.5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setActiveFilters({ ...activeFilters, minRating: activeFilters.minRating === rating ? 0 : rating })}
                          className={`flex-1 h-12 rounded-xl text-sm font-black italic tracking-tighter border transition-all ${
                            activeFilters.minRating === rating
                              ? 'bg-[#FF611D] border-[#FF611D] text-white'
                              : isDarkMode ? 'bg-[#262626] border-[#404040] text-[#A8A29E]' : 'bg-[#F6F1EA] border-transparent text-[#78716C]'
                          }`}
                        >
                          ★ {rating}+
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => {
                        setActiveFilters({ priceRange: [], minRating: 0 });
                        setIsFilterModalOpen(false);
                      }}
                      className={`flex-1 h-14 rounded-[1.25rem] font-black italic tracking-tighter transition-all ${
                        isDarkMode ? 'bg-[#404040] text-white hover:bg-[#525252]' : 'bg-[#E7E5E4] text-[#4B2E2A] hover:bg-[#D1D5DB]'
                      }`}
                    >
                      RESET
                    </button>
                    <button 
                      onClick={() => setIsFilterModalOpen(false)}
                      className="flex-1 h-14 bg-[#FF611D] text-white rounded-[1.25rem] font-black italic tracking-tighter shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Popup Modal for Detail Screen (Home Page Only) */}
          {isDetailModalOpen && selectedRestaurant && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-20 animate-in fade-in duration-300">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                onClick={() => setIsDetailModalOpen(false)}
              />
              <div className={`relative w-full max-w-5xl h-[85vh] rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border animate-in zoom-in-95 duration-500 scale-100 ${
                isDarkMode ? 'bg-[#1C1917] border-[#404040]' : 'bg-white border-[#E7E5E4]'
              }`}>
                <DetailScreen 
                  restaurant={selectedRestaurant} 
                  onBack={() => setIsDetailModalOpen(false)} 
                  onChat={() => { setIsDetailModalOpen(false); setView('chat'); }}
                  onUpdateRestaurant={handleUpdateRestaurant}
                  onDeleteRestaurant={currentUser?.role === 'admin' ? handleDeleteRestaurant : undefined}
                  userLocation={userLocation}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}

          {/* Pop-up Ad Modal for Akun Pro (shown on login) */}
          {showLoginAdModal && activeAd && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md" 
                onClick={() => setShowLoginAdModal(false)}
              />
              <div className={`relative w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border animate-in zoom-in-95 duration-300 ${
                isDarkMode ? 'bg-[#1C1917] border-[#404040]' : 'bg-white border-[#E7E5E4]'
              }`}>
                {/* Header Banner */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={activeAd.imageUrl || 'https://images.unsplash.com/photo-1549488344-c1fb6724b07f?auto=format&fit=crop&q=80&w=800'} 
                    alt="Promo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <span className="px-2 py-0.5 bg-[#FF611D] text-white text-[8px] font-black uppercase tracking-wider rounded-full">PRO MEMBER PROMO</span>
                    <h3 className="text-white text-lg font-black mt-1 uppercase tracking-tight">{activeAd.restaurantName}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{activeAd.promoTitle}</h4>
                    <p className={`text-xs font-medium mt-2 leading-relaxed ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>{activeAd.promoDesc}</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowLoginAdModal(false);
                        if (activeAd.restaurantId) {
                          const resto = restaurants.find(r => r.id === activeAd.restaurantId);
                          if (resto) {
                            setSelectedRestaurant(resto);
                            setIsDetailModalOpen(true);
                          } else {
                            // Fallback, if not found, navigate to detail of standard resto
                            const fallbackResto = restaurants[0];
                            if (fallbackResto) {
                              setSelectedRestaurant(fallbackResto);
                              setIsDetailModalOpen(true);
                            }
                          }
                        } else {
                          // Default fallback
                          const fallbackResto = restaurants[0];
                          if (fallbackResto) {
                            setSelectedRestaurant(fallbackResto);
                            setIsDetailModalOpen(true);
                          }
                        }
                      }}
                      className="w-full py-3.5 bg-[#FF611D] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-102 active:scale-95 transition-all shadow-md"
                    >
                      Lihat Tempat Makan
                    </button>
                    <button
                      onClick={() => setShowLoginAdModal(false)}
                      className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isDarkMode ? 'bg-[#262626] text-[#A8A29E] hover:bg-[#333333]' : 'bg-[#F6F1EA] text-[#78716C] hover:bg-[#E7E5E4]'
                      }`}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Bottom Navigation (Fixed) */}
          {view !== 'detail' && view !== 'chat' && view !== 'order' && view !== 'create_resto' && view !== 'create_post' && view !== 'create_menu' && view !== 'spin' && view !== 'admin' && !isCommentOpen && (
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[9999] flex justify-around items-center h-20 px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.1)] border-t backdrop-blur-xl transition-all duration-300 ${
              isDarkMode ? 'bg-[#262626]/90 border-[#404040]' : 'bg-white/90 border-[#E7E5E4]'
            }`}>
              <button 
                onClick={() => { setView('list'); setPrevView('list'); }}
                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${view === 'list' ? 'text-[#FF611D]' : 'text-[#A8A29E]'}`}
              >
                <Home className={`w-6 h-6 mb-1 ${view === 'list' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold text-center">Home</span>
              </button>

              <button 
                onClick={() => { setView('map'); setPrevView('map'); }}
                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${view === 'map' ? 'text-[#FF611D]' : 'text-[#A8A29E]'}`}
              >
                <MapPin className={`w-6 h-6 mb-1 ${view === 'map' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold text-center">Map</span>
              </button>
              
              <button 
                onClick={() => { setPrevView(view); setView('create_menu'); }}
                className="flex items-center justify-center w-14 h-14 bg-[#4B2E2A] text-white rounded-full -translate-y-5 shadow-xl hover:bg-[#FF611D] transition-all duration-300 border-[6px] border-white active:scale-95"
              >
                <PlusCircle className="w-7 h-7" />
              </button>

              <button 
                onClick={() => { setView('feed'); setPrevView('list'); }}
                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${view === 'feed' ? 'text-[#FF611D]' : 'text-[#A8A29E]'}`}
              >
                <Rss className={`w-6 h-6 mb-1 ${view === 'feed' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold text-center">Feed</span>
              </button>

              <button 
                onClick={() => { setView('settings'); setPrevView('list'); }}
                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${view === 'settings' ? 'text-[#FF611D]' : 'text-[#A8A29E]'}`}
              >
                <Settings className={`w-6 h-6 mb-1 ${view === 'settings' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold text-center">Settings</span>
              </button>
            </div>
          )}
        </main>
      </div>
      </>
      )}
    </div>
  );
}

