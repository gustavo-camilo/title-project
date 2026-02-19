-- Credit packages available for purchase
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description TEXT,
  description_pt TEXT,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS - packages are publicly readable
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON public.credit_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON public.credit_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Seed data
INSERT INTO public.credit_packages (name, name_pt, description, description_pt, credits, price_cents, is_active, is_featured, sort_order) VALUES
  ('Starter', 'Iniciante', 'Perfect for your first auction purchase', 'Perfeito para sua primeira compra em leilão', 1, 4900, true, false, 1),
  ('Explorer', 'Explorador', 'For active auction participants', 'Para participantes ativos de leilões', 5, 19900, true, false, 2),
  ('Professional', 'Profissional', 'For serious investors and flippers', 'Para investidores e flippers sérios', 15, 52500, true, true, 3),
  ('Enterprise', 'Empresarial', 'For wholesalers and high-volume buyers', 'Para atacadistas e compradores de alto volume', 50, 150000, true, false, 4);
