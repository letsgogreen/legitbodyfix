import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Image,
  List,
  MessageSquare,
  Minus,
  Plus,
  Quote,
  Trash2,
  Type,
  Undo2,
  Youtube,
} from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  blockId,
  type RecipeBlockIssue,
  type RecipeContentBlock,
  youtubeEmbedUrl,
} from "@/lib/recipe-blocks";

type BlockType = RecipeContentBlock["type"];
const choices: Array<[BlockType, string, typeof Type]> = [
  ["paragraph", "Paragraph", Type],
  ["heading", "Heading", Type],
  ["toggle", "Toggle", Plus],
  ["list", "Bullet list", List],
  ["youtube", "YouTube", Youtube],
  ["image", "Image", Image],
  ["callout", "Callout", MessageSquare],
  ["quote", "Quote", Quote],
  ["button", "Button", Plus],
  ["divider", "Divider", Minus],
];

function makeBlock(type: BlockType): RecipeContentBlock {
  const id = blockId();
  if (type === "paragraph") return { id, type, text: "" };
  if (type === "heading") return { id, type, level: 2, text: "" };
  if (type === "toggle") return { id, type, title: "", text: "" };
  if (type === "image")
    return { id, type, url: "", alt: "", caption: "", source: "", fit: "contain", aspect: "auto" };
  if (type === "youtube") return { id, type, url: "", caption: "" };
  if (type === "list") return { id, type, style: "bullet", items: [""] };
  if (type === "callout") return { id, type, title: "", text: "" };
  if (type === "quote") return { id, type, text: "", attribution: "" };
  if (type === "button") return { id, type, label: "", url: "" };
  return { id, type };
}

function InsertMenu({
  onInsert,
  compact = false,
}: {
  onInsert: (type: BlockType) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`relative flex ${compact ? "justify-center py-1" : "flex-wrap gap-2"}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={
          compact
            ? "grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
            : "inline-flex min-h-9 items-center gap-2 rounded-sm bg-foreground px-3 text-xs font-bold text-background"
        }
      >
        <Plus className="h-3.5 w-3.5" />
        {compact ? <span className="sr-only">Insert block here</span> : "Add block"}
      </button>
      {open ? (
        <div
          className={`${compact ? "absolute left-1/2 top-8 z-20 w-72 -translate-x-1/2 shadow-xl" : "w-full"} grid grid-cols-2 gap-1 rounded-sm border border-border bg-card p-2 sm:grid-cols-3`}
        >
          {choices.map(([type, label, Icon]) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onInsert(type);
                setOpen(false);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-sm px-2 text-left text-xs font-semibold hover:bg-secondary"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RecipeBlockEditor({
  value,
  recipeId,
  issues = [],
  onChange,
}: {
  value: RecipeContentBlock[];
  recipeId: string;
  issues?: RecipeBlockIssue[];
  onChange: (blocks: RecipeContentBlock[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<{ block: RecipeContentBlock; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragIndex = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

  function update(index: number, patch: Partial<RecipeContentBlock>) {
    onChange(
      value.map((block, current) =>
        current === index ? ({ ...block, ...patch } as RecipeContentBlock) : block,
      ),
    );
  }
  function insert(index: number, type: BlockType) {
    const next = [...value];
    const block = makeBlock(type);
    next.splice(index, 0, block);
    onChange(next);
    setSelectedId(block.id);
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }
  function duplicate(index: number) {
    const clone = { ...structuredClone(value[index]!), id: blockId() };
    const next = [...value];
    next.splice(index + 1, 0, clone);
    onChange(next);
    setSelectedId(clone.id);
  }
  function remove(index: number) {
    const block = value[index];
    if (!block) return;
    setDeleted({ block, index });
    onChange(value.filter((_, current) => current !== index));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setDeleted(null), 6000);
  }
  function undo() {
    if (!deleted) return;
    const next = [...value];
    next.splice(Math.min(deleted.index, next.length), 0, deleted.block);
    onChange(next);
    setSelectedId(deleted.block.id);
    setDeleted(null);
  }
  function drop(index: number) {
    const source = dragIndex.current;
    dragIndex.current = null;
    if (source === null || source === index) return;
    const next = [...value];
    const [block] = next.splice(source, 1);
    if (!block) return;
    next.splice(index, 0, block);
    onChange(next);
  }

  return (
    <div className="min-w-0 space-y-2 overflow-x-hidden">
      <div className="rounded-sm border border-border bg-secondary/40 p-3">
        <InsertMenu onInsert={(type) => insert(value.length, type)} />
      </div>
      <InsertMenu compact onInsert={(type) => insert(0, type)} />
      {value.map((block, index) => {
        const blockIssues = issues.filter((issue) => issue.blockId === block.id);
        const selected = selectedId === block.id;
        return (
          <div key={block.id}>
            <section
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => drop(index)}
              onFocusCapture={() => setSelectedId(block.id)}
              onClick={() => setSelectedId(block.id)}
              className={`min-w-0 overflow-hidden rounded-sm border-2 bg-background transition ${selected ? "border-foreground shadow-[4px_4px_0_var(--color-accent)]" : blockIssues.length ? "border-destructive/60" : "border-border"}`}
              aria-label={`${block.type} block ${index + 1}`}
            >
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/50 px-2 py-1.5">
                <span
                  draggable
                  onDragStart={() => {
                    dragIndex.current = index;
                  }}
                  title="Drag to reorder"
                  className="cursor-grab p-1"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="ml-1 flex-1 font-mono text-[9px] uppercase tracking-[0.14em]">
                  {index + 1} · {block.type}
                </span>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move block up"
                  className="p-2 disabled:opacity-25"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Move block down"
                  className="p-2 disabled:opacity-25"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => duplicate(index)}
                  aria-label="Duplicate block"
                  className="p-2"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Delete block"
                  className="p-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="min-w-0 p-3 sm:p-4 [&_input]:max-w-full [&_textarea]:max-w-full">
                {block.type === "heading" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      aria-label="Heading level"
                      value={block.level}
                      onChange={(event) =>
                        update(index, { level: Number(event.target.value) as 2 | 3 })
                      }
                      className="rounded-sm border border-border px-2 text-xs"
                    >
                      <option value={2}>Title</option>
                      <option value={3}>Subheading</option>
                    </select>
                    <input
                      value={block.text}
                      onChange={(event) => update(index, { text: event.target.value })}
                      placeholder="Heading text"
                      className="min-h-11 flex-1 rounded-sm border border-border px-3"
                    />
                  </div>
                )}
                {block.type === "paragraph" && (
                  <textarea
                    value={block.text}
                    onChange={(event) => update(index, { text: event.target.value })}
                    rows={6}
                    placeholder="Write a paragraph… Markdown links are supported."
                    className="w-full rounded-sm border border-border px-3 py-2 text-sm leading-6"
                  />
                )}
                {block.type === "toggle" && (
                  <div className="space-y-2">
                    <input
                      value={block.title}
                      onChange={(event) => update(index, { title: event.target.value })}
                      placeholder="Toggle title"
                      className="min-h-11 w-full rounded-sm border border-border px-3 font-bold"
                    />
                    <textarea
                      value={block.text}
                      onChange={(event) => update(index, { text: event.target.value })}
                      rows={5}
                      placeholder="Collapsed content…"
                      className="w-full rounded-sm border border-border px-3 py-2 text-sm"
                    />
                  </div>
                )}
                {block.type === "list" && (
                  <div className="space-y-2">
                    <select
                      aria-label="List style"
                      value={block.style}
                      onChange={(event) =>
                        update(index, { style: event.target.value as "bullet" | "numbered" })
                      }
                      className="min-h-10 rounded-sm border border-border px-2 text-xs"
                    >
                      <option value="bullet">Bullet list</option>
                      <option value="numbered">Numbered list</option>
                    </select>
                    <textarea
                      value={block.items.join("\n")}
                      onChange={(event) => update(index, { items: event.target.value.split("\n") })}
                      rows={5}
                      placeholder="One item per line"
                      className="w-full rounded-sm border border-border px-3 py-2 text-sm"
                    />
                  </div>
                )}
                {block.type === "image" && (
                  <>
                    <ImageUploadField
                      value={block.url}
                      alt={block.alt}
                      folder={`recipes/${recipeId}/blocks/${block.id}`}
                      bucket="recipe-images"
                      label="Article image"
                      onChange={(url) => update(index, { url })}
                      onAltChange={(alt) => update(index, { alt })}
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <input
                        value={block.caption}
                        onChange={(event) => update(index, { caption: event.target.value })}
                        placeholder="Caption (optional)"
                        className="min-h-10 rounded-sm border border-border px-3 text-sm"
                      />
                      <input
                        value={block.source}
                        onChange={(event) => update(index, { source: event.target.value })}
                        placeholder="Source / credit for external images"
                        className="min-h-10 rounded-sm border border-border px-3 text-sm"
                      />
                      <select
                        aria-label="Image fit"
                        value={block.fit}
                        onChange={(event) =>
                          update(index, { fit: event.target.value as "contain" | "cover" })
                        }
                        className="min-h-10 rounded-sm border border-border px-2 text-xs"
                      >
                        <option value="contain">Fit: contain</option>
                        <option value="cover">Fit: cover</option>
                      </select>
                      <select
                        aria-label="Image ratio"
                        value={block.aspect}
                        onChange={(event) =>
                          update(index, { aspect: event.target.value as typeof block.aspect })
                        }
                        className="min-h-10 rounded-sm border border-border px-2 text-xs"
                      >
                        <option value="auto">Natural ratio</option>
                        <option value="video">16:9</option>
                        <option value="square">1:1</option>
                        <option value="portrait">4:5</option>
                      </select>
                    </div>
                  </>
                )}
                {block.type === "youtube" && (
                  <div className="space-y-3">
                    <input
                      value={block.url}
                      onChange={(event) => update(index, { url: event.target.value })}
                      placeholder="https://youtube.com/watch?v=…"
                      className="min-h-11 w-full rounded-sm border border-border px-3 text-sm"
                    />
                    {youtubeEmbedUrl(block.url) ? (
                      <div className="aspect-video max-w-xl overflow-hidden rounded-sm bg-black">
                        <iframe
                          src={youtubeEmbedUrl(block.url)!}
                          title={block.caption || "YouTube preview"}
                          className="h-full w-full"
                        />
                      </div>
                    ) : block.url ? (
                      <p className="text-xs text-destructive">
                        Enter a YouTube watch, short, youtu.be, or embed URL.
                      </p>
                    ) : null}
                    <input
                      value={block.caption}
                      onChange={(event) => update(index, { caption: event.target.value })}
                      placeholder="Caption (optional)"
                      className="min-h-10 w-full rounded-sm border border-border px-3 text-sm"
                    />
                  </div>
                )}
                {block.type === "callout" && (
                  <div className="space-y-2">
                    <input
                      value={block.title}
                      onChange={(event) => update(index, { title: event.target.value })}
                      placeholder="Callout title (optional)"
                      className="min-h-10 w-full rounded-sm border border-border px-3 font-bold"
                    />
                    <textarea
                      value={block.text}
                      onChange={(event) => update(index, { text: event.target.value })}
                      rows={4}
                      placeholder="Important information"
                      className="w-full rounded-sm border border-border px-3 py-2 text-sm"
                    />
                  </div>
                )}
                {block.type === "quote" && (
                  <div className="space-y-2">
                    <textarea
                      value={block.text}
                      onChange={(event) => update(index, { text: event.target.value })}
                      rows={4}
                      placeholder="Quote"
                      className="w-full rounded-sm border border-border px-3 py-2 text-sm"
                    />
                    <input
                      value={block.attribution}
                      onChange={(event) => update(index, { attribution: event.target.value })}
                      placeholder="Attribution (optional)"
                      className="min-h-10 w-full rounded-sm border border-border px-3 text-sm"
                    />
                  </div>
                )}
                {block.type === "button" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={block.label}
                      onChange={(event) => update(index, { label: event.target.value })}
                      placeholder="Button label"
                      className="min-h-10 rounded-sm border border-border px-3 text-sm"
                    />
                    <input
                      value={block.url}
                      onChange={(event) => update(index, { url: event.target.value })}
                      placeholder="https://…"
                      className="min-h-10 rounded-sm border border-border px-3 text-sm"
                    />
                  </div>
                )}
                {block.type === "divider" && <hr className="my-3 border-border" />}
                {blockIssues.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-destructive">
                    {blockIssues.map((issue) => (
                      <li key={issue.message} className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
            <InsertMenu compact onInsert={(type) => insert(index + 1, type)} />
          </div>
        );
      })}
      {!value.length ? (
        <div className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Start the article by adding a block.
        </div>
      ) : null}
      {deleted ? (
        <div
          role="status"
          className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-sm bg-foreground px-4 py-3 text-sm text-background shadow-xl"
        >
          <span>Block deleted. Undo available for 6 seconds.</span>
          <button
            type="button"
            onClick={undo}
            className="inline-flex items-center gap-2 font-bold underline"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
        </div>
      ) : null}
    </div>
  );
}
