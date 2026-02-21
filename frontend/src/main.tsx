import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { ThemeProvider } from "./app/components/theme-provider";
import { Toaster } from "sonner";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </React.StrictMode>
);
