import { Navigate, useParams } from "react-router-dom";
import { DIMENSION } from "../config/dimensions.js";
import { PATH } from "../flow/flow.js";
import ChoicesDimension from "./dimensions/ChoicesDimension.jsx";
import LocationsDimension from "./dimensions/LocationsDimension.jsx";
import EducatorsDimension from "./dimensions/EducatorsDimension.jsx";
import PathwayDimension from "./dimensions/PathwayDimension.jsx";
import ExperienceDimension from "./dimensions/ExperienceDimension.jsx";

const BY_KIND = { choices: ChoicesDimension, locations: LocationsDimension, educators: EducatorsDimension, pathway: PathwayDimension, experience: ExperienceDimension };

export default function DimensionScreen() {
  const { id } = useParams();
  const dim = DIMENSION[id];
  if (!dim) return <Navigate to={PATH.dimensions} replace />;
  const Body = BY_KIND[dim.kind];
  return <Body key={dim.id} dim={dim} />;
}
