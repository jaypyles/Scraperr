import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

const root_doc = document.getElementById("root");

if (root_doc) {
  const root = ReactDOM.createRoot(root_doc);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
