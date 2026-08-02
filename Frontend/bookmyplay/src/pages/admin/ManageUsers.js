import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaSearch, FaChevronLeft, FaChevronRight, FaTrash, FaSpinner, FaEdit, FaBan, FaKey, FaHistory, FaStar, FaTimes } from "react-icons/fa";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // History & Reset Modals
  const [historyModal, setHistoryModal] = useState({ show: false, title: "", type: "", data: [] });
  const [resetModal, setResetModal] = useState({ show: false, userId: null, newPassword: "" });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/users");
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || ""
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = { ...editingUser, ...editForm };
      await axios.put(`http://localhost:8080/api/admin/users/${editingUser.id}`, updatedUser);
      alert("User Updated Successfully");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
      alert("User Deleted Successfully");
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  const handleToggleBlock = async (user) => {
    const isBlocked = user.isBlocked || false;
    const action = isBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await axios.put(`http://localhost:8080/api/admin/extended/users/${user.id}/${action}`);
      alert(`User ${action}ed successfully.`);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} user.`);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/admin/extended/users/${resetModal.userId}/reset-password`, {
        password: resetModal.newPassword
      });
      alert(`Password reset successfully to: ${resetModal.newPassword}`);
      setResetModal({ show: false, userId: null, newPassword: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to reset password.");
    }
  };

  const viewHistory = async (userId, type, userName) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/extended/users/${userId}/${type}`);
      setHistoryModal({
        show: true,
        title: `${userName}'s ${type === "bookings" ? "Booking" : "Review"} History`,
        type: type,
        data: res.data || []
      });
    } catch (e) {
      console.error(e);
      alert("Failed to fetch history details.");
    }
  };

  // Filter
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.fullName || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.phone || "").toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
              <h2 className="fw-bold mb-0 text-dark">Manage Registered Customers</h2>
              
              {/* Search */}
              <div className="input-group shadow-sm" style={{ width: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
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
                        <th className="py-3">Name</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Phone</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-5">No user records found.</td>
                        </tr>
                      ) : (
                        currentItems.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 text-muted fw-bold">#{u.id}</td>
                            <td className="fw-semibold text-dark">{u.fullName}</td>
                            <td>{u.email}</td>
                            <td>{u.phone}</td>
                            <td>
                              <span className={`badge px-2 py-1 ${u.isBlocked ? "bg-danger" : "bg-success"}`}>
                                {u.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button className="btn btn-outline-primary btn-sm" onClick={() => handleEditClick(u)} title="Edit">
                                  <FaEdit /> Edit
                                </button>
                                <button className={`btn btn-sm ${u.isBlocked ? "btn-success" : "btn-warning"}`} onClick={() => handleToggleBlock(u)} title={u.isBlocked ? "Unblock" : "Block"}>
                                  <FaBan /> {u.isBlocked ? "Unblock" : "Block"}
                                </button>
                                <button className="btn btn-outline-dark btn-sm" onClick={() => setResetModal({ show: true, userId: u.id, newPassword: "BookMyPlay@123" })} title="Reset Password">
                                  <FaKey /> Reset
                                </button>
                                <button className="btn btn-outline-info btn-sm text-dark" onClick={() => viewHistory(u.id, "bookings", u.fullName)} title="Bookings History">
                                  <FaHistory /> Bookings
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => viewHistory(u.id, "reviews", u.fullName)} title="Reviews History">
                                  <FaStar /> Reviews
                                </button>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(u.id)} title="Delete">
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
                    <span className="small text-muted">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries</span>
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
      {editingUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Edit User Details</h5>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setEditingUser(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">Reset Password</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setResetModal({ show: false, userId: null, newPassword: "" })}></button>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">New Password</label>
                    <input
                      type="text"
                      className="form-control"
                      value={resetModal.newPassword}
                      onChange={e => setResetModal({ ...resetModal, newPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setResetModal({ show: false, userId: null, newPassword: "" })}>Close</button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold">Reset Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Ledger Modal */}
      {historyModal.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <div className="modal-header bg-dark text-white border-0 py-3 rounded-top-4">
                <h5 className="modal-title fw-bold">{historyModal.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setHistoryModal({ show: false, title: "", type: "", data: [] })}></button>
              </div>
              <div className="modal-body p-4">
                {historyModal.data.length === 0 ? (
                  <p className="text-muted text-center py-4">No records found for this account.</p>
                ) : historyModal.type === "bookings" ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Venue</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyModal.data.map(b => (
                          <tr key={b.id}>
                            <td className="small text-muted">#BMP-{b.id}</td>
                            <td className="fw-semibold">{b.venue?.venueName || "N/A"}</td>
                            <td>{b.bookingDate}</td>
                            <td>{b.startTime} - {b.endTime}</td>
                            <td className="fw-bold text-success">₹ {b.totalPrice}</td>
                            <td>
                              <span className={`badge ${b.bookingStatus === "CONFIRMED" ? "bg-success" : "bg-danger"}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="row g-3">
                    {historyModal.data.map(r => (
                      <div className="col-12 border-bottom pb-2" key={r.id}>
                        <div className="d-flex justify-content-between mb-1">
                          <strong className="text-dark">{r.venue?.venueName || "Venue Review"}</strong>
                          <span className="text-warning">{"★".repeat(r.rating)}</span>
                        </div>
                        <p className="mb-0 text-muted small">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setHistoryModal({ show: false, title: "", type: "", data: [] })}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageUsers;