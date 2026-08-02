import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVenueById } from "../services/venueService";
import { getSlotsByVenue } from "../services/slotService";
import { createBooking } from "../services/bookingService";
import axios from "axios";
import {
    FaMapMarkerAlt,
    FaMap,
    FaClock,
    FaArrowLeft,
    FaArrowRight,
    FaSpinner,
    FaCalendarAlt,
    FaParking,
    FaRestroom,
    FaTint,
    FaLightbulb,
    FaDoorClosed,
    FaChair,
    FaStar,
    FaHeart,
    FaRegHeart,
    FaChevronRight,
    FaChevronLeft,
    FaBuilding,
    FaWifi,
    FaVideo,
    FaFirstAid,
    FaLock,
    FaCoffee,
    FaRunning,
    FaBookOpen,
    FaCheckCircle,
    FaTimesCircle,
    FaUser,
    FaPhoneAlt
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

function VenueDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [venue, setVenue] = useState(null);
    const [slots, setSlots] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reviews pagination
    const [reviewsPage, setReviewsPage] = useState(1);
    const reviewsPerPage = 5;

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    };
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [selectedDate, setSelectedDate] = useState(getLocalTodayStr());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [similarVenues, setSimilarVenues] = useState([]);

    // Lightbox image zoom
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImg, setLightboxImg] = useState("");

    // Coupon states
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponSuccess, setCouponSuccess] = useState("");
    const [couponError, setCouponError] = useState("");

    // Booking trigger state
    const [bookingInProgress, setBookingInProgress] = useState(false);

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
        if (venue && user.id) {
            checkIfFavorite();
        }
    }, [venue, user.id]);

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
            const venueData = venueResponse.data;
            setVenue(venueData);

            // Load similar venues of same category
            if (venueData && venueData.category?.id) {
                loadSimilarVenues(venueData.category.id);
            }

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

    const loadSimilarVenues = async (categoryId) => {
        try {
            const res = await axios.get("http://localhost:8080/api/venues");
            const list = res.data || [];
            // Filter by same category, exclude current venue, take top 3
            const filtered = list.filter(v => v.id !== parseInt(id) && v.category?.id === categoryId).slice(0, 3);
            setSimilarVenues(filtered);
        } catch (e) {
            console.error("Error loading similar venues:", e);
        }
    };

    const loadSlots = async () => {
        if (selectedDate < getLocalTodayStr() || selectedDate > getLocalMaxDateStr()) {
            setSlots([]);
            setSelectedSlots([]);
            return;
        }

        try {
            const slotResponse = await getSlotsByVenue(id, selectedDate);
            let fetchedSlots = slotResponse.data || [];

            // Filter expired slots for today
            if (selectedDate === getLocalTodayStr()) {
                const nowTime = new Date();
                const nowHour = nowTime.getHours();
                const nowMin = nowTime.getMinutes();

                fetchedSlots = fetchedSlots.filter(s => {
                    const [sh, sm] = s.startTime.split(":").map(Number);
                    return sh > nowHour || (sh === nowHour && sm > nowMin);
                });
            }

            setSlots(fetchedSlots);
            setSelectedSlots([]); // Reset selection on date change
        } catch (error) {
            console.error("Error loading slots:", error);
            setSlots([]);
            setSelectedSlots([]);
        }
    };

    const checkIfFavorite = () => {
        const favs = localStorage.getItem(`bmp_favs_${user.id}`);
        if (favs) {
            const arr = JSON.parse(favs);
            const found = arr.some(v => v.id === venue.id);
            setIsFavorite(found);
        }
    };

    const handleToggleFavorite = () => {
        if (!user.id) {
            window.Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please login first to save favorite venues.",
                confirmButtonColor: "#198754"
            });
            navigate("/login");
            return;
        }

        const favs = localStorage.getItem(`bmp_favs_${user.id}`);
        let arr = favs ? JSON.parse(favs) : [];

        if (isFavorite) {
            arr = arr.filter(v => v.id !== venue.id);
            setIsFavorite(false);
            window.Swal.fire({
                icon: "success",
                title: "Removed",
                text: "Venue removed from favorites.",
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            arr.push(venue);
            setIsFavorite(true);
            window.Swal.fire({
                icon: "success",
                title: "Saved",
                text: "Venue saved to favorites!",
                timer: 1500,
                showConfirmButton: false
            });
        }

        localStorage.setItem(`bmp_favs_${user.id}`, JSON.stringify(arr));
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

            const latVal = parseFloat(venue.latitude);
            const lngVal = parseFloat(venue.longitude);
            if (isNaN(latVal) || isNaN(lngVal)) {
                setMapLoadError(true);
                return;
            }

            const position = { lat: latVal, lng: lngVal };

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

    // Slot duration helpers
    const getSlotDurationInMinutes = (slot) => {
        if (!slot || !slot.startTime || !slot.endTime) return 30;
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;
        return endMin - startMin;
    };

    const areSlotsConsecutive = (selected) => {
        if (selected.length <= 1) return true;
        const sorted = [...selected].sort((a, b) => a.startTime.localeCompare(b.startTime));
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].endTime !== sorted[i+1].startTime) {
                return false;
            }
        }
        return true;
    };

    const handleSlotClick = (slot) => {
        if (selectedSlots.some(s => s.id === slot.id)) {
            const remaining = selectedSlots.filter(s => s.id !== slot.id);
            if (remaining.length === 0) {
                setSelectedSlots([]);
            } else if (areSlotsConsecutive(remaining)) {
                setSelectedSlots(remaining);
            } else {
                setSelectedSlots([]); // Clear selection if deselect splits selection
            }
        } else {
            if (selectedSlots.length === 0) {
                setSelectedSlots([slot]);
            } else {
                const newSelection = [...selectedSlots, slot];
                if (areSlotsConsecutive(newSelection)) {
                    setSelectedSlots(newSelection);
                } else {
                    setSelectedSlots([slot]); // Reset selection to clicked slot if non-consecutive
                }
            }
        }
    };

    // Coupon validations
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code.");
            setCouponSuccess("");
            return;
        }
        try {
            const res = await axios.get(`http://localhost:8080/api/coupons/validate?code=${couponCode.trim()}`);
            setAppliedCoupon(res.data);
            setCouponSuccess(`Coupon applied successfully! You saved ${res.data.discount}%.`);
            setCouponError("");
        } catch (e) {
            setCouponError(e.response?.data || "Invalid coupon code.");
            setCouponSuccess("");
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponSuccess("");
        setCouponError("");
    };

    // Booking Submission Flow
    const handleConfirmBooking = async () => {
        if (!user || !user.id) {
            window.Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please login to book a slot.",
                confirmButtonColor: "#198754"
            });
            navigate("/login");
            return;
        }

        if (selectedSlots.length === 0) {
            window.Swal.fire({
                icon: "warning",
                title: "No Slots Selected",
                text: "Please select at least one play slot to proceed.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        setBookingInProgress(true);

        try {
            // Book slots in sequence
            for (const slot of selectedSlots) {
                const bookingPayload = {
                    userId: user.id,
                    venueId: venue.id,
                    bookingDate: selectedDate,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    slotId: slot.id,
                    couponCode: appliedCoupon ? appliedCoupon.couponCode : null
                };
                await createBooking(bookingPayload);
            }

            // Send consolidated notification
            try {
                await axios.post("http://localhost:8080/api/notifications/send", {
                    userId: user.id,
                    title: "Booking Confirmed 🎉",
                    message: `Successfully booked ${selectedSlots.length} slot(s) for ${venue.venueName} on ${selectedDate}.`,
                    type: "BOOKING"
                });
            } catch (e) {
                console.error("Failed to send notification:", e);
            }

            await window.Swal.fire({
                icon: "success",
                title: "Booking Confirmed!",
                text: `Successfully booked ${selectedSlots.length} slots for ${selectedDate}.`,
                confirmButtonColor: "#198754"
            });

            setSelectedSlots([]);
            loadSlots();
        } catch (error) {
            console.error("Booking error:", error);
            window.Swal.fire({
                icon: "error",
                title: "Booking Failed",
                text: error.response?.data || "An error occurred while booking.",
                confirmButtonColor: "#dc3545"
            });
        } finally {
            setBookingInProgress(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80";
        if (path.startsWith("http")) return path;
        return `http://localhost:8080${path}`;
    };

    const formatTimeSlot = (timeObj) => {
        if (!timeObj) return "";
        try {
            if (typeof timeObj === 'string') {
                let parts = timeObj.split(':');
                let hour = parseInt(parts[0], 10);
                let minute = parseInt(parts[1], 10);
                let ampm = hour >= 12 ? 'PM' : 'AM';
                let formattedHour = hour % 12 || 12;
                let formattedMinute = String(minute).padStart(2, '0');
                return `${formattedHour}:${formattedMinute} ${ampm}`;
            }
        } catch (e) {
            console.error(e);
        }
        return timeObj;
    };

    const getStatusLabel = () => {
        if (!venue) return { text: "Closed", class: "bg-danger" };
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeVal = currentHours * 60 + currentMinutes;

        const parseTimeStr = (str) => {
            const parts = str.split(" ");
            const [h, m] = parts[0].split(":").map(Number);
            let hour = h;
            if (parts[1]?.toUpperCase() === "PM" && hour !== 12) hour += 12;
            if (parts[1]?.toUpperCase() === "AM" && hour === 12) hour = 0;
            return hour * 60 + m;
        };

        try {
            const openVal = parseTimeStr(venue.openTime);
            const closeVal = parseTimeStr(venue.closeTime);
            if (currentTimeVal >= openVal && currentTimeVal <= closeVal) {
                return { text: "Open Now", class: "bg-success" };
            }
        } catch (e) {
            console.error("Error parsing times:", e);
        }
        return { text: "Closed", class: "bg-danger" };
    };

    const getSimilarVenueRating = (simVenue) => {
        if (!simVenue.reviews || simVenue.reviews.length === 0) return "4.5";
        const sum = simVenue.reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / simVenue.reviews.length).toFixed(1);
    };

    // Calculate total duration in hours and total price
    const totalDurationMinutes = selectedSlots.reduce((acc, slot) => acc + getSlotDurationInMinutes(slot), 0);
    const totalHours = (totalDurationMinutes / 60).toFixed(1);

    const basePriceAmount = venue ? (venue.pricePerHour * totalDurationMinutes) / 60 : 0;
    const discountAmount = appliedCoupon ? (basePriceAmount * appliedCoupon.discount) / 100 : 0;
    const platformFee = selectedSlots.length > 0 ? 20 : 0;
    const gstAmount = selectedSlots.length > 0 ? Math.round((basePriceAmount - discountAmount) * 0.18 * 100) / 100 : 0;
    const grandTotal = basePriceAmount - discountAmount + platformFee + gstAmount;

    if (loading) {
        return (
            <div className="container py-5 my-5 text-center">
                <FaSpinner className="spinner-border text-success fs-2 mb-3" role="status" />
                <h4 className="text-muted">Loading arena layout details...</h4>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="container py-5 text-center">
                <h3 className="text-danger fw-bold">Venue Not Found</h3>
                <Link to="/" className="btn btn-success rounded-pill px-4 mt-3">Back to Search</Link>
            </div>
        );
    }

    const venueImages = venue.images && venue.images.length > 0
        ? venue.images.map(img => img.imagePath)
        : venue.imageUrl
            ? [venue.imageUrl]
            : [];

    let cleanDescription = venue.description || "";
    let parsedAmenities = [];
    let parsedRules = "";
    let parsedContact = {
        person: "",
        phone: "",
        altPhone: "",
        email: ""
    };

    // Parse Contact Info
    const contactParts = cleanDescription.split("Contact Information:");
    if (contactParts.length > 1) {
        const contactText = contactParts[1].trim();
        cleanDescription = contactParts[0].trim();
        const lines = contactText.split("\n");
        lines.forEach(line => {
            if (line.startsWith("Person:")) parsedContact.person = line.replace("Person:", "").trim();
            else if (line.startsWith("Phone:")) parsedContact.phone = line.replace("Phone:", "").trim();
            else if (line.startsWith("AltPhone:")) parsedContact.altPhone = line.replace("AltPhone:", "").trim();
            else if (line.startsWith("Email:")) parsedContact.email = line.replace("Email:", "").trim();
        });
    }

    // Parse Rules
    const rulesParts = cleanDescription.split("Rules:");
    if (rulesParts.length > 1) {
        parsedRules = rulesParts[1].trim();
        cleanDescription = rulesParts[0].trim();
    }

    // Parse Amenities
    const amenitiesParts = cleanDescription.split("Amenities:");
    if (amenitiesParts.length > 1) {
        cleanDescription = amenitiesParts[0].trim();
        parsedAmenities = amenitiesParts[1].split(",").map(a => a.trim().toLowerCase()).filter(Boolean);
    }

    const totalRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : "N/A";
    const sortedReviews = [...reviews].sort((a, b) => b.id - a.id);
    const totalReviewsPages = Math.ceil(sortedReviews.length / reviewsPerPage);
    const statusInfo = getStatusLabel();

    const AMENITY_LIST = [
        { key: "parking", label: "Parking Space", icon: <FaParking /> },
        { key: "washroom", label: "Clean Washroom", icon: <FaRestroom /> },
        { key: "water", label: "Drinking Water", icon: <FaTint /> },
        { key: "light", label: "Flood Lights", icon: <FaLightbulb /> },
        { key: "room", label: "Changing Room", icon: <FaDoorClosed /> },
        { key: "seat", label: "Seating Area", icon: <FaChair /> },
        { key: "wi-fi", label: "Free Wi-Fi", icon: <FaWifi /> },
        { key: "cctv", label: "CCTV Security", icon: <FaVideo /> },
        { key: "first aid", label: "First Aid Kit", icon: <FaFirstAid /> },
        { key: "locker", label: "Locker Rooms", icon: <FaLock /> },
        { key: "cafeteria", label: "Snack Cafeteria", icon: <FaCoffee /> },
        { key: "equipment rental", label: "Equipment Rental", icon: <FaRunning /> }
    ];

    return (
        <div className="bg-light pb-5">
            {/* Carousel Hero Banner Section */}
            <div className="position-relative bg-dark" style={{ height: "480px" }}>
                <div className="w-100 h-100 overflow-hidden">
                    {venueImages.length === 0 ? (
                        <img
                            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80"
                            alt="Placeholder"
                            className="w-100 h-100"
                            style={{ objectFit: "cover", opacity: "0.6" }}
                        />
                    ) : (
                        <img
                            src={getImageUrl(venueImages[activeImageIdx])}
                            alt={venue.venueName}
                            className="w-100 h-100 cursor-zoom"
                            style={{ objectFit: "cover", opacity: "0.6", transition: "all 0.5s" }}
                            onClick={() => {
                                setLightboxImg(getImageUrl(venueImages[activeImageIdx]));
                                setLightboxOpen(true);
                            }}
                        />
                    )}
                </div>

                {/* Left/Right Carousel Controls */}
                {venueImages.length > 1 && (
                    <>
                        <button
                            className="btn btn-dark rounded-circle position-absolute start-0 top-50 translate-middle-y ms-3 p-2 border-0 opacity-75 d-flex align-items-center justify-content-center"
                            style={{ width: "42px", height: "42px" }}
                            onClick={() => setActiveImageIdx(prev => (prev === 0 ? venueImages.length - 1 : prev - 1))}
                        >
                            <FaArrowLeft />
                        </button>
                        <button
                            className="btn btn-dark rounded-circle position-absolute end-0 top-50 translate-middle-y me-3 p-2 border-0 opacity-75 d-flex align-items-center justify-content-center"
                            style={{ width: "42px", height: "42px" }}
                            onClick={() => setActiveImageIdx(prev => (prev === venueImages.length - 1 ? 0 : prev + 1))}
                        >
                            <FaArrowRight />
                        </button>
                    </>
                )}

                {/* Indicators */}
                {venueImages.length > 1 && (
                    <div className="position-absolute bottom-0 start-0 w-100 d-flex gap-2 justify-content-center p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                        {venueImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIdx(idx)}
                                className={`border-0 rounded-circle ${activeImageIdx === idx ? "bg-success" : "bg-white-50"}`}
                                style={{ width: "10px", height: "10px", padding: 0 }}
                            />
                        ))}
                    </div>
                )}

                {/* Overlay details */}
                <div className="position-absolute bottom-0 start-0 p-4 p-md-5 text-white w-100 d-flex flex-column gap-2" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="badge bg-success py-2 px-3 rounded-pill text-uppercase fw-bold shadow-sm">{venue.category?.categoryName || venue.sport}</span>
                        <span className={`badge ${statusInfo.class} py-2 px-3 rounded-pill fw-bold`}>{statusInfo.text}</span>
                        <span className="badge bg-warning text-dark py-2 px-3 rounded-pill fw-bold d-flex align-items-center gap-1">
                            <FaStar className="mb-0.5" /> {avgRating} ({reviews.length} reviews)
                        </span>
                    </div>
                    <h1 className="display-5 fw-bold mb-0 text-white shadow-text">{venue.venueName}</h1>
                    <div className="d-flex align-items-center gap-1 text-white-50 small">
                        <FaMapMarkerAlt /> <span>{venue.address}, {venue.city}, {venue.state}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="container py-5">
                <div className="row g-4">
                    
                    {/* Left Column */}
                    <div className="col-lg-8">
                        
                        {/* Summary Details Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                                <div>
                                    <h4 className="fw-bold mb-1">{venue.venueName}</h4>
                                    <span className="text-muted small">Managed by <strong className="text-dark">{venue.vendorName || parsedContact.person || "Vendor Owner"}</strong></span>
                                </div>
                                <button 
                                    onClick={handleToggleFavorite}
                                    className="btn btn-outline-danger p-2 rounded-circle shadow-none border"
                                    style={{ width: "42px", height: "42px" }}
                                >
                                    {isFavorite ? <FaHeart className="text-danger" /> : <FaRegHeart />}
                                </button>
                            </div>

                            <div className="row g-3">
                                <div className="col-6 col-md-3">
                                    <span className="text-muted small d-block">Hourly Rate</span>
                                    <strong className="fs-5 text-success">₹ {venue.pricePerHour}</strong>
                                </div>
                                <div className="col-6 col-md-3">
                                    <span className="text-muted small d-block">Slot Duration</span>
                                    <strong className="fs-6 text-dark">{venue.slotDuration || 30} Mins</strong>
                                </div>
                                <div className="col-6 col-md-3">
                                    <span className="text-muted small d-block">Opening Time</span>
                                    <strong className="fs-6 text-dark">{venue.openTime}</strong>
                                </div>
                                <div className="col-6 col-md-3">
                                    <span className="text-muted small d-block">Closing Time</span>
                                    <strong className="fs-6 text-dark">{venue.closeTime}</strong>
                                </div>
                            </div>

                            <div className="row g-3 mt-2 border-top pt-3">
                                <div className="col-md-6 d-flex align-items-center gap-2">
                                    <FaUser className="text-success" />
                                    <span className="small">Contact: <strong>{parsedContact.person || venue.vendorName || "N/A"}</strong></span>
                                </div>
                                <div className="col-md-6 d-flex align-items-center gap-2">
                                    <FaPhoneAlt className="text-success" />
                                    <span className="small">Phone: <strong>{parsedContact.phone || venue.phone || "N/A"}</strong></span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-top d-flex gap-2 flex-wrap">
                                <span className="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-1.5 small">✓ Verified Venue</span>
                                <span className="badge bg-primary-subtle text-primary border border-primary rounded-pill px-3 py-1.5 small">✓ Available Today</span>
                                <span className="badge bg-warning-subtle text-warning border border-warning rounded-pill px-3 py-1.5 small text-dark">★ Popular Venue</span>
                            </div>
                        </div>

                        {/* About Arena Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">About Venue</h5>
                            <p className="text-secondary" style={{ lineHeight: "1.7", whiteSpace: "normal" }}>
                                {cleanDescription || "No detailed description provided for this venue facility."}
                            </p>
                        </div>

                        {/* Amenities Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">Amenities & Facilities</h5>
                            <div className="row g-3 mt-1">
                                {AMENITY_LIST.map((item, idx) => {
                                    const isAvailable = parsedAmenities.some(a => a.includes(item.key));
                                    return (
                                        <div key={idx} className="col-6 col-md-4">
                                            <div className={`d-flex align-items-center p-3 rounded-3 border ${isAvailable ? "bg-white text-dark shadow-sm border-success-subtle" : "bg-light text-muted opacity-50 border-gray"}`}>
                                                <span className={`fs-4 me-3 ${isAvailable ? "text-success" : "text-muted"}`}>{item.icon}</span>
                                                <span className="fw-semibold small">{item.label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rules Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">Arena Rules & Guidelines</h5>
                            {parsedRules ? (
                                <div className="text-secondary small border bg-light p-3 rounded-3" style={{ whiteSpace: "pre-line", lineHeight: "1.7" }}>
                                    {parsedRules}
                                </div>
                            ) : (
                                <div className="row g-2 pt-1">
                                    <div className="col-md-6 d-flex align-items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-success" /> <span className="fw-medium text-dark small">Sports Shoes Mandatory</span>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center gap-2 mb-2">
                                        <FaTimesCircle className="text-danger" /> <span className="fw-medium text-dark small">No Smoking Allowed</span>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center gap-2 mb-2">
                                        <FaTimesCircle className="text-danger" /> <span className="fw-medium text-dark small">No Alcohol Allowed inside arena</span>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-success" /> <span className="fw-medium text-dark small">Maintain Cleanliness</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Maps & Location Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">Location & Directions</h5>
                            <p className="text-secondary small mb-3"><FaMapMarkerAlt className="text-success me-1" /> {venue.address}, {venue.city}, {venue.state}, {venue.country} - {venue.postalCode}</p>
                            
                            {venue.latitude && venue.longitude && (
                                <div className="mb-3">
                                    {mapLoadError ? (
                                        <div className="bg-light border rounded-4 d-flex flex-column align-items-center justify-content-center p-4 text-center" style={{ height: "240px" }}>
                                            <FaMap className="text-muted fs-1 mb-2" />
                                            <span className="small fw-bold text-dark mb-2">GPS Coordinates</span>
                                            <span className="small text-muted mb-1">Latitude: {venue.latitude}</span>
                                            <span className="small text-muted">Longitude: {venue.longitude}</span>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-success btn-sm rounded-pill mt-3 px-4 fw-bold text-decoration-none"
                                            >
                                                Get Directions on Google Maps
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="rounded-4 border overflow-hidden">
                                            <div ref={mapContainerRef} style={{ height: "240px", width: "100%" }} />
                                            <div className="p-3 bg-light border-top text-center">
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline-success btn-sm rounded-pill px-4 fw-bold text-decoration-none"
                                                >
                                                    Get Navigation Directions
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reviews & Feedback List Card */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2 d-flex align-items-center gap-2">
                                <FaStar className="text-warning mb-0.5" /> Customer Feedback Ledger ({reviews.length})
                            </h5>
                            {reviews.length === 0 ? (
                                <p className="text-muted small mb-0 py-2">No reviews logged yet. Be the first to play and leave your comments!</p>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {sortedReviews.slice((reviewsPage - 1) * reviewsPerPage, reviewsPage * reviewsPerPage).map((r) => (
                                        <div key={r.id} className="border-bottom pb-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                                                <div className="d-flex align-items-center gap-3">
                                                    {r.userAvatar ? (
                                                        <img
                                                            src={r.userAvatar.startsWith("http") ? r.userAvatar : `http://localhost:8080${r.userAvatar}`}
                                                            alt="avatar"
                                                            className="rounded-circle shadow-sm border"
                                                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "40px", height: "40px", fontSize: "0.85rem" }}>
                                                            {getInitials(r.userName)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong className="text-dark small d-block">{r.userName || "Anonymous Customer"}</strong>
                                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                            Reviewed on {new Date(r.createdAt || r.createdDate).toLocaleDateString()}
                                                            {r.bookingDate && <span className="ms-2">| 📅 Play Date: {r.bookingDate}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-warning">
                                                    {Array.from({ length: 5 }).map((_, idx) => (
                                                        <FaStar key={idx} className={idx < r.rating ? "text-warning" : "text-muted opacity-25"} />
                                                    ))}
                                                </span>
                                            </div>

                                            <div className="ps-0 ps-md-5">
                                                {r.title && <h6 className="fw-bold text-dark small mb-1">🏷️ {r.title}</h6>}
                                                <p className="text-secondary small mb-2 italic" style={{ fontStyle: "italic", whiteSpace: "pre-line" }}>"{r.comment}"</p>
                                                
                                                {r.vendorReply && (
                                                    <div className="mt-2 p-3 bg-light border-start border-4 border-success rounded-3">
                                                        <strong className="text-dark small d-block">Response from Venue:</strong>
                                                        <span className="text-secondary small">{r.vendorReply}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination Controls */}
                                    {totalReviewsPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                                            <button
                                                className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm"
                                                style={{ width: "32px", height: "32px" }}
                                                disabled={reviewsPage === 1}
                                                onClick={() => setReviewsPage(prev => prev - 1)}
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <span className="small text-secondary fw-semibold">
                                                Page {reviewsPage} of {totalReviewsPages}
                                            </span>
                                            <button
                                                className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm"
                                                style={{ width: "32px", height: "32px" }}
                                                disabled={reviewsPage === totalReviewsPages}
                                                onClick={() => setReviewsPage(prev => prev + 1)}
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Similar Venues Section */}
                        {similarVenues.length > 0 && (
                            <div className="mt-5">
                                <h4 className="fw-bold text-dark mb-4">🏟️ Similar Venues Nearby</h4>
                                <div className="row g-3">
                                    {similarVenues.map((v) => (
                                        <div key={v.id} className="col-md-4">
                                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white hover-scale">
                                                <img
                                                    src={getImageUrl(v.imageUrl || (v.images && v.images[0]?.imagePath))}
                                                    alt={v.venueName}
                                                    style={{ height: "150px", objectFit: "cover" }}
                                                />
                                                <div className="card-body p-3 d-flex flex-column justify-content-between">
                                                    <div>
                                                        <h6 className="fw-bold mb-1 text-dark truncate-text">{v.venueName}</h6>
                                                        <p className="text-muted small mb-1"><FaMapMarkerAlt /> {v.city}</p>
                                                        <div className="text-warning small mb-3">
                                                            <FaStar className="me-1 mb-0.5" /> {getSimilarVenueRating(v)}
                                                        </div>
                                                        <strong className="text-success small d-block mb-3">₹ {v.pricePerHour} / hour</strong>
                                                    </div>
                                                    <Link to={`/venue/${v.id}`} className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold text-decoration-none">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="col-lg-4">
                        <div className="position-sticky" style={{ top: "100px" }}>
                            
                            {/* Action Summary Rates */}
                            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white text-center border-top border-4 border-success mb-4">
                                <span className="text-muted small fw-semibold text-uppercase">Booking Rate</span>
                                <h2 className="fw-bold text-success mt-2 mb-1">₹ {venue.pricePerHour} / hour</h2>
                                <span className="small text-muted">Slot duration: {venue.slotDuration || 30} mins</span>
                            </div>

                            {/* Main Booking Controls Panel */}
                            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                                <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                    <FaCalendarAlt className="text-success" /> Select Date & Slots
                                </h5>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-semibold">Choose Play Date</label>
                                    <input
                                        type="date"
                                        className="form-control rounded-3 border-secondary-subtle"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={getLocalTodayStr()}
                                        max={getLocalMaxDateStr()}
                                    />
                                </div>

                                <label className="form-label text-secondary small fw-semibold mb-2">Available Play Slots</label>
                                {slots.length === 0 ? (
                                    <div className="alert alert-warning text-center small py-3">No slots available for this date.</div>
                                ) : (
                                    <div className="d-flex flex-column gap-2 mb-4 overflow-y-auto" style={{ maxHeight: "250px" }}>
                                        {slots.map((s) => {
                                            const isSelected = selectedSlots.some(selected => selected.id === s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    disabled={s.booked}
                                                    onClick={() => handleSlotClick(s)}
                                                    className={`btn btn-sm text-start py-2.5 px-3 rounded-3 border fw-semibold d-flex justify-content-between align-items-center shadow-none ${
                                                        s.booked ? "btn-light text-muted border-transparent opacity-50 cursor-not-allowed" :
                                                        isSelected ? "btn-success text-white border-success shadow-sm" : "btn-outline-success"
                                                    }`}
                                                >
                                                    <span style={{ fontSize: "0.85rem" }}>
                                                        {formatTimeSlot(s.startTime)} - {formatTimeSlot(s.endTime)}
                                                    </span>
                                                    {s.booked ? (
                                                        <span className="badge bg-danger rounded-pill px-2 py-1 small">Booked</span>
                                                    ) : (
                                                        <span className={`badge rounded-pill px-2 py-1 small ${isSelected ? "bg-white text-success" : "bg-success text-white"}`}>
                                                            {isSelected ? "Selected" : "Select"}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Selected Slots Invoice Details */}
                                {selectedSlots.length > 0 && (
                                    <div className="bg-light rounded-4 p-3 border mb-4">
                                        <h6 className="fw-bold mb-2 text-dark">Selected Slot Summary</h6>
                                        <div className="small text-muted mb-2 border-bottom pb-2">
                                            <div><strong>Total Slots Selected:</strong> {selectedSlots.length} slot(s)</div>
                                            <div><strong>Total Play Duration:</strong> {totalHours} hour(s) ({totalDurationMinutes} mins)</div>
                                        </div>
                                        
                                        <div className="table-responsive">
                                            <table className="table table-sm table-borderless mb-0 small text-secondary">
                                                <tbody>
                                                    <tr>
                                                        <td className="ps-0 py-1">Base Rental Rate:</td>
                                                        <td className="text-end pe-0 py-1">₹ {basePriceAmount.toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="ps-0 py-0.5 text-muted" colSpan="2" style={{ fontSize: "0.75rem" }}>
                                                            Calculation: (₹{venue.pricePerHour} × {totalDurationMinutes} mins) / 60
                                                        </td>
                                                    </tr>
                                                    {appliedCoupon && (
                                                        <tr>
                                                            <td className="ps-0 py-1 text-success">Coupon Discount ({appliedCoupon.discount}%):</td>
                                                            <td className="text-end pe-0 py-1 text-success">- ₹ {discountAmount.toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <td className="ps-0 py-1">GST Tax (18%):</td>
                                                        <td className="text-end pe-0 py-1">₹ {gstAmount.toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="ps-0 py-1">Platform Booking Fee:</td>
                                                        <td className="text-end pe-0 py-1">₹ {platformFee.toFixed(2)}</td>
                                                    </tr>
                                                    <tr className="border-top fw-bold text-dark font-weight-bold fs-6">
                                                        <td className="ps-0 pt-2 pb-0 fs-6">Grand Total Amount:</td>
                                                        <td className="text-end pe-0 pt-2 pb-0 text-success fs-5 fw-bold">₹ {grandTotal.toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Coupon Code Entry */}
                                {selectedSlots.length > 0 && (
                                    <div className="mb-4">
                                        <label className="form-label text-secondary small fw-semibold">Coupon Discount Code</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control rounded-start-3"
                                                placeholder="e.g. SUMMER10"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                disabled={!!appliedCoupon}
                                            />
                                            {appliedCoupon ? (
                                                <button onClick={handleRemoveCoupon} className="btn btn-outline-danger px-3 rounded-end-3">
                                                    Remove
                                                </button>
                                            ) : (
                                                <button onClick={handleApplyCoupon} className="btn btn-success px-3 rounded-end-3 fw-bold">
                                                    Apply
                                                </button>
                                            )}
                                        </div>
                                        {couponSuccess && <span className="small text-success d-block mt-1">{couponSuccess}</span>}
                                        {couponError && <span className="small text-danger d-block mt-1">{couponError}</span>}
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={selectedSlots.length === 0 || bookingInProgress}
                                    className="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    {bookingInProgress ? (
                                        <>
                                            <FaSpinner className="spinner-border spinner-border-sm me-2" role="status" /> Creating Bookings...
                                        </>
                                    ) : (
                                        <>
                                            Book Venue Now <FaChevronRight />
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Carousel Fullscreen Lightbox Modal */}
            {lightboxOpen && (
                <div className="lightbox-overlay d-flex align-items-center justify-content-center" onClick={() => setLightboxOpen(false)}>
                    <div className="position-relative bg-dark rounded overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
                        <img src={lightboxImg} alt="Lightbox Zoom" className="img-fluid" style={{ maxHeight: "80vh", objectFit: "contain" }} />
                        <button onClick={() => setLightboxOpen(false)} className="btn btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow-none border-0" aria-label="Close modal"></button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VenueDetails;
