import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, rescheduleBooking } from "../services/bookingService";
import { getSlotsByVenue } from "../services/slotService";
import axios from "axios";
import {
    FaCalendarAlt,
    FaCalendarCheck,
    FaTimes,
    FaPrint,
    FaRegFileAlt,
    FaSpinner,
    FaInfoCircle
} from "react-icons/fa";

function MyBookings() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [bookings, setBookings] = useState([]);
    
    // Reschedule states
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // Invoice states
    const [invoiceTarget, setInvoiceTarget] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await getMyBookings(user.id);
            // Sort bookings so newest are first
            const sorted = (response.data || []).sort((a, b) => b.id - a.id);
            setBookings(sorted);
        } catch (error) {
            console.log(error);
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
            alert(response.data);
            loadBookings();
        } catch (error) {
            console.log(error);
            alert("Unable to cancel booking.");
        }
    };

    const openRescheduleModal = async (booking) => {
        setRescheduleTarget(booking);
        setSlotsLoading(true);
        try {
            const response = await getSlotsByVenue(booking.venueId);
            // Filter only unbooked, future slots
            const todayStr = new Date().toISOString().split("T")[0];
            const unbookedSlots = (response.data || []).filter(
                (slot) => !slot.booked && slot.slotDate >= todayStr
            );
            setAvailableSlots(unbookedSlots);
        } catch (error) {
            console.error("Error loading available slots:", error);
            alert("Failed to load available slots.");
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
            alert(response.data);
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

    return (
        <div className="container mt-4">
            <h2 className="mb-4 d-flex align-items-center">
                <FaCalendarAlt className="me-3 text-primary" /> My Bookings
            </h2>

            {bookings.length === 0 ? (
                <div className="alert alert-warning text-center p-5 rounded-4 shadow-sm bg-white">
                    <FaInfoCircle className="fs-2 mb-3 text-warning" />
                    <h4>No Bookings Found</h4>
                    <p className="text-muted mb-0">You have not booked any sports venues yet.</p>
                </div>
            ) : (
                <div className="row">
                    {bookings.map((booking) => (
                        <div className="col-12 col-md-6 col-lg-6 mb-4" key={booking.id}>
                            <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden" style={{ transition: "transform 0.2s" }}>
                                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                                    <span className="fw-semibold small">ID: #{booking.id}</span>
                                    <span className={`badge px-3 py-2 text-uppercase ${
                                        booking.bookingStatus === "CONFIRMED"
                                            ? "bg-success"
                                            : booking.bookingStatus === "COMPLETED"
                                            ? "bg-primary"
                                            : "bg-danger"
                                    }`}>
                                        {booking.bookingStatus}
                                    </span>
                                </div>
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-3">{booking.venueName}</h4>
                                    
                                    <div className="mb-2 text-muted small">
                                        📍 <strong>Location:</strong> {booking.city}
                                    </div>
                                    <div className="mb-2 text-muted small">
                                        📅 <strong>Date:</strong> {booking.bookingDate}
                                    </div>
                                    <div className="mb-2 text-muted small">
                                        ⏰ <strong>Time Slot:</strong> {booking.startTime} - {booking.endTime}
                                    </div>
                                    <div className="mb-4 text-success fs-5 fw-bold">
                                        ₹ {booking.totalPrice}
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 justify-content-between border-top pt-3">
                                        <button
                                            onClick={() => setInvoiceTarget(booking)}
                                            className="btn btn-outline-dark btn-sm rounded-pill px-3 d-flex align-items-center"
                                        >
                                            <FaRegFileAlt className="me-1" /> View Invoice
                                        </button>

                                        {booking.bookingStatus === "CONFIRMED" && (
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => openRescheduleModal(booking)}
                                                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                                >
                                                    Reschedule
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* RESCHEDULE MODAL */}
            {rescheduleTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <div className="modal-header bg-primary text-white border-0 py-3 rounded-top-4">
                                <h5 className="modal-title fw-bold">Reschedule Booking</h5>
                                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setRescheduleTarget(null)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                <p className="small text-muted mb-3">Choose a new available time slot for <strong>{rescheduleTarget.venueName}</strong>.</p>
                                
                                {slotsLoading ? (
                                    <div className="text-center py-4">
                                        <FaSpinner className="spinner-border text-primary fs-3" />
                                        <p className="mt-2 text-muted small">Loading free slots...</p>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="alert alert-warning text-center small py-3">No alternative slots available for this venue right now.</div>
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
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
                            
                            {/* Invoice Printable Content */}
                            <div className="p-5" id="printable-invoice-container bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                    <div>
                                        <h2 className="fw-bold text-primary mb-1">BOOK MY PLAY</h2>
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
                                <button type="button" className="btn btn-primary px-4 rounded-pill d-flex align-items-center" onClick={handlePrintInvoice}>
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

export default MyBookings;