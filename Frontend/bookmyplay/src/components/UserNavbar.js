import { useNavigate } from "react-router-dom";

function UserNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow">
      <div className="container-fluid">

        <span className="navbar-brand fw-bold fs-4">
          BookMyPlay
        </span>

        <div className="d-flex align-items-center">

          <span className="text-white me-3">
            Welcome, {user?.fullName}
          </span>

          <button
            className="btn btn-light"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

export default UserNavbar;