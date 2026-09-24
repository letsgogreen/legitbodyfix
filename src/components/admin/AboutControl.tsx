import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Btn, Panel, Tag } from "@/components/admin/AdminUI";
import { aboutCopyDefaults, type AboutCopy } from "@/data/about-copy";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="sticky top-0 z-10 -mx-2 flex flex-col gap-4 border-y border-border bg-background/95 px-2 py-5 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">About page · live-layout editor</p><h2 className="mt-2 text-2xl font-extrabold">Edit About Us</h2><p className="mt-1 text-sm text-muted-foreground">Edit from top to bottom in the same structure visitors see. Contact email is intentionally excluded.</p></div>
      <div className="flex flex-wrap gap-2">{saved && <Tag tone="accent"><Check className="h-3 w-3" /> Saved</Tag>}<Link to="/about" target="_blank" className="inline-flex min-h-10 items-center gap-2 border border-border px-3 py-2 text-xs font-bold">Open About <ExternalLink className="h-3.5 w-3.5" /></Link><Btn variant="ink" disabled={loading || saving} onClick={() => void save()}>{saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Save About page</Btn></div>
    </div>
    {error && <p role="alert" className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    <div className="mt-5 space-y-4">
      <Panel className="overflow-hidden">
        <SectionHeader number="01" title="Hero" description="The first message visitors see at the top of About Us." location="Top of page" />
        <div className="bg-card px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <InlineInput label="About eyebrow" value={copy.about_eyebrow} onChange={(value) => update("about_eyebrow", value)} className="max-w-3xl font-mono text-xs font-bold uppercase tracking-[.18em] text-muted-foreground" />
          <InlineTextarea label="About headline" value={copy.about_title} onChange={(value) => update("about_title", value)} rows={3} className="mt-5 max-w-5xl text-4xl font-black uppercase leading-[.92] tracking-[-.04em] sm:text-6xl" />
          <InlineTextarea label="About introduction" value={copy.about_intro} onChange={(value) => update("about_intro", value)} rows={3} className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground" />
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <SectionHeader number="02" title="Method & scope" description="The two information cards shown immediately after the introduction." location="Middle of page" />
        <div className="grid gap-px bg-border p-px md:grid-cols-2">
          <article className="bg-background p-7 sm:p-9">
            <InlineInput label="Method heading" value={copy.about_method_title} onChange={(value) => update("about_method_title", value)} className="text-2xl font-extrabold" />
            <InlineTextarea label="Method description" value={copy.about_method_body} onChange={(value) => update("about_method_body", value)} rows={6} className="mt-4 leading-7 text-muted-foreground" />
          </article>
          <article className="bg-background p-7 sm:p-9">
            <InlineInput label="Scope heading" value={copy.about_scope_title} onChange={(value) => update("about_scope_title", value)} className="text-2xl font-extrabold" />
            <InlineTextarea label="Scope description" value={copy.about_scope_body} onChange={(value) => update("about_scope_body", value)} rows={6} className="mt-4 leading-7 text-muted-foreground" />
          </article>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <SectionHeader number="03" title="Operator & credentials" description="Public operator details and optional professional credentials." location="Bottom of page" />
        <div className="grid gap-10 bg-card p-7 sm:p-10 md:grid-cols-2">
          <article>
            <InlineInput label="Operator heading" value={copy.about_operator_title} onChange={(value) => update("about_operator_title", value)} className="text-3xl font-black uppercase" />
            <InlineTextarea label="Operator description" value={copy.about_operator_body} onChange={(value) => update("about_operator_body", value)} rows={5} className="mt-4 leading-7 text-muted-foreground" />
          </article>
          <article className="border border-dashed border-border p-5">
            <InlineInput label="Credentials heading" value={copy.about_credentials_title} onChange={(value) => update("about_credentials_title", value)} className="text-3xl font-black uppercase" />
            <InlineTextarea label="Credentials" value={copy.about_credentials_body} onChange={(value) => update("about_credentials_body", value)} rows={5} placeholder="Add credentials to show this section publicly." className="mt-4 leading-7 text-muted-foreground" />
            {!copy.about_credentials_body.trim() && <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Hidden on the public page until credentials are added</p>}
          </article>
        </div>
      </Panel>
    </div>
  </section>;
}

function SectionHeader({ number, title, description, location }: { number: string; title: string; description: string; location: string }) {
  return <div className="grid gap-4 border-b border-border bg-secondary/40 px-5 py-4 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:items-center">
    <span className="font-mono text-xl font-bold text-muted-foreground/60">{number}</span>
    <div><h3 className="text-lg font-extrabold tracking-tight">{title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p></div>
    <Tag>{location}</Tag>
  </div>;
}

function InlineInput({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className: string }) {
  return <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`block min-h-11 w-full border-0 border-b border-transparent bg-transparent px-0 py-2 outline-none hover:border-border focus:border-foreground ${className}`} />;
}

function InlineTextarea({ label, value, onChange, rows, className, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows: number; className: string; placeholder?: string }) {
  return <textarea aria-label={label} value={value} rows={rows} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={`block w-full resize-y border-0 border-b border-transparent bg-transparent px-0 py-2 outline-none hover:border-border focus:border-foreground ${className}`} />;
}

