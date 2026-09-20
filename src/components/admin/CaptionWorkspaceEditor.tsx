import { useEffect, useMemo, useState } from "react";
import {
  getCaptionWorkspace,
  importCaptionWorkspace,
  publishCaptionWorkspace,
  saveCaptionWorkspace,
  type CaptionWorkspace,
} from "@/lib/caption-workspace.functions";

type Language = "en" | "ko";

function cueRows(vtt: string) {
  return vtt.replace(/\r/g, "").split(/\n{2,}/).flatMap((block, index) => {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes(" --> "));
    if (timingIndex < 0) return [];
    const timing = lines[timingIndex];
    const start = timing.split(" --> ")[0] || "00:00:00.000";
    const parts = start.split(":").map(Number);
    const seconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    return [{ index, timing, seconds, text: lines.slice(timingIndex + 1).join("\n") }];
  });
}

function downloadVtt(language: Language, vtt: string) {
  const url = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${language}-captions.vtt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyVtt(vtt: string) {
  await navigator.clipboard.writeText(vtt);
}

function ActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={`border border-border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`} />;
}

export function CaptionWorkspaceEditor({
  streamUid,
  onPreview,
}: {
  streamUid: string;
  onPreview: (language: Language, startTime?: number) => void;
}) {
  const [workspaces, setWorkspaces] = useState<Partial<Record<Language, CaptionWorkspace>>>({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBusy("load");
    void getCaptionWorkspace({ data: { streamUid } })
      .then((result) => {
        setWorkspaces(Object.fromEntries(result.workspaces.map((item) => [item.language, item])));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setBusy(""));
  }, [streamUid]);

  const englishCues = useMemo(() => cueRows(workspaces.en?.vtt || ""), [workspaces.en?.vtt]);
  const koreanCues = useMemo(() => cueRows(workspaces.ko?.vtt || ""), [workspaces.ko?.vtt]);
  const koreanByTiming = useMemo(
    () => new Map(koreanCues.map((cue) => [cue.timing, cue])),
    [koreanCues],
  );
  const timingsMatch = useMemo(
    () =>
      englishCues.length > 0 &&
      englishCues.length === koreanCues.length &&
      englishCues.every((cue) => koreanByTiming.has(cue.timing)),
    [englishCues, koreanCues, koreanByTiming],
  );
  const update = (language: Language, patch: Partial<CaptionWorkspace>) =>
    setWorkspaces((current) => ({ ...current, [language]: { language, vtt: "WEBVTT\n", status: "draft", updatedAt: "", ...current[language], ...patch } }));

  async function run(key: string, task: () => Promise<void>) {
    setBusy(key);
    setMessage("");
    try { await task(); } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(""); }
  }

  return (
    <section className="mt-6 border border-border bg-secondary/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Caption workspace</p>
          <h3 className="mt-1 text-lg font-extrabold">Copy, edit, review, then publish</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">Copy the source WebVTT for external translation, then paste the reviewed result into the Korean editor. Draft changes stay here until you press Publish.</p>
        </div>
      </div>

      {message && <p className="mt-4 border border-border bg-background p-3 text-xs">{message}</p>}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {(["en", "ko"] as const).map((language) => {
          const workspace = workspaces[language];
          const label = language === "en" ? "English source" : "한국어 번역";
          const koreanTimingBlocked = language === "ko" && englishCues.length > 0 && !timingsMatch;
          return (
            <div key={language} className="border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><strong className="text-sm">{label}</strong><span className="ml-2 font-mono text-[10px] uppercase text-muted-foreground">{workspace?.status || "not imported"}</span></div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton disabled={Boolean(busy)} onClick={() => void run(`import-${language}`, async () => update(language, await importCaptionWorkspace({ data: { streamUid, language } })))}>Import from player</ActionButton>
                  {workspace && <ActionButton onClick={() => void run(`copy-${language}`, async () => { await copyVtt(workspace.vtt); setMessage(`${label} copied to the clipboard.`); })}>Copy VTT</ActionButton>}
                  {workspace && <ActionButton onClick={() => downloadVtt(language, workspace.vtt)}>Download VTT</ActionButton>}
                </div>
              </div>
              {workspace ? (
                <details className="mt-3" open>
                  <summary className="cursor-pointer text-xs font-bold">Edit WebVTT</summary>
                  <textarea
                    className="mt-3 min-h-64 w-full border border-border bg-secondary/30 p-3 font-mono text-xs leading-5 outline-none focus:border-foreground"
                    value={workspace.vtt}
                    onChange={(event) => update(language, { vtt: event.target.value, status: "draft" })}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton disabled={Boolean(busy)} onClick={() => void run(`save-${language}`, async () => update(language, await saveCaptionWorkspace({ data: { streamUid, language, vtt: workspace.vtt, status: workspace.status } })))}>Save draft</ActionButton>
                    <ActionButton disabled={Boolean(busy) || koreanTimingBlocked} onClick={() => void run(`review-${language}`, async () => update(language, await saveCaptionWorkspace({ data: { streamUid, language, vtt: workspace.vtt, status: "review" } })))}>Mark for review</ActionButton>
                    <ActionButton disabled={workspace.status !== "review" || Boolean(busy) || koreanTimingBlocked} className="bg-ink text-ink-foreground" onClick={() => void run(`publish-${language}`, async () => { update(language, await publishCaptionWorkspace({ data: { streamUid, language, vtt: workspace.vtt } })); onPreview(language); setMessage(`${label} published to Cloudflare.`); })}>Publish</ActionButton>
                    <ActionButton onClick={() => onPreview(language)}>Preview</ActionButton>
                  </div>
                </details>
              ) : (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Import the ready player caption to begin editing. Nothing is published by importing it.
                </p>
              )}
              {koreanTimingBlocked && (
                <p className="mt-3 border border-destructive/40 bg-destructive/5 p-3 text-xs leading-5 text-destructive">
                  Korean cue timings do not match the English source. Review and publishing are
                  blocked. Copy the English VTT, translate only the cue text while preserving its
                  timestamps, then paste the result into the Korean editor.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {(englishCues.length > 0 || koreanCues.length > 0) && (
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="text-sm font-bold">Cue-by-cue comparison</h4>
          {englishCues.length > 0 && koreanCues.length > 0 && !timingsMatch && (
            <p className="mt-3 border border-destructive/40 bg-destructive/5 p-3 text-xs leading-5 text-destructive">
              Timing mismatch detected. Unmatched Korean cues are not paired with unrelated English
              cues. Preserve the English timestamps when preparing the Korean WebVTT.
            </p>
          )}
          <div className="mt-3 max-h-96 overflow-auto border border-border bg-background">
            {englishCues.map((cue) => (
              <button key={`${cue.index}-${cue.timing}`} type="button" onClick={() => onPreview(workspaces.ko ? "ko" : "en", cue.seconds)} className="grid w-full gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-secondary sm:grid-cols-[120px_1fr_1fr]">
                <span className="font-mono text-[10px] text-muted-foreground">{cue.timing.split(" --> ")[0]}<br />Play segment</span>
                <span className="text-xs leading-5">{cue.text}</span>
                <span className="text-xs leading-5 text-muted-foreground">{koreanByTiming.get(cue.timing)?.text || "No translation at this timing"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
