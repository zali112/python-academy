import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/index.css";
import { useSettingsStore } from "@/store/settingsStore";

const settings = useSettingsStore.getState();
settings.applyTheme();

// BASE_URL подставляется Vite из `base` (см. vite.config.ts): "/" локально
// и "/<repo>/" на GitHub Pages — без этого маршруты ломаются на Pages.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
