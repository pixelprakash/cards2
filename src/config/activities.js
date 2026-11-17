// Stage 3, shared activities (brief section 6). Resource Allocation is required on both routes; the rest are optional.
// Category lists marked PROPOSED are placeholders until the researchers confirm them.

export const ALLOCATION_TOTAL = 100;

export const ALLOCATION_CATEGORIES = [
  { id: "people-mentoring", label: "People and mentoring" },
  { id: "library-knowledge", label: "Library and knowledge resources" },
  { id: "studios-labs", label: "Studios and laboratories" },
  { id: "field-community", label: "Field and community engagement" },
  { id: "digital-infrastructure", label: "Digital infrastructure" },
  { id: "physical-infrastructure", label: "Physical infrastructure" },
  { id: "learner-support", label: "Learner support and access" },
  { id: "accreditation-ranking", label: "Accreditation and ranking" },
];

export const ACTIVITIES = [
  { id: "allocation", title: "Resource allocation", required: true, tone: "orange",
    blurb: "Spread 100 points across what your institution would give priority to." },
  { id: "rethink", title: "Rethinking institutional practices", required: false, tone: "blue",
    blurb: "Keep, change, leave behind, combine or add familiar practices." },
  { id: "signature", title: "Signature practice", required: false, tone: "pink",
    blurb: "One practice that would make your institution different from a conventional university." },
  { id: "tensions", title: "Institutional tensions", required: false, tone: "purple",
    blurb: "Up to three tensions your institution would have to live with." },
  { id: "purpose", title: "Purpose", required: false, tone: "sand",
    blurb: "What should your institution make possible that existing institutions do not?" },
];
export const ACTIVITY = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

// PROPOSED: familiar practices to keep, change, leave behind, combine or add.
export const PRACTICES = [
  { id: "lectures", label: "Lectures" },
  { id: "exams-grades", label: "Exams and grades" },
  { id: "semesters-timetables", label: "Semesters and timetables" },
  { id: "degrees", label: "Degrees and certificates" },
  { id: "departments", label: "Academic departments" },
  { id: "entry-requirements", label: "Entry requirements" },
  { id: "campus", label: "A single campus" },
  { id: "teacher-student", label: "The teacher and student divide" },
];
export const PRACTICE_ACTIONS = [
  { id: "keep", label: "Keep" },
  { id: "change", label: "Change" },
  { id: "leave", label: "Leave behind" },
  { id: "combine", label: "Combine" },
  { id: "add", label: "Add" },
];

export const SIGNATURE_FIELDS = [
  { id: "practice", label: "What is the practice?", hint: "One practice that would make your institution different from a conventional university." },
  { id: "effect", label: "What is it meant to do?", hint: "The effect you intend." },
  { id: "difficulty", label: "What could be difficult, or have an unintended effect?", hint: "Possible difficulties or side effects." },
];

// PROPOSED: tension pairs. Each tension has two poles; the participant splits 100 points between them.
export const TENSIONS = [
  { id: "stability-change", a: "Stability", b: "Change" },
  { id: "open-selective", a: "Open to everyone", b: "Selective" },
  { id: "freedom-direction", a: "Individual freedom", b: "Shared direction" },
  { id: "depth-breadth", a: "Depth", b: "Breadth" },
  { id: "local-global", a: "Local roots", b: "Global reach" },
  { id: "structure-flexibility", a: "Structure", b: "Flexibility" },
  { id: "guidance-choice", a: "Expert guidance", b: "Learner choice" },
  { id: "tradition-experiment", a: "Tradition", b: "Experimentation" },
];
export const MAX_TENSIONS = 3;

export const PURPOSE_PROMPT = "What should your institution make possible that existing institutions do not?";

// Stage 5: frozen wording.
export const REFLECTION_PROMPTS = [
  { id: "interesting", q: "What do you find interesting or desirable about this institution?" },
  { id: "difficult", q: "What difficulties or contradictions might arise?" },
  { id: "change", q: "What would you change?" },
];

// Stage 4: formation and change.
export const FORMATION_PROMPTS = [
  { id: "begins", q: "What brings this institution into being?", hint: "Who or what starts it, and what need or possibility does it respond to?" },
  { id: "tried", q: "What is tried, adapted, continued or stopped?", hint: "How a practice is tried out, changed, kept or dropped." },
];
