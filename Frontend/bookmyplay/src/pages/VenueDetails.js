import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVenueById } from "../services/venueService";
import { getSlotsByVenue } from "../services/slotService";
import Navbar from "../components/Navbar";
import { createBooking } from "../services/bookingService";
import axios from "axios";
import {
    FaMapMarkerAlt,
    FaMap,
    FaGlobe,
    FaClock,
    FaLocationArrow,
    FaArrowLeft,
    FaArrowRight,
    FaSpinner,
    FaCalendarAlt,
    FaParking,
    FaRestroom,
    FaTint,
    FaLightbulb,
    FaDoorClosed,
    FaChair
} from "react-icons/fa";

function VenueDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [venue, setVenue] = useState(null);
    const [slots, setSlots] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

    const mapContainerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapLoadError, setMapLoadError] = useState(false);

    useEffect(() => {
        loadVenueDetails();
    }, [id]);

    useEffect(() => {
        if (id) {
            loadSlots();
        }
    }, [id, selectedDate]);

    useEffect(() => {
        if (venue && venue.latitude && venue.longitude) {
            if (googleMapsApiKey) {
                initGoogleMap();
            } else {
                setMapLoadError(true);
            }
        }
    }, [venue]);

    const loadVenueDetails = async () => {
        try {
            setLoading(true);
            const venueResponse = await getVenueById(id);
            setVenue(venueResponse.data);

            // Fetch reviews dynamically
            try {
                const reviewsRes = await axios.get(`http://localhost:8080/api/reviews/${id}`);
                setReviews(reviewsRes.data || []);
            } catch (err) {
                console.error("Error loading reviews:", err);
            }
        } catch (error) {
            console.error("Error loading venue details:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadSlots = async () => {
        try {
            const slotResponse = await getSlotsByVenue(id, selectedDate);
            setSlots(slotResponse.data || []);
            setSelectedSlot(null); // Reset selection on date change
        } catch (error) {
            console.error("Error loading slots:", error);
        }
    };

    const initGoogleMap = () => {
        if (window.google && window.google.maps) {
            renderMap();
            return;
        }

        const scriptId = "google-maps-script";
        let script = document.getElementById(scriptId);

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        script.addEventListener("load", () => {
            renderMap();
        });

        script.addEventListener("error", () => {
            setMapLoadError(true);
        });
    };

    const renderMap = () => {
        try {
            if (!mapContainerRef.current || !venue) return;

            const position = {
                lat: parseFloat(venue.latitude),
                lng: parseFloat(venue.longitude)
            };

            const map = new window.google.maps.Map(mapContainerRef.current, {
                center: position,
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false
            });

            new window.google.maps.Marker({
                position: position,
                map: map,
                title: venue.venueName
            });

            setMapLoaded(true);
        } catch (e) {
            console.error("Error rendering map:", e);
            setMapLoadError(true);
        }
    };

    const handleConfirmBooking = async () => {
        if (!user || !user.id) {
            alert("Please login first to book a slot.");
            navigate("/login");
            return;
        }

        if (!selectedSlot) {
            alert("Please select a slot to book.");
            return;
        }

        try {
            const booking = {
                userId: user.id,
                venueId: venue.id,
                bookingDate: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                slotId: selectedSlot.id
            };

            await createBooking(booking);
            alert("Booking Confirmed Successfully!");
            setSelectedSlot(null);
            loadSlots();
        } catch (error) {
            console.error(error);
            alert(error.response?.data || "Booking Failed");
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80";
        if (path.startsWith("http")) return path;
        return `http://localhost:8080${path}`;
    };

    const formatTimeSlot = (timeObj) => {
        if (!timeObj) return "";
        if (Array.isArray(timeObj)) {
            let [hour, minute] = timeObj;
            let ampm = hour >= 12 ? 'PM' : 'AM';
            let formattedHour = hour % 12 || 12;
            let formattedMinute = String(minute).padStart(2, '0');
            return `${formattedHour}:${formattedMinute} ${ampm}`;
        }
        if (typeof timeObj === 'string') {
            let parts = timeObj.split(':');
            let hour = parseInt(parts[0], 10);
            let minute = parseInt(parts[1], 10);
            let ampm = hour >= 12 ? 'PM' : 'AM';
            let formattedHour = hour % 12 || 12;
            let formattedMinute = String(minute).padStart(2, '0');
            return `${formattedHour}:${formattedMinute} ${ampm}`;
        }
        return timeObj;
    };

    const getAmenityIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes("parking")) return <FaParking className="text-primary me-2" />;
        if (lower.includes("washroom")) return <FaRestroom className="text-primary me-2" />;
        if (lower.includes("water")) return <FaTint className="text-primary me-2" />;
        if (lower.includes("light")) return <FaLightbulb className="text-primary me-2" />;
        if (lower.includes("room")) return <FaDoorClosed className="text-primary me-2" />;
        if (lower.includes("seat")) return <FaChair className="text-primary me-2" />;
        return null;
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
                <h3 className="mt-3 text-muted">Loading venue details...</h3>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="container mt-5 text-center py-5">
                <h3 className="text-danger">Venue Not Found</h3>
            </div>
        );
    }

    // Resolve images
    const venueImages = venue.images && venue.images.length > 0
        ? venue.images.map(img => img.imagePath)
        : venue.imageUrl
            ? [venue.imageUrl]
            : [];

    // Parse description and amenities
    let cleanDescription = venue.description || "";
    let parsedAmenities = [];
    const parts = cleanDescription.split("Amenities:");
    if (parts.length > 1) {
        cleanDescription = parts[0].trim();
        parsedAmenities = parts[1].split(",").map(a => a.trim()).filter(Boolean);
    }

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <div className="row g-4">

                    {/* Left Side: Images & Info */}
                    <div className="col-lg-8">

                        {/* Image Gallery/Carousel */}
                        <div className="card border-0 shadow-sm overflow-hidden mb-4 rounded-4 position-relative">
                            {venueImages.length === 0 ? (
                                <img
                                    src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80"
                                    alt="Placeholder"
                                    className="w-100"
                                    style={{ height: "450px", objectFit: "cover" }}
                                />
                            ) : (
                                <img
                                    src={getImageUrl(venueImages[activeImageIdx])}
                                    alt={venue.venueName}
                                    className="w-100"
                                    style={{ height: "450px", objectFit: "cover", transition: "all 0.3s" }}
                                />
                            )}

                            {venueImages.length > 1 && (
                                <>
                                    <button
                                        className="btn btn-dark rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 p-2 border-0 opacity-75"
                                        onClick={() => setActiveImageIdx(prev => (prev === 0 ? venueImages.length - 1 : prev - 1))}
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <button
                                        className="btn btn-dark rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 p-2 border-0 opacity-75"
                                        onClick={() => setActiveImageIdx(prev => (prev === venueImages.length - 1 ? 0 : prev + 1))}
                                    >
                                        <FaArrowRight />
                                    </button>
                                </>
                            )}

                            {venueImages.length > 1 && (
                                <div className="p-3 bg-light d-flex gap-2 overflow-x-auto justify-content-center border-top">
                                    {venueImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getImageUrl(img)}
                                            alt="Thumbnail"
                                            className={`rounded border border-2 cursor-pointer ${activeImageIdx === idx ? "border-primary" : "border-transparent opacity-75"}`}
                                            style={{ width: "60px", height: "40px", objectFit: "cover", cursor: "pointer" }}
                                            onClick={() => setActiveImageIdx(idx)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Venue Details */}
                        <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h1 className="fw-bold mb-0 text-dark">{venue.venueName}</h1>
                                <span className="badge bg-success fs-6 py-2 px-3">
                                    {venue.category?.categoryName || venue.sport}
                                </span>
                            </div>

                            <div className="d-flex align-items-center text-muted mb-3">
                                <FaMapMarkerAlt className="text-primary me-2" />
                                <span className="fs-5">{venue.address}, {venue.city}</span>
                            </div>

                            <hr />

                            <h4 className="fw-bold mb-3 text-dark">About Turf / Venue</h4>
                            <p className="fs-5 text-secondary" style={{ lineHeight: "1.7" }}>
                                {cleanDescription || "No description provided for this venue."}
                            </p>

                            <hr />

                            {venue.openTime && venue.closeTime && (
                                <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-3">
                                    <FaClock className="text-info fs-4" />
                                    <div>
                                        <h6 className="mb-0 fw-bold">Operating Hours</h6>
                                        <span className="text-muted">{venue.openTime} to {venue.closeTime}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Amenities Section */}
                        {parsedAmenities.length > 0 && (
                            <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
                                <h4 className="fw-bold mb-3 text-dark">Amenities</h4>
                                <div className="row g-3">
                                    {parsedAmenities.map((amenity, idx) => (
                                        <div key={idx} className="col-6 col-md-4">
                                            <div className="d-flex align-items-center bg-light p-3 rounded-3 border">
                                                {getAmenityIcon(amenity)}
                                                <span className="fw-semibold text-dark">{amenity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customer Reviews Section */}
                        <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
                            <h4 className="fw-bold mb-4 text-dark">
                                ⭐ Customer Reviews ({reviews.length})
                            </h4>
                            {reviews.length === 0 ? (
                                <p className="text-muted small">No reviews written for this venue yet.</p>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {reviews.map((r) => (
                                        <div key={r.id} className="border-bottom pb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <strong className="text-dark">{r.userName || "Anonymous Customer"}</strong>
                                                <span className="text-warning fw-semibold">
                                                    {Array.from({ length: r.rating }).map((_, idx) => "★")}
                                                    {Array.from({ length: 5 - r.rating }).map((_, idx) => "☆")}
                                                </span>
                                            </div>
                                            <p className="text-secondary small mb-1">"{r.comment}"</p>
                                            <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                                {new Date(r.createdAt || r.createdDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Map & Booking Slots */}
                    <div className="col-lg-4">

                        {venue.latitude && venue.longitude && (
                            <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
                                <h4 className="fw-bold mb-3 text-dark d-flex align-items-center">
                                    <FaMap className="me-2 text-warning" /> Venue Location
                                </h4>

                                <div
                                    ref={mapContainerRef}
                                    style={{ height: "220px", background: "#e9ecef" }}
                                    className="rounded-3 mb-3 border"
                                >
                                    {mapLoadError && (
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-2 text-center">
                                            <FaMap className="fs-2 mb-2 text-secondary" />
                                            <span className="small">Google Map Preview Unavailable</span>
                                        </div>
                                    )}
                                </div>

                                <a
                                    href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary w-100 fw-bold d-flex align-items-center justify-content-center"
                                >
                                    <FaLocationArrow className="me-2" /> Navigate on Google Maps
                                </a>
                            </div>
                        )}

                        {/* Slot Booking Panel */}
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                            <div className="mb-3">
                                <span className="text-muted d-block small">Hourly Price</span>
                                <h2 className="text-success fw-bold mb-0 d-inline-block">
                                    ₹ {venue.pricePerHour}
                                </h2>
                                <span className="text-muted fs-6"> / Hour</span>
                            </div>

                            {/* Date Picker */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark d-flex align-items-center gap-2">
                                    <FaCalendarAlt className="text-primary" /> Select Booking Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control rounded-3"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                />
                            </div>

                            <h5 className="fw-bold mb-3">Available Slots</h5>

                            {/* Responsive Slot Grid */}
                            <div className="row g-2 mb-4" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                {slots.length === 0 ? (
                                    <div className="col-12">
                                        <div className="alert alert-warning text-center py-3 mb-0 rounded-3">
                                            No Slots Available
                                        </div>
                                    </div>
                                ) : (
                                    slots.map((slot) => {
                                        const isBooked = slot.booked || slot.isBooked;
                                        const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime;
                                        let btnClass = "btn-success text-white"; // Available

                                        if (isBooked) {
                                            btnClass = "btn-dark text-white opacity-50 cursor-not-allowed"; // Booked
                                        } else if (isSelected) {
                                            btnClass = "btn-warning text-dark fw-bold border-2 border-dark"; // Selected
                                        }

                                        return (
                                            <div className="col-6 col-md-4 col-lg-6" key={slot.id}>
                                                <button
                                                    className={`btn w-100 py-3 rounded-3 shadow-sm border-0 d-flex flex-column align-items-center justify-content-center ${btnClass}`}
                                                    disabled={isBooked}
                                                    style={{ minHeight: "75px" }}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    <span className="small fw-bold">
                                                        {formatTimeSlot(slot.startTime)}
                                                    </span>
                                                    <span className="small opacity-75">
                                                        {formatTimeSlot(slot.endTime)}
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Selected slot information */}
                            {selectedSlot ? (
                                <div className="bg-light p-3 rounded-3 mb-3 border">
                                    <span className="small text-muted d-block">Selected Session:</span>
                                    <strong className="text-dark d-block">
                                        📅 {selectedDate} | ⏰ {formatTimeSlot(selectedSlot.startTime)} - {formatTimeSlot(selectedSlot.endTime)}
                                    </strong>
                                    <span className="small text-success d-block fw-bold mt-1">
                                        Total: ₹ {venue.pricePerHour}
                                    </span>
                                </div>
                            ) : null}

                            <button
                                className="btn btn-success w-100 py-3 fw-bold rounded-pill shadow-sm"
                                disabled={!selectedSlot}
                                onClick={handleConfirmBooking}
                            >
                                Confirm & Book Now
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default VenueDetails;