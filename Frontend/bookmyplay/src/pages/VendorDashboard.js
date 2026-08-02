import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getVenuesByVendor } from "../services/venueService";
import { getVendorStats } from "../services/vendorService";
import axios from "axios";
import VendorSidebar from "../components/VendorSidebar";
import VendorNavbar from "../components/VendorNavbar";
import {
    FaBuilding, FaCalendarCheck, FaRupeeSign, FaChartLine, FaStar,
    FaCreditCard, FaHourglassHalf, FaTimesCircle, FaCheckCircle,
    FaCalendarDay, FaPlus, FaEye, FaDownload, FaSpinner
} from "react-icons/fa";

function VendorDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [venues, setVenues] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [subActive, setSubActive] = useState(true);
    const [subStatus, setSubStatus] = useState("ACTIVE");
    const [subDetails, setSubDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [stats, setStats] = useState({
        totalVenues: 0,
        totalBookings: 0,
        totalEarnings: 0,
        upcomingBookings: 0
    });

    useEffect(() => {
        if (user.id) {
            loadAllData();
        } else {
            navigate("/login");
        }
    }, [user.id]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load venues
            const venueRes = await getVenuesByVendor(user.id);
            const myVenues = venueRes.data || [];
            setVenues(myVenues);

            // Load bookings
            const bookingRes = await axios.get(`http://localhost:8080/api/bookings/vendor/${user.id}`);
            const myBookings = bookingRes.data || [];
            setBookings(myBookings);

            // Load stats
            const statsRes = await getVendorStats(user.id);
            setStats(statsRes.data || {
                totalVenues: 0,
                totalBookings: 0,
                totalEarnings: 0,
                upcomingBookings: 0
            });

            // Load subscription
            const subRes = await axios.get(`http://localhost:8080/api/subscriptions/vendor/${user.id}`);
            setSubActive(subRes.data.active);
            setSubStatus(subRes.data.status || "ACTIVE");
            setSubDetails(subRes.data);

            // Load reviews dynamically for all venues
            const tempReviews = [];
            await Promise.all(
                myVenues.map(async (venue) => {
                    try {
                        const reviewRes = await axios.get(`http://localhost:8080/api/reviews/${venue.id}`);
                        tempReviews.push(...(reviewRes.data || []).map(r => ({ ...r, venueName: venue.venueName })));
                    } catch (e) {
                        console.error(e);
                    }
                })
            );
            setReviews(tempReviews);

            // Load unread notifications
            const notifRes = await axios.get(`http://localhost:8080/api/notifications/unread/${user.id}`);
            setNotifications(notifRes.data || []);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Statistics
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const todayBookingsCount = bookings.filter(b => b.bookingDate === todayStr).length;
    const completedBookingsCount = bookings.filter(b => b.bookingStatus === "COMPLETED").length;
    const cancelledBookingsCount = bookings.filter(b => b.bookingStatus === "CANCELLED").length;
    const pendingBookingsCount = bookings.filter(b => b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED").length;

    const monthlyEarnings = bookings
        .filter(b => {
            const bd = new Date(b.bookingDate);
            return bd.getMonth() === currentMonth && bd.getFullYear() === currentYear &&
                   (b.paymentStatus === "SUCCESS" || b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED");
        })
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "N/A";

    // Chart monthly calculation
    const getMonthlyChartData = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenue = Array(12).fill(0);
        const volume = Array(12).fill(0);

        bookings.forEach(b => {
            const bd = new Date(b.bookingDate);
            if (bd.getFullYear() === currentYear) {
                const mIdx = bd.getMonth();
                volume[mIdx]++;
                if (b.paymentStatus === "SUCCESS" || b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED") {
                    revenue[mIdx] += b.totalPrice || 0;
                }
            }
        });

        return months.map((m, i) => ({ month: m, revenue: revenue[i], volume: volume[i] }));
    };

    const monthlyChartData = getMonthlyChartData();
    const maxRev = Math.max(...monthlyChartData.map(d => d.revenue), 1000);
    const maxVol = Math.max(...monthlyChartData.map(d => d.volume), 1);

    // CSV report downloader
    const downloadReport = () => {
        if (bookings.length === 0) {
            alert("No booking records to export.");
            return;
        }
        const headers = "Booking ID,Customer,VenueName,BookingDate,TotalPrice,BookingStatus,PaymentStatus\n";
        const rows = bookings.map(b => 
            `#BMP-${b.id},"${b.customerName || b.userName || "N/A"}","${b.venueName || "N/A"}",${b.bookingDate},₹${b.totalPrice},${b.bookingStatus},${b.paymentStatus || "PENDING"}`
        ).join("\n");

        const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BookMyPlay_Vendor_Report_${todayStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-2 p-0">
                    <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
                </div>

                {/* Content Area */}
                <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
                    <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                    
                    <div className="px-4 pb-4">
                        {/* Subscription Alert Banners */}
                        {subStatus === "EXPIRED" && (
                            <div className="alert alert-danger shadow-sm rounded-4 mb-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>⚠️ Trial Expired:</strong> Your free trial has expired. Purchase a subscription plan to continue publishing your venues.
                                </div>
                                <Link to="/vendor/subscription" className="btn btn-danger btn-sm rounded-pill px-4 fw-bold">
                                    Renew / Upgrade
                                </Link>
                            </div>
                        )}
                        {subStatus === "ACTIVE" && subDetails.daysRemaining !== undefined && subDetails.daysRemaining <= 7 && (
                            <div className="alert alert-warning shadow-sm rounded-4 mb-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>⚠️ Expiry Approaching:</strong> Your subscription has only {subDetails.daysRemaining} days remaining. Upgrade or renew soon to avoid service interruption!
                                </div>
                                <Link to="/vendor/subscription" className="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-dark">
                                    Upgrade / Renew
                                </Link>
                            </div>
                        )}

                        {/* Title Section */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="fw-bold mb-0 text-dark">🚀 Control Dashboard</h2>
                                <p className="text-muted mb-0">Overview of turf operations, booking ratios, and monthly earnings metrics.</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <FaSpinner className="spinner-border text-success fs-2" role="status" />
                                <h5 className="mt-3 text-muted">Refreshing metrics...</h5>
                            </div>
                        ) : (
                            <>
                                {/* 10 Grid Stats Cards */}
                                <div className="row g-3 mb-4">
                                    {/* 1 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaBuilding /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Total Venues</h6>
                                                    <h3 className="card-title mb-0 fw-bold">{stats.totalVenues}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 2 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaCalendarDay /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Today's Bookings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">{todayBookingsCount}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 3 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaCalendarCheck /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Upcoming Bookings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">{stats.upcomingBookings}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 4 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaCheckCircle /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Completed Bookings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">{completedBookingsCount}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 5 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaTimesCircle /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Cancelled Bookings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">{cancelledBookingsCount}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 6 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaHourglassHalf /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Pending Bookings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">{pendingBookingsCount}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 7 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #10b981, #047857)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaRupeeSign /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Total Earnings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">₹{parseFloat(stats.totalEarnings || 0).toLocaleString()}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 8 */}
                                    <div className="col-md-3">
                                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #5b21b6)" }}>
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 opacity-75"><FaChartLine /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-white-50 small text-uppercase fw-bold">Monthly Earnings</h6>
                                                    <h3 className="card-title mb-0 fw-bold">₹{monthlyEarnings.toLocaleString()}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 9 */}
                                    <div className="col-md-3 col-sm-6">
                                        <div className="card border-0 shadow-sm bg-white border-start border-warning border-4">
                                            <div className="card-body py-3 d-flex align-items-center">
                                                <div className="fs-2 me-3 text-warning"><FaStar /></div>
                                                <div>
                                                    <h6 className="card-subtitle mb-0 text-secondary small text-uppercase fw-bold">Avg Rating</h6>
                                                    <h3 className="card-title mb-0 fw-bold text-dark">{averageRating}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 10 */}
                                    <div className="col-md-3 col-sm-6">
                                        <div className="card border-0 shadow-sm bg-white border-start border-success border-4 h-100">
                                            <div className="card-body py-3 d-flex flex-column justify-content-between">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="fs-3 me-2 text-success"><FaCreditCard /></div>
                                                    <div>
                                                        <h6 className="card-subtitle mb-0 text-secondary small text-uppercase fw-bold">Active Plan</h6>
                                                        <h5 className="card-title mb-0 fw-bold text-dark text-uppercase" style={{ fontSize: "0.95rem" }}>
                                                            {subDetails.planName || "Free Trial"}
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className="small text-muted mb-2">
                                                    <div><strong>Status:</strong> <span className={`badge ${subStatus === "ACTIVE" ? "bg-success" : "bg-danger"}`}>{subStatus}</span></div>
                                                    <div><strong>Expires:</strong> {subDetails.expiryDate || "N/A"}</div>
                                                    <div><strong>Days Left:</strong> {subDetails.daysRemaining !== undefined ? subDetails.daysRemaining : 0} Days</div>
                                                </div>
                                                {(subStatus === "EXPIRED" || (subDetails.daysRemaining !== undefined && subDetails.daysRemaining <= 7)) && (
                                                    <Link to="/vendor/subscription" className="btn btn-warning btn-xs w-100 py-1 text-dark fw-bold rounded-pill text-center text-decoration-none" style={{ fontSize: "0.75rem" }}>
                                                        Upgrade / Renew
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics Charts & Quick Actions Row */}
                                <div className="row g-4 mb-4">
                                    {/* Revenue Chart */}
                                    <div className="col-lg-8">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                            <h5 className="fw-bold text-dark mb-4">Revenue & Bookings Trend (Current Year)</h5>
                                            <div style={{ height: "230px" }}>
                                                <svg width="100%" height="100%" viewBox="0 0 800 230" preserveAspectRatio="none">
                                                    {/* Grid Lines */}
                                                    <line x1="40" y1="30" x2="760" y2="30" stroke="#f1f5f9" />
                                                    <line x1="40" y1="100" x2="760" y2="100" stroke="#f1f5f9" />
                                                    <line x1="40" y1="170" x2="760" y2="170" stroke="#e2e8f0" strokeWidth="2" />

                                                    {/* Area Graph under Revenue */}
                                                    <path
                                                        d={`M 40 170 ` + monthlyChartData.map((d, idx) => {
                                                            const x = 40 + (idx * 720) / 11;
                                                            const y = 170 - (d.revenue / maxRev) * 120;
                                                            return `L ${x} ${y}`;
                                                        }).join(" ") + ` L 760 170 Z`}
                                                        fill="rgba(16, 185, 129, 0.15)"
                                                    />

                                                    {/* Line Graph */}
                                                    <path
                                                        d={monthlyChartData.map((d, idx) => {
                                                            const x = 40 + (idx * 720) / 11;
                                                            const y = 170 - (d.revenue / maxRev) * 120;
                                                            return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                                                        }).join(" ")}
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="3"
                                                    />

                                                    {/* Volume Bars */}
                                                    {monthlyChartData.map((d, idx) => {
                                                        const x = 40 + (idx * 720) / 11;
                                                        const y = 170 - (d.revenue / maxRev) * 120;
                                                        return (
                                                            <g key={idx}>
                                                                <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                                                                <text x={x} y="190" fill="#64748b" fontSize="10" textAnchor="middle">{d.month}</text>
                                                            </g>
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions Panel */}
                                    <div className="col-lg-4">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="fw-bold text-dark mb-3">⚡ Quick Console Actions</h5>
                                                <p className="text-muted small">Access frequently used settings, registration forms, and reports.</p>
                                            </div>

                                            <div className="d-flex flex-column gap-2 mt-3">
                                                <Link to="/vendor/add" className={`btn btn-outline-success text-start py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 ${!subActive ? "disabled opacity-50" : ""}`}>
                                                    <FaPlus /> Register New Venue
                                                </Link>
                                                <Link to="/vendor/venues" className="btn btn-outline-primary text-start py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2">
                                                    <FaBuilding /> Manage Turf & Slots
                                                </Link>
                                                <Link to="/vendor/bookings" className="btn btn-outline-dark text-start py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2">
                                                    <FaCalendarCheck /> Inspect Venue Bookings
                                                </Link>
                                                <Link to="/vendor/subscription" className="btn btn-outline-warning text-start py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 text-dark">
                                                    <FaCreditCard /> Membership Billing
                                                </Link>
                                                <button onClick={downloadReport} className="btn btn-success text-white py-2.5 rounded-pill fw-bold mt-2 d-flex align-items-center justify-content-center gap-2">
                                                    <FaDownload /> Download Booking CSV
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activities row */}
                                <div className="row g-4">
                                    {/* Recent Bookings */}
                                    <div className="col-md-7">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="fw-bold text-dark mb-0">Recent Arena Bookings</h5>
                                                <Link to="/vendor/bookings" className="small text-success text-decoration-none fw-bold">View All</Link>
                                            </div>

                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="small py-2 px-3">Booking ID</th>
                                                            <th className="small py-2">Customer</th>
                                                            <th className="small py-2">Venue</th>
                                                            <th className="small py-2">Fees</th>
                                                            <th className="small py-2">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bookings.slice(0, 4).length === 0 ? (
                                                            <tr>
                                                                <td colSpan="5" className="text-center text-muted small py-4">No recent bookings.</td>
                                                            </tr>
                                                        ) : (
                                                            bookings.slice(0, 4).map((b) => (
                                                                <tr key={b.id} style={{ fontSize: "0.85rem" }}>
                                                                    <td className="px-3 fw-semibold">#BMP-{b.id}</td>
                                                                    <td className="fw-bold">{b.customerName || b.userName || "Customer"}</td>
                                                                    <td className="text-truncate" style={{ maxWidth: "120px" }}>{b.venueName}</td>
                                                                    <td className="fw-bold text-success">₹{b.totalPrice}</td>
                                                                    <td>
                                                                        <span className={`badge px-2 py-1 text-uppercase ${b.bookingStatus === "CONFIRMED" ? "bg-success" : b.bookingStatus === "COMPLETED" ? "bg-primary" : "bg-danger"}`} style={{ fontSize: "0.7rem" }}>
                                                                            {b.bookingStatus}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Alerts & Reviews */}
                                    <div className="col-md-5">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="fw-bold text-dark mb-0">Recent Alerts</h5>
                                                <Link to="/vendor/notifications" className="small text-success text-decoration-none fw-bold">Open inbox</Link>
                                            </div>

                                            <div className="d-flex flex-column gap-2">
                                                {notifications.slice(0, 3).length === 0 ? (
                                                    <span className="text-muted small text-center py-3">No unread alerts.</span>
                                                ) : (
                                                    notifications.slice(0, 3).map((n) => (
                                                        <div key={n.id} className="p-2.5 rounded bg-light border-start border-success border-3 d-flex align-items-center justify-content-between" style={{ fontSize: "0.82rem" }}>
                                                            <div>
                                                                <strong className="text-dark d-block">{n.title}</strong>
                                                                <span className="text-secondary text-truncate d-block" style={{ maxWidth: "250px" }}>{n.message}</span>
                                                            </div>
                                                            <Link to="/vendor/notifications" className="text-muted p-1"><FaEye /></Link>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="fw-bold text-dark mb-0">Latest Star Feedback</h5>
                                                <Link to="/vendor/reviews" className="small text-success text-decoration-none fw-bold">All reviews</Link>
                                            </div>

                                            <div className="d-flex flex-column gap-2">
                                                {reviews.slice(0, 2).length === 0 ? (
                                                    <span className="text-muted small text-center py-3">No reviews submitted yet.</span>
                                                ) : (
                                                    reviews.slice(0, 2).map((r) => (
                                                        <div key={r.id} className="p-2.5 rounded bg-light" style={{ fontSize: "0.82rem" }}>
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span className="fw-bold text-dark">{r.user?.fullName || r.userName || "Customer"}</span>
                                                                <span className="text-warning fw-bold"><FaStar className="me-1" />{r.rating}</span>
                                                            </div>
                                                            <p className="mb-0 text-secondary text-truncate" style={{ fontStyle: "italic" }}>"{r.comment || "No text review."}"</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorDashboard;
