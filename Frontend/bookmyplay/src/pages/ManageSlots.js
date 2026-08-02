import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addSlot, deleteSlot, getSlotsByVenue } from "../services/slotService";
import VendorSidebar from "../components/VendorSidebar";
import VendorNavbar from "../components/VendorNavbar";
import { FaTrash, FaPlus, FaSpinner, FaCalendarDay } from "react-icons/fa";

function ManageSlots() {
    const { venueId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [slot, setSlot] = useState({
        venueId: venueId,
        slotDate: "",
        startTime: "",
        endTime: ""
    });

    useEffect(() => {
        if (!user.id) {
            navigate("/login");
        } else {
            loadSlots();
        }
    }, [venueId]);

    const loadSlots = async () => {
        setLoading(true);
        try {
            const response = await getSlotsByVenue(venueId);
            // Sort slots chronologically
            const sorted = (response.data || []).sort((a, b) => {
                if (a.slotDate !== b.slotDate) {
                    return new Date(a.slotDate) - new Date(b.slotDate);
                }
                return a.startTime.localeCompare(b.startTime);
            });
            setSlots(sorted);
        } catch (error) {
            console.error("Error loading slots:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSlot({
            ...slot,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!slot.slotDate || !slot.startTime || !slot.endTime) {
            alert("Please fill in all date and time slots.");
            return;
        }

        try {
            const response = await addSlot(slot);
            alert(response.data || "Slot Added Successfully");
            loadSlots();
            // Reset times, keep date for fast multi-add
            setSlot(prev => ({
                ...prev,
                startTime: "",
                endTime: ""
            }));
        } catch (err) {
            console.error("Error adding slot:", err);
            alert("Failed to add slot. Please verify timings.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking slot?")) return;
        try {
            await deleteSlot(id);
            alert("Slot Deleted Successfully");
            loadSlots();
        } catch (err) {
            console.error(err);
            alert("Failed to delete slot.");
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        try {
            const [hour, minute] = timeStr.split(":");
            const hr = parseInt(hour, 10);
            const ampm = hr >= 12 ? "PM" : "AM";
            const formattedHour = hr % 12 || 12;
            return `${formattedHour}:${minute} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-2 p-0">
                    <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
                </div>

                {/* Content */}
                <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
                    <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                    <div className="px-4 pb-4">
                        <div className="mb-4">
                            <h2 className="fw-bold mb-0 text-dark">📅 Manage Venue Booking Slots</h2>
                            <p className="text-muted">Register open slots, set start/end timings, and clean up expired slots.</p>
                        </div>

                        <div className="row g-4">
                            {/* Add Slot Form */}
                            <div className="col-lg-4">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                    <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                        <FaCalendarDay className="text-success" /> Add Booking Slot
                                    </h5>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small text-secondary fw-semibold">Slot Date</label>
                                            <input
                                                type="date"
                                                className="form-control rounded-3"
                                                name="slotDate"
                                                value={slot.slotDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small text-secondary fw-semibold">Start Time</label>
                                            <input
                                                type="time"
                                                className="form-control rounded-3"
                                                name="startTime"
                                                value={slot.startTime}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small text-secondary fw-semibold">End Time</label>
                                            <input
                                                type="time"
                                                className="form-control rounded-3"
                                                name="endTime"
                                                value={slot.endTime}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <button className="btn btn-success w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
                                            <FaPlus /> Add Slot
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Slots List */}
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                                    <div className="card-header bg-white border-0 py-3">
                                        <h5 className="fw-bold mb-0 text-dark">Active Slots Registry</h5>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <FaSpinner className="spinner-border text-success fs-3" role="status" />
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th className="py-3 px-4">Date</th>
                                                        <th className="py-3">Start Time</th>
                                                        <th className="py-3">End Time</th>
                                                        <th className="py-3">Status</th>
                                                        <th className="py-3 text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {slots.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-muted py-5">
                                                                No slots registered for this venue yet. Use the builder on the left to add one!
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        slots.map(s => (
                                                            <tr key={s.id}>
                                                                <td className="px-4 fw-semibold text-secondary">{s.slotDate}</td>
                                                                <td>{formatTime(s.startTime)}</td>
                                                                <td>{formatTime(s.endTime)}</td>
                                                                <td>
                                                                    <span className={`badge px-3 py-2 text-uppercase ${s.isBooked ? "bg-danger" : "bg-success"}`}>
                                                                        {s.isBooked ? "Booked" : "Available"}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center mx-auto"
                                                                        style={{ width: "35px", height: "35px" }}
                                                                        onClick={() => handleDelete(s.id)}
                                                                        disabled={s.isBooked}
                                                                        title={s.isBooked ? "Booked slots cannot be deleted" : "Delete Slot"}
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageSlots;
