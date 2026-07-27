import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { FaSearch, FaTrash, FaEdit, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit Modal states
  const [editingVendor, setEditingVendor] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/vendors");
      setVendors(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendors list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor account?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/vendors/${id}`);
      alert("Vendor Deleted Successfully");
      loadVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to delete vendor.");
    }
  };

  const handleEditClick = (vendor) => {
    setEditingVendor(vendor);
    setEditForm({
      fullName: vendor.fullName || "",
      email: vendor.email || "",
      phone: vendor.phone || ""
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
      const updatedVendor = { ...editingVendor, ...editForm };
      await axios.put(`http://localhost:8080/api/admin/vendors/${editingVendor.id}`, updatedVendor);
      alert("Vendor Updated Successfully");
      setEditingVendor(null);
      loadVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to update vendor.");
    }
  };

  // Filter & Search logic
  const filteredVendors = vendors.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      (v.fullName || "").toLowerCase().includes(query) ||
      (v.email || "").toLowerCase().includes(query) ||
      (v.phone || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Manage Vendors</h2>
            
            {/* Search Input */}
            <div className="input-group shadow-sm" style={{ width: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
              <input
                type="text"
                placeholder="Search vendor, email, phone..."
                className="form-control border-start-0 shadow-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner className="spinner-border text-success fs-2" role="status" />
              <h5 className="mt-3 text-muted">Loading vendors...</h5>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3">Vendor Name</th>
                      <th className="py-3">Email</th>
                      <th className="py-3">Phone</th>
                      <th className="py-3">Role</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-5">No vendor records found.</td>
                      </tr>
                    ) : (
                      currentItems.map((v) => (
                        <tr key={v.id}>
                          <td className="px-4 fw-semibold text-secondary">#{v.id}</td>
                          <td>
                            <span className="fw-bold text-dark">{v.fullName}</span>
                          </td>
                          <td className="text-muted">{v.email}</td>
                          <td className="text-muted">{v.phone || "N/A"}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success px-3 py-2 text-uppercase">{v.role}</span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleEditClick(v)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: "35px", height: "35px" }}
                                onClick={() => handleDelete(v.id)}
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
      {editingVendor && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit Vendor Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingVendor(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Vendor Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingVendor(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4 text-white rounded-pill">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageVendors;
