-- Create client preview workspaces table
CREATE TABLE public.client_previews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  client_name TEXT NOT NULL,
  client_email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  preview_type TEXT NOT NULL DEFAULT 'chatbot',
  chatbot_config JSONB DEFAULT '{}',
  workflow_config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_previews ENABLE ROW LEVEL SECURITY;

-- Public read policy for token-based access (no auth required)
CREATE POLICY "Anyone can view previews by token"
ON public.client_previews
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_client_previews_updated_at
BEFORE UPDATE ON public.client_previews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample preview
INSERT INTO public.client_previews (client_name, client_email, title, description, preview_type, chatbot_config, expires_at)
VALUES (
  'ABC Corporation',
  'john@abccorp.com',
  'AI Customer Support Chatbot',
  'Intelligent chatbot for handling customer inquiries, FAQs, and support tickets.',
  'chatbot',
  '{"greeting": "Hello! I''m ABC Corp''s AI assistant. How can I help you today?", "personality": "professional", "capabilities": ["FAQ", "Support Tickets", "Product Info"]}',
  now() + interval '30 days'
);