import { ALLOCATION_CATEGORIES, ALLOCATION_TOTAL } from "../../config/activities.js";
import { useActivity } from "../../hooks/useActivity.js";
import { allocationReady, allocationTotal, categoriesFor } from "../../flow/validate.js";
import { uid } from "../../state/model.js";
import PointsAllocator from "../../components/PointsAllocator.jsx";
import { AddOwn } from "../../components/AddOwn.jsx";
import ActivityFrame from "../ActivityFrame.jsx";

export default function Allocation() {
  const [a, edit] = useActivity("allocation");
  const rows = categoriesFor(a).map((r) => ({ ...r, own: !ALLOCATION_CATEGORIES.some((c) => c.id === r.id) }));
  const spread = () => edit((x) => {
    const ids = categoriesFor(x).map((r) => r.id); const base = Math.floor(ALLOCATION_TOTAL / ids.length); let extra = ALLOCATION_TOTAL - base * ids.length;
    ids.forEach((id) => { x.values[id] = base + (extra-- > 0 ? 1 : 0); });
  });
  // Saving makes the participant's zeros explicit: a category left at nothing is a real answer of 0, not "unanswered".
  const fillZeros = () => edit((x) => { categoriesFor(x).forEach((r) => { x.values[r.id] ??= 0; }); });
  return (
    <ActivityFrame id="allocation" question="Where would your institution put its effort and resources?"
      hint="Share 100 points across these priorities. Points show relative priority, not real budget shares. Zero is fine."
      valid={allocationReady(a)} has={allocationTotal(a) > 0} needText={`Place all ${ALLOCATION_TOTAL} points to continue.`} onSave={fillZeros}>
      <PointsAllocator rows={rows} values={a.values} onChange={(id, n) => edit((x) => { x.values[id] = n; })} onSpread={spread} onClear={() => edit((x) => { x.values = {}; })}
        onRemove={(id) => edit((x) => { x.custom = x.custom.filter((c) => c.id !== id); delete x.values[id]; })} />
      <AddOwn label="Add a priority" placeholder="Something else your institution would put effort into" buttonLabel="Add a priority" onAdd={(t) => edit((x) => { x.custom.push({ id: uid("c"), text: t }); })} />
    </ActivityFrame>
  );
}
