import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaCog, FaCheckCircle, FaSpinner } from "react-icons/fa";

function ContactSettings() {
  const [settings, setSettings] = useState({
    companyName: "",
    phone: "",
    email: "",
    officeAddress: "",
    googleMapsLocation: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    whatsAppNumber: "",
    supportEmail: "",
    businessHours: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/contact-settings");
      setSettings(res.data);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      await axios.put("http://localhost:8080/api/contact-settings", settings);
      setSuccessMsg("Contact page details updated successfully!");
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to save updates.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
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
            <h2 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
              <FaCog className="text-secondary" /> Contact Page Configurations
            </h2>

            {loading && settings.companyName === "" ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
                <h5 className="mt-3 text-muted">Loading settings...</h5>
              </div>
            ) : (
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                
                {successMsg && <div className="alert alert-success rounded-3">{successMsg}</div>}
                {errorMsg && <div className="alert alert-danger rounded-3">{errorMsg}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    
                    <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Basic Information</h5>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        className="form-control rounded-3"
                        value={settings.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Contact Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control rounded-3"
                        value={settings.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Inquiries Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control rounded-3"
                        value={settings.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Support Email</label>
                      <input
                        type="email"
                        name="supportEmail"
                        className="form-control rounded-3"
                        value={settings.supportEmail}
                        onChange={handleChange}
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">Office Location & Hours</h5>
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-muted">Office Physical Address</label>
                      <input
                        type="text"
                        name="officeAddress"
                        className="form-control rounded-3"
                        value={settings.officeAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">Business Hours</label>
                      <input
                        type="text"
                        name="businessHours"
                        className="form-control rounded-3"
                        value={settings.businessHours}
                        onChange={handleChange}
                        placeholder="Mon - Sun: 7:00 AM - 10:00 PM"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Google Maps Location Coordinates</label>
                      <input
                        type="text"
                        name="googleMapsLocation"
                        className="form-control rounded-3"
                        value={settings.googleMapsLocation}
                        onChange={handleChange}
                        placeholder="e.g. 19.1234, 72.8765"
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">Social Media URLs</h5>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">WhatsApp Number (with country code)</label>
                      <input
                        type="text"
                        name="whatsAppNumber"
                        className="form-control rounded-3"
                        value={settings.whatsAppNumber}
                        onChange={handleChange}
                        placeholder="e.g. +919876543210"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Facebook URL</label>
                      <input
                        type="text"
                        name="facebookUrl"
                        className="form-control rounded-3"
                        value={settings.facebookUrl}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Instagram URL</label>
                      <input
                        type="text"
                        name="instagramUrl"
                        className="form-control rounded-3"
                        value={settings.instagramUrl}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Twitter/X URL</label>
                      <input
                        type="text"
                        name="twitterUrl"
                        className="form-control rounded-3"
                        value={settings.twitterUrl}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">LinkedIn URL</label>
                      <input
                        type="text"
                        name="linkedinUrl"
                        className="form-control rounded-3"
                        value={settings.linkedinUrl}
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  <button type="submit" className="btn btn-success px-5 py-2.5 mt-4 rounded-pill fw-bold text-white shadow-sm" disabled={loading}>
                    {loading ? "Saving changes..." : "Save Config Updates"}
                  </button>
                </form>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactSettings;