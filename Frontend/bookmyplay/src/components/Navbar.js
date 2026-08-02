import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaCircle, FaUserCircle, FaUser, FaCalendarAlt, FaStar, FaLock, FaSignOutAlt, FaCog } from "react-icons/fa";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const loadNotifications = async () => {
    try {
      const response = await getUnreadNotifications(currentUser.id);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error loading navbar notifications:", error);
    }
  };

  const handleNotificationClick = async (notifId) => {
    try {
      await markAsRead(notifId);
      loadNotifications();
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(currentUser.id);
      loadNotifications();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleLogout = async () => {
    logout();
    await window.Swal.fire({
      icon: "success",
      title: "Logged Out Successfully",
      text: "You have been logged out successfully.",
      showConfirmButton: false,
      timer: 2000
    });
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container">
        
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Book My Play" className="logo-img" />
          <span className="brand-text">BookMyPlay</span>
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
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>

            {currentUser ? (
              <>
                {/* Notification Bell */}
                <li className="nav-item dropdown ms-2">
                  <button
                    className="nav-link btn btn-link border-0 text-white position-relative shadow-none dropdown-toggle-nocaret"
                    id="notificationDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaBell className="fs-5" />
                    {notifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 py-2 mt-2" aria-labelledby="notificationDropdown" style={{ width: "300px", maxHeight: "400px", overflowY: "auto" }}>
                    <div className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom">
                      <span className="fw-bold text-dark small">Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={handleMarkAllRead} className="btn btn-link btn-xs text-decoration-none p-0 text-primary fw-semibold small" style={{ fontSize: "0.75rem" }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <li className="px-3 py-3 text-center text-muted small">No new notifications</li>
                    ) : (
                      notifications.map((n) => (
                        <li key={n.id} className="dropdown-item px-3 py-2 border-bottom cursor-pointer" onClick={() => handleNotificationClick(n.id)}>
                          <div className="d-flex align-items-start gap-2">
                            <FaCircle className="text-primary mt-1 flex-shrink-0" style={{ fontSize: "0.5rem" }} />
                            <div>
                              <strong className="d-block text-dark small" style={{ whiteSpace: "normal" }}>{n.title}</strong>
                              <p className="mb-0 text-muted small" style={{ fontSize: "0.75rem", whiteSpace: "normal" }}>{n.message}</p>
                              <span className="text-secondary small" style={{ fontSize: "0.65rem" }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </li>

                {/* Welcome Dropdown */}
                <li className="nav-item dropdown ms-3">
                  <button
                    className="nav-link btn btn-link border-0 text-white dropdown-toggle shadow-none d-flex align-items-center gap-2 fw-semibold"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {currentUser.profilePicture ? (
                      <img
                        src={currentUser.profilePicture}
                        alt="User"
                        className="rounded-circle border"
                        style={{ width: "24px", height: "24px", objectFit: "cover" }}
                      />
                    ) : (
                      <FaUserCircle className="fs-4 text-light" />
                    )}
                    <span>Welcome, {currentUser.fullName}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 py-2 mt-2" aria-labelledby="profileDropdown" style={{ minWidth: "180px" }}>
                    {currentUser.role === "VENDOR" ? (
                      <>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/vendor/profile">
                            <FaUser className="text-muted" /> Vendor Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/vendor">
                            <FaUserCircle className="text-muted" /> Vendor Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/vendor/bookings">
                            <FaCalendarAlt className="text-muted" /> Turf Bookings
                          </Link>
                        </li>
                      </>
                    ) : currentUser.role === "ADMIN" ? (
                      <>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/admin/profile">
                            <FaUser className="text-muted" /> Admin Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/admin/dashboard">
                            <FaUserCircle className="text-muted" /> Admin Dashboard
                          </Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/user/profile">
                            <FaUser className="text-muted" /> My Profile
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 d-flex align-items-center gap-2 small" to="/user/settings">
                            <FaCog className="text-muted" /> Settings
                          </Link>
                        </li>
                      </>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item py-2 d-flex align-items-center gap-2 small text-danger" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-3">
                  <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                    Login
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link to="/register" className="btn btn-success btn-sm rounded-pill px-3">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;