import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addVenue } from "../services/venueService";
import { getAllCategories } from "../services/categoryService";
import axios from "axios";
import VendorSidebar from "../components/VendorSidebar";
import VendorNavbar from "../components/VendorNavbar";
import {
    FaTimes,
    FaUpload,
    FaRupeeSign,
    FaSpinner,
    FaRegBuilding,
    FaList,
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

function AddVenue() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    // Search and dynamic sport request modal states
    const [showSportRequestModal, setShowSportRequestModal] = useState(false);
    const [requestSportName, setRequestSportName] = useState("");
    const [requestSportDesc, setRequestSportDesc] = useState("");
    const [submittingSportRequest, setSubmittingSportRequest] = useState(false);

    // Subscription status
    const [subStatus, setSubStatus] = useState("ACTIVE");
    const [pageLoading, setPageLoading] = useState(true);

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
        country: "India",
        postalCode: "",
        openTime: "07:00 AM",
        closeTime: "07:00 PM",
        slotDuration: "60",
        latitude: "",
        longitude: "",
        status: "PENDING" // PENDING = Publish Now, DRAFT = Save as Draft
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

    const [touchedFields, setTouchedFields] = useState({
        phone: false,
        altPhone: false,
        email: false
    });

    const [contactErrors, setContactErrors] = useState({
        phone: "",
        altPhone: "",
        email: ""
    });

    // Image upload states
    const [files, setFiles] = useState([]);
    const [coverIndex, setCoverIndex] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form submission feedback state
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user.id) {
            navigate("/login");
            return;
        }
        checkSubscription();
        loadCategories();
    }, [user.id]);

    const checkSubscription = async () => {
        try {
            setPageLoading(true);
            const res = await fetch(`http://localhost:8080/api/subscriptions/vendor/${user.id}`);
            const data = await res.json();
            const status = data.status || "NONE";
            const planType = data.planType || "NONE";
            const isAllowed = (status === "ACTIVE" || status === "FREE_TRIAL" || planType === "FREE_TRIAL");
            
            if (!isAllowed) {
                await window.Swal.fire({
                    icon: "warning",
                    title: "Subscription Expired",
                    text: "Your subscription has expired. Please renew your subscription to publish new venues.",
                    confirmButtonColor: "#198754",
                    confirmButtonText: "Go to Plans"
                });
                navigate("/vendor/subscription");
            } else {
                setSubStatus("ACTIVE");
            }
        } catch (e) {
            console.error("Error checking subscription:", e);
        } finally {
            setPageLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/categories");
            setCategories(response.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleAddSport = async (e) => {
        e.preventDefault();
        if (!requestSportName.trim()) {
            window.Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Sport Name is required.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        setSubmittingSportRequest(true);
        try {
            const res = await axios.post(`http://localhost:8080/api/categories?vendorId=${user.id}`, {
                categoryName: requestSportName.trim(),
                description: requestSportDesc.trim() || null
            });

            // Show Toast Alert
            const Toast = window.Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', window.Swal.stopTimer)
                    toast.addEventListener('mouseleave', window.Swal.resumeTimer)
                }
            });

            Toast.fire({
                icon: 'success',
                title: 'Sport category added successfully.'
            });

            setShowSportRequestModal(false);
            setRequestSportName("");
            setRequestSportDesc("");

            // Refresh the categories dropdown automatically
            const sportsRes = await axios.get("http://localhost:8080/api/categories");
            const list = sportsRes.data || [];
            setCategories(list);

            // Select the newly created category automatically
            setVenue(prev => ({
                ...prev,
                categoryId: res.data.id
            }));

        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data || "Failed to add sport category.";
            window.Swal.fire({
                icon: "error",
                title: "Failed to Add Sport",
                text: errMsg.includes("exists") ? "This sport category already exists." : errMsg,
                confirmButtonColor: "#dc3545"
            });
        } finally {
            setSubmittingSportRequest(false);
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

    const validateField = (name, value) => {
        let error = "";
        const val = (value || "").trim();

        if (name === "phone") {
            if (!val) {
                error = "Contact number is required.";
            } else if (!/^\d{10}$/.test(val)) {
                error = "Contact number must be exactly 10 digits.";
            }
        } else if (name === "altPhone") {
            if (val && !/^\d{10}$/.test(val)) {
                error = "Alternate number must be exactly 10 digits.";
            }
        } else if (name === "email") {
            if (!val) {
                error = "Email address is required.";
            } else {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(val)) {
                    error = "Please enter a valid email address.";
                }
            }
        }

        setContactErrors(prev => ({
            ...prev,
            [name]: error
        }));

        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (name === "phone" || name === "altPhone" || name === "email") {
            setTouchedFields(prev => ({
                ...prev,
                [name]: true
            }));
            validateField(name, value);
        }
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone" || name === "altPhone") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setContact(prev => {
                    const updated = { ...prev, [name]: numericValue };
                    if (touchedFields[name]) {
                        validateField(name, numericValue);
                    }
                    return updated;
                });
            }
        } else {
            setContact(prev => {
                const updated = { ...prev, [name]: value };
                if (name === "email") {
                    if (touchedFields.email) {
                        validateField("email", value);
                    }
                }
                return updated;
            });
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addSelectedFiles(selectedFiles);
    };

    const addSelectedFiles = (selectedFiles) => {
        const validExtensions = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
        const filtered = [];

        for (let file of selectedFiles) {
            const isValidFormat = validExtensions.includes(file.type);
            if (!isValidFormat) {
                window.Swal.fire({
                    icon: "warning",
                    title: "Invalid Format",
                    text: `${file.name} format is not supported. Use PNG, JPG, JPEG, or WEBP.`,
                    confirmButtonColor: "#198754"
                });
                continue;
            }

            const isUnderSizeLimit = file.size <= 5 * 1024 * 1024; // 5 MB
            if (!isUnderSizeLimit) {
                window.Swal.fire({
                    icon: "warning",
                    title: "File Too Large",
                    text: `${file.name} exceeds the 5 MB limit.`,
                    confirmButtonColor: "#198754"
                });
                continue;
            }

            filtered.push(file);
        }

        if (files.length + filtered.length > 8) {
            window.Swal.fire({
                icon: "warning",
                title: "Limit Exceeded",
                text: "Maximum 8 images can be uploaded.",
                confirmButtonColor: "#198754"
            });
            return;
        }

        // Simulate progress bar on file load
        setUploadProgress(10);
        let progress = 10;
        const interval = setInterval(() => {
            progress += 30;
            if (progress >= 100) {
                clearInterval(interval);
                setUploadProgress(100);
                setTimeout(() => setUploadProgress(0), 1000);
            } else {
                setUploadProgress(progress);
            }
        }, 150);

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
        if (!venue.categoryId) return "Please select a category.";
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

        // Set all fields to touched to display errors inline
        setTouchedFields({
            phone: true,
            altPhone: true,
            email: true
        });

        const phoneErr = validateField("phone", contact.phone);
        const altPhoneErr = validateField("altPhone", contact.altPhone);
        const emailErr = validateField("email", contact.email);

        if (phoneErr) return phoneErr;
        if (altPhoneErr) return altPhoneErr;
        if (emailErr) return emailErr;

        if (files.length === 0) {
            return "Please upload at least 1 image for the venue gallery.";
        }

        return null;
    };

    const handleSubmitWithStatus = async (statusVal) => {
        setErrorMsg("");
        
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

            const submissionData = {
                ...venue,
                status: statusVal,
                description: finalDesc,
                slotDuration: parseInt(venue.slotDuration, 10),
                latitude: venue.latitude ? parseFloat(venue.latitude) : null,
                longitude: venue.longitude ? parseFloat(venue.longitude) : null
            };

            await addVenue(submissionData, files, coverIndex);
            
            await window.Swal.fire({
                icon: "success",
                title: statusVal === "DRAFT" ? "Draft Saved!" : "Published successfully!",
                text: statusVal === "DRAFT" 
                    ? "Your venue details have been saved as a draft." 
                    : "Your venue has been successfully submitted and timing slots generated.",
                confirmButtonColor: "#198754",
                timer: 2500
            });

            navigate("/vendor/venues");
        } catch (error) {
            console.error("Backend Error:", error);
            window.Swal.fire({
                icon: "error",
                title: "Failed to Add Venue",
                text: error.response?.data || "An error occurred while saving the venue.",
                confirmButtonColor: "#dc3545"
            });
        } finally {
            setLoading(false);
        }
    };

    const [errorMsg, setErrorMsg] = useState("");

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
                <h5 className="mt-3 text-muted">Checking subscription parameters...</h5>
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
                                        <li className="breadcrumb-item text-muted active" aria-current="page">Add New Venue</li>
                                    </ol>
                                </nav>
                                <h3 className="fw-bold mb-0 text-dark">Add New Venue</h3>
                                <p className="text-muted small mb-0">Fill in the details below to publish your sports venue on BookMyPlay.</p>
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
                                <form onDragEnter={handleDrag}>
                                    
                                    {/* SECTION 1: BASIC INFO */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaRegBuilding className="text-success" /> Section 1: Basic Information
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Venue Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        name="venueName"
                                                        placeholder="e.g. Balewadi Box Cricket"
                                                        value={venue.venueName}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Sport Category *</label>
                                                    <select
                                                        className="form-select rounded-3"
                                                        name="categoryId"
                                                        value={venue.categoryId}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.sportName || category.categoryName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="mt-2 small">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowSportRequestModal(true)}
                                                            className="btn btn-link text-success p-0 border-0 align-baseline fw-semibold text-decoration-none"
                                                            style={{ fontSize: "0.85rem" }}
                                                        >
                                                            + Add New Sport
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small text-secondary fw-semibold">Description * (Minimum 30 characters)</label>
                                                    <textarea
                                                        className="form-control rounded-3"
                                                        name="description"
                                                        rows="4"
                                                        placeholder="Provide turf quality details, size, and layout guidelines..."
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
                                                        placeholder="Building, street name, layout"
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
                                                        placeholder="e.g. Pune"
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
                                                        placeholder="e.g. Maharashtra"
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
                                                        placeholder="6-digit PIN code"
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
                                                        placeholder="e.g. 18.5594"
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
                                                        placeholder="e.g. 73.7797"
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
                                                        placeholder="e.g. 1200"
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
                                                            Booking slots will be generated automatically based on the selected slot duration.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: GALLERY */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
                                                <FaUpload className="text-success" /> Section 4: Venue Gallery
                                            </h5>
                                            
                                            <div
                                                className={`border border-2 border-dashed rounded-4 p-5 text-center position-relative ${dragActive ? "border-success bg-success-subtle" : "border-muted bg-light"}`}
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
                                                <FaUpload className="fs-1 text-success mb-3" />
                                                <h6 className="fw-bold mb-1">Drag & Drop images here, or browse</h6>
                                                <p className="small text-muted mb-0">Supports PNG, JPG, JPEG, WEBP. Max 8 images. Size limit 5 MB.</p>
                                            </div>

                                            {uploadProgress > 0 && (
                                                <div className="progress mt-3 rounded-pill" style={{ height: "10px" }}>
                                                    <div 
                                                        className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                                                        role="progressbar" 
                                                        style={{ width: `${uploadProgress}%` }}
                                                        aria-valuenow={uploadProgress} 
                                                        aria-valuemin="0" 
                                                        aria-valuemax="100"
                                                    />
                                                </div>
                                            )}

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
                                                        placeholder="Name of manager"
                                                        value={contact.person}
                                                        onChange={handleContactChange}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Contact Number</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control rounded-3 ${touchedFields.phone && contactErrors.phone ? "is-invalid" : ""}`}
                                                        name="phone"
                                                        placeholder="10-digit number"
                                                        value={contact.phone}
                                                        onChange={handleContactChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touchedFields.phone && contactErrors.phone && (
                                                        <div className="invalid-feedback">{contactErrors.phone}</div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Alternate Number</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control rounded-3 ${touchedFields.altPhone && contactErrors.altPhone ? "is-invalid" : ""}`}
                                                        name="altPhone"
                                                        placeholder="10-digit number"
                                                        value={contact.altPhone}
                                                        onChange={handleContactChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touchedFields.altPhone && contactErrors.altPhone && (
                                                        <div className="invalid-feedback">{contactErrors.altPhone}</div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-secondary fw-semibold">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className={`form-control rounded-3 ${touchedFields.email && contactErrors.email ? "is-invalid" : ""}`}
                                                        name="email"
                                                        placeholder="manager@example.com"
                                                        value={contact.email}
                                                        onChange={handleContactChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {touchedFields.email && contactErrors.email && (
                                                        <div className="invalid-feedback">{contactErrors.email}</div>
                                                    )}
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
                                                        checked={venue.status === "PENDING"}
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

            {/* Add New Sport Bootstrap Modal */}
            {showSportRequestModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold">Add New Sport</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSportRequestModal(false)} aria-label="Close"></button>
                            </div>
                            <form onSubmit={handleAddSport}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small text-secondary fw-semibold">Sport Name *</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            value={requestSportName}
                                            onChange={(e) => setRequestSportName(e.target.value)}
                                            placeholder="e.g. Pickleball"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small text-secondary fw-semibold">Sport Description (Optional)</label>
                                        <textarea
                                            className="form-control rounded-3"
                                            value={requestSportDesc}
                                            onChange={(e) => setRequestSportDesc(e.target.value)}
                                            placeholder="Brief description about the sport specifications..."
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowSportRequestModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold" style={{ backgroundColor: "#198754" }} disabled={submittingSportRequest}>
                                        {submittingSportRequest ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddVenue;