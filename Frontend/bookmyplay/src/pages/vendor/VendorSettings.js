import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import { FaBell } from "react-icons/fa";

function VendorSettings() {
  const navigate = useNavigate();
  const userSession = JSON.parse(localStorage.getItem("user")) || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    bookingAlerts: true,
    reviewAlerts: true,
    subscriptionAlerts: true,
    emailReports: false
  });

  useEffect(() => {
    if (userSession.id) {
      const savedPrefs = localStorage.getItem("vendor_notif_prefs");
      if (savedPrefs) {
        setNotifPrefs(JSON.parse(savedPrefs));
      }
    } else {
      navigate("/login");
    }
  }, [userSession.id, navigate]);

  const saveNotifPrefs = (updated) => {
    setNotifPrefs(updated);
    localStorage.setItem("vendor_notif_prefs", JSON.stringify(updated));
  };

  return (
    <div className="container-fluid">
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
              <h2 className="fw-bold mb-0 text-dark">⚙️ Vendor Settings</h2>
              <p className="text-muted">Configure notification preferences for alerts inside the console and email digests.</p>
            </div>

            <div className="row g-4">
              <div className="col-12">
                {/* Notification preferences */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                    <FaBell className="text-primary" /> Notification Preferences
                  </h5>
                  <p className="small text-muted">Toggle notification options for alerts inside the console and email digests.</p>

                  <div className="d-flex flex-column gap-3 mt-2">
                    <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                      <label className="form-check-label fw-semibold text-secondary small" htmlFor="flexSwitchCheck1">New Booking Instant Alerts</label>
                      <input 
                        className="form-check-input ms-0 shadow-none cursor-pointer" 
                        type="checkbox" 
                        role="switch" 
                        id="flexSwitchCheck1" 
                        checked={notifPrefs.bookingAlerts}
                        onChange={e => saveNotifPrefs({...notifPrefs, bookingAlerts: e.target.checked})}
                      />
                    </div>
                    <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                      <label className="form-check-label fw-semibold text-secondary small" htmlFor="flexSwitchCheck2">New Feedback/Review Alerts</label>
                      <input 
                        className="form-check-input ms-0 shadow-none cursor-pointer" 
                        type="checkbox" 
                        role="switch" 
                        id="flexSwitchCheck2" 
                        checked={notifPrefs.reviewAlerts}
                        onChange={e => saveNotifPrefs({...notifPrefs, reviewAlerts: e.target.checked})}
                      />
                    </div>
                    <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                      <label className="form-check-label fw-semibold text-secondary small" htmlFor="flexSwitchCheck3">Membership Expiration Alerts</label>
                      <input 
                        className="form-check-input ms-0 shadow-none cursor-pointer" 
                        type="checkbox" 
                        role="switch" 
                        id="flexSwitchCheck3" 
                        checked={notifPrefs.subscriptionAlerts}
                        onChange={e => saveNotifPrefs({...notifPrefs, subscriptionAlerts: e.target.checked})}
                      />
                    </div>
                    <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                      <label className="form-check-label fw-semibold text-secondary small" htmlFor="flexSwitchCheck4">Receive Monthly Email Reports</label>
                      <input 
                        className="form-check-input ms-0 shadow-none cursor-pointer" 
                        type="checkbox" 
                        role="switch" 
                        id="flexSwitchCheck4" 
                        checked={notifPrefs.emailReports}
                        onChange={e => saveNotifPrefs({...notifPrefs, emailReports: e.target.checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorSettings;
