import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getVenuesByVendor, deleteVenue } from "../../services/venueService";
import axios from "axios";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaBuilding, FaEdit, FaTrash, FaCalendarAlt, FaSearch, FaEye, FaSpinner, FaChevronLeft, FaChevronRight, FaStar, FaCheckCircle, FaClock } from "react-icons/fa";

function VendorVenues() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [venues, setVenues] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [subActive, setSubActive] = useState(true);
    const [subStatus, setSubStatus] = useState("ACTIVE");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        if (user.id) {
            loadData();
            checkSubscription();
        } else {
            navigate("/login");
        }
    }, [user.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const venueRes = await getVenuesByVendor(user.id);
            setVenues(venueRes.data || []);
            
            const bookingRes = await axios.get(`http://localhost:8080/api/bookings/vendor/${user.id}`);
            setBookings(bookingRes.data || []);
        } catch (error) {
            console.error("Error loading venues data:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkSubscription = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/subscriptions/vendor/${user.id}`);
            setSubActive(response.data.active);
            setSubStatus(response.data.status || "ACTIVE");
        } catch (error) {
            console.error("Error checking subscription:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!subActive) {
            alert("Action Denied: Your subscription has expired. Please renew your plan.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this venue? All slots and details will be lost!");
        if (!confirmDelete) return;

        try {
            await deleteVenue(id);
            alert("Venue Deleted Successfully");
            loadData();
        } catch (error) {
            console.error("Error deleting venue:", error);
            alert("Failed to delete venue.");
        }
    };

    const handleAddNewVenueClick = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:8080/api/subscriptions/vendor/${user.id}`);
            const status = response.data.status || "NONE";
            const planType = response.data.planType || "NONE";
            const isAllowed = (status === "ACTIVE" || status === "FREE_TRIAL" || planType === "FREE_TRIAL");
            
            if (isAllowed) {
                navigate("/vendor/add");
            } else {
                await window.Swal.fire({
                    icon: "warning",
                    title: "Subscription Required",
                    text: "Your subscription has expired. Please renew your subscription to publish new venues.",
                    confirmButtonColor: "#198754"
                });
            }
        } catch (error) {
            console.error("Error checking subscription:", error);
            navigate("/vendor/add");
        }
    };

    // Filter & search
    const filteredVenues = venues.filter((venue) => {
        const query = searchQuery.toLowerCase();
        return (
            venue.venueName.toLowerCase().includes(query) ||
            (venue.category?.categoryName || venue.sport || "").toLowerCase().includes(query) ||
            venue.city.toLowerCase().includes(query) ||
            venue.address.toLowerCase().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVenues = filteredVenues.slice(startIndex, startIndex + itemsPerPage);

    // Derived statistics
    const totalVenuesCount = venues.length;
    const approvedVenuesCount = venues.filter(v => v.status === "APPROVED" || v.status === "ACTIVE" || !v.status).length; // assume approved if null or active
    const pendingVenuesCount = venues.filter(v => v.status === "PENDING").length;

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-2 p-0">
                    <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
                </div>

                {/* Main Content */}
                <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
                    <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                    
                    <div className="px-4 pb-4">
                        {/* Subscription Banner */}
                        {!subActive && (
                            <div className="alert alert-danger shadow-sm rounded-3 mb-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>⚠️ Subscription Expired:</strong> Your subscription has expired. Please renew your plan to manage or edit venues.
                                </div>
                                <Link to="/vendor/subscription" className="btn btn-danger btn-sm rounded-pill px-3">
                                    Renew Subscription
                                </Link>
                            </div>
                        )}

                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                            <div>
                                <h2 className="fw-bold mb-0 text-dark">🏟️ My Venues</h2>
                                <p className="text-muted mb-0">Manage your turf complexes, view analytics, and organize booking slots.</p>
                            </div>
                            <Link
                                to="/vendor/add"
                                onClick={handleAddNewVenueClick}
                                className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                            >
                                + Add New Venue
                            </Link>
                        </div>

                        {/* Top Stats Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                                    <div className="card-body d-flex align-items-center py-4">
                                        <div className="fs-1 me-3 opacity-75"><FaBuilding /></div>
                                        <div>
                                            <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Total Registered Venues</h6>
                                            <h3 className="card-title mb-0 fw-bold">{totalVenuesCount}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                    <div className="card-body d-flex align-items-center py-4">
                                        <div className="fs-1 me-3 opacity-75"><FaCheckCircle /></div>
                                        <div>
                                            <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Active / Approved</h6>
                                            <h3 className="card-title mb-0 fw-bold">{approvedVenuesCount}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                                    <div className="card-body d-flex align-items-center py-4">
                                        <div className="fs-1 me-3 opacity-75"><FaClock /></div>
                                        <div>
                                            <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Pending Review</h6>
                                            <h3 className="card-title mb-0 fw-bold">{pendingVenuesCount}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Table Card */}
                        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                            <div className="card-header bg-white border-0 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                                <h5 className="fw-bold mb-0 text-dark">Venue Directory</h5>
                                
                                <div className="input-group shadow-sm" style={{ width: "300px" }}>
                                    <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                                    <input
                                        type="text"
                                        placeholder="Search by name, city, sport..."
                                        className="form-control border-start-0 shadow-none"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <FaSpinner className="spinner-border text-success fs-2" role="status" />
                                    <h5 className="mt-3 text-muted">Loading venues...</h5>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th className="py-3 px-4">Venue Details</th>
                                                <th className="py-3">Address</th>
                                                <th className="py-3">City</th>
                                                <th className="py-3">Price / Hr</th>
                                                <th className="py-3">Timings</th>
                                                <th className="py-3">Rating</th>
                                                <th className="py-3">Bookings</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentVenues.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center text-muted py-5">
                                                        No venues matching your query found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentVenues.map((venue) => {
                                                    const venueBookingsCount = bookings.filter(b => b.venueId === venue.id || b.venue?.id === venue.id).length;
                                                    
                                                    // Average Rating calculation
                                                    const totalRatings = venue.reviews ? venue.reviews.reduce((acc, r) => acc + r.rating, 0) : 0;
                                                    const avgRating = venue.reviews && venue.reviews.length > 0 ? (totalRatings / venue.reviews.length).toFixed(1) : "N/A";
                                                    
                                                    return (
                                                        <tr key={venue.id}>
                                                            <td className="px-4">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    {venue.imageUrl ? (
                                                                        <img
                                                                            src={venue.imageUrl.startsWith("http") ? venue.imageUrl : `http://localhost:8080${venue.imageUrl}`}
                                                                            alt={venue.venueName}
                                                                            className="rounded border shadow-sm"
                                                                            style={{ width: "60px", height: "45px", objectFit: "cover" }}
                                                                        />
                                                                    ) : (
                                                                        <div className="bg-light rounded border d-flex align-items-center justify-content-center shadow-sm" style={{ width: "60px", height: "45px" }}>
                                                                            <FaBuilding className="text-muted" />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <span className="d-block fw-bold text-dark">{venue.venueName}</span>
                                                                        <span className="badge bg-success-subtle text-success small">{venue.category?.categoryName || venue.sport}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-truncate" style={{ maxWidth: "200px" }}>{venue.address}</td>
                                                            <td>{venue.city}</td>
                                                            <td className="fw-bold text-success">₹ {venue.pricePerHour}</td>
                                                            <td className="text-muted small">{venue.openTime} - {venue.closeTime}</td>
                                                            <td className="fw-bold text-warning">
                                                                <FaStar className="me-1 mb-1" /> {avgRating}
                                                            </td>
                                                            <td className="fw-semibold text-secondary">{venueBookingsCount} bookings</td>
                                                            <td>
                                                                <span className={`badge px-3 py-2 text-uppercase ${
                                                                    venue.status === "APPROVED" || !venue.status ? "bg-success" : 
                                                                    venue.status === "PENDING" ? "bg-warning text-dark" : "bg-danger"
                                                                }`}>
                                                                    {venue.status || "APPROVED"}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    <Link
                                                                        to={`/venue/${venue.id}`}
                                                                        className="btn btn-outline-dark btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                                        style={{ width: "35px", height: "35px" }}
                                                                        title="View Public Details"
                                                                    >
                                                                        <FaEye />
                                                                    </Link>
                                                                    <Link
                                                                        to={subActive ? `/vendor/edit/${venue.id}` : "#"}
                                                                        onClick={(e) => {
                                                                            if (!subActive) {
                                                                                e.preventDefault();
                                                                                alert("Action Denied: Please renew your subscription to edit venues.");
                                                                            }
                                                                        }}
                                                                        className={`btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center ${!subActive ? "disabled opacity-50" : ""}`}
                                                                        style={{ width: "35px", height: "35px" }}
                                                                        title="Edit Venue"
                                                                    >
                                                                        <FaEdit />
                                                                    </Link>
                                                                    <Link
                                                                        to={subActive ? `/vendor/slots/${venue.id}` : "#"}
                                                                        onClick={(e) => {
                                                                            if (!subActive) {
                                                                                e.preventDefault();
                                                                                alert("Action Denied: Please renew your subscription to manage slots.");
                                                                            }
                                                                        }}
                                                                        className={`btn btn-outline-success btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center ${!subActive ? "disabled opacity-50" : ""}`}
                                                                        style={{ width: "35px", height: "35px" }}
                                                                        title="Manage Slots"
                                                                    >
                                                                        <FaCalendarAlt />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDelete(venue.id)}
                                                                        className={`btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center ${!subActive ? "opacity-50" : ""}`}
                                                                        style={{ width: "35px", height: "35px" }}
                                                                        disabled={!subActive}
                                                                        title="Delete Venue"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center align-items-center gap-3">
                                    <button
                                        className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                        style={{ width: "32px", height: "32px" }}
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="small text-secondary fw-semibold">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                        style={{ width: "32px", height: "32px" }}
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VendorVenues;
