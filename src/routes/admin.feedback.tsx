import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import type { Database } from "@/integrations/supabase/types";
import { getSiteFeedback } from "@/lib/admin-feedback.functions";

type Feedback = Database["public"]["Tables"]["site_feedback"]["Row"];

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({
    meta: [
      { title: "Website feedback — LegitBodyFix Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [rows, setRows] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getSiteFeedback()
      .then(({ feedback }) => setRows(feedback))
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load feedback."),
      )
      .finally(() => setLoading(false));
  }, []);

  const helpful = rows.filter((row) => row.sentiment === "helpful").length;
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHead
        title="Website feedback"
        meta={
          loading
            ? "Loading responses"
            : `${rows.length} responses · ${helpful} helpful · ${rows.length - helpful} need improvement`
        }
      />
      {error && (
        <Panel className="mt-6 border-destructive p-4 text-sm text-destructive">{error}</Panel>
      )}
      {!error && !loading && rows.length === 0 && (
        <Panel className="mt-6 p-8 text-center text-sm text-muted-foreground">
          No feedback has been submitted yet.
        </Panel>
      )}
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <Panel key={row.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone={row.sentiment === "helpful" ? "accent" : "warn"}>
                {row.sentiment === "helpful" ? "Helpful" : "Needs improvement"}
              </Tag>
              <Tag>{row.device_type}</Tag>
              <span className="font-mono text-[10px] text-muted-foreground">{row.page_path}</span>
              <time className="ml-auto text-xs text-muted-foreground" dateTime={row.created_at}>
                {new Date(row.created_at).toLocaleString()}
              </time>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
              {row.message || <span className="text-muted-foreground">No written comment</span>}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
