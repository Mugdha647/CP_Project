function AdminDashboard() {

  const user =
    JSON.parse(localStorage.getItem("user"));

  return (

    <div className="admin-dashboard">

      <h1>Admin Dashboard</h1>

      <p>
        Welcome, {user?.username}
      </p>

      <div className="admin-cards">

        <div className="admin-card">
          <h2>Users</h2>
          <p>Manage registered users</p>
        </div>

        <div className="admin-card">
          <h2>Contests</h2>
          <p>Manage contests</p>
        </div>

        <div className="admin-card">
          <h2>Problems</h2>
          <p>Manage coding problems</p>
        </div>

        <div className="admin-card">
          <h2>Statistics</h2>
          <p>View platform statistics</p>
        </div>

      </div>

    </div>

  );
}

export default AdminDashboard;