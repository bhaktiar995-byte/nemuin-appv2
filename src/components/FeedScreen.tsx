import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Share2, UtensilsCrossed, X, Send, RefreshCw } from 'lucide-react';
import { FoodPost } from '../data/mock';
import { supabase } from '../lib/supabase';

interface FeedScreenProps {
  posts: FoodPost[];
  isDarkMode?: boolean;
  onSeed?: () => Promise<void>;
  isSeeding?: boolean;
  onCommentStateChange?: (isOpen: boolean) => void;
  currentUser?: { email: string; role: 'user' | 'admin' } | null;
}

export function FeedScreen({ posts, isDarkMode, onSeed, isSeeding, onCommentStateChange, currentUser }: FeedScreenProps) {
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [localPosts, setLocalPosts] = useState<FoodPost[]>(posts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track likes and comments locally to prevent double actions and show immediate feedback
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [localComments, setLocalComments] = useState<Record<string, Array<{id: string, user: string, text: string, time: string, isUser: boolean}>>>({});
  
  // Persisted comments from database
  const [dbComments, setDbComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Fetch comments when comments view is opened
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
          .select('id,author,content,created_at')
          .eq('post_id', showComments)
          .order('created_at', { ascending: true });        
        if (!error && data) {
          setDbComments(data);
        } else {
          console.error('Error fetching comments:', error);
        }
      } catch (err) {
        console.error('Failed to fetch comments from database:', err);
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
    if (likedPostIds.has(postId)) return; // Prevent multiple likes from same user session

    const postToLike = localPosts.find(p => p.id === postId);
    if (!postToLike) return;

    const newLikes = postToLike.likes + 1;
    
    // Update local state
    setLikedPostIds(prev => new Set(prev).add(postId));
    setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));

    // Update database
    try {
      await supabase
        .from('posts')
        .update({ likes: newLikes })
        .eq('id', postId);
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleComment = async () => {
    if (!selectedPost || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newCommentsCount = selectedPost.comments + 1;
    const authorName = currentUser?.email?.split('@')[0] || 'Anda';
    
    const newCommentObj = {
      id: crypto.randomUUID(),
      user: authorName,
      text: commentText,
      time: 'Baru saja',
      isUser: true
    };

    // Optimistically update local state
    setLocalPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments: newCommentsCount } : p));
    setLocalComments(prev => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), newCommentObj]
    }));
    setCommentText('');

    // Update database (post_comments table and posts count)
    try {
      // 1. Insert into post_comments (store author name separately)
      const { data: commentData, error: commentError } = await supabase
        .from('post_comments')
        .insert({
          post_id: selectedPost.id,
          author: authorName, // store author name as text
          content: commentText
        })
        .select()
        .single();

      if (!commentError && commentData) {
        setDbComments(prev => [...prev, commentData]);
      }

      // 2. Update comments count in posts table
      await supabase
        .from('posts')
        .update({ comments: newCommentsCount })
        .eq('id', selectedPost.id);
    } catch (err) {
      console.error('Failed to add comment to database', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'}`}>
                    <Share2 className="w-4 h-4 text-[#A8A29E]" />
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
                    <button className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-[#FF611D] bg-[#333333]' : 'text-[#FF611D] bg-[#F6F1EA]'}`}>
                      Read More
                    </button>
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
                  {/* Render database comments or fallback local comments */}
                  {dbComments.length > 0 ? (
                    dbComments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${comment.author === (currentUser?.email?.split('@')[0] || 'Anda') ? 'bg-[#FF611D]/10 text-[#FF611D]' : 'bg-blue-100 text-blue-600'}`}>
                          <span className="text-xs font-bold">{(comment.author_name || comment.author || 'An').substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className={`flex-1 p-3 rounded-2xl rounded-tl-none transition-colors ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'}`}>
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{comment.author_name ?? comment.author}</span>
                            <span className="text-[10px] text-[#A8A29E]">
                              {comment.created_at ? new Date(comment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                            </span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    (localComments[selectedPost.id] || []).map(comment => (
                      <div key={comment.id} className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${comment.isUser ? 'bg-[#FF611D]/10 text-[#FF611D]' : 'bg-blue-100 text-blue-600'}`}>
                          <span className="text-xs font-bold">{comment.user.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className={`flex-1 p-3 rounded-2xl rounded-tl-none transition-colors ${isDarkMode ? 'bg-[#333333]' : 'bg-[#F6F1EA]'}`}>
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#4B2E2A]'}`}>{comment.user}</span>
                            <span className="text-[10px] text-[#A8A29E]">{comment.time}</span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-[#FAF9F6]' : 'text-[#4B2E2A]'}`}>{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}

                  {/* No Comments placeholder if empty both in DB and locally */}
                  {selectedPost.comments === 0 && dbComments.length === 0 && !(localComments[selectedPost.id]?.length > 0) && (
                    <div className="flex-1 flex items-center justify-center pt-10">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                        Belum ada komentar. Jadilah yang pertama!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Fixed at Bottom */}
            <div className={`p-4 border-t pb-safe flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-[#262626] border-[#404040]' : 'bg-white border-[#E7E5E4]'}`}>
              <div className="w-10 h-10 rounded-full bg-[#4B2E2A] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">SF</span>
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
    </div>
  );
}
