import { Link, useNavigate } from "react-router-dom";
import {
    FaLayout,
    FaUsers,
    FaBriefcase,
    FaHome,
    FaTags,
    FaCalendarAlt,
    FaCreditCard,
    FaStar,
    FaSignOutAlt
} from "react-icons/fa";

function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    return (
        <div
            className="bg-dark text-white p-3 d-flex flex-column"
            style={{
                width: "250px",
                minHeight: "100vh",
                boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
            }}
        >
            <div className="text-center mb-4 py-2 border-bottom border-secondary">
                <h4 className="fw-bold text-success mb-1">BookMyPlay</h4>
                <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: "1px" }}>Admin Panel</span>
            </div>

            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/dashboard">
                        📊 Dashboard
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/profile">
                        👤 My Profile
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/users">
                        👥 Manage Users
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/vendors">
                        💼 Manage Vendors
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/venues">
                        Stadium Manage Venues
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/categories">
                        🏷️ Manage Categories
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/bookings">
                        📅 Manage Bookings
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/payments">
                        💳 Manage Payments
                    </Link>
                </li>

                <li className="nav-item mb-2">
                    <Link className="nav-link text-white d-flex align-items-center gap-2" to="/admin/reviews">
                        ⭐ Manage Reviews
                    </Link>
                </li>
            </ul>

            <div className="pt-2 border-top border-secondary">
                <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill py-2"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
}

export default AdminSidebar;