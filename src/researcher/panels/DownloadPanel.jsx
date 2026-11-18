import { useState } from "react";
import { download, responsesCsv, summaryCsv } from "../exports.js";
import { printHtml } from "../../export/print.js";

const MIME = { xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

// Each format is made in the browser from what is on screen, so it always matches the filters above.
export default function DownloadPanel({ list, filterNote }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const run = (key, job) => async () => {
    setBusy(key); setMsg("");
    try { await job(); setMsg("Done. Check your downloads."); }
    catch (e) { setMsg(`That did not work: ${e.message || "unknown problem"}.`); }
    finally { setBusy(""); }
  };

  const formats = [
    { key: "xlsx", title: "Excel workbook", ext: ".xlsx", note: "Everything in one file: participants, every response, allocation, roles, tensions, writing and a dimension summary, on separate sheets with a read-me. Best for analysis.",
      go: async () => { const [{ buildXlsx }, R] = await Promise.all([import("../../export/office.js"), import("../../export/reports.js")]); download(`lid-research-${R.fileStamp()}.xlsx`, MIME.xlsx, buildXlsx(R.workbookSheets(list, filterNote))); } },
    { key: "docx", title: "Word report", ext: ".docx", note: "A readable summary with tables and every written answer, ready to edit and share.",
      go: async () => { const [{ buildDocx }, R] = await Promise.all([import("../../export/office.js"), import("../../export/reports.js")]); download(`lid-report-${R.fileStamp()}.docx`, MIME.docx, buildDocx(R.summaryReport(list, filterNote))); } },
    { key: "pdf", title: "PDF report", ext: ".pdf", note: "The same summary, laid out for A4. It opens your browser's print window: choose “Save as PDF” as the destination.",
      go: async () => { const R = await import("../../export/reports.js"); printHtml(R.reportHtml(R.summaryReport(list, filterNote), "Learning Institutions by Design: research summary")); } },
    { key: "csv1", title: "Responses (CSV)", ext: ".csv", note: "One row per answer with its status and provenance. Opens in any spreadsheet or statistics tool.",
      go: async () => download("lid-responses.csv", "text/csv", responsesCsv(list)) },
    { key: "csv2", title: "One row per participant (CSV)", ext: ".csv", note: "Wide format: timings, the status of every dimension, points per priority and role.",
      go: async () => download("lid-participants.csv", "text/csv", summaryCsv(list)) },
    { key: "json", title: "Everything (JSON)", ext: ".json", note: "The complete stored sessions, including every profile version. For archives and code.",
      go: async () => download("lid-sessions.json", "application/json", JSON.stringify(list, null, 2)) },
  ];

  return (
    <section className="rsec" aria-labelledby="dl-h">
      <h2 id="dl-h">Download</h2>
      <p className="hint">These cover the {list.length} {list.length === 1 ? "participant" : "participants"} in the current filter{filterNote ? ` (${filterNote})` : ""}. Written answers can contain personal details, so keep the files somewhere safe.</p>
      <div className="formats">
        {formats.map((f) => (
          <article className="format" key={f.key}>
            <h3>{f.title} <span className="ext">{f.ext}</span></h3>
            <p>{f.note}</p>
            <button type="button" className="btn btn-soft" disabled={!list.length || Boolean(busy)} onClick={run(f.key, f.go)}>{busy === f.key ? "Preparing…" : "Download"}</button>
          </article>
        ))}
      </div>
      <p className="muted" role="status">{msg}</p>
    </section>
  );
}
