import BackButton from "./BackButton";
import logo from "../assets/logo.png";

export default function AuthCard({ title, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <BackButton />
        
        <div className="auth-logo-wrapper">
          <img src={logo} alt="Logo" className="auth-logo" />
        </div>

        {title && <h2 className="auth-title">{title}</h2>}

        <div className="auth-body">
          {children}  
        </div>

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}
