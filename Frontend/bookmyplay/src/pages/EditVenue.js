import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getVenueById, updateVenue } from "../services/venueService";
import VendorSidebar from "../components/VendorSidebar";
import VendorNavbar from "../components/VendorNavbar";
import {
    FaTimes,
    FaUpload,
    FaRupeeSign,
    FaSpinner,
    FaRegBuilding,
    FaMapMarkerAlt,
    FaClock,
    FaParking,
    FaRestroom,
    FaTint,
    FaLightbulb,
    FaDoorClosed,
    FaChair,
    FaCoffee,
    FaWifi,
    FaLock,
    FaPlusCircle,
    FaInfoCircle,
    FaUser,
    FaPhoneAlt,
    FaEnvelope,
    FaFileAlt
} from "react-icons/fa";

function EditVenue() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [subStatus, setSubStatus] = useState("ACTIVE");
    const [subDetails, setSubDetails] = useState({});

    // Keep track of loaded initial timings to check for changes
    const [initialTimings, setInitialTimings] = useState({
        openTime: "",
        closeTime: "",
        slotDuration: ""
    });

    // Venue data state
    const [venue, setVenue] = useState({
        venueName: "",
        city: "",
        address: "",
        description: "",
        pricePerHour: "",
        imageUrl: "",
        state: "",
        country: "",
        postalCode: "",
        openTime: "07:00 AM",
        closeTime: "07:00 PM",
        slotDuration: "60",
        latitude: "",
        longitude: "",
        categoryId: "",
        status: "PENDING"
    });

    // 12 Amenities state
    const [amenities, setAmenities] = useState({
        parkingSpace: false,
        cleanWashroom: false,
        drinkingWater: false,
        floodLights: false,
        changingRoom: false,
        seatingArea: false,
        cafeteria: false,
        wifi: false,
        lockerFacility: false,
        firstAid: false,
        cctvSecurity: false,
        equipmentRental: false
    });

    // Venue rules (Optional)
    const [rules, setRules] = useState("");

    // Contact Information
    const [contact, setContact] = useState({
        person: "",
        phone: "",
        altPhone: "",
        email: ""
    });

    // Form feedback states
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (!user.id) {
            navigate("/login");
            return;
        }
        checkSubscription();
    }, [user.id]);

    const checkSubscription = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/subscriptions/vendor/${user.id}`);
            const data = await res.json();
            setSubStatus(data.status || "ACTIVE");
            setSubDetails(data);
        } catch (e) {
            console.error("Error checking subscription:", e);
        }
    };

    useEffect(() => {
        loadVenue();
    }, [id]);

    const loadVenue = async () => {
        try {
            setPageLoading(true);
            const response = await getVenueById(id);
            const data = response.data;
            
            // Extract details from description text if present
            let parsedDesc = data.description || "";
            let parsedAmenities = {
                parkingSpace: false,
                cleanWashroom: false,
                drinkingWater: false,
                floodLights: false,
                changingRoom: false,
                seatingArea: false,
                cafeteria: false,
                wifi: false,
                lockerFacility: false,
                firstAid: false,
                cctvSecurity: false,
                equipmentRental: false
            };
            let parsedRules = "";
            let parsedContact = {
                person: "",
                phone: "",
                altPhone: "",
                email: ""
            };

            // Parse Contact Info
            const contactParts = parsedDesc.split("Contact Information:");
            if (contactParts.length > 1) {
                const contactText = contactParts[1].trim();
                parsedDesc = contactParts[0].trim();
                const lines = contactText.split("\n");
                lines.forEach(line => {
                    if (line.startsWith("Person:")) parsedContact.person = line.replace("Person:", "").trim();
                    else if (line.startsWith("Phone:")) parsedContact.phone = line.replace("Phone:", "").trim();
                    else if (line.startsWith("AltPhone:")) parsedContact.altPhone = line.replace("AltPhone:", "").trim();
                    else if (line.startsWith("Email:")) parsedContact.email = line.replace("Email:", "").trim();
                });
            }

            // Parse Rules
            const rulesParts = parsedDesc.split("Rules:");
            if (rulesParts.length > 1) {
                parsedRules = rulesParts[1].trim();
                parsedDesc = rulesParts[0].trim();
            }

            // Parse Amenities
            const amenitiesParts = parsedDesc.split("Amenities:");
            if (amenitiesParts.length > 1) {
                parsedDesc = amenitiesParts[0].trim();
                const list = amenitiesParts[1].split(",").map(a => a.trim().toLowerCase());
                parsedAmenities.parkingSpace = list.includes("parking space") || list.includes("parking");
                parsedAmenities.cleanWashroom = list.includes("clean washroom") || list.includes("washroom");
                parsedAmenities.drinkingWater = list.includes("drinking water") || list.includes("water");
                parsedAmenities.floodLights = list.includes("flood lights") || list.includes("lights");
                parsedAmenities.changingRoom = list.includes("changing room") || list.includes("changing");
                parsedAmenities.seatingArea = list.includes("seating area") || list.includes("seating");
                parsedAmenities.cafeteria = list.includes("cafeteria");
                parsedAmenities.wifi = list.includes("wi-fi") || list.includes("wifi");
                parsedAmenities.lockerFacility = list.includes("locker facility") || list.includes("locker");
                parsedAmenities.firstAid = list.includes("first aid");
                parsedAmenities.cctvSecurity = list.includes("cctv security") || list.includes("cctv");
                parsedAmenities.equipmentRental = list.includes("equipment rental") || list.includes("rental");
            }

            const initial = {
                openTime: data.openTime || "07:00 AM",
                closeTime: data.closeTime || "07:00 PM",
                slotDuration: data.slotDuration ? String(data.slotDuration) : "60"
            };

            setVenue({
                venueName: data.venueName || "",
                city: data.city || "",
                address: data.address || "",
                description: parsedDesc,
                pricePerHour: data.pricePerHour || "",
                imageUrl: data.imageUrl || "",
                state: data.state || "",
                country: data.country || "",
                postalCode: data.postalCode || "",
                openTime: initial.openTime,
                closeTime: initial.closeTime,
                slotDuration: initial.slotDuration,
                latitude: data.latitude || "",
                longitude: data.longitude || "",
                categoryId: data.category?.id || "",
                status: data.status || "PENDING"
            });

            setInitialTimings(initial);
            setAmenities(parsedAmenities);
            setRules(parsedRules);
            setContact(parsedContact);
        } catch (e) {
            console.error("Error loading venue details:", e);
        } finally {
            setPageLoading(false);
        }
    };

    const handleChange = (e) => {
        setVenue({
            ...venue,
            [e.target.name]: e.target.value
        });
    };

    const handleAmenityChange = (e) => {
        setAmenities({
            ...amenities,
            [e.target.name]: e.target.checked
        });
    };

    const handleContactChange = (e) => {
        setContact({
            ...contact,
            [e.target.name]: e.target.value
        });
    };

    const parseTimeStr = (timeStr) => {
        if (!timeStr) return null;
        const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!parts) return null;
        let hours = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        const ampm = parts[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    const validateForm = () => {
        if (!venue.venueName.trim()) return "Venue name is required.";
        if (!venue.description || venue.description.trim().length < 30) return "Description must be at least 30 characters.";
        if (!venue.address.trim()) return "Address is required.";
        if (!venue.city.trim()) return "City is required.";
        if (!venue.state.trim()) return "State is required.";
        if (!venue.country.trim()) return "Country is required.";
        if (!venue.postalCode.trim()) return "Postal code is required.";
        
        if (!venue.pricePerHour || parseFloat(venue.pricePerHour) <= 0) {
            return "Price per hour must be greater than zero.";
        }

        const openMin = parseTimeStr(venue.openTime);
        const closeMin = parseTimeStr(venue.closeTime);
        if (openMin === null || closeMin === null) {
            return "Valid opening and closing times are required.";
        }
        if (openMin >= closeMin) {
            return "Opening time must be before closing time.";
        }

        if (!venue.slotDuration) {
            return "Slot duration is required.";
        }

        if (contact.phone && !/^\d{10}$/.test(contact.phone.trim())) {
            return "Contact phone number must be exactly 10 digits.";
        }
        if (contact.altPhone && !/^\d{10}$/.test(contact.altPhone.trim())) {
            return "Alternate phone number must be exactly 10 digits.";
        }

        return null;
    };

    const handleSubmitWithStatus = async (statusVal) => {
        const err = validateForm();
        if (err) {
            window.Swal.fire({
                icon: "warning",
                title: "Validation Check",
                text: err,
                confirmButtonColor: "#198754"
            });
            return;
        }

        setLoading(true);

        // Check if timings or slot duration have changed
        const timingChanged = venue.openTime !== initialTimings.openTime ||
                              venue.closeTime !== initialTimings.closeTime ||
                              String(venue.slotDuration) !== String(initialTimings.slotDuration);

        if (timingChanged) {
            const confirmed = await window.Swal.fire({
                icon: "warning",
                title: "Regenerate Slots?",
                text: "Changing operating hours or slot duration will regenerate all future available slots. Continue?",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, Regenerate",
                cancelButtonText: "Cancel"
            });
            if (!confirmed.isConfirmed) {
                setLoading(false);
                return;
            }
        }

        try {
            // Append 12 amenities to description
            const selectedAmenities = [];
            if (amenities.parkingSpace) selectedAmenities.push("Parking Space");
            if (amenities.cleanWashroom) selectedAmenities.push("Clean Washroom");
            if (amenities.drinkingWater) selectedAmenities.push("Drinking Water");
            if (amenities.floodLights) selectedAmenities.push("Flood Lights");
            if (amenities.changingRoom) selectedAmenities.push("Changing Room");
            if (amenities.seatingArea) selectedAmenities.push("Seating Area");
            if (amenities.cafeteria) selectedAmenities.push("Cafeteria");
            if (amenities.wifi) selectedAmenities.push("Wi-Fi");
            if (amenities.lockerFacility) selectedAmenities.push("Locker Facility");
            if (amenities.firstAid) selectedAmenities.push("First Aid");
            if (amenities.cctvSecurity) selectedAmenities.push("CCTV Security");
            if (amenities.equipmentRental) selectedAmenities.push("Equipment Rental");

            let finalDesc = venue.description.trim();
            if (selectedAmenities.length > 0) {
                finalDesc += "\n\nAmenities: " + selectedAmenities.join(", ");
            }

            // Append rules
            if (rules.trim()) {
                finalDesc += "\n\nRules: " + rules.trim();
            }

            // Append contact details
            if (contact.person || contact.phone || contact.altPhone || contact.email) {
                finalDesc += `\n\nContact Information:\nPerson: ${contact.person.trim()}\nPhone: ${contact.phone.trim()}\nAltPhone: ${contact.altPhone.trim()}\nEmail: ${contact.email.trim()}`;
            }

            const payload = {
                ...venue,
                vendorId: user.id,
                status: statusVal,
                description: finalDesc,
                slotDuration: parseInt(venue.slotDuration, 10),
                latitude: venue.latitude ? parseFloat(venue.latitude) : null,
                longitude: venue.longitude ? parseFloat(venue.longitude) : null
            };

            await updateVenue(id, payload);

            await window.Swal.fire({
                icon: "success",
                title: "Venue Updated",
                text: "Venue details have been successfully modified.",
                confirmButtonColor: "#198754",
                timer: 2000
            });

            navigate("/vendor/venues");
        } catch (error) {
            console.error("Backend Error:", error);
            window.Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: error.response?.data || "Failed to update venue details.",
                confirmButtonColor: "#dc3545"
            });
        } finally {
            setLoading(false);
        }
    };

    const generateTimeOptions = () => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hr = h % 12 || 12;
                const ampm = h >= 12 ? "PM" : "AM";
                const timeStr = `${String(hr).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
                options.push(timeStr);
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    if (pageLoading) {
        return (
            <div className="container mt-5 text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
                <h5 className="mt-3 text-muted">Loading venue info...</h5>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2 p-0">
                    <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
                </div>
                <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
                    <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                    
                    {/* Sticky Header with Action Buttons */}
                    <div className="sticky-top bg-white border-bottom py-3 px-4 shadow-sm" style={{ zIndex: 1020, top: "0" }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-1 small fw-semibold">
                                        <li className="breadcrumb-item"><Link to="/vendor" className="text-success text-decoration-none">Vendor Console</Link></li>
                                        <li className="breadcrumb-item"><Link to="/vendor/venues" className="text-success text-decoration-none">My Venues</Link></li>
                                        <li className="breadcrumb-item text-muted active" aria-current="page">Edit Venue</li>
                                    </ol>
                                </nav>
                                <h3 className="fw-bold mb-0 text-dark">Edit Venue Details</h3>
                                <p className="text-muted small mb-0">Modify and update your arena information on BookMyPlay.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => handleSubmitWithStatus("DRAFT")} 
                                    className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                                    disabled={loading}
                                >
                                    Save as Draft
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleSubmitWithStatus("PENDING")} 
                                    className="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                                    disabled={loading}
                                    style={{ backgroundColor: "#198754" }}
                                >
                                    {loading ? <FaSpinner className="spinner-border spinner-border-sm" /> : null}
                                    Save & Publish
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => navigate("/vendor/venues")} 
                                    className="btn btn-outline-danger rounded-pill px-4 fw-bold"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="row justify-content-center">
                            <div className="col-lg-9">
                                <form>
                                    
                                    {/* SECTION 1: BASIC INFO */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaRegBuilding className="text-success" /> Section 1: Basic Information
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-12">
                                                    <label className="form-label small text-secondary fw-semibold">Venue Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="venueName"
                                                        value={venue.venueName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small text-secondary fw-semibold">Description * (Minimum 30 characters)</label>
                                                    <textarea
                                                        className="form-control rounded-3"
                                                        name="description"
                                                        rows="4"
                                                        value={venue.description}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: LOCATION DETAILS */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaMapMarkerAlt className="text-success" /> Section 2: Location Details
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-8">
                                                    <label className="form-label small text-secondary fw-semibold">Full Address *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="address"
                                                        value={venue.address}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small text-secondary fw-semibold">City *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="city"
                                                        value={venue.city}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small text-secondary fw-semibold">State *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="state"
                                                        value={venue.state}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small text-secondary fw-semibold">Country *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="country"
                                                        value={venue.country}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small text-secondary fw-semibold">Postal Code *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="postalCode"
                                                        value={venue.postalCode}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Latitude (Optional)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control rounded-3"
                                                        name="latitude"
                                                        value={venue.latitude}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Longitude (Optional)</label>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="form-control rounded-3"
                                                        name="longitude"
                                                        value={venue.longitude}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 3: PRICING & HOURS */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaClock className="text-success" /> Section 3: Pricing & Operating Hours
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <label className="form-label small text-secondary fw-semibold d-flex align-items-center"><FaRupeeSign className="me-1 text-muted" /> Price Per Hour *</label>
                                                    <input
                                                        type="number"
                                                        className="form-control rounded-3"
                                                        name="pricePerHour"
                                                        value={venue.pricePerHour}
                                                        onChange={handleChange}
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small text-secondary fw-semibold">Slot Duration *</label>
                                                    <select
                                                        className="form-select rounded-3"
                                                        name="slotDuration"
                                                        value={venue.slotDuration}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="30">30 Minutes</option>
                                                        <option value="60">60 Minutes</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small text-secondary fw-semibold">Opening Time *</label>
                                                    <select
                                                        className="form-select rounded-3"
                                                        name="openTime"
                                                        value={venue.openTime}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        {timeOptions.map((timeStr, idx) => (
                                                            <option key={idx} value={timeStr}>{timeStr}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small text-secondary fw-semibold">Closing Time *</label>
                                                    <select
                                                        className="form-select rounded-3"
                                                        name="closeTime"
                                                        value={venue.closeTime}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        {timeOptions.map((timeStr, idx) => (
                                                            <option key={idx} value={timeStr}>{timeStr}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-12 mt-2">
                                                    <div className="alert alert-info py-2 px-3 mb-0 rounded-3 d-flex align-items-center gap-2" style={{ borderLeft: "4px solid #0dcaf0" }}>
                                                        <FaInfoCircle className="text-info fs-5" />
                                                        <span className="small text-muted fw-semibold">
                                                            Changing operating hours or slot duration will regenerate all future available slots.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: COVER IMAGE LINK */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaUpload className="text-success" /> Section 4: Cover Image Link
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-12">
                                                    <label className="form-label small text-secondary fw-semibold">Cover Image URL</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="imageUrl"
                                                        value={venue.imageUrl}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                {venue.imageUrl && (
                                                    <div className="col-md-4 mt-3">
                                                        <span className="small text-muted d-block mb-1">Image Preview:</span>
                                                        <img
                                                            src={venue.imageUrl.startsWith("http") ? venue.imageUrl : `http://localhost:8080${venue.imageUrl}`}
                                                            alt="Cover Preview"
                                                            className="img-thumbnail rounded-3"
                                                            style={{ maxHeight: "150px", objectFit: "cover" }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 5: AMENITIES */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaParking className="text-success" /> Section 5: Amenities
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="parkingSpace" id="amenity-parking" checked={amenities.parkingSpace} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-parking">
                                                            <FaParking className="text-secondary" /> Parking Space
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="cleanWashroom" id="amenity-washroom" checked={amenities.cleanWashroom} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-washroom">
                                                            <FaRestroom className="text-secondary" /> Clean Washroom
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="drinkingWater" id="amenity-water" checked={amenities.drinkingWater} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-water">
                                                            <FaTint className="text-secondary" /> Drinking Water
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="floodLights" id="amenity-lights" checked={amenities.floodLights} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-lights">
                                                            <FaLightbulb className="text-secondary" /> Flood Lights
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="changingRoom" id="amenity-changing" checked={amenities.changingRoom} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-changing">
                                                            <FaDoorClosed className="text-secondary" /> Changing Room
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="seatingArea" id="amenity-seating" checked={amenities.seatingArea} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-seating">
                                                            <FaChair className="text-secondary" /> Seating Area
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="cafeteria" id="amenity-cafeteria" checked={amenities.cafeteria} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-cafeteria">
                                                            <FaCoffee className="text-secondary" /> Cafeteria
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="wifi" id="amenity-wifi" checked={amenities.wifi} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-wifi">
                                                            <FaWifi className="text-secondary" /> Wi-Fi
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="lockerFacility" id="amenity-locker" checked={amenities.lockerFacility} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-locker">
                                                            <FaLock className="text-secondary" /> Locker Facility
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="firstAid" id="amenity-firstaid" checked={amenities.firstAid} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-firstaid">
                                                            <FaPlusCircle className="text-secondary" /> First Aid
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="cctvSecurity" id="amenity-cctv" checked={amenities.cctvSecurity} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-cctv">
                                                            <FaRegBuilding className="text-secondary" /> CCTV Security
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" name="equipmentRental" id="amenity-rental" checked={amenities.equipmentRental} onChange={handleAmenityChange} />
                                                        <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer small" htmlFor="amenity-rental">
                                                            <FaRegBuilding className="text-secondary" /> Equipment Rental
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 6: VENUE RULES */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaFileAlt className="text-success" /> Section 6: Venue Rules (Optional)
                                            </h5>
                                            <textarea
                                                className="form-control rounded-3"
                                                rows="3"
                                                placeholder="e.g. Sports shoes compulsory, No smoking, No alcohol, Maintain cleanliness..."
                                                value={rules}
                                                onChange={(e) => setRules(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* SECTION 7: CONTACT INFORMATION */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaUser className="text-success" /> Section 7: Contact Information
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Contact Person</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="person"
                                                        value={contact.person}
                                                        onChange={handleContactChange}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Contact Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="phone"
                                                        value={contact.phone}
                                                        onChange={handleContactChange}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Alternate Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="altPhone"
                                                        value={contact.altPhone}
                                                        onChange={handleContactChange}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="form-control rounded-3"
                                                        name="email"
                                                        value={contact.email}
                                                        onChange={handleContactChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 8: STATUS */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaInfoCircle className="text-success" /> Section 8: Venue Status
                                            </h5>
                                            <div className="d-flex gap-4">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="venueStatus"
                                                        id="status-publish"
                                                        checked={venue.status === "PENDING" || venue.status === "APPROVED"}
                                                        onChange={() => setVenue({ ...venue, status: "PENDING" })}
                                                    />
                                                    <label className="form-check-label fw-semibold text-dark small" htmlFor="status-publish">
                                                        Publish Now (Submit for Admin Approval)
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="venueStatus"
                                                        id="status-draft"
                                                        checked={venue.status === "DRAFT"}
                                                        onChange={() => setVenue({ ...venue, status: "DRAFT" })}
                                                    />
                                                    <label className="form-check-label fw-semibold text-dark small" htmlFor="status-draft">
                                                        Save as Draft (Private to Profile)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditVenue;