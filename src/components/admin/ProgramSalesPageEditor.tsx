import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Loader2, Save, Upload } from "lucide-react";
import { Btn, PageHead } from "@/components/admin/AdminUI";
import { getAdminPrograms } from "@/lib/admin-programs.functions";
import {
  getAdminProgramSalesPages,
  saveAdminProgramSalesPage,
} from "@/lib/program-sales.functions";
import {
  createSalesPreviewTusUpload,
  deleteSalesPreviewCaptions,
  getAdminSalesPreviewIframe,
  listSalesPreviewCaptions,
  refreshSalesPreviewVideo,
  uploadSalesPreviewCaptions,
  type StreamCaption,
} from "@/lib/stream.functions";

type Step = { phase: string; title: string; description: string };
type SalesDraft = {
  landingEyebrow: string;
  landingHeadline: string;
  landingSummary: string;
  landingWhyHeadline: string;
  landingBenefit1: string;
  landingBenefit2: string;
  landingBenefit3: string;
  landingAudience: string;
  landingReassurance: string;
  techniqueEyebrow: string;
  techniqueHeadline: string;
  techniqueBody: string;
  curriculum: Step[];
  finalHeadline: string;
  feedbackHeadline: string;
  feedback1Quote: string;
  feedback1Name: string;
  feedback2Quote: string;
  feedback2Name: string;
  feedback3Quote: string;
  feedback3Name: string;
  previewStreamUid: string;
  previewStreamStatus: "not_uploaded" | "uploading" | "processing" | "ready" | "error";
  previewThumbnailUrl: string;
};
type Video = Partial<SalesDraft> & {
  id: string;
  title: string;
  description?: string;
  curriculum?: Step[];
};
const SALES_PAGE_ID_BY_PROGRAM_SLUG: Record<string, string> = {
  "neck-shoulder-reset": "neck-alignment",
  "ankle-recovery": "ankle-sprain-rehabilitation",
  "shoulder-movement": "shoulder-movement",
  "bunion-hallux-valgus-guide": "bunion-hallux-valgus-guide",
};

const control =
  "min-h-12 w-full border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground caret-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ink focus:ring-1 focus:ring-ink/10";
const textarea = `${control} min-h-32 resize-y`;
const fallbackSteps: Step[] = [
  {
    phase: "Inhibit",
    title: "Reduce unnecessary tension",
    description: "Use targeted techniques for muscles that are working harder than needed.",
  },
  {
    phase: "Activate",
    title: "Build local control",
    description: "Practise deliberate control without unnecessary substitution.",
  },
  {
    phase: "Integrate",
    title: "Connect the full pattern",
    description: "Bring the new option back into coordinated movement.",
  },
];
function makeDraft(v: Video, s?: Partial<SalesDraft>): SalesDraft {
  const b: SalesDraft = {
    landingEyebrow: v.landingEyebrow || "Targeted movement session",
    landingHeadline: v.landingHeadline || v.title,
    landingSummary: v.landingSummary || v.description || "",
    landingWhyHeadline: v.landingWhyHeadline || "Turn the theory into a sequence you can follow.",
    landingBenefit1: v.landingBenefit1 || "",
    landingBenefit2: v.landingBenefit2 || "",
    landingBenefit3: v.landingBenefit3 || "",
    landingAudience: v.landingAudience || "",
    landingReassurance:
      v.landingReassurance ||
      "One payment gives you protected access through your personal movement library.",
    techniqueEyebrow: "How the session works",
    techniqueHeadline: "A clear sequence, built for controlled practice.",
    techniqueBody:
      "Work through each phase at a comfortable range and pace. The session moves from reducing unnecessary effort to building control, then applying it to coordinated movement. Pause, repeat, or stop whenever the movement does not feel right.",
    curriculum: v.curriculum?.length === 3 ? v.curriculum : fallbackSteps,
    finalHeadline: "Put the method into practice.",
    feedbackHeadline: "What people noticed after practising.",
    feedback1Quote: "",
    feedback1Name: "",
    feedback2Quote: "",
    feedback2Name: "",
    feedback3Quote: "",
    feedback3Name: "",
    previewStreamUid: "",
    previewStreamStatus: "not_uploaded",
    previewThumbnailUrl: "",
  };
  return { ...b, ...s, curriculum: s?.curriculum?.length === 3 ? s.curriculum : b.curriculum };
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function EditorCard({
  number,
  title,
  description,
  defaultOpen = false,
  children,
}: {
  number: string;
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group overflow-hidden border border-border bg-card" open={defaultOpen}>
      <summary className="flex min-h-24 cursor-pointer list-none items-center gap-4 px-5 py-4 marker:hidden hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink lg:px-7 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-sm font-bold text-muted-foreground">{number}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black">{title}</span>
          <span className="mt-1 block text-sm leading-5 text-muted-foreground">
            {description}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="hidden sm:inline group-open:hidden">Edit</span>
          <span className="hidden sm:group-open:inline">Close</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-border">{children}</div>
    </details>
  );
}

export function ProgramSalesPageEditor() {
  const [videos, setVideos] = useState<Video[]>([]),
    [records, setRecords] = useState<Record<string, Partial<SalesDraft>>>({});
  const [videoId, setVideoId] = useState(""),
    [draft, setDraft] = useState<SalesDraft | null>(null);
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState(false),
    [uploadProgress, setUploadProgress] = useState(0),
    [processingProgress, setProcessingProgress] = useState(0),
    [message, setMessage] = useState("");
  const [previewIframeUrl, setPreviewIframeUrl] = useState("");
  const [previewPlayerError, setPreviewPlayerError] = useState("");
  const [previewCaptions, setPreviewCaptions] = useState<StreamCaption[]>([]);
  const [previewCaptionLanguage, setPreviewCaptionLanguage] = useState<"en" | "ko" | null>(null);
  const [previewReloading, setPreviewReloading] = useState(false);
  const [captionBusy, setCaptionBusy] = useState<"en" | "ko" | null>(null);
  useEffect(() => {
    void Promise.all([
      fetch("/assets/data/videos.json", { cache: "no-store" }).then((r) => r.json()),
      getAdminProgramSalesPages(),
      getAdminPrograms(),
    ])
      .then(([catalog, saved, programs]) => {
        const catalogById = new Map(
          (catalog as Video[]).filter((item) => item?.id).map((item) => [item.id, item]),
        );
        const list = programs.flatMap((program) => {
          const salesPageId = SALES_PAGE_ID_BY_PROGRAM_SLUG[program.slug];
          const base = salesPageId ? catalogById.get(salesPageId) : undefined;
          if (!salesPageId || !base) return [];
          return [
            {
              ...base,
              id: salesPageId,
              title: program.name,
              description: program.outcome || base.description,
            },
          ];
        });
        setVideos(list);
        setRecords(
          Object.fromEntries(saved.map((r) => [r.video_id, r.content as Partial<SalesDraft>])),
        );
        setVideoId(list[0]?.id || "");
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);
  const video = useMemo(() => videos.find((v) => v.id === videoId), [videos, videoId]);
  useEffect(() => {
    if (video) setDraft(makeDraft(video, records[video.id]));
  }, [video, records]);
  const loadPreviewPlayer = useCallback(
    async (language: "en" | "ko" | null = previewCaptionLanguage, startTime?: number) => {
      setPreviewIframeUrl("");
      setPreviewPlayerError("");
      if (!videoId || draft?.previewStreamStatus !== "ready" || !draft.previewStreamUid) return;
      setPreviewReloading(true);
      try {
        const { iframeUrl } = await getAdminSalesPreviewIframe({
          data: {
            streamUid: draft.previewStreamUid,
            preferredLanguage: language || undefined,
            startTime,
          },
        });
        setPreviewIframeUrl(iframeUrl);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Unknown playback error.";
        setPreviewPlayerError(errorMessage);
        setMessage(`Could not load the secure preview: ${errorMessage}`);
      } finally {
        setPreviewReloading(false);
      }
    },
    [videoId, draft?.previewStreamStatus, draft?.previewStreamUid, previewCaptionLanguage],
  );
  useEffect(() => {
    void loadPreviewPlayer();
  }, [loadPreviewPlayer]);
  useEffect(() => {
    if (draft?.previewStreamStatus !== "processing" || !draft.previewStreamUid) return;
    const uid = draft.previewStreamUid;
    void refreshPreview(uid, true);
    const timer = window.setInterval(() => void refreshPreview(uid, true), 4000);
    return () => window.clearInterval(timer);
  }, [draft?.previewStreamStatus, draft?.previewStreamUid, videoId]);
  const refreshCaptions = useCallback(async () => {
    if (draft?.previewStreamStatus !== "ready" || !draft.previewStreamUid) return;
    try {
      setPreviewCaptions(
        await listSalesPreviewCaptions({ data: { streamUid: draft.previewStreamUid } }),
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }, [draft?.previewStreamStatus, draft?.previewStreamUid]);
  useEffect(() => {
    setPreviewCaptions([]);
    setPreviewCaptionLanguage(null);
    void refreshCaptions();
  }, [refreshCaptions]);
  const set = (key: keyof SalesDraft, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  const setStep = (i: number, key: keyof Step, value: string) =>
    setDraft((d) =>
      d
        ? { ...d, curriculum: d.curriculum.map((x, n) => (n === i ? { ...x, [key]: value } : x)) }
        : d,
    );
  async function save() {
    if (!draft || !videoId) return;
    setSaving(true);
    setMessage("");
    try {
      const r = await saveAdminProgramSalesPage({ data: { videoId, content: draft } });
      setRecords((x) => ({ ...x, [videoId]: r.content as Partial<SalesDraft> }));
      setMessage("Sales page published. The public page will update automatically.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }
  async function refreshPreview(uid = draft?.previewStreamUid, quiet = false) {
    if (!draft || !uid) return;
    try {
      const r = await refreshSalesPreviewVideo({ data: { videoId, streamUid: uid } });
      setProcessingProgress(r.progress);
      setDraft((d) =>
        d
          ? {
              ...d,
              previewStreamUid: uid,
              previewStreamStatus: r.status,
              previewThumbnailUrl: r.thumbnailUrl,
            }
          : d,
      );
      if (!quiet || r.status === "ready" || r.status === "error")
        setMessage(
          r.status === "ready"
            ? "Preview video is ready. Publish changes to show it on the sales page."
            : r.status === "error"
              ? r.error || "Cloudflare could not process this video."
              : "Cloudflare is processing the preview.",
        );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? `Could not refresh Cloudflare status: ${e.message}`
          : "Could not refresh Cloudflare status. Try again.",
      );
    }
  }
  async function uploadPreview(file: File) {
    if (!draft) return;
    setUploading(true);
    setUploadProgress(0);
    setProcessingProgress(0);
    setMessage("");
    try {
      const upload = await createSalesPreviewTusUpload({
        data: { videoId, fileName: file.name, fileSize: file.size },
      });
      setDraft((d) =>
        d ? { ...d, previewStreamUid: upload.uid, previewStreamStatus: "uploading" } : d,
      );
      await uploadTusFile(upload.uploadURL, file, setUploadProgress);
      setDraft((d) => (d ? { ...d, previewStreamStatus: "processing" } : d));
      await refreshPreview(upload.uid);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  }
  async function uploadCaptions(language: "en" | "ko", file: File) {
    if (!draft?.previewStreamUid) return;
    setCaptionBusy(language);
    setMessage("");
    try {
      await uploadSalesPreviewCaptions({
        data: {
          streamUid: draft.previewStreamUid,
          language,
          fileName: file.name,
          content: await file.text(),
        },
      });
      await refreshCaptions();
      setMessage("Preview captions uploaded.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setCaptionBusy(null);
    }
  }
  async function removeCaptions(language: "en" | "ko") {
    if (!draft?.previewStreamUid) return;
    setCaptionBusy(language);
    setMessage("");
    try {
      await deleteSalesPreviewCaptions({
        data: { streamUid: draft.previewStreamUid, language },
      });
      await refreshCaptions();
      setMessage("Preview captions removed.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setCaptionBusy(null);
    }
  }
  if (loading)
    return (
      <div className="flex min-h-80 items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading sales pages…
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title="Sales page editor"
        meta="Edit the page in the same order visitors read it."
        actions={
          <div className="flex gap-2">
            <a
              className="inline-flex min-h-11 items-center gap-2 border border-border px-4 py-3 text-sm font-bold"
              href={`/video.html?id=${videoId}`}
              target="_blank"
              rel="noreferrer"
            >
              Open live page <ExternalLink className="h-4 w-4" />
            </a>
            <Btn variant="ink" onClick={save} disabled={!draft || saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Publish changes
            </Btn>
          </div>
        }
      />
      <div className="mt-5 border border-border bg-card p-4">
        <label className="text-xs font-bold uppercase tracking-widest">Program sales page</label>
        <select
          className={`${control} mt-2 max-w-md`}
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        >
          {videos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
      {draft && (
        <div className="mt-5 grid gap-4">
          <EditorCard
            number="01"
            title="Hero copy"
            description="Edit the eyebrow, main headline, and opening summary."
            defaultOpen
          >
          <section className="grid bg-ink text-ink-foreground lg:grid-cols-[1.15fr_.85fr]">
            <div className="p-6 lg:p-10">
              <Field label="Eyebrow">
                <input
                  className={control}
                  value={draft.landingEyebrow}
                  onChange={(e) => set("landingEyebrow", e.target.value)}
                />
              </Field>
              <Field label="Main headline">
                <textarea
                  className={`${textarea} min-h-32 text-2xl font-black`}
                  value={draft.landingHeadline}
                  onChange={(e) => set("landingHeadline", e.target.value)}
                />
              </Field>
            </div>
            <div className="p-6 lg:p-10">
              <Field label="Opening summary">
                <textarea
                  className={`${textarea} min-h-40`}
                  value={draft.landingSummary}
                  onChange={(e) => set("landingSummary", e.target.value)}
                />
              </Field>
            </div>
          </section>
          </EditorCard>
          <EditorCard
            number="02"
            title="Preview video & captions"
            description="Upload, verify, and caption the short video shown on the sales page."
          >
          <section className="grid gap-6 border-b border-border p-6 lg:grid-cols-[.8fr_1.2fr] lg:p-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                Hero video preview
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">Show the actual session.</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Upload a short edited preview. It is stored in Cloudflare Stream separately from the
                protected full lesson.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <label
                  className={`inline-flex min-h-11 items-center bg-ink px-4 py-3 text-sm font-bold text-ink-foreground ${uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading
                    ? `Uploading ${uploadProgress}%`
                    : draft.previewStreamUid
                      ? "Replace preview video"
                      : "Upload preview video"}
                  <input
                    className="sr-only"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadPreview(f);
                    }}
                  />
                </label>
                {draft.previewStreamUid && draft.previewStreamStatus !== "ready" && (
                  <Btn disabled={uploading} onClick={() => void refreshPreview()}>
                    Refresh status
                  </Btn>
                )}
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {draft.previewStreamStatus.replace("_", " ")}
                {draft.previewStreamUid ? ` · ${draft.previewStreamUid}` : ""}
              </p>
              {(uploading || draft.previewStreamStatus === "processing") && (
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between gap-4 text-xs font-bold">
                    <span>{uploading ? "Uploading preview" : "Cloudflare processing"}</span>
                    <span className="font-mono">
                      {uploading ? uploadProgress : processingProgress}%
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden bg-secondary"
                    role="progressbar"
                    aria-label={uploading ? "Preview upload progress" : "Video processing progress"}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploading ? uploadProgress : processingProgress}
                  >
                    <div
                      className="h-full bg-accent transition-[width] duration-500"
                      style={{
                        width: `${uploading ? uploadProgress : Math.max(processingProgress, 3)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {uploading
                      ? "Keep this page open until the upload reaches 100%."
                      : "Status refreshes automatically every 4 seconds. You may leave this page."}
                  </p>
                </div>
              )}
              {draft.previewStreamStatus === "ready" && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Preview ready. The player on the right is what customers will see on the sales
                    page.
                  </p>
                  <Btn disabled={previewReloading} onClick={() => void loadPreviewPlayer()}>
                    {previewReloading ? "Refreshing player…" : "Reload secure player"}
                  </Btn>
                </div>
              )}
            </div>
            <div className="aspect-video overflow-hidden border border-border bg-secondary">
              {draft.previewStreamStatus === "ready" && previewIframeUrl ? (
                <iframe
                  key={previewIframeUrl}
                  className="h-full w-full border-0"
                  src={previewIframeUrl}
                  title={`${video?.title || "Sales"} preview video`}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="origin"
                  allowFullScreen
                />
              ) : draft.previewStreamStatus === "processing" ? (
                <div className="relative h-full">
                  {draft.previewThumbnailUrl && (
                    <img
                      className="h-full w-full object-cover"
                      src={draft.previewThumbnailUrl}
                      alt="Sales preview thumbnail"
                    />
                  )}
                  <div className="absolute inset-0 grid place-items-center bg-ink/25">
                    <span className="bg-ink px-3 py-2 text-xs font-bold text-ink-foreground">
                      Cloudflare is processing · {processingProgress}%
                    </span>
                  </div>
                </div>
              ) : draft.previewStreamStatus === "error" ? (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-destructive">
                  Video processing failed. Replace the video or refresh its status.
                </div>
              ) : draft.previewStreamStatus === "ready" ? (
                <div
                  className={`grid h-full place-items-center px-6 text-center text-sm ${previewPlayerError ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {previewPlayerError
                    ? "The secure player could not be created."
                    : "Loading secure player…"}
                </div>
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  Preview will appear here after processing
                </div>
              )}
            </div>
            {previewPlayerError && (
              <p className="mt-3 border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive lg:col-start-2">
                Preview playback failed: {previewPlayerError}
              </p>
            )}
            {draft.previewStreamStatus === "ready" && draft.previewStreamUid && (
              <div className="border-t border-border pt-5 lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">English and Korean captions</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload the final reviewed SRT or WebVTT file for each language. SRT files are
                      converted automatically. Captions are off by default; viewers can choose
                      English or 한국어 from the player’s CC menu.
                    </p>
                  </div>
                  <Btn disabled={captionBusy !== null} onClick={() => void refreshCaptions()}>
                    Refresh captions
                  </Btn>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {(["en", "ko"] as const).map((language) => {
                    const caption = previewCaptions.find((item) => item.language === language);
                    const name = language === "ko" ? "한국어" : "English";
                    return (
                      <div
                        key={language}
                        className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background p-3"
                      >
                        <div>
                          <span className="text-xs font-bold">{name}</span>
                          <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {caption
                              ? `${caption.status}${caption.generated ? " · AI" : " · uploaded"}`
                              : "not added"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {caption?.status === "ready" && (
                            <Btn
                              disabled={captionBusy !== null || previewReloading}
                              onClick={() => {
                                if (previewCaptionLanguage === language) void loadPreviewPlayer();
                                else setPreviewCaptionLanguage(language);
                              }}
                            >
                              {previewCaptionLanguage === language
                                ? "Viewing captions · reload"
                                : "View captions"}
                            </Btn>
                          )}
                          <label
                            className={`inline-flex cursor-pointer items-center border border-border px-3 py-2 text-xs font-bold ${captionBusy !== null ? "pointer-events-none opacity-50" : ""}`}
                          >
                            {caption ? "Replace SRT / VTT" : "Upload SRT / VTT"}
                            <input
                              className="sr-only"
                              type="file"
                              accept=".srt,.vtt,application/x-subrip,text/srt,text/vtt"
                              disabled={captionBusy !== null}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void uploadCaptions(language, file);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {caption && (
                            <Btn
                              disabled={captionBusy !== null}
                              onClick={() => void removeCaptions(language)}
                            >
                              Remove
                            </Btn>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 border border-border bg-secondary/30 p-4 text-xs leading-5 text-muted-foreground">
                  Uploading or replacing a file updates the caption track stored with this preview
                  video. Use “View captions” to verify the selected language before opening the live
                  page.
                </p>
              </div>
            )}
          </section>
          </EditorCard>
          <EditorCard
            number="03"
            title="Session value"
            description="Define the main reason to choose the session and its three outcomes."
          >
          <section className="p-6 lg:p-10">
            <div className="mb-6 border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                Session value
              </p>
              <h3 className="mt-2 text-xl font-black">Why someone should choose this session</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep the headline concise, then give each outcome one clear job.
              </p>
            </div>
            <Field label="Why this session">
              <input
                className={`${control} text-xl font-bold`}
                value={draft.landingWhyHeadline}
                onChange={(e) => set("landingWhyHeadline", e.target.value)}
              />
            </Field>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {(["landingBenefit1", "landingBenefit2", "landingBenefit3"] as const).map((k, i) => (
                <div key={k} className="border border-border bg-secondary/20 p-4">
                  <Field label={`Outcome 0${i + 1}`}>
                    <textarea
                      className={`${textarea} min-h-36`}
                      value={draft[k]}
                      onChange={(e) => set(k, e.target.value)}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </section>
          </EditorCard>
          <EditorCard
            number="04"
            title="Method story"
            description="Explain the technique and how the session progresses."
          >
          <section className="border-y border-border bg-secondary/50 p-6 lg:p-10">
            <div className="mb-6 border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                Method story
              </p>
              <h3 className="mt-2 text-xl font-black">Explain how the session works</h3>
            </div>
            <Field label="Technique eyebrow">
              <input
                className={control}
                value={draft.techniqueEyebrow}
                onChange={(e) => set("techniqueEyebrow", e.target.value)}
              />
            </Field>
            <Field label="Technique headline">
              <input
                className={`${control} text-xl font-bold`}
                value={draft.techniqueHeadline}
                onChange={(e) => set("techniqueHeadline", e.target.value)}
              />
            </Field>
            <Field label="Technique explanation">
              <textarea
                className={`${textarea} min-h-40`}
                value={draft.techniqueBody}
                onChange={(e) => set("techniqueBody", e.target.value)}
              />
            </Field>
          </section>
          </EditorCard>
          <EditorCard
            number="05"
            title="Three-phase curriculum"
            description="Edit the phase names, outcomes, and practice descriptions."
          >
          <section className="p-6 lg:p-10">
            <div className="mb-6 border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                Program structure
              </p>
              <h3 className="mt-2 text-xl font-black">Three-phase curriculum</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Name each phase, state its purpose, then describe what the customer will practise.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {draft.curriculum.map((s, i) => (
                <div key={i} className="border border-border bg-secondary/20 p-5">
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                    Phase 0{i + 1}
                  </p>
                  <Field label="Phase name">
                    <input
                      className={control}
                      value={s.phase}
                      onChange={(e) => setStep(i, "phase", e.target.value)}
                    />
                  </Field>
                  <Field label="Outcome">
                    <input
                      className={`${control} font-bold`}
                      value={s.title}
                      onChange={(e) => setStep(i, "title", e.target.value)}
                    />
                  </Field>
                  <Field label="Description">
                    <textarea
                      className={`${textarea} min-h-36`}
                      value={s.description}
                      onChange={(e) => setStep(i, "description", e.target.value)}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </section>
          </EditorCard>
          <EditorCard
            number="06"
            title="Audience & closing"
            description="Clarify who the program is for and the final purchase message."
          >
          <section className="grid border-t border-border lg:grid-cols-2">
            <div className="p-6 lg:border-r lg:border-border lg:p-10">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                Audience
              </p>
              <Field label="Who this is for">
                <textarea
                  className={`${textarea} min-h-40`}
                  value={draft.landingAudience}
                  onChange={(e) => set("landingAudience", e.target.value)}
                />
              </Field>
            </div>
            <div className="bg-accent/20 p-6 lg:p-10">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                Closing message
              </p>
              <Field label="Purchase reassurance">
                <textarea
                  className={`${textarea} min-h-32`}
                  value={draft.landingReassurance}
                  onChange={(e) => set("landingReassurance", e.target.value)}
                />
              </Field>
              <Field label="Closing headline">
                <input
                  className={`${control} font-bold`}
                  value={draft.finalHeadline}
                  onChange={(e) => set("finalHeadline", e.target.value)}
                />
              </Field>
            </div>
          </section>
          </EditorCard>
          <EditorCard
            number="07"
            title="Customer feedback"
            description="Add approved testimonials when they are ready to publish."
          >
          <section className="border-t border-border p-6 lg:p-10">
            <div className="mb-6 border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                Customer feedback
              </p>
              <h3 className="mt-2 text-xl font-black">Add real feedback when it is ready</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                The entire section stays hidden on the live sales page until at least one quote is
                entered. Use only feedback you have permission to publish.
              </p>
            </div>
            <Field label="Section headline">
              <input
                className={`${control} text-xl font-bold`}
                value={draft.feedbackHeadline}
                onChange={(e) => set("feedbackHeadline", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-3">
              {([1, 2, 3] as const).map((number) => {
                const quoteKey = `feedback${number}Quote` as const;
                const nameKey = `feedback${number}Name` as const;
                return (
                  <div key={number} className="border border-border bg-secondary/20 p-4">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
                      Feedback 0{number}
                    </p>
                    <Field label="Quote">
                      <textarea
                        className={`${textarea} min-h-40`}
                        value={draft[quoteKey]}
                        onChange={(e) => set(quoteKey, e.target.value)}
                      />
                    </Field>
                    <Field label="Name or attribution">
                      <input
                        className={control}
                        value={draft[nameKey]}
                        onChange={(e) => set(nameKey, e.target.value)}
                        placeholder="Optional"
                      />
                    </Field>
                  </div>
                );
              })}
            </div>
          </section>
          </EditorCard>
        </div>
      )}
    </div>
  );
}

async function uploadTusFile(uploadUrl: string, file: File, onProgress: (percent: number) => void) {
  const chunkSize = 20 * 1024 * 1024;
  let offset = 0;
  while (offset < file.size) {
    let attempts = 0,
      uploaded = false;
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
          const reported = Number(response.headers.get("Upload-Offset"));
          offset = Number.isFinite(reported) && reported > offset ? reported : offset + chunk.size;
          uploaded = true;
          onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
          continue;
        }
      } catch {
        /* retry below */
      }
      try {
        const head = await fetch(uploadUrl, {
          method: "HEAD",
          headers: { "Tus-Resumable": "1.0.0" },
        });
        const serverOffset = Number(head.headers.get("Upload-Offset"));
        if (head.ok && Number.isFinite(serverOffset) && serverOffset >= 0) offset = serverOffset;
      } catch {
        /* retry */
      }
    }
    if (!uploaded)
      throw new Error("Preview upload was interrupted after three retries. Please try again.");
  }
}
