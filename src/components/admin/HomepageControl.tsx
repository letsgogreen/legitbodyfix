import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Check, Dumbbell, ExternalLink, Loader2, PanelsTopLeft } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { bodyRegions } from "@/data/body-regions";
import { supabase } from "@/integrations/supabase/client";

type AdminPrefix = "/admin";

const sections = [
  {
    name: "Featured programs",
    description: "Program cards, cover images, pricing, availability, and homepage featuring.",
    icon: Dumbbell,
    path: "/programs",
  },
  {
    name: "Movement content",
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

export function HomepageControl({ adminPrefix }: { adminPrefix: AdminPrefix }) {
  const [media, setMedia] = useState(() => Object.fromEntries(bodyRegions.map((region) => [region.slug, { image_url: region.imageUrl, image_alt: region.imageAlt }])));
  const [saving, setSaving] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.from("site_media").select("key,image_url,image_alt").like("key", "body-region:%").then(({ data, error: loadError }) => {
      if (loadError) {
        setError(loadError.message);
        return;
      }
      if (!data) return;
      setMedia((current) => ({ ...current, ...Object.fromEntries(data.map((item) => [item.key.replace("body-region:", ""), { image_url: item.image_url, image_alt: item.image_alt }])) }));
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

      <Panel className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-bold">Customer view</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This preview loads the currently deployed homepage. Refresh after publishing content.
            </p>
          </div>
          <Tag tone="accent">Live preview</Tag>
        </div>
        <div className="bg-secondary p-3 sm:p-5">
          <iframe
            src="/"
            title="Live homepage preview"
            className="h-[38rem] w-full rounded-sm border border-border bg-background"
          />
        </div>
      </Panel>

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
        Hero wording, section headings, navigation labels, and the final CTA still live in the
        codebase. They are deliberately shown as code-controlled instead of pretending a draft was
        saved. A database-backed copy editor can be added when frequent copy changes justify it.
      </Panel>
    </div>
  );
}
