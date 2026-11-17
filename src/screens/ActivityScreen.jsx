import { Navigate, useParams } from "react-router-dom";
import { ACTIVITY } from "../config/activities.js";
import { PATH } from "../flow/flow.js";
import Allocation from "./activities/Allocation.jsx";
import Rethink from "./activities/Rethink.jsx";
import Signature from "./activities/Signature.jsx";
import Tensions from "./activities/Tensions.jsx";
import Purpose from "./activities/Purpose.jsx";

const BY_ID = { allocation: Allocation, rethink: Rethink, signature: Signature, tensions: Tensions, purpose: Purpose };

export default function ActivityScreen() {
  const { id } = useParams();
  const Body = BY_ID[id];
  if (!ACTIVITY[id] || !Body) return <Navigate to={PATH.activities} replace />;
  return <Body key={id} />;
}
