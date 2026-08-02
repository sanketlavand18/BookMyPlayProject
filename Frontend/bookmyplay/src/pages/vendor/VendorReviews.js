import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaStar, FaSearch, FaChevronLeft, FaChevronRight, FaSpinner, FaRegCommentDots } from "react-icons/fa";

function VendorReviews() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reply states
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (user.id) {
      loadReviews();
    } else {
      navigate("/login");
    }
  }, [user.id]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/reviews/vendor/${user.id}`);
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setReviews(sorted);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setReplyError("Reply text cannot be empty.");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/reviews/${replyTarget.id}/reply`, replyText.trim(), {
        headers: { "Content-Type": "text/plain" }
      });
      setReplyTarget(null);
      loadReviews();
    } catch (err) {
      console.error("Failed to submit reply:", err);
      setReplyError("Failed to submit reply.");
    }
  };

  // Filter & Search logic
  const filteredReviews = reviews.filter((r) => {
    const query = searchQuery.toLowerCase();
    const customer = r.userName || "Customer";
    const commentText = r.comment || "";
    const venueNameText = r.venueName || "";
    const titleText = r.title || "";

    const matchesSearch =
      customer.toLowerCase().includes(query) ||
      commentText.toLowerCase().includes(query) ||
      titleText.toLowerCase().includes(query) ||
      venueNameText.toLowerCase().includes(query);

    const matchesStars = starFilter === "ALL" || String(r.rating) === starFilter;

    return matchesSearch && matchesStars;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

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
                <h2 className="fw-bold mb-0 text-dark">⭐ Reviews & Feedback</h2>
                <p className="text-muted mb-0">Monitor customer experiences, star ratings, and testimonials across your arenas.</p>
              </div>

              <div className="d-flex gap-2 align-items-center">
                {/* Rating Filter */}
                <select
                  className="form-select border shadow-sm"
                  style={{ width: "150px" }}
                  value={starFilter}
                  onChange={(e) => { setStarFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="ALL">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>

                {/* Search Input */}
                <div className="input-group shadow-sm" style={{ width: "260px" }}>
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Search comments, venues..."
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
                <h5 className="mt-3 text-muted">Loading reviews...</h5>
              </div>
            ) : (
              <div className="row g-4">
                {currentReviews.length === 0 ? (
                  <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                      <FaRegCommentDots className="fs-1 text-muted mb-3" />
                      <h5 className="text-muted">No reviews matching the selection.</h5>
                    </div>
                  </div>
                ) : (
                  currentReviews.map((r) => (
                    <div className="col-md-6" key={r.id}>
                      <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between">
                        <div>
                          {/* Stars and Venue Title */}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="fw-bold text-dark mb-0">{r.venueName}</h5>
                            </div>
                            <div className="text-warning fw-bold d-flex align-items-center gap-1">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <FaStar key={idx} className={idx < r.rating ? "text-warning" : "text-muted opacity-25"} />
                              ))}
                            </div>
                          </div>

                          <div className="small text-muted mb-2">
                            <span>📅 Play Date: {r.bookingDate || "N/A"}</span>
                            <span className="mx-2">|</span>
                            <span>Review Date: {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent"}</span>
                          </div>

                          {/* Review Title & Comment */}
                          <div className="bg-light p-3 rounded-3 mb-3">
                            {r.title && <h6 className="fw-bold text-dark mb-1">🏷️ {r.title}</h6>}
                            <p className="text-secondary small mb-0 italic" style={{ fontStyle: "italic", whiteSpace: "pre-line" }}>
                              "{r.comment || "No comment written."}"
                            </p>
                          </div>

                          {/* Vendor Reply Nesting */}
                          {r.vendorReply && (
                            <div className="ms-3 p-3 bg-success-subtle border-start border-4 border-success rounded-3 mb-3">
                              <strong className="text-dark small d-block">💬 Your Response ({r.replyAt ? new Date(r.replyAt).toLocaleDateString() : "Recent"}):</strong>
                              <span className="text-secondary small">{r.vendorReply}</span>
                            </div>
                          )}
                        </div>

                        {/* Customer Meta & Action */}
                        <div className="border-top pt-3 d-flex align-items-center justify-content-between mt-auto">
                          <span className="fw-bold text-dark small">
                            👤 {r.userName || "Customer"}
                          </span>
                          <button
                            className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold"
                            onClick={() => { setReplyTarget(r); setReplyText(r.vendorReply || ""); setReplyError(""); }}
                          >
                            {r.vendorReply ? "Update Reply" : "Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="col-12 d-flex justify-content-center align-items-center gap-3 mt-4">
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm"
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
                      className="btn btn-outline-secondary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-sm"
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

      {/* REPLY MODAL */}
      {replyTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Reply to Review</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setReplyTarget(null)}></button>
              </div>
              <form onSubmit={handleReplySubmit}>
                <div className="modal-body p-4">
                  <p className="small text-muted mb-3">Responding to review by <strong>{replyTarget.userName || "Customer"}</strong> on <strong>{replyTarget.venueName}</strong>.</p>
                  
                  {replyError && <div className="alert alert-danger py-2 small">{replyError}</div>}
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Your Response</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      placeholder="Write a professional reply to the customer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setReplyTarget(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success text-white px-4 rounded-pill fw-bold">Submit Response</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorReviews;