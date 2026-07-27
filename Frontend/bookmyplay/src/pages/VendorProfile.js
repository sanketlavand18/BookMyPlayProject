import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  FaUser,
  FaBuilding,
  FaCalendarCheck,
  FaLock,
  FaSignOutAlt,
  FaUserCircle,
  FaSpinner,
  FaCamera
} from "react-icons/fa";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
];

function VendorProfile() {
  const navigate = useNavigate();
  const userSession = JSON.parse(localStorage.getItem("user")) || {};

  const [activeTab, setActiveTab] = useState("profile"); // profile or password

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    profilePicture: "",
    address: "",
    city: "",
    businessName: ""
  });
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (userSession.id) {
      loadProfile();
    } else {
      navigate("/login");
    }
  }, [userSession.id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/users/profile?userId=${userSession.id}`);
      setProfile({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        role: res.data.role || "",
        profilePicture: res.data.profilePicture || "",
        address: res.data.address || "",
        city: res.data.city || "",
        businessName: res.data.businessName || ""
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setLoading(true);

    try {
      const res = await axios.put(`http://localhost:8080/api/users/profile?userId=${userSession.id}`, {
        fullName: profile.fullName,
        phone: profile.phone,
        profilePicture: profile.profilePicture,
        address: profile.address,
        city: profile.city,
        businessName: profile.businessName
      });

      const updatedSession = { ...userSession, fullName: res.data.fullName, profilePicture: res.data.profilePicture };
      localStorage.setItem("user", JSON.stringify(updatedSession));

      setProfileSuccess("Profile details updated successfully!");
      loadProfile();
    } catch (err) {
      setProfileError(err.response?.data || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassSuccess("");
    setPassError("");

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    setPassLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/users/change-password?userId=${userSession.id}`, {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      });
      setPassSuccess("Password updated successfully!");
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassError(err.response?.data || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Left White Profile Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm p-4 rounded-4 text-center bg-white mb-4 position-relative">
              <div className="position-relative d-inline-block mx-auto mb-3" style={{ width: "120px" }}>
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="rounded-circle border"
                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  />
                ) : (
                  <FaUserCircle className="text-secondary" style={{ fontSize: "120px" }} />
                )}
                <label
                  htmlFor="vendor-pic-upload"
                  className="btn btn-dark rounded-circle position-absolute bottom-0 end-0 p-2 d-flex align-items-center justify-content-center border-0 shadow-sm"
                  style={{ width: "35px", height: "35px", cursor: "pointer" }}
                >
                  <FaCamera size={14} className="text-white" />
                </label>
                <input
                  id="vendor-pic-upload"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>

              <h4 className="fw-bold mb-1 text-dark">{profile.fullName || "Vendor"}</h4>
              <span className="badge bg-success text-uppercase px-3 py-2 rounded-pill small mb-4">
                {profile.role || "VENDOR"}
              </span>

              {/* Tabs List */}
              <div className="list-group list-group-flush text-start mt-3">
                <button
                  className="list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-3 mb-1"
                  onClick={() => navigate("/vendor")}
                >
                  📊 Dashboard
                </button>
                <button
                  className="list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-3 mb-1"
                  onClick={() => navigate("/vendor")}
                >
                  🏢 My Venues
                </button>
                <button
                  className="list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-3 mb-1"
                  onClick={() => navigate("/vendor/bookings")}
                >
                  📅 Turf Bookings
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-3 mb-1 ${activeTab === "profile" ? "active bg-success text-white" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  👤 My Profile
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-3 mb-1 ${activeTab === "password" ? "active bg-success text-white" : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  🔒 Change Password
                </button>
                <button
                  className="list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-3 mb-1 text-danger fw-semibold"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-lg-9">
            
            {/* MY PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                <h4 className="fw-bold text-dark mb-4">My Profile Details</h4>
                
                {profileSuccess && <div className="alert alert-success rounded-3">{profileSuccess}</div>}
                {profileError && <div className="alert alert-danger rounded-3">{profileError}</div>}

                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Full Name</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={profile.fullName}
                        onChange={e => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Phone Number</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={profile.phone}
                        onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Business Name (Optional)</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={profile.businessName}
                        onChange={e => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="e.g. Dream Arena Sports"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Email (Read-Only)</label>
                      <input
                        type="email"
                        className="form-control rounded-3 bg-light text-muted"
                        value={profile.email}
                        readOnly
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-muted">Address</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={profile.address}
                        onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="e.g. Sector 5, Hiranandani Sports Complex"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-muted">City</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={profile.city}
                        onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g. Mumbai"
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="fw-bold text-muted mb-3">Choose Profile Picture Preset</h6>
                  <div className="d-flex gap-3 mb-4">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt="Avatar Preset"
                        className={`rounded-circle border cursor-pointer ${profile.profilePicture === preset ? "border-success border-2 shadow" : ""}`}
                        style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setProfile(prev => ({ ...prev, profilePicture: preset }))}
                      />
                    ))}
                  </div>
                  
                  <button type="submit" className="btn btn-success px-5 py-2.5 rounded-pill fw-bold text-white shadow-sm">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* CHANGE PASSWORD TAB */}
            {activeTab === "password" && (
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                  <FaLock className="text-danger" /> Change Account Password
                </h4>

                {passSuccess && <div className="alert alert-success rounded-3">{passSuccess}</div>}
                {passError && <div className="alert alert-danger rounded-3">{passError}</div>}

                <form onSubmit={handlePasswordChange}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold text-muted">Old Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={passForm.oldPassword}
                        onChange={e => setPassForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">New Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={passForm.newPassword}
                        onChange={e => setPassForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-muted">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        value={passForm.confirmPassword}
                        onChange={e => setPassForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-danger px-5 py-2.5 mt-4 rounded-pill fw-bold" disabled={passLoading}>
                    {passLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}

export default VendorProfile;
