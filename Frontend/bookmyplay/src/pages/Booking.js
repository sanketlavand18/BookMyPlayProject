import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBooking } from "../services/bookingService";
import { getVenueById } from "../services/venueService";
import { getSlotsByVenue } from "../services/slotService";
import axios from "axios";
import {
    FaCalendarCheck,
    FaRegMoneyBillAlt,
    FaSpinner,
    FaInfoCircle,
    FaClock
} from "react-icons/fa";

function Booking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [venue, setVenue] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [booking, setBooking] = useState({
        userId: user.id,
        venueId: Number(id),
        bookingDate: "",
        startTime: "",
        endTime: "",
        totalPrice: 0,
        slotId: ""
    });

    useEffect(() => {
        loadVenueDetails();
    }, [id]);

    const loadVenueDetails = async () => {
        try {
            const venueRes = await getVenueById(id);
            setVenue(venueRes.data);

            const slotsRes = await getSlotsByVenue(id);
            // Filter only unbooked slots in the future
            const todayStr = new Date().toISOString().split("T")[0];
            const freeSlots = (slotsRes.data || []).filter(
                (slot) => !slot.booked && slot.slotDate >= todayStr
            );
            setSlots(freeSlots);

            setBooking(prev => ({
                ...prev,
                totalPrice: venueRes.data.pricePerHour
            }));
        } catch (error) {
            console.error("Error fetching venue details / slots:", error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setBooking(prev => ({
            ...prev,
            slotId: slot.id,
            bookingDate: slot.slotDate,
            startTime: slot.startTime,
            endTime: slot.endTime
        }));
    };

    // Load Razorpay dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!booking.slotId) {
            alert("Please select a time slot first.");
            return;
        }

        setLoading(true);

        try {
            // Load Razorpay checkout script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                alert("Failed to load Razorpay SDK. Verify internet connectivity.");
                setLoading(false);
                return;
            }

            // 1. Create Pending Booking in Database
            const bookingResponse = await createBooking(booking);
            const savedBooking = bookingResponse.data;

            // 2. Create Razorpay Payment Order on Backend
            const orderResponse = await axios.post("http://localhost:8080/api/payment/create-order", {
                bookingId: savedBooking.id,
                amount: savedBooking.totalPrice
            });
            const { orderId, amount, currency } = orderResponse.data;

            // 3. Configure Razorpay Gateway Options
            const options = {
                key: "rzp_test_mockkey12345",
                amount: amount * 100, // in paise
                currency: currency,
                name: "BookMyPlay",
                description: `Payment for booking #${savedBooking.id} at ${savedBooking.venueName}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // 4. Verify transaction signature on backend
                        await axios.post("http://localhost:8080/api/payment/verify", {
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            bookingId: savedBooking.id,
                            amount: savedBooking.totalPrice,
                            paymentMethod: "UPI"
                        });
                        // Send success notification
                        try {
                            await axios.post("http://localhost:8080/api/notifications/send", {
                                userId: user.id,
                                title: "Booking Confirmed! 🏟️",
                                message: `Your booking at ${savedBooking.venueName} for ${savedBooking.bookingDate} (${savedBooking.startTime} - ${savedBooking.endTime}) is successful.`,
                                type: "BOOKING"
                            });
                        } catch (notifErr) {
                            console.error("Failed to send notification:", notifErr);
                        }
                        alert("Payment successful! Booking confirmed. 🎉");
                        navigate("/user");
                    } catch (verifyError) {
                        console.error(verifyError);
                        alert("Transaction signature verification failed.");
                    }
                },
                prefill: {
                    name: user.fullName || "User",
                    email: user.email || "user@bookmyplay.com",
                    contact: user.phone || "9999999999"
                },
                theme: {
                    color: "#0d6efd"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || error.response?.data || "Booking transaction failed.");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" />
                <h5 className="mt-3 text-muted">Loading checkout details...</h5>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-lg border-0 rounded-4">
                        
                        <div className="card-header bg-primary text-white text-center py-3">
                            <h2 className="mb-0 fw-bold">Venue Checkout</h2>
                        </div>

                        <div className="card-body p-5">
                            {venue && (
                                <div className="alert alert-primary-subtle border-0 rounded-3 mb-4 d-flex align-items-center">
                                    <FaInfoCircle className="text-primary fs-4 me-3" />
                                    <div>
                                        <h5 className="mb-0 fw-bold">{venue.venueName}</h5>
                                        <p className="small text-muted mb-0">📍 {venue.address}, {venue.city}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                
                                {/* Slot Selection Dropdown Grid */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark d-flex align-items-center"><FaClock className="me-2 text-primary" /> Select Available Time Slot</label>
                                    {slots.length === 0 ? (
                                        <div className="alert alert-warning small text-center">No available booking slots for this venue today.</div>
                                    ) : (
                                        <div className="row g-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                            {slots.map((slot) => (
                                                <div className="col-md-6 col-lg-4" key={slot.id}>
                                                    <button
                                                        type="button"
                                                        className={`btn w-100 text-start py-2 border rounded-3 ${selectedSlot?.id === slot.id ? "btn-primary text-white shadow-sm" : "btn-outline-secondary"}`}
                                                        onClick={() => handleSlotSelect(slot)}
                                                        style={{ fontSize: "0.85rem" }}
                                                    >
                                                        <strong>🕒 {slot.startTime} - {slot.endTime}</strong>
                                                        <div className="small opacity-75">{slot.slotDate}</div>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <hr className="my-4" />

                                {/* Booking Summary Box */}
                                <div className="card bg-light border-0 rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center"><FaCalendarCheck className="text-success me-2" /> Booking Summary</h5>
                                    
                                    <div className="row mb-2">
                                        <div className="col-6 text-muted">Customer Name:</div>
                                        <div className="col-6 fw-semibold text-end">{user.fullName}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6 text-muted">Chosen Date:</div>
                                        <div className="col-6 fw-semibold text-end">{booking.bookingDate || "-"}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6 text-muted">Timing:</div>
                                        <div className="col-6 fw-semibold text-end">
                                            {booking.startTime ? `${booking.startTime} - ${booking.endTime}` : "-"}
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row">
                                        <div className="col-6 text-muted fw-bold d-flex align-items-center"><FaRegMoneyBillAlt className="me-2 text-success" /> Amount Pay:</div>
                                        <div className="col-6 fw-bold text-success text-end fs-4">₹ {booking.totalPrice}</div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success btn-lg w-100 py-3 fw-bold rounded-3 shadow d-flex align-items-center justify-content-center"
                                    disabled={loading || !booking.slotId}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="spinner-border spinner-border-sm me-2" /> Initiating Gateway...
                                        </>
                                    ) : (
                                        `Pay & Book Venue`
                                    )}
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking;