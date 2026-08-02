import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, rescheduleBooking } from "../../services/bookingService";
import { getSlotsByVenue } from "../../services/slotService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import {
    FaCalendarAlt,
    FaCalendarCheck,
    FaTimes,
    FaPrint,
    FaRegFileAlt,
    FaSpinner,
    FaInfoCircle,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaEye
} from "react-icons/fa";

const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLocalMaxDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function UserBookings() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Reschedule states
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState(getLocalTodayStr());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Invoice states
    const [invoiceTarget, setInvoiceTarget] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        if (!user.id) {
            navigate("/login");
        } else {
            loadBookings();
        }
    }, [user.id]);

    useEffect(() => {
        if (rescheduleTarget) {
            loadRescheduleSlots();
        }
    }, [rescheduleTarget, rescheduleDate]);

    useEffect(() => {
        // Automatically refresh at midnight
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
        const msToMidnight = midnight.getTime() - now.getTime();

        const timer = setTimeout(() => {
            window.location.reload();
        }, msToMidnight);

        return () => clearTimeout(timer);
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const response = await getMyBookings(user.id);
            // Sort bookings so newest are first
            const sorted = (response.data || []).sort((a, b) => b.id - a.id);
            setBookings(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) {
            return;
        }

        try {
            const response = await cancelBooking(bookingId);
            try {
                await axios.post("http://localhost:8080/api/notifications/send", {
                    userId: user.id,
                    title: "Booking Cancelled ❌",
                    message: `Your booking ID #${bookingId} has been successfully cancelled.`,
                    type: "BOOKING"
                });
            } catch (nErr) {
                console.error("Failed to send notification:", nErr);
            }
            alert(response.data || "Booking Cancelled Successfully");
            loadBookings();
        } catch (error) {
            console.error(error);
            alert("Unable to cancel booking.");
        }
    };

    const openRescheduleModal = async (booking) => {
        setRescheduleDate(getLocalTodayStr());
        setRescheduleTarget(booking);
    };

    const loadRescheduleSlots = async () => {
        if (rescheduleDate < getLocalTodayStr() || rescheduleDate > getLocalMaxDateStr()) {
            setAvailableSlots([]);
            return;
        }
        setSlotsLoading(true);
        try {
            const response = await getSlotsByVenue(rescheduleTarget.venueId, rescheduleDate);
            let unbookedSlots = (response.data || []).filter((slot) => !slot.booked);

            // Filter expired slots for today
            if (rescheduleDate === getLocalTodayStr()) {
                const nowTime = new Date();
                const nowHour = nowTime.getHours();
                const nowMin = nowTime.getMinutes();

                unbookedSlots = unbookedSlots.filter(s => {
                    const [sh, sm] = s.startTime.split(":").map(Number);
                    return sh > nowHour || (sh === nowHour && sm > nowMin);
                });
            }
            setAvailableSlots(unbookedSlots);
        } catch (error) {
            console.error("Error loading available slots:", error);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleRescheduleSubmit = async (newSlotId) => {
        if (!window.confirm("Confirm rescheduling to this slot?")) {
            return;
        }

        try {
            const response = await rescheduleBooking(rescheduleTarget.id, newSlotId);
            try {
                await axios.post("http://localhost:8080/api/notifications/send", {
                    userId: user.id,
                    title: "Booking Rescheduled 📅",
                    message: `Your booking ID #${rescheduleTarget.id} has been successfully rescheduled.`,
                    type: "BOOKING"
                });
            } catch (nErr) {
                console.error("Failed to send notification:", nErr);
            }
            alert(response.data || "Booking rescheduled successfully!");
            setRescheduleTarget(null);
            loadBookings();
        } catch (error) {
            console.error("Reschedule failed:", error);
            alert(error.response?.data || "Failed to reschedule booking.");
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Filter & Search logic
    const filteredBookings = bookings.filter((b) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            String(b.id).includes(query) ||
            (b.venueName || "").toLowerCase().includes(query) ||
            (b.categoryName || b.sport || "").toLowerCase().includes(query);

        const matchesStatus = statusFilter === "ALL" || b.bookingStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

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
                                <h2 className="fw-bold mb-0 text-dark">📅 My Bookings</h2>
                                <p className="text-muted mb-0">Track and reschedule slots, print receipts, and cancel reservations.</p>
                            </div>

                            <div className="d-flex gap-2 align-items-center">
                                {/* Status Filter */}
                                <select
                                    className="form-select border shadow-sm"
                                    style={{ width: "160px" }}
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>

                                {/* Search Input */}
                                <div className="input-group shadow-sm" style={{ width: "260px" }}>
                                    <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                                    <input
                                        type="text"
                                        placeholder="Search by ID, arena..."
                                        className="form-control border-start-0 shadow-none"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <FaSpinner className="spinner-border text-success fs-2" role="status" />
                                <h5 className="mt-3 text-muted">Refreshing bookings...</h5>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {currentBookings.length === 0 ? (
                                    <div className="col-12">
                                        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                                            <FaInfoCircle className="fs-1 text-muted mb-3" />
                                            <h5 className="text-muted">No matching bookings found.</h5>
                                        </div>
                                    </div>
                                ) : (
                                    currentBookings.map((b) => (
                                        <div className="col-md-6" key={b.id}>
                                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex flex-column justify-content-between">
                                                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                                                    <span className="fw-semibold small">Booking #BMP-{b.id}</span>
                                                    <span className={`badge px-3 py-2 text-uppercase ${
                                                        b.bookingStatus === "CONFIRMED" ? "bg-success" :
                                                        b.bookingStatus === "COMPLETED" ? "bg-primary" : "bg-danger"
                                                    }`}>{b.bookingStatus}</span>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div className="d-flex gap-3 align-items-start mb-3">
                                                        {b.venueImageUrl ? (
                                                            <img
                                                                src={b.venueImageUrl.startsWith("http") ? b.venueImageUrl : `http://localhost:8080${b.venueImageUrl}`}
                                                                alt="venue"
                                                                className="rounded border shadow-sm"
                                                                style={{ width: "70px", height: "70px", objectFit: "cover" }}
                                                            />
                                                        ) : (
                                                            <div className="bg-light rounded border d-flex align-items-center justify-content-center shadow-sm" style={{ width: "70px", height: "70px" }}>
                                                                <FaCalendarAlt className="text-muted fs-3" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h5 className="fw-bold mb-1 text-dark">{b.venueName}</h5>
                                                            <span className="badge bg-success-subtle text-success small">{b.categoryName || b.sport || "Arena"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="small text-muted mb-1">📅 <strong>Booking Date:</strong> {b.bookingDate}</div>
                                                    <div className="small text-muted mb-3">⏰ <strong>Reserved Slot:</strong> {b.startTime} - {b.endTime}</div>
                                                    <div className="fw-bold text-success fs-5 mb-3">₹ {b.totalPrice}</div>

                                                    <div className="d-flex flex-wrap gap-2 justify-content-between border-top pt-3">
                                                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => setInvoiceTarget(b)}>
                                                            <FaRegFileAlt className="me-1" /> View Invoice
                                                        </button>
                                                        
                                                        <div className="d-flex gap-2">
                                                            {b.bookingStatus === "CONFIRMED" && (
                                                                <>
                                                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => openRescheduleModal(b)}>
                                                                        Reschedule
                                                                    </button>
                                                                    <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleCancel(b.id)}>
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {b.bookingStatus === "COMPLETED" && (
                                                                <button className="btn btn-success btn-sm rounded-pill px-4 text-white fw-semibold" onClick={() => navigate(`/venue/${b.venueId}`)}>
                                                                    Book Again
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="col-12 d-flex justify-content-center align-items-center gap-3 mt-4">
                                        <button
                                            className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm"
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
                                            className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm"
                                            style={{ width: "32px", height: "32px" }}
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RESCHEDULE MODAL */}
            {rescheduleTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <div className="modal-header bg-primary text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">Reschedule Booking</h5>
                                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setRescheduleTarget(null)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                <p className="small text-muted mb-3">Choose a new available time slot for <strong>{rescheduleTarget.venueName}</strong>.</p>
                                
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-semibold">Choose Play Date</label>
                                    <input
                                        type="date"
                                        className="form-control rounded-3 border-secondary-subtle"
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        min={getLocalTodayStr()}
                                        max={getLocalMaxDateStr()}
                                    />
                                </div>

                                {slotsLoading ? (
                                    <div className="text-center py-4">
                                        <FaSpinner className="spinner-border text-primary fs-3" />
                                        <p className="mt-2 text-muted small">Loading free slots...</p>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="alert alert-warning text-center small py-3">No slots available for this date.</div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleRescheduleSubmit(slot.id)}
                                                className="btn btn-outline-primary text-start p-3 d-flex justify-content-between align-items-center rounded-3"
                                            >
                                                <div>
                                                    <strong className="d-block">{slot.startTime} - {slot.endTime}</strong>
                                                    <span className="small text-muted">{slot.slotDate}</span>
                                                </div>
                                                <FaCalendarCheck />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setRescheduleTarget(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INVOICE / RECEIPT MODAL */}
            {invoiceTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)", zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
                            
                            {/* Invoice Printable Content */}
                            <div className="p-5 bg-white" id="printable-invoice-container">
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
                                        <p className="mb-0 fw-semibold">{invoiceTarget.userName || user.fullName}</p>
                                        <p className="small text-muted mb-0">{user.email}</p>
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
                                                <span className="small text-muted">{invoiceTarget.categoryName || "Sports Venue"} Facility Booking</span>
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

                            <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4 justify-content-between print-hidden">
                                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setInvoiceTarget(null)}>Close</button>
                                <button type="button" className="btn btn-success text-white px-4 rounded-pill d-flex align-items-center gap-2 fw-semibold" onClick={handlePrintInvoice}>
                                    <FaPrint /> Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default UserBookings;
