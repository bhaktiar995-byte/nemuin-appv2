import { useState, FormEvent, useEffect } from 'react';
import { ChevronLeft, Camera, Send, Store, Plus, Trash2, ImagePlus, MapPin, Locate, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  id: string;
  name: string;
  price: string;
  image: string | null;
}

interface MockFormProps {
  type: 'resto' | 'post';
  onBack: () => void;
  onSuccess: () => void;
  isDarkMode?: boolean;
  currentUser?: { email: string; role: 'user' | 'admin' } | null;
  editData?: any;
}

const pickerIcon = L.divIcon({
  className: 'bg-transparent',
  html: `
    <div class="relative flex flex-col items-center justify-center">
      <div class="w-10 h-10 bg-[#FF611D] rounded-full shadow-lg border-4 border-white flex items-center justify-center animate-bounce">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
      <div class="w-1 h-3 bg-[#FF611D] -mt-1 rounded-full"></div>
    </div>
  `,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
});

function MapClickHandler({ onClick }: { onClick: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  map.setView(position);
  return null;
}

function LocateControl({ onLocationFound, isDarkMode }: { onLocationFound: (latlng: [number, number]) => void, isDarkMode?: boolean }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
  };

  useMapEvents({
    locationfound(e) {
      setLocating(false);
      onLocationFound([e.latlng.lat, e.latlng.lng]);
    },
    locationerror() {
      setLocating(false);
      alert("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.");
    }
  });

  return (
    <button
      type="button"
      onClick={handleLocate}
      className={`absolute bottom-5 right-5 z-[1000] w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${
        isDarkMode ? 'bg-[#1C1917] text-[#FF611D] border border-white/10' : 'bg-white text-[#FF611D] border border-black/5'
      }`}
    >
      <Locate className={`w-6 h-6 ${locating ? 'animate-spin' : ''}`} />
    </button>
  );
}

export function AddFormsScreen({ type, onBack, onSuccess, isDarkMode, currentUser, editData }: MockFormProps) {
  const [loading, setLoading] = useState(false);
  
  const initialCategory = editData?.type || 'Lalapan';
  const isStandardCategory = ['Lalapan', 'Ayam', 'Bakso', 'Nasi Goreng', 'Mie'].includes(initialCategory);
  
  const [selectedCategory, setSelectedCategory] = useState(isStandardCategory ? initialCategory : 'Lainnya');
  const [customCategory, setCustomCategory] = useState(!isStandardCategory ? initialCategory : '');
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([editData?.lat || -7.921323, editData?.lng || 112.599587]);
  const [restoImage, setRestoImage] = useState<string | null>(editData?.image || null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  
  const initialMenuItems = editData?.menu_items?.length 
    ? editData.menu_items.map((m: any) => ({
        id: crypto.randomUUID(),
        name: m.name || '',
        price: (m.price || 0).toString(),
        image: m.image || null
      }))
    : [{ id: crypto.randomUUID(), name: '', price: '', image: null }];
    
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [menuFiles, setMenuFiles] = useState<Record<string, File>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helper to upload image to Supabase Storage
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Try to get initial location
  useEffect(() => {
    if (navigator.geolocation && type === 'resto') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCoords([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Fallback handled by default state
        }
      );
    }
  }, [type]);

  const addMenuItem = () => {
    setMenuItems([...menuItems, { id: crypto.randomUUID(), name: '', price: '', image: null }]);
  };

  const removeMenuItem = (id: string) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: any) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      let imageUrl = '';
      if (mainImageFile) {
        imageUrl = await uploadImage(mainImageFile);
      }

      if (type === 'resto') {
        const categories = selectedCategory === 'Lainnya' ? [customCategory] : [selectedCategory];
        
        // Build menu items as JSONB array for pending_places
        const menuJsonb = await Promise.all(menuItems.map(async (item) => {
          let itemImageUrl = '';
          if (menuFiles[item.id]) {
            itemImageUrl = await uploadImage(menuFiles[item.id]);
          }
          return {
            name: item.name,
            price: parseFloat(item.price.replace(/[^\d]/g, '') || "0"),
            image: itemImageUrl,
            description: '',
            category: 'Main Course'
          };
        }));

        const submitterName = currentUser?.email?.split('@')[0] || 'User';

        const payload = {
          name: formData.get('nama_tempat'),
          type: categories[0],
          food_categories: categories,
          address: formData.get('alamat'),
          lat: selectedCoords[0],
          lng: selectedCoords[1],
          price_range: formData.get('rentang_harga'),
          phone: formData.get('phone'),
          hours: formData.get('hours'),
          submitter_email: currentUser?.email || 'unknown@email.com',
          submitter_name: submitterName,
          status: 'menunggu',
          menu_items: menuJsonb,
          ...(imageUrl ? { image: imageUrl } : {}) // keep old image if no new image uploaded
        };

        if (editData) {
          const { error: pendingError } = await supabase
            .from('pending_places')
            .update(payload)
            .eq('id', editData.id);
          if (pendingError) throw pendingError;
        } else {
          const { error: pendingError } = await supabase
            .from('pending_places')
            .insert(payload);
          if (pendingError) throw pendingError;
        }

        setShowSuccessModal(true);
      } else {
        // Extract display name from email or use default
        const authorName = currentUser?.email?.split('@')[0] || 'Community User';
        
        // Insert Post
        const { error: postError } = await supabase.from('posts').insert({
          content: formData.get('content'),
          image: imageUrl,
          author: authorName,
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
          likes: 0,
          comments: 0,
          date: 'Baru saja',
          location: formData.get('tagged_resto') || ''
        });
        if (postError) throw postError;
        
        onSuccess();
      }
    } catch (err) {
      console.error("Supabase Error detail:", err);
      alert("Gagal menyimpan data ke Supabase. Pastikan tabel dan bucket 'images' sudah dibuat dan memiliki izin RLS yang benar.");
    } finally {
      setLoading(false);
    }
  };

  const isResto = type === 'resto';

  return (
    <div className={`flex-1 w-full flex flex-col h-full overflow-y-auto pb-safe transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
      <div className={`pt-10 px-4 pb-4 sticky top-0 z-10 border-b flex items-center justify-between shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#F6F1EA] border-[#E7E5E4]'}`}>
        <button onClick={onBack} className={`w-10 h-10 flex items-center justify-center transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className={`text-lg font-bold italic transition-colors ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
          {isResto ? (editData ? 'Edit Tempat Makan' : 'Tambah Tempat Makan') : 'Post Tempat Makan'}
        </h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6">
        {/* Image Picker for both Resto & Post */}
        <div className={`w-full h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
          isDarkMode 
            ? 'bg-[#262626] border-[#404040] text-[#A8A29E] hover:bg-[#333333]' 
            : 'bg-[#F6F1EA] border-[#A8A29E] text-[#78716C] hover:bg-[#E7E5E4]'
        }`}>
          {restoImage ? (
            <img src={restoImage} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-sm font-bold">
                {isResto ? 'Ambil Foto Restauran' : 'Ambil Foto Postingan'}
              </span>
            </>
          )}
          <input 
            type="file" 
            name="main_image"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setMainImageFile(file);
                try {
                  const base64 = await fileToBase64(file);
                  setRestoImage(base64);
                } catch (err) {
                  console.error("Error converting image:", err);
                }
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          {type === 'resto' ? (
            <>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Nama Tempat</label>
                <input name="nama_tempat" required defaultValue={editData?.name || ''} type="text" placeholder="Cth: Ayam Bakar Pak Kumis" className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Kategori (Pilih salah satu)</label>
                <select 
                  name="kategori"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`}
                >
                  <option>Lalapan</option>
                  <option>Ayam</option>
                  <option>Bakso</option>
                  <option>Nasi Goreng</option>
                  <option>Mie</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              {selectedCategory === 'Lainnya' && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Ketik Kategori Baru</label>
                  <input 
                    name="custom_kategori"
                    required 
                    type="text" 
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Cth: Seafood, Vegan, dll" 
                    className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} 
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Alamat Lengkap</label>
                <input name="alamat" required defaultValue={editData?.address || ''} type="text" placeholder="Detail lokasi / patokan" className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 flex items-center gap-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                  <MapPin className="w-3 h-3" /> Pilih Lokasi di Maps
                </label>
                <div className={`w-full h-56 rounded-2xl overflow-hidden border relative group ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
                  <MapContainer 
                    center={selectedCoords} 
                    zoom={16} 
                    scrollWheelZoom={false}
                    dragging={true}
                    className="w-full h-full z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={selectedCoords} icon={pickerIcon} />
                    <MapClickHandler onClick={setSelectedCoords} />
                    <LocateControl onLocationFound={setSelectedCoords} isDarkMode={isDarkMode} />
                    <RecenterMap position={selectedCoords} />
                  </MapContainer>
                  <div className={`absolute top-2 left-2 z-[1000] rounded-lg px-3 py-1.5 border shadow-sm pointer-events-none backdrop-blur ${
                    isDarkMode ? 'bg-[#1C1917]/90 border-[#404040]' : 'bg-white/90 border-[#E7E5E4]'
                  }`}>
                    <p className={`text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>TAP PADA PETA UNTUK PIN LOKASI</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#A8A29E] pl-1 font-bold">
                  KOORDINAT: {selectedCoords[0].toFixed(6)}, {selectedCoords[1].toFixed(6)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Rentang Harga (Cth: Rp. 20rb - 50rb)</label>
                <input name="rentang_harga" required defaultValue={editData?.price_range || ''} type="text" placeholder="Cth: 15.000 - 30.000" className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Nomor Telepon (WhatsApp diutamakan)</label>
                <input name="phone" required defaultValue={editData?.phone || ''} type="tel" placeholder="Cth: 08123456789" className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Jam Operasional</label>
                <input name="hours" required defaultValue={editData?.hours || ''} type="text" placeholder="Cth: 08:00 - 21:00" className={`w-full h-12 rounded-xl px-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
              </div>

              {/* Dynamic Menu Items */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between px-1">
                  <label className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Daftar Menu & Foto</label>
                  <button 
                    type="button"
                    onClick={addMenuItem}
                    className="text-[#FF611D] text-xs font-black italic flex items-center gap-1 hover:scale-105 transition-transform"
                  >
                    <Plus className="w-3 h-3" /> TAMBAH MENU
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {menuItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-2xl border flex flex-col gap-3 relative animate-in slide-in-from-right-2 duration-300 ${
                        isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
                      }`}
                    >
                      {menuItems.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeMenuItem(item.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      
                      <div className="flex gap-3">
                        {/* Menu Image Picker */}
                        <div className={`w-20 h-20 shrink-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
                          isDarkMode 
                            ? 'bg-[#333333] border-[#404040] text-[#A8A29E]' 
                            : 'bg-white border-[#A8A29E] text-[#78716C]'
                        }`}>
                          <ImagePlus className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold">Foto</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setMenuFiles(prev => ({ ...prev, [item.id]: file }));
                                try {
                                  const base64 = await fileToBase64(file);
                                  updateMenuItem(item.id, 'image', base64);
                                } catch (err) {
                                  console.error("Error converting image:", err);
                                }
                              }
                            }}
                          />
                          {item.image && (
                            <img src={item.image} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                          <input 
                            required 
                            type="text" 
                            placeholder="Nama Menu (Cth: Nasi Goreng Spesial)" 
                            value={item.name}
                            onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                            className={`w-full h-9 rounded-lg px-3 text-xs font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} 
                          />
                          <input 
                            required 
                            type="text" 
                            placeholder="Harga (Cth: 15.000)" 
                            value={item.price}
                            onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)}
                            className={`w-full h-9 rounded-lg px-3 text-xs font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Tulis Postingan Tempat Makan</label>
                <textarea name="content" required placeholder="Wah gila bener ini ayamnya..." className={`w-full h-32 rounded-xl p-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] resize-none transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-xs font-bold uppercase tracking-widest pl-1 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>Tandai Lokasi (Opsional)</label>
                <div className="relative">
                  <Store className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                  <input name="tagged_resto" type="text" placeholder="Cari nama resto..." className={`w-full h-12 rounded-xl pl-10 pr-4 text-sm font-medium border focus:outline-none focus:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`} />
                </div>
              </div>
            </>
          )}
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className={`mt-4 w-full h-14 bg-[#FF611D] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-all disabled:opacity-50 ${isDarkMode ? 'shadow-orange-900/40' : ''}`}
        >
          {loading ? 'Menyimpan...' : (
            <>
              {isResto ? 'Kirim Pendaftaran' : 'Posting Sekarang'}
              <Send className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#262626] border border-[#404040]' : 'bg-white border border-[#E7E5E4]'}`}>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className={`text-2xl font-black italic tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Berhasil!</h2>
            <p className={`text-sm mb-8 ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Tempat makan berhasil diajukan. Kami akan meninjaunya terlebih dahulu sebelum dipublikasikan.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onSuccess();
              }}
              className="w-full h-12 bg-[#FF611D] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
