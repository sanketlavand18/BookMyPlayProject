import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../services/notificationService";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import { FaBell, FaCheck, FaTrash, FaSpinner, FaInfoCircle, FaCalendarCheck } from "react-icons/fa";

function UserNotifications() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user.id) {
      navigate("/login");
    } else {
      loadNotifications();
    }
  }, [user.id]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(user.id);
      // Sort: unread first, then chronologically newest first
      const sorted = (res.data || []).sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        return b.id - a.id;
      });
      setNotifications(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(user.id);
      loadNotifications();
      alert("All notifications marked as read!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    const t = String(type).toUpperCase();
    if (t.includes("BOOKING") || t.includes("CONFIRM") || t.includes("CANCEL")) {
      return <div className="bg-success-subtle text-success p-3 rounded-circle"><FaCalendarCheck className="fs-4" /></div>;
    }
    return <div className="bg-info-subtle text-info p-3 rounded-circle"><FaInfoCircle className="fs-4" /></div>;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <UserSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <UserNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="px-4 pb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0 text-dark">🔔 System Alerts & Notifications</h2>
                <p className="text-muted mb-0">Stay updated with venue bookings, slots confirmations, and cancellation updates.</p>
              </div>

              {notifications.length > 0 && (
                <button className="btn btn-outline-success px-4 rounded-pill fw-semibold shadow-sm bg-white" onClick={handleMarkAll}>
                  <FaCheck className="me-2" /> Mark All Read
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <FaBell className="fs-1 text-muted opacity-30 mb-3" />
                <h5 className="text-muted">Inbox is completely clean!</h5>
                <p className="small text-muted mb-0">We will notify you here when slot bookings are processed.</p>
              </div>
            ) : (
              <div className="row g-3">
                {notifications.map((n) => (
                  <div className="col-12" key={n.id}>
                    <div className={`card border-0 shadow-sm rounded-4 p-4 bg-white position-relative border-start border-4 ${n.isRead ? "border-secondary" : "border-success animate-border-pulse"}`}>
                      <div className="d-flex align-items-start gap-3 flex-column flex-sm-row">
                        {getIcon(n.type)}
                        
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                              <h5 className={`fw-bold mb-1 ${n.isRead ? "text-secondary" : "text-dark"}`}>
                                {n.title} {!n.isRead && <span className="badge bg-danger small ms-2" style={{ fontSize: "0.6rem" }}>NEW</span>}
                              </h5>
                              <p className="text-secondary small mb-2">{n.message}</p>
                            </div>
                            <span className="small text-muted">{n.createdAt ? new Date(n.createdAt).toLocaleString() : "Recent"}</span>
                          </div>

                          <div className="d-flex justify-content-end gap-2 border-top pt-2 mt-2">
                            {!n.isRead && (
                              <button className="btn btn-link text-decoration-none btn-sm fw-semibold text-success p-0 me-3" onClick={() => handleMarkRead(n.id)}>
                                <FaCheck className="me-1" /> Mark Read
                              </button>
                            )}
                            <button className="btn btn-link text-decoration-none btn-sm fw-semibold text-danger p-0" onClick={() => handleDelete(n.id)}>
                              <FaTrash className="me-1" /> Clear Alert
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserNotifications;
