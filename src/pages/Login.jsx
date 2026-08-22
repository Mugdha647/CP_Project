function Login() {
  return (
    <div className="page">

      <h1>Login</h1>

      <form>

        <input
          type="email"
          placeholder="Enter email"
        />

        <input
          type="password"
          placeholder="Enter password"
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;