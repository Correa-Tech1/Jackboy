import React from "react";
import ReactDOM from "react-dom/client";
import AuthGate from "./AuthGate.jsx";

// Registra o Service Worker (base do push com app fechado — próxima sessão).
// Já habilita notificações via SW (mais robustas no Android que new Notification()).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>
);
