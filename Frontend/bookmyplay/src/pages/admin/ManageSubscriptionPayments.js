import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner } from "react-icons/fa";

function ManageSubscriptionPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/subscriptions/admin/payments");
      setPayments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this subscription payment?`)) return;
    try {
      await axios.put(`http://localhost:8080/api/subscriptions/admin/payments/${id}`, { status });
      alert(`Subscription payment ${status.toLowerCase()} successfully.`);
      loadPayments();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
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
            <h2 className="fw-bold mb-4 text-dark">Vendor Subscription Payments</h2>

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
                        <th className="py-3 px-4">Vendor details</th>
                        <th className="py-3">Plan</th>
                        <th className="py-3">Amount</th>
                        <th className="py-3">Payment Date</th>
                        <th className="py-3">Expiry Date</th>
                        <th className="py-3">Transaction ID</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-5">No subscription payments logged.</td>
                        </tr>
                      ) : (
                        payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4">
                              <span className="fw-bold text-dark d-block">{p.vendorName}</span>
                              <span className="text-muted small">Business: {p.businessName}</span>
                            </td>
                            <td className="fw-semibold">
                              {p.planName}
                              <span className="badge bg-secondary-subtle text-secondary ms-2 small text-uppercase" style={{ fontSize: "0.7rem" }}>{p.planType}</span>
                            </td>
                            <td className="fw-bold text-success">₹ {p.amount}</td>
                            <td className="text-muted small">{p.paymentDate.split("T")[0]}</td>
                            <td className="text-muted small">{p.expiryDate}</td>
                            <td className="font-monospace small">{p.transactionId}</td>
                            <td>
                              <span className={`badge px-2 py-1.5 text-uppercase d-block mb-1 ${
                                p.paymentStatus === "APPROVED"
                                  ? "bg-success"
                                  : p.paymentStatus === "PENDING"
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`} style={{ fontSize: "0.75rem" }}>
                                Pay: {p.paymentStatus}
                              </span>
                              <span className={`badge px-2 py-1.5 text-uppercase d-block ${
                                p.status === "ACTIVE"
                                  ? "bg-success-subtle text-success border border-success"
                                  : p.status === "EXPIRED"
                                  ? "bg-danger-subtle text-danger border border-danger"
                                  : p.status === "PENDING"
                                  ? "bg-warning-subtle text-warning border border-warning text-dark"
                                  : "bg-secondary-subtle text-secondary border border-secondary"
                              }`} style={{ fontSize: "0.75rem" }}>
                                {p.status}
                              </span>
                            </td>
                            <td className="text-center">
                              {p.paymentStatus === "PENDING" ? (
                                <div className="d-flex justify-content-center gap-2">
                                  <button onClick={() => handleUpdateStatus(p.id, "APPROVED")} className="btn btn-success btn-sm rounded-pill d-flex align-items-center gap-1">
                                    <FaCheckCircle /> Approve
                                  </button>
                                  <button onClick={() => handleUpdateStatus(p.id, "REJECTED")} className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1">
                                    <FaTimesCircle /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small">Processed</span>
                              )}
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
    </div>
  );
}

export default ManageSubscriptionPayments;