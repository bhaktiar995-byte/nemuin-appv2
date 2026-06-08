-- ====================================================================
-- SUPABASE SQL SCHEMA FOR USER AUTHENTICATION DATABASE
-- Execute this command in the Supabase SQL Editor to support registration
-- ====================================================================

-- 1. Create the 'users_auth' table
CREATE TABLE IF NOT EXISTS public.users_auth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS) - Optional but highly recommended
ALTER TABLE public.users_auth ENABLE ROW LEVEL SECURITY;

-- 3. Create security policies for RLS (allowing anonymous/public reads and registrations)
CREATE POLICY "Allow public insert (register)" 
ON public.users_auth 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public or authenticated select (login checks)" 
ON public.users_auth 
FOR SELECT 
USING (true);

-- 4. Verify table creation by running:
-- SELECT * FROM public.users_auth;
