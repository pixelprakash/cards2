import { PURPOSE_PROMPT } from "../../config/activities.js";
import { useActivity } from "../../hooks/useActivity.js";
import { hasText } from "../../state/model.js";
import { TextArea } from "../../components/Fields.jsx";
import ActivityFrame from "../ActivityFrame.jsx";

export default function Purpose() {
  const [a, edit] = useActivity("purpose");
  return (
    <ActivityFrame id="purpose" question={PURPOSE_PROMPT} has={hasText(a.text)} valid>
      <TextArea label="Your answer" rows={6} maxLength={1500} value={a.text} onChange={(v) => edit((x) => { x.text = v; })} />
    </ActivityFrame>
  );
}
