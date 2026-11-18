import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { SessionProvider } from "./state/SessionContext.jsx";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/screens.css";
import "./styles/motion.css";

document.body.classList.add("grain");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <SessionProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </SessionProvider>
    </ErrorBoundary>
  </StrictMode>,
);
