import { ChevronDown, ChevronUp, GripVertical, Image, Minus, Plus, Trash2, Type, Youtube } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { blockId, type RecipeContentBlock } from "@/lib/recipe-blocks";

const choices = [
  ["paragraph", "Paragraph", Type], ["heading", "Heading", Type], ["toggle", "Toggle", Plus],
  ["image", "Image", Image], ["youtube", "YouTube", Youtube], ["divider", "Divider", Minus],
] as const;

function makeBlock(type: (typeof choices)[number][0]): RecipeContentBlock {
  const id = blockId();
  if (type === "paragraph") return { id, type, text: "" };
  if (type === "heading") return { id, type, level: 2, text: "" };
  if (type === "toggle") return { id, type, title: "", text: "" };
  if (type === "image") return { id, type, url: "", alt: "", caption: "" };
  if (type === "youtube") return { id, type, url: "", caption: "" };
  return { id, type };
}

export function RecipeBlockEditor({ value, recipeId, onChange }: { value: RecipeContentBlock[]; recipeId: string; onChange: (blocks: RecipeContentBlock[]) => void }) {
  function update(index: number, patch: Partial<RecipeContentBlock>) {
    onChange(value.map((block, current) => current === index ? { ...block, ...patch } as RecipeContentBlock : block));
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Add block</span>
      {choices.map(([type, label, Icon]) => <button key={type} type="button" onClick={() => onChange([...value, makeBlock(type)])} className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-xs font-bold hover:bg-secondary"><Icon className="h-3.5 w-3.5" />{label}</button>)}
    </div>
    {value.map((block, index) => <div key={block.id} className="rounded-sm border border-border bg-background">
      <div className="flex items-center gap-1 border-b border-border bg-secondary/50 px-2 py-1.5">
        <GripVertical className="h-4 w-4 text-muted-foreground" /><span className="ml-1 flex-1 font-mono text-[9px] uppercase tracking-[0.14em]">{block.type}</span>
        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move block up" className="p-1.5 disabled:opacity-25"><ChevronUp className="h-4 w-4" /></button>
        <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="Move block down" className="p-1.5 disabled:opacity-25"><ChevronDown className="h-4 w-4" /></button>
        <button type="button" onClick={() => onChange(value.filter((_, current) => current !== index))} aria-label="Delete block" className="p-1.5 text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="p-4">
        {block.type === "heading" && <div className="flex gap-2"><select value={block.level} onChange={(event) => update(index, { level: Number(event.target.value) as 2 | 3 })} className="rounded-sm border border-border px-2 text-xs"><option value={2}>Title</option><option value={3}>Subheading</option></select><input value={block.text} onChange={(event) => update(index, { text: event.target.value })} placeholder="Heading text" className="min-h-10 flex-1 rounded-sm border border-border px-3" /></div>}
        {block.type === "paragraph" && <textarea value={block.text} onChange={(event) => update(index, { text: event.target.value })} rows={6} placeholder="Write a paragraph…" className="w-full rounded-sm border border-border px-3 py-2 text-sm" />}
        {block.type === "toggle" && <div className="space-y-2"><input value={block.title} onChange={(event) => update(index, { title: event.target.value })} placeholder="Toggle title" className="min-h-10 w-full rounded-sm border border-border px-3 font-bold" /><textarea value={block.text} onChange={(event) => update(index, { text: event.target.value })} rows={5} placeholder="Hidden content…" className="w-full rounded-sm border border-border px-3 py-2 text-sm" /></div>}
        {block.type === "image" && <ImageUploadField value={block.url} alt={block.alt} folder={`recipes/${recipeId}/blocks/${block.id}`} bucket="recipe-images" label="Article image" onChange={(url) => update(index, { url })} onAltChange={(alt) => update(index, { alt })} />}
        {block.type === "image" && <input value={block.caption} onChange={(event) => update(index, { caption: event.target.value })} placeholder="Caption (optional)" className="mt-3 min-h-10 w-full rounded-sm border border-border px-3 text-sm" />}
        {block.type === "youtube" && <div className="space-y-2"><input value={block.url} onChange={(event) => update(index, { url: event.target.value })} placeholder="https://youtube.com/watch?v=…" className="min-h-10 w-full rounded-sm border border-border px-3 text-sm" /><input value={block.caption} onChange={(event) => update(index, { caption: event.target.value })} placeholder="Caption (optional)" className="min-h-10 w-full rounded-sm border border-border px-3 text-sm" /></div>}
        {block.type === "divider" && <hr className="my-3 border-border" />}
      </div>
    </div>)}
    {!value.length && <div className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Start the article by adding a block.</div>}
  </div>;
}
