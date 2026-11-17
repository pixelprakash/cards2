import { useSession } from "../state/SessionContext.jsx";
import { PATH } from "../flow/flow.js";
import { experienceHasContent } from "../flow/validate.js";
import QBlock from "../components/QBlock.jsx";
import ActionBar from "../components/ActionBar.jsx";
import { Back, Primary } from "../components/Button.jsx";
import ExperienceBuilder from "./ExperienceBuilder.jsx";
import { useTitle } from "../hooks/useTitle.js";

// Route A, second screen: the same six prompts as dimension 11, all optional.
export default function ExperienceScreen() {
  useTitle("Build one learning experience");
  const { session, update } = useSession();
  const has = experienceHasContent(session.experience);
  const save = () => update((d) => { d.experience.status = experienceHasContent(d.experience) ? "answered" : "skipped"; });
  return (
    <>
      <div className="wrap narrow">
        <QBlock tone="sand" eyebrow="Imagine Freely · Your idea" title="Build one learning experience" hint="Use the prompts to describe one concrete way learning could happen in your institution. They are not a list of methods to pick from. Write, add steps, rearrange them, and leave any prompt blank." />
        <div className="qgrid"><ExperienceBuilder /></div>
      </div>
      <ActionBar back={<Back to={PATH.imagine} />} need={has ? undefined : "All prompts are optional. You can continue without answering."}>
        <Primary to={PATH.activities} onClick={save}>Continue</Primary>
      </ActionBar>
    </>
  );
}
