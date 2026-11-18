// Small hand-drawn-style pictograms and doodles. Decorative: all aria-hidden. Strokes are round and a little uneven on purpose.
const P = {
  governance: "M3.5 10.5 12 4l8.5 6.5M5 20h14M6.5 20v-8M12 20v-8M17.5 20v-8",
  knowledge: "M5 4.5h10.5a1.5 1.5 0 0 1 1.5 1.5V20H6.8A1.8 1.8 0 0 1 5 18.2V4.5zM8.5 8.5h5M8.5 12h5M17 7.5h2v12.5",
  locations: "M12 21c-3.4-3.2-6-6-6-9.6a6 6 0 1 1 12 0C18 15 15.4 17.8 12 21zM12 11.600a1.9 1.9 0 1 0 .01 0",
  process: "M19.5 10.500A7.5 7.5 0 0 0 6.2 7M5 3.800v3.700h3.700M4.5 13.500A7.5 7.5 0 0 0 17.8 17M19 20.200v-3.700h-3.7",
  membership: "M9 10.500a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.2 20c.3-3 2.7-5.2 5.8-5.200s5.5 2.2 5.8 5.200M16.5 10.200a2.6 2.6 0 1 0-.6-5.100M17.5 14.400c2 .5 3.2 2.3 3.4 4.6",
  educators: "M4 5.500h16v10.500H10.500L5.5 19.800V16H4zM8 9.500h8M8 12.500h5",
  evaluation: "M4.5 4.500h15v15h-15zM8 12.200l2.8 2.800L16.2 9",
  credentials: "M12 13.800a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.8 13.2 7.5 20.5 12 18.200l4.5 2.3-1.3-7.3",
  work: "M3.8 8h16.400v11H3.800zM9 8V5h6v3M3.8 13h16.400M11 13v1.800h2V13",
  technology: "M7.5 7.500h9v9h-9zM10 3.500v4M14 3.500v4M10 16.500v4M14 16.500v4M3.5 10h4M3.5 14h4M16.5 10h4M16.5 14h4",
  pedagogy: "M4.2 20l1-4.200L16.3 4.700l3 3L8.2 18.8 4.2 20zM14 7l3 3",
  pathways: "M5.5 19.500c0-5 13-1.5 13-8M5.5 19.500h.01M18.5 6.500a1.8 1.8 0 1 0 .01 0",
  tensions: "M4 8h12M12 4.5 16 8l-4 3.5M20 16H8M12 12.5 8 16l4 3.5",
  purpose: "M6 21V4M6 5h11l-2.5 3.5L17 12H6",
  pencil: "M4.2 20l1-4.200L16.3 4.700l3 3L8.2 18.8 4.2 20zM14 7l3 3",
  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M13 4.500v5M7 14.500v5",
};
export const Glyph = ({ name, className = "", style }) => (
  <svg className={`glyph ${className}`} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={P[name] ?? P.pencil} /></svg>
);

// A scribbled underline that sits under a word.
export const Underline = ({ className = "" }) => (
  <svg className={`underline ${className}`} viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 11c36-8 70 4 108-2s64-6 98 0 62 3 88-3" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></svg>
);

// A curved arrow, drawn like a marker.
export const ArrowDoodle = ({ className = "" }) => (
  <svg className={`arrow-doodle ${className}`} viewBox="0 0 80 70" aria-hidden="true" focusable="false"><path d="M8 6c10 30 34 40 60 38M52 30l17 14-21 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// A little schoolhouse of paper blocks. Colour fills sit slightly off their outlines, like a badly registered print.
export const Building = ({ className = "" }) => (
  <svg className={`building ${className}`} viewBox="0 0 330 270" aria-hidden="true" focusable="false">
    <path d="M12 238c70-7 160 4 304-6" fill="none" stroke="#f4efe8" strokeWidth="3" strokeLinecap="round" />
    <path d="M70 120l194-5 4 118-198 3z" fill="#ffabc8" transform="translate(7 6)" />
    <path d="M62 112l196-4 4 122-200 3z" fill="none" stroke="#f4efe8" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M52 117l112-66 108 56z" fill="#fc4109" transform="translate(6 5)" />
    <path d="M48 114l114-64 112 58z" fill="none" stroke="#f4efe8" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M168 54V20" stroke="#f4efe8" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M169 22l34 10-34 12z" fill="#e7bfff" stroke="#f4efe8" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="112" cy="158" r="17" fill="#5d9dc5" transform="translate(5 4)" /><circle cx="112" cy="158" r="17" fill="none" stroke="#f4efe8" strokeWidth="3" />
    <circle cx="222" cy="156" r="17" fill="#5d9dc5" transform="translate(5 4)" /><circle cx="222" cy="156" r="17" fill="none" stroke="#f4efe8" strokeWidth="3" />
    <path d="M146 235v-58q21-17 42 0v58z" fill="#e3b866" transform="translate(5 3)" /><path d="M142 235v-58q21-17 42 0v58z" fill="none" stroke="#f4efe8" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="26" cy="196" r="22" fill="#4c9a5f" transform="translate(4 3)" /><circle cx="26" cy="196" r="22" fill="none" stroke="#f4efe8" strokeWidth="3" /><path d="M26 218v20" stroke="#f4efe8" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M292 34l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="#e3b866" transform="translate(3 3)" /><path d="M292 34l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="none" stroke="#f4efe8" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
