import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-content">

        <div className="footer-brand">
          <h2>
            <span>CP</span> Master
          </h2>

          <p>
            Learn. Practice. Compete. Improve.
          </p>
        </div>


        <div className="footer-links">

          <a href="/">Home</a>

          <a href="/roadmap">Roadmap</a>

          <a href="/contest">Contest</a>

          <a href="/profile">Profile</a>

        </div>

      </div>


      <div className="footer-bottom">

        <p>
          © Mugdha-Mamun (2026)_CP Master. All rights reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;