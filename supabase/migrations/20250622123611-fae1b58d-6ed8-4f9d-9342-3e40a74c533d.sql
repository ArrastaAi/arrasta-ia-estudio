
-- Criar tabelas para o sistema completo do ArrastaAí

-- Tabela para configurações de IA e automação
CREATE TABLE ai_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  n8n_webhook_url TEXT DEFAULT 'https://n8n-n8n-start.0v0jjw.easypanel.host/webhook/thread',
  unsplash_access_key TEXT,
  automation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para templates e inspirações
CREATE TABLE carousel_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  performance_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para biblioteca de fundos e elementos
CREATE TABLE design_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'background', 'icon', 'element'
  category TEXT NOT NULL, -- 'professional', 'service', 'neutral'
  subcategory TEXT, -- 'barbeiro', 'energia_solar', etc
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[],
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de IA e analytics
CREATE TABLE ai_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  carousel_id UUID REFERENCES carousels(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL, -- 'content_strategist', 'visual_curator', 'engagement_optimizer'
  prompt TEXT NOT NULL,
  generated_content JSONB NOT NULL,
  performance_score INTEGER,
  processing_time INTEGER,
  confidence_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para integrações sociais
CREATE TABLE social_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'instagram', 'pinterest', 'facebook', 'linkedin'
  access_token TEXT,
  refresh_token TEXT,
  account_id TEXT,
  account_name TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para exportações e compartilhamentos
CREATE TABLE carousel_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carousel_id UUID REFERENCES carousels(id) ON DELETE CASCADE,
  format TEXT NOT NULL, -- 'png', 'pdf', 'zip'
  platform TEXT, -- 'instagram', 'pinterest', etc
  export_url TEXT,
  settings JSONB,
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_exports ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can manage their AI config" ON ai_configurations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON carousel_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON carousel_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Everyone can view design assets" ON design_assets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their AI generations" ON ai_generations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their social integrations" ON social_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their exports" ON carousel_exports
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM carousels WHERE id = carousel_exports.carousel_id
    )
  );

-- Inserir dados iniciais para fundos e templates
INSERT INTO design_assets (name, type, category, subcategory, url, thumbnail_url, tags) VALUES
  ('Fundo Barbeiro Profissional', 'background', 'professional', 'barbeiro', '/assets/backgrounds/barbeiro-1.jpg', '/assets/thumbs/barbeiro-1.jpg', ARRAY['barbeiro', 'profissional', 'masculino']),
  ('Fundo Salão Beleza', 'background', 'professional', 'cabeleireira', '/assets/backgrounds/salao-1.jpg', '/assets/thumbs/salao-1.jpg', ARRAY['cabeleireira', 'beleza', 'feminino']),
  ('Fundo Energia Solar', 'background', 'service', 'energia_solar', '/assets/backgrounds/solar-1.jpg', '/assets/thumbs/solar-1.jpg', ARRAY['energia', 'solar', 'sustentabilidade']),
  ('Fundo IA Tecnologia', 'background', 'service', 'ia', '/assets/backgrounds/ai-1.jpg', '/assets/thumbs/ai-1.jpg', ARRAY['inteligencia', 'artificial', 'tecnologia']),
  ('Ícone Tesoura', 'icon', 'professional', 'barbeiro', '/assets/icons/tesoura.svg', '/assets/icons/tesoura.svg', ARRAY['tesoura', 'corte', 'barbeiro']),
  ('Ícone Painel Solar', 'icon', 'service', 'energia_solar', '/assets/icons/solar-panel.svg', '/assets/icons/solar-panel.svg', ARRAY['solar', 'energia', 'painel']);

INSERT INTO carousel_templates (name, category, description, template_data, is_public, performance_score) VALUES
  ('Venda Emocional - Barbeiro', 'venda', 'Template para barbeiros focado em venda emocional', '{"slides": 7, "style": "emotional", "layout": "instagram_square"}', true, 85),
  ('Oferta Irresistível - Energia Solar', 'promocional', 'Template para empresas de energia solar', '{"slides": 5, "style": "urgent", "layout": "instagram_feed"}', true, 92),
  ('Quebra de Objeção - Estética', 'educacional', 'Template educacional para serviços estéticos', '{"slides": 6, "style": "educational", "layout": "stories"}', true, 78);
