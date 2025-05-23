
-- Função para incrementar o uso de uma chave API por ID
CREATE OR REPLACE FUNCTION public.increment_api_key_usage(key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.api_keys
  SET 
    usage = COALESCE(usage, 0) + 1,
    last_used = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
