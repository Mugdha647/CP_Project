import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      alert("Please fill in all fields");
      return;
    }

    // Later we will connect this to our Express + MongoDB backend
    console.log("Email:", email);
    console.log("Password:", password);

    alert("Login successful!");
  };

  return (
    <div className="login-page">

      <div className="login-box">

        <h1>CP-Master</h1>

        <h2>Welcome Back!</h2>

        <p className="login-subtitle">
          Login to continue your coding journey
        </p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Remember + Forgot */}
          <div className="login-options">

            <a href="#">Forgot password?</a>

          </div>

          {/* Login button */}
          <button type="submit" className="login-button">
            Login
          </button>

        </form>

        <p className="signup-text">
          Don't have an account?
          <a href="/signup"> Sign up</a>
        </p>

      </div>

    </div>
  );
}

export default Login;