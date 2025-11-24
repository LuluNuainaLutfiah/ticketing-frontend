import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import "./styles/main.css";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {!isAdminRoute && <Navbar />}

      <main className="app-content">
        <Outlet />
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
