import { useState } from "react";
import { updateProfile, changePassword } from "../services/userService";

function Profile() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [profile, setProfile] = useState(user);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Profile form fields
    const [fullName, setFullName] = useState(user.fullName || "");
    const [phone, setPhone] = useState(user.phone || "");
    
    // Change Password form fields
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Feedback states
    const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
    const [passMsg, setPassMsg] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: "", text: "" });
        setLoading(true);

        try {
            const response = await updateProfile(profile.id, { fullName, phone });
            // Response contains the updated user entity. Merge it and save
            const updatedUser = { ...profile, ...response.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setProfile(updatedUser);
            setIsEditing(false);
            setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            console.error(error);
            setProfileMsg({
                type: "danger",
                text: error.response?.data || "Failed to update profile."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg({ type: "", text: "" });

        if (newPassword !== confirmPassword) {
            setPassMsg({ type: "danger", text: "New passwords do not match." });
            return;
        }

        if (newPassword.length < 6) {
            setPassMsg({ type: "danger", text: "Password must be at least 6 characters." });
            return;
        }

        setLoading(true);
        try {
            const response = await changePassword(profile.id, { oldPassword, newPassword });
            setPassMsg({ type: "success", text: response.data || "Password changed successfully!" });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            setPassMsg({
                type: "danger",
                text: error.response?.data || "Failed to change password. Please check your current password."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Profile Details Column */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-primary text-white py-3">
                            <h3 className="mb-0 d-flex align-items-center">
                                <span className="me-2">👤</span> My Profile
                            </h3>
                        </div>
                        <div className="card-body p-4">
                            {profileMsg.text && (
                                <div className={`alert alert-${profileMsg.type}`} role="alert">
                                    {profileMsg.text}
                                </div>
                            )}

                            {!isEditing ? (
                                <div>
                                    <div className="row mb-3 align-items-center">
                                        <div className="col-sm-4 text-muted fw-bold">Full Name</div>
                                        <div className="col-sm-8 fs-5">{profile.fullName}</div>
                                    </div>
                                    <hr className="text-muted" />
                                    <div className="row mb-3 align-items-center">
                                        <div className="col-sm-4 text-muted fw-bold">Email Address</div>
                                        <div className="col-sm-8 fs-5">{profile.email}</div>
                                    </div>
                                    <hr className="text-muted" />
                                    <div className="row mb-3 align-items-center">
                                        <div className="col-sm-4 text-muted fw-bold">Phone Number</div>
                                        <div className="col-sm-8 fs-5">{profile.phone}</div>
                                    </div>
                                    <hr className="text-muted" />
                                    <div className="row mb-4 align-items-center">
                                        <div className="col-sm-4 text-muted fw-bold">Account Role</div>
                                        <div className="col-sm-8">
                                            <span className="badge bg-success px-3 py-2 text-uppercase">
                                                {profile.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-outline-primary w-100"
                                    >
                                        Edit Profile Information
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Email (Cannot be changed)</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={profile.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-grow-1"
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFullName(profile.fullName);
                                                setPhone(profile.phone);
                                                setIsEditing(false);
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Change Password Column */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-dark text-white py-3">
                            <h3 className="mb-0 d-flex align-items-center">
                                <span className="me-2">🔒</span> Change Password
                            </h3>
                        </div>
                        <div className="card-body p-4">
                            {passMsg.text && (
                                <div className={`alert alert-${passMsg.type}`} role="alert">
                                    {passMsg.text}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter current password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Re-enter new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-dark w-100"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;