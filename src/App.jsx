import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import "./styles/main.css";

export default function App() {
  const location = useLocation();

  // sembunyikan navbar/footer untuk halaman dashboard (admin & user)
  const hideLayout =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/user");

  return (
    <div className="app">
      {!hideLayout && <Navbar />}

      <main className="app-content">
        <Outlet />
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}
