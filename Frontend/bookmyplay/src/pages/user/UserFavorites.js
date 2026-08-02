import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import { FaHeart, FaSearch, FaStar, FaBuilding, FaSpinner, FaChevronLeft, FaChevronRight, FaTimes, FaMapMarkerAlt } from "react-icons/fa";

function UserFavorites() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!user.id) {
      navigate("/login");
    } else {
      loadFavorites();
    }
  }, [user.id]);

  const loadFavorites = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(`bmp_favs_${user.id}`);
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Error loading favorites:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (venueId) => {
    const updated = favorites.filter(v => v.id !== venueId);
    setFavorites(updated);
    localStorage.setItem(`bmp_favs_${user.id}`, JSON.stringify(updated));
    alert("Venue removed from favorites.");
  };

  // Search and Sort
  const getFilteredFavorites = () => {
    let list = [...favorites];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v => 
        v.venueName.toLowerCase().includes(q) || 
        (v.city || "").toLowerCase().includes(q) ||
        (v.category?.categoryName || v.sport || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "priceAsc") {
      list.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
    } else if (sortBy === "ratingDesc") {
      list.sort((a, b) => {
        const ratingA = a.reviews && a.reviews.length > 0 ? (a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length) : 0;
        const ratingB = b.reviews && b.reviews.length > 0 ? (b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length) : 0;
        return ratingB - ratingA;
      });
    }

    return list;
  };

  const filteredList = getFilteredFavorites();
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

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
                <h2 className="fw-bold mb-0 text-dark">⭐ Favorite Venues</h2>
                <p className="text-muted mb-0">Explore and quick-book your saved sports complexes and turfs.</p>
              </div>

              <div className="d-flex gap-2 align-items-center">
                {/* Sort */}
                <select
                  className="form-select border shadow-sm"
                  style={{ width: "160px" }}
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                >
                  <option value="default">Default Sort</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="ratingDesc">Top Rated First</option>
                </select>

                {/* Search Input */}
                <div className="input-group shadow-sm" style={{ width: "260px" }}>
                  <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Search favorites..."
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
              </div>
            ) : paginatedList.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <FaHeart className="fs-1 text-muted opacity-30 mb-3" />
                <h5 className="text-muted">No favorite venues saved.</h5>
                <p className="small text-muted mb-4">Go to the homepage and save venues to see them here.</p>
                <Link to="/" className="btn btn-success px-4 rounded-pill fw-semibold mx-auto">Browse Arenas</Link>
              </div>
            ) : (
              <div className="row g-4">
                {paginatedList.map((venue) => {
                  const totalRatings = venue.reviews ? venue.reviews.reduce((acc, r) => acc + r.rating, 0) : 0;
                  const avgRating = venue.reviews && venue.reviews.length > 0 ? (totalRatings / venue.reviews.length).toFixed(1) : "N/A";
                  
                  return (
                    <div className="col-md-6 col-lg-4" key={venue.id}>
                      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100 d-flex flex-column justify-content-between position-relative animate-hover">
                        {/* Remove Fav Top Right */}
                        <button 
                          className="btn btn-light shadow-sm rounded-circle p-2 position-absolute top-0 end-0 m-3 border-0"
                          style={{ zIndex: 10, width: "36px", height: "36px" }}
                          onClick={() => handleRemoveFavorite(venue.id)}
                          title="Remove from favorites"
                        >
                          <FaTimes className="text-danger" />
                        </button>

                        <div>
                          {/* Cover Image */}
                          {venue.imageUrl ? (
                            <img
                              src={venue.imageUrl.startsWith("http") ? venue.imageUrl : `http://localhost:8080${venue.imageUrl}`}
                              alt={venue.venueName}
                              className="w-100"
                              style={{ height: "180px", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center text-secondary" style={{ height: "180px" }}>
                              <FaBuilding className="fs-1 opacity-25" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "70%" }}>{venue.venueName}</h5>
                              <span className="badge bg-success-subtle text-success small">{venue.category?.categoryName || venue.sport}</span>
                            </div>
                            <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                              <FaMapMarkerAlt /> {venue.address}, {venue.city}
                            </div>
                            <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
                              <span className="fw-bold text-success">₹ {venue.pricePerHour} <span className="small text-muted fw-normal">/ hr</span></span>
                              <span className="text-warning fw-bold small d-flex align-items-center gap-1">
                                <FaStar /> {avgRating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Book Again */}
                        <div className="px-4 pb-4">
                          <Link to={`/venue/${venue.id}`} className="btn btn-success w-100 rounded-pill py-2 fw-semibold text-white d-flex align-items-center justify-content-center gap-2">
                            Book Again
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

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
    </div>
  );
}

export default UserFavorites;
