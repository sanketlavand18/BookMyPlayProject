import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaCircle, FaUserCircle, FaUser, FaLock, FaSignOutAlt, FaCog } from "react-icons/fa";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "../services/notificationService";

function AdminNavbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(JSON.parse(localStorage.getItem("user")) || {});
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

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

  const handleLogout = async () => {
    localStorage.removeItem("user");
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
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom shadow-sm mb-4 px-4 py-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        {/* Left Side title */}
        <h4 className="fw-bold text-dark mb-0">System Control</h4>

        {/* Right Side Tools */}
        <div className="d-flex align-items-center gap-3">
          
          {/* Notification Bell */}
          <div className="dropdown">
            <button
              className="btn btn-link text-secondary position-relative p-2 shadow-none border-0"
              id="adminNotificationDropdown"
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
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 py-2 mt-2" aria-labelledby="adminNotificationDropdown" style={{ width: "300px", maxHeight: "400px", overflowY: "auto" }}>
              <div className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom">
                <span className="fw-bold text-dark small">Admin Alerts</span>
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

          <div className="d-flex align-items-center gap-2 text-dark">
            {currentUser.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="Admin"
                className="rounded-circle border"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
              />
            ) : (
              <FaUserCircle className="fs-4 text-secondary" />
            )}
            <span className="fw-semibold small">Welcome, {currentUser.fullName || "Admin"}</span>
          </div>

        </div>

      </div>
    </nav>
  );
}

export default AdminNavbar;