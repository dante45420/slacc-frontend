import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/index.css";
import { i18nReady } from "./i18n";

const container = document.getElementById("root");
const root = createRoot(container);

// Render once the visitor's language is loaded (English/Portuguese are lazy
// chunks), so the page doesn't flash in Spanish first. A failed load still
// renders with the Spanish fallback.
i18nReady.finally(() => {
  root.render(
    <React.StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
});
