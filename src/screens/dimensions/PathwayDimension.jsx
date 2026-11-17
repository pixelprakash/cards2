import { useDim } from "../../hooks/useDim.js";
import { uid } from "../../state/model.js";
import ChoiceList from "../../components/ChoiceList.jsx";
import { AddOwn, OwnTags } from "../../components/AddOwn.jsx";
import StepList from "../../components/StepList.jsx";
import DimensionFrame from "../DimensionFrame.jsx";

// Choices plus a simple pathway builder: add, reorder and remove stages. No linear route is imposed.
export default function PathwayDimension({ dim }) {
  const [d, edit] = useDim(dim.id);
  return (
    <DimensionFrame dim={dim} needText="Choose at least one, or add your own, to continue.">
      <ChoiceList legend="Select all that apply" options={dim.choices} value={d.picks} columns onChange={(v) => edit((x) => { x.picks = v; })} />
      <div className="stack">
        <AddOwn label="Add your own" placeholder="Describe another kind of pathway" onAdd={(t) => edit((x) => { x.custom.push({ id: uid("c"), text: t }); })} />
        <OwnTags items={d.custom} onRemove={(id) => edit((x) => { x.custom = x.custom.filter((c) => c.id !== id); })} />
      </div>
      <section className="group" aria-labelledby="pw-h">
        <h2 id="pw-h">Sketch a pathway (optional)</h2>
        <p className="hint">Add the stages someone might go through, in any order, as many or as few as you like. Move them with the arrows.</p>
        <StepList steps={d.stages} noun="stage" tone="purple" placeholder="Describe this stage" addLabel={d.stages.length ? "Add another stage" : "Add a stage"} onChange={(stages) => edit((x) => { x.stages = stages; })} />
      </section>
    </DimensionFrame>
  );
}
