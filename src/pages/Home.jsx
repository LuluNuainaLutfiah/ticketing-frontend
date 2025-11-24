export default function Home() {
  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* HERO */}
        <section className="hero">
          <div>
            <h1 className="hero-text-title">Welcome To IT Helpdesk!</h1>
            <p className="hero-text-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
              ante ipsum primis in faucibus orci luctus et ultrices posuere
              cubilia curae; Curabitur congue, velit sit amet convallis
              faucibus, neque erat euismod erat, sit amet tincidunt justo sapien
              nec lectus. Praesent gravida orci nec orci accumsan, ut porttitor
              nulla porttitor.
            </p>
            <button className="hero-cta-btn">
              Get Started
            </button>
          </div>

          <div className="hero-right">
            <div className="hero-right-box">
              <div className="hero-right-text">
                Butuh
                <br />
                Bantuan
                <br />
                IT?
              </div>
              {/* Placeholder karakter */}
              <div className="hero-character">
                {/* di sini nanti bisa diganti ilustrasi SVG/PNG */}
              </div>
            </div>
          </div>
        </section>

        {/* INFO CARDS */}
        <section className="info-cards">
          <article className="info-card">
            <div className="info-card-badge green" />
            <p className="info-card-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae. Curabitur congue, velit sit amet convallis
              faucibus, neque erat euismod erat, sit amet tincidunt justo sapien
              nec lectus.
            </p>
          </article>

          <article className="info-card">
            <div className="info-card-badge blue" />
            <p className="info-card-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
              ante ipsum primis in faucibus orci luctus et ultrices posuere
              cubilia curae. Curabitur congue, velit sit amet convallis
              faucibus, neque erat euismod erat, sit amet tincidunt justo sapien
              nec lectus.
            </p>
          </article>

          <article className="info-card">
            <div className="info-card-badge red" />
            <p className="info-card-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
              ante ipsum primis in faucibus orci luctus et ultrices posuere
              cubilia curae. Curabitur congue, velit sit amet convallis
              faucibus, neque erat euismod erat, sit amet tincidunt justo sapien
              nec lectus.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
