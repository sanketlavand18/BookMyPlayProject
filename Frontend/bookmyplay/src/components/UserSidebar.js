import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaFutbol
} from "react-icons/fa";

function UserSidebar() {

  return (

    <div
      className="bg-dark text-white p-3"
      style={{
        width: "250px",
        minHeight: "100vh"
      }}
    >

      <h4 className="mb-4">
        Dashboard
      </h4>

      <NavLink
        to="/user"
        className="d-block text-white mb-3 text-decoration-none"
      >
        <FaHome className="me-2" />
        Dashboard
      </NavLink>

      <NavLink
        to="/"
        className="d-block text-white mb-3 text-decoration-none"
      >
        <FaFutbol className="me-2" />
        Browse Venues
      </NavLink>

      <NavLink
        to="/mybookings"
        className="d-block text-white mb-3 text-decoration-none"
      >
        <FaCalendarAlt className="me-2" />
        My Bookings
      </NavLink>

      <NavLink
        to="/reviews"
        className="d-block text-white mb-3 text-decoration-none"
      >
        <FaStar className="me-2" />
        Reviews
      </NavLink>

      <NavLink
        to="/profile"
        className="d-block text-white text-decoration-none"
      >
        <FaUser className="me-2" />
        Profile
      </NavLink>

    </div>

  );

}

export default UserSidebar;