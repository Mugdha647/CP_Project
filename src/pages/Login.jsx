import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    if (email === "" || password === "") {
      alert("Please fill in all fields");
      return;
    }


    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

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

      localStorage.setItem(
        "token",
        data.token
      );


      // Save user information

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      alert("Login successful!");


      // Go to home

      if(data.user.role=== "admin"){
        navigate("/admin")
      }else{
        navigate("/")
      }

    }

    catch (error) {

      console.error(error);

      alert(
        "Cannot connect to server"
      );

    }

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


          <div className="login-options">

            <a href="#">
              Forgot password?
            </a>

          </div>


          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

        </form>

        <p className="signup-text">
          Don't have an account?
          <Link to="/signup">
            {" "}Sign up
          </Link>
        </p>


      </div>

    </div>

  );
}


export default Login;