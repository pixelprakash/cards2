import { Link } from "react-router-dom";
import { useState } from "react";
import { useSession } from "../state/SessionContext.jsx";
import { HUB_OPTIONAL, HUB_REQUIRED } from "../config/dimensions.js";
import { PATH } from "../flow/flow.js";
import { dimState, requiredDimensionsDone } from "../flow/validate.js";
import { uid } from "../state/model.js";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { Check, Cross } from "../components/Icons.jsx";
import { TextInput } from "../components/Fields.jsx";
import { useTitle } from "../hooks/useTitle.js";

const STATE_LABEL = { done: "Done", started: "In progress", skipped: "Skipped", na: "Not applicable", todo: "Not started" };

function Tile({ dim, state }) {
  return (
    <Link to={PATH.dimension(dim.id)} className={`tile tone-${dim.tone}${state === "todo" ? " is-todo" : ""}${dim.required ? "" : " optional"}`}>
      <span className="n">{String(dim.n).padStart(2, "0")}</span>
      <span className="t">{dim.short}</span>
      <span className="meta">
        <span className="badge">{dim.required ? "Required" : "Optional"}</span>
        <span className="st">{state === "done" && <Check />}{STATE_LABEL[state]}</span>
      </span>
    </Link>
  );
}

// Route B: six required and six optional dimensions, in any order.
export default function DimensionsHub() {
  useTitle("Configure Your Institution");
  const { session, update } = useSession();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const required = HUB_REQUIRED;
  const optional = HUB_OPTIONAL;
  const left = required.filter((d) => dimState(session, d) !== "done").length;
  const ready = requiredDimensionsDone(session);

  const addDim = () => { if (!title.trim()) return; update((d) => { d.customDims.push({ id: uid("c"), title: title.trim().slice(0, 80), text: text.trim().slice(0, 600) }); }); setTitle(""); setText(""); };

  return (
    <>
      <div className="wrap">
        <QBlock tone="orange" eyebrow="Configure Your Institution" title="Choose a dimension" hint="Six are required; six are optional. Work in any order, and come back to change anything. Your answers are kept." layered />
        <div className="stack-lg" style={{ marginTop: "2.5rem" }}>
          <section className="group" aria-labelledby="req-h">
            <h2 id="req-h">Required <span className="muted">· {required.length - left} of {required.length} done</span></h2>
            <div className="tiles">{required.map((d) => <Tile key={d.id} dim={d} state={dimState(session, d)} />)}</div>
          </section>
          <section className="group" aria-labelledby="opt-h">
            <h2 id="opt-h">Optional <span className="muted">· skip any you like</span></h2>
            <div className="tiles">{optional.map((d) => <Tile key={d.id} dim={d} state={dimState(session, d)} />)}</div>
          </section>
          <section className="panel" aria-labelledby="add-h">
            <h2 id="add-h" style={{ font: "700 1.4375rem/1.2 var(--font)" }}>Add a dimension</h2>
            <p className="hint">If something important is missing, name it and say a little about it.</p>
            <div className="stack">
              <TextInput label="Name" value={title} onChange={setTitle} maxLength={80} />
              <TextInput label="What is it about?" value={text} onChange={setText} maxLength={600} optional />
              <div><button type="button" className="btn btn-soft" onClick={addDim}>Add this dimension</button></div>
            </div>
            {session.customDims.length > 0 && (
              <ul className="chips" aria-label="Dimensions you added">
                {session.customDims.map((c) => (
                  <li key={c.id} className="tag">{c.title}
                    <button type="button" aria-label={`Remove ${c.title}`} onClick={() => update((d) => { d.customDims = d.customDims.filter((x) => x.id !== c.id); })}><Cross /></button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <ActionBar back={<Back to={PATH.entry} />} need={ready ? undefined : `${left} required ${left === 1 ? "dimension" : "dimensions"} left.`}>
        <Primary to={PATH.activities} disabled={!ready}>Continue to shared activities</Primary>
      </ActionBar>
    </>
  );
}
