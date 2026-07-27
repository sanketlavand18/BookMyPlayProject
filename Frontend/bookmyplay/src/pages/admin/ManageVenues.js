import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaTrash, FaEdit, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit Modal states
  const [editingVenue, setEditingVenue] = useState(null);
  const [editForm, setEditForm] = useState({
    venueName: "",
    city: "",
    address: "",
    description: "",
    pricePerHour: ""
  });

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/venues");
      setVenues(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load venues list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this venue? All associated bookings and slots will be permanently cleared!")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/venues/${id}`);
      alert("Venue Deleted Successfully");
      loadVenues();
    } catch (err) {
      console.error(err);
      alert("Failed to delete venue.");
    }
  };

  const handleEditClick = (venue) => {
    setEditingVenue(venue);
    setEditForm({
      venueName: venue.venueName || "",
      city: venue.city || "",
      address: venue.address || "",
      description: venue.description || "",
      pricePerHour: venue.pricePerHour || ""
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedVenue = { ...editingVenue, ...editForm };
      await axios.put(`http://localhost:8080/api/admin/venues/${editingVenue.id}`, updatedVenue);
      alert("Venue Updated Successfully");
      setEditingVenue(null);
      loadVenues();
    } catch (err) {
      console.error(err);
      alert("Failed to update venue details.");
    }
  };

  // Filter & Search logic
  const filteredVenues = venues.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      (v.venueName || "").toLowerCase().includes(query) ||
      (v.city || "").toLowerCase().includes(query) ||
      (v.address || "").toLowerCase().includes(query) ||
      (v.category?.categoryName || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVenues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Manage Venues</h2>
            
            {/* Search Input */}
            <div className="input-group shadow-sm" style={{ width: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search venue name, city, sport..."
                className="form-control border-start-0 shadow-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border text-info fs-2" role="status" />
              <h5 className="mt-3 text-muted">Loading venues...</h5>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3">Venue Name</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">City</th>
                      <th className="py-3">Price / Hr</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-5">No sports venues found.</td>
                      </tr>
                    ) : (
                      currentItems.map((venue) => (
                        <tr key={venue.id}>
                          <td className="px-4 fw-semibold text-secondary">#{venue.id}</td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              {venue.imageUrl && (
                                <img
                                  src={venue.imageUrl.startsWith("http") ? venue.imageUrl : `http://localhost:8080${venue.imageUrl}`}
                                  alt="venue"
                                  className="rounded shadow-sm"
                                  style={{ width: "45px", height: "35px", objectFit: "cover" }}
                                />
                              )}
                              <span className="fw-bold text-dark">{venue.venueName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2 text-uppercase">
                              {venue.category?.categoryName || "N/A"}
                            </span>
                          </td>
                          <td className="text-muted">{venue.city}</td>
                          <td className="fw-bold text-success">₹ {venue.pricePerHour}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleEditClick(venue)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleDelete(venue.id)}
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

      {/* EDIT MODAL */}
      {editingVenue && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit Venue Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingVenue(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Venue Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="venueName"
                        value={editForm.venueName}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={editForm.city}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Price Per Hour (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="pricePerHour"
                        value={editForm.pricePerHour}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows="4"
                        value={editForm.description}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingVenue(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageVenues;