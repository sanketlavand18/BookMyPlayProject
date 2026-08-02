import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  FaSearch, 
  FaTrash, 
  FaEdit, 
  FaPlusCircle, 
  FaChevronLeft, 
  FaChevronRight, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaEye 
} from "react-icons/fa";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState("categories");

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  // Pagination states for Categories
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit Modal states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    categoryName: "",
    description: ""
  });

  // Sports Requests states
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    loadCategories();
    loadRequests();
    loadVendors();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      window.Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Failed to load sports categories.",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/sport-requests?adminId=${user.id || 1}`);
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error loading sport requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/vendors");
      setVendors(res.data || []);
    } catch (err) {
      console.error("Error loading vendors:", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      window.Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a category name",
        confirmButtonColor: "#198754"
      });
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/admin/categories", {
        categoryName,
        description
      });
      window.Swal.fire({
        icon: "success",
        title: "Category Added",
        text: "Category Added Successfully",
        confirmButtonColor: "#198754",
        timer: 2000
      });
      setCategoryName("");
      setDescription("");
      loadCategories();
    } catch (err) {
      console.error(err);
      window.Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: "Failed to add category.",
        confirmButtonColor: "#dc3545"
      });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await window.Swal.fire({
      icon: "warning",
      title: "Delete Category?",
      text: "Are you sure you want to delete this category? Associated venues might lose this classification!",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel"
    });

    if (!confirmed.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/admin/categories/${id}`);
      window.Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Category Deleted Successfully",
        confirmButtonColor: "#198754",
        timer: 2000
      });
      loadCategories();
    } catch (err) {
      console.error(err);
      window.Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        text: "Failed to delete category.",
        confirmButtonColor: "#dc3545"
      });
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setEditForm({
      categoryName: cat.categoryName || "",
      description: cat.description || ""
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
      const updatedCategory = { ...editingCategory, ...editForm };
      await axios.put(`http://localhost:8080/api/admin/categories/${editingCategory.id}`, updatedCategory);
      window.Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Category Updated Successfully",
        confirmButtonColor: "#198754",
        timer: 2000
      });
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      window.Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update category.",
        confirmButtonColor: "#dc3545"
      });
    }
  };

  const handleApproveRequest = async (id) => {
    setProcessingRequest(true);
    try {
      await axios.put(`http://localhost:8080/api/admin/sport-requests/${id}/approve?adminId=${user.id || 1}`);
      await window.Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Sport category request approved successfully and category registered.",
        confirmButtonColor: "#198754",
        timer: 2500
      });
      setSelectedRequest(null);
      loadRequests();
      loadCategories();
    } catch (err) {
      console.error(err);
      window.Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: err.response?.data || "Failed to approve category request.",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRejectRequest = async (id) => {
    const confirmed = await window.Swal.fire({
      icon: "warning",
      title: "Reject Request?",
      text: "Are you sure you want to reject this sport category request?",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel"
    });

    if (!confirmed.isConfirmed) return;

    setProcessingRequest(true);
    try {
      await axios.put(`http://localhost:8080/api/admin/sport-requests/${id}/reject?adminId=${user.id || 1}`);
      await window.Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: "Sport category request has been rejected.",
        confirmButtonColor: "#198754",
        timer: 2000
      });
      setSelectedRequest(null);
      loadRequests();
    } catch (err) {
      console.error(err);
      window.Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: err.response?.data || "Failed to reject category request.",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  const getVendorName = (vendorId) => {
    const v = vendors.find(item => item.id === vendorId);
    return v ? `${v.fullName} (${v.businessName || 'N/A'})` : `Vendor #${vendorId}`;
  };

  // Filter & Search logic for categories
  const filteredCategories = categories.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.categoryName || "").toLowerCase().includes(query) ||
      (c.description || "").toLowerCase().includes(query)
    );
  });

  // Pagination logic for categories
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="row">
        
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
              <h2 className="fw-bold mb-0 text-dark">Sports Categories</h2>
              <p className="text-muted mb-0">Configure active sport classifications and manage vendor requests.</p>
            </div>
            
            {/* Search Input (only for approved categories tab) */}
            {activeTab === "categories" && (
              <div className="input-group shadow-sm" style={{ width: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input
                  type="text"
                  placeholder="Search category name..."
                  className="form-control border-start-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <ul className="nav nav-pills mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 me-2 rounded-pill ${activeTab === "categories" ? "active bg-success text-white" : "text-secondary bg-white border"}`} 
                onClick={() => setActiveTab("categories")}
              >
                Categories
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 rounded-pill position-relative ${activeTab === "requests" ? "active bg-success text-white" : "text-secondary bg-white border"}`} 
                onClick={() => setActiveTab("requests")}
              >
                Category Requests
                {requests.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                    {requests.length}
                  </span>
                )}
              </button>
            </li>
          </ul>

          {activeTab === "categories" ? (
            <div className="row g-4">
              {/* Add Category Form Panel */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                  <h5 className="fw-bold mb-3 d-flex align-items-center"><FaPlusCircle className="me-2 text-success" /> Add New Sport</h5>
                  <form onSubmit={handleAddCategory}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Sport Category Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Badminton"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Brief description about the sport facility specifications"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-success w-100 py-2 fw-semibold rounded-3 text-white">
                      Add Sport Category
                    </button>
                  </form>
                </div>
              </div>

              {/* Categories Table List */}
              <div className="col-md-8">
                {loading ? (
                  <div className="text-center py-5">
                    <FaSpinner className="spinner-border text-success fs-2" role="status" />
                    <h5 className="mt-3 text-muted">Loading categories...</h5>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                          <tr>
                            <th className="py-3 px-4">ID</th>
                            <th className="py-3">Category Name</th>
                            <th className="py-3">Description</th>
                            <th className="py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center text-muted py-5">No sports categories found.</td>
                            </tr>
                          ) : (
                            currentItems.map((cat) => (
                              <tr key={cat.id}>
                                <td className="px-4 fw-semibold text-secondary">#{cat.id}</td>
                                <td>
                                  <span className="fw-bold text-dark">{cat.categoryName}</span>
                                </td>
                                <td className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>{cat.description || "No Description"}</td>
                                <td className="text-center">
                                  <div className="d-flex justify-content-center gap-2">
                                    <button
                                      className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                      style={{ width: "35px", height: "35px" }}
                                      onClick={() => handleEditClick(cat)}
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                      style={{ width: "35px", height: "35px" }}
                                      onClick={() => handleDelete(cat.id)}
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
          ) : (
            /* Tab 2: Category Requests Table */
            <div className="row">
              <div className="col-12">
                {requestsLoading ? (
                  <div className="text-center py-5">
                    <FaSpinner className="spinner-border text-success fs-2" role="status" />
                    <h5 className="mt-3 text-muted">Loading pending requests...</h5>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                          <tr>
                            <th className="py-3 px-4">ID</th>
                            <th className="py-3">Sport Name</th>
                            <th className="py-3">Description</th>
                            <th className="py-3">Requested By</th>
                            <th className="py-3">Requested Date</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center text-muted py-5">No pending category requests found.</td>
                            </tr>
                          ) : (
                            requests.map((req) => (
                              <tr key={req.id}>
                                <td className="px-4 fw-semibold text-secondary">#{req.id}</td>
                                <td className="fw-bold text-dark">{req.sportName}</td>
                                <td className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>{req.description || "No Description"}</td>
                                <td>{getVendorName(req.requestedByVendorId)}</td>
                                <td className="small text-muted">{req.createdAt ? req.createdAt.replace("T", " ").substring(0, 16) : "N/A"}</td>
                                <td>
                                  <span className="badge bg-warning text-dark text-uppercase">{req.status}</span>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex justify-content-center gap-2">
                                    <button 
                                      className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                                      onClick={() => setSelectedRequest(req)}
                                    >
                                      <FaEye /> View Details
                                    </button>
                                    <button 
                                      className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                      onClick={() => handleApproveRequest(req.id)}
                                      disabled={processingRequest}
                                    >
                                      <FaCheck /> Approve
                                    </button>
                                    <button 
                                      className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                                      onClick={() => handleRejectRequest(req.id)}
                                      disabled={processingRequest}
                                    >
                                      <FaTimes /> Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit Sport Category</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingCategory(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="categoryName"
                      value={editForm.categoryName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="4"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingCategory(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4 text-white rounded-pill">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Sport Category Request Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setSelectedRequest(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <span className="d-block small text-uppercase text-muted fw-bold">Requested Sport Name</span>
                  <span className="fs-5 fw-bold text-dark">{selectedRequest.sportName}</span>
                </div>
                <div className="mb-3">
                  <span className="d-block small text-uppercase text-muted fw-bold">Description</span>
                  <p className="text-dark bg-light p-3 rounded-3 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedRequest.description || "No description provided."}
                  </p>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <span className="d-block small text-uppercase text-muted fw-bold">Requested By</span>
                    <span className="fw-semibold text-dark">{getVendorName(selectedRequest.requestedByVendorId)}</span>
                  </div>
                  <div className="col-6">
                    <span className="d-block small text-uppercase text-muted fw-bold">Requested Date</span>
                    <span className="fw-semibold text-dark">
                      {selectedRequest.createdAt ? selectedRequest.createdAt.replace("T", " ").substring(0, 16) : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="d-block small text-uppercase text-muted fw-bold">Status</span>
                  <span className="badge bg-warning text-dark text-uppercase">{selectedRequest.status}</span>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                <button 
                  type="button" 
                  className="btn btn-secondary px-4 rounded-pill" 
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success px-4 rounded-pill text-white" 
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                  disabled={processingRequest}
                >
                  Approve Request
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 rounded-pill text-white" 
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                  disabled={processingRequest}
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCategories;