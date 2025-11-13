// app/runs/[id]/docs/[docId]/DocEditorClient.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { updateDocAction } from "@/app/actions/docActions";

// Client-only live preview (no SSR) to ensure instant updates while typing
const MarkdownPreview = dynamic(
  () => import("@/components/MarkdownPreview"),
  { ssr: false }
);

type Doc = {
  id: string;
  title: string | null;
  markdown: string | null;
  created_at: string;
  updated_at: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function DocEditorClient({
  runId,
  docId,
}: {
  runId: string;
  docId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Server doc (last saved)
  const [doc, setDoc] = useState<Doc | null>(null);

  // Drafts for the current edit session
  const [titleDraft, setTitleDraft] = useState("");
  const [markdownDraft, setMarkdownDraft] = useState("");

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save state UI
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Load document (client fetch keeps server route simple)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/docs/${docId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.error) setError(data.error);
        else setDoc(data.doc);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load doc");
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [docId]);

  // Start editing: snapshot current server doc to drafts
  const beginEdit = () => {
    if (!doc) return;
    setTitleDraft(doc.title ?? "");
    setMarkdownDraft(doc.markdown ?? "");
    setPreview(false);
    setEditMode(true);
    setSaveState("idle");
    setError(null);
  };

  // Cancel: discard all draft changes and exit edit mode
  const cancelEdit = () => {
    setEditMode(false);
    setPreview(false);
    setSaveState("idle");
    setError(null);
    if (doc) {
      setTitleDraft(doc.title ?? "");
      setMarkdownDraft(doc.markdown ?? "");
    }
  };

  // Unsaved changes detector
  const dirty = useMemo(
    () =>
      editMode &&
      doc &&
      (titleDraft !== (doc.title ?? "") ||
        markdownDraft !== (doc.markdown ?? "")),
    [editMode, doc, titleDraft, markdownDraft]
  );

  // Save (explicit only)
  const performSave = async () => {
    if (!doc) return { ok: true };
    setSaveState("saving");
    const res = await updateDocAction(doc.id, {
      title: titleDraft,
      markdown: markdownDraft,
    });
    if (res?.error) {
      setSaveState("error");
      setError(res.error);
      return { ok: false };
    }
    setDoc(res.doc); // update baseline for dirty calc
    setSaveState("saved");
    const ts = new Date().toLocaleTimeString();
    setLastSavedAt(ts);
    setTimeout(() => setSaveState("idle"), 1200);
    router.refresh();
    return { ok: true };
  };

  // Save button (explicit save exits edit mode)
  const handleSaveClick = () =>
    start(async () => {
      const result = await performSave();
      if (result.ok) {
        setEditMode(false);
        setPreview(false);
      }
    });

  // Cmd/Ctrl+S shortcut for explicit save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        if (editMode) {
          e.preventDefault();
          handleSaveClick();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, titleDraft, markdownDraft, doc]);

  // Warn if navigating away with unsaved changes
  useEffect(() => {
    if (!editMode || !dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // triggers native browser prompt
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editMode, dirty]);

  // Export PDF
  const handleExportPdf = async () => {
    try {
      const res = await fetch(`/api/docs/${docId}/pdf`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        return alert(j?.error || "PDF generation failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc?.title ?? "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message ?? "PDF generation failed");
    }
  };

  // Regenerate
  const handleRegenerate = async () => {
    try {
      const res = await fetch(`/api/docs/${docId}/regenerate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data?.error) alert(data.error);
      else {
        setDoc(data.doc);
        if (editMode) {
          // keep drafts aligned if we regenerate mid-edit
          setTitleDraft(data.doc?.title ?? "");
          setMarkdownDraft(data.doc?.markdown ?? "");
        }
        router.refresh();
      }
    } catch (e: any) {
      alert(e?.message ?? "Regeneration failed");
    }
  };

  // Status chip text
  const statusChip = editMode ? (
    <span
      className={
        "section-chip " +
        (saveState === "saving"
          ? "opacity-80"
          : saveState === "error"
          ? "bg-red-100 text-red-800"
          : "")
      }
      title={
        saveState === "saved" && lastSavedAt
          ? `Saved at ${lastSavedAt}`
          : undefined
      }
    >
      {saveState === "saving"
        ? "Saving…"
        : saveState === "saved"
        ? "Saved"
        : saveState === "error"
        ? "Error"
        : dirty
        ? "Unsaved changes"
        : "No changes"}
    </span>
  ) : null;

  const showSplit = editMode && preview;

  return (
    <main className="container-px mx-auto max-w-content py-6">
      <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] shadow-[--shadow-0]">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-[--color-border] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-medium">
              {editMode ? (
                <input
                  type="text"
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  placeholder="Document title"
                />
              ) : (
                doc?.title ?? "Document"
              )}
            </div>
            <div className="text-xs text-[--muted]">
              {doc
                ? `Last updated: ${new Date(
                    doc.updated_at
                  ).toLocaleString()}`
                : "Loading…"}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {statusChip}
            {editMode ? (
              <>
                <button
                  onClick={() => setPreview((v) => !v)}
                  className={`toolbar-btn ${
                    preview ? "bg-[--surface-2]" : ""
                  }`}
                  title="Toggle live preview"
                >
                  {preview ? "Hide Preview" : "Preview"}
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={pending || !dirty}
                  className="toolbar-btn"
                  title={
                    dirty
                      ? "Save changes (⌘/Ctrl+S)"
                      : "No changes to save"
                  }
                >
                  {pending ? "Saving…" : "Save"}
                </button>
                <button onClick={cancelEdit} className="toolbar-btn">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={beginEdit} className="toolbar-btn">
                  Edit
                </button>
                <button
                  onClick={handleExportPdf}
                  className="toolbar-btn"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleRegenerate}
                  className="toolbar-btn bg-[--primary] text-white/95"
                >
                  Regenerate
                </button>
              </>
            )}
            <a href={`/runs/${runId}`} className="toolbar-btn">
              Back to Run
            </a>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          {loading ? (
            <p className="text-sm opacity-80">Loading…</p>
          ) : error ? (
            <pre className="text-xs text-red-600">
              {JSON.stringify(error, null, 2)}
            </pre>
          ) : showSplit ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-2 text-xs opacity-70">
                  Editor
                </label>
                <textarea
                  className="min-h-[480px] w-full rounded border p-2 font-mono text-sm"
                  value={markdownDraft}
                  onChange={(e) =>
                    setMarkdownDraft(e.target.value)
                  }
                  placeholder="Write markdown…"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-xs opacity-70">
                  Live Preview
                </label>
                <div className="min-h-[480px] rounded border bg-[--surface] p-3">
                  <MarkdownPreview markdown={markdownDraft} />
                </div>
              </div>
            </div>
          ) : editMode ? (
            <textarea
              className="min-h-[520px] w-full rounded border p-2 font-mono text-sm"
              value={markdownDraft}
              onChange={(e) => setMarkdownDraft(e.target.value)}
              placeholder="Write markdown…"
            />
          ) : (
            <MarkdownPreview markdown={doc?.markdown ?? ""} />
          )}
        </div>
      </div>
    </main>
  );
}

