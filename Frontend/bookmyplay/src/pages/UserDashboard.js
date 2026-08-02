import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getMyBookings } from "../services/bookingService";
import { getAllVenues } from "../services/venueService";
import UserSidebar from "../components/UserSidebar";
import UserNavbar from "../components/UserNavbar";
import {
    FaCalendarCheck,
    FaCheckCircle,
    FaHeart,
    FaStar,
    FaTimesCircle,
    FaCalendarAlt,
    FaSpinner,
    FaHistory
} from "react-icons/fa";

const popularSports = [
    { name: "Football", icon: "⚽" },
    { name: "Cricket", icon: "🏏" },
    { name: "Tennis", icon: "🎾" },
    { name: "Badminton", icon: "🏸" }
];

const upcomingMatches = [
    { title: "Weekend Friendly Match", time: "Tomorrow, 07:00 PM", arena: "Camp Nou Arena", fee: "Free Entry" },
    { title: "Corporate Football Clash", time: "Aug 5, 08:30 PM", arena: "Bernabeu Pitch", fee: "$15/player" }
];

function UserDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user.id) {
            navigate("/login");
        } else {
            loadDashboardData();
        }
    }, [user.id]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load bookings
            const bookingsRes = await getMyBookings(user.id);
            setBookings(bookingsRes.data || []);

            // Load reviews tally
            try {
                const reviewsRes = await axios.get(`http://localhost:8080/api/reviews/user/${user.id}`);
                setReviewsCount(reviewsRes.data ? reviewsRes.data.length : 0);
            } catch (err) {
                console.error("Error reviews:", err);
            }

            // Load favorites count
            const favs = localStorage.getItem(`bmp_favs_${user.id}`);
            setFavoritesCount(favs ? JSON.parse(favs).length : 0);

            // Load venues for recommendations
            const venuesRes = await getAllVenues();
            setVenues((venuesRes.data || []).slice(0, 3)); // show top 3 as recommendations
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Tallies
    const totalBookings = bookings.length;
    const todayStr = new Date().toISOString().split("T")[0];
    const upcomingBookings = bookings.filter(b => b.bookingStatus === "CONFIRMED" && b.bookingDate >= todayStr).length;
    const completedBookings = bookings.filter(b => b.bookingStatus === "COMPLETED").length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === "CANCELLED").length;

    // Recent 3 bookings
    const recentBookings = bookings.slice(0, 3);


    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-2 p-0">
                    <UserSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
                </div>

                {/* Content Panel */}
                <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
                    <UserNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                    {loading ? (
                        <div className="text-center py-5">
                            <FaSpinner className="spinner-border text-success fs-2" role="status" />
                            <h5 className="mt-3 text-muted">Loading dashboard...</h5>
                        </div>
                    ) : (
                        <div className="px-4 pb-4">
                            {/* Welcome Banner */}
                            <div className="welcome-banner-card p-4 rounded-4 shadow mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div>
                                    <h2 className="welcome-banner-title mb-1">Welcome Back, {user.fullName || user.username || "Player"}! 👋</h2>
                                    <p className="welcome-banner-subtitle mb-0">Ready to schedule another match? Book, play, and conquer your goals today.</p>
                                </div>
                                <Link to="/" className="btn btn-light text-success fw-bold rounded-pill px-4 py-2 shadow-sm">
                                    Book a Turf Now
                                </Link>
                            </div>

                            {/* 6 Stats KPI Cards Grid */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-6 col-lg-4">
                                    <div className="card border-0 border-start border-4 border-info shadow-sm p-3 h-100 bg-white animate-hover">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted small fw-semibold">Total Bookings</span>
                                                <h3 className="fw-bold text-dark mt-1 mb-0">{totalBookings}</h3>
                                            </div>
                                            <div className="bg-info-subtle text-info p-3 rounded-circle"><FaCalendarAlt className="fs-4" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <div className="card border-0 border-start border-4 border-primary shadow-sm p-3 h-100 bg-white animate-hover">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted small fw-semibold">Upcoming Bookings</span>
                                                <h3 className="fw-bold text-dark mt-1 mb-0">{upcomingBookings}</h3>
                                            </div>
                                            <div className="bg-primary-subtle text-primary p-3 rounded-circle"><FaCalendarCheck className="fs-4" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <div className="card border-0 border-start border-4 border-success shadow-sm p-3 h-100 bg-white animate-hover">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted small fw-semibold">Completed Bookings</span>
                                                <h3 className="fw-bold text-dark mt-1 mb-0">{completedBookings}</h3>
                                            </div>
                                            <div className="bg-success-subtle text-success p-3 rounded-circle"><FaCheckCircle className="fs-4" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <div className="card border-0 border-start border-4 border-danger shadow-sm p-3 h-100 bg-white animate-hover">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted small fw-semibold">Cancelled Bookings</span>
                                                <h3 className="fw-bold text-dark mt-1 mb-0">{cancelledBookings}</h3>
                                            </div>
                                            <div className="bg-danger-subtle text-danger p-3 rounded-circle"><FaTimesCircle className="fs-4" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <div className="card border-0 border-start border-4 border-warning shadow-sm p-3 h-100 bg-white animate-hover">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted small fw-semibold">Favorite Venues</span>
                                                <h3 className="fw-bold text-dark mt-1 mb-0">{favoritesCount}</h3>
                                            </div>
                                            <div className="bg-warning-subtle text-warning p-3 rounded-circle"><FaHeart className="fs-4" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <div className="card border-0 border-start border-4 border-primary shadow-sm p-3 h-100 bg-white animate-hover">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted small fw-semibold">Reviews Given</span>
                                                <h3 className="fw-bold text-dark mt-1 mb-0">{reviewsCount}</h3>
                                            </div>
                                            <div className="bg-primary-subtle text-primary p-3 rounded-circle"><FaStar className="fs-4" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Widgets */}
                            <div className="row g-4">
                                
                                {/* Left Side: Popular sports & Recent bookings */}
                                <div className="col-lg-8">
                                    {/* Popular Sports */}
                                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                                        <h5 className="fw-bold text-dark mb-3">Popular Sports Categories</h5>
                                        <div className="row g-3">
                                            {popularSports.map((sport, index) => (
                                                <div className="col-6 col-md-3" key={index}>
                                                    <div className="p-3 bg-light rounded-3 text-center border cursor-pointer animate-hover" 
                                                         onClick={() => navigate(`/?sport=${sport.name.toLowerCase()}`)}>
                                                        <div className="fs-3 mb-2">{sport.icon}</div>
                                                        <h6 className="fw-bold text-dark mb-0">{sport.name}</h6>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Bookings logs */}
                                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                                <FaHistory className="text-secondary" /> Recent Booking Log
                                            </h5>
                                            <Link to="/user/bookings" className="small text-success text-decoration-none fw-bold">View All</Link>
                                        </div>
                                        
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="px-4">Booking ID</th>
                                                        <th>Turf Arena</th>
                                                        <th>Reserved Date</th>
                                                        <th>Slot Time</th>
                                                        <th>Price</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentBookings.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-5">
                                                                No bookings recorded yet. Start booking to view them here!
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        recentBookings.map((b) => (
                                                            <tr key={b.id}>
                                                                <td className="px-4 fw-semibold text-secondary">#BMP-{b.id}</td>
                                                                <td className="fw-bold text-dark">{b.venueName}</td>
                                                                <td className="small text-muted">{b.bookingDate}</td>
                                                                <td className="small text-muted">{b.startTime} - {b.endTime}</td>
                                                                <td className="fw-semibold text-success">₹{b.totalPrice}</td>
                                                                <td>
                                                                    <span className={`badge px-2.5 py-1.5 text-uppercase ${
                                                                        b.bookingStatus === "CONFIRMED" ? "bg-success" :
                                                                        b.bookingStatus === "COMPLETED" ? "bg-primary" : "bg-danger"
                                                                    }`}>{b.bookingStatus}</span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Upcoming Matches & Recommended Venues */}
                                <div className="col-lg-4">
                                    {/* Recommended Venues */}
                                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                                        <h5 className="fw-bold text-dark mb-3">Recommended Venues</h5>
                                        {venues.length === 0 ? (
                                            <p className="text-muted small">No recommendations available.</p>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {venues.map((v) => (
                                                    <div 
                                                        className="d-flex gap-3 align-items-center cursor-pointer p-2 rounded hover-bg-light"
                                                        key={v.id}
                                                        onClick={() => navigate(`/venue/${v.id}`)}
                                                    >
                                                        <img
                                                            src={v.imageUrl ? (v.imageUrl.startsWith("http") ? v.imageUrl : `http://localhost:8080${v.imageUrl}`) : "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80"}
                                                            alt={v.venueName}
                                                            className="rounded object-fit-cover shadow-sm"
                                                            style={{ width: "60px", height: "60px" }}
                                                        />
                                                        <div>
                                                            <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "160px" }}>{v.venueName}</h6>
                                                            <span className="small text-muted">{v.city}</span>
                                                            <div className="text-success small fw-semibold">₹ {v.pricePerHour}/hr</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Upcoming Matches widget (UI only) */}
                                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                        <h5 className="fw-bold text-dark mb-3">Upcoming Match Sessions</h5>
                                        <div className="d-flex flex-column gap-3">
                                            {upcomingMatches.map((match, idx) => (
                                                <div className="p-3 bg-success-subtle text-success border border-success rounded-3" key={idx}>
                                                    <h6 className="fw-bold mb-1 text-dark">{match.title}</h6>
                                                    <div className="small mb-1">⏰ <strong>Time:</strong> {match.time}</div>
                                                    <div className="small mb-2">🏟 <strong>Venue:</strong> {match.arena}</div>
                                                    <span className="badge bg-success text-white px-3 py-1.5 fw-bold">{match.fee}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
