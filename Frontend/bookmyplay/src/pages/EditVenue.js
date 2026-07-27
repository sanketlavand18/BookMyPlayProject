import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getVenueById, updateVenue } from "../services/venueService";
import Navbar from "../components/Navbar";
import {
    FaTimes,
    FaUpload,
    FaRupeeSign,
    FaSpinner,
    FaRegBuilding,
    FaMapMarkerAlt,
    FaCity,
    FaFileAlt,
    FaCheckCircle,
    FaClock,
    FaParking,
    FaRestroom,
    FaTint,
    FaLightbulb,
    FaDoorClosed,
    FaChair
} from "react-icons/fa";

function EditVenue() {
    const { id } = useParams();
    const navigate = useNavigate();

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
        latitude: "",
        longitude: "",
        categoryId: ""
    });

    // Amenities state
    const [amenities, setAmenities] = useState({
        parking: false,
        washroom: false,
        drinkingWater: false,
        floodLights: false,
        changingRoom: false,
        seating: false
    });

    // Form feedback states
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        loadVenue();
    }, [id]);

    const loadVenue = async () => {
        try {
            setPageLoading(true);
            const response = await getVenueById(id);
            const data = response.data;
            
            // Extract amenities from description text if present
            let parsedDesc = data.description || "";
            let parsedAmenities = {
                parking: false,
                washroom: false,
                drinkingWater: false,
                floodLights: false,
                changingRoom: false,
                seating: false
            };

            const parts = parsedDesc.split("Amenities:");
            if (parts.length > 1) {
                parsedDesc = parts[0].trim();
                const list = parts[1].split(",").map(a => a.trim().toLowerCase());
                parsedAmenities.parking = list.includes("parking");
                parsedAmenities.washroom = list.includes("washroom");
                parsedAmenities.drinkingWater = list.includes("drinking water");
                parsedAmenities.floodLights = list.includes("flood lights");
                parsedAmenities.changingRoom = list.includes("changing room");
                parsedAmenities.seating = list.includes("seating");
            }

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
                openTime: data.openTime || "07:00 AM",
                closeTime: data.closeTime || "07:00 PM",
                latitude: data.latitude || "",
                longitude: data.longitude || "",
                categoryId: data.category?.id || ""
            });

            setAmenities(parsedAmenities);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!venue.venueName.trim()) {
            setErrorMsg("Venue name is required.");
            return;
        }

        setLoading(true);

        try {
            // Append amenities to description to store them compatibly
            const selectedAmenities = [];
            if (amenities.parking) selectedAmenities.push("Parking");
            if (amenities.washroom) selectedAmenities.push("Washroom");
            if (amenities.drinkingWater) selectedAmenities.push("Drinking Water");
            if (amenities.floodLights) selectedAmenities.push("Flood Lights");
            if (amenities.changingRoom) selectedAmenities.push("Changing Room");
            if (amenities.seating) selectedAmenities.push("Seating");

            let finalDesc = venue.description;
            if (selectedAmenities.length > 0) {
                finalDesc += "\n\nAmenities: " + selectedAmenities.join(", ");
            }

            const payload = {
                ...venue,
                description: finalDesc,
                latitude: venue.latitude ? parseFloat(venue.latitude) : null,
                longitude: venue.longitude ? parseFloat(venue.longitude) : null
            };

            await updateVenue(id, payload);
            setSuccessMsg("Venue details updated successfully! Redirecting...");

            setTimeout(() => {
                navigate("/vendor");
            }, 2000);

        } catch (error) {
            console.error("Backend Error:", error);
            setErrorMsg(error.response?.data || "Failed to update venue.");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="container mt-5 text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
                <h5 className="mt-3 text-muted">Loading venue info...</h5>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="card border-0 shadow-lg overflow-hidden rounded-4 bg-white">
                            
                            {/* Header Banner */}
                            <div className="bg-gradient p-4 text-white text-center" style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}>
                                <h1 className="fw-bold mb-1">Edit Venue Details</h1>
                                <p className="mb-0 opacity-75">Modify and update your arena information on BookMyPlay</p>
                            </div>

                            <div className="card-body p-5">
                                {errorMsg && (
                                    <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert">
                                        <strong>⚠️ Error:</strong> {errorMsg}
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="alert alert-success border-0 shadow-sm mb-4 text-center" role="alert">
                                        <FaCheckCircle className="me-2 text-success" /> <strong>{successMsg}</strong>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>

                                    {/* SECTION 1: BASIC INFORMATION */}
                                    <div className="mb-5 border-bottom pb-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaRegBuilding className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 1: Basic Information</h4>
                                        </div>
                                        <div className="row g-4">
                                            <div className="col-md-12">
                                                <label className="form-label fw-semibold text-muted">Venue Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg rounded-3"
                                                    name="venueName"
                                                    value={venue.venueName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-semibold text-muted">Description (Min 30 characters)</label>
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

                                    {/* SECTION 2: LOCATION */}
                                    <div className="mb-5 border-bottom pb-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-warning-subtle text-warning rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaMapMarkerAlt className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 2: Location Details</h4>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-8">
                                                <label className="form-label fw-semibold text-muted">Full Address</label>
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
                                                <label className="form-label fw-semibold text-muted">City</label>
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
                                                <label className="form-label fw-semibold text-muted">State</label>
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
                                                <label className="form-label fw-semibold text-muted">Country</label>
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
                                                <label className="form-label fw-semibold text-muted">Postal Code</label>
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
                                                <label className="form-label fw-semibold text-muted">Latitude (Optional)</label>
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
                                                <label className="form-label fw-semibold text-muted">Longitude (Optional)</label>
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

                                    {/* SECTION 3: PRICING & TIMING */}
                                    <div className="mb-5 border-bottom pb-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-success-subtle text-success rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaClock className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 3: Pricing & Operating Hours</h4>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold text-muted"><FaRupeeSign className="me-1 text-success" /> Price Per Hour (INR)</label>
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
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold text-muted">Opening Time</label>
                                                <select
                                                    className="form-select rounded-3"
                                                    name="openTime"
                                                    value={venue.openTime}
                                                    onChange={handleChange}
                                                >
                                                    {Array.from({ length: 24 }).map((_, i) => {
                                                        const hr = i % 12 || 12;
                                                        const ampm = i >= 12 ? "PM" : "AM";
                                                        const timeStr = `${String(hr).padStart(2, "0")}:00 ${ampm}`;
                                                        return <option key={i} value={timeStr}>{timeStr}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold text-muted">Closing Time</label>
                                                <select
                                                    className="form-select rounded-3"
                                                    name="closeTime"
                                                    value={venue.closeTime}
                                                    onChange={handleChange}
                                                >
                                                    {Array.from({ length: 24 }).map((_, i) => {
                                                        const hr = i % 12 || 12;
                                                        const ampm = i >= 12 ? "PM" : "AM";
                                                        const timeStr = `${String(hr).padStart(2, "0")}:00 ${ampm}`;
                                                        return <option key={i} value={timeStr}>{timeStr}</option>;
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: COVER IMAGE LINK */}
                                    <div className="mb-5 border-bottom pb-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-danger-subtle text-danger rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaUpload className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 4: Cover Image Link</h4>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <label className="form-label fw-semibold text-muted">Cover Image URL</label>
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

                                    {/* SECTION 5: AMENITIES */}
                                    <div className="mb-5">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-info-subtle text-info rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaParking className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 5: Amenities (Optional)</h4>
                                        </div>
                                        <div className="row g-3 ms-2">
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" name="parking" id="amenity-parking" checked={amenities.parking} onChange={handleAmenityChange} />
                                                    <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer" htmlFor="amenity-parking">
                                                        <FaParking className="text-secondary" /> Parking Space
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" name="washroom" id="amenity-washroom" checked={amenities.washroom} onChange={handleAmenityChange} />
                                                    <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer" htmlFor="amenity-washroom">
                                                        <FaRestroom className="text-secondary" /> Clean Washroom
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" name="drinkingWater" id="amenity-water" checked={amenities.drinkingWater} onChange={handleAmenityChange} />
                                                    <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer" htmlFor="amenity-water">
                                                        <FaTint className="text-secondary" /> Drinking Water
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" name="floodLights" id="amenity-lights" checked={amenities.floodLights} onChange={handleAmenityChange} />
                                                    <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer" htmlFor="amenity-lights">
                                                        <FaLightbulb className="text-secondary" /> Flood Lights
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" name="changingRoom" id="amenity-changing" checked={amenities.changingRoom} onChange={handleAmenityChange} />
                                                    <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer" htmlFor="amenity-changing">
                                                        <FaDoorClosed className="text-secondary" /> Changing Room
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" name="seating" id="amenity-seating" checked={amenities.seating} onChange={handleAmenityChange} />
                                                    <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer" htmlFor="amenity-seating">
                                                        <FaChair className="text-secondary" /> Seating Area
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-lg w-100 text-white border-0 shadow py-3 mt-4 fw-bold rounded-3"
                                        style={{
                                            background: "linear-gradient(135deg, #10b981, #059669)",
                                            fontSize: "1.1rem"
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="spinner-border spinner-border-sm me-2" role="status" /> Updating Venue...
                                            </>
                                        ) : (
                                            "Update Venue Details"
                                        )}
                                    </button>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditVenue;