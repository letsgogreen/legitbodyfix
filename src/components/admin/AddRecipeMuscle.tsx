import { useState } from "react";
import { muscleSearchText, type RecipeMuscleEntry } from "@/lib/recipe-muscle-dictionary";

export function AddRecipeMuscle({ entries, existingIds, onAdd }: {entries: RecipeMuscleEntry[]; existingIds: string[]; onAdd: (entry: RecipeMuscleEntry) => void}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  return (
    <div className="mt-3 rounded-sm border border-border p-3">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="min-h-10 rounded-sm border border-border px-3 text-sm font-bold focus-visible:ring-2 focus-visible:ring-ring">+ Add muscle</button>
      {open ? <div className="mt-3 space-y-2">
        <label className="block text-xs font-semibold">Search muscle dictionary<input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or abbreviation (TFL, QL…)" className="mt-1 min-h-11 w-full rounded-sm border border-border bg-transparent px-3 text-sm" /></label>
        <div className="max-h-64 overflow-y-auto">
          {entries.filter((entry) => !query.trim() || muscleSearchText(entry).includes(query.trim().toLowerCase())).map((entry) => <button key={entry.id} type="button" disabled={existingIds.includes(entry.id)} onClick={() => {onAdd(entry); setQuery(""); setOpen(false);}} className="flex min-h-11 w-full items-center justify-between border-b border-border p-2 text-left text-sm hover:bg-secondary disabled:opacity-40"><span>{entry.name}{entry.published ? "" : " · Draft"}</span><span>{existingIds.includes(entry.id) ? "Added" : "+"}</span></button>)}
        </div>
      </div> : null}
    </div>
  );
}
