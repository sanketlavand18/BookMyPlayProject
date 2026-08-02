import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaPlus, FaTrash, FaEdit, FaEyeSlash, FaEye } from "react-icons/fa";

function ManageSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);

  const [form, setForm] = useState({
    planName: "",
    duration: 1,
    price: 0,
    description: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/subscriptions/plans");
      setPlans(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setForm({ planName: "", duration: 1, price: 0, description: "", status: "ACTIVE" });
    setEditPlanId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setForm({
      planName: plan.planName,
      duration: plan.duration,
      price: plan.price,
      description: plan.description,
      status: plan.status
    });
    setEditPlanId(plan.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editPlanId) {
        await axios.put(`http://localhost:8080/api/subscriptions/plans/${editPlanId}`, form);
      } else {
        await axios.post("http://localhost:8080/api/subscriptions/plans", form);
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to save plan.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/subscriptions/plans/${id}`);
      loadPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan.");
    }
  };

  const toggleStatus = async (plan) => {
    const nextStatus = plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await axios.put(`http://localhost:8080/api/subscriptions/plans/${plan.id}`, {
        ...plan,
        status: nextStatus
      });
      loadPlans();
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
              <h2 className="fw-bold mb-0 text-dark">Manage Vendor Subscriptions Plans</h2>
              <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={handleOpenCreate}>
                <FaPlus className="me-2" /> Add New Plan
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <div className="row g-4">
                {plans.map((p) => (
                  <div className="col-md-4" key={p.id}>
                    <div className={`card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white ${p.status === "INACTIVE" ? "opacity-75" : ""}`}>
                      <div className={`card-header text-white py-3 text-center ${p.status === "ACTIVE" ? "bg-dark" : "bg-secondary"}`}>
                        <h5 className="fw-bold mb-0">{p.planName}</h5>
                      </div>
                      <div className="card-body text-center p-4">
                        <h2 className="fw-bold text-success mb-2">₹ {p.price}</h2>
                        <span className="badge bg-light text-dark border rounded-pill mb-3 px-3 py-2 fs-6">
                          Duration: {p.duration} {p.duration === 1 ? "Month" : "Months"}
                        </span>
                        <p className="text-muted small mb-0" style={{ minHeight: "60px" }}>{p.description}</p>
                      </div>
                      <div className="card-footer bg-white border-top p-3 d-flex justify-content-between">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenEdit(p)}>
                          <FaEdit /> Edit
                        </button>
                        <button className={`btn btn-sm ${p.status === "ACTIVE" ? "btn-outline-warning" : "btn-outline-success"}`} onClick={() => toggleStatus(p)}>
                          {p.status === "ACTIVE" ? <><FaEyeSlash /> Disable</> : <><FaEye /> Enable</>}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Pricing Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">{editPlanId ? "Edit Subscription Plan" : "Create Subscription Plan"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Plan Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={form.planName}
                      onChange={e => setForm({ ...form, planName: e.target.value })}
                      placeholder="e.g. Yearly Plan (12 Months)"
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Price (INR)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        value={form.price}
                        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Duration (Months)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        value={form.duration}
                        onChange={e => setForm({ ...form, duration: parseInt(e.target.value, 10) })}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">Plan Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="List advantages/inclusions for this plan..."
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Close</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 text-white fw-bold">Save Plan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageSubscriptions;