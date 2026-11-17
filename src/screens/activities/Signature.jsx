import { SIGNATURE_FIELDS } from "../../config/activities.js";
import { useActivity } from "../../hooks/useActivity.js";
import { hasText } from "../../state/model.js";
import { TextArea } from "../../components/Fields.jsx";
import ActivityFrame from "../ActivityFrame.jsx";

export default function Signature() {
  const [a, edit] = useActivity("signature");
  const has = SIGNATURE_FIELDS.some((f) => hasText(a[f.id]));
  return (
    <ActivityFrame id="signature" question="What is one practice that would make your institution different from a conventional university?" hint="Describe the practice, what it is meant to do, and what could be hard about it." has={has} valid>
      {SIGNATURE_FIELDS.map((f) => (
        <TextArea key={f.id} label={f.label} hint={f.hint} rows={4} value={a[f.id]} onChange={(v) => edit((x) => { x[f.id] = v; })} />
      ))}
    </ActivityFrame>
  );
}
