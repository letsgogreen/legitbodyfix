import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Isolated schema extension until generated database types include the migration.
export const giftClient = supabase as unknown as SupabaseClient;
export type GiftedLesson = { id: string; title: string; duration_seconds: number | null; stream_status: string | null };
export type LessonGift = { id: string; recipient_email: string; lesson_id: string; recipient_user_id: string | null; created_at: string; revoked_at: string | null };
