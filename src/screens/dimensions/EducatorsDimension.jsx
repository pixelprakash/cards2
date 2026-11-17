import { useDim } from "../../hooks/useDim.js";
import { uid } from "../../state/model.js";
import { CONTRIBUTOR_GROUPS, EDUCATOR_ROLES, NO_SINGLE_GROUP, NO_SINGLE_GROUP_LABEL } from "../../config/dimensions.js";
import ChoiceList from "../../components/ChoiceList.jsx";
import { AddOwn, OwnTags } from "../../components/AddOwn.jsx";
import PointsAllocator from "../../components/PointsAllocator.jsx";
import DimensionFrame from "../DimensionFrame.jsx";

// Frozen three-part interaction: A who contributes, B which group is most regularly involved, C roles (100 points).
export default function EducatorsDimension({ dim }) {
  const [d, edit] = useDim(dim.id);
  const chosen = [
    ...CONTRIBUTOR_GROUPS.filter((g) => d.contributors.picks.includes(g.id)),
    ...d.contributors.custom.map((g) => ({ id: g.id, label: g.text })),
  ];
  const regularOptions = [...chosen, { id: NO_SINGLE_GROUP, label: NO_SINGLE_GROUP_LABEL }];
  const roleRows = [...EDUCATOR_ROLES.map((r) => ({ id: r.id, label: r.label })), ...d.roles.custom.map((r) => ({ id: r.id, label: r.text, own: true }))];

  const setRole = (id, n) => edit((x) => { x.roles.values[id] = n; });
  const spread = () => edit((x) => { const rows = roleRows.map((r) => r.id); const base = Math.floor(100 / rows.length); let extra = 100 - base * rows.length; rows.forEach((id) => { x.roles.values[id] = base + (extra-- > 0 ? 1 : 0); }); });

  return (
    <DimensionFrame dim={dim} needText="Complete all three parts: contributors, the most regular group, and 100 points across roles.">
      <section className="group" aria-labelledby="ed-a">
        <h2 id="ed-a">Part A · Who would contribute to learning?</h2>
        <ChoiceList legend="Build the teaching community. Select any groups, as many as you like." options={CONTRIBUTOR_GROUPS} value={d.contributors.picks} columns
          onChange={(v) => edit((x) => { x.contributors.picks = v; if (x.regular && x.regular !== NO_SINGLE_GROUP && !v.includes(x.regular) && !x.contributors.custom.some((c) => c.id === x.regular)) x.regular = null; })} />
        <AddOwn label="Add your own group" placeholder="Another group who would contribute" onAdd={(t) => edit((x) => { x.contributors.custom.push({ id: uid("c"), text: t }); })} />
        <OwnTags items={d.contributors.custom} onRemove={(id) => edit((x) => { x.contributors.custom = x.contributors.custom.filter((c) => c.id !== id); if (x.regular === id) x.regular = null; })} />
      </section>

      <section className="group" aria-labelledby="ed-b">
        <h2 id="ed-b">Part B · Which group would be most regularly involved in learning?</h2>
        <ChoiceList legend="Choose one" options={regularOptions} value={d.regular ? [d.regular] : []} mode="single" onChange={([v]) => edit((x) => { x.regular = v; })} />
      </section>

      <section className="group" aria-labelledby="ed-c">
        <h2 id="ed-c">Part C · What roles should your institution provide?</h2>
        <PointsAllocator rows={roleRows} values={d.roles.values} onChange={setRole} onSpread={spread} onClear={() => edit((x) => { x.roles.values = {}; })}
          onRemove={(id) => edit((x) => { x.roles.custom = x.roles.custom.filter((r) => r.id !== id); delete x.roles.values[id]; })}
          note="Share 100 points across the roles. The points show how much weight the institution gives each role, not an individual educator's time. Zero is fine." />
        <AddOwn label="Add a role" placeholder="Another role the institution should provide" onAdd={(t) => edit((x) => { x.roles.custom.push({ id: uid("c"), text: t }); })} />
      </section>
    </DimensionFrame>
  );
}
