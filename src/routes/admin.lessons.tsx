import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileVideo, Loader2, Play, Plus, Upload, X } from "lucide-react";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { attachStreamVideo, createStreamTusUpload, getStreamConfigurationStatus, getStreamPlayback, listStreamVideos, refreshStreamVideo, type StreamLibraryVideo } from "@/lib/stream.functions";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Module = Database["public"]["Tables"]["program_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

export const Route = createFileRoute("/admin/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons & videos — LegitBodyFix Admin" },
      { name: "description", content: "Manage real program modules, lessons and private video uploads." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LessonsView,
});

function LessonsView() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editing, setEditing] = useState<Lesson | "new" | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamConfig, setStreamConfig] = useState<{ accountId: boolean; apiToken: boolean; customerCode: boolean; webhookSecret: boolean; webhookPath: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try { setStreamConfig(await getStreamConfigurationStatus()); }
      catch { setStreamConfig(null); }
      const { data, error: readError } = await supabase.from("programs").select("*").order("name");
      if (readError) setError(readError.message);
      else {
        setPrograms(data ?? []);
        setProgramId((data ?? [])[0]?.id ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const loadCurriculum = async (selectedProgramId = programId) => {
    if (!selectedProgramId) return;
    setLoading(true);
    setError(null);
    const [moduleResult, lessonResult] = await Promise.all([
      supabase.from("program_modules").select("*").eq("program_id", selectedProgramId).order("position"),
      supabase.from("lessons").select("*").eq("program_id", selectedProgramId).order("position"),
    ]);
    if (moduleResult.error || lessonResult.error) setError(moduleResult.error?.message ?? lessonResult.error?.message ?? "Could not load curriculum.");
    else {
      setModules(moduleResult.data ?? []);
      setLessons(lessonResult.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (programId) void loadCurriculum(programId);
  }, [programId]);

  const unassigned = useMemo(() => lessons.filter((lesson) => !lesson.module_id), [lessons]);

  const addModule = async () => {
    const title = newModuleTitle.trim();
    if (!title || !programId) return;
    const { error: insertError } = await supabase.from("program_modules").insert({
      program_id: programId,
      title,
      position: modules.length + 1,
    });
    if (insertError) setError(insertError.message);
    else {
      setNewModuleTitle("");
      await loadCurriculum();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Lessons & videos"
        meta="Live Supabase curriculum · private video storage"
        actions={<Btn variant="ink" disabled={!programId} onClick={() => setEditing("new")}><Plus className="mr-1.5 h-4 w-4" /> Add lesson</Btn>}
      />

      {error && <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {streamConfig && <Panel className="mt-5 flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-bold">Cloudflare Stream</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">Webhook: {streamConfig.webhookPath}</p></div><div className="flex flex-wrap gap-2"><Tag tone={streamConfig.accountId && streamConfig.apiToken && streamConfig.customerCode ? "accent" : "warn"}>{streamConfig.accountId && streamConfig.apiToken && streamConfig.customerCode ? "Playback configured" : "Runtime keys missing"}</Tag><Tag tone={streamConfig.webhookSecret ? "accent" : "warn"}>{streamConfig.webhookSecret ? "Webhook secured" : "Webhook secret missing"}</Tag></div></Panel>}

      <div className="mt-5 flex flex-wrap gap-2">
        {programs.map((program) => (
          <button key={program.id} type="button" onClick={() => setProgramId(program.id)} className={`rounded-sm border px-3 py-1.5 text-xs font-bold transition-colors ${program.id === programId ? "border-ink bg-ink text-ink-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>
            {program.name}
          </button>
        ))}
      </div>

      {programId && (
        <Panel className="mt-5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Add curriculum module</p>
          <div className="mt-2 flex max-w-xl gap-2">
            <input value={newModuleTitle} onChange={(event) => setNewModuleTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addModule(); }} placeholder="Example: 01 — Assess" className="min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm" />
            <Btn onClick={() => void addModule()} disabled={!newModuleTitle.trim()}>Add module</Btn>
          </div>
        </Panel>
      )}

      <div className="mt-5 space-y-5">
        {loading ? (
          <Panel className="flex min-h-44 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading curriculum…</Panel>
        ) : (
          <>
            {modules.map((module) => (
              <ModulePanel key={module.id} module={module} lessons={lessons.filter((lesson) => lesson.module_id === module.id)} onEdit={setEditing} />
            ))}
            {unassigned.length > 0 && <ModulePanel module={{ id: "unassigned", title: "Unassigned lessons" } as Module} lessons={unassigned} onEdit={setEditing} />}
            {!modules.length && !lessons.length && programId && <Panel className="px-5 py-12 text-center text-sm text-muted-foreground">No curriculum yet. Add a module, then create the first lesson.</Panel>}
            {!programId && !loading && <Panel className="px-5 py-12 text-center text-sm text-muted-foreground">Create a program first, then return here to build its curriculum.</Panel>}
          </>
        )}
      </div>

      {editing && programId && <LessonDrawer lesson={editing === "new" ? null : editing} programId={programId} modules={modules} nextPosition={lessons.length + 1} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await loadCurriculum(); }} />}
    </div>
  );
}

function ModulePanel({ module, lessons, onEdit }: { module: Module; lessons: Lesson[]; onEdit: (lesson: Lesson) => void }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em]">{module.title}</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{lessons.length} lessons</span>
      </div>
      <ul className="divide-y divide-border/70">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-secondary/50">
            <div className="grid h-12 w-20 shrink-0 place-items-center rounded-sm border border-border bg-secondary">{lesson.stream_status === "ready" || lesson.video_path ? <FileVideo className="h-4 w-4 text-foreground" /> : <Play className="h-4 w-4 text-muted-foreground" />}</div>
            <div className="min-w-40 flex-1">
              <p className="text-sm font-medium"><span className="font-mono text-xs text-muted-foreground">{String(lesson.position).padStart(2, "0")}</span>{" "}{lesson.title}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{formatDuration(lesson.duration_seconds)} · {lesson.stream_uid ? `Stream ${lesson.stream_status}` : lesson.video_path ? "legacy video" : "video missing"}</p>
            </div>
            {lesson.preview_free && <Tag tone="muted">Free preview</Tag>}
            <Tag tone={lesson.published ? "accent" : "muted"}>{lesson.published ? "Published" : "Draft"}</Tag>
            <Btn onClick={() => onEdit(lesson)}>Edit</Btn>
          </li>
        ))}
        {!lessons.length && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No lessons in this module.</li>}
      </ul>
    </Panel>
  );
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "Duration not set";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function LessonDrawer({ lesson, programId, modules, nextPosition, onClose, onSaved }: { lesson: Lesson | null; programId: string; modules: Module[]; nextPosition: number; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [slug, setSlug] = useState(lesson?.slug ?? "");
  const [summary, setSummary] = useState(lesson?.summary ?? "");
  const [moduleId, setModuleId] = useState(lesson?.module_id ?? "");
  const [position, setPosition] = useState(String(lesson?.position ?? nextPosition));
  const [duration, setDuration] = useState(lesson?.duration_seconds ? String(lesson.duration_seconds) : "");
  const [videoPath] = useState(lesson?.video_path ?? "");
  const [streamUid, setStreamUid] = useState(lesson?.stream_uid ?? "");
  const [streamStatus, setStreamStatus] = useState(lesson?.stream_status ?? "not_uploaded");
  const [thumbnailUrl, setThumbnailUrl] = useState(lesson?.thumbnail_url ?? "");
  const [published, setPublished] = useState(lesson?.published ?? false);
  const [previewFree, setPreviewFree] = useState(lesson?.preview_free ?? false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [streamLibrary, setStreamLibrary] = useState<StreamLibraryVideo[]>([]);
  const [showStreamLibrary, setShowStreamLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (file: File) => {
    if (!lesson) { setError("Save the lesson before uploading its video."); return; }
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const upload = await createStreamTusUpload({ data: { lessonId: lesson.id, fileName: file.name, fileSize: file.size, maxDurationSeconds: 7200 } });
      setStreamUid(upload.uid);
      setStreamStatus("uploading");
      await uploadTusFile(upload.uploadURL, file, setUploadProgress);
      setStreamStatus("processing");
      const refreshed = await refreshStreamVideo({ data: { lessonId: lesson.id } });
      setStreamStatus(refreshed.status);
      if (refreshed.thumbnailUrl) setThumbnailUrl(refreshed.thumbnailUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
    setUploading(false);
  };

  const previewVideo = async () => {
    if (!lesson || !streamUid) return;
    try {
      const playback = await getStreamPlayback({ data: { lessonId: lesson.id } });
      window.open(playback.iframeUrl, "_blank", "noopener,noreferrer");
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  };

  const openStreamLibrary = async () => {
    if (!lesson) { setError("Save the lesson before attaching a video."); return; }
    setUploading(true);
    setError(null);
    try {
      setStreamLibrary(await listStreamVideos());
      setShowStreamLibrary(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    setUploading(false);
  };

  const attachExisting = async (video: StreamLibraryVideo) => {
    if (!lesson) return;
    setUploading(true);
    setError(null);
    try {
      const result = await attachStreamVideo({ data: { lessonId: lesson.id, streamUid: video.uid } });
      setStreamUid(video.uid);
      setStreamStatus(result.status);
      if (result.thumbnailUrl) setThumbnailUrl(result.thumbnailUrl);
      setShowStreamLibrary(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    setUploading(false);
  };

  const save = async () => {
    if (!title.trim()) { setError("Lesson title is required."); return; }
    setSaving(true);
    setError(null);
    const payload = {
      program_id: programId,
      module_id: moduleId || null,
      title: title.trim(),
      slug: (slug || title).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      summary: summary.trim() || null,
      duration_seconds: duration ? Number(duration) : null,
      video_path: videoPath || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      position: Number(position) || nextPosition,
      published,
      preview_free: previewFree,
    };
    const result = lesson ? await supabase.from("lessons").update(payload).eq("id", lesson.id) : await supabase.from("lessons").insert(payload);
    if (result.error) { setError(result.error.message); setSaving(false); return; }
    await onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-border bg-background">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{lesson ? "Editing lesson" : "New lesson"}</p><h2 className="mt-1 text-lg font-extrabold tracking-tight">{title || "Untitled lesson"}</h2></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-sm border border-border p-1.5"><X className="h-4 w-4" /></button></div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <Field label="Lesson title" value={title} onChange={setTitle} />
          <Field label="URL slug" value={slug} onChange={setSlug} placeholder="Generated from title when blank" />
          <label className="block"><Label>Module</Label><select value={moduleId} onChange={(event) => setModuleId(event.target.value)} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"><option value="">Unassigned</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><Field label="Position" value={position} onChange={setPosition} type="number" /><Field label="Duration in seconds" value={duration} onChange={setDuration} type="number" /></div>
          <label className="block"><Label>Lesson summary</Label><textarea rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm" /></label>
          <div className="border border-border bg-card p-4">
            <Label>Cloudflare Stream video</Label>
            <div className="mt-2 flex flex-wrap items-center gap-2"><label className={`inline-flex items-center rounded-sm bg-ink px-3 py-2 text-xs font-bold text-ink-foreground ${!lesson || uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><Upload className="mr-1.5 h-4 w-4" />{uploading ? `Uploading ${uploadProgress}%` : "Upload to Stream"}<input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={!lesson || uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadVideo(file); }} className="sr-only" /></label><Btn disabled={!lesson || uploading} onClick={() => void openStreamLibrary()}>Choose existing video</Btn>{streamUid && <Btn onClick={() => void previewVideo()} disabled={streamStatus !== "ready"}>Secure preview</Btn>}{lesson && streamUid && streamStatus !== "ready" && <Btn onClick={async () => { try { const result = await refreshStreamVideo({ data: { lessonId: lesson.id } }); setStreamStatus(result.status); if (result.thumbnailUrl) setThumbnailUrl(result.thumbnailUrl); } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); } }}>Refresh status</Btn>}</div>
            {uploading && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent transition-[width]" style={{ width: `${uploadProgress}%` }} /></div>}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{streamUid ? `${streamStatus} · ${streamUid}` : lesson ? "No Stream video uploaded" : "Save this lesson to enable upload"}</p>
            {videoPath && <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">Legacy Storage file retained: {videoPath}</p>}
            {showStreamLibrary && <div className="mt-4 max-h-72 overflow-y-auto border border-border bg-background"><div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-3 py-2"><span className="font-mono text-[10px] uppercase tracking-[0.12em]">Cloudflare library · {streamLibrary.length}</span><button type="button" onClick={() => setShowStreamLibrary(false)} aria-label="Close Stream library"><X className="h-4 w-4" /></button></div>{streamLibrary.map((video) => <button key={video.uid} type="button" disabled={!video.ready || !video.signed || uploading} onClick={() => void attachExisting(video)} className="flex w-full items-center gap-3 border-b border-border/70 p-3 text-left last:border-b-0 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45">{video.thumbnail ? <img src={video.thumbnail} alt="" className="h-14 w-24 rounded-sm object-cover" /> : <div className="grid h-14 w-24 place-items-center bg-secondary"><FileVideo className="h-4 w-4" /></div>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{video.name}</span><span className="mt-1 block font-mono text-[10px] text-muted-foreground">{formatDuration(video.durationSeconds)} · {video.ready ? "ready" : "processing"} · {video.signed ? "private" : "public"}</span></span></button>)}</div>}
          </div>
          <Field label="Thumbnail URL" value={thumbnailUrl} onChange={setThumbnailUrl} />
          <div className="grid grid-cols-2 gap-3 border border-border bg-card p-3"><Toggle label="Publish lesson" checked={published} onChange={setPublished} /><Toggle label="Free preview" checked={previewFree} onChange={setPreviewFree} /></div>
          {error && <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4"><Btn onClick={onClose}>Cancel</Btn><Btn variant="ink" disabled={saving || uploading} onClick={() => void save()}>{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{saving ? "Saving…" : "Save lesson"}</Btn></div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) { return <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{children}</span>; }
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label className="block"><Label>{label}</Label><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm" /></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-lime" />{label}</label>; }

async function uploadTusFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  const chunkSize = 20 * 1024 * 1024;
  let offset = 0;

  while (offset < file.size) {
    let attempts = 0;
    let uploaded = false;

    while (!uploaded && attempts < 3) {
      attempts += 1;
      const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size));

      try {
        const response = await fetch(uploadUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/offset+octet-stream",
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": String(offset),
          },
          body: chunk,
        });

        if (response.ok) {
          const reportedOffset = Number(response.headers.get("Upload-Offset"));
          offset = Number.isFinite(reportedOffset) && reportedOffset > offset
            ? reportedOffset
            : offset + chunk.size;
          uploaded = true;
          onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
          continue;
        }
      } catch {
        // Recover the authoritative offset below before retrying.
      }

      try {
        const head = await fetch(uploadUrl, {
          method: "HEAD",
          headers: { "Tus-Resumable": "1.0.0" },
        });
        const serverOffset = Number(head.headers.get("Upload-Offset"));
        if (head.ok && Number.isFinite(serverOffset) && serverOffset >= 0) {
          offset = serverOffset;
          onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
        }
      } catch {
        // A later retry may succeed even if this recovery request fails.
      }
    }

    if (!uploaded) {
      throw new Error("Cloudflare Stream upload was interrupted after three retries. Please try again.");
    }
  }
}
