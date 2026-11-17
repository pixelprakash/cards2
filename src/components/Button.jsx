import { useNavigate } from "react-router-dom";
import { Arrow, ArrowBack } from "./Icons.jsx";

// Primary action: pink pill with a round arrow. When it cannot be used yet it stays focusable and says why (aria-disabled).
export function Primary({ children, onClick, to, disabled, why, type = "button", ...rest }) {
  const nav = useNavigate();
  const go = (e) => {
    if (disabled) { e.preventDefault(); why?.(); return; }
    if (onClick) onClick(e);
    if (to) nav(to);
  };
  return (
    <button type={type} className="btn btn-primary" aria-disabled={disabled || undefined} onClick={go} {...rest}>
      {children}<span className="ico"><Arrow width="18" height="18" /></span>
    </button>
  );
}

export function Back({ to, children = "Back", onClick }) {
  const nav = useNavigate();
  return (
    <button type="button" className="btn btn-ghost" onClick={() => { onClick?.(); if (to) nav(to); }}>
      <ArrowBack />{children}
    </button>
  );
}

export function Ghost({ children, onClick, small, ...rest }) {
  return <button type="button" className={`btn btn-ghost${small ? " btn-small" : ""}`} onClick={onClick} {...rest}>{children}</button>;
}

export function Soft({ children, onClick, small, ...rest }) {
  return <button type="button" className={`btn btn-soft${small ? " btn-small" : ""}`} onClick={onClick} {...rest}>{children}</button>;
}

export function TextButton({ children, onClick, ...rest }) {
  return <button type="button" className="btn-text" onClick={onClick} {...rest}>{children}</button>;
}
