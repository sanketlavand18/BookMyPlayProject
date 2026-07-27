import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaTrash, FaEye, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Details Modal state
  const [viewingBooking, setViewingBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load bookings list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking? This will cancel the booking and release the slot!")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/bookings/${id}`);
      alert("Booking Deleted Successfully");
      loadBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  // Filter & Search logic
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    const customer = b.customerName || b.userName || (b.user && b.user.fullName) || "";
    const vendor = b.vendorName || "";
    const venue = b.venueName || (b.venue && b.venue.venueName) || "";
    return (
      String(b.id).includes(query) ||
      customer.toLowerCase().includes(query) ||
      vendor.toLowerCase().includes(query) ||
      venue.toLowerCase().includes(query) ||
      (b.bookingStatus || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Manage Bookings</h2>
            
            {/* Search Input */}
            <div className="input-group shadow-sm" style={{ width: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search ID, customer, vendor..."
                className="form-control border-start-0 shadow-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border text-primary fs-2" role="status" />
              <h5 className="mt-3 text-muted">Loading bookings...</h5>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3">Customer Name</th>
                      <th className="py-3">Vendor Name</th>
                      <th className="py-3">Turf Venue</th>
                      <th className="py-3">Booking Date</th>
                      <th className="py-3">Grand Total</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-5">No booking records found.</td>
                      </tr>
                    ) : (
                      currentItems.map((b) => (
                        <tr key={b.id}>
                          <td className="px-4 fw-semibold text-secondary">#BMP-{b.id}</td>
                          <td>
                            <span className="fw-bold text-dark">
                              {b.customerName || b.userName || (b.user && b.user.fullName) || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold text-dark">{b.vendorName || "N/A"}</span>
                          </td>
                          <td className="fw-semibold">{b.venueName || (b.venue && b.venue.venueName) || "N/A"}</td>
                          <td className="text-muted">{b.bookingDate}</td>
                          <td className="fw-bold text-success">₹ {b.totalPrice}</td>
                          <td>
                            <span className={`badge px-3 py-2 text-uppercase ${
                              b.bookingStatus === "CONFIRMED"
                                ? "bg-success"
                                : b.bookingStatus === "COMPLETED"
                                ? "bg-primary"
                                : "bg-danger"
                            }`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-outline-dark btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => setViewingBooking(b)}
                              >
                                <FaEye />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleDelete(b.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
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
        </div>
      </div>

      {/* DETAIL MODAL */}
      {viewingBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Booking Details</h5>
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
                    {viewingBooking.customerName || viewingBooking.userName || (viewingBooking.user && viewingBooking.user.fullName) || "N/A"} (ID: #{viewingBooking.userId || (viewingBooking.user && viewingBooking.user.id)})
                  </strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Vendor Name:</span>
                  <strong className="text-dark">{viewingBooking.vendorName || "N/A"}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Arena / Turf Venue:</span>
                  <strong className="text-dark">{viewingBooking.venueName || (viewingBooking.venue && viewingBooking.venue.venueName) || "N/A"} (ID: #{viewingBooking.venueId || (viewingBooking.venue && viewingBooking.venue.id)})</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Booking Date & Times:</span>
                  <strong className="text-dark">{viewingBooking.bookingDate} ({viewingBooking.startTime} - {viewingBooking.endTime})</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Price Charged:</span>
                  <strong className="text-success fs-5">₹ {viewingBooking.totalPrice}</strong>
                </div>
                <div className="mb-1">
                  <span className="small text-muted d-block">Status:</span>
                  <span className={`badge px-3 py-2 text-uppercase ${
                    viewingBooking.bookingStatus === "CONFIRMED" ? "bg-success" : "bg-danger"
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
  );
}

export default ManageBookings;