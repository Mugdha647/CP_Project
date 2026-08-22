import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>

      <h2>CP Master</h2>

      <div>

        <Link to="/">Home</Link>

        <Link to="/roadmap">Roadmap</Link>

        <Link to="/contest">Contest</Link>

        <Link to="/profile">Profile</Link>

        <Link to="/login">Login</Link>

      </div>

    </nav>
  );
}

export default Navbar;