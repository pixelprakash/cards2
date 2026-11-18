import { Component } from "react";

// If something unexpected breaks a screen, say so kindly, keep the participant's answers, and offer a way back.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error("screen error:", error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="wrap" style={{ paddingBlock: "4rem", display: "grid", gap: "1rem", justifyItems: "start" }}>
        <h1 className="title">That screen did not load</h1>
        <p className="lede">Your answers are safe: they are kept in this browser. Please try again, and if it keeps happening, tell the research team.</p>
        <div className="row">
          <button type="button" className="btn btn-soft" onClick={() => location.reload()}>Reload</button>
          <button type="button" className="btn btn-ghost" onClick={() => { location.hash = "#/"; location.reload(); }}>Back to the start</button>
        </div>
      </main>
    );
  }
}
