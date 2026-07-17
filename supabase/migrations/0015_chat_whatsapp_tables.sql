-- 0015_chat_whatsapp_tables.sql

-- 1. Tabela para instâncias do WhatsApp (Evolution API)
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  instance_name text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'disconnected',
  qr_code_base64 text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own instance"
  ON public.whatsapp_instances FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert/update their own instance"
  ON public.whatsapp_instances FOR ALL
  USING (auth.uid() = professional_id);

-- 2. Tabela para os contatos do profissional
CREATE TABLE IF NOT EXISTS public.chat_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text,
  phone text NOT NULL, -- Ex: 5511999999999@s.whatsapp.net
  avatar_url text,
  last_message_at timestamp with time zone,
  last_message_preview text,
  unread_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (professional_id, phone)
);

ALTER TABLE public.chat_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage their own contacts"
  ON public.chat_contacts FOR ALL
  USING (auth.uid() = professional_id);

-- 3. Tabela para as mensagens de fato
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES public.chat_contacts(id) ON DELETE CASCADE,
  message_id text UNIQUE NOT NULL, -- ID original da Evolution API/WhatsApp
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- preenchido quando enviada pelo profissional no app
  text text,
  is_from_me boolean DEFAULT false, -- true = enviada pelo prof. / false = recebida
  status text DEFAULT 'sent', -- sent, delivered, read
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage messages of their contacts"
  ON public.chat_messages FOR ALL
  USING (
    contact_id IN (
      SELECT id FROM public.chat_contacts WHERE professional_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at da instance
CREATE OR REPLACE FUNCTION update_whatsapp_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_instances_updated_at
BEFORE UPDATE ON public.whatsapp_instances
FOR EACH ROW
EXECUTE FUNCTION update_whatsapp_instance_updated_at();
