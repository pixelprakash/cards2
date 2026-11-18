import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ResearcherApp from "./ResearcherApp.jsx";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/screens.css";
import "./researcher.css";
import "../styles/motion.css";

document.body.classList.add("researcher");

createRoot(document.getElementById("root")).render(<StrictMode><ResearcherApp /></StrictMode>);
