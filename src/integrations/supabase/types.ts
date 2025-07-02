export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_configurations: {
        Row: {
          automation_enabled: boolean | null
          created_at: string | null
          gemini_api_key: string | null
          id: string
          n8n_webhook_url: string | null
          unsplash_access_key: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          automation_enabled?: boolean | null
          created_at?: string | null
          gemini_api_key?: string | null
          id?: string
          n8n_webhook_url?: string | null
          unsplash_access_key?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          automation_enabled?: boolean | null
          created_at?: string | null
          gemini_api_key?: string | null
          id?: string
          n8n_webhook_url?: string | null
          unsplash_access_key?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_generation_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          generation_time: number | null
          id: string
          parameters: Json
          results: Json
          user_id: string | null
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at?: string
          generation_time?: number | null
          id?: string
          parameters: Json
          results: Json
          user_id?: string | null
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          generation_time?: number | null
          id?: string
          parameters?: Json
          results?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          agent_type: string
          carousel_id: string | null
          confidence_score: number | null
          created_at: string | null
          generated_content: Json
          id: string
          performance_score: number | null
          processing_time: number | null
          prompt: string
          user_id: string | null
        }
        Insert: {
          agent_type: string
          carousel_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          generated_content: Json
          id?: string
          performance_score?: number | null
          processing_time?: number | null
          prompt: string
          user_id?: string | null
        }
        Update: {
          agent_type?: string
          carousel_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          generated_content?: Json
          id?: string
          performance_score?: number | null
          processing_time?: number | null
          prompt?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_carousel_id_fkey"
            columns: ["carousel_id"]
            isOneToOne: false
            referencedRelation: "carousels"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key: string
          last_used: string | null
          limit: number | null
          name: string
          usage: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          last_used?: string | null
          limit?: number | null
          name: string
          usage?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          last_used?: string | null
          limit?: number | null
          name?: string
          usage?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      carousel_exports: {
        Row: {
          carousel_id: string | null
          created_at: string | null
          export_url: string | null
          format: string
          id: string
          platform: string | null
          settings: Json | null
          status: string | null
        }
        Insert: {
          carousel_id?: string | null
          created_at?: string | null
          export_url?: string | null
          format: string
          id?: string
          platform?: string | null
          settings?: Json | null
          status?: string | null
        }
        Update: {
          carousel_id?: string | null
          created_at?: string | null
          export_url?: string | null
          format?: string
          id?: string
          platform?: string | null
          settings?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carousel_exports_carousel_id_fkey"
            columns: ["carousel_id"]
            isOneToOne: false
            referencedRelation: "carousels"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          performance_score: number | null
          subcategory: string | null
          template_data: Json
          thumbnail_url: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          performance_score?: number | null
          subcategory?: string | null
          template_data: Json
          thumbnail_url?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          performance_score?: number | null
          subcategory?: string | null
          template_data?: Json
          thumbnail_url?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      carousels: {
        Row: {
          ai_generated: boolean | null
          content: Json | null
          created_at: string
          description: string | null
          id: string
          layout_type: string
          narrative_style: string | null
          published: boolean | null
          style_theme: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          layout_type: string
          narrative_style?: string | null
          published?: boolean | null
          style_theme?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          layout_type?: string
          narrative_style?: string | null
          published?: boolean | null
          style_theme?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_assets: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_premium: boolean | null
          name: string
          subcategory: string | null
          tags: string[] | null
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      slides: {
        Row: {
          background_type: string | null
          background_value: string | null
          carousel_id: string
          content: string | null
          created_at: string
          effects: Json | null
          id: string
          image_url: string | null
          order_index: number
          updated_at: string
        }
        Insert: {
          background_type?: string | null
          background_value?: string | null
          carousel_id: string
          content?: string | null
          created_at?: string
          effects?: Json | null
          id?: string
          image_url?: string | null
          order_index: number
          updated_at?: string
        }
        Update: {
          background_type?: string | null
          background_value?: string | null
          carousel_id?: string
          content?: string | null
          created_at?: string
          effects?: Json | null
          id?: string
          image_url?: string | null
          order_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slides_carousel_id_fkey"
            columns: ["carousel_id"]
            isOneToOne: false
            referencedRelation: "carousels"
            referencedColumns: ["id"]
          },
        ]
      }
      social_integrations: {
        Row: {
          access_token: string | null
          account_id: string | null
          account_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          refresh_token: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          refresh_token?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          refresh_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_premium: boolean | null
          layout_type: string
          name: string
          subcategory: string | null
          thumbnail_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_premium?: boolean | null
          layout_type: string
          name: string
          subcategory?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_premium?: boolean | null
          layout_type?: string
          name?: string
          subcategory?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_data: Json
          preference_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preference_data: Json
          preference_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preference_data?: Json
          preference_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_params_hash: {
        Args: { params: Json }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
