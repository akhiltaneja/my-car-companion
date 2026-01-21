-- Create fuel types enum
CREATE TYPE public.fuel_type AS ENUM ('petrol', 'diesel', 'cng', 'electric', 'hybrid');

-- Create petrol pump enum
CREATE TYPE public.petrol_pump AS ENUM ('indian_oil', 'hp', 'bharat_petroleum', 'reliance', 'shell', 'other');

-- Create vehicles table with all expanded fields
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  fuel_type fuel_type NOT NULL DEFAULT 'petrol',
  engine_number TEXT,
  chassis_number TEXT,
  cubic_capacity INTEGER,
  number_of_cylinders INTEGER,
  purchase_month INTEGER,
  purchase_year INTEGER,
  on_road_price NUMERIC NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicles
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add vehicle_id and petrol_pump to expenses table
ALTER TABLE public.expenses
  ADD COLUMN vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  ADD COLUMN petrol_pump petrol_pump;