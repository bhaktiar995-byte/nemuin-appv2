import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Share2, UtensilsCrossed, X, Send, RefreshCw, Check, Trash2 } from 'lucide-react';
import { FoodPost } from '../data/mock';
import { supabase } from '../lib/supabase';

interface FeedScreenProps {
  posts: FoodPost[];
  isDarkMode?: boolean;
  onSeed?: () => Promise<void>;
  isSeeding?: boolean;
  onCommentStateChange?: (isOpen: boolean) => void;
  currentUser?: { email: string; role: 'user' | 'admin' } | null;
  onDeletePost?: (postId: string) => Promise<void>;
}

export function FeedScreen({ posts, isDarkMode, onSeed, isSeeding, onCommentStateChange, currentUser, onDeletePost }: FeedScreenProps) {
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [localPosts, setLocalPosts] = useState<FoodPost[]>(posts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShare = async (postId: string, postTitle: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?postId=${postId}`;
    const shareData = {
      title: 'Postingan Kuliner Nemuin',
      text: `Lihat postingan kuliner seru dari "${postTitle}" di Nemuin! 🤤`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  useEffect(() => {
    if (localPosts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('postId');
      if (postId && localPosts.some(p => p.id === postId)) {
        setShowComments(postId);
        // Clear query parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('postId');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [localPosts]);
  
  const getLikesKey = () => `nemuin_likes_${currentUser?.email || 'guest'}`;

  // Track likes: session set + DB-backed persistence + localStorage fallback
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(() => {
    // Only initialized initially, effect below syncs with specific user
    return new Set();
  });
  const [likesTableExists, setLikesTableExists] = useState(true);

  // Sync likes from local storage on user change
  useEffect(() => {
    const saved = localStorage.getItem(getLikesKey());
    if (saved) {
      setLikedPostIds(new Set(JSON.parse(saved)));
    } else {
      setLikedPostIds(new Set());
    }
  }, [currentUser?.email]);

  // Comments: DB comments + local optimistic comments as fallback
  const [dbComments, setDbComments] = useState<any[]>([]);
  const [localComments, setLocalComments] = useState<Record<string, Array<{id: string, user: string, text: string, time: string}>>>(() => {
    const saved = localStorage.getItem('nemuin_comments');
    return saved ? JSON.parse(saved) : {};
  });
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsTableWorks, setCommentsTableWorks] = useState(true);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Try to load user's liked posts from database on mount
  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!currentUser?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_email', currentUser.email);
        
        if (error) {
          console.warn('post_likes table not available, using session-only likes:', error.message);
          setLikesTableExists(false);
        } else if (data && data.length > 0) {
          // Merge DB likes with local storage likes to prevent data loss if DB insert failed previously
          setLikedPostIds(prev => {
            const merged = new Set(prev);
            data.forEach((like: any) => merged.add(like.post_id));
            localStorage.setItem(getLikesKey(), JSON.stringify(Array.from(merged)));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Failed to fetch user likes, falling back to session-only:', err);
        setLikesTableExists(false);
      }
    };

    fetchUserLikes();
  }, [currentUser?.email]);

  // Fetch comments when comments view is opened
  useEffect(() => {
    const fetchComments = async () => {
      if (!showComments) {
        setDbComments([]);
        return;
      }
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('post_comments')
          .select('*')
          .eq('post_id', showComments)
          .order('created_at', { ascending: true });        
        if (!error && data) {
          const mappedData = data.map(c => ({
            ...c,
            author: c.author || c.author_name || 'Anonim'
          }));
          setDbComments(mappedData);
          setCommentsTableWorks(true);
        } else {
          console.warn('Error fetching comments:', error?.message);
          setCommentsTableWorks(false);
        }
      } catch (err) {
        console.warn('Failed to fetch comments from database:', err);
        setCommentsTableWorks(false);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [showComments]);

  useEffect(() => {
    onCommentStateChange?.(showComments !== null);
  }, [showComments, onCommentStateChange]);

  const selectedPost = localPosts.find(p => p.id === showComments);

  const handleLike = async (postId: string) => {
    const postToUpdate = localPosts.find(p => p.id === postId);
    if (!postToUpdate) return;

    const isLiking = !likedPostIds.has(postId);
    const currentLikes = parseInt(postToUpdate.likes as any) || 0;
    const newLikes = isLiking ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    // Update local state immediately
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (isLiking) {
        next.add(postId);
      } else {
        next.delete(postId);
      }
      localStorage.setItem(getLikesKey(), JSON.stringify(Array.from(next)));
      return next;
    });
    
    setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));

    // Try to persist to database
    try {
      // Update likes count in posts table
      await supabase
        .from('posts')
        .update({ likes: newLikes })
        .eq('id', postId);

      // Track in post_likes if table exists and user is logged in
      if (likesTableExists && currentUser?.email) {
        if (isLiking) {
          const { error: likeError } = await supabase
            .from('post_likes')
            .insert({
              post_id: postId,
              user_email: currentUser.email
            });

          if (likeError) {
            console.warn('Could not track like in post_likes:', likeError.message);
            if (likeError.message?.includes('relation') || likeError.code === '42P01') {
              setLikesTableExists(false);
            }
          }
        } else {
          // Unlike
          await supabase
            .from('post_likes')
            .delete()
            .match({ post_id: postId, user_email: currentUser.email });
        }
      }
    } catch (err) {
      console.warn('Failed to persist like/unlike to database:', err);
    }
  };

  const handleComment = async () => {
    if (!selectedPost || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newCommentsCount = selectedPost.comments + 1;
    const authorName = currentUser?.email?.split('@')[0] || 'Anda';
    const savedText = commentText.trim();

    // Create local comment object for immediate display
    const localComment = {
      id: crypto.randomUUID(),
      user: authorName,
      text: savedText,
      time: 'Baru saja'
    };

    // Optimistically update UI immediately
    setLocalPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: newCommentsCount } : p));
    setLocalComments(prev => {
      const next = {
        ...prev,
        [selectedPost.id]: [...(prev[selectedPost.id] || []), localComment]
      };
      localStorage.setItem('nemuin_comments', JSON.stringify(next));
      return next;
    });
    setCommentText('');

    // Try to persist to database
    try {
      // 1. Insert into post_comments
      const { data: commentData, error: commentError } = await supabase
        .from('post_comments')
        .insert({
          post_id: selectedPost.id,
          author: authorName,
          content: savedText
        })
        .select()
        .single();

      if (!commentError && commentData) {
        // Successfully saved to DB — add to dbComments and remove from localComments
        setDbComments(prev => [...prev, commentData]);
        setLocalComments(prev => {
          const updated = { ...prev };
          if (updated[selectedPost.id]) {
            updated[selectedPost.id] = updated[selectedPost.id].filter(c => c.id !== localComment.id);
            if (updated[selectedPost.id].length === 0) delete updated[selectedPost.id];
          }
          localStorage.setItem('nemuin_comments', JSON.stringify(updated));
          return updated;
        });
      } else {
        console.warn('Error inserting comment to DB:', commentError?.message);
        // Comment stays in localComments as fallback display
      }

      // 2. Update comments count in posts table
      await supabase
        .from('posts')
        .update({ comments: newCommentsCount })
        .eq('id', selectedPost.id);
    } catch (err) {
      console.warn('Failed to add comment to database, showing locally:', err);
      // Comment remains visible in localComments
    } finally {
      setIsSubmitting(false);
    }
  };

  // Merge DB comments + local fallback comments for display
  const getCommentsForPost = (postId: string) => {
    const fromDb = dbComments.map(c => ({
      id: c.id,
      user: c.author || 'Anonim',
      text: c.content,
      time: c.created_at ? new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja',
      isFromDb: true
    }));
    const fromLocal = (localComments[postId] || []).map(c => ({
      id: c.id,
      user: c.user,
      text: c.text,
      time: c.time,
      isFromDb: false
    }));
    return [...fromDb, ...fromLocal];
  };

  // Get current user's initials for the comment input avatar
  const userInitials = currentUser?.email
    ? currentUser.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'AN';

  return (
    <div className={`flex-1 w-full flex flex-col h-full relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#1C1917]' : 'bg-white'}`}>
      
      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 pb-32">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center mb-6 text-[#FF611D]">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-black italic tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>
              Belum ada postingan feed
            </h3>
            <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
              Bagikan pengalaman kuliner tersembunyi Anda menggunakan tombol tambah (+) di navigasi!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {localPosts.map(post => (
              <div key={post.id} className={`rounded-[2.5rem] overflow-hidden border transition-all duration-500 flex flex-col h-full group ${
                isDarkMode 
                  ? 'bg-[#262626] border-[#404040] shadow-[0_0_30px_rgba(255,97,29,0.25)] hover:shadow-[0_0_60px_rgba(255,97,29,0.5)] hover:border-[#FF611D]/50' 
                  : 'bg-white border-[#E7E5E4] shadow-[0_15px_40px_rgba(255,97,29,0.15)] hover:shadow-[0_25px_60px_rgba(255,97,29,0.35)] hover:border-[#FF611D]/50'
              }`}>
                {/* Post Header */}
                <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-[#333333]' : 'border-[#F6F1EA]'}`}>
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.userAvatar} 
                      alt={post.user} 
                      className={`w-10 h-10 rounded-full object-cover border group-hover:scale-110 group-hover:border-[#FF611D] transition-all duration-300 ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`} 
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${post.user}&background=random` }}
                    />
                    <div>
                      <h3 className={`text-sm font-bold hover:underline cursor-pointer transition-all duration-300 group-hover:text-[#FF611D] group-hover:drop-shadow-[0_0_8px_rgba(255,97,29,0.3)] ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{post.user}</h3>
                      <p className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider">{post.timeAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleShare(post.id, post.user)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FF611D]/20 active:scale-90 transition-all ${isDarkMode ? 'bg-[#333333] hover:text-[#FF611D]' : 'bg-[#F6F1EA] hover:text-[#FF611D]'}`}
                      title="Bagikan Postingan"
                    >
                      <Share2 className="w-4 h-4 text-[#A8A29E] transition-colors" />
                    </button>
                    {onDeletePost && (
                      <button 
                        onClick={() => setShowDeleteConfirm(post.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/25 active:scale-90 transition-all"
                        title="Hapus Postingan"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Image */}
                <div className="w-full bg-[#E7E5E4] relative aspect-[4/3] overflow-hidden group">
                  <img 
                    src={post.image} 
                    alt="Food discovery" 
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
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors group ${likedPostIds.has(post.id) ? 'text-[#FF611D]' : 'text-[#78716C] hover:text-[#FF611D]'}`}
                      >
                        <Heart className={`w-5 h-5 ${likedPostIds.has(post.id) ? 'fill-current' : 'group-hover:fill-current'}`} />
                        <span className="text-xs font-bold">{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => setShowComments(post.id)}
                        className="flex items-center gap-2 text-[#78716C] hover:text-[#FF611D] transition-colors group"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-bold">{post.comments}</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Prototype View (Bottom Sheet overlay) */}
      {showComments && selectedPost && (
        <div className="absolute inset-0 z-[10000] bg-black/60 flex items-end">
          <div className={`w-full rounded-t-3xl h-[80%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 transition-colors ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
            {/* Sheet Header */}
            <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-[#404040]' : 'border-[#E7E5E4]'}`}>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>Komentar</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${isDarkMode ? 'bg-[#333333] text-[#A8A29E]' : 'bg-[#F6F1EA] text-[#78716C]'}`}>{selectedPost.comments}</span>
              </div>
              <button 
                onClick={() => setShowComments(null)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'bg-[#333333] text-[#78716C] hover:bg-[#404040]' : 'bg-[#F6F1EA] text-[#78716C] hover:bg-[#E7E5E4]'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="flex justify-center items-center py-10">
                  <RefreshCw className="w-6 h-6 text-[#FF611D] animate-spin" />
                </div>
              ) : (
                <>
                  {/* Render merged comments (DB + local fallback) */}
                  {(() => {
                    const allComments = getCommentsForPost(selectedPost.id);
                    if (allComments.length > 0) {
                      return allComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            comment.user === (currentUser?.email?.split('@')[0] || 'Anda') 
                              ? 'bg-[#FF611D]/10 text-[#FF611D]' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            <span className="text-xs font-bold">{(comment.user || 'An').substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div className={`flex-1 p-3 rounded-2xl rounded-tl-none transition-colors ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'}`}>
                            <div className="flex justify-between mb-1">
                              <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{comment.user}</span>
                              <span className="text-[10px] text-[#A8A29E]">{comment.time}</span>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>{comment.text}</p>
                          </div>
                        </div>
                      ));
                    }
                    return (
                      <div className="flex-1 flex items-center justify-center pt-10">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                          Belum ada komentar. Jadilah yang pertama!
                        </p>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Input Fixed at Bottom */}
            <div className={`p-4 border-t pb-safe flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
              <div className="w-10 h-10 rounded-full bg-[#4B2E2A] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{userInitials}</span>
              </div>
              <div className={`flex-1 rounded-2xl px-4 py-2 flex items-center border border-transparent focus-within:border-[#FF611D] transition-colors ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'}`}>
                <input 
                  type="text" 
                  placeholder="Tambah komentar..." 
                  className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${isDarkMode ? 'text-white placeholder:text-[#78716C]' : 'text-[#4B2E2A] placeholder:text-[#A8A29E]'}`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleComment();
                  }}
                  disabled={isSubmitting}
                />
                <button 
                  onClick={handleComment}
                  disabled={isSubmitting || !commentText.trim()}
                  className={`ml-2 p-1.5 rounded-full transition-colors ${commentText.trim() && !isSubmitting ? 'bg-[#FF611D] text-white' : 'text-[#A8A29E]'}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-[#FF611D] text-white px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4 shrink-0" />
          <span className="text-xs font-black italic tracking-tighter">TAUTAN DISALIN KE CLIPBOARD!</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (() => {
        const postToDelete = localPosts.find(p => p.id === showDeleteConfirm);
        return (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
            <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#1C1917] border-[#404040] text-white' : 'bg-white border-[#E7E5E4] text-[#4B2E2A]'}`}>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                  <Trash2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic tracking-tighter text-rose-500">Hapus Postingan</h3>
                  <p className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                    Apakah Anda yakin ingin menghapus postingan dari <span className="text-[#FF611D]">{postToDelete?.user || 'pengguna ini'}</span>? Semua komentar dan likes terkait juga akan terhapus.
                  </p>
                </div>
                <div className="flex gap-3 pt-2 animate-in slide-in-from-bottom duration-300">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={isDeleting}
                    className={`flex-1 h-12 rounded-xl text-xs font-black italic tracking-tighter transition-all ${isDarkMode ? 'bg-[#333333] hover:bg-[#404040]' : 'bg-[#F6F1EA] hover:bg-[#E7E5E4]'}`}
                  >
                    BATAL
                  </button>
                  <button 
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        if (onDeletePost) {
                          await onDeletePost(showDeleteConfirm);
                        }
                        setLocalPosts(prev => prev.filter(p => p.id !== showDeleteConfirm));
                      } catch (e) {
                        console.error("Gagal saat menghapus postingan:", e);
                      } finally {
                        setIsDeleting(false);
                        setShowDeleteConfirm(null);
                      }
                    }}
                    disabled={isDeleting}
                    className="flex-1 h-12 bg-rose-500 text-white rounded-xl text-xs font-black italic tracking-tighter hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting ? 'MENGHAPUS...' : 'YA, HAPUS'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
