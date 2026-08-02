import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../css/Login.css";
import {
    FaChartPie,
    FaUser,
    FaUsers,
    FaStore,
    FaFutbol,
    FaTags,
    FaCalendarCheck,
    FaCreditCard,
    FaMoneyCheckAlt,
    FaClipboardList,
    FaStar,
    FaGift,
    FaCalendarAlt,
    FaCog,
    FaFileExport,
    FaSignOutAlt,
    FaTimes,
    FaInfoCircle
} from "react-icons/fa";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.body.classList.add("admin-layout-active");

        const handleOutsideClick = (e) => {
            if (document.body.classList.contains("admin-sidebar-open")) {
                if (e.clientX > 240) {
                    document.body.classList.remove("admin-sidebar-open");
                }
            }
        };

        window.addEventListener("click", handleOutsideClick);
        return () => {
            document.body.classList.remove("admin-layout-active");
            document.body.classList.remove("admin-sidebar-open");
            window.removeEventListener("click", handleOutsideClick);
        };
    }, []);

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

    const handleClose = () => {
        document.body.classList.remove("admin-sidebar-open");
    };

    const handleLinkClick = () => {
        document.body.classList.remove("admin-sidebar-open");
    };

    const isActive = (path, search = "") => {
        if (search) {
            return location.pathname === path && location.search === search;
        }
        return location.pathname === path && !location.search;
    };

    const menuItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: <FaChartPie /> },
        { path: "/admin/profile", label: "My Profile", icon: <FaUser />, exact: true },
        { path: "/admin/users", label: "Manage Users", icon: <FaUsers /> },
        { path: "/admin/vendors", label: "Manage Vendors", icon: <FaStore /> },
        { path: "/admin/venues", label: "Manage Venues", icon: <FaFutbol /> },
        { path: "/admin/categories", label: "Sports Categories", icon: <FaTags /> },
        { path: "/admin/bookings", label: "Manage Bookings", icon: <FaCalendarCheck /> },
        { path: "/admin/payments", label: "Manage Payments", icon: <FaCreditCard /> },
        { path: "/admin/subscription-payments", label: "Subscription Payments", icon: <FaMoneyCheckAlt /> },
        { path: "/admin/subscriptions", label: "Subscription Plans", icon: <FaClipboardList /> },
        { path: "/admin/reviews", label: "Manage Reviews", icon: <FaStar /> },
        { path: "/admin/coupons", label: "Manage Coupons", icon: <FaGift /> },
        { path: "/admin/calendar", label: "Booking Calendar", icon: <FaCalendarAlt /> },
        { path: "/admin/contact-settings", label: "Contact Page Configuration", icon: <FaCog /> },
        { path: "/admin/about-settings", label: "About Page", icon: <FaInfoCircle /> },
        { path: "/admin/reports", label: "Export Reports", icon: <FaFileExport /> }
    ];

    return (
        <div className="admin-sidebar bg-dark text-white p-3 d-flex flex-column shadow-lg">
            <div className="d-flex justify-content-between align-items-center mb-3 py-2 border-bottom border-secondary position-relative w-100">
                <div className="w-100 d-flex flex-column align-items-center justify-content-center text-center">
                    <div className="d-flex justify-content-center mb-2">
                        <div className="logo-container logo-auth" style={{ width: "80px", height: "80px" }}>
                            <img src={logo} alt="Book My Play" className="app-logo" />
                        </div>
                    </div>
                    <h2 className="login-title mb-1" style={{ fontSize: "1.25rem" }}>BookMyPlay</h2>
                    <span className="login-subtitle text-uppercase fw-semibold" style={{ letterSpacing: "1px", fontSize: "0.65rem", marginBottom: "0px" }}>Admin Panel</span>
                </div>
                <button 
                    className="btn btn-link text-white-50 d-md-none p-0 border-0 shadow-none position-absolute"
                    style={{ right: "10px", top: "10px" }}
                    onClick={handleClose}
                >
                    <FaTimes className="fs-4" />
                </button>
            </div>

            <ul className="nav nav-pills flex-column mb-auto gap-1">
                {menuItems.map((item, idx) => {
                    const active = isActive(item.path, item.search);
                    return (
                        <li key={idx} className="nav-item">
                            <Link 
                                className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-decoration-none ${
                                    active 
                                        ? "bg-success text-white fw-bold shadow-sm" 
                                        : "text-white-50"
                                }`} 
                                to={item.search ? `${item.path}${item.search}` : item.path}
                                onClick={handleLinkClick}
                            >
                                <span className="fs-5 d-flex align-items-center">{item.icon}</span>
                                <span className="small">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="pt-3 border-top border-secondary mt-3">
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
