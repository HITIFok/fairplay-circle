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
      game_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      participations: {
        Row: {
          id: string
          joined_at: string
          rank: number | null
          session_id: string
          user_id: string
          winnings: number
        }
        Insert: {
          id?: string
          joined_at?: string
          rank?: number | null
          session_id: string
          user_id: string
          winnings?: number
        }
        Update: {
          id?: string
          joined_at?: string
          rank?: number | null
          session_id?: string
          user_id?: string
          winnings?: number
        }
        Relationships: [
          {
            foreignKeyName: "participations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avg_rank: number | null
          balance: number
          created_at: string
          exclusion_until: string | null
          id: string
          is_approved: boolean
          is_excluded: boolean
          language: string
          referral_code: string | null
          referred_by: string | null
          total_sessions: number
          total_winnings: number
          updated_at: string
          user_id: string
          username: string
          vip_status: string
          weekly_spending: number
          win_rate: number | null
        }
        Insert: {
          avg_rank?: number | null
          balance?: number
          created_at?: string
          exclusion_until?: string | null
          id?: string
          is_approved?: boolean
          is_excluded?: boolean
          language?: string
          referral_code?: string | null
          referred_by?: string | null
          total_sessions?: number
          total_winnings?: number
          updated_at?: string
          user_id: string
          username: string
          vip_status?: string
          weekly_spending?: number
          win_rate?: number | null
        }
        Update: {
          avg_rank?: number | null
          balance?: number
          created_at?: string
          exclusion_until?: string | null
          id?: string
          is_approved?: boolean
          is_excluded?: boolean
          language?: string
          referral_code?: string | null
          referred_by?: string | null
          total_sessions?: number
          total_winnings?: number
          updated_at?: string
          user_id?: string
          username?: string
          vip_status?: string
          weekly_spending?: number
          win_rate?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          created_at: string
          id: string
          level: number
          referral_id: string
          sponsor_id: string
        }
        Insert: {
          bonus_amount?: number
          created_at?: string
          id?: string
          level?: number
          referral_id: string
          sponsor_id: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          id?: string
          level?: number
          referral_id?: string
          sponsor_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_players: number
          entry_fee: number
          expires_at: string
          id: string
          max_players: number
          pot: number
          session_number: number
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_players?: number
          entry_fee?: number
          expires_at?: string
          id?: string
          max_players?: number
          pot?: number
          session_number?: number
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_players?: number
          entry_fee?: number
          expires_at?: string
          id?: string
          max_players?: number
          pot?: number
          session_number?: number
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          label: string
          session_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          label: string
          session_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          label?: string
          session_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_player: { Args: { p_user_id: string }; Returns: Json }
      admin_get_stats: { Args: never; Returns: Json }
      admin_set_player_approval: {
        Args: { p_approved: boolean; p_user_id: string }
        Returns: Json
      }
      admin_set_session_status: {
        Args: { p_session_id: string; p_status: string }
        Returns: Json
      }
      admin_set_vip: {
        Args: { p_user_id: string; p_vip_status: string }
        Returns: Json
      }
      admin_update_setting: {
        Args: { p_key: string; p_value: string }
        Returns: Json
      }
      cancel_expired_sessions: { Args: never; Returns: undefined }
      execute_draw: { Args: { p_session_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_session: { Args: { p_session_id: string }; Returns: Json }
      process_referral: { Args: { p_referral_code: string }; Returns: Json }
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
