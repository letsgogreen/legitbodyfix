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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      guide_muscles: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          muscle_id: string
          role: Database["public"]["Enums"]["recipe_muscle_role"] | null
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          muscle_id: string
          role?: Database["public"]["Enums"]["recipe_muscle_role"] | null
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          muscle_id?: string
          role?: Database["public"]["Enums"]["recipe_muscle_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_muscles_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_muscles_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_programs: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          position: number | null
          program_id: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          position?: number | null
          program_id: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          position?: number | null
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_programs_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_recipes: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          position: number | null
          recipe_id: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          position?: number | null
          recipe_id: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          position?: number | null
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_recipes_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          common_regions: string[]
          created_at: string
          id: string
          pattern_summary: string | null
          published: boolean
          published_at: string | null
          review_status: Database["public"]["Enums"]["content_review_status"]
          self_check: string | null
          slug: string
          title: string
          updated_at: string
          watch_for: string | null
        }
        Insert: {
          common_regions?: string[]
          created_at?: string
          id?: string
          pattern_summary?: string | null
          published?: boolean
          published_at?: string | null
          review_status?: Database["public"]["Enums"]["content_review_status"]
          self_check?: string | null
          slug: string
          title: string
          updated_at?: string
          watch_for?: string | null
        }
        Update: {
          common_regions?: string[]
          created_at?: string
          id?: string
          pattern_summary?: string | null
          published?: boolean
          published_at?: string | null
          review_status?: Database["public"]["Enums"]["content_review_status"]
          self_check?: string | null
          slug?: string
          title?: string
          updated_at?: string
          watch_for?: string | null
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          affected_muscle_ids: string[]
          allow_empty_overwrite: boolean
          committed_at: string | null
          conflict_count: number
          created_at: string
          created_by: string | null
          created_by_email: string | null
          errors: Json
          id: string
          invalid_count: number
          new_count: number
          rolled_back_at: string | null
          source_filename: string | null
          source_format: string | null
          status: Database["public"]["Enums"]["import_batch_status"]
          total_rows: number
          unchanged_count: number
          updated_at: string
          updated_count: number
        }
        Insert: {
          affected_muscle_ids?: string[]
          allow_empty_overwrite?: boolean
          committed_at?: string | null
          conflict_count?: number
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          errors?: Json
          id?: string
          invalid_count?: number
          new_count?: number
          rolled_back_at?: string | null
          source_filename?: string | null
          source_format?: string | null
          status?: Database["public"]["Enums"]["import_batch_status"]
          total_rows?: number
          unchanged_count?: number
          updated_at?: string
          updated_count?: number
        }
        Update: {
          affected_muscle_ids?: string[]
          allow_empty_overwrite?: boolean
          committed_at?: string | null
          conflict_count?: number
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          errors?: Json
          id?: string
          invalid_count?: number
          new_count?: number
          rolled_back_at?: string | null
          source_filename?: string | null
          source_format?: string | null
          status?: Database["public"]["Enums"]["import_batch_status"]
          total_rows?: number
          unchanged_count?: number
          updated_at?: string
          updated_count?: number
        }
        Relationships: []
      }
      import_rows: {
        Row: {
          applied: boolean
          batch_id: string
          created_at: string
          diff: Json
          id: string
          issues: Json
          matched_by: string | null
          matched_muscle_id: string | null
          outcome: Database["public"]["Enums"]["import_row_outcome"]
          parsed_data: Json
          previous_snapshot: Json | null
          raw_data: Json
          row_number: number
        }
        Insert: {
          applied?: boolean
          batch_id: string
          created_at?: string
          diff?: Json
          id?: string
          issues?: Json
          matched_by?: string | null
          matched_muscle_id?: string | null
          outcome: Database["public"]["Enums"]["import_row_outcome"]
          parsed_data?: Json
          previous_snapshot?: Json | null
          raw_data?: Json
          row_number: number
        }
        Update: {
          applied?: boolean
          batch_id?: string
          created_at?: string
          diff?: Json
          id?: string
          issues?: Json
          matched_by?: string | null
          matched_muscle_id?: string | null
          outcome?: Database["public"]["Enums"]["import_row_outcome"]
          parsed_data?: Json
          previous_snapshot?: Json | null
          raw_data?: Json
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_aliases: {
        Row: {
          alias: string
          alias_normalized: string | null
          created_at: string
          id: string
          muscle_id: string
        }
        Insert: {
          alias: string
          alias_normalized?: string | null
          created_at?: string
          id?: string
          muscle_id: string
        }
        Update: {
          alias?: string
          alias_normalized?: string | null
          created_at?: string
          id?: string
          muscle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "muscle_aliases_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_candidates: {
        Row: {
          ai_draft_functions: string | null
          ai_draft_origin_insertion: string | null
          ai_keywords: string[]
          candidate_name: string
          created_at: string
          group_hint: string | null
          id: string
          last_synced_at: string | null
          match_score: number | null
          match_status: Database["public"]["Enums"]["candidate_match_status"]
          matched_by: string | null
          matched_muscle_id: string | null
          notion_page_id: string
          notion_url: string | null
          raw_properties: Json
          reviewer_notes: string | null
          updated_at: string
        }
        Insert: {
          ai_draft_functions?: string | null
          ai_draft_origin_insertion?: string | null
          ai_keywords?: string[]
          candidate_name: string
          created_at?: string
          group_hint?: string | null
          id?: string
          last_synced_at?: string | null
          match_score?: number | null
          match_status?: Database["public"]["Enums"]["candidate_match_status"]
          matched_by?: string | null
          matched_muscle_id?: string | null
          notion_page_id: string
          notion_url?: string | null
          raw_properties?: Json
          reviewer_notes?: string | null
          updated_at?: string
        }
        Update: {
          ai_draft_functions?: string | null
          ai_draft_origin_insertion?: string | null
          ai_keywords?: string[]
          candidate_name?: string
          created_at?: string
          group_hint?: string | null
          id?: string
          last_synced_at?: string | null
          match_score?: number | null
          match_status?: Database["public"]["Enums"]["candidate_match_status"]
          matched_by?: string | null
          matched_muscle_id?: string | null
          notion_page_id?: string
          notion_url?: string | null
          raw_properties?: Json
          reviewer_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "muscle_candidates_matched_muscle_id_fkey"
            columns: ["matched_muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_revisions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          import_batch_id: string | null
          muscle_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          import_batch_id?: string | null
          muscle_id: string
          snapshot: Json
          version: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          import_batch_id?: string | null
          muscle_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "muscle_revisions_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      muscles: {
        Row: {
          anatomical_group: string | null
          anatomy_approved_at: string | null
          body_map: string | null
          created_at: string
          crop_x: number | null
          crop_y: number | null
          crop_zoom: number | null
          description: string | null
          external_id: string | null
          functions: string[]
          id: string
          image_alt: string | null
          image_approved_at: string | null
          image_credit: string | null
          image_hash: string | null
          image_license: string | null
          image_source_url: string | null
          image_status: Database["public"]["Enums"]["image_review_status"]
          image_url: string | null
          insertion: string | null
          last_import_batch_id: string | null
          last_imported_at: string | null
          latin_name: string | null
          muscle_family: string | null
          name: string
          origin: string | null
          published: boolean
          published_at: string | null
          related_video_ids: string | null
          review_status: Database["public"]["Enums"]["content_review_status"]
          slug: string
          source_name: string | null
          source_url: string | null
          updated_at: string
          version: number
        }
        Insert: {
          anatomical_group?: string | null
          anatomy_approved_at?: string | null
          body_map?: string | null
          created_at?: string
          crop_x?: number | null
          crop_y?: number | null
          crop_zoom?: number | null
          description?: string | null
          external_id?: string | null
          functions?: string[]
          id: string
          image_alt?: string | null
          image_approved_at?: string | null
          image_credit?: string | null
          image_hash?: string | null
          image_license?: string | null
          image_source_url?: string | null
          image_status?: Database["public"]["Enums"]["image_review_status"]
          image_url?: string | null
          insertion?: string | null
          last_import_batch_id?: string | null
          last_imported_at?: string | null
          latin_name?: string | null
          muscle_family?: string | null
          name: string
          origin?: string | null
          published?: boolean
          published_at?: string | null
          related_video_ids?: string | null
          review_status?: Database["public"]["Enums"]["content_review_status"]
          slug: string
          source_name?: string | null
          source_url?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          anatomical_group?: string | null
          anatomy_approved_at?: string | null
          body_map?: string | null
          created_at?: string
          crop_x?: number | null
          crop_y?: number | null
          crop_zoom?: number | null
          description?: string | null
          external_id?: string | null
          functions?: string[]
          id?: string
          image_alt?: string | null
          image_approved_at?: string | null
          image_credit?: string | null
          image_hash?: string | null
          image_license?: string | null
          image_source_url?: string | null
          image_status?: Database["public"]["Enums"]["image_review_status"]
          image_url?: string | null
          insertion?: string | null
          last_import_batch_id?: string | null
          last_imported_at?: string | null
          latin_name?: string | null
          muscle_family?: string | null
          name?: string
          origin?: string | null
          published?: boolean
          published_at?: string | null
          related_video_ids?: string | null
          review_status?: Database["public"]["Enums"]["content_review_status"]
          slug?: string
          source_name?: string | null
          source_url?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "muscles_last_import_batch_id_fkey"
            columns: ["last_import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      program_recipes: {
        Row: {
          created_at: string
          id: string
          position: number | null
          program_id: string
          recipe_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number | null
          program_id: string
          recipe_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number | null
          program_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_recipes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: { created_at: string; display_name: string | null; email: string | null; updated_at: string; user_id: string }
        Insert: { created_at?: string; display_name?: string | null; email?: string | null; updated_at?: string; user_id: string }
        Update: { created_at?: string; display_name?: string | null; email?: string | null; updated_at?: string; user_id?: string }
        Relationships: []
      }
      entitlements: {
        Row: { active: boolean; created_at: string; granted_at: string; id: string; order_id: string | null; program_id: string; revoked_at: string | null; source: string; updated_at: string; user_id: string }
        Insert: { active?: boolean; created_at?: string; granted_at?: string; id?: string; order_id?: string | null; program_id: string; revoked_at?: string | null; source?: string; updated_at?: string; user_id: string }
        Update: { active?: boolean; created_at?: string; granted_at?: string; id?: string; order_id?: string | null; program_id?: string; revoked_at?: string | null; source?: string; updated_at?: string; user_id?: string }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          module_id: string | null
          position: number
          preview_free: boolean
          program_id: string
          published: boolean
          slug: string
          summary: string | null
          stream_error: string | null
          stream_status: string
          stream_thumbnail_url: string | null
          stream_uid: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_path: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          module_id?: string | null
          position?: number
          preview_free?: boolean
          program_id: string
          published?: boolean
          slug: string
          summary?: string | null
          stream_error?: string | null
          stream_status?: string
          stream_thumbnail_url?: string | null
          stream_uid?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_path?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          module_id?: string | null
          position?: number
          preview_free?: boolean
          program_id?: string
          published?: boolean
          slug?: string
          summary?: string | null
          stream_error?: string | null
          stream_status?: string
          stream_thumbnail_url?: string | null
          stream_uid?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_path?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: { amount_total: number; created_at: string; currency: string; customer_email: string | null; id: string; program_id: string | null; purchased_at: string | null; status: string; stripe_checkout_session_id: string | null; stripe_payment_intent_id: string | null; updated_at: string; user_id: string | null }
        Insert: { amount_total?: number; created_at?: string; currency?: string; customer_email?: string | null; id?: string; program_id?: string | null; purchased_at?: string | null; status?: string; stripe_checkout_session_id?: string | null; stripe_payment_intent_id?: string | null; updated_at?: string; user_id?: string | null }
        Update: { amount_total?: number; created_at?: string; currency?: string; customer_email?: string | null; id?: string; program_id?: string | null; purchased_at?: string | null; status?: string; stripe_checkout_session_id?: string | null; stripe_payment_intent_id?: string | null; updated_at?: string; user_id?: string | null }
        Relationships: []
      }
      program_modules: {
        Row: {
          created_at: string
          id: string
          position: number
          program_id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          program_id: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          program_id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          duration_label: string | null
          entitlement_key: string | null
          featured: boolean
          featured_rank: number | null
          format: string | null
          goals: string[]
          id: string
          image_alt: string | null
          image_url: string | null
          level: string | null
          name: string
          outcome: string | null
          published: boolean
          regions: string[]
          slug: string
          stripe_price_id: string | null
          stripe_price_lookup_key: string | null
          stripe_product_id: string | null
          updated_at: string
          who_its_for: string | null
        }
        Insert: {
          created_at?: string
          duration_label?: string | null
          entitlement_key?: string | null
          featured?: boolean
          featured_rank?: number | null
          format?: string | null
          goals?: string[]
          id?: string
          image_alt?: string | null
          image_url?: string | null
          level?: string | null
          name: string
          outcome?: string | null
          published?: boolean
          regions?: string[]
          slug: string
          stripe_price_id?: string | null
          stripe_price_lookup_key?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          who_its_for?: string | null
        }
        Update: {
          created_at?: string
          duration_label?: string | null
          entitlement_key?: string | null
          featured?: boolean
          featured_rank?: number | null
          format?: string | null
          goals?: string[]
          id?: string
          image_alt?: string | null
          image_url?: string | null
          level?: string | null
          name?: string
          outcome?: string | null
          published?: boolean
          regions?: string[]
          slug?: string
          stripe_price_id?: string | null
          stripe_price_lookup_key?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          who_its_for?: string | null
        }
        Relationships: []
      }
      recipe_muscles: {
        Row: {
          created_at: string
          id: string
          muscle_id: string
          recipe_id: string
          role: Database["public"]["Enums"]["recipe_muscle_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_id: string
          recipe_id: string
          role: Database["public"]["Enums"]["recipe_muscle_role"]
        }
        Update: {
          created_at?: string
          id?: string
          muscle_id?: string
          recipe_id?: string
          role?: Database["public"]["Enums"]["recipe_muscle_role"]
        }
        Relationships: [
          {
            foreignKeyName: "recipe_muscles_muscle_id_fkey"
            columns: ["muscle_id"]
            isOneToOne: false
            referencedRelation: "muscles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_muscles_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          assessment_clues: string | null
          created_at: string
          dosage: string | null
          equipment: string[]
          evidence: string | null
          featured: boolean
          featured_rank: number | null
          goal: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          instructions: string | null
          internal_notes: string | null
          last_reviewed_at: string | null
          last_synced_at: string | null
          movement_functions: string[]
          notion_page_id: string | null
          notion_status: string | null
          notion_url: string | null
          progression_level:
            | Database["public"]["Enums"]["recipe_progression_level"]
            | null
          published: boolean
          published_at: string | null
          regions: string[]
          review_status: Database["public"]["Enums"]["content_review_status"]
          safety_notes: string | null
          session_minutes: number | null
          slug: string
          summary: string | null
          symptoms_goals: string[]
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          assessment_clues?: string | null
          created_at?: string
          dosage?: string | null
          equipment?: string[]
          evidence?: string | null
          featured?: boolean
          featured_rank?: number | null
          goal?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          instructions?: string | null
          internal_notes?: string | null
          last_reviewed_at?: string | null
          last_synced_at?: string | null
          movement_functions?: string[]
          notion_page_id?: string | null
          notion_status?: string | null
          notion_url?: string | null
          progression_level?:
            | Database["public"]["Enums"]["recipe_progression_level"]
            | null
          published?: boolean
          published_at?: string | null
          regions?: string[]
          review_status?: Database["public"]["Enums"]["content_review_status"]
          safety_notes?: string | null
          session_minutes?: number | null
          slug: string
          summary?: string | null
          symptoms_goals?: string[]
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          assessment_clues?: string | null
          created_at?: string
          dosage?: string | null
          equipment?: string[]
          evidence?: string | null
          featured?: boolean
          featured_rank?: number | null
          goal?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          instructions?: string | null
          internal_notes?: string | null
          last_reviewed_at?: string | null
          last_synced_at?: string | null
          movement_functions?: string[]
          notion_page_id?: string | null
          notion_status?: string | null
          notion_url?: string | null
          progression_level?:
            | Database["public"]["Enums"]["recipe_progression_level"]
            | null
          published?: boolean
          published_at?: string | null
          regions?: string[]
          review_status?: Database["public"]["Enums"]["content_review_status"]
          safety_notes?: string | null
          session_minutes?: number | null
          slug?: string
          summary?: string | null
          symptoms_goals?: string[]
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      candidate_match_status:
        | "unmatched"
        | "matched"
        | "possible_duplicate"
        | "merged"
        | "rejected"
      content_review_status:
        | "draft"
        | "needs_data_review"
        | "needs_image_review"
        | "needs_anatomy_review"
        | "ready_to_publish"
        | "published"
        | "archived"
      image_review_status:
        | "pending"
        | "approved"
        | "replacement_requested"
        | "missing"
      import_batch_status:
        | "draft"
        | "previewed"
        | "committed"
        | "rolled_back"
        | "failed"
      import_row_outcome:
        | "new"
        | "updated"
        | "unchanged"
        | "conflict"
        | "invalid"
      recipe_muscle_role: "tight" | "weak"
      recipe_progression_level:
        | "reset_tolerance"
        | "mobility"
        | "activation"
        | "control"
        | "integration"
        | "loaded_performance"
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
      candidate_match_status: [
        "unmatched",
        "matched",
        "possible_duplicate",
        "merged",
        "rejected",
      ],
      content_review_status: [
        "draft",
        "needs_data_review",
        "needs_image_review",
        "needs_anatomy_review",
        "ready_to_publish",
        "published",
        "archived",
      ],
      image_review_status: [
        "pending",
        "approved",
        "replacement_requested",
        "missing",
      ],
      import_batch_status: [
        "draft",
        "previewed",
        "committed",
        "rolled_back",
        "failed",
      ],
      import_row_outcome: [
        "new",
        "updated",
        "unchanged",
        "conflict",
        "invalid",
      ],
      recipe_muscle_role: ["tight", "weak"],
      recipe_progression_level: [
        "reset_tolerance",
        "mobility",
        "activation",
        "control",
        "integration",
        "loaded_performance",
      ],
    },
  },
} as const
