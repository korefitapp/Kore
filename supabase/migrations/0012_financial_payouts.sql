-- Migration 0012_financial_payouts.sql

CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processed, failed
    bank_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profs veem seus saques" 
ON public.payouts FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Admin ve todos saques"
ON public.payouts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Profs inserem seus saques"
ON public.payouts FOR INSERT
WITH CHECK (auth.uid() = professional_id);

-- Trigger de updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.payouts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
