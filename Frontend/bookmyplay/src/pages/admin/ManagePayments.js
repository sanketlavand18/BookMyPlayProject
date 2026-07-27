import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaEye, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail Modal state
  const [viewingPayment, setViewingPayment] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/payments");
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search logic
  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      String(p.bookingId).includes(query) ||
      (p.customerName || "").toLowerCase().includes(query) ||
      (p.vendorName || "").toLowerCase().includes(query) ||
      (p.venueName || "").toLowerCase().includes(query) ||
      (p.paymentStatus || "").toLowerCase().includes(query) ||
      (p.transactionId || "").toLowerCase().includes(query)
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
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Payment Management</h2>
            
            {/* Search Input */}
            <div className="input-group shadow-sm" style={{ width: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search Booking, Customer, Vendor..."
                className="form-control border-start-0 shadow-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border text-success fs-2" role="status" />
              <h5 className="mt-3 text-muted">Loading payments...</h5>
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
                      <th className="py-3">Venue Name</th>
                      <th className="py-3">Amount</th>
                      <th className="py-3">Payment Status</th>
                      <th className="py-3">Payment Date</th>
                      <th className="py-3">Transaction ID</th>
                      <th className="py-3 text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-5">No payment records logged yet.</td>
                      </tr>
                    ) : (
                      currentItems.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 fw-semibold text-secondary">#BMP-{p.bookingId}</td>
                          <td>
                            <span className="fw-bold text-dark">{p.customerName || "N/A"}</span>
                          </td>
                          <td>
                            <span className="fw-bold text-dark">{p.vendorName || "N/A"}</span>
                          </td>
                          <td className="fw-semibold">{p.venueName || "N/A"}</td>
                          <td className="fw-bold text-success">₹ {p.amount}</td>
                          <td>
                            <span className={`badge px-3 py-2 text-uppercase ${
                              p.paymentStatus === "SUCCESS"
                                ? "bg-success"
                                : p.paymentStatus === "REFUNDED"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-muted small">
                            {p.transactionId || "N/A"}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-outline-dark btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "35px", height: "35px" }}
                              onClick={() => setViewingPayment(p)}
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
        </div>
      </div>

      {/* DETAIL MODAL */}
      {viewingPayment && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Payment Log Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setViewingPayment(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Booking Reference:</span>
                  <strong className="text-dark">#BMP-{viewingPayment.bookingId}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Customer Name:</span>
                  <strong className="text-dark">{viewingPayment.customerName || "N/A"}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Vendor Name:</span>
                  <strong className="text-dark">{viewingPayment.vendorName || "N/A"}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Venue Name:</span>
                  <strong className="text-dark">{viewingPayment.venueName || "N/A"}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Payment Mode:</span>
                  <strong className="text-dark text-uppercase">{viewingPayment.paymentMethod}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Transaction Amount:</span>
                  <strong className="text-success fs-5">₹ {viewingPayment.amount}</strong>
                </div>
                <div className="mb-3 border-bottom pb-2">
                  <span className="small text-muted d-block">Transaction Date:</span>
                  <strong className="text-dark">{new Date(viewingPayment.paymentDate || viewingPayment.createdAt).toLocaleString()}</strong>
                </div>
                <div className="mb-1">
                  <span className="small text-muted d-block">Transaction Status:</span>
                  <span className={`badge px-3 py-2 text-uppercase ${
                    viewingPayment.paymentStatus === "SUCCESS" ? "bg-success" : "bg-danger"
                  }`}>{viewingPayment.paymentStatus}</span>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setViewingPayment(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePayments;
