import { Link } from 'react-router-dom';
import logo from "../assets/logo-uikaa.png";
// import ilustrasi from "../assets/ilustrasi-hero.png";
import "../styles/home.css";

export default function Home() {
    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-header-left">
                    <img src="{logo}" alt="UIKA" className="home-logo" />
                    <div className="home-brand">
                        <h1>Universitas IT Helpdesk</h1>
                        <span>technical support portal</span>
                    </div>
                </div>

                <div className="home-header-right">
                    <Link to="/login" className="home-login-btn">
                        Login
                    </Link>
                </div>
            </header>

          <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-left">
            <h2>Welcome To IT Helpdesk !</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae. Curabitur congue, velit sit amet convallis
              faucibus, neque erat euismod erat, sit amet tincidunt justo sapien
              nec lectus. Praesent gravida orci nec orci accumsan, ut porttitor
              nulla porttitor.
            </p>

            <Link to="/register" className="home-get-started">
              Get Started
            </Link>
          </div>

          {/* <div className="home-hero-right">
            <img src={ilustrasi} alt="Butuh Bantuan IT?" className="home-hero-img" />
            <h3>Butuh Bantuan IT?</h3>
          </div> */}
        </section>

        {/* TIGA CARD */}
        <section className="home-cards">
          <div className="home-card">
            <div className="home-card-dot dot-green" />
            <h4>Lorem ipsum dolor sit amet, consectetur</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae.
            </p>
          </div>

          <div className="home-card">
            <div className="home-card-dot dot-blue" />
            <h4>Lorem ipsum dolor sit amet, consectetur</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae.
            </p>
          </div>

          <div className="home-card">
            <div className="home-card-dot dot-pink" />
            <h4>Lorem ipsum dolor sit amet, consectetur</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae.
            </p>
          </div>
        </section>
      </main>

            <footer className="home-footer">
                <span>© 2024 Universitas IT. All rights reserved.</span>
            </footer>
        </div>
    );
}