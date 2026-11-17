import { useId } from "react";

export function TextArea({ label, hint, value, onChange, rows, maxLength = 1200, placeholder, error, id: idProp, optional }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}{optional && <span className="muted"> (optional)</span>}</label>
      {hint && <p className="hint" id={`${id}-h`}>{hint}</p>}
      <textarea id={id} className="textarea" rows={rows} maxLength={maxLength} value={value} placeholder={placeholder}
        aria-describedby={[hint ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)} />
      {error && <p className="error" id={`${id}-e`} role="alert">{error}</p>}
    </div>
  );
}

export function TextInput({ label, hint, value, onChange, maxLength = 160, placeholder, id: idProp, optional }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className="field">
      <label htmlFor={id}>{label}{optional && <span className="muted"> (optional)</span>}</label>
      {hint && <p className="hint" id={`${id}-h`}>{hint}</p>}
      <input id={id} className="input" value={value} maxLength={maxLength} placeholder={placeholder} aria-describedby={hint ? `${id}-h` : undefined} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
