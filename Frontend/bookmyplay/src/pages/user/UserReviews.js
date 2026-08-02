import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import { FaStar, FaEdit, FaTrash, FaSpinner, FaRegCommentDots, FaBuilding } from "react-icons/fa";

function UserReviews() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Edit Review Modal States
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    if (!user.id) {
      navigate("/login");
    } else {
      loadReviews();
    }
  }, [user.id]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/reviews/user/${user.id}`);
      // Sort reviews newest first
      const sorted = (res.data || []).sort((a, b) => b.id - a.id);
      setReviews(sorted);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editReviewForm.comment.trim()) {
      alert("Review comment cannot be empty.");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/reviews/${editingReview.id}`, {
        rating: editReviewForm.rating,
        comment: editReviewForm.comment
      });
      alert("Review updated successfully!");
      setEditingReview(null);
      loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to update review.");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/reviews/${id}`);
      alert("Review deleted successfully!");
      loadReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    }
  };

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
            <div className="mb-4">
              <h2 className="fw-bold mb-0 text-dark">📝 My Reviews & Ratings</h2>
              <p className="text-muted">Review, edit, and manage all your star ratings and testimonials written for turf complexes.</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <FaRegCommentDots className="fs-1 text-muted opacity-30 mb-3" />
                <h5 className="text-muted">No reviews submitted yet.</h5>
                <p className="small text-muted">You can write reviews for turf complexes under your "My Bookings" page once bookings are completed.</p>
              </div>
            ) : (
              <div className="row g-4">
                {reviews.map((r) => (
                  <div className="col-12" key={r.id}>
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div className="d-flex gap-3 align-items-center">
                          {r.venue?.imageUrl ? (
                            <img
                              src={r.venue.imageUrl.startsWith("http") ? r.venue.imageUrl : `http://localhost:8080${r.venue.imageUrl}`}
                              alt="venue"
                              className="rounded border shadow-sm"
                              style={{ width: "65px", height: "50px", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="bg-light rounded border d-flex align-items-center justify-content-center shadow-sm" style={{ width: "65px", height: "50px" }}>
                              <FaBuilding className="text-muted" />
                            </div>
                          )}
                          <div>
                            <h5 className="fw-bold mb-1 text-dark">{r.venue?.venueName || "Sports Venue"}</h5>
                            <div className="text-warning fw-bold d-flex align-items-center gap-1">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <FaStar key={idx} className={idx < r.rating ? "text-warning" : "text-muted opacity-25"} />
                              ))}
                              <span className="text-muted small ms-2 fw-semibold">({r.rating} / 5)</span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" 
                            style={{ width: "35px", height: "35px" }} 
                            onClick={() => { setEditingReview(r); setEditReviewForm({ rating: r.rating, comment: r.comment }); }}
                            title="Edit Review"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" 
                            style={{ width: "35px", height: "35px" }} 
                            onClick={() => handleDeleteReview(r.id)}
                            title="Delete Review"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 text-secondary bg-light p-3 rounded-3 mb-1" style={{ whiteSpace: "normal", fontStyle: "italic" }}>
                        "{r.comment}"
                      </p>
                      <span className="small text-muted text-end d-block">
                        Submitted: {new Date(r.createdAt || r.createdDate || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT REVIEW MODAL */}
      {editingReview && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit Review</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingReview(null)}></button>
              </div>
              <form onSubmit={handleUpdateReview}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Rating Star Tally</label>
                    <select
                      className="form-select"
                      value={editReviewForm.rating}
                      onChange={e => setEditReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                      <option value="3">⭐⭐⭐ (3/5 Average)</option>
                      <option value="2">⭐⭐ (2/5 Weak)</option>
                      <option value="1">⭐ (1/5 Poor)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Review Description / Comments</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={editReviewForm.comment}
                      onChange={e => setEditReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingReview(null)}>Close</button>
                  <button type="submit" className="btn btn-success text-white px-4 rounded-pill fw-bold">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserReviews;
