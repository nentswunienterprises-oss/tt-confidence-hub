import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

console.log("main.tsx executing...");

// Normalize direct URL visits for HashRouter.
// This lets links like /td/landing resolve to /#/td/landing instead of falling back to /.
if (typeof window !== "undefined") {
  const { pathname, search, hash } = window.location;
  const hasAppHashRoute = hash.startsWith("#/");
  const isRootPath = pathname === "/" || pathname === "/index.html";

  if (!hasAppHashRoute && !isRootPath) {
    const normalizedPath = pathname === "/index.html" ? "/" : pathname;
    const nextUrl = `/#${normalizedPath}${search}`;
    window.location.replace(nextUrl);
  }
}

// Get the root element
const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

// Hide the loader
const loader = document.getElementById("root-loader");
console.log("Loader element:", loader);
if (loader) {
  loader.remove(); // Remove instead of just hiding
  console.log("Loader removed");
}

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
  console.log("React app mounted");
} else {
  console.error("Root element not found!");
}
