import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileVideo, Loader2, Pencil, Play, Plus, Settings2, Upload, X } from "lucide-react";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Database } from "@/integrations/supabase/types";
import { createAdminModule, getAdminCurriculum, saveAdminLesson } from "@/lib/admin-curriculum.functions";
import { attachStreamVideo, createStreamTusUpload, getStreamConfigurationStatus, getStreamPlayback, listStreamVideos, refreshStreamVideo, setStreamThumbnailFrame, type StreamLibraryVideo } from "@/lib/stream.functions";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Module = Database["public"]["Tables"]["program_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

export const Route = createFileRoute("/admin/lessons")({
  validateSearch: (search: Record<string, unknown>) => ({ program: typeof search["program"] === "string" ? search["program"] : undefined }),
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
  const { program: requestedProgramId } = Route.useSearch();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editing, setEditing] = useState<Lesson | "new" | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<{ title: string; iframeUrl: string } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [streamConfig, setStreamConfig] = useState<{ accountId: boolean; apiToken: boolean; customerCode: boolean; webhookSecret: boolean; webhookPath: string } | null>(null);

  useEffect(() => {
    void (async () => {
      try { setStreamConfig(await getStreamConfigurationStatus()); }
      catch { setStreamConfig(null); }
      try {
        const curriculum = await getAdminCurriculum({ data: { programId: requestedProgramId } });
        setPrograms(curriculum.programs);
        setModules(curriculum.modules);
        setLessons(curriculum.lessons);
        setProgramId(curriculum.selectedProgramId);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
      }
      setLoading(false);
    })();
  }, []);

  const loadCurriculum = async (selectedProgramId = programId) => {
    if (!selectedProgramId) return;
    setLoading(true);
    setError(null);
    try {
      const curriculum = await getAdminCurriculum({ data: { programId: selectedProgramId } });
      setPrograms(curriculum.programs);
      setModules(curriculum.modules);
      setLessons(curriculum.lessons);
      if (curriculum.selectedProgramId !== selectedProgramId) setProgramId(curriculum.selectedProgramId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
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
    try {
      await createAdminModule({
        data: {
          programId,
          title,
          position: modules.length + 1,
        },
      });
      setNewModuleTitle("");
      await loadCurriculum();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const previewLesson = async (lesson: Lesson) => {
    setPreviewLoadingId(lesson.id);
    setError(null);
    try {
      const playback = await getStreamPlayback({ data: { lessonId: lesson.id } });
      setPreviewing({ title: playback.title, iframeUrl: playback.iframeUrl });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
    setPreviewLoadingId(null);
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

      <div className="mt-5 border border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">{programs.map((program) => (
            <button key={program.id} type="button" onClick={() => setProgramId(program.id)} className={`rounded-sm border px-3 py-1.5 text-xs font-bold transition-colors ${program.id === programId ? "border-ink bg-ink text-ink-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>{program.name}</button>
          ))}</div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/programs" search={{ action: "new" }} className="inline-flex min-h-9 items-center rounded-sm border border-border px-3 text-xs font-bold"><Plus className="mr-1.5 h-3.5 w-3.5" /> New program</Link>
            {programId && <Link to="/admin/programs" search={{ edit: programId }} className="inline-flex min-h-9 items-center rounded-sm border border-border px-3 text-xs font-bold"><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit selected</Link>}
            <Link to="/admin/programs" search={{}} className="inline-flex min-h-9 items-center rounded-sm bg-ink px-3 text-xs font-bold text-ink-foreground"><Settings2 className="mr-1.5 h-3.5 w-3.5" /> Manage programs</Link>
          </div>
        </div>
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
              <ModulePanel key={module.id} module={module} lessons={lessons.filter((lesson) => lesson.module_id === module.id)} onEdit={setEditing} onPreview={previewLesson} previewLoadingId={previewLoadingId} />
            ))}
            {unassigned.length > 0 && <ModulePanel module={{ id: "unassigned", title: "Unassigned lessons" } as Module} lessons={unassigned} onEdit={setEditing} onPreview={previewLesson} previewLoadingId={previewLoadingId} />}
            {!modules.length && !lessons.length && programId && <Panel className="px-5 py-12 text-center text-sm text-muted-foreground">No curriculum yet. Add a module, then create the first lesson.</Panel>}
            {!programId && !loading && <Panel className="px-5 py-12 text-center text-sm text-muted-foreground">Create a program first, then return here to build its curriculum.</Panel>}
          </>
        )}
      </div>

      {editing && programId && <LessonDrawer lesson={editing === "new" ? null : editing} programId={programId} modules={modules} nextPosition={lessons.length + 1} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await loadCurriculum(); }} />}
      {previewing && <VideoPreviewModal title={previewing.title} iframeUrl={previewing.iframeUrl} onClose={() => setPreviewing(null)} />}
    </div>
  );
}

function ModulePanel({ module, lessons, onEdit, onPreview, previewLoadingId }: { module: Module; lessons: Lesson[]; onEdit: (lesson: Lesson) => void; onPreview: (lesson: Lesson) => void; previewLoadingId: string | null }) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em]">{module.title}</h2>
        <span className="font-mono text-[11px] text-muted-foreground">{lessons.length} lessons</span>
      </div>
      <ul className="divide-y divide-border/70">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-secondary/50">
            <button type="button" disabled={lesson.stream_status !== "ready" || previewLoadingId === lesson.id} onClick={() => onPreview(lesson)} aria-label={`Play ${lesson.title}`} className="group relative grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-sm border border-border bg-secondary disabled:cursor-not-allowed">
              {(lesson.thumbnail_url || lesson.stream_thumbnail_url) ? <img src={lesson.thumbnail_url || lesson.stream_thumbnail_url || ""} alt="" className="h-full w-full object-cover" /> : <FileVideo className="h-4 w-4 text-muted-foreground" />}
              {lesson.stream_status === "ready" && <span className="absolute inset-0 grid place-items-center bg-black/25 text-white transition-colors group-hover:bg-black/40">{previewLoadingId === lesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}</span>}
            </button>
            <div className="min-w-40 flex-1">
              <p className="text-sm font-medium"><span className="font-mono text-xs text-muted-foreground">{String(lesson.position).padStart(2, "0")}</span>{" "}{lesson.title}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{formatDuration(lesson.duration_seconds)} · {lesson.stream_uid ? `Stream ${lesson.stream_status}` : lesson.video_path ? "legacy video" : "video missing"}</p>
            </div>
            {lesson.preview_free && <Tag tone="muted">Free preview</Tag>}
            <Tag tone={lesson.published ? "accent" : "muted"}>{lesson.published ? "Published" : "Draft"}</Tag>
            {lesson.stream_status === "ready" && <Btn disabled={previewLoadingId === lesson.id} onClick={() => onPreview(lesson)}>{previewLoadingId === lesson.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}Play</Btn>}
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
  const [previewUrl, setPreviewUrl] = useState("");
  const autoPreviewedUid = useRef<string | null>(null);
  const [thumbnailTime, setThumbnailTime] = useState("0");
  const [previewSeek, setPreviewSeek] = useState<{ time: number; request: number } | null>(null);
  const [thumbnailRevision, setThumbnailRevision] = useState(0);

  useEffect(() => {
    if (!lesson || !streamUid || !["uploading", "processing"].includes(streamStatus)) return;
    let cancelled = false;
    let refreshing = false;

    const poll = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const refreshed = await refreshStreamVideo({ data: { lessonId: lesson.id } });
        if (cancelled) return;
        setStreamStatus(refreshed.status);
        if (refreshed.thumbnailUrl) setThumbnailUrl(refreshed.thumbnailUrl);
        if (refreshed.durationSeconds) setDuration(String(refreshed.durationSeconds));
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        refreshing = false;
      }
    };

    const timer = window.setInterval(() => void poll(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [lesson, streamStatus, streamUid]);

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
      if (refreshed.durationSeconds) setDuration(String(refreshed.durationSeconds));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
    setUploading(false);
  };

  const previewVideo = async () => {
    if (!lesson || !streamUid) return;
    try {
      const playback = await getStreamPlayback({ data: { lessonId: lesson.id } });
      setPreviewUrl(playback.iframeUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
  };

  useEffect(() => {
    if (!lesson || !streamUid || streamStatus !== "ready" || autoPreviewedUid.current === streamUid) return;
    autoPreviewedUid.current = streamUid;
    let cancelled = false;

    void getStreamPlayback({ data: { lessonId: lesson.id } })
      .then((playback) => {
        if (!cancelled) setPreviewUrl(playback.iframeUrl);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      });

    return () => {
      cancelled = true;
    };
  }, [lesson, streamStatus, streamUid]);

  const useVideoFrame = async () => {
    if (!lesson || !streamUid) { setError("Save the lesson and attach a Stream video first."); return; }
    setSaving(true);
    setError(null);
    try {
      const result = await setStreamThumbnailFrame({ data: { lessonId: lesson.id, timeSeconds: Math.max(0, Number(thumbnailTime) || 0) } });
      if (result.thumbnailUrl) setThumbnailUrl(result.thumbnailUrl);
      setThumbnailRevision((current) => current + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    setSaving(false);
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
    const parsedDuration = Number(duration);
    const normalizedDuration = duration && Number.isFinite(parsedDuration) ? Math.round(parsedDuration) : null;
    const payload = {
      id: lesson?.id,
      programId,
      moduleId: moduleId || null,
      title: title.trim(),
      slug: (slug || title).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      summary: summary.trim() || null,
      durationSeconds: normalizedDuration && normalizedDuration > 0 ? normalizedDuration : null,
      videoPath: videoPath || null,
      thumbnailUrl: thumbnailUrl.trim() || null,
      position: Number(position) || nextPosition,
      published,
      previewFree,
    };
    try {
      await saveAdminLesson({ data: payload });
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setSaving(false);
    }
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
            <div className="mt-2 flex flex-wrap items-center gap-2"><label className={`inline-flex items-center rounded-sm bg-ink px-3 py-2 text-xs font-bold text-ink-foreground ${!lesson || uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><Upload className="mr-1.5 h-4 w-4" />{uploading ? `Uploading ${uploadProgress}%` : "Upload to Stream"}<input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={!lesson || uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadVideo(file); }} className="sr-only" /></label><Btn disabled={!lesson || uploading} onClick={() => void openStreamLibrary()}>Choose existing video</Btn>{lesson && streamUid && streamStatus !== "ready" && <Btn onClick={async () => { try { const result = await refreshStreamVideo({ data: { lessonId: lesson.id } }); setStreamStatus(result.status); if (result.thumbnailUrl) setThumbnailUrl(result.thumbnailUrl); } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); } }}>Refresh status</Btn>}</div>
            {uploading && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent transition-[width]" style={{ width: `${uploadProgress}%` }} /></div>}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{streamUid ? `${streamStatus} · ${streamUid}` : lesson ? "No Stream video uploaded" : "Save this lesson to enable upload"}</p>
            {videoPath && <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">Legacy Storage file retained: {videoPath}</p>}
            {showStreamLibrary && <div className="mt-4 max-h-72 overflow-y-auto border border-border bg-background"><div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-3 py-2"><span className="font-mono text-[10px] uppercase tracking-[0.12em]">Cloudflare library · {streamLibrary.length}</span><button type="button" onClick={() => setShowStreamLibrary(false)} aria-label="Close Stream library"><X className="h-4 w-4" /></button></div>{streamLibrary.map((video) => <button key={video.uid} type="button" disabled={!video.ready || !video.signed || uploading} onClick={() => void attachExisting(video)} className="flex w-full items-center gap-3 border-b border-border/70 p-3 text-left last:border-b-0 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45">{video.thumbnail ? <img src={video.thumbnail} alt="" className="h-14 w-24 rounded-sm object-cover" /> : <div className="grid h-14 w-24 place-items-center bg-secondary"><FileVideo className="h-4 w-4" /></div>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{video.name}</span><span className="mt-1 block font-mono text-[10px] text-muted-foreground">{formatDuration(video.durationSeconds)} · {video.ready ? "ready" : "processing"} · {video.signed ? "private" : "public"}</span></span></button>)}</div>}
            {previewUrl && <div className="mt-4 overflow-hidden border border-border bg-black"><div className="flex items-center justify-between bg-background px-3 py-2"><div><span className="block text-xs font-bold">Choose a thumbnail frame</span><span className="font-mono text-[10px] text-muted-foreground">Play or scrub the video, then use the frame you see.</span></div><button type="button" onClick={() => setPreviewUrl("")} aria-label="Close preview"><X className="h-4 w-4" /></button></div><StreamPlayer iframeUrl={previewUrl} title={`${title || "Lesson"} preview`} onTimeChange={(time) => setThumbnailTime(time.toFixed(2))} seekRequest={previewSeek} /><div className="space-y-3 bg-background p-3"><input type="range" min="0" max={Math.max(1, Number(duration) || 1)} step="0.1" value={Math.min(Math.max(0, Number(thumbnailTime) || 0), Math.max(1, Number(duration) || 1))} onChange={(event) => { const time = Number(event.target.value); setThumbnailTime(time.toFixed(2)); setPreviewSeek((current) => ({ time, request: (current?.request ?? 0) + 1 })); }} aria-label="Thumbnail frame timeline" className="w-full accent-lime" /><div className="flex items-center justify-between gap-3"><span className="font-mono text-[11px] font-bold">{formatTimestamp(Number(thumbnailTime) || 0)} / {formatTimestamp(Number(duration) || 0)}</span><Btn variant="ink" disabled={!lesson || !streamUid || saving || streamStatus !== "ready"} onClick={() => void useVideoFrame()}>Use this frame as thumbnail</Btn></div></div></div>}
          </div>
          <div className="border border-border bg-card p-4">
            <ImageUploadField value={thumbnailUrl} alt={`${title || "Lesson"} thumbnail`} folder={`lesson-thumbnails/${lesson?.id ?? programId}`} bucket="lesson-images" label="Lesson thumbnail" showAlt={false} onChange={(url) => { setThumbnailUrl(url); setThumbnailRevision((current) => current + 1); }} />
            <div className="mt-3 flex flex-wrap gap-2">
              {lesson?.stream_thumbnail_url && <Btn onClick={() => { setThumbnailUrl(lesson.stream_thumbnail_url ?? ""); setThumbnailRevision((current) => current + 1); }}>Use Stream default</Btn>}
              {thumbnailUrl && <Btn onClick={() => setThumbnailUrl("")}>Remove thumbnail</Btn>}
            </div>
            {!previewUrl && streamUid && streamStatus === "ready" && <div className="mt-3"><Btn onClick={() => void previewVideo()}>Open visual frame picker</Btn></div>}
            <p className="mt-2 text-[11px] text-muted-foreground">Upload a custom image, paste an HTTPS URL, or choose a frame directly while watching the secure preview. Custom uploads are stored in Supabase Storage.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border border-border bg-card p-3"><Toggle label="Publish lesson" checked={published} onChange={setPublished} /><Toggle label="Free preview" checked={previewFree} onChange={setPreviewFree} /></div>
          {error && <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4"><Btn onClick={onClose}>Cancel</Btn><Btn variant="ink" disabled={saving || uploading} onClick={() => void save()}>{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{saving ? "Saving…" : "Save lesson"}</Btn></div>
      </div>
    </div>
  );
}

type StreamPlayerApi = {
  currentTime: number;
  addEventListener: (event: string, listener: () => void) => void;
  removeEventListener: (event: string, listener: () => void) => void;
};

declare global {
  interface Window {
    Stream?: (iframe: HTMLIFrameElement) => StreamPlayerApi;
  }
}

function StreamPlayer({ iframeUrl, title, onTimeChange, seekRequest }: { iframeUrl: string; title: string; onTimeChange?: (time: number) => void; seekRequest?: { time: number; request: number } | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<StreamPlayerApi | null>(null);
  const onTimeChangeRef = useRef(onTimeChange);

  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  useEffect(() => {
    let cancelled = false;
    let player: StreamPlayerApi | null = null;
    let handleTimeUpdate: (() => void) | null = null;

    const connect = () => {
      if (cancelled || !iframeRef.current || !window.Stream) return;
      player = window.Stream(iframeRef.current);
      playerRef.current = player;
      handleTimeUpdate = () => onTimeChangeRef.current?.(Math.max(0, Number(player?.currentTime) || 0));
      player.addEventListener("timeupdate", handleTimeUpdate);
      player.addEventListener("seeked", handleTimeUpdate);
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-cloudflare-stream-sdk="true"]');
    if (window.Stream) connect();
    else if (existing) existing.addEventListener("load", connect, { once: true });
    else {
      const script = document.createElement("script");
      script.src = "https://embed.cloudflarestream.com/embed/sdk.latest.js";
      script.async = true;
      script.dataset.cloudflareStreamSdk = "true";
      script.addEventListener("load", connect, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (existing) existing.removeEventListener("load", connect);
      if (player && handleTimeUpdate) {
        player.removeEventListener("timeupdate", handleTimeUpdate);
        player.removeEventListener("seeked", handleTimeUpdate);
      }
      playerRef.current = null;
    };
  }, [iframeUrl]);

  useEffect(() => {
    if (seekRequest && playerRef.current) playerRef.current.currentTime = Math.max(0, seekRequest.time);
  }, [seekRequest]);

  return <div className="aspect-video"><iframe ref={iframeRef} src={iframeUrl} title={title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" /></div>;
}

function VideoPreviewModal({ title, iframeUrl, onClose }: { title: string; iframeUrl: string; onClose: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={`${title} preview`}><div className="w-full max-w-5xl overflow-hidden border border-border bg-background shadow-2xl"><div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Secure admin preview</p><h2 className="mt-1 text-sm font-extrabold">{title}</h2></div><button type="button" onClick={onClose} aria-label="Close video preview" className="rounded-sm border border-border p-2"><X className="h-4 w-4" /></button></div><div className="bg-black"><StreamPlayer iframeUrl={iframeUrl} title={`${title} secure preview`} /></div></div></div>;
}

function formatTimestamp(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
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
