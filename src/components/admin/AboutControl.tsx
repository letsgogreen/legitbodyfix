import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Btn, Panel, Tag } from "@/components/admin/AdminUI";
import { aboutCopyDefaults, type AboutCopy, type AboutCopyKey } from "@/data/about-copy";
import { supabase } from "@/integrations/supabase/client";

const fields: Array<{ key: AboutCopyKey; label: string; rows?: number }> = [
  { key: "about_eyebrow", label: "Eyebrow" },
  { key: "about_title", label: "Main headline", rows: 2 },
  { key: "about_intro", label: "Introduction", rows: 3 },
  { key: "about_method_title", label: "Method heading" },
  { key: "about_method_body", label: "Method description", rows: 4 },
  { key: "about_scope_title", label: "Scope heading" },
  { key: "about_scope_body", label: "Scope description", rows: 4 },
  { key: "about_operator_title", label: "Operator heading" },
  { key: "about_operator_body", label: "Operator description", rows: 3 },
  { key: "about_credentials_title", label: "Credentials heading" },
  { key: "about_credentials_body", label: "Credentials (leave empty to hide)", rows: 5 },
];

export function AboutControl() {
  const [copy, setCopy] = useState<AboutCopy>({ ...aboutCopyDefaults });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.from("site_copy").select("key,value").like("key", "about_%").then(({ data, error: loadError }) => {
      setLoading(false);
      if (loadError) return setError(loadError.message);
      setCopy((current) => {
        const next = { ...current };
        for (const item of data ?? []) if (item.key in next) next[item.key as AboutCopyKey] = item.value;
        return next;
      });
    });
  }, []);

  function update(key: AboutCopyKey, value: string) {
    setSaved(false);
    setCopy((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const updated_at = new Date().toISOString();
    const rows = Object.entries(copy).map(([key, value]) => ({ key, value, updated_at }));
    const { error: saveError } = await supabase.from("site_copy").upsert(rows);
    setSaving(false);
    if (saveError) setError(saveError.message);
    else setSaved(true);
  }

  return <section id="about-copy" className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
    <div className="flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">About page</p><h2 className="mt-2 text-2xl font-extrabold">Edit About Us</h2><p className="mt-1 text-sm text-muted-foreground">Contact email is intentionally excluded. Empty credentials stay hidden publicly.</p></div>
      <div className="flex flex-wrap gap-2">{saved && <Tag tone="accent"><Check className="h-3 w-3" /> Saved</Tag>}<Link to="/about" target="_blank" className="inline-flex min-h-10 items-center gap-2 border border-border px-3 py-2 text-xs font-bold">Open About <ExternalLink className="h-3.5 w-3.5" /></Link><Btn variant="ink" disabled={loading || saving} onClick={() => void save()}>{saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Save About page</Btn></div>
    </div>
    {error && <p role="alert" className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    <Panel className="mt-5 grid gap-5 p-5 md:grid-cols-2">
      {fields.map((field) => <label key={field.key} className={field.rows ? "grid gap-2 md:col-span-2" : "grid gap-2"}><span className="text-xs font-bold">{field.label}</span>{field.rows ? <textarea rows={field.rows} value={copy[field.key]} onChange={(event) => update(field.key, event.target.value)} className="resize-y border border-border bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-foreground" /> : <input value={copy[field.key]} onChange={(event) => update(field.key, event.target.value)} className="min-h-11 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground" />}</label>)}
    </Panel>
  </section>;
}

