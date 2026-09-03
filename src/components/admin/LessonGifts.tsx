import { useEffect, useState, type FormEvent } from "react";
import { giftClient, type LessonGift } from "@/lib/lesson-gifts";

type Choice = { id: string; title: string; published: boolean; stream_status: string | null; stream_uid: string | null };
export function LessonGifts() {
  const [lessons, setLessons] = useState<Choice[]>([]);
  const [gifts, setGifts] = useState<LessonGift[]>([]);
  const [email, setEmail] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() {
    const [catalog, history] = await Promise.all([
      giftClient.from("lessons").select("id,title,published,stream_status,stream_uid").order("title"),
      giftClient.from("lesson_gifts").select("id,recipient_email,lesson_id,recipient_user_id,created_at,revoked_at").order("created_at", { ascending: false }).limit(100),
    ]);
    if (catalog.error || history.error) throw new Error("Gift access is unavailable. Check the lesson-gifts database migration and administrator permissions.");
    setLessons(catalog.data as Choice[]);
    setGifts(history.data as LessonGift[]);
    setReady(true);
  }
  useEffect(() => { void load().catch(error => setMessage(error.message)); }, []);
  async function grant(event: FormEvent) {
    event.preventDefault();
    if (busy || !ready) return;
    const recipient = email.trim().toLowerCase();
    const lesson = lessons.find(item => item.id === lessonId);
    if (!lesson || !window.confirm(`Gift only "${lesson.title}" to ${recipient}? No email notification will be sent.`)) return;
    setBusy(true); setMessage("");
    try {
      const { error } = await giftClient.from("lesson_gifts").insert({ recipient_email: recipient, lesson_id: lessonId });
      if (error) throw new Error(error.code === "23505" ? "An active gift already exists for this email and video." : "Could not grant access. Check permissions and video availability.");
      await load();
      setMessage("Gift saved. The recipient can sign in at /library with this verified email. No email was sent.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save gift."); }
    finally { setBusy(false); }
  }
  async function revoke(gift: LessonGift) {
    if (busy || !window.confirm(`Revoke this video gift for ${gift.recipient_email}? Purchased access is unaffected.`)) return;
    setBusy(true); setMessage("");
    try {
      const { data, error } = await giftClient.from("lesson_gifts").update({ revoked_at: new Date().toISOString() }).eq("id", gift.id).is("revoked_at", null).select("id");
      if (error || !data?.length) throw new Error("Could not revoke gift. Refresh and try again.");
      await load(); setMessage("Gift revoked. Previously issued playback links may remain valid until they expire.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not revoke gift."); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 border border-border bg-card p-5" aria-label="Gift a video">
    <h2 className="text-xl font-bold">Gift a video</h2>
    <p className="mt-2 text-sm text-muted-foreground">Grant one video, not the whole program. New customers can claim it after verifying this email. No payment or automatic notification.</p>
    <form onSubmit={grant} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="grid gap-2 text-sm">Recipient email<input type="email" required maxLength={254} autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} className="border border-border bg-background p-3" /></label>
      <label className="grid gap-2 text-sm">Video<select required value={lessonId} onChange={e => setLessonId(e.target.value)} className="border border-border bg-background p-3"><option value="">Choose a video</option>{lessons.filter(item => item.published && item.stream_status === "ready" && item.stream_uid).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <button disabled={!ready || busy} className="min-h-11 bg-ink px-4 font-bold text-ink-foreground disabled:opacity-50">{busy ? "Saving…" : "Grant video gift"}</button>
    </form>
    <p role="status" className="mt-3 text-sm">{message}</p>
    <h3 className="mt-6 font-bold">Latest 100 gifts</h3>
    <ul className="mt-3 divide-y divide-border">{gifts.map(gift => <li key={gift.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p>{lessons.find(item => item.id === gift.lesson_id)?.title ?? "Video"}</p><p className="text-muted-foreground">{gift.recipient_email} · {gift.revoked_at ? "Revoked" : gift.recipient_user_id ? "Claimed" : "Awaiting login"}</p></div>{!gift.revoked_at && <button disabled={busy} onClick={() => void revoke(gift)} className="border border-border px-3 py-2 disabled:opacity-50">Revoke gift</button>}</li>)}</ul>
  </section>;
}
