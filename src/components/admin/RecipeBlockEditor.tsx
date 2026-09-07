import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus());
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + direction + choices.length) % choices.length;
    setActiveIndex(nextIndex);
    menuRef.current?.querySelectorAll<HTMLButtonElement>("button")[nextIndex]?.focus();
  }

  return (
    <div ref={rootRef} className={`relative flex ${compact ? "group/insert h-5 justify-center" : "flex-wrap gap-2"}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setActiveIndex(0);
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className={
          compact
            ? "absolute top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition hover:border-foreground hover:text-foreground focus-visible:opacity-100 group-hover/insert:opacity-100"
            : "inline-flex min-h-9 items-center gap-2 rounded-sm bg-foreground px-3 text-xs font-bold text-background"
        }
      >
        <Plus className="h-3.5 w-3.5" />
        {compact ? <span className="sr-only">Insert block here</span> : "Add block"}
      </button>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Choose a block type"
          className={`${compact ? "absolute left-1/2 top-5 z-20 w-72 -translate-x-1/2 shadow-xl" : "w-full"} grid grid-cols-2 gap-1 rounded-sm border border-border bg-card p-2 sm:grid-cols-3`}
        >
          {choices.map(([type, label, Icon], index) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => {
                onInsert(type);
                setOpen(false);
              }}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="inline-flex min-h-9 items-center gap-2 rounded-sm px-2 text-left text-xs font-semibold hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AutoTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = () => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.max(element.scrollHeight, 44)}px`;
  };
  useEffect(resize, [props.value]);
  return <textarea {...props} ref={ref} rows={1} onInput={resize} />;
}

function qualityWarnings(blocks: RecipeContentBlock[]) {
  return blocks.flatMap((block, index) => {
    const warnings: string[] = [];
    if (block.type === "list" && block.items.every((item) => /^\*\*step\*\*$/i.test(item.trim())))
      warnings.push("Placeholder-only list");
    if ((block.type === "paragraph" || block.type === "heading") && !block.text.trim())
      warnings.push(`Empty ${block.type}`);
    if (block.type === "heading") {
      const followingSection = blocks.slice(index + 1).find((candidate) => candidate.type !== "divider");
      if (!followingSection || followingSection.type === "heading") warnings.push("Heading has no body");
    }
    if (block.type === "divider" && blocks[index + 1]?.type === "divider")
      warnings.push("Consecutive dividers");
    const text = "text" in block ? block.text : "";
    if (/<\/?[a-z][^>]*>|\{toggle=/i.test(text)) warnings.push("Unconverted markup");
    return warnings.map((message) => ({ blockId: block.id, message }));
  });
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
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [slashChoiceIndex, setSlashChoiceIndex] = useState(0);
  const [deleted, setDeleted] = useState<{ block: RecipeContentBlock; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragIndex = useRef<number | null>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const headings = useMemo(
    () => value.filter((block): block is Extract<RecipeContentBlock, { type: "heading" }> => block.type === "heading" && Boolean(block.text.trim())),
    [value],
  );
  const warnings = useMemo(() => qualityWarnings(value), [value]);
  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (slashIndex === null) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!slashMenuRef.current?.contains(event.target as Node)) setSlashIndex(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [slashIndex]);

  function update(index: number, patch: Partial<RecipeContentBlock>) {
    onChange(
      value.map((block, current) =>
        current === index ? ({ ...block, ...patch } as RecipeContentBlock) : block,
      ),
    );
  }
  function focusEditor(id: string) {
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          `#recipe-block-${id} [data-block-content] input, #recipe-block-${id} [data-block-content] textarea, #recipe-block-${id} [data-block-content] select`,
        )
        ?.focus();
    });
  }
  function insert(index: number, type: BlockType) {
    const next = [...value];
    const block = makeBlock(type);
    next.splice(index, 0, block);
    onChange(next);
    setSelectedId(block.id);
    focusEditor(block.id);
  }
  function replace(index: number, type: BlockType) {
    const current = value[index];
    if (!current) return;
    const block = { ...makeBlock(type), id: current.id } as RecipeContentBlock;
    onChange(value.map((candidate, candidateIndex) => (candidateIndex === index ? block : candidate)));
    setSelectedId(block.id);
    setSlashIndex(null);
    focusEditor(block.id);
  }
  function handleSlashMenuKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    choiceIndex: number,
    blockIndex: number,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      setSlashIndex(null);
      document.getElementById(`recipe-paragraph-${value[blockIndex]?.id}`)?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (choiceIndex + direction + choices.length) % choices.length;
    setSlashChoiceIndex(nextIndex);
    slashMenuRef.current?.querySelectorAll<HTMLButtonElement>("button")[nextIndex]?.focus();
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
    focusEditor(clone.id);
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
  function focusBlock(id: string) {
    setSelectedId(id);
    document.getElementById(`recipe-block-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="min-w-0 bg-transparent py-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Body</p>
        <InsertMenu onInsert={(type) => insert(value.length, type)} />
      </div>
      {(headings.length > 0 || warnings.length > 0) && (
        <div className="mb-5 flex flex-wrap gap-2 border-b border-border pb-4">
          {headings.length > 0 && (
            <details className="relative rounded-sm border border-border bg-background">
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Outline · {headings.length} sections
              </summary>
              <nav aria-label="Article outline" className="fixed inset-x-4 top-24 z-50 max-h-[70vh] overflow-y-auto rounded-sm border border-border bg-card p-3 shadow-xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-1 sm:w-72">
                <ol className="space-y-1">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                      <button type="button" onClick={() => focusBlock(heading.id)} className="block max-w-full truncate text-left text-xs font-semibold hover:underline">
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          )}
          {warnings.length > 0 && (
            <details className="relative rounded-sm border border-amber-300 bg-amber-50 text-amber-950">
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                Review · {warnings.length} issue{warnings.length === 1 ? "" : "s"}
              </summary>
              <aside className="fixed inset-x-4 top-24 z-50 max-h-[70vh] overflow-y-auto rounded-sm border border-amber-300 bg-amber-50 p-3 shadow-xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-1 sm:w-72">
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={`${warning.blockId}-${warning.message}-${index}`}>
                      <button type="button" onClick={() => focusBlock(warning.blockId)} className="text-left text-xs underline underline-offset-2">{warning.message}</button>
                    </li>
                  ))}
                </ul>
              </aside>
            </details>
          )}
        </div>
      )}
      <InsertMenu compact onInsert={(type) => insert(0, type)} />
      {value.map((block, index) => {
        const blockIssues = issues.filter((issue) => issue.blockId === block.id);
        const selected = selectedId === block.id;
        return (
          <div key={block.id}>
            <section
              id={`recipe-block-${block.id}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => drop(index)}
              onFocusCapture={() => setSelectedId(block.id)}
              onClick={() => setSelectedId(block.id)}
              className={`group relative min-w-0 rounded-sm border transition ${selected ? "border-foreground/30 bg-secondary/25" : blockIssues.length ? "border-destructive/60 bg-destructive/5" : "border-transparent bg-transparent hover:border-border hover:bg-secondary/20"}`}
              aria-label={`${block.type} block ${index + 1}`}
            >
              <div
                className={`absolute -top-3 right-2 z-10 flex flex-wrap items-center gap-1 rounded-sm border border-border bg-background/95 px-1 py-0.5 shadow-sm transition ${selected ? "opacity-100" : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"}`}
              >
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
                <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.14em]">
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
              <div data-block-content className="min-w-0 px-3 py-3 sm:px-5 sm:py-4 [&_input]:max-w-full [&_textarea]:max-w-full">
                {block.type === "heading" && (
                  <div className="flex flex-col gap-2">
                    <select
                      aria-label="Heading level"
                      value={block.level}
                      onChange={(event) =>
                        update(index, { level: Number(event.target.value) as 2 | 3 })
                      }
                      className="w-fit rounded-sm border border-border px-2 py-1 text-xs"
                    >
                      <option value={2}>Title</option>
                      <option value={3}>Subheading</option>
                    </select>
                    <input
                      value={block.text}
                      onChange={(event) => update(index, { text: event.target.value })}
                      placeholder="Heading text"
                      className={`${block.level === 2 ? "text-3xl" : "text-xl"} min-h-12 flex-1 border-0 bg-transparent px-1 font-bold tracking-tight outline-none placeholder:text-muted-foreground/50`}
                    />
                  </div>
                )}
                {block.type === "paragraph" && (
                  <div className="relative">
                    <AutoTextarea
                      id={`recipe-paragraph-${block.id}`}
                      value={block.text}
                      onChange={(event) => {
                        update(index, { text: event.target.value });
                        if (event.target.value !== "") setSlashIndex(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "/" && !block.text) {
                          event.preventDefault();
                          setSlashChoiceIndex(0);
                          setSlashIndex(index);
                          requestAnimationFrame(() =>
                            slashMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus(),
                          );
                        }
                        if (event.key === "Escape") setSlashIndex(null);
                      }}
                      placeholder="Type something or press / for commands. Markdown links are supported."
                      aria-expanded={slashIndex === index}
                      className="w-full resize-none overflow-hidden border-0 bg-transparent px-1 py-1 text-base leading-7 outline-none placeholder:text-muted-foreground/50"
                    />
                    {slashIndex === index ? (
                      <div
                        ref={slashMenuRef}
                        role="menu"
                        aria-label="Choose a block type"
                        className="relative z-30 mt-2 grid grid-cols-2 gap-1 rounded-sm border border-border bg-card p-2 shadow-xl sm:grid-cols-3"
                      >
                        {choices.map(([type, label, Icon], choiceIndex) => (
                          <button
                            key={type}
                            type="button"
                            role="menuitem"
                            tabIndex={choiceIndex === slashChoiceIndex ? 0 : -1}
                            onClick={() => replace(index, type)}
                            onFocus={() => setSlashChoiceIndex(choiceIndex)}
                            onKeyDown={(event) =>
                              handleSlashMenuKeyDown(event, choiceIndex, index)
                            }
                            className="inline-flex min-h-10 items-center gap-2 rounded-sm px-2 text-left text-xs font-semibold hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
                {block.type === "toggle" && (
                  <div className="space-y-2">
                    <input
                      value={block.title}
                      onChange={(event) => update(index, { title: event.target.value })}
                      placeholder="Toggle title"
                      className="min-h-11 w-full border-0 bg-transparent px-1 text-lg font-bold outline-none placeholder:text-muted-foreground/50"
                    />
                    <AutoTextarea
                      value={block.text}
                      onChange={(event) => update(index, { text: event.target.value })}
                      placeholder="Collapsed content…"
                      className="w-full resize-none overflow-hidden border-l-2 border-border bg-transparent px-4 py-2 text-sm leading-6 outline-none"
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
                    <AutoTextarea
                      value={block.items.join("\n")}
                      onChange={(event) => update(index, { items: event.target.value.split("\n") })}
                      placeholder="One item per line"
                      className="w-full resize-none overflow-hidden border-0 bg-transparent px-1 py-2 text-base leading-7 outline-none"
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
