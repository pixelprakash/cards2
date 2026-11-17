import { useEffect, useRef } from "react";

// A modal built on the native <dialog>: focus is trapped, Esc closes, focus goes back to what opened it.
export default function Dialog({ open, onClose, title, children, actions }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="dlg" aria-labelledby="dlg-title" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
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
