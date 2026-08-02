import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaTrash, FaChevronLeft, FaChevronRight, FaSpinner, FaEye, FaEyeSlash, FaStar, FaList } from "react-icons/fa";

function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, VISIBLE, HIDDEN
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, RATING_HIGH, RATING_LOW
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/reviews");
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load reviews list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user review?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/reviews/${id}`);
      alert("Review Deleted Successfully");
      loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    }
  };

  const handleToggleHide = async (id, isHidden) => {
    const action = isHidden ? "restore" : "hide";
    try {
      await axios.put(`http://localhost:8080/api/reviews/${id}/${action}`);
      alert(`Review is now ${isHidden ? "visible" : "hidden"} to customers.`);
      loadReviews();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} review.`);
    }
  };

  // Filter logic
  const filteredReviews = reviews.filter((r) => {
    const query = searchQuery.toLowerCase();
    const customer = r.userName || r.user?.fullName || `User #${r.userId}`;
    const comment = r.comment || "";
    const venue = r.venueName || r.venue?.venueName || `Venue #${r.venueId}`;
    const title = r.title || "";

    const matchesSearch =
      customer.toLowerCase().includes(query) ||
      comment.toLowerCase().includes(query) ||
      title.toLowerCase().includes(query) ||
      venue.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "HIDDEN" && r.isHidden) ||
      (statusFilter === "VISIBLE" && !r.isHidden);

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "NEWEST") {
      return b.id - a.id;
    } else if (sortBy === "RATING_HIGH") {
      return b.rating - a.rating;
    } else if (sortBy === "RATING_LOW") {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);

  // Summary Metrics
  const totalCount = reviews.length;
  const averageRating = totalCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) 
    : "0.0";

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Manage Reviews</h2>
            
            <div className="d-flex gap-2">
              {/* Search Input */}
              <div className="input-group shadow-sm" style={{ width: "260px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input
                  type="text"
                  placeholder="Search reviews, venue, user..."
                  className="form-control border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
          </div>

          {/* Metrics summary widgets */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted d-block fw-semibold mb-1">Total Reviews</span>
                    <h3 className="fw-bold mb-0 text-dark">{totalCount}</h3>
                  </div>
                  <div className="bg-primary-subtle text-primary rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                    <FaList className="fs-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted d-block fw-semibold mb-1">Average Rating</span>
                    <h3 className="fw-bold mb-0 text-warning">{averageRating} ★</h3>
                  </div>
                  <div className="bg-warning-subtle text-warning rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                    <FaStar className="fs-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering & Sorting Controls Bar */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === "ALL" ? "btn-dark text-white" : "btn-outline-dark bg-white"}`}
                onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }}
              >
                All Reviews
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === "VISIBLE" ? "btn-dark text-white" : "btn-outline-dark bg-white"}`}
                onClick={() => { setStatusFilter("VISIBLE"); setCurrentPage(1); }}
              >
                Visible
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${statusFilter === "HIDDEN" ? "btn-dark text-white" : "btn-outline-dark bg-white"}`}
                onClick={() => { setStatusFilter("HIDDEN"); setCurrentPage(1); }}
              >
                Hidden
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Sort By:</span>
              <select
                className="form-select form-select-sm border shadow-sm rounded-pill"
                style={{ width: "180px" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="NEWEST">Newest First</option>
                <option value="RATING_HIGH">Rating: High to Low</option>
                <option value="RATING_LOW">Rating: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border text-warning fs-2" role="status" />
              <h5 className="mt-3 text-muted">Loading reviews...</h5>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Turf Venue</th>
                      <th className="py-3">Rating</th>
                      <th className="py-3">Comment Details</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-5">No reviews found.</td>
                      </tr>
                    ) : (
                      currentItems.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 fw-semibold text-secondary">#{r.id}</td>
                          <td>
                            <span className="fw-bold text-dark">{r.userName || r.user?.fullName || `User #${r.userId}`}</span>
                          </td>
                          <td className="fw-semibold">{r.venueName || r.venue?.venueName || `Venue #${r.venueId}`}</td>
                          <td className="text-warning fw-bold">{r.rating} ★</td>
                          <td className="text-muted small" style={{ maxWidth: "300px", whiteSpace: "normal" }}>
                            {r.title && <strong className="d-block text-dark small mb-1">{r.title}</strong>}
                            <span>{r.comment || "No comment provided."}</span>
                            {r.bookingDate && <span className="d-block text-muted mt-1" style={{ fontSize: "0.75rem" }}>📅 Play Date: {r.bookingDate}</span>}
                          </td>
                          <td className="text-center">
                            <span className={`badge px-3 py-2 rounded-pill text-uppercase ${r.isHidden ? "bg-danger" : "bg-success"}`}>
                              {r.isHidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className={`btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center ${r.isHidden ? "btn-outline-success" : "btn-outline-warning"}`}
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleToggleHide(r.id, r.isHidden)}
                                title={r.isHidden ? "Restore Review" : "Hide Review"}
                              >
                                {r.isHidden ? <FaEye /> : <FaEyeSlash />}
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleDelete(r.id)}
                                title="Delete Review"
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
  );
}

export default ManageReviews;