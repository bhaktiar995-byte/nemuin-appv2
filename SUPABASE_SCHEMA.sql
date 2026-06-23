-- ====================================================================
-- SUPABASE SQL SCHEMA FOR USER AUTHENTICATION DATABASE
-- Execute this command in the Supabase SQL Editor
-- ====================================================================

-- 1. Create the 'users_auth' table
-- Note: id maps directly to auth.users.id, password column is removed as Supabase Auth handles it.
CREATE TABLE IF NOT EXISTS public.users_auth (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users_auth ENABLE ROW LEVEL SECURITY;

-- 3. Create security policies for RLS
CREATE POLICY "Allow public insert (register)" 
ON public.users_auth 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public or authenticated select (login checks)" 
ON public.users_auth 
FOR SELECT 
USING (true);

-- ====================================================================
-- AUTOMATIC SYNC FROM SUPABASE AUTH TO PUBLIC.USERS_AUTH
-- ====================================================================

-- 4. Create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_auth (id, email, role)
  VALUES (new.id, new.email, 'user');
  
  RETURN new;
END;
$$;

-- 5. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Verify table creation by running:
-- SELECT * FROM public.users_auth;
