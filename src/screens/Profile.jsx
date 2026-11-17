import { useEffect, useRef, useState } from "react";
import { useAutoGrow } from "../hooks/motion.js";
import { useSession } from "../state/SessionContext.jsx";
import { PATH } from "../flow/flow.js";
import { SECTIONS, EMPTY_SECTION, inputHash } from "../profile/organise.js";
import { addDraft, anyEdited, approve, editSection, isEdited, latest } from "../profile/versions.js";
import ProfileVisual from "../profile/ProfileVisual.jsx";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import Dialog from "../components/Dialog.jsx";
import { useTitle } from "../hooks/useTitle.js";

function Section({ sec, version, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const ref = useRef(null);
  useAutoGrow(ref, text);
  const body = version.sections[sec.id];
  const edited = isEdited(version, sec.id);
  const start = () => { setText(body); setEditing(true); setTimeout(() => ref.current?.focus(), 30); };
  const save = () => { onEdit(sec.id, text.trim()); setEditing(false); };
  return (
    <article className={`psec tone-${sec.tone}`} aria-labelledby={`ps-${sec.id}`}>
      <h2 id={`ps-${sec.id}`}>{sec.title}<span className="prov">{edited ? "Edited by you" : "Organised from your answers"}</span></h2>
      {editing ? (
        <>
          <label className="sr-only" htmlFor={`pe-${sec.id}`}>{`Edit ${sec.title}`}</label>
          <textarea id={`pe-${sec.id}`} ref={ref} className="textarea" rows={10} maxLength={4000} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row"><button type="button" className="btn btn-soft btn-small" onClick={save}>Save my edit</button><button type="button" className="btn btn-ghost btn-small" onClick={() => setEditing(false)}>Cancel</button></div>
        </>
      ) : (
        <>
          {body ? <p>{body}</p> : <p style={{ opacity: 0.8 }}>{EMPTY_SECTION}</p>}
          <div><button type="button" className="btn btn-ghost btn-small" onClick={start} aria-label={`Edit ${sec.title}`}>Edit</button></div>
        </>
      )}
    </article>
  );
}

// Stage 4, part 2: the organised draft. The participant edits it, may regenerate it from their existing answers, and approves it.
export default function Profile() {
  useTitle("Your institution profile");
  const { session, update } = useSession();
  const [confirm, setConfirm] = useState(false);
  const v = latest(session.profile);

  // First visit: write the first draft from what the participant supplied.
  useEffect(() => { if (!latest(session.profile)) update((d) => { if (!latest(d.profile)) addDraft(d); }); }, [session.profile, update]);

  if (!v) return <div className="wrap"><p className="lede">Organising your answers…</p></div>;
  const stale = v.inputHash !== inputHash(session);
  const approved = session.profile.approvedVersionId != null;
  const regenerate = () => { update((d) => { addDraft(d); }); setConfirm(false); };

  return (
    <>
      <div className="wrap narrow">
        <QBlock tone="purple" eyebrow="Your institution — organised draft" title="Your institution, in your words" hint="This draft only rearranges what you chose and wrote. It adds no ideas or advice. Edit any part, regenerate it from your answers, then approve it." layered />
        {stale && <p className="hint" role="status" style={{ marginTop: "1rem" }}><b>Your answers have changed since this draft.</b> Use “Regenerate from my existing answers” to bring it up to date.</p>}
        <div className="profile" style={{ marginTop: "2rem" }}>
          {SECTIONS.map((s) => <Section key={`${v.id}-${s.id}`} sec={s} version={v} onEdit={(id, t) => update((d) => { editSection(d, id, t); })} />)}
          <ProfileVisual session={session} />
        </div>
        <div className="row" style={{ marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-ghost" onClick={() => (anyEdited(v) ? setConfirm(true) : regenerate())}>Regenerate from my existing answers</button>
          {approved && <span className="badge light">Approved</span>}
        </div>
      </div>
      <ActionBar back={<Back to={PATH.institution} />}>
        <Primary to={PATH.reflection} onClick={() => update((d) => { if (!d.profile.approvedVersionId || latest(d.profile).kind !== "approved") approve(d); })}>{approved ? "Continue to reflection" : "Approve profile"}</Primary>
      </ActionBar>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Replace your edits?" actions={<button type="button" className="btn btn-soft" onClick={regenerate}>Regenerate</button>}>
        <p>Regenerating writes a fresh draft from your existing answers and replaces the edits you made to this one. Your earlier versions are kept.</p>
      </Dialog>
    </>
  );
}
