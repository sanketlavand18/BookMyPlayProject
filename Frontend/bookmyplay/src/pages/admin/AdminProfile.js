import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { FaCamera, FaSpinner, FaUserCircle, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

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
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [strength, setStrength] = useState({
    score: 0,
    label: "Empty",
    color: "muted"
  });

  const checkPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) {
      setStrength({ score: 0, label: "Empty", color: "muted" });
      return;
    }
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    let label = "Very Weak";
    let color = "danger";
    if (score === 5) {
      label = "Very Strong";
      color = "success";
    } else if (score === 4) {
      label = "Strong";
      color = "success";
    } else if (score === 3) {
      label = "Medium";
      color = "warning";
    } else if (score === 2) {
      label = "Weak";
      color = "warning";
    }

    setStrength({ score, label, color });
  };

  const handlePassChange = (field, val) => {
    setPassForm(prev => {
      const updated = { ...prev, [field]: val };
      if (field === "newPassword") {
        checkPasswordStrength(val);
      }
      return updated;
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPassSuccess("");
    setPassError("");

    if (!passForm.currentPassword) {
      setPassError("Current password is required.");
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }
    if (strength.score < 3) {
      setPassError("Password is too weak. Ensure it has at least 8 characters, uppercase, lowercase, numbers, and special characters.");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    setPassLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/users/change-password?userId=${userSession.id}`, {
        oldPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassSuccess("Password reset successfully!");
      setPassForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setStrength({ score: 0, label: "Empty", color: "muted" });
    } catch (err) {
      setPassError(err.response?.data || "Failed to reset password. Verify your current password.");
    } finally {
      setPassLoading(false);
    }
  };

  useEffect(() => {
    if (userSession.id) {
      loadProfile();
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

                  {/* Reset Password Card */}
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mt-4">
                    <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                      <FaLock className="text-success" /> Reset Account Password
                    </h4>

                    {passSuccess && <div className="alert alert-success rounded-3">{passSuccess}</div>}
                    {passError && <div className="alert alert-danger rounded-3">{passError}</div>}

                    <form onSubmit={handleResetPassword}>
                      <div className="row g-3">
                        {/* Current Password */}
                        <div className="col-12">
                          <label className="form-label fw-semibold text-muted">Current Password</label>
                          <div className="position-relative">
                            <input
                              type={showCurrent ? "text" : "password"}
                              className="form-control rounded-3 pe-5"
                              value={passForm.currentPassword}
                              onChange={e => handlePassChange("currentPassword", e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent pe-3 shadow-none"
                              onClick={() => setShowCurrent(!showCurrent)}
                            >
                              {showCurrent ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-muted">New Password</label>
                          <div className="position-relative">
                            <input
                              type={showNew ? "text" : "password"}
                              className="form-control rounded-3 pe-5"
                              value={passForm.newPassword}
                              onChange={e => handlePassChange("newPassword", e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent pe-3 shadow-none"
                              onClick={() => setShowNew(!showNew)}
                            >
                              {showNew ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {passForm.newPassword && (
                            <div className="mt-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small text-muted">Strength:</span>
                                <span className={`small fw-bold text-${strength.color}`}>{strength.label}</span>
                              </div>
                              <div className="progress" style={{ height: "6px" }}>
                                <div
                                  className={`progress-bar bg-${strength.color}`}
                                  role="progressbar"
                                  style={{ width: `${(strength.score / 5) * 100}%` }}
                                  aria-valuenow={strength.score}
                                  aria-valuemin="0"
                                  aria-valuemax="5"
                                ></div>
                              </div>
                              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                Use 8+ characters with uppercase, lowercase, numbers, and symbols.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-muted">Confirm New Password</label>
                          <div className="position-relative">
                            <input
                              type={showConfirm ? "text" : "password"}
                              className="form-control rounded-3 pe-5"
                              value={passForm.confirmPassword}
                              onChange={e => handlePassChange("confirmPassword", e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="btn position-absolute top-50 end-0 translate-middle-y text-muted border-0 bg-transparent pe-3 shadow-none"
                              onClick={() => setShowConfirm(!showConfirm)}
                            >
                              {showConfirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
                            <span className="text-danger small mt-1 d-block">
                              Passwords do not match.
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success px-4 py-2 mt-4 rounded-pill fw-bold"
                        disabled={passLoading || (passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword)}
                      >
                        {passLoading ? "Resetting..." : "Reset Password"}
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