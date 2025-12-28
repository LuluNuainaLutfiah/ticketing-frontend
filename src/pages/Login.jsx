import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import "../styles/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    let raf = 0;

    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    };

    const onLeave = () => {
      el.style.setProperty("--mx", `50%`);
      el.style.setProperty("--my", `35%`);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

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

      const token =
        data.token ||
        data.access_token ||
        data.data?.token ||
        data.data?.access_token;

      const user = data.user || data.data?.user || data.data || null;

      if (!user) {
        setErrorMsg("Login berhasil, tetapi data pengguna tidak ditemukan.");
        setLoading(false);
        return;
      }

      if (token) {
        localStorage.setItem("token", token);
      }

      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role === "admin" ? "admin" : "user";

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          "Login gagal. Silakan periksa email dan kata sandi Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="auth-page">
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo-wrapper">
            <div className="auth-logo" />
          </div>

          <div className="auth-title-centered">Selamat Datang Kembali!</div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="email">
                Alamat Email
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
                Kata Sandi
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

              <button
                type="button"
                className="auth-link-small"
                onClick={() => alert("Fitur lupa kata sandi belum tersedia")}
              >
                Lupa kata sandi?
              </button>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "MASUK"}
            </button>
          </form>

          <div className="auth-bottom-box">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
