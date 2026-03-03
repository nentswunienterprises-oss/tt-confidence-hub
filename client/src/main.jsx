import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
console.log("main.tsx executing...");
// Get the root element
var rootElement = document.getElementById("root");
console.log("Root element:", rootElement);
// Hide the loader
var loader = document.getElementById("root-loader");
console.log("Loader element:", loader);
if (loader) {
    loader.remove(); // Remove instead of just hiding
    console.log("Loader removed");
}
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>);
    console.log("React app mounted");
}
else {
    console.error("Root element not found!");
}
