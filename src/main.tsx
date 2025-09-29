import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SimulatorProvider } from "./SimulatorContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SimulatorProvider>
      <App />
    </SimulatorProvider>
  </StrictMode>
);
