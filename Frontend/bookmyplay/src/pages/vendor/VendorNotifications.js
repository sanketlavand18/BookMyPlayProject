import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../services/notificationService";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaBell, FaSpinner, FaCheck, FaTrash, FaInbox, FaCircle } from "react-icons/fa";

function VendorNotifications() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user.id) {
      loadNotifications();
    } else {
      navigate("/login");
    }
  }, [user.id]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getUserNotifications(user.id);
      // Sort newest first
      const sorted = (res.data || []).sort((a,b) => b.id - a.id);
      setNotifications(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user.id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="px-4 pb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0 text-dark">🔔 Notification Center</h2>
                <p className="text-muted mb-0">Stay updated on new bookings, reviews, and membership renewals.</p>
              </div>

              {unreadCount > 0 && (
                <button className="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold bg-white shadow-sm" onClick={handleMarkAllRead}>
                  <FaCheck className="me-1 mb-1" /> Mark All as Read
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                {notifications.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <FaInbox className="fs-1 mb-3 text-secondary opacity-50" />
                    <h5>No notifications found.</h5>
                    <p className="small text-muted">We will alert you here when new bookings or feedback come in.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-4 border d-flex justify-content-between align-items-center transition-all ${
                          !n.isRead ? "bg-success-subtle border-success-subtle shadow-sm" : "bg-light border-light"
                        }`}
                        style={{ transition: "all 0.2s" }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          {!n.isRead && <FaCircle className="text-danger mt-1.5 flex-shrink-0" style={{ fontSize: "0.5rem" }} />}
                          <div>
                            <h6 className={`mb-1 ${!n.isRead ? "fw-bold text-success-emphasis" : "text-dark fw-semibold"}`}>
                              {n.title}
                            </h6>
                            <p className="text-secondary small mb-0">{n.message}</p>
                            <span className="text-muted small" style={{ fontSize: "0.7rem" }}>
                              {new Date(n.createdAt || n.notificationDate || Date.now()).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          {!n.isRead && (
                            <button 
                              className="btn btn-outline-success btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                              style={{ width: "35px", height: "35px" }}
                              onClick={() => handleMarkRead(n.id)}
                              title="Mark as Read"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{ width: "35px", height: "35px" }}
                            onClick={() => handleDelete(n.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorNotifications;
