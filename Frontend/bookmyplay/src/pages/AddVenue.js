import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addVenue } from "../services/venueService";
import { getAllCategories, createCategory } from "../services/categoryService";
import Navbar from "../components/Navbar";
import {
    FaTimes,
    FaUpload,
    FaRupeeSign,
    FaSpinner,
    FaRegBuilding,
    FaList,
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

function AddVenue() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [categories, setCategories] = useState([]);
    const [customSportActive, setCustomSportActive] = useState(false);
    const [customSportName, setCustomSportName] = useState("");

    // Venue data state
    const [venue, setVenue] = useState({
        vendorId: user.id || "",
        venueName: "",
        categoryId: "",
        city: "",
        address: "",
        description: "",
        pricePerHour: "",
        state: "",
        country: "",
        postalCode: "",
        openTime: "07:00 AM",
        closeTime: "07:00 PM",
        latitude: "",
        longitude: ""
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

    // Image upload states
    const [files, setFiles] = useState([]);
    const [coverIndex, setCoverIndex] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    // Form feedback states
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
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

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        if (val === "CUSTOM") {
            setCustomSportActive(true);
            setVenue({ ...venue, categoryId: "" });
        } else {
            setCustomSportActive(false);
            setVenue({ ...venue, categoryId: val });
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addSelectedFiles(selectedFiles);
    };

    const addSelectedFiles = (selectedFiles) => {
        const validExtensions = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
        const filtered = selectedFiles.filter((file) => {
            const isValid = validExtensions.includes(file.type);
            if (!isValid) {
                alert(`Invalid format: ${file.name}. Only PNG, JPG, JPEG, and WEBP allowed.`);
            }
            return isValid;
        });

        if (files.length + filtered.length > 8) {
            alert("Maximum 8 images can be uploaded.");
            return;
        }

        setFiles((prev) => [...prev, ...filtered]);
    };

    const handleRemoveFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        if (coverIndex === index) {
            setCoverIndex(0);
        } else if (coverIndex > index) {
            setCoverIndex((prev) => prev - 1);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            addSelectedFiles(Array.from(e.dataTransfer.files));
        }
    };

    const validateForm = () => {
        if (!venue.venueName.trim()) return "Venue name is required.";
        if (!customSportActive && !venue.categoryId) return "Please select a sport category.";
        if (customSportActive && !customSportName.trim()) return "Please enter custom sport name.";
        if (!venue.address.trim()) return "Address is required.";
        if (!venue.city.trim()) return "City is required.";
        if (!venue.state.trim()) return "State is required.";
        if (!venue.country.trim()) return "Country is required.";
        if (!venue.postalCode.trim()) return "Postal code is required.";
        if (!venue.description || venue.description.length < 30) return "Description must be at least 30 characters.";
        if (!venue.pricePerHour || parseFloat(venue.pricePerHour) <= 0) return "Price per hour must be greater than 0.";
        if (files.length === 0) return "At least one venue image is required.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const err = validateForm();
        if (err) {
            setErrorMsg(err);
            window.scrollTo(0, 0);
            return;
        }

        setLoading(true);

        try {
            let finalCategoryId = venue.categoryId;

            if (customSportActive) {
                const newCatResponse = await createCategory({
                    categoryName: customSportName,
                    description: customSportName
                });
                finalCategoryId = newCatResponse.data.id;
            }

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

            const submissionData = {
                ...venue,
                description: finalDesc,
                categoryId: finalCategoryId,
                latitude: venue.latitude ? parseFloat(venue.latitude) : null,
                longitude: venue.longitude ? parseFloat(venue.longitude) : null
            };

            await addVenue(submissionData, files, coverIndex);
            setSuccessMsg("Venue registered successfully! Redirecting...");

            setTimeout(() => {
                navigate("/vendor");
            }, 2000);

        } catch (error) {
            console.error("Backend Error:", error);
            setErrorMsg(error.response?.data || "Failed to register venue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="card border-0 shadow-lg overflow-hidden rounded-4 bg-white">
                            
                            {/* Header Banner */}
                            <div className="bg-gradient p-4 text-white text-center" style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}>
                                <h1 className="fw-bold mb-1">Add New Sports Venue</h1>
                                <p className="mb-0 opacity-75">Register your sports complex, manage timing, and slots on BookMyPlay</p>
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

                                <form onSubmit={handleSubmit} onDragEnter={handleDrag}>

                                    {/* SECTION 1: BASIC INFORMATION */}
                                    <div className="mb-5 border-bottom pb-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaRegBuilding className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 1: Basic Information</h4>
                                        </div>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted"><FaRegBuilding className="me-2" /> Venue Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg rounded-3"
                                                    name="venueName"
                                                    placeholder="e.g. Balewadi Box Cricket"
                                                    value={venue.venueName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold text-muted"><FaList className="me-2" /> Sport Category</label>
                                                <select
                                                    className="form-select form-select-lg rounded-3"
                                                    value={customSportActive ? "CUSTOM" : venue.categoryId}
                                                    onChange={handleCategoryChange}
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.categoryName}
                                                        </option>
                                                    ))}
                                                    <option value="CUSTOM" className="fw-bold text-primary">+ Add New Sport...</option>
                                                </select>

                                                {customSportActive && (
                                                    <div className="mt-3">
                                                        <label className="form-label fw-semibold text-primary">Type Custom Sport Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-3 border-primary"
                                                            placeholder="e.g. Box Cricket"
                                                            value={customSportName}
                                                            onChange={(e) => setCustomSportName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-semibold text-muted"><FaFileAlt className="me-2" /> Description (Min 30 characters)</label>
                                                <textarea
                                                    className="form-control rounded-3"
                                                    name="description"
                                                    rows="4"
                                                    value={venue.description}
                                                    onChange={handleChange}
                                                    placeholder="Provide detailed description of facilities, turf quality, etc."
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
                                                    placeholder="e.g. Sector 5, Hiranandani Sports Complex"
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
                                                    placeholder="e.g. Mumbai"
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
                                                    placeholder="e.g. Maharashtra"
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
                                                    placeholder="e.g. India"
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
                                                    placeholder="e.g. 400076"
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
                                                    placeholder="e.g. 19.1234"
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
                                                    placeholder="e.g. 72.8765"
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
                                                <label className="form-label fw-semibold text-muted d-flex align-items-center"><FaRupeeSign className="me-1 text-success" /> Price Per Hour (INR)</label>
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

                                    {/* SECTION 4: VENUE IMAGES */}
                                    <div className="mb-5 border-bottom pb-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-danger-subtle text-danger rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <FaUpload className="fs-5" />
                                            </div>
                                            <h4 className="fw-bold mb-0 text-dark">Section 4: Venue Gallery</h4>
                                        </div>

                                        <div
                                            className={`border border-2 border-dashed rounded-4 p-5 text-center position-relative ${dragActive ? "border-primary bg-primary-subtle" : "border-muted bg-light"}`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            style={{ cursor: "pointer", transition: "all 0.2s" }}
                                        >
                                            <input
                                                type="file"
                                                className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                                                multiple
                                                onChange={handleFileChange}
                                                accept="image/png, image/jpg, image/jpeg, image/webp"
                                                style={{ cursor: "pointer" }}
                                            />
                                            <FaUpload className="fs-1 text-primary mb-3" />
                                            <h5>Drag & Drop images here, or browse</h5>
                                            <p className="small text-muted mb-0">Supports PNG, JPG, JPEG, WEBP. Max 8 images. Click to choose.</p>
                                        </div>

                                        {files.length > 0 && (
                                            <div className="mt-4">
                                                <h6 className="fw-bold text-dark mb-3">Uploaded Images Preview ({files.length}/8)</h6>
                                                <div className="row g-3">
                                                    {files.map((file, idx) => (
                                                        <div key={idx} className="col-md-3 col-sm-6">
                                                            <div className="card h-100 border shadow-sm rounded-3 overflow-hidden position-relative">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt="Preview"
                                                                    className="card-img-top"
                                                                    style={{ height: "120px", objectFit: "cover" }}
                                                                />
                                                                <div className="position-absolute top-0 start-0 m-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setCoverIndex(idx)}
                                                                        className={`btn btn-xs rounded-pill shadow px-2 py-1 ${coverIndex === idx ? "btn-success" : "btn-light opacity-75"}`}
                                                                        style={{ fontSize: "0.65rem", fontWeight: "bold" }}
                                                                    >
                                                                        {coverIndex === idx ? "⭐ Cover" : "Make Cover"}
                                                                    </button>
                                                                </div>
                                                                <div className="position-absolute top-0 end-0 m-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFile(idx)}
                                                                        className="btn btn-sm btn-danger rounded-circle p-1 d-flex align-items-center justify-content-center shadow"
                                                                        style={{ width: "24px", height: "24px" }}
                                                                    >
                                                                        <FaTimes size={10} />
                                                                    </button>
                                                                </div>
                                                                <div className="card-footer bg-white border-0 text-center py-2 px-1">
                                                                    <span className="small text-truncate d-block text-muted" style={{ maxWidth: "100%" }}>{file.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                                <FaSpinner className="spinner-border spinner-border-sm me-2" role="status" /> Saving Venue...
                                            </>
                                        ) : (
                                            "Register Turf Venue"
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

export default AddVenue;