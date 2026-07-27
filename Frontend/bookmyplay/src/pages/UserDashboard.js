import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaUser,
    FaCalendarAlt,
    FaStar,
    FaLock,
    FaSignOutAlt,
    FaCalendarCheck,
    FaCheckCircle,
    FaList,
    FaUserCircle,
    FaSpinner,
    FaEdit,
    FaTrash,
    FaCamera,
    FaPrint,
    FaRegFileAlt,
    FaTimes,
    FaShieldAlt
} from "react-icons/fa";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import { getSlotsByVenue } from "../services/slotService";

// Profile picture presets
const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
];

function UserDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const userSession = JSON.parse(localStorage.getItem("user")) || {};

    const [activeTab, setActiveTab] = useState("dashboard");

    // Profile states
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phone: "",
        role: "",
        profilePicture: ""
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    // Bookings states
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [invoiceTarget, setInvoiceTarget] = useState(null);

    // Reviews states
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: "" });
    const [writeReviewTarget, setWriteReviewTarget] = useState(null);
    const [newReviewForm, setNewReviewForm] = useState({ rating: 5, comment: "" });

    // Password states
    const [passForm, setPassForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState("");
    const [passSuccess, setPassSuccess] = useState("");

    useEffect(() => {
        // Handle query param tab selections
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab("dashboard");
        }
    }, [location]);

    useEffect(() => {
        if (userSession.id) {
            loadUserProfile();
            loadBookings();
            loadReviews();
        } else {
            navigate("/login");
        }
    }, [userSession.id]);

    const loadUserProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/users/profile?userId=${userSession.id}`);
            if (res.data) {
                setProfile({
                    fullName: res.data.fullName || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                    role: res.data.role || "",
                    profilePicture: res.data.profilePicture || ""
                });
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        } finally {
            setProfileLoading(false);
        }
    };

    const loadBookings = async () => {
        setBookingsLoading(true);
        try {
            const res = await getMyBookings(userSession.id);
            const sorted = (res.data || []).sort((a, b) => b.id - a.id);
            setBookings(sorted);
        } catch (err) {
            console.error("Error loading bookings:", err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const loadReviews = async () => {
        setReviewsLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/reviews/user/${userSession.id}`);
            setReviews(res.data || []);
        } catch (err) {
            console.error("Error loading reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");

        if (!profile.fullName.trim()) {
            setProfileError("Full Name is required");
            return;
        }
        if (!profile.phone.trim() || !/^\d{10}$/.test(profile.phone)) {
            setProfileError("Valid 10-digit phone number is required");
            return;
        }

        try {
            const res = await axios.put(`http://localhost:8080/api/users/profile?userId=${userSession.id}`, {
                fullName: profile.fullName,
                phone: profile.phone,
                profilePicture: profile.profilePicture
            });

            if (res.data) {
                // Update local storage user credentials
                const updatedUser = { ...userSession, fullName: profile.fullName, phone: profile.phone };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                setProfileSuccess("Profile updated successfully!");
                setIsEditingProfile(false);
                loadUserProfile();
            }
        } catch (err) {
            setProfileError(err.response?.data || "Failed to update profile details.");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassError("");
        setPassSuccess("");

        if (!passForm.oldPassword) {
            setPassError("Current Password is required");
            return;
        }
        if (passForm.newPassword.length < 6) {
            setPassError("New Password must be at least 6 characters long");
            return;
        }
        if (passForm.newPassword !== passForm.confirmPassword) {
            setPassError("Confirm password does not match");
            return;
        }

        setPassLoading(true);
        try {
            await axios.put(`http://localhost:8080/api/users/change-password?userId=${userSession.id}`, {
                oldPassword: passForm.oldPassword,
                newPassword: passForm.newPassword
            });

            setPassSuccess("Password updated successfully!");
            setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setPassError(err.response?.data || "Unable to change password. Double check current password.");
        } finally {
            setPassLoading(false);
        }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await cancelBooking(id);
            try {
                await axios.post("http://localhost:8080/api/notifications/send", {
                    userId: userSession.id,
                    title: "Booking Cancelled ❌",
                    message: `Your booking ID #${id} has been successfully cancelled.`,
                    type: "BOOKING"
                });
            } catch (nErr) {
                console.error("Failed to send notification:", nErr);
            }
            alert("Booking Cancelled Successfully");
            loadBookings();
        } catch (err) {
            alert(err.response?.data || "Failed to cancel booking.");
        }
    };

    // Review Actions
    const handleWriteReview = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/reviews", {
                userId: userSession.id,
                rating: newReviewForm.rating,
                comment: newReviewForm.comment,
                venue: { id: writeReviewTarget.venueId }
            });
            alert("Review submitted successfully!");
            setWriteReviewTarget(null);
            setNewReviewForm({ rating: 5, comment: "" });
            loadReviews();
        } catch (err) {
            alert("Failed to submit review.");
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/reviews/${editingReview.id}`, {
                rating: editReviewForm.rating,
                comment: editReviewForm.comment
            });
            alert("Review updated successfully!");
            setEditingReview(null);
            loadReviews();
        } catch (err) {
            alert("Failed to update review.");
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/reviews/${id}`);
            alert("Review deleted successfully!");
            loadReviews();
        } catch (err) {
            alert("Failed to delete review.");
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("user");
            alert("Logged out successfully");
            navigate("/login");
        }
    };

    // Derived Tallies
    const upcomingBookings = bookings.filter(b => b.bookingStatus === "CONFIRMED").length;
    const completedBookings = bookings.filter(b => b.bookingStatus === "COMPLETED").length;
    const totalReviews = reviews.length;

    return (
        <div className="container-fluid py-4" style={{ minHeight: "85vh", backgroundColor: "#f8f9fa" }}>
            <div className="row">
                
                {/* Left Sidebar Menu */}
                <div className="col-md-3 col-lg-2 mb-4">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                        <div className="text-center mb-4 mt-2">
                            <div className="position-relative d-inline-block">
                                <img
                                    src={profile.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                                    alt="avatar"
                                    className="rounded-circle shadow-sm border border-2 border-success"
                                    style={{ width: "90px", height: "90px", objectFit: "cover" }}
                                />
                            </div>
                            <h5 className="fw-bold mt-3 mb-0 text-dark">{profile.fullName || "User Account"}</h5>
                            <span className="badge bg-success-subtle text-success text-uppercase small mt-1">{profile.role}</span>
                        </div>
                        <hr className="text-muted opacity-25" />
                        <div className="nav flex-column nav-pills gap-2">
                            <button
                                className={`nav-link text-start py-3 d-flex align-items-center gap-2 rounded-3 fw-semibold ${activeTab === "dashboard" ? "active bg-success text-white" : "text-secondary hover-bg-light"}`}
                                onClick={() => navigate("/user/profile?tab=dashboard")}
                            >
                                <FaList /> Dashboard
                            </button>
                            <button
                                className={`nav-link text-start py-3 d-flex align-items-center gap-2 rounded-3 fw-semibold ${activeTab === "profile" ? "active bg-success text-white" : "text-secondary"}`}
                                onClick={() => navigate("/user/profile?tab=profile")}
                            >
                                <FaUser /> My Profile
                            </button>
                            <button
                                className={`nav-link text-start py-3 d-flex align-items-center gap-2 rounded-3 fw-semibold ${activeTab === "bookings" ? "active bg-success text-white" : "text-secondary"}`}
                                onClick={() => navigate("/user/profile?tab=bookings")}
                            >
                                <FaCalendarAlt /> My Bookings
                            </button>
                            <button
                                className={`nav-link text-start py-3 d-flex align-items-center gap-2 rounded-3 fw-semibold ${activeTab === "reviews" ? "active bg-success text-white" : "text-secondary"}`}
                                onClick={() => navigate("/user/profile?tab=reviews")}
                            >
                                <FaStar /> My Reviews
                            </button>
                            <button
                                className={`nav-link text-start py-3 d-flex align-items-center gap-2 rounded-3 fw-semibold ${activeTab === "password" ? "active bg-success text-white" : "text-secondary"}`}
                                onClick={() => navigate("/user/profile?tab=password")}
                            >
                                <FaLock /> Change Password
                            </button>
                            <button
                                className="nav-link text-start py-3 d-flex align-items-center gap-2 rounded-3 fw-semibold text-danger"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="col-md-9 col-lg-10">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white" style={{ minHeight: "65vh" }}>
                        
                        {/* 1. DASHBOARD OVERVIEW */}
                        {activeTab === "dashboard" && (
                            <div>
                                <h2 className="fw-bold mb-1 text-dark">Welcome Back, {profile.fullName || "User"} 👋</h2>
                                <p className="text-secondary">Keep track of all your sports facility bookings, slot reservations, and ratings.</p>
                                
                                <div className="row g-4 mt-2">
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card border-0 border-start border-4 border-primary shadow-sm p-4 h-100 bg-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-muted small fw-semibold">Upcoming Bookings</span>
                                                    <h3 className="fw-bold text-dark mt-2 mb-0">{upcomingBookings}</h3>
                                                </div>
                                                <div className="bg-primary-subtle text-primary p-3 rounded-circle"><FaCalendarCheck className="fs-4" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card border-0 border-start border-4 border-success shadow-sm p-4 h-100 bg-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-muted small fw-semibold">Completed Bookings</span>
                                                    <h3 className="fw-bold text-dark mt-2 mb-0">{completedBookings}</h3>
                                                </div>
                                                <div className="bg-success-subtle text-success p-3 rounded-circle"><FaCheckCircle className="fs-4" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card border-0 border-start border-4 border-warning shadow-sm p-4 h-100 bg-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-muted small fw-semibold">Total Reviews</span>
                                                    <h3 className="fw-bold text-dark mt-2 mb-0">{totalReviews}</h3>
                                                </div>
                                                <div className="bg-warning-subtle text-warning p-3 rounded-circle"><FaStar className="fs-4" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-lg-3">
                                        <div className="card border-0 border-start border-4 border-info shadow-sm p-4 h-100 bg-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-muted small fw-semibold">Account Status</span>
                                                    <h4 className="fw-bold text-success mt-2 mb-0">Active</h4>
                                                </div>
                                                <div className="bg-info-subtle text-info p-3 rounded-circle"><FaShieldAlt className="fs-4" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. MY PROFILE */}
                        {activeTab === "profile" && (
                            <div>
                                <h3 className="fw-bold mb-4">My Profile Settings</h3>
                                {profileError && <div className="alert alert-danger small border-0 py-2 rounded-3">{profileError}</div>}
                                {profileSuccess && <div className="alert alert-success small border-0 py-2 rounded-3">{profileSuccess}</div>}
                                
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="row g-4">
                                        <div className="col-md-4 text-center border-end">
                                            <div className="position-relative d-inline-block">
                                                <img
                                                    src={profile.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                                                    alt="Avatar"
                                                    className="rounded-circle shadow border"
                                                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                                />
                                                {isEditingProfile && (
                                                    <label className="position-absolute bottom-0 end-0 bg-success text-white p-2 rounded-circle shadow-sm border border-white cursor-pointer mb-0">
                                                        <FaCamera />
                                                        <input type="file" accept="image/*" className="d-none" onChange={handleProfilePicChange} />
                                                    </label>
                                                )}
                                            </div>
                                            
                                            {isEditingProfile && (
                                                <div className="mt-3">
                                                    <span className="small text-muted d-block mb-2">Or choose Preset Avatar:</span>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {AVATAR_PRESETS.map((pUrl, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={pUrl}
                                                                alt="preset"
                                                                className="rounded-circle border cursor-pointer"
                                                                style={{ width: "35px", height: "35px", objectFit: "cover" }}
                                                                onClick={() => setProfile(prev => ({ ...prev, profilePicture: pUrl }))}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-8">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted">Email Address (Read-Only)</label>
                                                <input type="text" className="form-control bg-light" value={profile.email} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.fullName}
                                                    onChange={e => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                                                    readOnly={!isEditingProfile}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted">Phone Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.phone}
                                                    onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                                    readOnly={!isEditingProfile}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold text-muted">Role</label>
                                                <input type="text" className="form-control bg-light text-uppercase" value={profile.role} readOnly />
                                            </div>
                                            
                                            <div className="mt-4">
                                                {!isEditingProfile ? (
                                                    <button type="button" className="btn btn-outline-success rounded-pill px-4" onClick={() => setIsEditingProfile(true)}>
                                                        <FaEdit className="me-2" /> Edit Profile
                                                    </button>
                                                ) : (
                                                    <div className="d-flex gap-2">
                                                        <button type="submit" className="btn btn-success rounded-pill px-4">Save Changes</button>
                                                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => { setIsEditingProfile(false); loadUserProfile(); }}>Cancel</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 3. MY BOOKINGS */}
                        {activeTab === "bookings" && (
                            <div>
                                <h3 className="fw-bold mb-4">My Bookings</h3>
                                {bookingsLoading ? (
                                    <div className="text-center py-5">
                                        <FaSpinner className="spinner-border text-success fs-3" />
                                        <p className="mt-2 text-muted small">Loading history...</p>
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="alert alert-warning text-center small py-4">You haven't booked any venues yet.</div>
                                ) : (
                                    <div className="row g-4">
                                        {bookings.map(b => (
                                            <div className="col-md-6" key={b.id}>
                                                <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden bg-white">
                                                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                                                        <span className="fw-semibold small">Booking #BMP-{b.id}</span>
                                                        <span className={`badge px-3 py-2 text-uppercase ${
                                                            b.bookingStatus === "CONFIRMED" ? "bg-success" :
                                                            b.bookingStatus === "COMPLETED" ? "bg-primary" : "bg-danger"
                                                        }`}>{b.bookingStatus}</span>
                                                    </div>
                                                    <div className="card-body p-4">
                                                        <div className="d-flex gap-3 align-items-start mb-3">
                                                            {b.venueImageUrl && (
                                                                <img
                                                                    src={b.venueImageUrl.startsWith("http") ? b.venueImageUrl : `http://localhost:8080${b.venueImageUrl}`}
                                                                    alt="venue"
                                                                    className="rounded object-fit-cover shadow-sm"
                                                                    style={{ width: "70px", height: "70px" }}
                                                                />
                                                            )}
                                                            <div>
                                                                <h5 className="fw-bold mb-1 text-dark">{b.venueName}</h5>
                                                                <span className="badge bg-secondary-subtle text-secondary text-uppercase small">{b.categoryName || "Sports Venue"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="small text-muted mb-1">📅 <strong>Date:</strong> {b.bookingDate}</div>
                                                        <div className="small text-muted mb-3">⏰ <strong>Slot:</strong> {b.startTime} - {b.endTime}</div>
                                                        <div className="fw-bold text-success fs-5 mb-3">₹ {b.totalPrice}</div>

                                                        <div className="d-flex flex-wrap gap-2 justify-content-between border-top pt-3">
                                                            <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => setInvoiceTarget(b)}>
                                                                <FaRegFileAlt className="me-1" /> View Receipt
                                                            </button>
                                                            
                                                            <div className="d-flex gap-2">
                                                                {b.bookingStatus === "CONFIRMED" && (
                                                                    <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleCancelBooking(b.id)}>
                                                                        Cancel Slot
                                                                    </button>
                                                                )}
                                                                {b.bookingStatus === "COMPLETED" && (
                                                                    <button className="btn btn-success btn-sm rounded-pill px-3 text-white" onClick={() => setWriteReviewTarget(b)}>
                                                                        Write Review
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. MY REVIEWS */}
                        {activeTab === "reviews" && (
                            <div>
                                <h3 className="fw-bold mb-4">My Reviews</h3>
                                {reviewsLoading ? (
                                    <div className="text-center py-5">
                                        <FaSpinner className="spinner-border text-success fs-3" />
                                        <p className="mt-2 text-muted small">Loading reviews...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="alert alert-warning text-center small py-4">You haven't reviewed any venues yet.</div>
                                ) : (
                                    <div className="row g-4">
                                        {reviews.map(r => (
                                            <div className="col-12" key={r.id}>
                                                <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            {r.venue?.imageUrl && (
                                                                <img
                                                                    src={r.venue.imageUrl.startsWith("http") ? r.venue.imageUrl : `http://localhost:8080${r.venue.imageUrl}`}
                                                                    alt="venue"
                                                                    className="rounded object-fit-cover shadow-sm"
                                                                    style={{ width: "65px", height: "50px" }}
                                                                />
                                                            )}
                                                            <div>
                                                                <h5 className="fw-bold mb-1 text-dark">{r.venue?.venueName || "Sports Venue"}</h5>
                                                                <div className="text-warning fw-bold">
                                                                    {Array.from({ length: r.rating }).map((_, i) => "⭐")}
                                                                    <span className="text-muted small ms-2">{r.rating} / 5</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "35px", height: "35px" }} onClick={() => { setEditingReview(r); setEditReviewForm({ rating: r.rating, comment: r.comment }); }}>
                                                                <FaEdit />
                                                            </button>
                                                            <button className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "35px", height: "35px" }} onClick={() => handleDeleteReview(r.id)}>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-secondary bg-light p-3 rounded-3 mb-1" style={{ whiteSpace: "normal" }}>"{r.comment}"</p>
                                                    <span className="small text-muted text-end d-block">Submitted: {new Date(r.createdAt || r.createdDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 5. CHANGE PASSWORD */}
                        {activeTab === "password" && (
                            <div>
                                <h3 className="fw-bold mb-4">Change Password</h3>
                                {passError && <div className="alert alert-danger small border-0 py-2 rounded-3">{passError}</div>}
                                {passSuccess && <div className="alert alert-success small border-0 py-2 rounded-3">{passSuccess}</div>}
                                
                                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: "450px" }}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passForm.oldPassword}
                                            onChange={e => setPassForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Min 6 characters"
                                            value={passForm.newPassword}
                                            onChange={e => setPassForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-muted">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passForm.confirmPassword}
                                            onChange={e => setPassForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success rounded-pill px-4 py-2 w-100 fw-semibold" disabled={passLoading}>
                                        {passLoading ? <FaSpinner className="spinner-border spinner-border-sm me-2" /> : "Update Password"}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

            </div>

            {/* WRITE REVIEW MODAL */}
            {writeReviewTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <div className="modal-header bg-success text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">Write Review</h5>
                                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setWriteReviewTarget(null)}></button>
                            </div>
                            <form onSubmit={handleWriteReview}>
                                <div className="modal-body p-4">
                                    <p className="small text-muted mb-3">Rate your sports experience at <strong>{writeReviewTarget.venueName}</strong>.</p>
                                    
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">Rating Star Tally</label>
                                        <select
                                            className="form-select"
                                            value={newReviewForm.rating}
                                            onChange={e => setNewReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellence)</option>
                                            <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                                            <option value="3">⭐⭐⭐ (3/5 Average)</option>
                                            <option value="2">⭐⭐ (2/5 Needs Improvement)</option>
                                            <option value="1">⭐ (1/5 Poor Service)</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">Comment / Feedback</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Write your review comments..."
                                            value={newReviewForm.comment}
                                            onChange={e => setNewReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setWriteReviewTarget(null)}>Close</button>
                                    <button type="submit" className="btn btn-success px-4 rounded-pill text-white">Submit Review</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT REVIEW MODAL */}
            {editingReview && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">Edit Review</h5>
                                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingReview(null)}></button>
                            </div>
                            <form onSubmit={handleUpdateReview}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">Rating</label>
                                        <select
                                            className="form-select"
                                            value={editReviewForm.rating}
                                            onChange={e => setEditReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                            <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                            <option value="3">⭐⭐⭐ (3/5)</option>
                                            <option value="2">⭐⭐ (2/5)</option>
                                            <option value="1">⭐ (1/5)</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-muted">Your Comment</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={editReviewForm.comment}
                                            onChange={e => setEditReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingReview(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4 rounded-pill">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIPT / INVOICE MODAL */}
            {invoiceTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
                            <div className="p-5 bg-white" id="printable-invoice">
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                    <div>
                                        <h2 className="fw-bold text-success mb-1">BOOK MY PLAY</h2>
                                        <span className="small text-muted">Receipt / Tax Invoice</span>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="fw-bold mb-0">INVOICE</h5>
                                        <span className="small text-muted">No: #BMP-{invoiceTarget.id}</span>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <h6 className="fw-bold text-muted text-uppercase mb-1 small">Billed To:</h6>
                                        <p className="mb-0 fw-semibold">{invoiceTarget.userName || profile.fullName}</p>
                                        <p className="small text-muted mb-0">{profile.email}</p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <h6 className="fw-bold text-muted text-uppercase mb-1 small">Venue Operator:</h6>
                                        <p className="mb-0 fw-semibold">{invoiceTarget.venueName}</p>
                                        <p className="small text-muted mb-0">{invoiceTarget.city}</p>
                                    </div>
                                </div>

                                <table className="table table-bordered mb-4">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Description</th>
                                            <th className="text-center">Date</th>
                                            <th className="text-center">Time Slot</th>
                                            <th className="text-end">Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <strong className="d-block">{invoiceTarget.venueName}</strong>
                                                <span className="small text-muted">{invoiceTarget.categoryName || "Sports Facility"} Booking</span>
                                            </td>
                                            <td className="text-center align-middle">{invoiceTarget.bookingDate}</td>
                                            <td className="text-center align-middle">{invoiceTarget.startTime} - {invoiceTarget.endTime}</td>
                                            <td className="text-end align-middle fw-bold text-success">₹{invoiceTarget.totalPrice}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="row">
                                    <div className="col-6">
                                        <span className="small text-muted d-block">Payment Status:</span>
                                        <span className="badge bg-success-subtle text-success border border-success px-3 py-1">PAID ONLINE</span>
                                    </div>
                                    <div className="col-6 text-end">
                                        <span className="small text-muted d-block">Grand Total:</span>
                                        <h3 className="fw-bold text-success">₹{invoiceTarget.totalPrice}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4 justify-content-between">
                                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setInvoiceTarget(null)}>Close</button>
                                <button type="button" className="btn btn-success px-4 rounded-pill d-flex align-items-center text-white" onClick={() => window.print()}>
                                    <FaPrint className="me-2" /> Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default UserDashboard;