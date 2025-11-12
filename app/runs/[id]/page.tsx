// app/runs/[id]/page.tsx — FULL REPLACE
import { supabaseServer } from "@/lib/supabase/server";
import UtilityBar from "@/components/UtilityBar";
import { Card, CardBody, CardHeader } from "@/components/ui/card"; // ← fix: lowercase file name
import NewDocButton from "@/components/NewDocButton";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: runId } = await params;
  const supabase = await supabaseServer();

  const { data: run } = await supabase
    .from("runs")
    .select("id,title,status,updated_at")
    .eq("id", runId)
    .maybeSingle();

  const { data: docs, error: docsErr } = await supabase
    .from("docs")
    .select("id,title,updated_at")
    .eq("run_id", runId)
    .order("updated_at", { ascending: false });

  return (
    <>
      <UtilityBar
        left={
          <>
            <span className="section-chip">Run</span>
            <span className="section-title">{run?.title ?? runId}</span>
          </>
        }
        right={<a href="/app" className="toolbar-btn">Dashboard</a>}
      />

      <main className="mx-auto max-w-content container-px py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <NewDocButton runId={runId} />
        </div>

        {docsErr ? (
          <p className="text-sm text-red-600">Failed to load docs.</p>
        ) : (docs?.length ?? 0) === 0 ? (
          <Card>
            <CardBody>
              <p className="text-sm opacity-75">
                No documents yet. Click <strong>New Doc</strong> to create one.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs!.map((d) => (
              <Card key={d.id}>
                <CardHeader
                  title={d.title ?? "Untitled"}
                  subtitle={`Updated ${new Date(d.updated_at).toLocaleString()}`}
                  right={
                    <a
                      href={`/runs/${runId}/docs/${d.id}`}
                      className="toolbar-btn"
                    >
                      Open
                    </a>
                  }
                />
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

