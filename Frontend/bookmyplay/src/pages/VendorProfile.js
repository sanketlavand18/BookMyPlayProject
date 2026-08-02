import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorSidebar from "../components/VendorSidebar";
import VendorNavbar from "../components/VendorNavbar";
import {
  FaUser,
  FaBuilding,
  FaLock,
  FaUserCircle,
  FaSpinner,
  FaCamera
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
];

function VendorProfile() {
  const navigate = useNavigate();
  const { user: userSession = {}, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // profile or password
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Read URL params to check if tab=password is requested
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "password") {
      setActiveTab("password");
    }

    if (userSession.id) {
      loadProfile();
    } else {
      navigate("/login");
    }
  }, [userSession.id, window.location.search]);

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

      updateUser({
        fullName: res.data.fullName,
        phone: res.data.phone,
        profilePicture: res.data.profilePicture,
        address: res.data.address,
        city: res.data.city,
        businessName: res.data.businessName
      });

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await axios.post(`http://localhost:8080/api/users/${userSession.id}/upload-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        setProfile(prev => ({ ...prev, profilePicture: res.data.profilePicture }));
        updateUser({ profilePicture: res.data.profilePicture });
        window.Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile picture uploaded successfully!",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        window.Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: err.response?.data || "Failed to upload image."
        });
      }
    }
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
              <h2 className="fw-bold mb-0 text-dark">👤 My Profile</h2>
              <p className="text-muted">Manage your personal information, credentials, and avatar preset.</p>
            </div>

            <div className="row g-4">
              {/* Profile Card & Presets */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm p-4 rounded-4 text-center bg-white mb-4 position-relative">
                  <div className="position-relative d-inline-block mx-auto mb-3" style={{ width: "120px" }}>
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="rounded-circle border shadow-sm"
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

                  {/* Avatar Presets Selection */}
                  <div className="mb-4">
                    <span className="small text-muted d-block mb-2 fw-semibold">Choose Avatar Preset:</span>
                    <div className="d-flex justify-content-center gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt={`Preset ${idx + 1}`}
                          className={`rounded-circle border cursor-pointer ${profile.profilePicture === preset ? "border-success border-2 shadow" : ""}`}
                          style={{ width: "40px", height: "40px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setProfile(prev => ({ ...prev, profilePicture: preset }))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Profile Quick Switch Links */}
                  <div className="list-group list-group-flush text-start mt-2">
                    <button
                      className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-2.5 mb-1 ${activeTab === "profile" ? "bg-success text-white fw-bold" : "text-dark"}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <FaUser /> General Profile Details
                    </button>
                    <button
                      className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 rounded-3 py-2.5 ${activeTab === "password" ? "bg-danger text-white fw-bold" : "text-dark"}`}
                      onClick={() => setActiveTab("password")}
                    >
                      <FaLock /> Update Password Security
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable Form Side */}
              <div className="col-lg-8">
                {activeTab === "profile" ? (
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                    <h4 className="fw-bold text-dark mb-4 border-bottom pb-2">Business Profile Details</h4>
                    {profileSuccess && <div className="alert alert-success small py-2">{profileSuccess}</div>}
                    {profileError && <div className="alert alert-danger small py-2">{profileError}</div>}

                    <form onSubmit={handleUpdateProfile}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary small fw-bold">Full Name</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary small fw-bold">Email Address</label>
                          <input
                            type="email"
                            className="form-control rounded-3 bg-light"
                            value={profile.email}
                            disabled
                            title="Email cannot be changed"
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary small fw-bold">Phone Number</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary small fw-bold">Business Name</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            value={profile.businessName}
                            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary small fw-bold">City</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            value={profile.city}
                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-secondary small fw-bold">Address</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-success px-4 rounded-pill fw-bold" disabled={loading}>
                        {loading ? <FaSpinner className="spinner-border spinner-border-sm" /> : "Save Changes"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                    <h4 className="fw-bold text-dark mb-4 border-bottom pb-2">Change Password</h4>
                    {passSuccess && <div className="alert alert-success small py-2">{passSuccess}</div>}
                    {passError && <div className="alert alert-danger small py-2">{passError}</div>}

                    <form onSubmit={handlePasswordChange}>
                      <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Current Password</label>
                        <input
                          type="password"
                          className="form-control rounded-3"
                          value={passForm.oldPassword}
                          onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">New Password</label>
                        <input
                          type="password"
                          className="form-control rounded-3"
                          value={passForm.newPassword}
                          onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-secondary small fw-bold">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control rounded-3"
                          value={passForm.confirmPassword}
                          onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-danger px-4 rounded-pill fw-bold" disabled={passLoading}>
                        {passLoading ? <FaSpinner className="spinner-border spinner-border-sm" /> : "Update Password"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;
