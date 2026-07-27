import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaTrash, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      const res = await axios.get("http://localhost:8080/api/admin/reviews");
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
      await axios.delete(`http://localhost:8080/api/admin/reviews/${id}`);
      alert("Review Deleted Successfully");
      loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    }
  };

  // Filter & Search logic
  const filteredReviews = reviews.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      (r.comment || "").toLowerCase().includes(query) ||
      String(r.rating).includes(query) ||
      String(r.venue?.venueName || r.venueId).toLowerCase().includes(query) ||
      String(r.user?.fullName || r.userId).toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Manage Reviews</h2>
            
            {/* Search Input */}
            <div className="input-group shadow-sm" style={{ width: "300px" }}>
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
                      <th className="py-3">Comment</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-5">No reviews found.</td>
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
                            {r.comment || "No comment provided."}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "35px", height: "35px" }}
                              onClick={() => handleDelete(r.id)}
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
  );
}

export default ManageReviews;