import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />          {/* halaman awal */}
      <Route path="/login" element={<Login />} />    {/* login */}
      <Route path="/register" element={<Register />} /> {/* register */}
    </Routes>
  );
}
