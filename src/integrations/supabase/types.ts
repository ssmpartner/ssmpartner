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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          description_de: string | null
          description_en: string | null
          description_fr: string | null
          description_it: string | null
          email: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          leader_image_url: string | null
          leader_name: string | null
          leader_role: string | null
          map_lat: number | null
          map_lng: number | null
          name: string
          opening_hours: string | null
          phone: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_it?: string | null
          email?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          leader_image_url?: string | null
          leader_name?: string | null
          leader_role?: string | null
          map_lat?: number | null
          map_lng?: number | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_it?: string | null
          email?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          leader_image_url?: string | null
          leader_name?: string | null
          leader_role?: string | null
          map_lat?: number | null
          map_lng?: number | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          agency_id: string
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_reviews: {
        Row: {
          active: boolean
          agency_id: string
          author_name: string
          created_at: string
          id: string
          rating: number
          sort_order: number
          text: string | null
        }
        Insert: {
          active?: boolean
          agency_id: string
          author_name: string
          created_at?: string
          id?: string
          rating?: number
          sort_order?: number
          text?: string | null
        }
        Update: {
          active?: boolean
          agency_id?: string
          author_name?: string
          created_at?: string
          id?: string
          rating?: number
          sort_order?: number
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_reviews_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          project_key: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          project_key?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          project_key?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      career_faqs: {
        Row: {
          active: boolean
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      career_videos: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string | null
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          page_url: string | null
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_url?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_url?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_knowledge: {
        Row: {
          active: boolean
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          agency_id: string | null
          agency_name: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          recipient_name: string | null
          source: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          agency_name?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          recipient_name?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          agency_name?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          recipient_name?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_positions: {
        Row: {
          active: boolean
          created_at: string
          description_de: string | null
          description_en: string | null
          description_fr: string | null
          description_it: string | null
          id: string
          location: string | null
          sort_order: number
          title: string
          updated_at: string
          workload: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_it?: string | null
          id?: string
          location?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          workload?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_it?: string | null
          id?: string
          location?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          workload?: string | null
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label_de: string
          label_en: string | null
          label_fr: string | null
          label_it: string | null
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label_de: string
          label_en?: string | null
          label_fr?: string | null
          label_it?: string | null
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label_de?: string
          label_en?: string | null
          label_fr?: string | null
          label_it?: string | null
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      page_heroes: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string | null
          page_key: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_key: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_access: {
        Row: {
          active: boolean
          created_at: string
          granted_by: string | null
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          granted_by?: string | null
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          granted_by?: string | null
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "sso_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          body: string | null
          created_at: string
          id: string
          lang: string
          link_text: string | null
          link_url: string | null
          page: string
          section_key: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          lang?: string
          link_text?: string | null
          link_url?: string | null
          page: string
          section_key: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          lang?: string
          link_text?: string | null
          link_url?: string | null
          page?: string
          section_key?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      slider_images: {
        Row: {
          active: boolean
          alt_text: string | null
          created_at: string
          headline: string | null
          id: string
          image_url: string
          mobile_image_url: string | null
          sort_order: number
          subline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt_text?: string | null
          created_at?: string
          headline?: string | null
          id?: string
          image_url: string
          mobile_image_url?: string | null
          sort_order?: number
          subline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt_text?: string | null
          created_at?: string
          headline?: string | null
          id?: string
          image_url?: string
          mobile_image_url?: string | null
          sort_order?: number
          subline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sso_projects: {
        Row: {
          active: boolean
          api_secret: string | null
          api_url: string | null
          created_at: string
          id: string
          name: string
          project_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          api_secret?: string | null
          api_url?: string | null
          created_at?: string
          id?: string
          name: string
          project_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          api_secret?: string | null
          api_url?: string | null
          created_at?: string
          id?: string
          name?: string
          project_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      sso_redirect_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          project_key: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          project_key: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          project_key?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean
          agency_id: string | null
          badge: string | null
          category: string
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          is_agency_leader: boolean
          is_recruiting_partner: boolean
          name: string
          phone: string | null
          role_de: string | null
          role_en: string | null
          role_fr: string | null
          role_it: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          agency_id?: string | null
          badge?: string | null
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_agency_leader?: boolean
          is_recruiting_partner?: boolean
          name: string
          phone?: string | null
          role_de?: string | null
          role_en?: string | null
          role_fr?: string | null
          role_it?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          agency_id?: string | null
          badge?: string | null
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          is_agency_leader?: boolean
          is_recruiting_partner?: boolean
          name?: string
          phone?: string | null
          role_de?: string | null
          role_en?: string | null
          role_fr?: string | null
          role_it?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
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
      vag45_downloads: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          lang: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          lang: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          lang?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      vag45_partners: {
        Row: {
          active: boolean
          address: string
          branch: string
          category: string
          company: string
          contact_email: string
          created_at: string
          id: string
          privacy_url: string
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string
          branch?: string
          category?: string
          company?: string
          contact_email?: string
          created_at?: string
          id?: string
          privacy_url?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          branch?: string
          category?: string
          company?: string
          contact_email?: string
          created_at?: string
          id?: string
          privacy_url?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      wizard_pricing: {
        Row: {
          active: boolean
          api_source: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          label: string
          price_text: string
          price_value: number | null
          sort_order: number
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          api_source?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          price_text?: string
          price_value?: number | null
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          api_source?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          price_text?: string
          price_value?: number | null
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "admin"
        | "backoffice"
        | "analyst"
        | "teamleiter"
        | "controlling"
        | "geschaeftsleitung"
        | "hr"
        | "agency_manager"
        | "vertriebsleiter"
        | "agenturleiter"
        | "finanzcoach"
        | "trainee"
        | "verkaufsleiter"
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
      app_role: [
        "superadmin",
        "admin",
        "backoffice",
        "analyst",
        "teamleiter",
        "controlling",
        "geschaeftsleitung",
        "hr",
        "agency_manager",
        "vertriebsleiter",
        "agenturleiter",
        "finanzcoach",
        "trainee",
        "verkaufsleiter",
      ],
    },
  },
} as const
