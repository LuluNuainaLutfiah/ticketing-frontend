import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router";

import "./styles/main.css";
import "./styles/login.css";
import "./styles/admin.css";
import "./styles/user-dashboard.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
