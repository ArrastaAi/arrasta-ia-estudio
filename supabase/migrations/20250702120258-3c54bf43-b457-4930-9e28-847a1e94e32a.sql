-- Expandir campo content da tabela carousels para JSONB estruturado
ALTER TABLE public.carousels ALTER COLUMN content TYPE jsonb USING content::jsonb;

-- Criar tabela de cache de gerações IA
CREATE TABLE public.ai_generation_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  parameters jsonb NOT NULL,
  results jsonb NOT NULL,
  generation_time numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Índices para performance
CREATE INDEX idx_ai_cache_user_key ON public.ai_generation_cache(user_id, cache_key);
CREATE INDEX idx_ai_cache_expires ON public.ai_generation_cache(expires_at);

-- Criar tabela de preferências do usuário
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preference_type text NOT NULL,
  preference_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, preference_type)
);

-- RLS para ai_generation_cache
ALTER TABLE public.ai_generation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their AI cache"
ON public.ai_generation_cache
FOR ALL
USING (auth.uid() = user_id);

-- RLS para user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their preferences"
ON public.user_preferences
FOR ALL
USING (auth.uid() = user_id);

-- Função para limpeza automática de cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.ai_generation_cache 
  WHERE expires_at < now();
END;
$$;

-- Função para gerar hash de parâmetros
CREATE OR REPLACE FUNCTION public.generate_params_hash(params jsonb)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN md5(params::text);
END;
$$;

-- Trigger para atualizar updated_at em user_preferences
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();