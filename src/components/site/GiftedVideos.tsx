import { useEffect, useRef, useState } from "react";
import { giftClient, type GiftedLesson } from "@/lib/lesson-gifts";
import { getStreamPlayback } from "@/lib/stream.functions";

export function GiftedVideos() {
  const [lessons, setLessons] = useState<GiftedLesson[]>([]);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState<{ title: string; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await giftClient.rpc("my_gifted_lessons");
      if (cancelled) return;
      if (error) { setMessage("Gifted videos could not be loaded. Please try again later."); return; }
      setLessons(data as GiftedLesson[]);
    })().catch(() => { if (!cancelled) setMessage("Gifted videos could not be loaded."); });
    return () => { cancelled = true; };
  }, []);
  async function play(lesson: GiftedLesson) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setPlaying(null); setMessage("");
    try {
      const result = await getStreamPlayback({ data: { lessonId: lesson.id } });
      setPlaying({ title: lesson.title, url: result.iframeUrl });
    } catch { setMessage("This gift is unavailable or the video is not ready."); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className="mt-10 border border-border bg-card p-5" aria-label="Gifted videos">
    <h2 className="text-2xl font-bold">Gifted videos</h2>
    <p role="status" className="mt-2 text-sm text-muted-foreground">{message || (busy ? "Loading video…" : lessons.length ? "These gifts unlock only the listed videos." : "Gifts sent to your verified email will appear here.")}</p>
    {playing && <div className="mt-4"><h3 className="mb-2 font-bold">{playing.title}</h3><iframe src={playing.url} title={playing.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full border-0" /></div>}
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">{lessons.map(lesson => <li key={lesson.id}><button onClick={() => void play(lesson)} disabled={busy || lesson.stream_status !== "ready"} className="min-h-12 w-full border border-border p-4 text-left font-bold disabled:opacity-50">{lesson.title}{lesson.stream_status !== "ready" ? " · Processing" : " · Play"}</button></li>)}</ul>
  </section>;
}
