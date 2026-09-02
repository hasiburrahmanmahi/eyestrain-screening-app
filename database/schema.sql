-- Supabase Database Schema for Digital Eye Strain (DES) Screening App

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Predictions Table
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    prediction TEXT NOT NULL, -- 'DES' or 'No DES'
    probability FLOAT NOT NULL, -- e.g. 0.72 for 72%
    risk_band TEXT NOT NULL, -- 'Low', 'Moderate', 'High'
    des_score FLOAT NOT NULL, -- e.g. 9.79 out of 14
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dataset Rows Table (for Admin Viewer of the training dataset)
CREATE TABLE IF NOT EXISTS public.dataset_rows (
    id SERIAL PRIMARY KEY,
    gender TEXT,
    age TEXT,
    study_year TEXT,
    screen_time TEXT,
    device TEXT,
    blue_light TEXT,
    screen_distance TEXT,
    rule_20_20_20 TEXT,
    dark_room TEXT,
    poor_posture TEXT,
    glasses TEXT,
    continuous_use TEXT,
    blurred_vision INT,
    dryness INT,
    burning INT,
    redness INT,
    double_vision INT,
    headache INT,
    neck_shoulder_pain FLOAT,
    self_reported_des TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_rows ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Profiles
CREATE POLICY "Users can read own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile non-role" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Super Admins can read all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Super Admins can update all profiles" 
    ON public.profiles FOR UPDATE 
    USING (public.is_admin());

-- RLS Policies for Predictions
CREATE POLICY "Users can read own predictions" 
    ON public.predictions FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own predictions" 
    ON public.predictions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super Admins can read all predictions" 
    ON public.predictions FOR SELECT 
    USING (public.is_admin());

-- RLS Policies for Dataset Rows
CREATE POLICY "Authenticated users can read dataset" 
    ON public.dataset_rows FOR SELECT 
    USING (auth.role() = 'authenticated');

-- 5. Postgres Trigger to Auto-create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
