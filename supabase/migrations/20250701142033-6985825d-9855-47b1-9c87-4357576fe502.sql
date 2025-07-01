
-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios carrosséis" ON public.carousels;
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios carrosséis" ON public.carousels;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios carrosséis" ON public.carousels;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios carrosséis" ON public.carousels;
DROP POLICY IF EXISTS "Users can insert their own carousels" ON public.carousels;
DROP POLICY IF EXISTS "Users can view their own carousels" ON public.carousels;
DROP POLICY IF EXISTS "Users can update their own carousels" ON public.carousels;
DROP POLICY IF EXISTS "Users can delete their own carousels" ON public.carousels;

-- Criar políticas RLS corretas para a tabela carousels
CREATE POLICY "Users can insert their own carousels" 
ON public.carousels 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view their own carousels" 
ON public.carousels 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own carousels" 
ON public.carousels 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id::uuid) 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete their own carousels" 
ON public.carousels 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id::uuid);

-- Garantir que RLS está habilitado na tabela
ALTER TABLE public.carousels ENABLE ROW LEVEL SECURITY;
