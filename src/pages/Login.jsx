import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // nanti di sini sambung ke API Laravel
    console.log({ email, password, remember });
  };

  return (
    <AuthCard
      title="Welcome Back!"
      footer={
        <p className="auth-footer-text">
          Apakah anda tidak memiliki akun?{" "}
          <Link to="/register" className="auth-link">
            Daftar disini
          </Link>
        </p>
      }
    >
      {/* 👇 INI YANG DI DALAM CARD, FORM-NYA */}
      <form className="auth-form" onSubmit={handleSubmit}>
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
            Ingat saya
          </label>

          <button
            type="button"
            className="auth-link-button"
            onClick={() => alert("Fitur lupa password nanti ya :b")}
          >
            Lupa password?
          </button>
        </div>

        <button type="submit" className="auth-button primary">
          LOGIN
        </button>
      </form>
    </AuthCard>
  );
}
