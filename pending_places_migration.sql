-- =====================================================
-- Migration: pending_places table for approval workflow
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- 1. Create pending_places table to store place submissions awaiting admin approval
CREATE TABLE IF NOT EXISTS pending_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  food_categories TEXT[] DEFAULT '{}',
  address TEXT NOT NULL,
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  price_range TEXT,
  phone TEXT,
  hours TEXT,
  image TEXT,
  
  -- Submitter info
  submitter_email TEXT NOT NULL,
  submitter_name TEXT,
  
  -- Approval workflow
  status TEXT DEFAULT 'menunggu' NOT NULL, -- 'menunggu', 'disetujui', 'ditolak'
  admin_notes TEXT, -- Reason for rejection or admin comments
  reviewed_by TEXT, -- Admin email who reviewed
  reviewed_at TIMESTAMPTZ,
  
  -- Menu items stored as JSONB array
  menu_items JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Disable RLS on pending_places so it works without auth policies
ALTER TABLE pending_places DISABLE ROW LEVEL SECURITY;

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_places_status ON pending_places(status);
CREATE INDEX IF NOT EXISTS idx_pending_places_submitter ON pending_places(submitter_email);

-- 4. Verify table creation by running:
-- SELECT * FROM pending_places;
