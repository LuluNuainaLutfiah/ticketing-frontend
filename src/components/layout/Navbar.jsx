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
          <div className="navbar-logo" />
          <img src={logoUika} alt="Logo UIKA" className="brand-logo" />
          <div className="navbar-title">
            <div className="navbar-title-main">
              Universitas Ibn Khaldun – IT Helpdesk
            </div>
            <div className="navbar-title-sub">
              Portal Dukungan Teknis
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
