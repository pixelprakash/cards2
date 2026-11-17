import DimensionFrame from "../DimensionFrame.jsx";
import ExperienceBuilder from "../ExperienceBuilder.jsx";

// Dimension 11 on Route B: the same six prompts as the Imagine Freely screen. At least one prompt needs an answer.
export default function ExperienceDimension({ dim }) {
  return (
    <DimensionFrame dim={dim} needText="Answer at least one prompt to continue. The others can stay blank.">
      <ExperienceBuilder />
    </DimensionFrame>
  );
}
