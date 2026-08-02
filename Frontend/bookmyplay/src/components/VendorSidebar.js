import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    FaHome,
    FaUser,
    FaBuilding,
    FaPlus,
    FaCalendarAlt,
    FaHistory,
    FaRupeeSign,
    FaStar,
    FaChartBar,
    FaCreditCard,
    FaBell,
    FaCog,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

function VendorSidebar({ mobileOpen, onCloseSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();

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

    const menuItems = [
        { path: "/vendor", label: "Dashboard", icon: <FaHome /> },
        { path: "/vendor/profile", label: "My Profile", icon: <FaUser /> },
        { path: "/vendor/venues", label: "My Venues", icon: <FaBuilding /> },
        { path: "/vendor/add", label: "Add Venue", icon: <FaPlus /> },
        { path: "/vendor/bookings", label: "Venue Bookings", icon: <FaCalendarAlt /> },
        { path: "/vendor/bookings/history", label: "Booking History", icon: <FaHistory /> },
        { path: "/vendor/earnings", label: "Earnings", icon: <FaRupeeSign /> },
        { path: "/vendor/reviews", label: "Reviews", icon: <FaStar /> },
        { path: "/vendor/analytics", label: "Analytics", icon: <FaChartBar /> },
        { path: "/vendor/subscription", label: "Subscription", icon: <FaCreditCard /> },
        { path: "/vendor/notifications", label: "Notifications", icon: <FaBell /> },
        { path: "/vendor/settings", label: "Settings", icon: <FaCog /> },
    ];

    const sidebarClass = `bg-dark text-white p-3 d-flex flex-column transition-all` + 
        (mobileOpen ? " d-flex" : " d-none d-md-flex");

    const sidebarStyle = {
        width: "250px",
        minHeight: "100vh",
        height: "100vh",
        position: mobileOpen ? "fixed" : "sticky",
        top: 0,
        left: 0,
        zIndex: 1050,
        boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
        overflowY: "auto"
    };

    return (
        <>
            {/* Mobile Sidebar Backdrop Overlay */}
            {mobileOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-black opacity-50 d-md-none" 
                    style={{ zIndex: 1040 }}
                    onClick={onCloseSidebar}
                />
            )}

            <div className={sidebarClass} style={sidebarStyle}>
                {/* Brand Logo Header */}
                <div className="d-flex align-items-center justify-content-between mb-4 py-2 border-bottom border-secondary">
                    <div>
                        <h4 className="fw-bold text-success mb-0">BookMyPlay</h4>
                        <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>
                            Vendor Panel
                        </span>
                    </div>
                    {mobileOpen && (
                        <button className="btn btn-dark btn-sm d-md-none p-1 text-white border-0" onClick={onCloseSidebar}>
                            <FaTimes className="fs-5" />
                        </button>
                    )}
                </div>

                {/* Sidebar Menu Items */}
                <ul className="nav nav-pills flex-column mb-auto gap-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li className="nav-item" key={item.path} onClick={onCloseSidebar}>
                                <Link 
                                    className={`nav-link text-white d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 transition-all ${
                                        isActive ? "bg-success fw-bold active-menu-item" : "opacity-80 hover-bg-secondary"
                                    }`} 
                                    to={item.path}
                                    style={{
                                        transition: "all 0.2s ease-in-out",
                                        background: isActive ? "#198754" : "transparent"
                                    }}
                                    onMouseEnter={(e) => {
                                        if(!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if(!isActive) e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <span className="fs-6 d-flex align-items-center">{item.icon}</span>
                                    <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Sidebar Footer Logout */}
                <div className="pt-3 mt-3 border-top border-secondary">
                    <button
                        onClick={handleLogout}
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill py-2.5 fw-semibold"
                        style={{ fontSize: "0.9rem", transition: "all 0.2s" }}
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
        </>
    );
}

export default VendorSidebar;
