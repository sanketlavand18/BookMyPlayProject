import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaSearch, FaEye, FaChevronLeft, FaChevronRight, FaSpinner, FaHistory } from "react-icons/fa";

function VendorBookingHistory() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (user.id) {
      loadBookings();
    } else {
      navigate("/login");
    }
  }, [user.id]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/bookings/vendor/${user.id}`);
      // Filter for historical statuses: COMPLETED, CANCELLED by default, but let user see all if they want
      const historyOnly = (res.data || []).filter(
        b => b.bookingStatus === "COMPLETED" || b.bookingStatus === "CANCELLED"
      );
      setBookings(historyOnly);
    } catch (err) {
      console.error(err);
      alert("Failed to load turf booking history.");
    } finally {
      setLoading(false);
    }
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

  // Filter & Search logic
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    const customer = b.customerName || b.userName || "";
    const venue = b.venueName || "";
    const sport = b.categoryName || "";
    const matchesSearch = 
      String(b.id).includes(query) ||
      customer.toLowerCase().includes(query) ||
      venue.toLowerCase().includes(query) ||
      sport.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || b.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

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
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0 text-dark">📖 Booking History</h2>
                <p className="text-muted mb-0">Review past completed and cancelled bookings for your sports arenas.</p>
              </div>
              
              <div className="d-flex gap-2 align-items-center">
                {/* Status Filter */}
                <select
                  className="form-select border shadow-sm"
                  style={{ width: "160px" }}
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="ALL">All Past Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                {/* Search Input */}
                <div className="input-group shadow-sm" style={{ width: "260px" }}>
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Search ID, customer..."
                    className="form-control border-start-0 shadow-none"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
                <h5 className="mt-3 text-muted">Loading history logs...</h5>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3">Customer Name</th>
                        <th className="py-3">Venue Name</th>
                        <th className="py-3">Sport</th>
                        <th className="py-3">Booking Date</th>
                        <th className="py-3">Time Slot</th>
                        <th className="py-3">Amount</th>
                        <th className="py-3">Booking Status</th>
                        <th className="py-3">Payment Status</th>
                        <th className="py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center text-muted py-5">No historical bookings found matching the filters.</td>
                        </tr>
                      ) : (
                        currentItems.map((b) => (
                          <tr key={b.id}>
                            <td className="px-4 fw-semibold text-secondary">#BMP-{b.id}</td>
                            <td>
                              <span className="fw-bold text-dark">{b.customerName || b.userName || "N/A"}</span>
                            </td>
                            <td className="fw-semibold">{b.venueName || "N/A"}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary">{b.categoryName || "N/A"}</span>
                            </td>
                            <td className="text-muted">{b.bookingDate}</td>
                            <td className="text-muted small">
                              {formatTimeSlot(b.startTime)} - {formatTimeSlot(b.endTime)}
                            </td>
                            <td className="fw-bold text-success">₹ {b.totalPrice}</td>
                            <td>
                              <span className={`badge px-3 py-2 text-uppercase ${
                                b.bookingStatus === "COMPLETED" ? "bg-primary" : "bg-danger"
                              }`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td>
                              <span className={`badge px-3 py-2 text-uppercase ${
                                b.paymentStatus === "SUCCESS"
                                  ? "bg-success"
                                  : b.paymentStatus === "REFUNDED"
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}>
                                {b.paymentStatus || "PENDING"}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-outline-dark btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center mx-auto"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => setViewingBooking(b)}
                              >
                                <FaEye />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="card-footer bg-white border-0 py-3 d-flex justify-content-center align-items-center gap-3">
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      <FaChevronLeft />
                    </button>
                    <span className="small text-secondary fw-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px" }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* DETAIL MODAL */}
            {viewingBooking && (
              <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 rounded-4 shadow">
                    <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                      <h5 className="modal-title fw-bold">Past Booking Log Details</h5>
                      <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setViewingBooking(null)}></button>
                    </div>
                    <div className="modal-body p-4">
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Booking Reference:</span>
                        <strong className="text-dark">#BMP-{viewingBooking.id}</strong>
                      </div>
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Customer:</span>
                        <strong className="text-dark">
                          {viewingBooking.customerName || viewingBooking.userName || "N/A"}
                        </strong>
                      </div>
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Venue Name:</span>
                        <strong className="text-dark">{viewingBooking.venueName || "N/A"}</strong>
                      </div>
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Sport / Arena:</span>
                        <strong className="text-dark text-uppercase">{viewingBooking.categoryName || viewingBooking.sport || "N/A"}</strong>
                      </div>
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Slot Booking Date:</span>
                        <strong className="text-dark">{viewingBooking.bookingDate}</strong>
                      </div>
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Hours Reserved:</span>
                        <strong className="text-dark">{formatTimeSlot(viewingBooking.startTime)} - {formatTimeSlot(viewingBooking.endTime)}</strong>
                      </div>
                      <div className="mb-3 border-bottom pb-2">
                        <span className="small text-muted d-block">Total Fees Charged:</span>
                        <strong className="text-success fs-5">₹ {viewingBooking.totalPrice}</strong>
                      </div>
                      <div className="mb-1">
                        <span className="small text-muted d-block">Status Details:</span>
                        <span className={`badge px-3 py-2 text-uppercase ${
                          viewingBooking.bookingStatus === "COMPLETED" ? "bg-primary" : "bg-danger"
                        }`}>{viewingBooking.bookingStatus}</span>
                      </div>
                    </div>
                    <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                      <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setViewingBooking(null)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorBookingHistory;
