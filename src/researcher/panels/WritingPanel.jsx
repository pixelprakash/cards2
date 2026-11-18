import { useMemo, useState } from "react";

export default function WritingPanel({ M, onOpen }) {
  const { wr } = M;
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(30);
  const kinds = [...new Set(wr.map((w) => w.kind))];
  const rows = useMemo(() => wr.filter((w) => (!kind || w.kind === kind) && (!q || w.text.toLowerCase().includes(q.toLowerCase()))), [wr, kind, q]);
  return (
    <section className="rsec" aria-labelledby="w-h">
      <h2 id="w-h">In their own words</h2>
      <p className="hint">Verbatim. Written answers can contain personal details, so treat this and the downloads as research data.</p>
      <div className="r-filters">
        <div className="field"><label htmlFor="w-k">Show</label><select id="w-k" className="select" value={kind} onChange={(e) => { setKind(e.target.value); setShown(30); }}><option value="">Everything ({wr.length})</option>{kinds.map((k) => <option key={k} value={k}>{k}</option>)}</select></div>
        <div className="field grow"><label htmlFor="w-q">Search the text</label><input id="w-q" className="input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(30); }} placeholder="a word or phrase" /></div>
      </div>
      <p className="muted" role="status">{rows.length} {rows.length === 1 ? "answer" : "answers"}</p>
      <div className="stack">
        {rows.slice(0, shown).map((w, i) => (
          <blockquote className="quote" key={`${w.code}-${w.kind}-${i}`} style={{ margin: 0 }}>
            <span className="k">{w.kind}</span><p>{w.text}</p>
            <button type="button" className="btn-text c" onClick={() => onOpen(w.code)}>{w.code} · {w.route === "free" ? "Imagine Freely" : "Configure"}</button>
          </blockquote>
        ))}
        {!rows.length && <p className="muted">Nothing matches.</p>}
      </div>
      {rows.length > shown && <div><button type="button" className="btn btn-soft" onClick={() => setShown((n) => n + 30)}>Show 30 more</button></div>}
    </section>
  );
}
