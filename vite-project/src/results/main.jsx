// my-extension/results/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import ResultsPage from "./results";
import "../styles/index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ResultsPage />
  </React.StrictMode>
);
