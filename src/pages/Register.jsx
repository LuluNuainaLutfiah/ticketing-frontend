// src/pages/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // NANTI: sambung ke API Laravel /api/auth/register
    console.log({
      name,
      email,
      password,
      remember,
    });
  };

  return (
    <AuthCard
      title="Register"
      footer={
        <p className="auth-footer-text">
          Apakah anda memiliki akun?{" "}
          <Link to="/login" className="auth-link">
            Login di sini!
          </Link>
        </p>
      }
    >
      {/* FORM REGISTER ADA DI SINI */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Nama Lengkap
          <input
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Email Address
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="auth-row">
          <label className="auth-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
        </div>

        <button type="submit" className="auth-button primary">
          REGISTER
        </button>
      </form>
    </AuthCard>
  );
}
