// Decorative shapes for the sticker look. All are aria-hidden: they carry no meaning.
export const Spark = ({ className = "", style }) => (
  <svg className={`deco ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path fill="currentColor" d="M50 0c3.4 24 26 46.6 50 50-24 3.4-46.6 26-50 50-3.4-24-26-46.6-50-50C24 46.6 46.6 24 50 0z" /></svg>
);
export const Blob = ({ className = "", style }) => (
  <svg className={`deco ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path fill="currentColor" d="M52 6c20 1 40 14 42 36 2 20-10 28-18 40-10 14-34 16-50 6C12 80 4 62 8 44 12 24 32 5 52 6z" /></svg>
);
export const Ring = ({ className = "", style }) => (
  <svg className={`deco ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="14" /></svg>
);
export const Squiggle = ({ className = "", style }) => (
  <svg className={`deco ${className}`} style={style} viewBox="0 0 160 40" aria-hidden="true" focusable="false"><path d="M4 22c14-24 26 16 40 0s26-24 40 0 26 16 40 0 22-14 28-6" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
