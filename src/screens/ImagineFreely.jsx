import { useState } from "react";
import { useSession } from "../state/SessionContext.jsx";
import { PATH } from "../flow/flow.js";
import { hasText } from "../state/model.js";
import QBlock from "../components/QBlock.jsx";
import { TextArea } from "../components/Fields.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import { useTitle } from "../hooks/useTitle.js";

// Route A, first screen: one required open description.
export default function ImagineFreely() {
  useTitle("Imagine Freely");
  const { session, update } = useSession();
  const [tried, setTried] = useState(false);
  const ok = hasText(session.free.text);
  return (
    <>
      <div className="wrap narrow">
        <QBlock tone="pink" eyebrow="Imagine Freely" title="What might a different institution for learning look like?" hint="Write as much or as little as you like. You can come back and edit this later." />
        <div className="qgrid">
          <TextArea id="free-text" label="Your description" rows={9} maxLength={2000} value={session.free.text}
            onChange={(v) => update((d) => { d.free.text = v; })}
            hint="This description is required on this route and can be edited later."
            error={tried && !ok ? "Please write a few words about your idea to continue." : undefined} />
        </div>
      </div>
      <ActionBar back={<Back to={PATH.entry} />}>
        <Primary to={PATH.experience} disabled={!ok} why={() => { setTried(true); document.getElementById("free-text")?.focus(); }}>Continue</Primary>
      </ActionBar>
    </>
  );
}
