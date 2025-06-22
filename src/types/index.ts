
// Sistema de tipos unificado para ArrastaAí

// Tipos base do sistema
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  x: number;
  y: number;
}

// Tipos do sistema de carrossel
export interface TextElement {
  id: string;
  content: string;
  position: Position;
  styles: TextStyles;
}

export interface ImageElement {
  id: string;
  url: string;
  position: Position;
  size: { width: number; height: number };
  effects?: ImageEffects;
}

export interface TextStyles {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  backgroundColor?: string;
  textShadow?: string;
}

export interface ImageEffects {
  blur?: number;
  shadow?: string;
  overlay?: string;
  filter?: string;
}

export interface Slide {
  id: string;
  order_index: number;
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string;
  };
  elements: {
    texts: TextElement[];
    images: ImageElement[];
  };
  effects?: Record<string, any>;
}

export interface Carousel {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  layout_type: 'feed_square' | 'stories' | 'pinterest' | 'facebook' | 'youtube' | 'instagram_rect';
  style_theme?: string;
  narrative_style?: string;
  content?: string;
  slides: Slide[];
  ai_generated: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos do sistema de IA
export interface AIAgent {
  type: 'content_strategist' | 'visual_curator' | 'engagement_optimizer';
  name: string;
  description: string;
  capabilities: string[];
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: 'venda' | 'educativo' | 'inspiracional' | 'promocional';
  description: string;
  prompt_template: string;
  expected_slides: number;
  style_suggestions: string[];
}

export interface AIGeneration {
  id: string;
  user_id: string;
  carousel_id?: string;
  agent_type: string;
  prompt: string;
  generated_content: any;
  performance_score?: number;
  processing_time?: number;
  confidence_score?: number;
  created_at: string;
}

// Tipos do sistema n8n
export interface N8nRequest {
  userId: string;
  prompt: string;
  carouselType: 'venda' | 'educativo' | 'inspiracional' | 'promocional';
  targetAudience: string;
  slideCount: number;
  format: 'instagram' | 'linkedin' | 'pinterest' | 'facebook' | 'youtube';
  style?: string;
}

export interface N8nResponse {
  carouselId: string;
  slides: Array<{
    content: string;
    imagePrompt: string;
    layout: string;
    position: number;
  }>;
  metadata: {
    processingTime: number;
    confidence: number;
    agentType: string;
  };
}

// Tipos de templates e assets
export interface DesignAsset {
  id: string;
  name: string;
  type: 'background' | 'icon' | 'element';
  category: 'professional' | 'service' | 'neutral';
  subcategory?: string;
  url: string;
  thumbnail_url?: string;
  tags: string[];
  is_premium: boolean;
  created_at: string;
}

export interface CarouselTemplate {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  thumbnail_url?: string;
  template_data: any;
  is_public: boolean;
  performance_score: number;
  usage_count: number;
  created_by?: string;
  created_at: string;
}

// Tipos de integrações sociais
export interface SocialIntegration {
  id: string;
  user_id: string;
  platform: 'instagram' | 'pinterest' | 'facebook' | 'linkedin' | 'tiktok';
  access_token?: string;
  refresh_token?: string;
  account_id?: string;
  account_name?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

// Tipos de exportação
export interface CarouselExport {
  id: string;
  carousel_id: string;
  format: 'png' | 'pdf' | 'zip' | 'gif';
  platform?: string;
  export_url?: string;
  settings?: any;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

// Tipos de configuração
export interface AIConfiguration {
  id: string;
  user_id: string;
  gemini_api_key?: string;
  n8n_webhook_url: string;
  unsplash_access_key?: string;
  automation_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de análise e métricas
export interface PerformanceAnalysis {
  overall_score: number;
  engagement_prediction: number;
  visual_quality: number;
  text_readability: number;
  brand_consistency: number;
  platform_optimization: number;
  suggestions: AnalysisSuggestion[];
}

export interface AnalysisSuggestion {
  type: 'visual' | 'text' | 'layout' | 'branding';
  priority: 'high' | 'medium' | 'low';
  message: string;
  fix_suggestion?: string;
}

// Tipos de chat e mensagens
export interface ChatMessage {
  id: string;
  agent: 'content_strategist' | 'visual_curator' | 'engagement_optimizer' | 'user';
  content: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error' | 'suggestion';
  metadata?: {
    canApply?: boolean;
    suggestedChanges?: any;
    confidence?: number;
  };
}

// Tipos de dashboard e analytics
export interface DashboardStats {
  total_carousels: number;
  total_exports: number;
  performance_average: number;
  most_used_layouts: string[];
  recent_activity: ActivityItem[];
  trending_templates: CarouselTemplate[];
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'edit' | 'export' | 'share';
  carousel_id: string;
  carousel_title: string;
  timestamp: string;
}

// Tipos para upload e gerenciamento de mídia
export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  thumbnail_url?: string;
  size: number;
  dimensions: { width: number; height: number };
  user_id: string;
  carousel_id?: string;
  created_at: string;
}

export interface MediaLibrary {
  images: UploadedImage[];
  backgrounds: DesignAsset[];
  icons: DesignAsset[];
  total_size: number;
  available_space: number;
}
