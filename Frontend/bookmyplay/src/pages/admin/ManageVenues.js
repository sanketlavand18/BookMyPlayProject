import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaSearch, FaTrash, FaEdit, FaChevronLeft, FaChevronRight, FaSpinner, FaCheck, FaTimes, FaTag } from "react-icons/fa";

const Swal = window.Swal;

function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editForm, setEditForm] = useState({ venueName: "", pricePerHour: 0, city: "", address: "", description: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/venues");
      setVenues(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (v) => {
    setEditingVenue(v);
    setEditForm({
      venueName: v.venueName || "",
      pricePerHour: v.pricePerHour || 0,
      city: v.city || "",
      address: v.address || "",
      description: v.description || ""
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/venues/${editingVenue.id}`, {
        ...editingVenue,
        ...editForm,
        categoryId: editingVenue.category?.id
      });
      await Swal.fire({
        title: "Updated!",
        text: "Venue Updated Successfully",
        icon: "success",
        confirmButtonColor: "#198754"
      });
      setEditingVenue(null);
      loadVenues();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Failed to update venue details.",
        icon: "error",
        confirmButtonColor: "#dc3545"
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Venue",
      text: "Are you sure you want to delete this venue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/venues/${id}`);
        await Swal.fire({
          title: "Deleted!",
          text: "Venue Deleted Successfully",
          icon: "success",
          confirmButtonColor: "#198754"
        });
        loadVenues();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Error",
          text: "Failed to delete venue.",
          icon: "error",
          confirmButtonColor: "#dc3545"
        });
      }
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve Venue",
      text: "Approve this venue configuration and make it public?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d"
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:8080/api/admin/extended/venues/${id}/approve`);
        await Swal.fire({
          title: "Approved!",
          text: "Venue approved successfully.",
          icon: "success",
          confirmButtonColor: "#198754"
        });
        loadVenues();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Error",
          text: "Failed to approve venue.",
          icon: "error",
          confirmButtonColor: "#dc3545"
        });
      }
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Venue",
      text: "Reject this venue? It will remain hidden from bookings.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d"
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:8080/api/admin/extended/venues/${id}/reject`);
        await Swal.fire({
          title: "Rejected!",
          text: "Venue rejected.",
          icon: "success",
          confirmButtonColor: "#198754"
        });
        loadVenues();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Error",
          text: "Failed to reject venue.",
          icon: "error",
          confirmButtonColor: "#dc3545"
        });
      }
    }
  };

  const handleUpdateTag = async (id, tag) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/extended/venues/${id}/tag?tag=${tag}`);
      await Swal.fire({
        title: "Success",
        text: `Venue tag updated to: ${tag}`,
        icon: "success",
        confirmButtonColor: "#198754"
      });
      loadVenues();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Failed to update featured tag.",
        icon: "error",
        confirmButtonColor: "#dc3545"
      });
    }
  };

  // Filter
  const filteredVenues = venues.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      (v.venueName || "").toLowerCase().includes(query) ||
      (v.city || "").toLowerCase().includes(query) ||
      (v.address || "").toLowerCase().includes(query) ||
      (v.category?.categoryName || "").toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVenues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Left Sidebar */}
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        {/* Content Column */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          
          <AdminNavbar />

          <div className="px-4 pb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0 text-dark">Manage Venues</h2>
              
              {/* Search */}
              <div className="input-group shadow-sm" style={{ width: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input
                  type="text"
                  placeholder="Search venue name, city, category..."
                  className="form-control border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3">Venue Name</th>
                        <th className="py-3">City</th>
                        <th className="py-3">Price / Hour</th>
                        <th className="py-3">Approval Status</th>
                        <th className="py-3">Featured Tag</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-5">No venue records found.</td>
                        </tr>
                      ) : (
                        currentItems.map((v) => (
                          <tr key={v.id}>
                            <td className="px-4 text-muted fw-bold">#{v.id}</td>
                            <td>
                              <span className="fw-bold text-dark d-block">{v.venueName}</span>
                              <span className="text-muted small">{v.category?.categoryName || "Sports"}</span>
                            </td>
                            <td>{v.city}</td>
                            <td className="fw-semibold text-success">₹ {v.pricePerHour}</td>
                            <td>
                              <span className={`badge px-2 py-1 text-uppercase ${
                                v.status === "APPROVED" ? "bg-success" : v.status === "REJECTED" ? "bg-danger" : "bg-warning text-dark"
                              }`}>
                                {v.status || "PENDING"}
                              </span>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm text-uppercase fw-bold rounded-pill text-primary"
                                style={{ width: "140px" }}
                                value={v.tag || "NEW"}
                                onChange={(e) => handleUpdateTag(v.id, e.target.value)}
                              >
                                <option value="NEW">New</option>
                                <option value="FEATURED">Featured</option>
                                <option value="TRENDING">Trending</option>
                                <option value="RECOMMENDED">Recommended</option>
                                <option value="POPULAR">Popular</option>
                              </select>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                {(!v.status || v.status === "PENDING" || v.status === "REJECTED") && (
                                  <button onClick={() => handleApprove(v.id)} className="btn btn-success btn-sm rounded-pill d-flex align-items-center gap-1">
                                    <FaCheck /> Approve
                                  </button>
                                )}
                                {(v.status === "APPROVED" || !v.status || v.status === "PENDING") && (
                                  <button onClick={() => handleReject(v.id)} className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1">
                                    <FaTimes /> Reject
                                  </button>
                                )}
                                <button className="btn btn-outline-primary btn-sm" onClick={() => handleEditClick(v)}>
                                  Edit
                                </button>
                                <button className="btn btn-outline-danger btn-sm p-1.5 rounded-circle" onClick={() => handleDelete(v.id)}>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVenues.length)} of {filteredVenues.length} entries</span>
                    <div className="d-flex gap-2">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="btn btn-outline-dark btn-sm rounded-circle px-2 py-1"><FaChevronLeft /></button>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="btn btn-outline-dark btn-sm rounded-circle px-2 py-1"><FaChevronRight /></button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Edit Modal */}
      {editingVenue && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit Venue Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingVenue(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Venue Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.venueName}
                      onChange={e => setEditForm({ ...editForm, venueName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Price Per Hour (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.pricePerHour}
                      onChange={e => setEditForm({ ...editForm, pricePerHour: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.city}
                        onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.address}
                        onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      required
                    />
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