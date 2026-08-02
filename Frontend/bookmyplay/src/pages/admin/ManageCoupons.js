import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaPlus, FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaSpinner } from "react-icons/fa";

function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    couponCode: "",
    discount: 10.0,
    expiryDate: "",
    usageLimit: 100,
    status: "ACTIVE"
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/extended/coupons");
      setCoupons(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setForm({ couponCode: "", discount: 10.0, expiryDate: "", usageLimit: 100, status: "ACTIVE" });
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setForm({
      couponCode: c.couponCode,
      discount: c.discount,
      expiryDate: c.expiryDate || "",
      usageLimit: c.usageLimit || 100,
      status: c.status
    });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/admin/extended/coupons/${editId}`, form);
      } else {
        await axios.post("http://localhost:8080/api/admin/extended/coupons", form);
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to save coupon.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/extended/coupons/${id}`);
      loadCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to delete coupon.");
    }
  };

  const toggleStatus = async (c) => {
    const nextStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axios.put(`http://localhost:8080/api/admin/extended/coupons/${c.id}`, {
        ...c,
        status: nextStatus
      });
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

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
              <h2 className="fw-bold mb-0 text-dark">Promo Coupon Manager</h2>
              <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={handleOpenCreate}>
                <FaPlus className="me-2" /> Add Promo Coupon
              </button>
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
                        <th className="py-3 px-4">Coupon Code</th>
                        <th className="py-3">Discount</th>
                        <th className="py-3">Usage Limit</th>
                        <th className="py-3">Usage Count</th>
                        <th className="py-3">Expiry Date</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-5">No promo coupons available.</td>
                        </tr>
                      ) : (
                        coupons.map((c) => (
                          <tr key={c.id}>
                            <td className="px-4 fw-bold text-primary font-monospace">{c.couponCode}</td>
                            <td className="fw-semibold text-success">{c.discount}% Off</td>
                            <td>{c.usageLimit}</td>
                            <td>{c.usageCount}</td>
                            <td>{c.expiryDate}</td>
                            <td>
                              <span className={`badge px-3 py-1.5 rounded-pill ${c.status === "ACTIVE" ? "bg-success" : "bg-danger"}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenEdit(c)}>
                                  <FaEdit /> Edit
                                </button>
                                <button className={`btn btn-sm ${c.status === "ACTIVE" ? "btn-warning" : "btn-success"}`} onClick={() => toggleStatus(c)}>
                                  {c.status === "ACTIVE" ? <><FaToggleOff /> Disable</> : <><FaToggleOn /> Activate</>}
                                </button>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.id)}>
                                  <FaTrash /> Delete
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

      </div>

      {/* Save Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">{editId ? "Modify Coupon" : "Create Coupon"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Coupon Code</label>
                    <input
                      type="text"
                      className="form-control rounded-3 font-monospace text-uppercase"
                      value={form.couponCode}
                      onChange={e => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER50"
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Discount percentage</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        value={form.discount}
                        onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) })}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Usage Limit</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        value={form.usageLimit}
                        onChange={e => setForm({ ...form, usageLimit: parseInt(e.target.value, 10) })}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Close</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 text-white fw-bold">Save Coupon</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageCoupons;