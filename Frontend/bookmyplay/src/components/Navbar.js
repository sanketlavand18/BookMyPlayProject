import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container">

        {/* Logo */}
        <Link className="navbar-brand fw-bold fs-3 text-success" to="/">
          BookMyPlay
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">

          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/booking">Booking</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>

            <li className="nav-item">
    <Link className="nav-link" to="/mybookings">
        My Bookings
    </Link>
</li>

          </ul>

          <div className="ms-3">
            <Link to="/login" className="btn btn-outline-light me-2">
              Login
            </Link>

            <Link to="/register" className="btn btn-success">
              Register
            </Link>
          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;