import { useNavigate, useLocation } from "react-router-dom";
import logoUika from "../../assets/logo-uikaa.png";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const showLoginButton = pathname !== "/login";

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        <div className="navbar-left">
          {/* Placeholder logo bulat hijau */}
          <div className="navbar-logo" />
          <img src={logoUika} alt="logo UIKA" className="brand-logo" />
          <div className="navbar-title">
            <span className="navbar-title-main">Universitas IT Helpdesk</span>
            <span className="navbar-title-sub">technical support portal</span>
          </div>
        </div>

        {showLoginButton && (
          <button
            className="navbar-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
