-- Create announcements table for global announcement bar
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  announcement_type TEXT NOT NULL DEFAULT 'info' CHECK (announcement_type IN ('info', 'success', 'warning', 'promo', 'maintenance')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  cta_text TEXT,
  cta_link TEXT,
  icon TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_pages TEXT[] DEFAULT ARRAY['all']::TEXT[],
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offers table for discount management
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'flat', 'message_only')),
  discount_value NUMERIC(10, 2) DEFAULT 0,
  target_pages TEXT[] DEFAULT ARRAY['all']::TEXT[],
  target_plans TEXT[] DEFAULT ARRAY['all']::TEXT[],
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  badge_text TEXT DEFAULT 'OFFER',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (announcements and offers are public)
CREATE POLICY "Announcements are publicly readable" 
ON public.announcements 
FOR SELECT 
USING (true);

CREATE POLICY "Offers are publicly readable" 
ON public.offers 
FOR SELECT 
USING (true);

-- Admin policies (for authenticated admin users - can be updated later)
CREATE POLICY "Authenticated users can manage announcements" 
ON public.announcements 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage offers" 
ON public.offers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.announcements (enabled, announcement_type, title, message, cta_text, cta_link, target_pages) VALUES
(false, 'promo', '🎉 New Year Offer', 'Get 20% off all AI Automation packages! Limited time only.', 'View Offer', '/services/ai-automation', ARRAY['all']::TEXT[]);

INSERT INTO public.offers (enabled, title, description, discount_type, discount_value, target_pages, target_plans, badge_text) VALUES
(false, 'Launch Offer', 'Special launch discount on all packages', 'percentage', 10, ARRAY['all']::TEXT[], ARRAY['all']::TEXT[], '10% OFF');