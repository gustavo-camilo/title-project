-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  researcher_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'assigned', 'in_progress', 'in_review',
    'completed', 'revision_requested', 'cancelled'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'rush')),
  property_address TEXT NOT NULL,
  property_city TEXT NOT NULL,
  property_state TEXT NOT NULL,
  property_zip TEXT,
  property_county TEXT NOT NULL,
  parcel_id TEXT,
  current_owner_name TEXT,
  auction_date DATE,
  auction_type TEXT CHECK (auction_type IN ('tax_deed', 'foreclosure', 'other')),
  customer_notes TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own orders"
  ON public.orders FOR SELECT
  USING ((SELECT auth.uid()) = customer_id);

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = customer_id);

CREATE POLICY "Researchers view assigned orders"
  ON public.orders FOR SELECT
  USING ((SELECT auth.uid()) = researcher_id);

CREATE POLICY "Researchers can update assigned orders"
  ON public.orders FOR UPDATE
  USING ((SELECT auth.uid()) = researcher_id);

CREATE POLICY "Admins can do everything with orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_researcher_id ON public.orders(researcher_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
