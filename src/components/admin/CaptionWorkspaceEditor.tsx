import { useEffect, useMemo, useState } from "react";
import {
  getCaptionWorkspace,
  importCaptionWorkspace,
  publishCaptionWorkspace,
  saveCaptionGlossary,
  saveCaptionWorkspace,
  translateCaptionWorkspace,
  type CaptionGlossaryEntry,
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
  const [glossary, setGlossary] = useState<CaptionGlossaryEntry[]>([]);
  const [glossaryText, setGlossaryText] = useState("");
  const [openAiConfigured, setOpenAiConfigured] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBusy("load");
    void getCaptionWorkspace({ data: { streamUid } })
      .then((result) => {
        setWorkspaces(Object.fromEntries(result.workspaces.map((item) => [item.language, item])));
        setGlossary(result.glossary);
        setGlossaryText(result.glossary.map((item) => `${item.sourceTerm} = ${item.targetTerm}${item.note ? ` # ${item.note}` : ""}`).join("\n"));
        setOpenAiConfigured(result.openAiConfigured);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setBusy(""));
  }, [streamUid]);

  const englishCues = useMemo(() => cueRows(workspaces.en?.vtt || ""), [workspaces.en?.vtt]);
  const koreanCues = useMemo(() => cueRows(workspaces.ko?.vtt || ""), [workspaces.ko?.vtt]);
  const update = (language: Language, patch: Partial<CaptionWorkspace>) =>
    setWorkspaces((current) => ({ ...current, [language]: { language, vtt: "WEBVTT\n", status: "draft", updatedAt: "", ...current[language], ...patch } }));

  async function run(key: string, task: () => Promise<void>) {
    setBusy(key);
    setMessage("");
    try { await task(); } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(""); }
  }

  function parseGlossary() {
    return glossaryText.split("\n").flatMap((line) => {
      const [pair, note = ""] = line.split("#", 2);
      const [sourceTerm, targetTerm] = (pair || "").split("=", 2).map((value) => value.trim());
      return sourceTerm && targetTerm ? [{ sourceTerm, targetTerm, note: note.trim() }] : [];
    });
  }

  return (
    <section className="mt-6 border border-border bg-secondary/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Caption workspace</p>
          <h3 className="mt-1 text-lg font-extrabold">Translate, review, then publish</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">Draft changes stay in the admin workspace. Cloudflare is updated only when you press Publish.</p>
        </div>
        <span className={`border px-3 py-2 font-mono text-[10px] uppercase ${openAiConfigured ? "border-accent text-foreground" : "border-destructive/40 text-destructive"}`}>
          OpenAI {openAiConfigured ? "connected" : "key required"}
        </span>
      </div>

      {message && <p className="mt-4 border border-border bg-background p-3 text-xs">{message}</p>}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {(["en", "ko"] as const).map((language) => {
          const workspace = workspaces[language];
          const label = language === "en" ? "English source" : "한국어 번역";
          return (
            <div key={language} className="border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><strong className="text-sm">{label}</strong><span className="ml-2 font-mono text-[10px] uppercase text-muted-foreground">{workspace?.status || "not imported"}</span></div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton disabled={Boolean(busy)} onClick={() => void run(`import-${language}`, async () => update(language, await importCaptionWorkspace({ data: { streamUid, language } })))}>Import from player</ActionButton>
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
                    <ActionButton disabled={Boolean(busy)} onClick={() => void run(`review-${language}`, async () => update(language, await saveCaptionWorkspace({ data: { streamUid, language, vtt: workspace.vtt, status: "review" } })))}>Mark for review</ActionButton>
                    <ActionButton disabled={workspace.status !== "review" || Boolean(busy)} className="bg-ink text-ink-foreground" onClick={() => void run(`publish-${language}`, async () => { update(language, await publishCaptionWorkspace({ data: { streamUid, language, vtt: workspace.vtt } })); onPreview(language); setMessage(`${label} published to Cloudflare.`); })}>Publish</ActionButton>
                    <ActionButton onClick={() => onPreview(language)}>Preview</ActionButton>
                  </div>
                </details>
              ) : (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Import the ready player caption to begin editing. Nothing is published by importing it.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton disabled={!workspaces.en || !openAiConfigured || Boolean(busy)} className="bg-accent text-accent-foreground" onClick={() => void run("translate", async () => update("ko", await translateCaptionWorkspace({ data: { streamUid, englishVtt: workspaces.en!.vtt } })))}>Translate English draft to Korean</ActionButton>
        <span className="self-center text-xs text-muted-foreground">Translation creates a draft and never publishes automatically.</span>
      </div>

      <details className="mt-5 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-bold">Professional terminology glossary ({glossary.length})</summary>
        <p className="mt-2 text-xs text-muted-foreground">One entry per line: English term = Korean term # optional note</p>
        <textarea className="mt-3 min-h-40 w-full border border-border bg-background p-3 font-mono text-xs leading-5" value={glossaryText} onChange={(event) => setGlossaryText(event.target.value)} />
        <ActionButton disabled={Boolean(busy)} className="mt-2" onClick={() => void run("glossary", async () => { const entries = parseGlossary(); await saveCaptionGlossary({ data: { entries } }); setGlossary(entries); setMessage("Glossary saved."); })}>Save glossary</ActionButton>
      </details>

      {(englishCues.length > 0 || koreanCues.length > 0) && (
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="text-sm font-bold">Cue-by-cue comparison</h4>
          <div className="mt-3 max-h-96 overflow-auto border border-border bg-background">
            {englishCues.map((cue, index) => (
              <button key={`${cue.index}-${cue.timing}`} type="button" onClick={() => onPreview(workspaces.ko ? "ko" : "en", cue.seconds)} className="grid w-full gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-secondary sm:grid-cols-[120px_1fr_1fr]">
                <span className="font-mono text-[10px] text-muted-foreground">{cue.timing.split(" --> ")[0]}<br />Play segment</span>
                <span className="text-xs leading-5">{cue.text}</span>
                <span className="text-xs leading-5 text-muted-foreground">{koreanCues[index]?.text || "—"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
