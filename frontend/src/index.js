import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./Components/Components/ErrorBoundary";
import { ToastProvider } from "./Components/common/Components/ToastContainer";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);