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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          accepted_terms_at: string | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_anonymous: boolean | null
          onboarding_completed: boolean | null
          phone: string | null
          user_type: Database["public"]["Enums"]["user_type_enum"] | null
          username: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_anonymous?: boolean | null
          onboarding_completed?: boolean | null
          phone?: string | null
          user_type?: Database["public"]["Enums"]["user_type_enum"] | null
          username?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_anonymous?: boolean | null
          onboarding_completed?: boolean | null
          phone?: string | null
          user_type?: Database["public"]["Enums"]["user_type_enum"] | null
          username?: string | null
        }
        Relationships: []
      }
      report_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          notes: string | null
          report_id: string | null
          viewed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          notes?: string | null
          report_id?: string | null
          viewed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          report_id?: string | null
          viewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_audit_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_services: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          note: string | null
          report_id: string
          service_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          note?: string | null
          report_id: string
          service_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          note?: string | null
          report_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_services_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          activism_context: string | null
          assigned_to: string | null
          attack_nature:
            | Database["public"]["Enums"]["attack_nature_enum"]
            | null
          channel: Database["public"]["Enums"]["channel_enum"] | null
          consent_to_followup: boolean | null
          contact_method: string | null
          contact_value: string | null
          county: string | null
          created_at: string | null
          defender_notes: string | null
          derogatory_words: string[] | null
          description: string | null
          evidence_types: string[] | null
          how_description: string | null
          id: string
          incident_types: string[]
          is_ongoing: boolean | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          occurred_at: string | null
          occurred_time: string | null
          perpetrator_detail: string | null
          perpetrator_type:
            | Database["public"]["Enums"]["perpetrator_type_enum"]
            | null
          reporter_type:
            | Database["public"]["Enums"]["reporter_type_enum"]
            | null
          reporting_for:
            | Database["public"]["Enums"]["reporting_for_enum"]
            | null
          status: Database["public"]["Enums"]["report_status_enum"] | null
          support_needed: string[] | null
          tfgbv_content_text: string | null
          tfgbv_link: string | null
          tfgbv_platform: string | null
          tfgbv_screenshot_urls: string[] | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_enum"] | null
          user_id: string | null
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at: string | null
          verified_by: string | null
          what_description: string | null
        }
        Insert: {
          activism_context?: string | null
          assigned_to?: string | null
          attack_nature?:
            | Database["public"]["Enums"]["attack_nature_enum"]
            | null
          channel?: Database["public"]["Enums"]["channel_enum"] | null
          consent_to_followup?: boolean | null
          contact_method?: string | null
          contact_value?: string | null
          county?: string | null
          created_at?: string | null
          defender_notes?: string | null
          derogatory_words?: string[] | null
          description?: string | null
          evidence_types?: string[] | null
          how_description?: string | null
          id?: string
          incident_types?: string[]
          is_ongoing?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          occurred_at?: string | null
          occurred_time?: string | null
          perpetrator_detail?: string | null
          perpetrator_type?:
            | Database["public"]["Enums"]["perpetrator_type_enum"]
            | null
          reporter_type?:
            | Database["public"]["Enums"]["reporter_type_enum"]
            | null
          reporting_for?:
            | Database["public"]["Enums"]["reporting_for_enum"]
            | null
          status?: Database["public"]["Enums"]["report_status_enum"] | null
          support_needed?: string[] | null
          tfgbv_content_text?: string | null
          tfgbv_link?: string | null
          tfgbv_platform?: string | null
          tfgbv_screenshot_urls?: string[] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_enum"] | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          what_description?: string | null
        }
        Update: {
          activism_context?: string | null
          assigned_to?: string | null
          attack_nature?:
            | Database["public"]["Enums"]["attack_nature_enum"]
            | null
          channel?: Database["public"]["Enums"]["channel_enum"] | null
          consent_to_followup?: boolean | null
          contact_method?: string | null
          contact_value?: string | null
          county?: string | null
          created_at?: string | null
          defender_notes?: string | null
          derogatory_words?: string[] | null
          description?: string | null
          evidence_types?: string[] | null
          how_description?: string | null
          id?: string
          incident_types?: string[]
          is_ongoing?: boolean | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          occurred_at?: string | null
          occurred_time?: string | null
          perpetrator_detail?: string | null
          perpetrator_type?:
            | Database["public"]["Enums"]["perpetrator_type_enum"]
            | null
          reporter_type?:
            | Database["public"]["Enums"]["reporter_type_enum"]
            | null
          reporting_for?:
            | Database["public"]["Enums"]["reporting_for_enum"]
            | null
          status?: Database["public"]["Enums"]["report_status_enum"] | null
          support_needed?: string[] | null
          tfgbv_content_text?: string | null
          tfgbv_link?: string | null
          tfgbv_platform?: string | null
          tfgbv_screenshot_urls?: string[] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_enum"] | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          what_description?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category_enum"]
          contact_email: string | null
          contact_phone: string | null
          contact_url: string | null
          county: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category_enum"]
          contact_email?: string | null
          contact_phone?: string | null
          contact_url?: string | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category_enum"]
          contact_email?: string | null
          contact_phone?: string | null
          contact_url?: string | null
          county?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization?: string | null
        }
        Relationships: []
      }
      ussd_sessions: {
        Row: {
          created_at: string | null
          current_step: string | null
          id: string
          phone_number: string | null
          report_id: string | null
          session_data: Json | null
          session_id: string
          text_input: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: string | null
          id?: string
          phone_number?: string | null
          report_id?: string | null
          session_data?: Json | null
          session_id: string
          text_input?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: string | null
          id?: string
          phone_number?: string | null
          report_id?: string | null
          session_data?: Json | null
          session_id?: string
          text_input?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ussd_sessions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_report: {
        Args: { p_defender_id: string; p_report_id: string }
        Returns: undefined
      }
      get_my_user_type: { Args: never; Returns: string }
      get_report_stats: { Args: never; Returns: Json }
      get_user_report_count: { Args: { p_user_id: string }; Returns: number }
      update_report_status: {
        Args: {
          p_new_status: Database["public"]["Enums"]["report_status_enum"]
          p_notes?: string
          p_report_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      attack_nature_enum: "coordinated" | "bot_assisted" | "organic" | "unknown"
      channel_enum: "web" | "ussd" | "api" | "mobile"
      perpetrator_type_enum:
        | "government"
        | "security_forces"
        | "intimate_partner"
        | "family_member"
        | "community_member"
        | "employer"
        | "online_troll"
        | "unknown"
        | "other"
      report_status_enum:
        | "submitted"
        | "under_review"
        | "referred"
        | "closed"
        | "flagged"
      reporter_type_enum: "anonymous" | "authenticated"
      reporting_for_enum: "self" | "someone_else" | "community_leader"
      service_category_enum:
        | "legal"
        | "medical"
        | "psychosocial"
        | "shelter"
        | "digital_security"
        | "financial"
        | "referral"
        | "other"
      urgency_enum: "immediate" | "within_week" | "no_rush"
      user_type_enum: "reporter" | "defender" | "admin"
      verification_status_enum:
        | "pending"
        | "verified"
        | "unverified"
        | "needs_more_info"
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
      attack_nature_enum: ["coordinated", "bot_assisted", "organic", "unknown"],
      channel_enum: ["web", "ussd", "api", "mobile"],
      perpetrator_type_enum: [
        "government",
        "security_forces",
        "intimate_partner",
        "family_member",
        "community_member",
        "employer",
        "online_troll",
        "unknown",
        "other",
      ],
      report_status_enum: [
        "submitted",
        "under_review",
        "referred",
        "closed",
        "flagged",
      ],
      reporter_type_enum: ["anonymous", "authenticated"],
      reporting_for_enum: ["self", "someone_else", "community_leader"],
      service_category_enum: [
        "legal",
        "medical",
        "psychosocial",
        "shelter",
        "digital_security",
        "financial",
        "referral",
        "other",
      ],
      urgency_enum: ["immediate", "within_week", "no_rush"],
      user_type_enum: ["reporter", "defender", "admin"],
      verification_status_enum: [
        "pending",
        "verified",
        "unverified",
        "needs_more_info",
      ],
    },
  },
} as const
