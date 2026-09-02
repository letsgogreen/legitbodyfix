import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Plus, X } from "lucide-react";
import { PageHead } from "@/components/admin/AdminUI";
import { listPublishedMuscles } from "@/lib/muscles.functions";
import { getSupabaseClient } from "@/lib/supabase";
import type { Muscle } from "@/lib/muscles";

export const Route = createFileRoute("/admin/anatomy-preview")({
  component: AnatomyPreview,
  head: () => ({
    meta: [
      { title: "Anatomy integration preview — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const stages = ["Reference", "Inhibition", "Activation", "Integration"] as const;
type Stage = (typeof stages)[number];
type Connection = { muscle: Muscle; stage: Stage; note: string; time: string };
type Program = { id: string; name: string };
const fieldClass =
  "min-h-11 w-full min-w-0 rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

function AnatomyPreview() {
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Connection[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [family, setFamily] = useState("");
  const [view, setView] = useState<"sales" | "watch">("sales");
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    if (!client) {
      setError("Database is not configured.");
      setLoading(false);
      return;
    }
    void Promise.all([
      listPublishedMuscles(),
      client.from("programs").select("id,name").order("name"),
    ])
      .then(([library, products]) => {
        if (!active) return;
        if (library.error || products.error)
          throw new Error(library.error || products.error?.message);
        setMuscles(library.muscles);
        setPrograms(products.data ?? []);
        setProgramId(products.data?.[0]?.id ?? "");
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Could not load preview data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const connections = drafts[programId] ?? [];
  const groups = useMemo(() => [...new Set(muscles.map((m) => m.group))].sort(), [muscles]);
  const families = useMemo(
    () =>
      [
        ...new Set(
          muscles
            .filter((m) => !group || m.group === group)
            .map((m) => m.family)
            .filter((f): f is string => Boolean(f)),
        ),
      ].sort(),
    [muscles, group],
  );
  const results = useMemo(
    () =>
      muscles.filter(
        (m) =>
          (!group || m.group === group) &&
          (!family || m.family === family) &&
          [m.title, m.group, m.family, m.actions]
            .join(" ")
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [muscles, group, family, query],
  );
  const programName = programs.find((p) => p.id === programId)?.name ?? "Your full session";

  function updateList(update: (items: Connection[]) => Connection[]) {
    setDrafts((current) => ({ ...current, [programId]: update(current[programId] ?? []) }));
  }
  function edit(id: string, patch: Partial<Omit<Connection, "muscle">>) {
    updateList((items) =>
      items.map((item) => (item.muscle.id === id ? { ...item, ...patch } : item)),
    );
  }
  function move(index: number, offset: number) {
    updateList((items) => {
      const next = [...items];
      const target = index + offset;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
      <PageHead
        title="Anatomy × Full session"
        meta="INTERACTIVE DESIGN PREVIEW · NO DATABASE WRITES"
      />
      <div className="my-5 border border-amber-500/40 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>시안입니다 — 실제 상품에는 반영되지 않습니다.</strong>
        <p className="mt-1">
          이 화면의 연결·설명·시간은 새로고침하면 사라집니다. 영상은 나누지 않고, 근육 사전을 보조
          패널로 연결하는 구조입니다.
        </p>
      </div>
      {loading ? (
        <p role="status" className="py-12">
          Loading the existing muscle library…
        </p>
      ) : error ? (
        <p role="alert" className="border border-destructive p-5 text-destructive">
          {error}
        </p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="max-w-xl text-xs font-bold">
              PROGRAM · 미리 볼 상품
              <select
                className={`${fieldClass} mt-2`}
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
              >
                {!programs.length && <option value="">No programs available</option>}
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted-foreground">
              기존 사전 → 직접 연결 → 상품 / 시청 화면
            </p>
          </div>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="min-w-0 space-y-5" aria-label="Configure anatomy preview">
              <div className="border border-border bg-card p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest">01 / Find anatomy</p>
                <h2 className="mt-2 text-xl font-extrabold">기존 근육 사전에서 찾기</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold">
                    부위 · 기존 해부학 분류
                    <select
                      className={`${fieldClass} mt-1`}
                      value={group}
                      onChange={(event) => {
                        setGroup(event.target.value);
                        setFamily("");
                      }}
                    >
                      <option value="">All regions</option>
                      {groups.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    근육군
                    <select
                      className={`${fieldClass} mt-1`}
                      value={family}
                      onChange={(event) => setFamily(event.target.value)}
                    >
                      <option value="">All muscle families</option>
                      {families.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-3 block text-xs font-bold">
                  근육명 또는 기능 검색
                  <input
                    className={`${fieldClass} mt-1`}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="e.g. soleus, rotation…"
                  />
                </label>
                <p className="my-3 text-xs text-muted-foreground">
                  {results.length} published muscles · 먼저 30개 표시
                </p>
                <div className="max-h-72 overflow-y-auto border-t border-border">
                  {results.slice(0, 30).map((muscle) => {
                    const added = connections.some((item) => item.muscle.id === muscle.id);
                    return (
                      <button
                        key={muscle.id}
                        disabled={added || !programId}
                        onClick={() =>
                          updateList((items) => [
                            ...items,
                            { muscle, stage: "Reference", note: "", time: "" },
                          ])
                        }
                        className="flex min-h-16 w-full items-center gap-3 border-b border-border p-2 text-left hover:bg-secondary disabled:opacity-40"
                      >
                        <MuscleImage muscle={muscle} small />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">{muscle.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {muscle.family || muscle.group}
                          </span>
                        </span>
                        {added ? (
                          <span className="text-xs">Added</span>
                        ) : (
                          <Plus className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                  {!results.length && (
                    <p className="p-5 text-sm">
                      일치하는 근육이 없습니다. 검색어나 필터를 바꿔보세요.
                    </p>
                  )}
                </div>
              </div>
              <div className="border border-border bg-card p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest">
                  02 / Explain the connection
                </p>
                <h2 className="mt-2 text-xl font-extrabold">
                  이 상품에 연결할 근육{" "}
                  <span className="text-muted-foreground">{connections.length}</span>
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  역할과 시간은 영상을 확인한 후 직접 입력합니다. Reference는 단계 미지정입니다.
                </p>
                {!connections.length && (
                  <p className="mt-5 border border-dashed border-border p-6 text-sm">
                    위 목록에서 근육을 추가하면 오른쪽 미리보기에 바로 표시됩니다.
                  </p>
                )}
                {connections.map((item, index) => (
                  <div key={item.muscle.id} className="mt-4 border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">
                        {index + 1}. {item.muscle.title}
                      </h3>
                      <div className="flex shrink-0">
                        <button
                          className="p-2 disabled:opacity-25"
                          aria-label={`Move ${item.muscle.title} up`}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          className="p-2 disabled:opacity-25"
                          aria-label={`Move ${item.muscle.title} down`}
                          disabled={index === connections.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          className="p-2"
                          aria-label={`Remove ${item.muscle.title} from preview`}
                          onClick={() =>
                            updateList((items) =>
                              items.filter((entry) => entry.muscle.id !== item.muscle.id),
                            )
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <label className="text-xs">
                        영상에서의 역할
                        <select
                          className={`${fieldClass} mt-1`}
                          value={item.stage}
                          onChange={(event) =>
                            edit(item.muscle.id, { stage: event.target.value as Stage })
                          }
                        >
                          {stages.map((stage) => (
                            <option key={stage}>{stage}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs">
                        영상 시점 · 선택 사항
                        <input
                          className={`${fieldClass} mt-1`}
                          value={item.time}
                          onChange={(event) => edit(item.muscle.id, { time: event.target.value })}
                          placeholder="mm:ss"
                          pattern="[0-9]+:[0-5][0-9]"
                        />
                        {item.time && !/^\d+:[0-5]\d$/.test(item.time) && (
                          <span className="text-destructive">mm:ss 형식으로 입력하세요.</span>
                        )}
                      </label>
                    </div>
                    <label className="mt-3 block text-xs">
                      고객에게 보여줄 연결 이유
                      <textarea
                        className={`${fieldClass} mt-1`}
                        rows={2}
                        maxLength={500}
                        value={item.note}
                        onChange={(event) => edit(item.muscle.id, { note: event.target.value })}
                        placeholder="이 세션에서 이 근육을 왜 살펴보는지 입력"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
            <section
              className="min-w-0 border border-border bg-card xl:sticky xl:top-5"
              aria-label="Customer experience preview"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  Customer view / preview only
                </span>
                <div className="flex gap-1">
                  {(["sales", "watch"] as const).map((mode) => (
                    <button
                      key={mode}
                      aria-pressed={view === mode}
                      className={`min-h-10 px-3 text-xs font-bold ${view === mode ? "bg-ink text-ink-foreground" : "bg-secondary"}`}
                      onClick={() => setView(mode)}
                    >
                      {mode === "sales" ? "상품 페이지" : "영상 옆 사전"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-ink p-6 text-ink-foreground sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  One complete session
                </p>
                <h2 className="mt-3 text-3xl font-extrabold">{programName}</h2>
                <p className="mt-4 text-sm text-white/65">Inhibition → Activation → Integration</p>
              </div>
              {view === "watch" && (
                <div className="mx-6 mt-6 flex aspect-video flex-col items-center justify-center border border-dashed border-border bg-secondary text-center">
                  <BookOpen size={32} />
                  <p className="mt-3 font-bold">Full session video</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    배치 시안 · 실제 영상 재생/구간 이동은 아직 연결하지 않았습니다.
                  </p>
                </div>
              )}
              <div className="p-6 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {view === "sales" ? "Know what you’re working on" : "Your anatomy companion"}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold">
                  {view === "sales" ? "Anatomy behind the session" : "Understand as you move"}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {view === "sales"
                    ? "Explore the muscles selected for this session and why they matter."
                    : "Open an anatomy note without leaving the session."}
                </p>
                {!connections.length && (
                  <div className="mt-6 border border-dashed border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
                    왼쪽에서 근육을 선택해 고객 화면을 만들어보세요. 기존 상품 연결을 불러온 화면이
                    아닙니다.
                  </div>
                )}
                <div className={`mt-6 grid gap-3 ${view === "sales" ? "sm:grid-cols-2" : ""}`}>
                  {connections.map((item) => (
                    <div key={item.muscle.id} className="min-w-0 border border-border">
                      {view === "sales" && <MuscleImage muscle={item.muscle} />}
                      <div className="p-4">
                        <span className="inline-block bg-accent px-2 py-1 font-mono text-[9px] uppercase text-accent-foreground">
                          {item.stage === "Reference" ? "Anatomy reference" : item.stage}
                        </span>
                        <h4 className="mt-3 text-lg font-extrabold">{item.muscle.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.note || "연결 이유를 입력하면 여기에 표시됩니다."}
                        </p>
                        {item.time && /^\d+:[0-5]\d$/.test(item.time) && (
                          <p className="mt-3 font-mono text-xs">
                            ↳ {item.time} · 영상 구간 연결 예정
                          </p>
                        )}
                        <details className="mt-4 border-t border-border pt-3">
                          <summary className="cursor-pointer text-xs font-bold">
                            Explore anatomy
                          </summary>
                          <dl className="mt-4 space-y-3 text-xs leading-relaxed">
                            {[
                              ["Origin", item.muscle.origin],
                              ["Insertion", item.muscle.insertion],
                              ["Action", item.muscle.actions],
                            ].map(([label, text]) => (
                              <div key={label}>
                                <dt className="font-bold">{label}</dt>
                                <dd className="mt-1 text-muted-foreground">
                                  {text || "Not provided"}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          <Link
                            to="/muscles/$muscleId"
                            params={{ muscleId: item.muscle.id }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-bold"
                          >
                            Full reference <ArrowUpRight size={14} />
                          </Link>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Anatomy reference, not an individual diagnosis.
                </p>
              </div>
            </section>
          </div>
          <div className="mt-6 border border-border bg-secondary/30 p-5">
            <button
              className="text-sm font-bold underline"
              aria-expanded={demo}
              onClick={() => setDemo(!demo)}
            >
              이 시안에서 확인할 것
            </button>
            {demo && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li>부위·근육군 분류가 찾기 쉬운가?</li>
                <li>상품에는 주요 근육 3~5개 정도만 보여주는 것이 적절한가?</li>
                <li>영상 옆에서 사전 내용을 펼쳐보는 방식이 편한가?</li>
                <li>구성이 확정되면 저장·게시와 실제 영상 구간 이동을 연결합니다.</li>
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MuscleImage({ muscle, small = false }: { muscle: Muscle; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-white ${small ? "h-12 w-12" : "h-36 border-b border-border"}`}
    >
      {muscle.imageUrl && !failed ? (
        <img
          src={muscle.imageUrl}
          alt={small ? "" : muscle.imageAlt || muscle.title}
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-contain p-2"
        />
      ) : (
        <div className="grid h-full place-items-center text-neutral-400">
          <BookOpen size={20} aria-label="No illustration" />
        </div>
      )}
    </div>
  );
}
