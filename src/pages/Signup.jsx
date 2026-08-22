import { useState } from "react";
import "./Signup.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (
      username === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Later we will send this data to Express + MongoDB
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);

    alert("Signup successful!");
  };

  return (
    <div className="signup-page">

      <div className="signup-box">

        <h1>CP-Master</h1>

        <h2>Create Account</h2>

        <p className="signup-subtitle">
          Start your competitive programming journey
        </p>

        <form onSubmit={handleSignup}>

          <div className="input-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="signup-button">
            Create Account
          </button>

        </form>

        <p className="login-text">
          Already have an account?
          <a href="/login"> Login</a>
        </p>

      </div>

    </div>
  );
}

export default Signup;