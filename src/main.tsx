import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { routerBasename } from "./appBase";
import { StoreProvider } from "./state/storeContext";
import "./styles.css";

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter basename={routerBasename()}>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
