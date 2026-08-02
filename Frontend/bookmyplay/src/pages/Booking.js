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

    const [couponCodeInput, setCouponCodeInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");

    const [booking, setBooking] = useState({
        userId: user.id,
        venueId: Number(id),
        bookingDate: "",
        startTime: "",
        endTime: "",
        totalPrice: 0,
        slotId: "",
        couponCode: ""
    });

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        try {
            setCouponError("");
            const res = await axios.get(`http://localhost:8080/api/coupons/validate?code=${couponCodeInput.trim()}`);
            const coupon = res.data;

            const originalPrice = venue.pricePerHour;
            const discountPercentage = coupon.discount;
            const discountAmount = (originalPrice * discountPercentage) / 100;
            const finalAmount = originalPrice - discountAmount;

            setAppliedCoupon(coupon);
            setBooking(prev => ({
                ...prev,
                totalPrice: finalAmount,
                couponCode: coupon.couponCode
            }));

            window.Swal.fire({
                icon: "success",
                title: "Coupon Applied!",
                text: `Coupon ${coupon.couponCode} applied successfully. Discount: ${coupon.discount}%`,
                showConfirmButton: false,
                timer: 2000
            });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data || "Invalid Coupon Code";
            setCouponError(msg);
            window.Swal.fire({
                icon: "error",
                title: "Coupon Error",
                text: msg,
                confirmButtonText: "OK"
            });
            setAppliedCoupon(null);
            setBooking(prev => ({
                ...prev,
                totalPrice: venue.pricePerHour,
                couponCode: ""
            }));
        }
    };

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
            window.Swal.fire({
                icon: "warning",
                title: "Slot Required",
                text: "Please select a time slot first.",
                confirmButtonText: "OK"
            });
            return;
        }

        setLoading(true);

        try {
            // Load Razorpay checkout script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                window.Swal.fire({
                    icon: "error",
                    title: "SDK Error",
                    text: "Failed to load Razorpay SDK. Verify internet connectivity.",
                    confirmButtonText: "OK"
                });
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
                        await window.Swal.fire({
                            icon: "success",
                            title: "Booking Successful!",
                            text: "Your venue has been booked successfully.",
                            showConfirmButton: false,
                            timer: 2000
                        });
                        navigate("/user/bookings");
                    } catch (verifyError) {
                        console.error(verifyError);
                        await window.Swal.fire({
                            icon: "error",
                            title: "Verification Failed",
                            text: "Transaction signature verification failed.",
                            confirmButtonText: "OK"
                        });
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
            await window.Swal.fire({
                icon: "error",
                title: "Booking Failed",
                text: error.response?.data?.message || error.response?.data || "Booking transaction failed.",
                confirmButtonText: "OK"
            });
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

                                {/* Coupon Section */}
                                <div className="card border border-2 border-primary-subtle rounded-4 p-4 mb-4 bg-white shadow-sm">
                                    <h5 className="fw-bold mb-3 text-primary d-flex align-items-center">🏷️ Have a Coupon?</h5>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control rounded-start-3"
                                            placeholder="Enter coupon code"
                                            value={couponCodeInput}
                                            onChange={(e) => setCouponCodeInput(e.target.value)}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary rounded-end-3 fw-bold"
                                            onClick={handleApplyCoupon}
                                            disabled={loading}
                                        >
                                            Apply Coupon
                                        </button>
                                    </div>
                                    {couponError && <div className="text-danger small mt-2">{couponError}</div>}
                                    {appliedCoupon && (
                                        <div className="text-success small mt-2 fw-semibold">
                                            ✓ Coupon "{appliedCoupon.couponCode}" applied successfully!
                                        </div>
                                    )}
                                </div>

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
                                    {appliedCoupon && (
                                        <>
                                            <div className="row mb-2">
                                                <div className="col-6 text-muted">Original Price:</div>
                                                <div className="col-6 fw-semibold text-end">₹ {venue.pricePerHour}</div>
                                            </div>
                                            <div className="row mb-2">
                                                <div className="col-6 text-muted">Discount Percentage:</div>
                                                <div className="col-6 fw-semibold text-end text-success">{appliedCoupon.discount}%</div>
                                            </div>
                                            <div className="row mb-2">
                                                <div className="col-6 text-muted">Discount Amount:</div>
                                                <div className="col-6 fw-semibold text-end text-success">- ₹ {(venue.pricePerHour * appliedCoupon.discount) / 100}</div>
                                            </div>
                                            <hr />
                                        </>
                                    )}
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