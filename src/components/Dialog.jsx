import { useEffect, useRef } from "react";

// A modal built on the native <dialog>: focus is trapped, Esc closes, focus goes back to what opened it.
export default function Dialog({ open, onClose, title, children, actions }) {
  const ref = useRef(null);
  const echo = useRef(false);   // true while a close we caused ourselves is still to be reported by the browser
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) { echo.current = true; d.close(); }
  }, [open]);
  // The browser reports every close, including the one we just made. Ignore that echo, so a late report cannot shut the
  // next dialog the moment it opens; Esc and the backdrop still close normally.
  const reported = () => { if (echo.current) { echo.current = false; return; } onClose(); };
  return (
    <dialog ref={ref} className="dlg" aria-labelledby="dlg-title" onClose={reported} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      {open && (
        <div className="dlg-in">
          <h2 id="dlg-title">{title}</h2>
          {children}
          <div className="row" style={{ justifyContent: "flex-end" }}>
            {actions}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </dialog>
  );
}
