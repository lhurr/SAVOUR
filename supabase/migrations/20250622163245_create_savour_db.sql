-- SAVOUR (2 tables due to supabase constraint)
-- complete docs for db migration https://supabase.com/docs/guides/deployment/database-migrations




CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_restaurant_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  restaurant_address TEXT,
  restaurant_cuisine TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'view', 'favorite')),
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Indexes for Performance

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_restaurant_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_restaurant_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_date ON public.user_restaurant_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS idx_user_interactions_restaurant ON public.user_restaurant_interactions(restaurant_name, restaurant_address);


-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restaurant_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users: users can only see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User interactions: users can only see their own interactions
DROP POLICY IF EXISTS "Users can view own interactions" ON public.user_restaurant_interactions;
CREATE POLICY "Users can view own interactions" ON public.user_restaurant_interactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interactions" ON public.user_restaurant_interactions;
CREATE POLICY "Users can insert own interactions" ON public.user_restaurant_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interactions" ON public.user_restaurant_interactions;
CREATE POLICY "Users can delete own interactions" ON public.user_restaurant_interactions
  FOR DELETE USING (auth.uid() = user_id);


-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.user_restaurant_interactions TO anon, authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

