import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaLock, FaCamera, FaSpinner, FaUserCircle } from "react-icons/fa";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
];

function AdminProfile() {
  const userSession = JSON.parse(localStorage.getItem("user")) || {};

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    profilePicture: "",
    address: ""
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
    }
  }, [userSession.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "password") {
      const el = document.getElementById("change-password-section");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [window.location.search]);

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
        address: res.data.address || ""
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
        address: profile.address
      });

      const updatedSession = { ...userSession, fullName: res.data.fullName, profilePicture: res.data.profilePicture };
      localStorage.setItem("user", JSON.stringify(updatedSession));
      window.dispatchEvent(new Event("userProfileUpdated"));

      setProfileSuccess("Profile updated successfully!");
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

  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Left Sidebar */}
        <div className="col-md-2 p-0">
          <AdminSidebar />
        </div>

        {/* Content column */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          
          <AdminNavbar />

          <div className="px-4 pb-4">
            <h2 className="fw-bold mb-4 text-dark font-sans">Admin Profile Settings</h2>

            {loading && profile.email === "" ? (
              <div className="text-center py-5">
                <FaSpinner className="spinner-border text-primary fs-2" role="status" />
                <h5 className="mt-3 text-muted">Loading profile...</h5>
              </div>
            ) : (
              <div className="row g-4">
                
                {/* Profile Card & Picture Upload */}
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm p-4 rounded-4 text-center bg-white">
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
                        htmlFor="admin-pic-upload"
                        className="btn btn-dark rounded-circle position-absolute bottom-0 end-0 p-2 d-flex align-items-center justify-content-center border-0 shadow-sm"
                        style={{ width: "35px", height: "35px", cursor: "pointer" }}
                      >
                        <FaCamera size={14} className="text-white" />
                      </label>
                      <input
                        id="admin-pic-upload"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleFileChange}
                      />
                    </div>

                    <h4 className="fw-bold mb-1">{profile.fullName || "Admin Account"}</h4>
                    <span className="badge bg-danger text-uppercase px-3 py-2 rounded-pill small mb-4">
                      {profile.role || "ADMIN"}
                    </span>

                    <hr />

                    <h6 className="fw-bold text-start text-muted mb-2">Avatar Presets</h6>
                    <div className="d-flex justify-content-center gap-2 mb-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt="Preset Avatar"
                          className="rounded-circle border cursor-pointer"
                          style={{ width: "45px", height: "45px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setProfile(prev => ({ ...prev, profilePicture: preset }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit Details Forms */}
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                    <h4 className="fw-bold text-dark mb-4">Update Profile Details</h4>
                    
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
                        <div className="col-12">
                          <label className="form-label fw-semibold text-muted">Email Address (Read-Only)</label>
                          <input
                            type="email"
                            className="form-control rounded-3 bg-light text-muted"
                            value={profile.email}
                            readOnly
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold text-muted">Office / Home Address</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            value={profile.address}
                            onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="e.g. 123 Sports Way, Arena District, CA"
                          />
                        </div>
                      </div>
                      
                      <button type="submit" className="btn btn-dark px-4 py-2 mt-4 rounded-pill fw-bold">
                        Save Profile Changes
                      </button>
                    </form>
                  </div>

                  {/* Change Password Card */}
                  <div id="change-password-section" className="card border-0 shadow-sm p-4 rounded-4 bg-white">
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

                      <button type="submit" className="btn btn-danger px-4 py-2 mt-4 rounded-pill fw-bold" disabled={passLoading}>
                        {passLoading ? "Changing..." : "Update Password"}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminProfile;