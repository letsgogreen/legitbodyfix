import type { Database } from "@/integrations/supabase/types";

type StreamLesson = Pick<Database["public"]["Tables"]["lessons"]["Row"], "stream_uid" | "stream_status">;

// Metadata readiness, not a guarantee that a signed playback request succeeds.
export function isLessonVideoReady(lesson: StreamLesson): boolean {
  return Boolean(lesson.stream_uid?.trim()) && lesson.stream_status === "ready";
}
