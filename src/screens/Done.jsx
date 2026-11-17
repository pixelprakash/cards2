import { useEffect, useState } from "react";
import { burst } from "../components/Confetti.js";
import { haptic } from "../hooks/motion.js";
import { useNavigate } from "react-router-dom";
import { useSession } from "../state/SessionContext.jsx";
import { SECTIONS, EMPTY_SECTION, profileText } from "../profile/organise.js";
import { latest } from "../profile/versions.js";
import { flatten } from "../export/flatten.js";
import QBlock from "../components/QBlock.jsx";
import { Ghost, Soft } from "../components/Button.jsx";
import Dialog from "../components/Dialog.jsx";
import { useTitle } from "../hooks/useTitle.js";

function download(name, type, data) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Done() {
  useTitle("Thank you");
  const { session, reset } = useSession();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { const t = setTimeout(() => { burst({ x: innerWidth / 2, y: innerHeight * 0.3 }, { count: 70, spread: 1.7 }); haptic(30); }, 450); return () => clearTimeout(t); }, []);
  const copyCode = async () => { try { await navigator.clipboard.writeText(session.code); setMsg("Code copied."); haptic(10); } catch { setMsg("Could not copy. Select the code and copy it instead."); } };
  const v = session.profile.versions.find((x) => x.id === session.profile.approvedVersionId) ?? latest(session.profile);
  const text = v ? profileText(v.sections) : "";
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg("Copied."); } catch { setMsg("Could not copy. Select the text and copy it instead."); } };
  return (
    <div className="wrap narrow">
      <QBlock tone="green" eyebrow="Submitted" title="Thank you" question="Your institution has been submitted." hint="If you need to refer to your answers later, use your participant code." layered />
      <div className="stack-lg" style={{ marginTop: "2.5rem" }}>
        <section className="panel" aria-labelledby="code-h"><h2 id="code-h" className="eyebrow">Your participant code</h2><button type="button" className="codebtn" onClick={copyCode} aria-label={`Participant code ${session.code}. Press to copy.`}><span className="code">{session.code}</span><span className="copy">Copy</span></button></section>
        {v && (
          <section className="sheet" aria-labelledby="prof-h">
            <h2 id="prof-h">Your institution</h2>
            {SECTIONS.map((s) => <div key={s.id}><h3>{s.title}</h3><p>{v.sections[s.id] || EMPTY_SECTION}</p></div>)}
          </section>
        )}
        <div className="row">
          <Soft onClick={copy}>Copy my profile</Soft>
          <Ghost onClick={() => download(`institution-${session.code}.txt`, "text/plain", text)}>Download as text</Ghost>
          <Ghost onClick={() => download(`answers-${session.code}.json`, "application/json", JSON.stringify({ session, responses: flatten(session) }, null, 2))}>Download all my answers</Ghost>
          <span role="status" className="muted">{msg}</span>
        </div>
        <div><Ghost onClick={() => setConfirm(true)}>Start a new one</Ghost></div>
      </div>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Start a new institution?" actions={<button type="button" className="btn btn-soft" onClick={() => { reset(); navigate("/"); }}>Start again</button>}>
        <p>This clears the answers saved in this browser. What you already submitted stays with the research team.</p>
      </Dialog>
    </div>
  );
}
