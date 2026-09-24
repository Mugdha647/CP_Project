import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {

  const navigate = useNavigate();


  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");


  const handleSignup = async (e) => {

    e.preventDefault();


    // Check empty fields

    if (
      username === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === ""
    ) {

      alert("Please fill in all fields");

      return;

    }


    // Check password

    if (password !== confirmPassword) {

      alert("Passwords do not match");

      return;

    }


    if (password.length < 6) {

      alert(
        "Password must be at least 6 characters"
      );

      return;

    }


    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            username: username,

            email: email,

            password: password

          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(data.message);

        return;

      }


      alert("Account created successfully!");


      // Clear fields

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");


      // Go to login

      navigate("/login");

    }

    catch (error) {

      console.error(error);

      alert(
        "Cannot connect to server"
      );

    }

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

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"

              value={username}

              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

          </div>


          <div className="input-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"

              value={email}

              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"

              value={password}

              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>


          <div className="input-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"

              value={confirmPassword}

              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="signup-button"
          >
            Create Account
          </button>


        </form>


        <p className="login-text">

          Already have an account?

          <Link to="/login">
            {" "}Login
          </Link>

        </p>


      </div>

    </div>

  );
}


export default Signup;