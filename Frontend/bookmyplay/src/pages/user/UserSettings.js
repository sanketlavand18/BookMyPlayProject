import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";
import UserNavbar from "../../components/UserNavbar";
import { FaSlidersH, FaBell, FaShieldAlt, FaQuestionCircle, FaCheckCircle } from "react-icons/fa";

function UserSettings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [notificationSettings, setNotificationSettings] = useState({
    bookingAlerts: true,
    emailConfirmations: true,
    marketingPromo: false,
    systemNews: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    publicReviews: true,
    shareStats: false
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg("Settings preferences saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
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
              <h2 className="fw-bold mb-0 text-dark">⚙ Account Settings</h2>
              <p className="text-muted">Configure notification channels, profile visibility, and system preferences.</p>
            </div>

            {successMsg && (
              <div className="alert alert-success border-0 shadow-sm mb-4 d-flex align-items-center gap-2" role="alert">
                <FaCheckCircle className="text-success" /> {successMsg}
              </div>
            )}

            <div className="row g-4">
              {/* Notification Preferences */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <FaBell className="text-success" /> Notification Channels
                  </h5>
                  <form onSubmit={handleSaveSettings}>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="settingBooking" 
                        checked={notificationSettings.bookingAlerts}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, bookingAlerts: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-secondary" htmlFor="settingBooking">
                        Slot Booking Status Notifications
                      </label>
                      <p className="small text-muted mb-0">Receive instant alerts when a booking is confirmed or cancelled.</p>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="settingEmail" 
                        checked={notificationSettings.emailConfirmations}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailConfirmations: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-secondary" htmlFor="settingEmail">
                        Send Invoice Receipts via Email
                      </label>
                      <p className="small text-muted mb-0">Email a copy of tax invoice receipts after successful payment captures.</p>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="settingMarketing" 
                        checked={notificationSettings.marketingPromo}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, marketingPromo: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-secondary" htmlFor="settingMarketing">
                        Promotional Deals & Coupons Alerts
                      </label>
                      <p className="small text-muted mb-0">Get notified when new promo codes or sports coupons are released.</p>
                    </div>

                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold mt-3">
                      Save Preferences
                    </button>
                  </form>
                </div>
              </div>

              {/* Account Privacy & Meta Settings */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <FaShieldAlt className="text-primary" /> Profile Privacy
                  </h5>
                  <form onSubmit={handleSaveSettings}>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="privacyReviews" 
                        checked={privacySettings.publicReviews}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, publicReviews: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-secondary" htmlFor="privacyReviews">
                        Show my reviews publicly on Venue Detail pages
                      </label>
                      <p className="small text-muted mb-0">Allow other players to read review comments left under completed bookings.</p>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="privacyStats" 
                        checked={privacySettings.shareStats}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, shareStats: e.target.checked })}
                      />
                      <label className="form-check-label fw-semibold text-secondary" htmlFor="privacyStats">
                        Anonymize booking analytics logs
                      </label>
                      <p className="small text-muted mb-0">Opt-out of sharing general aggregate sports preferences statistics in dashboards.</p>
                    </div>

                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold mt-4">
                      Save Privacy Settings
                    </button>
                  </form>
                </div>
              </div>

              {/* Help & Support Pane */}
              <div className="col-12">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                  <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <FaQuestionCircle className="text-secondary" /> Need Assistance?
                  </h5>
                  <p className="text-secondary mb-2">
                    If you are experiencing issues with payments, refund cancellations, or account access, please reach out to our administration help desk:
                  </p>
                  <p className="fw-bold text-success mb-0">📞 Customer Support: support@bookmyplay.com | +91 98765 43210</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
