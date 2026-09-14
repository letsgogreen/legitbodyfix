import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Save, Upload } from "lucide-react";
import { Btn, PageHead } from "@/components/admin/AdminUI";
import { getAdminPrograms } from "@/lib/admin-programs.functions";
import {
  getAdminProgramSalesPages,
  saveAdminProgramSalesPage,
} from "@/lib/program-sales.functions";
import {
  createSalesPreviewTusUpload,
  deleteSalesPreviewCaptions,
  generateSalesPreviewCaptions,
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
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground caret-foreground outline-none placeholder:text-muted-foreground focus:border-ink";
const textarea = `${control} min-h-24 resize-y`;
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
    techniqueEyebrow: "Why technique matters",
    techniqueHeadline:
      "Knowing what to do is one thing. Knowing how to make it work in your body is another.",
    techniqueBody:
      "This session teaches an effective active self-myofascial release (SMR) technique designed to reduce overactivity in targeted muscles. It combines focused pressure on tight areas with controlled movement of the joint and surrounding tissue to help break up adhesions, improve mobility, and prepare your body for the activation and integration work that follows.",
    curriculum: v.curriculum?.length === 3 ? v.curriculum : fallbackSteps,
    finalHeadline: "Put the method into practice.",
    previewStreamUid: "",
    previewStreamStatus: "not_uploaded",
    previewThumbnailUrl: "",
  };
  return { ...b, ...s, curriculum: s?.curriculum?.length === 3 ? s.curriculum : b.curriculum };
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[.18em] opacity-70">
        {label}
      </span>
      {children}
    </label>
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
  const [previewCaptions, setPreviewCaptions] = useState<StreamCaption[]>([]);
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
          return [{
            ...base,
            id: salesPageId,
            title: program.name,
            description: program.outcome || base.description,
          }];
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
  useEffect(() => {
    setPreviewIframeUrl("");
    if (!videoId || draft?.previewStreamStatus !== "ready" || !draft.previewStreamUid) return;
    let active = true;
    void getAdminSalesPreviewIframe({ data: { streamUid: draft.previewStreamUid } })
      .then(({ iframeUrl }) => {
        if (active) setPreviewIframeUrl(iframeUrl);
      })
      .catch((e) => {
        if (active)
          setMessage(
            e instanceof Error
              ? `Could not load the secure preview: ${e.message}`
              : "Could not load the secure preview.",
          );
      });
    return () => {
      active = false;
    };
  }, [videoId, draft?.previewStreamStatus, draft?.previewStreamUid]);
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
  async function generateCaptions(language: "en" | "ko") {
    if (!draft?.previewStreamUid) return;
    setCaptionBusy(language);
    setMessage("");
    try {
      await generateSalesPreviewCaptions({
        data: { streamUid: draft.previewStreamUid, language },
      });
      await refreshCaptions();
      setMessage("Caption generation started. Refresh shortly to check its status.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setCaptionBusy(null);
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
        <div className="mt-5 overflow-hidden border border-border bg-card">
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
                <p className="mt-2 text-xs text-muted-foreground">
                  Preview ready. The player on the right is what customers will see on the sales
                  page.
                </p>
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
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  Loading secure player…
                </div>
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  Preview will appear here after processing
                </div>
              )}
            </div>
            {draft.previewStreamStatus === "ready" && draft.previewStreamUid && (
              <div className="border-t border-border pt-5 lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Preview captions</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Generate captions for spoken audio, or upload a reviewed WebVTT translation.
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
                          <Btn
                            disabled={captionBusy !== null || Boolean(caption)}
                            onClick={() => void generateCaptions(language)}
                          >
                            {captionBusy === language ? "Working…" : `Generate from ${name} audio`}
                          </Btn>
                          <label
                            className={`inline-flex cursor-pointer items-center border border-border px-3 py-2 text-xs font-bold ${captionBusy !== null ? "pointer-events-none opacity-50" : ""}`}
                          >
                            Upload WebVTT
                            <input
                              className="sr-only"
                              type="file"
                              accept=".vtt,text/vtt"
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
              </div>
            )}
          </section>
          <section className="p-6 lg:p-10">
            <Field label="Why this session">
              <input
                className={`${control} text-xl font-bold`}
                value={draft.landingWhyHeadline}
                onChange={(e) => set("landingWhyHeadline", e.target.value)}
              />
            </Field>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {(["landingBenefit1", "landingBenefit2", "landingBenefit3"] as const).map((k, i) => (
                <Field key={k} label={`Benefit ${i + 1}`}>
                  <textarea
                    className={textarea}
                    value={draft[k]}
                    onChange={(e) => set(k, e.target.value)}
                  />
                </Field>
              ))}
            </div>
          </section>
          <section className="border-y border-border bg-secondary p-6 lg:p-10">
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
                className={textarea}
                value={draft.techniqueBody}
                onChange={(e) => set("techniqueBody", e.target.value)}
              />
            </Field>
          </section>
          <section className="p-6 lg:p-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest">
              Three-phase curriculum
            </p>
            <div className="grid gap-3 lg:grid-cols-3">
              {draft.curriculum.map((s, i) => (
                <div key={i} className="border border-border p-4">
                  <input
                    className={control}
                    value={s.phase}
                    onChange={(e) => setStep(i, "phase", e.target.value)}
                  />
                  <input
                    className={`${control} mt-2 font-bold`}
                    value={s.title}
                    onChange={(e) => setStep(i, "title", e.target.value)}
                  />
                  <textarea
                    className={`${textarea} mt-2`}
                    value={s.description}
                    onChange={(e) => setStep(i, "description", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
          <section className="grid border-t border-border lg:grid-cols-2">
            <div className="p-6 lg:p-10">
              <Field label="Who this is for">
                <textarea
                  className={textarea}
                  value={draft.landingAudience}
                  onChange={(e) => set("landingAudience", e.target.value)}
                />
              </Field>
            </div>
            <div className="bg-accent p-6 text-accent-foreground lg:p-10">
              <Field label="Purchase reassurance">
                <textarea
                  className={textarea}
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
