import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Check, Dumbbell, ExternalLink, Loader2, PanelsTopLeft, Type } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { bodyRegions, resolveBodyRegionMedia } from "@/data/body-regions";
import { homepageCopyDefaults, homepageCopyGroups, type HomepageCopy, type HomepageCopyKey } from "@/data/homepage-copy";
import { supabase } from "@/integrations/supabase/client";

type AdminPrefix = "/admin";

const sections = [
  {
    name: "Homepage copy",
    description: "Hero wording, section headings, introductions, and calls to action.",
    icon: Type,
    path: "/content#homepage-copy",
  },
  {
    name: "Featured programs",
    description: "Program cards, cover images, pricing, availability, and homepage featuring.",
    icon: Dumbbell,
    path: "/programs",
  },
  {
    name: "Posture & Movement",
    description: "Posture guidance, corrective exercises, images, dosage, and relationship links.",
    icon: BookOpen,
    path: "/recipes",
  },
  {
    name: "Muscle library",
    description: "Anatomy records and connections that turn reference pages into customer routes.",
    icon: PanelsTopLeft,
    path: "/muscles",
  },
] as const;

const pathEditorCards: Array<{
  number: string;
  label: HomepageCopyKey;
  title: HomepageCopyKey;
  body: HomepageCopyKey;
  cta: HomepageCopyKey;
}> = [
  { number: "01", label: "path_direction_label", title: "path_direction_title", body: "path_direction_body", cta: "path_direction_cta" },
  { number: "02", label: "path_learning_label", title: "path_learning_title", body: "path_learning_body", cta: "path_learning_cta" },
  { number: "03", label: "path_programs_label", title: "path_programs_title", body: "path_programs_body", cta: "path_programs_cta" },
];

export function HomepageControl({ adminPrefix }: { adminPrefix: AdminPrefix }) {
  const [media, setMedia] = useState(() => Object.fromEntries(bodyRegions.map((region) => [region.slug, { image_url: region.imageUrl, image_alt: region.imageAlt }])));
  const [saving, setSaving] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [copy, setCopy] = useState<HomepageCopy>({ ...homepageCopyDefaults });
  const [copyLoading, setCopyLoading] = useState(true);
  const [copySaving, setCopySaving] = useState(false);
  const [copySaved, setCopySaved] = useState(false);

  useEffect(() => {
    void supabase.from("site_media").select("key,image_url,image_alt").like("key", "body-region:%").then(({ data, error: loadError }) => {
      if (loadError) {
        setError(loadError.message);
        return;
      }
      if (!data) return;
      setMedia((current) => ({
        ...current,
        ...Object.fromEntries(data.map((item) => {
          const slug = item.key.replace("body-region:", "");
          const region = bodyRegions.find((candidate) => candidate.slug === slug);
          const resolved = region ? resolveBodyRegionMedia(region, item) : { imageUrl: item.image_url, imageAlt: item.image_alt };
          return [slug, { image_url: resolved.imageUrl, image_alt: resolved.imageAlt }];
        })),
      }));
    });
  }, []);

  useEffect(() => {
    void supabase.from("site_copy").select("key,value").then(({ data, error: loadError }) => {
      setCopyLoading(false);
      if (loadError) {
        setError(loadError.message);
        return;
      }
      setCopy((current) => {
        const next = { ...current };
        for (const item of data ?? []) {
          if (item.key in next) next[item.key as HomepageCopyKey] = item.value;
        }
        return next;
      });
    });
  }, []);

  async function saveRegion(slug: string) {
    const item = media[slug];
    if (!item) return;
    setSaving(slug);
    setSaved("");
    setError("");
    const { error: saveError } = await supabase.from("site_media").upsert({ key: `body-region:${slug}`, image_url: item.image_url, image_alt: item.image_alt, updated_at: new Date().toISOString() });
    setSaving("");
    if (saveError) setError(saveError.message);
    else setSaved(slug);
  }

  async function saveHomepageCopy() {
    setCopySaving(true);
    setCopySaved(false);
    setError("");
    const updated_at = new Date().toISOString();
    const rows = Object.entries(copy).map(([key, value]) => ({ key, value, updated_at }));
    const { error: saveError } = await supabase.from("site_copy").upsert(rows);
    setCopySaving(false);
    if (saveError) setError(saveError.message);
    else setCopySaved(true);
  }

  function updateCopy(key: HomepageCopyKey, value: string) {
    setCopySaved(false);
    setCopy((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title="Homepage control"
        meta="Live preview · real content sources · no mock fields"
        actions={
          <Link
            to="/"
            target="_blank"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-ink px-3 py-2 text-xs font-bold text-ink-foreground"
          >
            Open homepage <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <section id="homepage-copy" className="mt-5 scroll-mt-24">
        <div className="sticky top-0 z-10 -mx-2 flex flex-wrap items-end justify-between gap-4 border-y border-border bg-background/95 px-2 py-4 backdrop-blur">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Homepage copy</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Edit the main visitor journey</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Work from top to bottom in the same order visitors experience the page.</p>
          </div>
          <div className="flex items-center gap-3">
            {copySaved && <Tag tone="accent"><Check className="h-3 w-3" /> Saved</Tag>}
            <Btn variant="ink" disabled={copyLoading || copySaving} onClick={() => void saveHomepageCopy()}>
              {copySaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save homepage copy
            </Btn>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {homepageCopyGroups.map((group, groupIndex) => (
            <Panel key={group.title} className="overflow-hidden">
              <div className="grid gap-4 border-b border-border bg-secondary/40 px-5 py-4 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:items-center">
                <span className="font-mono text-xl font-bold text-muted-foreground/60">{String(groupIndex + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">{group.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{group.description}</p>
                </div>
                <Tag>{group.location}</Tag>
              </div>
              {group.title === "Hero" ? (
                <div className="grid min-h-[34rem] gap-8 bg-secondary/25 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
                  <div className="flex flex-col justify-center">
                    <input
                      aria-label="Hero eyebrow"
                      value={copy.hero_eyebrow}
                      maxLength={120}
                      onChange={(event) => updateCopy("hero_eyebrow", event.target.value)}
                      className="w-full border-0 border-b border-transparent bg-accent px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] outline-none hover:border-foreground focus:border-foreground"
                    />
                    <textarea
                      aria-label="Hero headline"
                      value={copy.hero_title}
                      rows={4}
                      maxLength={160}
                      onChange={(event) => updateCopy("hero_title", event.target.value)}
                      className="mt-6 w-full resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-[clamp(2.75rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.055em] outline-none hover:border-border focus:border-foreground"
                    />
                    <textarea
                      aria-label="Hero summary"
                      value={copy.hero_summary}
                      rows={4}
                      maxLength={280}
                      onChange={(event) => updateCopy("hero_summary", event.target.value)}
                      className="mt-5 w-full resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-lg leading-7 text-muted-foreground outline-none hover:border-border focus:border-foreground"
                    />
                    <div className="mt-6 flex flex-wrap gap-3">
                      <input aria-label="Hero primary button" value={copy.hero_primary_cta} maxLength={60} onChange={(event) => updateCopy("hero_primary_cta", event.target.value)} className="min-h-11 rounded-sm border-0 bg-accent px-5 py-3 text-sm font-bold outline-none ring-1 ring-transparent focus:ring-foreground" />
                      <input aria-label="Hero secondary button" value={copy.hero_secondary_cta} maxLength={60} onChange={(event) => updateCopy("hero_secondary_cta", event.target.value)} className="min-h-11 rounded-sm border border-foreground bg-background px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-foreground/15" />
                    </div>
                  </div>
                  <div className="hidden min-h-[28rem] place-items-center border border-border bg-card lg:grid">
                    <div className="max-w-xs text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Homepage visual</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">The live illustration remains controlled by the homepage layout.</p>
                    </div>
                  </div>
                </div>
              ) : group.title === "Body regions" || group.title === "Programs" ? (
                <div className="grid gap-8 bg-secondary/25 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] lg:items-end lg:p-8">
                  <div>
                    <input
                      aria-label={`${group.title} eyebrow`}
                      value={copy[group.title === "Body regions" ? "regions_eyebrow" : "programs_eyebrow"]}
                      maxLength={80}
                      onChange={(event) => updateCopy(group.title === "Body regions" ? "regions_eyebrow" : "programs_eyebrow", event.target.value)}
                      className="w-full border-0 border-b border-transparent bg-transparent px-0 py-1 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground outline-none hover:border-border focus:border-foreground"
                    />
                    <textarea
                      aria-label={`${group.title} heading`}
                      value={copy[group.title === "Body regions" ? "regions_heading" : "programs_heading"]}
                      rows={2}
                      maxLength={120}
                      onChange={(event) => updateCopy(group.title === "Body regions" ? "regions_heading" : "programs_heading", event.target.value)}
                      className="mt-4 w-full resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-4xl font-black uppercase leading-[0.95] tracking-tight outline-none hover:border-border focus:border-foreground"
                    />
                  </div>
                  <textarea
                    aria-label={`${group.title} introduction`}
                    value={copy[group.title === "Body regions" ? "regions_intro" : "programs_intro"]}
                    rows={5}
                    maxLength={280}
                    onChange={(event) => updateCopy(group.title === "Body regions" ? "regions_intro" : "programs_intro", event.target.value)}
                    className="w-full resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-base leading-7 text-muted-foreground outline-none hover:border-border focus:border-foreground"
                  />
                </div>
              ) : group.title === "Method & positioning" ? (
                <div className="grid gap-px bg-border md:grid-cols-2">
                  {[
                    { name: "How it works", eyebrow: "method_eyebrow" as const, heading: "method_heading" as const, number: "01" },
                    { name: "Why LegitBodyFix", eyebrow: "why_eyebrow" as const, heading: "why_heading" as const, number: "02" },
                  ].map((item) => (
                    <div key={item.name} className="bg-card p-6 lg:p-8">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl font-bold text-muted-foreground/40">{item.number}</span>
                        <input aria-label={`${item.name} eyebrow`} value={copy[item.eyebrow]} maxLength={80} onChange={(event) => updateCopy(item.eyebrow, event.target.value)} className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent px-0 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground outline-none hover:border-border focus:border-foreground" />
                      </div>
                      <textarea aria-label={`${item.name} heading`} value={copy[item.heading]} rows={3} maxLength={120} onChange={(event) => updateCopy(item.heading, event.target.value)} className="mt-6 w-full resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-3xl font-black uppercase leading-tight tracking-tight outline-none hover:border-border focus:border-foreground" />
                    </div>
                  ))}
                </div>
              ) : group.title === "Closing action" ? (
                <div className="bg-accent p-8 text-center text-accent-foreground lg:p-12">
                  <textarea aria-label="Closing heading" value={copy.final_heading} rows={2} maxLength={120} onChange={(event) => updateCopy("final_heading", event.target.value)} className="mx-auto block w-full max-w-3xl resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-center text-4xl font-black uppercase leading-none outline-none hover:border-foreground/30 focus:border-foreground" />
                  <textarea aria-label="Closing supporting text" value={copy.final_body} rows={3} maxLength={200} onChange={(event) => updateCopy("final_body", event.target.value)} className="mx-auto mt-4 block w-full max-w-2xl resize-none border-0 border-b border-transparent bg-transparent px-0 py-2 text-center text-base leading-7 outline-none hover:border-foreground/30 focus:border-foreground" />
                  <input aria-label="Closing button" value={copy.final_cta} maxLength={60} onChange={(event) => updateCopy("final_cta", event.target.value)} className="mt-6 min-h-11 rounded-sm border-0 bg-ink px-7 py-3 text-center text-sm font-bold text-ink-foreground outline-none focus:ring-2 focus:ring-foreground" />
                </div>
              ) : group.title === "Choose a path" ? (
                <div className="bg-secondary/25 p-5">
                  <label className="block max-w-3xl">
                    <span className="mb-2 block text-xs font-bold text-foreground">Section heading</span>
                    <input
                      value={copy.paths_heading}
                      maxLength={120}
                      onChange={(event) => updateCopy("paths_heading", event.target.value)}
                      className="min-h-12 w-full rounded-sm border border-border bg-background px-4 py-3 text-xl font-extrabold outline-none transition-shadow focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                    />
                  </label>
                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {pathEditorCards.map((card) => (
                      <div key={card.number} className="flex min-h-[22rem] flex-col border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          <span className="grid h-6 w-6 place-items-center rounded-full border border-border">{card.number}</span>
                          <input
                            aria-label={`Card ${card.number} label`}
                            value={copy[card.label].replace(/^\d+\s*\/\s*/, "")}
                            maxLength={60}
                            onChange={(event) => updateCopy(card.label, `${card.number} / ${event.target.value}`)}
                            className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent px-0 py-1 font-mono text-[10px] uppercase tracking-[0.14em] outline-none hover:border-border focus:border-foreground"
                          />
                        </div>
                        <input
                          aria-label={`Card ${card.number} title`}
                          value={copy[card.title]}
                          maxLength={80}
                          onChange={(event) => updateCopy(card.title, event.target.value)}
                          className="mt-5 w-full border-0 border-b border-transparent bg-transparent px-0 py-1 text-lg font-extrabold outline-none hover:border-border focus:border-foreground"
                        />
                        <textarea
                          aria-label={`Card ${card.number} description`}
                          value={copy[card.body]}
                          rows={4}
                          maxLength={180}
                          onChange={(event) => updateCopy(card.body, event.target.value)}
                          className="mt-3 w-full flex-1 resize-none border-0 border-b border-transparent bg-transparent px-0 py-1 text-sm leading-6 text-muted-foreground outline-none hover:border-border focus:border-foreground"
                        />
                        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                          <input
                            aria-label={`Card ${card.number} button`}
                            value={copy[card.cta]}
                            maxLength={60}
                            onChange={(event) => updateCopy(card.cta, event.target.value)}
                            className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent px-0 py-1 text-sm font-bold outline-none hover:border-border focus:border-foreground"
                          />
                          <span aria-hidden className="text-lg">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Edit directly inside each card. Destinations remain fixed to the starting point, body regions, and programs.</p>
                </div>
              ) : (
                <div className="grid gap-x-5 gap-y-5 p-5 md:grid-cols-2">
                  {group.fields.map((field) => (
                  <label key={field.key} className={field.multiline ? "block md:col-span-2" : "block"}>
                    <span className="mb-2 block text-xs font-bold text-foreground">{field.label}</span>
                    {field.multiline ? (
                      <textarea
                        value={copy[field.key]}
                        rows={field.key === "hero_title" ? 5 : 4}
                        maxLength={field.key === "hero_summary" || field.key.endsWith("intro") ? 280 : 160}
                        onChange={(event) => updateCopy(field.key, event.target.value)}
                        className="w-full resize-y rounded-sm border border-border bg-background px-4 py-3 text-base leading-7 outline-none transition-shadow focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                      />
                    ) : (
                      <input
                        value={copy[field.key]}
                        maxLength={120}
                        onChange={(event) => updateCopy(field.key, event.target.value)}
                        className="min-h-12 w-full rounded-sm border border-border bg-background px-4 py-3 text-base outline-none transition-shadow focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                      />
                    )}
                    {field.key === "hero_title" && <span className="mt-1.5 block text-xs text-muted-foreground">Each line break creates a new headline line.</span>}
                  </label>
                  ))}
                </div>
              )}
            </Panel>
          ))}
        </div>
      </section>

      <div className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Homepage media</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Body-region card images</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">Upload a broad regional anatomy, joint, or movement image. Changes appear on the homepage after saving.</p>
        </div>
        {error && <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bodyRegions.map((region) => {
            const item = media[region.slug] ?? { image_url: region.imageUrl, image_alt: region.imageAlt };
            return (
              <Panel key={region.slug} className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div><p className="text-base font-bold">{region.title}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Homepage card</p></div>
                  {saved === region.slug && <Tag tone="accent"><Check className="h-3 w-3" /> Saved</Tag>}
                </div>
                <ImageUploadField
                  value={item.image_url}
                  alt={item.image_alt}
                  folder={`body-regions/${region.slug}`}
                  bucket="region-images"
                  label={`${region.title} image`}
                  onChange={(image_url) => setMedia((current) => ({ ...current, [region.slug]: { ...item, image_url } }))}
                  onAltChange={(image_alt) => setMedia((current) => ({ ...current, [region.slug]: { ...item, image_alt } }))}
                />
                <Btn variant="ink" className="mt-4 w-full justify-center" disabled={saving === region.slug} onClick={() => void saveRegion(region.slug)}>
                  {saving === region.slug && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save card image
                </Btn>
              </Panel>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Editable sources
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
              Change what visitors see
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Homepage cards are generated from these content systems. Edit and publish the source
            record instead of maintaining a second copy in a visual mock.
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {sections.map(({ name, description, icon: Icon, path }) => (
            <a
              key={name}
              href={`${adminPrefix}${path}`}
              className="group rounded-sm border border-border bg-card p-5 transition-colors hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-sm border border-border bg-background">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Database controlled
              </p>
              <h3 className="mt-2 text-lg font-bold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </a>
          ))}
        </div>
      </div>

      <Panel className="mt-5 border-amber-300/70 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Navigation labels and structural layouts remain code-controlled. Homepage copy, media, and
        content cards are edited through their live sources above.
      </Panel>
    </div>
  );
}
