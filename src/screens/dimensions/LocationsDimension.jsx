import { useDim } from "../../hooks/useDim.js";
import { uid } from "../../state/model.js";
import ChoiceList from "../../components/ChoiceList.jsx";
import { AddOwn, OwnTags } from "../../components/AddOwn.jsx";
import DimensionFrame from "../DimensionFrame.jsx";

// Frozen response: one primary setting, up to two secondary settings, and add your own.
export default function LocationsDimension({ dim }) {
  const [d, edit] = useDim(dim.id);
  const all = [...dim.choices, ...d.custom.map((c) => ({ id: c.id, label: c.text }))];
  const rest = all.filter((o) => o.id !== d.primary);
  return (
    <DimensionFrame dim={dim} needText="Choose your main setting to continue.">
      <ChoiceList legend="Main setting (choose one)" options={all} value={d.primary ? [d.primary] : []} mode="single" columns
        onChange={([v]) => edit((x) => { x.primary = v; x.secondary = x.secondary.filter((s) => s !== v); })} />
      {d.primary && (
        <ChoiceList legend="Other settings (up to two)" hint={`${d.secondary.length} of ${dim.maxSecondary} chosen`} options={rest} value={d.secondary} max={dim.maxSecondary} columns onChange={(v) => edit((x) => { x.secondary = v; })} />
      )}
      <div className="stack">
        <AddOwn label="Add your own setting" placeholder="Another place where learning happens" onAdd={(t) => edit((x) => { x.custom.push({ id: uid("c"), text: t }); })} />
        <OwnTags items={d.custom} onRemove={(id) => edit((x) => { x.custom = x.custom.filter((c) => c.id !== id); if (x.primary === id) x.primary = null; x.secondary = x.secondary.filter((s) => s !== id); })} />
      </div>
    </DimensionFrame>
  );
}
