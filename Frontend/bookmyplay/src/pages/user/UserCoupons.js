import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import { FaSpinner, FaGift, FaCopy, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function UserCoupons() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    if (!user.id) {
      navigate("/login");
    } else {
      loadCoupons();
    }
  }, [user.id]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/extended/coupons");
      // Filter out only active coupons
      const activeCoupons = (res.data || []).filter(c => c.active);
      setCoupons(activeCoupons);
    } catch (err) {
      console.error("Error loading coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

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
            <div className="mb-4">
              <h2 className="fw-bold mb-0 text-dark">🎁 Offers, Promo & Coupon Codes</h2>
              <p className="text-muted">Apply promotional discount coupon codes during turf booking to save big on hourly fees.</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-success fs-2" role="status" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <FaExclamationCircle className="fs-1 text-muted opacity-30 mb-3" />
                <h5 className="text-muted">No active coupons available right now.</h5>
                <p className="small text-muted mb-0">Check back later for seasonal tournament promo offers!</p>
              </div>
            ) : (
              <div className="row g-4">
                {coupons.map((c) => (
                  <div className="col-md-6 col-lg-4" key={c.id}>
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex flex-column justify-content-between position-relative">
                      {/* Top Header Banner */}
                      <div className="p-4 text-white text-center d-flex flex-column align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        <FaGift className="fs-2 mb-2" />
                        <h4 className="fw-bold mb-0">{c.discountPercent}% OFF</h4>
                        <span className="small opacity-75">Flat Discount</span>
                      </div>

                      {/* Details */}
                      <div className="p-4 flex-grow-1">
                        <div className="border border-dashed p-3 rounded text-center bg-light mb-3 position-relative">
                          <span className="fw-bold text-dark fs-5 tracking-wider">{c.couponCode}</span>
                          <button 
                            className="btn btn-sm btn-link text-success position-absolute end-0 top-50 translate-middle-y me-2"
                            onClick={() => handleCopyCode(c.couponCode)}
                            title="Copy Promo Code"
                          >
                            {copiedCode === c.couponCode ? <FaCheckCircle className="fs-5" /> : <FaCopy className="fs-5" />}
                          </button>
                        </div>

                        <p className="small text-secondary mb-2"><strong>Terms:</strong> {c.description || "Applicable on all turf reservations."}</p>
                        <p className="small text-danger mb-0"><strong>Expiry Date:</strong> {c.expiryDate || "Limited Time Offer"}</p>
                      </div>

                      {/* Quick copy indicator */}
                      <div className="px-4 pb-4">
                        <button 
                          className="btn btn-outline-success w-100 rounded-pill py-2.5 fw-bold"
                          onClick={() => handleCopyCode(c.couponCode)}
                        >
                          {copiedCode === c.couponCode ? "Copied Successfully!" : "Copy Code"}
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
    </div>
  );
}

export default UserCoupons;
