import { useDim } from "../../hooks/useDim.js";
import { uid } from "../../state/model.js";
import ChoiceList from "../../components/ChoiceList.jsx";
import { AddOwn, OwnTags } from "../../components/AddOwn.jsx";
import { TextArea } from "../../components/Fields.jsx";
import DimensionFrame from "../DimensionFrame.jsx";

// Select all that apply, add your own, optionally a note, optionally mark the one that matters most.
export default function ChoicesDimension({ dim }) {
  const [d, edit] = useDim(dim.id);
  const labels = [...dim.choices.filter((c) => d.picks.includes(c.id)).map((c) => ({ id: c.id, label: c.label })), ...d.custom.map((c) => ({ id: c.id, label: c.text }))];
  return (
    <DimensionFrame dim={dim} needText="Choose at least one, or add your own, to continue.">
      <ChoiceList legend="Select all that apply" options={dim.choices} value={d.picks} columns onChange={(v) => edit((x) => { x.picks = v; if (x.most && !v.includes(x.most) && !x.custom.some((c) => c.id === x.most)) x.most = null; })} />
      <div className="stack">
        <AddOwn label="Add your own" placeholder="Describe another arrangement in your own words" onAdd={(t) => edit((x) => { x.custom.push({ id: uid("c"), text: t }); })} />
        <OwnTags items={d.custom} onRemove={(id) => edit((x) => { x.custom = x.custom.filter((c) => c.id !== id); if (x.most === id) x.most = null; })} />
      </div>
      {dim.mostImportant && labels.length > 1 && (
        <ChoiceList legend="Which one matters most? (optional)" options={labels} value={d.most ? [d.most] : []} mode="single" onChange={([v]) => edit((x) => { x.most = v; })} />
      )}
      {dim.noteLabel && <TextArea label={dim.noteLabel} id={`note-${dim.id}`} rows={3} value={d.note} onChange={(v) => edit((x) => { x.note = v; })} />}
    </DimensionFrame>
  );
}
