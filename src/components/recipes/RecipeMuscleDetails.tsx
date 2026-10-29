import { isAllowedHttpUrl } from "@/lib/recipe-blocks";
import type { RecipeMuscleEntry } from "@/lib/recipe-muscle-dictionary";

export function RecipeMuscleDetails({ ids, entries }: { ids: string[]; entries: RecipeMuscleEntry[] }) {
  if (!ids.length) return null;
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  return (
    <div className="space-y-5 whitespace-normal" aria-label="Linked muscle dictionary">
      {ids.map((id) => {
        const entry = byId.get(id);
        if (!entry) return <p key={id} className="text-sm text-muted-foreground">This dictionary entry is not currently available.</p>;
        const functions = entry.functions?.filter(Boolean).join("; ") || entry.description;
        return (
          <section key={id} className="space-y-3 rounded-sm border border-border bg-secondary/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold">{entry.name}</h4>
              <span className="text-[10px] text-muted-foreground">Muscle dictionary{entry.published ? "" : " · Draft / admin preview"}</span>
            </div>
            {entry.image_url && isAllowedHttpUrl(entry.image_url) ? (
              <figure>
                <img src={entry.image_url} alt={entry.image_alt || entry.name} loading="lazy" className="mx-auto max-h-96 max-w-full object-contain" />
                {entry.image_credit ? <figcaption className="mt-2 text-xs text-muted-foreground">{entry.image_credit}</figcaption> : null}
                {entry.image_source_url && isAllowedHttpUrl(entry.image_source_url) ? <a href={entry.image_source_url} target="_blank" rel="noreferrer" className="text-xs underline">Image source</a> : null}
              </figure>
            ) : null}
            <dl className="space-y-3 text-sm leading-6">
              {[["Functions", functions], ["Origin", entry.origin], ["Insertion", entry.insertion]].map(([label, text]) => text?.trim() ? (
                <div key={label}><dt className="font-semibold text-foreground">{label}</dt><dd className="whitespace-pre-wrap text-muted-foreground">{text}</dd></div>
              ) : null)}
            </dl>
            {entry.source_url && isAllowedHttpUrl(entry.source_url) ? <a href={entry.source_url} target="_blank" rel="noreferrer" className="text-xs underline">{entry.source_name || "Reference"}</a> : null}
          </section>
        );
      })}
    </div>
  );
}
