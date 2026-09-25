import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span>CP</span> MASTER
      </Link>

      {/* Navigation */}
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>

        <Link
          to="/roadmap"
          className={`nav-link ${location.pathname === "/roadmap" ? "active" : ""}`}
        >
          Roadmap
        </Link>

        <Link
          to="/contest"
          className={`nav-link ${location.pathname === "/contest" ? "active" : ""}`}
        >
          Contest
        </Link>

        <Link
          to="/profile"
          className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
        >
          Profile
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="nav-link"
            style={{ color: "#ef4444", fontWeight: "700" }}
          >
            ⚙️ Admin
          </Link>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="login-link"
            style={{ border: "none", cursor: "pointer", background: "#374151",fontWeight:"400" }}
          >
            Logout ({user.username})
          </button>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;