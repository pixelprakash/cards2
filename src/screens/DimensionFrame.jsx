import { useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import QBlock, { dimEyebrow } from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary, TextButton } from "../components/Button.jsx";
import { DIMENSIONS } from "../config/dimensions.js";
import { PATH } from "../flow/flow.js";
import { dimHasContent, dimValid } from "../flow/validate.js";
import { useTitle } from "../hooks/useTitle.js";
import { dimOf } from "../state/model.js";

// Shared frame for every dimension: the coloured heading, the body, skip controls (optional dimensions only),
// and Previous / Next to move through the twelve in order. Moving on keeps what was entered; nothing is erased.
export default function DimensionFrame({ dim, children, needText }) {
  useTitle(dim.title);
  const { session, update } = useSession();
  const navigate = useNavigate();
  const d = dimOf(session, dim.id);
  const has = dimHasContent(session, dim);
  const valid = dimValid(session, dim);

  const i = DIMENSIONS.findIndex((x) => x.id === dim.id);
  const prev = DIMENSIONS[i - 1];
  const next = DIMENSIONS[i + 1];
  const prevPath = prev ? PATH.dimension(prev.id) : PATH.dimensions;
  const nextPath = next ? PATH.dimension(next.id) : PATH.dimensions;

  // Skip or "not applicable" records that choice, then moves on to the next dimension.
  const mark = (status) => { update((x) => { x.dims[dim.id] = { ...(x.dims[dim.id] ?? d), status }; }); navigate(nextPath); };
  // Moving on marks the dimension answered when it has an answer (and, if required, meets its rule).
  const save = () => update((x) => { if (dim.required ? valid : has) x.dims[dim.id] = { ...(x.dims[dim.id] ?? d), status: "answered" }; });

  return (
    <>
      <div className="wrap narrow">
        <div style={{ marginBottom: "0.9rem" }}><TextButton onClick={() => navigate(PATH.dimensions)}>← All dimensions</TextButton></div>
        <QBlock tone={dim.tone} eyebrow={dimEyebrow(dim)} badge={dim.required ? "Required" : "Optional"} title={dim.title} question={dim.question} hint={dim.hint} />
        {d.status === "skipped" && <p className="hint" style={{ marginTop: "1rem" }}>You skipped this earlier. Add an answer, or leave it skipped.</p>}
        {d.status === "na" && <p className="hint" style={{ marginTop: "1rem" }}>You marked this as not applicable to your institution. Add an answer to change that.</p>}
        <div className="qgrid">
          {children}
          {!dim.required && !has && (
            <div className="later">
              <button type="button" className="btn btn-ghost" onClick={() => mark("skipped")}>Skip this dimension</button>
              <button type="button" className="btn btn-ghost" onClick={() => mark("na")}>Not applicable to my institution</button>
            </div>
          )}
        </div>
      </div>
      <ActionBar back={<Back to={prevPath} onClick={save}>{prev ? "Previous" : "All dimensions"}</Back>} need={dim.required && !valid ? `${needText} You can move on and come back.` : undefined}>
        <Primary to={nextPath} onClick={save}>{next ? "Next" : "Finish dimensions"}</Primary>
      </ActionBar>
    </>
  );
}
