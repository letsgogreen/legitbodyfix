import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Dumbbell, ExternalLink, Map, PanelsTopLeft } from "lucide-react";
import { PageHead, Panel, Tag } from "@/components/admin/AdminUI";

type AdminPrefix = "/admin" | "/ver1/admin";

const sections = [
  {
    name: "Featured programs",
    description: "Program cards, cover images, pricing, availability, and homepage featuring.",
    icon: Dumbbell,
    path: "/programs",
  },
  {
    name: "Movement guides",
    description: "Posture and movement entry points linked to recipes, muscles, and programs.",
    icon: Map,
    path: "/guides",
  },
  {
    name: "Corrective recipes",
    description: "Exercise content, images, dosage, safety notes, and relationship links.",
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
              href={
                adminPrefix === "/admin" && path === "/guides"
                  ? "/ver1/admin/guides"
                  : `${adminPrefix}${path}`
              }
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
