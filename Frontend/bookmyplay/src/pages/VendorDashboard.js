import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVenuesByVendor, deleteVenue } from "../services/venueService";
import { getVendorStats } from "../services/vendorService";
import Navbar from "../components/Navbar";
import { FaBuilding, FaCalendarCheck, FaRupeeSign, FaChartLine, FaTrash, FaEdit } from "react-icons/fa";

function VendorDashboard() {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [venues, setVenues] = useState([]);
    const [stats, setStats] = useState({
        totalVenues: 0,
        totalBookings: 0,
        totalEarnings: 0,
        upcomingBookings: 0
    });

    useEffect(() => {
        if (user.id) {
            loadVenues();
            loadStats();
        }
    }, [user.id]);

    const loadVenues = async () => {
        try {
            const response = await getVenuesByVendor(user.id);
            setVenues(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await getVendorStats(user.id);
            setStats(response.data || {
                totalVenues: 0,
                totalBookings: 0,
                totalEarnings: 0,
                upcomingBookings: 0
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this venue?");
        if (!confirmDelete) return;

        try {
            await deleteVenue(id);
            alert("Venue Deleted Successfully");
            loadVenues();
            loadStats();
        } catch (error) {
            console.error(error);
            alert("Failed to Delete Venue");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">Vendor Dashboard</h2>
                    <Link to="/vendor/add" className="btn btn-success rounded-pill px-4 fw-bold">
                        + Add New Venue
                    </Link>
                </div>

                {/* Stats Cards Section */}
                <div className="row g-3 mb-5">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
                            <div className="card-body d-flex align-items-center">
                                <div className="fs-1 me-3 opacity-75">
                                    <FaBuilding />
                                </div>
                                <div>
                                    <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Total Venues</h6>
                                    <h3 className="card-title mb-0 fw-bold">{stats.totalVenues}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                            <div className="card-body d-flex align-items-center">
                                <div className="fs-1 me-3 opacity-75">
                                    <FaCalendarCheck />
                                </div>
                                <div>
                                    <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Total Bookings</h6>
                                    <h3 className="card-title mb-0 fw-bold">{stats.totalBookings}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                            <div className="card-body d-flex align-items-center">
                                <div className="fs-1 me-3 opacity-75">
                                    <FaRupeeSign />
                                </div>
                                <div>
                                    <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Total Earnings</h6>
                                    <h3 className="card-title mb-0 fw-bold">₹{parseFloat(stats.totalEarnings || 0).toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
                            <div className="card-body d-flex align-items-center">
                                <div className="fs-1 me-3 opacity-75">
                                    <FaChartLine />
                                </div>
                                <div>
                                    <h6 className="card-subtitle mb-1 text-white-50 fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>Upcoming Bookings</h6>
                                    <h3 className="card-title mb-0 fw-bold">{stats.upcomingBookings}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Venues List Table */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div className="card-header bg-dark text-white py-3">
                        <h5 className="fw-bold mb-0">Manage My Sports Venues</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-3 px-4">Venue Details</th>
                                    <th className="py-3">Address</th>
                                    <th className="py-3">City</th>
                                    <th className="py-3">Price / Hour</th>
                                    <th className="py-3">Timing</th>
                                    <th className="py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venues.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
                                            No venues registered yet. Click "+ Add New Venue" to start!
                                        </td>
                                    </tr>
                                ) : (
                                    venues.map((venue) => (
                                        <tr key={venue.id}>
                                            <td className="px-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    {venue.imageUrl ? (
                                                        <img
                                                            src={venue.imageUrl.startsWith("http") ? venue.imageUrl : `http://localhost:8080${venue.imageUrl}`}
                                                            alt={venue.venueName}
                                                            className="rounded border"
                                                            style={{ width: "60px", height: "45px", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <div className="bg-light rounded border d-flex align-items-center justify-content-center" style={{ width: "60px", height: "45px" }}>
                                                            <FaBuilding className="text-muted" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="d-block fw-bold text-dark">{venue.venueName}</span>
                                                        <span className="badge bg-success-subtle text-success small">{venue.category?.categoryName || venue.sport}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{venue.address}</td>
                                            <td>{venue.city}</td>
                                            <td className="fw-bold text-success">₹ {venue.pricePerHour}</td>
                                            <td className="text-muted small">{venue.openTime} - {venue.closeTime}</td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Link to={`/vendor/slots/${venue.id}`} className="btn btn-outline-success btn-sm rounded-pill px-3">
                                                        Configure Slots
                                                    </Link>
                                                    <Link to={`/vendor/edit/${venue.id}`} className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "35px", height: "35px" }}>
                                                        <FaEdit />
                                                    </Link>
                                                    <button onClick={() => handleDelete(venue.id)} className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "35px", height: "35px" }}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VendorDashboard;