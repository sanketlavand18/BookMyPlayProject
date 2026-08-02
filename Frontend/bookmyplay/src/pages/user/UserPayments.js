import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import { FaSpinner, FaSearch, FaChevronLeft, FaChevronRight, FaPrint, FaRegFileAlt, FaCreditCard } from "react-icons/fa";

function UserPayments() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!user.id) {
      navigate("/login");
    } else {
      loadPayments();
    }
  }, [user.id]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings(user.id);
      // Filter out bookings that represent successful/paid records
      const paid = (res.data || []).filter(
        b => b.paymentStatus === "SUCCESS" || b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED"
      );
      setBookings(paid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // Search logic
  const filteredPayments = bookings.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      String(p.id).includes(query) ||
      (p.venueName || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <UserSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <UserNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="px-4 pb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold mb-0 text-dark">💳 Billing & Payment History</h2>
                <p className="text-muted mb-0">Track all your turf booking fees, transactions, and download receipts.</p>
              </div>

              <div className="input-group shadow-sm" style={{ width: "280px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input
                  type="text"
                  placeholder="Search Booking ID, arena..."
                  className="form-control border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3">Turf Arena Name</th>
                        <th className="py-3">Payment Method</th>
                        <th className="py-3">Reference Transaction ID</th>
                        <th className="py-3">Amount Paid</th>
                        <th className="py-3">Payment Date</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-5">No billing transaction records found.</td>
                        </tr>
                      ) : (
                        currentItems.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 fw-semibold text-secondary">#BMP-{p.id}</td>
                            <td>
                              <span className="fw-bold text-dark">{p.venueName}</span>
                            </td>
                            <td>
                              <span className="text-uppercase small text-muted d-flex align-items-center gap-1">
                                <FaCreditCard /> Razorpay UPI
                              </span>
                            </td>
                            <td className="text-muted small">BMP-TXN-9874{p.id}</td>
                            <td className="fw-bold text-success">₹ {p.totalPrice}</td>
                            <td className="text-muted small">{p.bookingDate}</td>
                            <td>
                              <span className="badge bg-success px-3 py-2 text-uppercase">SUCCESS</span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-outline-dark btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center mx-auto"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => setInvoiceTarget(p)}
                                title="View Receipt Invoice"
                              >
                                <FaRegFileAlt />
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
          </div>
        </div>
      </div>

      {/* INVOICE / RECEIPT MODAL */}
      {invoiceTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)", zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
              
              {/* Invoice Printable Content */}
              <div className="p-5 bg-white" id="printable-invoice-container">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <h2 className="fw-bold text-success mb-1">BOOK MY PLAY</h2>
                    <span className="small text-muted">Receipt / Tax Invoice</span>
                  </div>
                  <div className="text-end">
                    <h5 className="fw-bold mb-0">INVOICE</h5>
                    <span className="small text-muted">No: #BMP-{invoiceTarget.id}</span>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-6">
                    <h6 className="fw-bold text-muted text-uppercase mb-1 small">Billed To:</h6>
                    <p className="mb-0 fw-semibold">{invoiceTarget.userName || user.fullName}</p>
                    <p className="small text-muted mb-0">{user.email}</p>
                  </div>
                  <div className="col-6 text-end">
                    <h6 className="fw-bold text-muted text-uppercase mb-1 small">Venue Operator:</h6>
                    <p className="mb-0 fw-semibold">{invoiceTarget.venueName}</p>
                    <p className="small text-muted mb-0">{invoiceTarget.city}</p>
                  </div>
                </div>

                <table className="table table-bordered mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th className="text-center">Date</th>
                      <th className="text-center">Time Slot</th>
                      <th className="text-end">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong className="d-block">{invoiceTarget.venueName}</strong>
                        <span className="small text-muted">{invoiceTarget.categoryName || "Sports Venue"} Facility Booking</span>
                      </td>
                      <td className="text-center align-middle">{invoiceTarget.bookingDate}</td>
                      <td className="text-center align-middle">{invoiceTarget.startTime} - {invoiceTarget.endTime}</td>
                      <td className="text-end align-middle fw-bold text-success">₹{invoiceTarget.totalPrice}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="row">
                  <div className="col-6">
                    <span className="small text-muted d-block">Payment Status:</span>
                    <span className="badge bg-success-subtle text-success border border-success px-3 py-1">PAID ONLINE</span>
                  </div>
                  <div className="col-6 text-end">
                    <span className="small text-muted d-block">Grand Total:</span>
                    <h3 className="fw-bold text-success">₹{invoiceTarget.totalPrice}</h3>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4 justify-content-between print-hidden">
                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setInvoiceTarget(null)}>Close</button>
                <button type="button" className="btn btn-success text-white px-4 rounded-pill d-flex align-items-center gap-2 fw-semibold" onClick={handlePrintInvoice}>
                  <FaPrint /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPayments;
