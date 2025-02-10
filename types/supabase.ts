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
      profiles: {
        Row: {
          id: string
          email: string
          role: Database['public']['Enums']['user_role']
          subscription_tier: Database['public']['Enums']['subscription_tier']
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          daily_upload_count: number
          daily_upload_reset: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: Database['public']['Enums']['user_role']
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          daily_upload_count?: number
          daily_upload_reset?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: Database['public']['Enums']['user_role']
          subscription_tier?: Database['public']['Enums']['subscription_tier']
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          daily_upload_count?: number
          daily_upload_reset?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          target_type: string
          target_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          target_type: string
          target_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          target_type?: string
          target_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      admin_sessions: {
        Row: {
          id: string
          admin_id: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          admin_id?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      system_metrics: {
        Row: {
          id: string
          metric_type: string
          value: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          metric_type: string
          value: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          metric_type?: string
          value?: number
          metadata?: Json | null
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          resource: string
          limit_type: string
          max_requests: number
          window_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource: string
          limit_type: string
          max_requests: number
          window_seconds: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource?: string
          limit_type?: string
          max_requests?: number
          window_seconds?: number
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          user_id: string
          name: string
          platform: string
          credentials: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          platform: string
          credentials?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          platform?: string
          credentials?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          store_id: string
          name: string
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      blueprints: {
        Row: {
          id: string
          type: string
          metadata: Json | null
          placeholders: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          metadata?: Json | null
          placeholders?: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          metadata?: Json | null
          placeholders?: Json[]
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          collection_id: string
          blueprint_id: string
          variants: Json[]
          item_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          blueprint_id: string
          variants?: Json[]
          item_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          blueprint_id?: string
          variants?: Json[]
          item_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscription_limits: {
        Row: {
          tier: Database['public']['Enums']['subscription_tier']
          max_items_per_template: number
          max_templates: number
          max_daily_uploads: number
          has_ads: boolean
        }
        Insert: {
          tier: Database['public']['Enums']['subscription_tier']
          max_items_per_template: number
          max_templates: number
          max_daily_uploads: number
          has_ads?: boolean
        }
        Update: {
          tier?: Database['public']['Enums']['subscription_tier']
          max_items_per_template?: number
          max_templates?: number
          max_daily_uploads?: number
          has_ads?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'admin' | 'superadmin'
      subscription_tier: 'free' | 'creator' | 'pro' | 'enterprise'
    }
  }
}