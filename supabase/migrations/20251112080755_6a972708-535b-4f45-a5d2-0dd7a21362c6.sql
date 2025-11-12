-- Add discount and advance columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN discount_name text DEFAULT 'Discount',
ADD COLUMN discount_amount numeric DEFAULT 0,
ADD COLUMN advance_enabled boolean DEFAULT false,
ADD COLUMN advance_type text DEFAULT 'percentage',
ADD COLUMN advance_value numeric DEFAULT 0;

COMMENT ON COLUMN public.invoices.discount_name IS 'Customizable name for the discount';
COMMENT ON COLUMN public.invoices.discount_amount IS 'Discount amount to subtract before subtotal';
COMMENT ON COLUMN public.invoices.advance_enabled IS 'Whether advance payment is enabled';
COMMENT ON COLUMN public.invoices.advance_type IS 'Type of advance: percentage or amount';
COMMENT ON COLUMN public.invoices.advance_value IS 'Advance value (percentage or fixed amount)';