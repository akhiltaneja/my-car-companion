-- Create expense type enum
CREATE TYPE public.expense_type AS ENUM ('fuel', 'insurance', 'service', 'toll', 'challan');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  profile_picture_url TEXT,
  car_brand TEXT,
  car_name TEXT,
  purchase_month INTEGER CHECK (purchase_month >= 1 AND purchase_month <= 12),
  purchase_year INTEGER CHECK (purchase_year >= 1900 AND purchase_year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type expense_type NOT NULL,
  date DATE NOT NULL,
  odometer INTEGER NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Fuel specific
  price_per_liter DECIMAL(6,2),
  liters DECIMAL(8,2),
  -- Insurance specific
  provider_name TEXT,
  start_date DATE,
  -- Toll specific
  location TEXT,
  -- Service/Challan specific
  description TEXT
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Helper function to check ownership
CREATE OR REPLACE FUNCTION public.is_owner(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_user_id = auth.uid()
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (public.is_owner(id));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (public.is_owner(id))
  WITH CHECK (public.is_owner(id));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_owner(id));

-- Expenses RLS policies
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (public.is_owner(user_id));

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (public.is_owner(user_id))
  WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (public.is_owner(user_id));

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();