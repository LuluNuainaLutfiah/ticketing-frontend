import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import "../styles/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await login({
        email: form.email,
        password: form.password,
      });

      // ---- Normalisasi response (biar aman kalau backend beda format)
      const token =
        data.token ||
        data.access_token ||
        data.data?.token ||
        data.data?.access_token;

      const user = data.user || data.data?.user || data.data || null;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      const role =
        user?.role || user?.level || (user?.is_admin ? "admin" : "user");

      if (role === "admin") navigate("/admin");
      else navigate("/user");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          "Login gagal. Periksa email & password kamu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo-wrapper">
            <div className="auth-logo" />
          </div>

          <div className="auth-title-centered">Welcome Back !</div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="auth-input"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-row-between">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                Ingat saya
              </label>

              {/* kalau belum ada fitur lupa password, mending nonaktif dulu */}
              <button
                type="button"
                className="auth-link-small"
                onClick={() => alert("Fitur lupa password belum tersedia")}
              >
                Lupa password?
              </button>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "LOGIN"}
            </button>
          </form>

          <div className="auth-bottom-box">
            Apakah anda tidak memiliki akun?{" "}
            <Link to="/register">Register disini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
