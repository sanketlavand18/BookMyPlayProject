import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBell, FaCircle, FaUserCircle, FaBars } from "react-icons/fa";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

function VendorNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const { user: currentUser = {} } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser.id) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser.id]);

  const loadNotifications = async () => {
    try {
      const response = await getUnreadNotifications(currentUser.id);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom shadow-sm mb-4 px-4 py-3 sticky-top">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        {/* Left Side: Sidebar Toggle (mobile only), Vendor Console text, About, Contact */}
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-light d-md-none p-2 border shadow-none"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <FaBars className="fs-5 text-secondary" />
          </button>
          
          <h4 className="fw-bold text-dark mb-0">Vendor Console</h4>
          
          <Link 
            to="/vendor/about" 
            className={`nav-link py-1 px-2 rounded-3 text-decoration-none fw-semibold small ${
              isActive("/vendor/about") 
                ? "text-success fw-bold bg-light" 
                : "text-secondary"
            }`}
          >
            About
          </Link>
          <Link 
            to="/vendor/contact" 
            className={`nav-link py-1 px-2 rounded-3 text-decoration-none fw-semibold small ${
              isActive("/vendor/contact") 
                ? "text-success fw-bold bg-light" 
                : "text-secondary"
            }`}
          >
            Contact
          </Link>
        </div>

        {/* Right Side Tools */}
        <div className="d-flex align-items-center gap-3">
          
          {/* Notification Bell */}
          <div className="dropdown">
            <button
              className="btn btn-link text-secondary position-relative p-2 shadow-none border-0"
              id="vendorNotificationDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaBell className="fs-5" />
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.55rem" }}>
                  {notifications.length}
                </span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 py-2 mt-2" aria-labelledby="vendorNotificationDropdown" style={{ width: "300px", maxHeight: "400px", overflowY: "auto" }}>
              <div className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom">
                <span className="fw-bold text-dark small">Vendor Alerts</span>
                {notifications.length > 0 && (
                  <button onClick={handleMarkAllRead} className="btn btn-link btn-xs text-decoration-none p-0 text-primary fw-semibold small" style={{ fontSize: "0.7rem" }}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <li className="px-3 py-3 text-center text-muted small">No unread alerts</li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id} className="dropdown-item px-3 py-2 border-bottom cursor-pointer" onClick={() => handleNotificationClick(n.id)}>
                    <div className="d-flex align-items-start gap-2">
                      <FaCircle className="text-danger mt-1 flex-shrink-0" style={{ fontSize: "0.45rem" }} />
                      <div>
                        <strong className="d-block text-dark small" style={{ whiteSpace: "normal" }}>{n.title}</strong>
                        <p className="mb-0 text-muted small" style={{ fontSize: "0.7rem", whiteSpace: "normal" }}>{n.message}</p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Vendor Profile Welcome Details (Static) */}
          <div className="d-flex align-items-center gap-2 ms-2 flex-shrink-0">
            {currentUser.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="Vendor"
                className="rounded-circle border"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
              />
            ) : (
              <FaUserCircle className="fs-4 text-secondary" />
            )}
            <span className="fw-semibold small text-dark d-none d-md-inline">Welcome, {currentUser.fullName || "Vendor"}</span>
          </div>

        </div>

      </div>
    </nav>
  );
}

export default VendorNavbar;
