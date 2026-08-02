import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaGlobe, FaSpinner, FaSave } from "react-icons/fa";

function WebsiteSettings() {
  const [settings, setSettings] = useState({
    websiteName: "BookMyPlay",
    logoUrl: "",
    faviconUrl: "",
    primaryThemeColor: "#4f46e5",
    footerText: "",
    aboutUs: "",
    privacyPolicy: "",
    termsAndConditions: "",
    refundPolicy: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    seoTitle: "",
    seoMetaDescription: "",
    seoKeywords: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/admin/extended/settings/website");
      setSettings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    try {
      await axios.put("http://localhost:8080/api/admin/extended/settings/website", settings);
      setSuccess("Website settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
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
              <FaGlobe className="text-secondary" /> Website Branding & Content Settings
            </h2>

            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
              </div>
            ) : (
              <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                
                {success && <div className="alert alert-success rounded-3">{success}</div>}

                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    
                    <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">General Settings & Themes</h5>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">Website Name</label>
                      <input
                        type="text"
                        name="websiteName"
                        className="form-control rounded-3"
                        value={settings.websiteName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">Primary Theme Color</label>
                      <input
                        type="color"
                        name="primaryThemeColor"
                        className="form-control form-control-color w-100 rounded-3"
                        style={{ height: "40px" }}
                        value={settings.primaryThemeColor}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">Footer CopyText</label>
                      <input
                        type="text"
                        name="footerText"
                        className="form-control rounded-3"
                        value={settings.footerText}
                        onChange={handleChange}
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">Logo & Favicon links</h5>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Branding Logo Link</label>
                      <input
                        type="text"
                        name="logoUrl"
                        className="form-control rounded-3"
                        value={settings.logoUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Favicon File Link</label>
                      <input
                        type="text"
                        name="faviconUrl"
                        className="form-control rounded-3"
                        value={settings.faviconUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">SEO Configurations</h5>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">SEO Title Header</label>
                      <input
                        type="text"
                        name="seoTitle"
                        className="form-control rounded-3"
                        value={settings.seoTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">Meta SEO Description</label>
                      <input
                        type="text"
                        name="seoMetaDescription"
                        className="form-control rounded-3"
                        value={settings.seoMetaDescription}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">Meta SEO Keywords</label>
                      <input
                        type="text"
                        name="seoKeywords"
                        className="form-control rounded-3"
                        value={settings.seoKeywords}
                        onChange={handleChange}
                        placeholder="sports, turf, stadium booking"
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">Website Pages (CMS Content)</h5>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">About Us Details</label>
                      <textarea
                        name="aboutUs"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.aboutUs}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Privacy Policy Details</label>
                      <textarea
                        name="privacyPolicy"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.privacyPolicy}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Terms and Conditions Agreements</label>
                      <textarea
                        name="termsAndConditions"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.termsAndConditions}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Refund Policies</label>
                      <textarea
                        name="refundPolicy"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.refundPolicy}
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  <button type="submit" className="btn btn-success px-5 py-3 mt-4 rounded-pill fw-bold text-white shadow-sm" disabled={saving}>
                    {saving ? "Saving settings..." : <><FaSave className="me-2" /> Update Website Brand Configurations</>}
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

export default WebsiteSettings;