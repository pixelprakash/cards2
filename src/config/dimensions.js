// The twelve dimensions, from the Phase III designer brief v0.5 (section 4).
// kind: "choices" (pick from a list, add your own), "locations" (one primary, up to two secondary),
//       "educators" (frozen three-part interaction), "experience" (build one learning experience), "pathway" (choices plus stages).
// status in the brief: FROZEN = agreed, PROPOSED = recommended, OPEN = not yet decided. Choice lists are PROPOSED unless noted.

const c = (id, label, def) => ({ id, label, ...(def ? { def } : {}) });

export const DIMENSIONS = [
  {
    id: "governance", n: 1, short: "Governance", title: "Governance", required: true, kind: "choices", tone: "orange",
    question: "How would decisions be made?",
    hint: "Where authority sits, who takes part, and how it differs by issue.",
    choices: [
      c("central-leadership", "Central leadership"),
      c("collective-decisions", "Collective decisions"),
      c("distributed-authority", "Distributed authority"),
      c("affected-groups", "Decisions by affected groups"),
      c("different-by-matter", "Different arrangements for different matters"),
    ],
    noteLabel: "Which matters are decided in which way? (optional)",
  },
  {
    id: "knowledge", n: 2, short: "Knowledge", title: "Organisation of knowledge", required: false, kind: "choices", tone: "blue",
    question: "How would different areas of knowledge come together?",
    hint: "Select all that apply. This is about knowledge, not teaching.",
    choices: [
      c("disciplinary", "Disciplinary"),
      c("multidisciplinary", "Multidisciplinary", "Areas contribute side by side."),
      c("interdisciplinary", "Interdisciplinary", "Areas are integrated."),
      c("transdisciplinary", "Transdisciplinary", "Across and beyond disciplines."),
      c("theme-problem-question", "Theme-, problem- or question-based"),
      c("no-fixed-boundaries", "No fixed disciplinary boundaries"),
    ],
  },
  {
    id: "locations", n: 3, short: "Locations", title: "Learning locations and settings", required: true, kind: "locations", tone: "green",
    question: "Where would learners spend most of their time learning?",
    hint: "Choose one main setting, then up to two more.",
    choices: [
      c("classrooms", "Classrooms or lecture spaces"),
      c("studios-labs", "Studios, workshops or laboratories"),
      c("workplaces", "Workplaces or professional organisations"),
      c("community", "Community settings"),
      c("homes", "Homes or personal spaces"),
      c("public-cultural", "Public or cultural spaces"),
      c("natural-outdoor", "Natural or outdoor environments"),
      c("digital", "Digital environments"),
    ],
    maxSecondary: 2,
  },
  {
    id: "process", n: 4, short: "Learning Process", title: "Organisation of the learning process", required: true, kind: "choices", tone: "pink",
    question: "How would learning be organised?",
    hint: "Select all that apply. This is about structure, not methods like debate or fieldwork.",
    choices: [
      c("individual", "Individual learning"),
      c("cohort-group", "Cohort or group learning"),
      c("course-programme", "Course/programme structure"),
      c("project-organised", "Project-organised learning"),
      c("self-directed", "Self-directed learning"),
      c("apprenticeship", "Apprenticeship or practice-based structure"),
      c("open-continuous", "Open-ended or continuous learning"),
    ],
    noteLabel: "How do these forms work together? (optional)",
  },
  {
    id: "membership", n: 5, short: "Membership", title: "Membership and participation", required: true, kind: "choices", tone: "sand",
    question: "Who can participate, and how would they belong?",
    hint: "Select all that apply. None is ranked or required.",
    choices: [
      c("open", "Open participation"),
      c("formal-enrolment", "Formal enrolment"),
      c("core-extended", "Core members plus an extended community"),
      c("contribution-based", "Contribution-based membership"),
      c("temporary", "Temporary project/activity membership"),
      c("differentiated", "Differentiated forms of participation"),
    ],
    noteLabel: "Anything to add about how people belong? (optional)",
  },
  {
    id: "educators", n: 6, short: "Educators and Roles", title: "Educators and their roles", required: true, kind: "educators", tone: "purple",
    question: "Who contributes to learning, which group is most regularly involved, and what roles should the institution provide?",
    hint: "Three short parts, one at a time.",
  },
  {
    id: "evaluation", n: 7, short: "Evaluation", title: "Evaluation of learning", required: false, kind: "choices", tone: "orange",
    question: "How would people know learning has taken place?",
    hint: "Select all that apply. You can mark the one that matters most.",
    choices: [
      c("projects", "Projects"),
      c("portfolios", "Portfolios"),
      c("practical-performance", "Practical performance"),
      c("written-exams", "Written examinations"),
      c("oral-presentations", "Oral presentations"),
      c("peer-assessment", "Peer assessment"),
      c("self-assessment", "Self-assessment"),
      c("continuous-feedback", "Continuous feedback"),
      c("demonstration", "Demonstration of capabilities"),
    ],
    mostImportant: true,
  },
  {
    id: "credentials", n: 8, short: "Credentials", title: "Credentials and recognition", required: false, kind: "choices", tone: "blue",
    question: "How should people receive recognition for learning?",
    hint: "Select all that apply. “No formal credential” is a real choice.",
    choices: [
      c("degrees", "Degrees"),
      c("certificates", "Certificates"),
      c("portfolios", "Portfolios"),
      c("demonstrated-capabilities", "Demonstrated capabilities"),
      c("competence-based", "Competence-based recognition"),
      c("professional", "Professional recognition"),
      c("peer-community", "Peer or community recognition"),
      c("multiple-forms", "Multiple forms"),
      c("none", "No formal credential"),
    ],
  },
  {
    id: "work", n: 9, short: "Learning and Work", title: "Relationship between learning and work", required: false, kind: "choices", tone: "green",
    question: "How should learning relate to work and everyday life?",
    hint: "Select all that apply. Work includes paid, unpaid, care and ecological work.",
    choices: [
      c("preparation-employment", "Preparation for employment"),
      c("alongside-employment", "Learning alongside employment"),
      c("professional-practice", "Professional practice"),
      c("entrepreneurship", "Entrepreneurship or self-employment"),
      c("community-contribution", "Community contribution"),
      c("care-work", "Care work"),
      c("ecological-work", "Ecological work"),
      c("unpaid-work", "Unpaid work"),
      c("independent-of-employment", "Learning independent of employment"),
    ],
  },
  {
    id: "technology", n: 10, short: "Technology and AI", title: "Technology and AI in learning", required: false, kind: "choices", tone: "pink",
    question: "What role should technology and AI play, and in which activities?",
    hint: "Select all that apply. These are roles, not a scale from low to high.",
    choices: [
      c("minimal-none", "Minimal or no digital use"),
      c("communication-access", "Communication/access infrastructure"),
      c("digital-knowledge", "Digital knowledge resources"),
      c("practical-experimentation", "Practical experimentation"),
      c("personalised-support", "Personalised learning support"),
      c("ai-supported", "AI-supported learning"),
      c("ai-institutional", "AI in institutional processes"),
    ],
    noteLabel: "In which activities? (optional)",
  },
  {
    id: "pedagogy", n: 11, short: "Pedagogical Methods", title: "Pedagogical approaches and learning methods", required: true, kind: "experience", tone: "sand",
    question: "What is one way learning could happen in your institution?",
    hint: "Answer in your own words. Any question can stay blank.",
  },
  {
    id: "pathways", n: 12, short: "Time and Pathways", title: "Time and learning pathways", required: false, kind: "pathway", tone: "purple",
    question: "How would people enter, progress, pause, return and complete learning?",
    hint: "Select all that apply, then sketch stages if you like.",
    choices: [
      c("fixed-duration", "Fixed-duration programme"),
      c("open-ended", "Open-ended learning"),
      c("self-paced", "Self-paced progress"),
      c("cohort-progression", "Cohort-based progression"),
      c("continuous-entry", "Continuous entry"),
      c("short-intensive", "Short intensive engagement"),
      c("pause-return", "Flexible pause and return"),
      c("capability-progression", "Capability-based progression"),
      c("multiple-pathways", "Multiple pathways"),
    ],
  },
];

export const DIMENSION = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]));
// The order of the tiles on the "Choose a dimension" screen, as drawn in the brief (section 3).
export const HUB_REQUIRED = ["governance", "membership", "educators", "process", "pedagogy", "locations"].map((id) => DIMENSION[id]);
export const HUB_OPTIONAL = ["knowledge", "evaluation", "credentials", "work", "technology", "pathways"].map((id) => DIMENSION[id]);

// Frozen interaction for dimension 6 (Educators and their roles).
export const CONTRIBUTOR_GROUPS = [
  c("academic-teachers", "Academic teachers"),
  c("professional-practitioners", "Professional practitioners"),
  c("artists-makers", "Artists, craftspeople and makers"),
  c("community-holders", "Community knowledge holders"),
  c("peers", "Peers and fellow learners"),
  c("external-experts", "External experts"),
];
export const NO_SINGLE_GROUP = "none-broadly-shared";
export const NO_SINGLE_GROUP_LABEL = "No single group—contributions would be broadly shared";

export const EDUCATOR_ROLES = [
  c("teach-explain", "Teach and explain"),
  c("guide", "Guide learning"),
  c("challenge", "Challenge and question"),
  c("demonstrate", "Demonstrate practice"),
  c("critique", "Critique and give feedback"),
  c("assess", "Assess achievement"),
  c("connect", "Connect learning with opportunities"),
  c("support", "Provide personal support"),
];

// The six prompts of the "Build one learning experience" interaction (section 4.1).
export const EXPERIENCE_PROMPTS = {
  explore: { q: "What are people exploring, practising or creating?", action: "Add an idea" },
  does: { q: "What do learners do?", action: "Describe actions" },
  takesPart: { q: "Who or what takes part?", action: "Add / link a contributor" },
  where: { q: "Where does it happen?", action: "Link a setting or add one" },
  unfolds: { q: "How does it unfold?", action: "Add, reorder or remove steps" },
  outcomes: { q: "What might people make, understand or change?", action: "Describe" },
};
