import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaSpinner, FaClock, FaCheck, FaCalendarAlt } from "react-icons/fa";

function VendorPricing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [plans, setPlans] = useState([]);
  const [subStatus, setSubStatus] = useState({ active: false, status: "NONE", daysRemaining: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user.id) {
      loadPlans();
      loadSubStatus();
    } else {
      navigate("/login");
    }
  }, [user.id]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/subscriptions/plans");
      // Filter only active plans
      const activePlans = (res.data || []).filter(p => p.status === "ACTIVE");
      setPlans(activePlans);
    } catch (e) {
      console.error("Error loading plans:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadSubStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/subscriptions/vendor/${user.id}`);
      setSubStatus(res.data);
    } catch (e) {
      console.error("Error loading subscription status:", e);
    }
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      await axios.post("http://localhost:8080/api/subscriptions/subscribe", {
        vendorId: user.id,
        planId: selectedPlan.id
      });
      
      setShowModal(false);
      
      if (window.Swal) {
        window.Swal.fire({
          icon: "success",
          title: "Subscription Activated!",
          text: `You have successfully subscribed to the ${selectedPlan.planName}.`,
          confirmButtonText: "OK",
          confirmButtonColor: "#198754"
        }).then(() => {
          window.location.reload();
        });
      } else {
        alert("Subscription activated successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Subscription activation failed:", err);
      if (window.Swal) {
        window.Swal.fire({
          icon: "error",
          title: "Activation Failed",
          text: "Something went wrong while processing your subscription. Please try again.",
          confirmButtonColor: "#dc3545"
        });
      } else {
        alert("Subscription activation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // Helper for dynamic features mapping
  const getPlanFeatures = (plan) => {
    if (plan.features) {
      if (Array.isArray(plan.features)) return plan.features;
      if (typeof plan.features === "string") return plan.features.split(",").map(f => f.trim());
    }
    const name = plan.planName.toLowerCase();
    if (name.includes("yearly") || name.includes("12")) {
      return [
        "All features included",
        "Top-tier profile exposure & priority listing",
        "Featured tag on all turf complexes",
        "24/7 dedicated support representative",
        "Weekly custom analytics & reports",
        "Zero commission on bookings"
      ];
    } else if (name.includes("half-year") || name.includes("6")) {
      return [
        "Premium support response (under 4 hours)",
        "High placement in search list",
        "Featured tag on up to 3 turfs",
        "Monthly automated performance reports",
        "Lower transaction fees"
      ];
    } else if (name.includes("quarterly") || name.includes("3")) {
      return [
        "Standard profile exposure in matching categories",
        "Featured tag on 1 turf complex",
        "Email & chat support (under 12 hours)",
        "Basic booking statistics"
      ];
    } else {
      return [
        "Basic turf listing & booking access",
        "Standard search results appearance",
        "Standard email support (under 48 hours)",
        "Self-serve knowledge base"
      ];
    }
  };

  // Calculations for current subscription progress bar
  let totalDays = 30;
  if (subStatus.subscription?.paymentDate && subStatus.expiryDate) {
    const start = new Date(subStatus.subscription.paymentDate);
    const end = new Date(subStatus.expiryDate);
    const diffTime = Math.abs(end - start);
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;
  }
  const daysRemaining = Math.max(0, subStatus.daysRemaining || 0);
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  // Expiry date calculation for the selected plan inside modal
  const getExpiryDateAfterActivation = (durationMonths) => {
    const d = new Date();
    d.setMonth(d.getMonth() + durationMonths);
    return d.toISOString().split("T")[0];
  };

  // Determine Badge Color & Label
  let badgeClass = "bg-secondary";
  let badgeLabel = "NONE";
  if (subStatus.status === "EXPIRED") {
    badgeClass = "bg-danger text-white";
    badgeLabel = "EXPIRED";
  } else if (subStatus.active) {
    if (subStatus.planType === "FREE_TRIAL") {
      badgeClass = "text-white";
      badgeLabel = "FREE_TRIAL";
    } else {
      badgeClass = "bg-success text-white";
      badgeLabel = "ACTIVE";
    }
  }

  // Determine Button Type per Plan Card
  const getPlanButtonText = (plan) => {
    if (subStatus.active && subStatus.planType === "FREE_TRIAL") {
      return "Upgrade Now";
    }
    if (subStatus.active && subStatus.planType !== "FREE_TRIAL") {
      if (subStatus.subscription?.planId === plan.id) {
        return "Current Plan";
      }
      return "Renew Plan";
    }
    return "Subscribe Now";
  };

  const isButtonDisabled = (plan) => {
    return subStatus.active && subStatus.planType !== "FREE_TRIAL" && subStatus.subscription?.planId === plan.id;
  };

  // Custom hover animation css injection
  const hoverStyles = `
    .plan-card {
      transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s ease;
    }
    .plan-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 1rem 3rem rgba(0,0,0,0.12) !important;
    }
    .progress-bar-glow {
      box-shadow: 0 0 10px rgba(25, 135, 84, 0.3);
    }
    .modal-backdrop-custom {
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
    }
  `;

  return (
    <div className="container-fluid">
      <style>{hoverStyles}</style>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="px-4 pb-4">
            <div className="mb-4">
              <h2 className="fw-bold mb-0 text-dark">💳 Membership Subscription</h2>
              <p className="text-muted">Upgrade your plan to list more turfs, boost search visibility, and unlock advanced bookings.</p>
            </div>

            {/* My Current Subscription Status Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white overflow-hidden">
              <div 
                className="p-1" 
                style={{
                  background: subStatus.active
                    ? subStatus.planType === "FREE_TRIAL"
                      ? "linear-gradient(90deg, #ff9800, #ff5722)"
                      : "linear-gradient(90deg, #10b981, #059669)"
                    : "linear-gradient(90deg, #ef4444, #b91c1c)"
                }}
              />
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                  <h5 className="fw-bold text-secondary mb-0">My Current Subscription Status</h5>
                  <span 
                    className={`badge px-3 py-2 fs-6 rounded-pill text-uppercase ${badgeClass}`}
                    style={subStatus.active && subStatus.planType === "FREE_TRIAL" ? { backgroundColor: "#fd7e14" } : {}}
                  >
                    {badgeLabel}
                  </span>
                </div>

                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h3 className="fw-bold text-dark mb-1">
                      {subStatus.planName || "No Active Subscription"}
                    </h3>
                    <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                      <FaCalendarAlt /> Start Date: {subStatus.subscription?.paymentDate ? subStatus.subscription.paymentDate.split("T")[0] : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6 text-md-end mt-3 mt-md-0">
                    <div className="text-dark fw-bold fs-4">{daysRemaining} Days Remaining</div>
                    <p className="text-muted small mb-0 d-flex align-items-center justify-content-md-end gap-2">
                      <FaClock /> Expiry Date: {subStatus.expiryDate || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="progress progress-bar-glow rounded-pill" style={{ height: "10px" }}>
                    <div
                      className={`progress-bar progress-bar-striped progress-bar-animated ${
                        subStatus.active
                          ? subStatus.planType === "FREE_TRIAL"
                            ? "bg-warning"
                            : "bg-success"
                          : "bg-danger"
                      }`}
                      role="progressbar"
                      style={{ width: `${progressPercent}%` }}
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-2">
                    <span>0%</span>
                    <span>Remaining Duration: {progressPercent.toFixed(0)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Plans Grid */}
            <h4 className="fw-bold mb-4 text-dark">Available Membership Plans</h4>
            
            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
                <p className="text-muted mt-2">Loading membership options...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <p className="text-muted fs-5 mb-0">No subscription plans are available. Please contact the administrator.</p>
              </div>
            ) : (
              <div className="row g-4 mb-5">
                {plans.map((p) => {
                  const planBtnText = getPlanButtonText(p);
                  const planBtnDisabled = isButtonDisabled(p);
                  const isCurrent = planBtnText === "Current Plan";
                  
                  return (
                    <div className="col-md-6 col-lg-4 col-xl-3" key={p.id}>
                      <div 
                        className={`card plan-card border-0 shadow-sm rounded-4 h-100 bg-white d-flex flex-column justify-content-between overflow-hidden`}
                      >
                        {/* Soft green gradient header */}
                        <div 
                          className="py-3 px-4 text-center text-white" 
                          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                        >
                          <h5 className="fw-bold mb-0 text-truncate">{p.planName}</h5>
                        </div>

                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                          <div>
                            {/* Price */}
                            <div className="text-center mb-3">
                              <h2 className="fw-bold text-success mb-0">₹ {p.price}</h2>
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 text-uppercase small mt-2">
                                {p.duration} {p.duration === 1 ? "Month" : "Months"}
                              </span>
                            </div>

                            <p className="text-muted text-center small mb-4">{p.description}</p>
                            
                            <hr className="my-3 text-muted opacity-25" />

                            {/* Features list */}
                            <h6 className="fw-bold text-dark mb-3">What's Included:</h6>
                            <ul className="list-unstyled mb-4">
                              {getPlanFeatures(p).map((feature, idx) => (
                                <li className="d-flex align-items-start mb-2.5 small text-secondary" key={idx}>
                                  <span className="text-success me-2 mt-0.5"><FaCheck size={12} /></span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            {/* Card Footer Status Badge & Button */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="small text-muted fw-semibold">Plan Status:</span>
                              <span className="badge bg-success-subtle text-success border border-success rounded-pill px-2.5 py-1">Active</span>
                            </div>

                            <button
                              className={`btn w-100 rounded-pill py-2.5 fw-bold transition-all ${
                                isCurrent
                                  ? "btn-secondary border-0 text-white"
                                  : "btn-success text-white border-0 shadow-sm"
                              }`}
                              style={!isCurrent ? { background: "linear-gradient(135deg, #10b981, #059669)" } : {}}
                              onClick={() => handlePlanSelection(p)}
                              disabled={planBtnDisabled}
                            >
                              {planBtnText}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedPlan && (
        <div className="modal show d-block modal-backdrop-custom" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg bg-white overflow-hidden">
              <div className="modal-header border-0 bg-light p-4">
                <h5 className="modal-title fw-bold text-dark">Confirm Subscription</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body p-4 text-center">
                <div 
                  className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" 
                  style={{ width: "64px", height: "64px" }}
                >
                  <FaCalendarAlt size={32} className="text-success" />
                </div>
                
                <h4 className="fw-bold text-dark mb-1">{selectedPlan.planName}</h4>
                <h3 className="fw-bold text-success mb-3">₹ {selectedPlan.price}</h3>
                
                <div className="card border-0 bg-light rounded-3 p-3 text-start mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Billing Term:</span>
                    <strong className="text-dark small">{selectedPlan.duration} {selectedPlan.duration === 1 ? "Month" : "Months"}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Subscription Fee:</span>
                    <strong className="text-dark small">₹ {selectedPlan.price}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2 mt-2">
                    <span className="text-muted small">Expiry Date after activation:</span>
                    <strong className="text-success small">{getExpiryDateAfterActivation(selectedPlan.duration)}</strong>
                  </div>
                </div>
                
                <p className="text-muted small">
                  By clicking Confirm, the subscription plan will be immediately activated and replace your current plan (if any).
                </p>
              </div>
              <div className="modal-footer border-0 p-4 pt-0 justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-pill px-4" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success text-white rounded-pill px-4 fw-bold border-0 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  onClick={handleConfirmSubscribe}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  ) : null}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorPricing;