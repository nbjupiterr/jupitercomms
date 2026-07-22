export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PriceTable = {
  columns: string[]
  rows: string[][]
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artist_profiles: {
        Row: {
          availability_message: string | null
          availability_status: string
          available_slots: number | null
          contact_email: string | null
          created_at: string
          display_name: string | null
          price_table: PriceTable | Json
          public_queue_token: string
          tos_markdown: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_message?: string | null
          availability_status?: string
          available_slots?: number | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          price_table?: PriceTable | Json
          public_queue_token?: string
          tos_markdown?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_message?: string | null
          availability_status?: string
          available_slots?: number | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          price_table?: PriceTable | Json
          public_queue_token?: string
          tos_markdown?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          artist_id: string
          client_contact: string | null
          client_name: string
          commission_type: string | null
          created_at: string
          currency: string
          deadline: string | null
          description: string | null
          id: string
          price: number | null
          progress_percentage: number
          queue_order: number | null
          status: string
          title: string
          updated_at: string
          workflow_stage_id: string | null
        }
        Insert: {
          artist_id?: string
          client_contact?: string | null
          client_name: string
          commission_type?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string | null
          id?: string
          price?: number | null
          progress_percentage?: number
          queue_order?: number | null
          status?: string
          title: string
          updated_at?: string
          workflow_stage_id?: string | null
        }
        Update: {
          artist_id?: string
          client_contact?: string | null
          client_name?: string
          commission_type?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          description?: string | null
          id?: string
          price?: number | null
          progress_percentage?: number
          queue_order?: number | null
          status?: string
          title?: string
          updated_at?: string
          workflow_stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_workflow_stage_id_fkey"
            columns: ["workflow_stage_id"]
            isOneToOne: false
            referencedRelation: "workflow_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          artist_id: string
          caption: string | null
          created_at: string
          id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          artist_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          artist_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          platform: string
          sort_order: number
          url: string
        }
        Insert: {
          artist_id?: string
          created_at?: string
          id?: string
          platform: string
          sort_order?: number
          url: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          platform?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      workflow_stages: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          threshold_percentage: number
        }
        Insert: {
          artist_id?: string
          created_at?: string
          id?: string
          name: string
          sort_order: number
          threshold_percentage: number
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          threshold_percentage?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_artist: {
        Args: { p_token: string }
        Returns: {
          artist_name: string
          availability_message: string
          availability_status: string
          available_slots: number
          contact_email: string | null
          price_table: PriceTable | Json
          tos_markdown: string | null
        }[]
      }
      get_public_gallery: {
        Args: { p_token: string }
        Returns: {
          caption: string | null
          id: string
          sort_order: number
          storage_path: string
        }[]
      }
      get_public_queue: {
        Args: { p_token: string }
        Returns: {
          artist_name: string
          client_name: string
          is_current: boolean
          progress_percentage: number
          stage_name: string | null
          queue_position: number
          status: string
        }[]
      }
      get_public_socials: {
        Args: { p_token: string }
        Returns: {
          id: string
          platform: string
          sort_order: number
          url: string
        }[]
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
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
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
