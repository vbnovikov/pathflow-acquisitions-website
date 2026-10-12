import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./app";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing application root");
}

const application = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Pre-rendered HTML is hydrated rather than discarded; Vite dev can still use
// the empty root created by index.html.
if (container.hasChildNodes()) {
  hydrateRoot(container, application);
} else {
  createRoot(container).render(application);
}
