import { useState } from "react";
import { muscleSearchText, type RecipeMuscleEntry } from "@/lib/recipe-muscle-dictionary";
import { MuscleCardImage } from "@/components/recipes/MuscleCardImage";

export function AddRecipeMuscle({ entries, existingIds, onAdd }: {entries: RecipeMuscleEntry[]; existingIds: string[]; onAdd: (entry: RecipeMuscleEntry) => void}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  return (
    <div className="mt-3 rounded-sm border border-border p-3">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="min-h-10 rounded-sm border border-border px-3 text-sm font-bold focus-visible:ring-2 focus-visible:ring-ring">+ Add muscle</button>
      {open ? <div className="mt-3 space-y-2">
        <label className="block text-xs font-semibold">Search muscle dictionary<input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or abbreviation (TFL, QL…)" className="mt-1 min-h-11 w-full rounded-sm border border-border bg-transparent px-3 text-sm" /></label>
        <div className="grid max-h-[30rem] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
          {entries.filter((entry) => !query.trim() || muscleSearchText(entry).includes(query.trim().toLowerCase())).map((entry) => <button key={entry.id} type="button" disabled={existingIds.includes(entry.id)} onClick={() => {onAdd(entry); setQuery(""); setOpen(false);}} className="flex flex-col overflow-hidden rounded-sm border border-border text-left text-sm transition hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
            <MuscleCardImage urls={entry.image_url ? [entry.image_url] : []} className="aspect-[4/3] w-full" />
            <span className="flex w-full flex-1 items-center justify-between gap-2 p-3"><span><span className="block font-bold">{entry.name}</span><span className="mt-1 block text-xs text-muted-foreground">{entry.anatomical_group}{entry.published ? "" : " · Draft"}</span></span><span className="shrink-0 text-xs">{existingIds.includes(entry.id) ? "Added" : "+ Add"}</span></span>
          </button>)}
        </div>
      </div> : null}
    </div>
  );
}
