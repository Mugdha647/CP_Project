import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="logo">
        <span>CP</span> Master
      </Link>

      {/* Navigation */}
      <div className="nav-links">

        <Link to="/" className="nav-link">
          Home
        </Link>

        <Link to="/roadmap" className="nav-link">
          Roadmap
        </Link>

        <Link to="/contest" className="nav-link">
          Contest
        </Link>

        <Link to="/profile" className="nav-link">
          Profile
        </Link>

        <Link to="/login" className="login-link">
          Login
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;