-- Create the coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('fixed', 'percent')),
    value NUMERIC NOT NULL CHECK (value > 0),
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_until DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Row Level Security (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to read active coupons (if needed for checkout)
CREATE POLICY "Coupons are viewable by everyone" ON public.coupons
    FOR SELECT USING (true);

-- Create policy for authenticated admins to manage coupons (using simple auth check or your custom admin logic)
-- Assumes admins are handling these through a secure route or service role, 
-- but if we want direct inserts from the client, we need a policy allowing authenticated users or admins.
CREATE POLICY "Admins can manage coupons" ON public.coupons
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_coupons_updated_at();
