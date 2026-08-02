import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaInfoCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";

function AboutSettings() {
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    mission: "",
    vision: "",
    companyValues: "",
    imageUrl: ""
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
      const res = await axios.get("http://localhost:8080/api/about-settings");
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
      await axios.put("http://localhost:8080/api/about-settings", settings);
      setSuccessMsg("About page details updated successfully!");
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
              <FaInfoCircle className="text-secondary" /> About Page Configurations
            </h2>

            {loading && settings.title === "" ? (
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
                    
                    <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Main Content</h5>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">About Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control rounded-3"
                        value={settings.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">About Description/Content</label>
                      <textarea
                        name="description"
                        className="form-control rounded-3"
                        rows="5"
                        value={settings.description}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">Core Pillars (Mission, Vision, Values)</h5>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Mission Statement</label>
                      <textarea
                        name="mission"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.mission}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Vision Statement</label>
                      <textarea
                        name="vision"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.vision}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Company Values / Community Description</label>
                      <textarea
                        name="companyValues"
                        className="form-control rounded-3"
                        rows="3"
                        value={settings.companyValues}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <h5 className="fw-bold text-dark border-bottom pb-2 mt-4 mb-3">Media Settings</h5>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">About Image URL</label>
                      <input
                        type="text"
                        name="imageUrl"
                        className="form-control rounded-3"
                        value={settings.imageUrl || ""}
                        onChange={handleChange}
                        placeholder="e.g. https://example.com/about.jpg"
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

export default AboutSettings;
