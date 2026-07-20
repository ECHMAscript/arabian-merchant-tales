export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          topic_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          topic_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          topic_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          category: string
          created_at: string
          discount_percentage: number | null
          id: string
          image: string
          original_price: number | null
          price: number
          quantity_left: number | null
          rating: number
          review_count: number
          title: string
          volumes: string[] | null
        }
        Insert: {
          author?: string | null
          category?: string
          created_at?: string
          discount_percentage?: number | null
          id?: string
          image: string
          original_price?: number | null
          price: number
          quantity_left?: number | null
          rating?: number
          review_count?: number
          title: string
          volumes?: string[] | null
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          discount_percentage?: number | null
          id?: string
          image?: string
          original_price?: number | null
          price?: number
          quantity_left?: number | null
          rating?: number
          review_count?: number
          title?: string
          volumes?: string[] | null
        }
        Relationships: []
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          token: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          environment: string
          id: string
          is_guest: boolean
          items: Json
          order_type: string
          paid_at: string | null
          payment_status: string
          shipping_address: Json | null
          status: string
          stripe_session_id: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          environment?: string
          id?: string
          is_guest?: boolean
          items: Json
          order_type?: string
          paid_at?: string | null
          payment_status?: string
          shipping_address?: Json | null
          status?: string
          stripe_session_id?: string | null
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          environment?: string
          id?: string
          is_guest?: boolean
          items?: Json
          order_type?: string
          paid_at?: string | null
          payment_status?: string
          shipping_address?: Json | null
          status?: string
          stripe_session_id?: string | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          colors: Json | null
          created_at: string
          discount_percentage: number | null
          has_sizes: boolean
          id: string
          image: string
          is_new_arrival: boolean | null
          is_preorder: boolean
          original_price: number | null
          price: number
          rating: number
          review_count: number
          title: string
        }
        Insert: {
          category?: string
          colors?: Json | null
          created_at?: string
          discount_percentage?: number | null
          has_sizes?: boolean
          id?: string
          image: string
          is_new_arrival?: boolean | null
          is_preorder?: boolean
          original_price?: number | null
          price: number
          rating?: number
          review_count?: number
          title: string
        }
        Update: {
          category?: string
          colors?: Json | null
          created_at?: string
          discount_percentage?: number | null
          has_sizes?: boolean
          id?: string
          image?: string
          is_new_arrival?: boolean | null
          is_preorder?: boolean
          original_price?: number | null
          price?: number
          rating?: number
          review_count?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          images: string[] | null
          item_id: string
          item_type: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          images?: string[] | null
          item_id: string
          item_type: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          images?: string[] | null
          item_id?: string
          item_type?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      tailoring_orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          garment_name: string
          garment_type: string
          id: string
          measurements: Json
          special_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          garment_name: string
          garment_type: string
          id?: string
          measurements?: Json
          special_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          garment_name?: string
          garment_type?: string
          id?: string
          measurements?: Json
          special_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          id: string
          parent_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wishlist: {
        Row: {
          created_at: string
          id: string
          item_data: Json
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_data: Json
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_data?: Json
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
