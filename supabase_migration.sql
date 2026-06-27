-- =====================================================
-- Migration: post_likes table & post_comments fix
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- 1. Create post_likes table to track per-user likes (1 like per user per post)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_email)
);

-- 2. Disable RLS on post_likes so it works without auth policies
ALTER TABLE post_likes DISABLE ROW LEVEL SECURITY;

-- 3. Ensure post_comments table exists
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Disable RLS on post_comments so it works without auth policies
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;

-- 5. Ensure posts table exists (mock fallback) and disable RLS so likes can be updated
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author TEXT,
  user_avatar TEXT,
  content TEXT,
  image TEXT,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  date TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
-- 5. Also ensure posts table RLS is off
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
