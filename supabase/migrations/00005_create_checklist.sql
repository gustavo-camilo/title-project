-- Checklist templates (admin-managed default checklists)
CREATE TABLE public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_name_pt TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON public.checklist_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON public.checklist_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Checklist items per order (filled by researcher)
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'found', 'clear', 'not_applicable')),
  notes TEXT,
  source_url TEXT,
  source_document TEXT,
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Researchers can manage checklist for assigned orders"
  ON public.checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = checklist_items.order_id
      AND (orders.researcher_id = (SELECT auth.uid())
           OR orders.customer_id = (SELECT auth.uid()))
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Seed checklist templates
INSERT INTO public.checklist_templates (category, item_name, item_name_pt, sort_order) VALUES
  ('property_verification', 'Confirm property address and legal description', 'Confirmar endereço e descrição legal da propriedade', 1),
  ('property_verification', 'Verify current owner name', 'Verificar nome do proprietário atual', 2),
  ('property_verification', 'Confirm parcel/folio number', 'Confirmar número do lote/folio', 3),
  ('mortgages', 'Search county recorder for recorded mortgages', 'Pesquisar cartório por hipotecas registradas', 10),
  ('mortgages', 'Check satisfaction/release documents', 'Verificar documentos de quitação', 11),
  ('mortgages', 'Note open mortgages with lender and balance', 'Anotar hipotecas abertas com credor e saldo', 12),
  ('tax_liens', 'Search IRS federal tax lien records', 'Pesquisar registros de ônus fiscal federal do IRS', 20),
  ('tax_liens', 'Search state tax lien records', 'Pesquisar registros de ônus fiscal estadual', 21),
  ('tax_liens', 'Check property tax collector for outstanding taxes', 'Verificar coletor de impostos por impostos pendentes', 22),
  ('hoa', 'Identify HOA/COA association', 'Identificar associação HOA/COA', 30),
  ('hoa', 'Check for recorded HOA liens', 'Verificar ônus de HOA registrados', 31),
  ('hoa', 'Note outstanding assessments', 'Anotar avaliações pendentes', 32),
  ('mechanics_liens', 'Search county recorder for mechanic liens', 'Pesquisar cartório por ônus de empreiteiro', 40),
  ('mechanics_liens', 'Check for construction permits', 'Verificar alvarás de construção', 41),
  ('judgments', 'Search county court records for judgments', 'Pesquisar registros judiciais por julgamentos', 50),
  ('judgments', 'Search federal court (PACER) for judgments', 'Pesquisar tribunal federal (PACER) por julgamentos', 51),
  ('judgments', 'Check for child support liens', 'Verificar ônus de pensão alimentícia', 52),
  ('lis_pendens', 'Search county recorder for lis pendens', 'Pesquisar cartório por lis pendens', 60),
  ('lis_pendens', 'Identify pending litigation affecting property', 'Identificar litígios pendentes que afetam a propriedade', 61),
  ('code_violations', 'Check municipal code enforcement records', 'Verificar registros de fiscalização municipal', 70),
  ('code_violations', 'Look for open building permits', 'Verificar alvarás de construção em aberto', 71),
  ('code_violations', 'Check for demolition orders or condemnation', 'Verificar ordens de demolição ou condenação', 72);

-- Indexes
CREATE INDEX idx_checklist_items_order_id ON public.checklist_items(order_id);
