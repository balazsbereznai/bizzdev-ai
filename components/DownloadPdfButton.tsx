async function download(docId: string /*, runId?: string */) {
  const res = await fetch(`/api/docs/${docId}/pdf`, { method: "GET" });

  if (!res.ok) {
    // read and show the error text from the server
    const text = await res.text();
    throw new Error(text || "PDF generation failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // filename comes from Content-Disposition; letting browser use it is fine
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
async function download(docId: string /*, runId?: string */) {
  const res = await fetch(`/api/docs/${docId}/pdf`, { method: "GET" });

  if (!res.ok) {
    // read and show the error text from the server
    const text = await res.text();
    throw new Error(text || "PDF generation failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // filename comes from Content-Disposition; letting browser use it is fine
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
"use client";

import { useState } from "react";

export default function DownloadPdfButton({
  runId,
  docId,
}: {
  runId: string;
  docId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function download() {
    try {
      setLoading(true);
      const res = await fetch(`/api/docs/${docId}/pdf?runId=${runId}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doc-${runId}-${docId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Could not generate PDF. Check server logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      aria-busy={loading}
      className="rounded-xl px-3 py-1.5 text-sm border
                 border-[rgba(221,205,172,0.4)] hover:border-[#ddcdac]
                 bg-transparent text-[#efefcb] transition disabled:opacity-50"
      title="Download as PDF"
    >
      {loading ? "Generating…" : "Download PDF"}
    </button>
  );
}

