export const ROUTES = {
  free: { id: "free", title: "Imagine Freely", blurb: "Start with your own idea, in your own words." },
  configure: { id: "configure", title: "Configure Your Institution", blurb: "Start with six required dimensions and a few optional ones." },
};

// The five stages of the journey. Route A has no dimensions stage; it composes its idea instead.
export const stagesFor = (route) => [
  { id: "entry", label: "Entry" },
  { id: "dimensions", label: route === "free" ? "Your idea" : "Dimensions" },
  { id: "activities", label: "Shared activities" },
  { id: "institution", label: "Your institution" },
  { id: "reflection", label: "Reflection" },
];
