import { Link } from "react-router-dom";
import { useState } from "react";
import { useSession } from "../state/SessionContext.jsx";
import { HUB_OPTIONAL, HUB_REQUIRED } from "../config/dimensions.js";
import { PATH } from "../flow/flow.js";
import { dimState, requiredDimensionsDone } from "../flow/validate.js";
import { uid } from "../state/model.js";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { Arrow, Check, Cross } from "../components/Icons.jsx";
import { Glyph } from "../components/Glyphs.jsx";
import { TextInput } from "../components/Fields.jsx";
import { useTitle } from "../hooks/useTitle.js";

const STATE_LABEL = { done: "Done", started: "In progress", skipped: "Skipped", na: "Not applicable", todo: "Not started" };

function Row({ dim, state, next }) {
  return (
    <li>
      <Link to={PATH.dimension(dim.id)} className={`drow tone-${dim.tone}${next ? " is-next" : ""} st-${state}`}>
        <span className="disc"><Glyph name={dim.glyph ?? dim.id} /></span>
        <span className="dtxt"><span className="dn">{dim.short}</span><span className="dq">{dim.question}</span></span>
        <span className="dst">{state === "done" ? <><Check /> Done</> : STATE_LABEL[state]}</span>
      </Link>
    </li>
  );
}

// A progress ring: how many of the required dimensions are finished.
function Ring({ done, total }) {
  const r = 26; const c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 64 64" role="img" aria-label={`${done} of ${total} required dimensions done`}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(244,239,232,.2)" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--pink)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} transform="rotate(-90 32 32)" style={{ transition: "stroke-dashoffset 0.8s var(--ease)" }} />
      <text x="32" y="38" textAnchor="middle" fontSize="19" fontWeight="700" fill="currentColor">{done}</text>
    </svg>
  );
}

// Route B: six required and six optional dimensions, in any order. One clear next step, a calm list for the rest.
export default function DimensionsHub() {
  useTitle("Configure Your Institution");
  const { session, update } = useSession();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const required = HUB_REQUIRED;
  const optional = HUB_OPTIONAL;
  const doneCount = required.filter((d) => dimState(session, d) === "done").length;
  const left = required.length - doneCount;
  const ready = requiredDimensionsDone(session);
  const nextDim = required.find((d) => dimState(session, d) !== "done") ?? null;

  const addDim = () => { if (!title.trim()) return; update((d) => { d.customDims.push({ id: uid("c"), title: title.trim().slice(0, 80), text: text.trim().slice(0, 600) }); }); setTitle(""); setText(""); };

  return (
    <>
      <div className="wrap">
        <header className="hubhead hub2">
          <div>
            <p className="eyebrow">Configure Your Institution</p>
            <h1 className="title">Choose a dimension</h1>
            <p className="hint">Six are required; six are optional. Any order. Your answers are kept.</p>
          </div>
          <div className="progress-chip"><Ring done={doneCount} total={required.length} /><span>{ready ? "All required done" : `${left} required to go`}</span></div>
        </header>

        {nextDim && (
          <div className="upnext">
            <div><p className="u-l">{doneCount ? "Up next" : "Start here"}</p><p className="u-t">{nextDim.short}</p></div>
            <Link className="btn btn-primary" to={PATH.dimension(nextDim.id)}>{dimState(session, nextDim) === "started" ? "Continue" : "Start"}<span className="ico"><Arrow width="18" height="18" /></span></Link>
          </div>
        )}

        <div className="stack-lg" style={{ marginTop: "2rem" }}>
          <section className="group" aria-labelledby="req-h">
            <h2 id="req-h">Required</h2>
            <ul className="dlist">{required.map((d) => <Row key={d.id} dim={d} state={dimState(session, d)} next={nextDim?.id === d.id} />)}</ul>
          </section>
          <section className="group" aria-labelledby="opt-h">
            <h2 id="opt-h">Optional <span className="muted">· skip any you like</span></h2>
            <ul className="dlist">{optional.map((d) => <Row key={d.id} dim={d} state={dimState(session, d)} />)}</ul>
          </section>
          <details className="more addbox">
            <summary>Add a dimension of your own</summary>
            <div className="stack" style={{ marginTop: "0.9rem" }}>
              <p className="hint">If something important is missing, name it and say a little about it.</p>
              <TextInput label="Name" value={title} onChange={setTitle} maxLength={80} />
              <TextInput label="What is it about?" value={text} onChange={setText} maxLength={600} optional />
              <div><button type="button" className="btn btn-soft" onClick={addDim}>Add this dimension</button></div>
              {session.customDims.length > 0 && (
                <ul className="chips" aria-label="Dimensions you added">
                  {session.customDims.map((c) => (
                    <li key={c.id} className="tag">{c.title}
                      <button type="button" aria-label={`Remove ${c.title}`} onClick={() => update((d) => { d.customDims = d.customDims.filter((x) => x.id !== c.id); })}><Cross /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </div>
      </div>
      <ActionBar back={<Back to={PATH.entry} />} need={ready ? undefined : `${left} required ${left === 1 ? "dimension" : "dimensions"} left.`}>
        <Primary to={PATH.activities} disabled={!ready}>Continue</Primary>
      </ActionBar>
    </>
  );
}
