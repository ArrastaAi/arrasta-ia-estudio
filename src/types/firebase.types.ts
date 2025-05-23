export type FirebaseUserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
}

export type FirebaseCarousel = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  layout_type: 'feed_square' | 'stories' | 'pinterest' | 'facebook' | 'youtube' | 'instagram_rect';
  style_theme: string | null;
  narrative_style: string | null;
  content: string | null;
  ai_generated: boolean;
  published: boolean;
  created_at: any;
  updated_at: any;
}

export type FirebaseSlide = {
  id: string;
  carousel_id: string;
  order_index: number;
  content: string | null;
  image_url: string | null;
  background_type: string | null; 
  background_value: string | null;
  effects: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type FirebaseTemplate = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  layout_type: string;
  thumbnail_url: string | null;
  is_premium: boolean;
  created_at: string;
}

export type FirebaseAPIKey = {
  id: string;
  key: string;
  name: string;
  usage: number;
  limit: number;
  last_used: string;
  created_at: string;
  user_id: string;
}
