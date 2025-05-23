
// Types específicos para Firebase integration

export interface FirebaseUserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

export interface FirebaseAPIKey {
  id: string;
  key: string;
  name: string;
  usage: number;
  limit: number;
  last_used: string;
  created_at: string;
  user_id: string;
}

export interface FirebaseCarousel {
  id: string;
  title: string;
  description: string | null;
  layout_type: string;
  narrative_style: string | null;
  content: string | null;
  ai_generated: boolean;
  published: boolean;
  style_theme: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface FirebaseSlide {
  id: string;
  carousel_id: string;
  order_index: number;
  content: string | null;
  image_url: string | null;
  background_type: string | null;
  background_value: string | null;
  effects: any | null;
  created_at: string;
  updated_at: string;
}

export interface FirebaseTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  layout_type: string;
  thumbnail_url: string | null;
  is_premium: boolean;
  created_at: string;
}

// N8n Integration Types
export interface N8nConfig {
  webhook_url: string;
  api_key: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ML Kit Types
export interface MLAnalysis {
  image_url: string;
  labels: Array<{
    description: string;
    confidence: number;
    entity_id: string;
  }>;
  text_content: string | null;
  processed_at: string;
}
