import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/Login.css"; // Reuse login card styling
import logo from "../assets/images/logo.png";

const Swal = window.Swal;

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword.length < 8) {
            await Swal.fire({
                icon: "error",
                title: "Invalid Password",
                text: "Password must be at least 8 characters long.",
                confirmButtonText: "OK"
            });
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            await Swal.fire({
                icon: "error",
                title: "Password Mismatch",
                text: "Passwords do not match.",
                confirmButtonText: "OK"
            });
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:8080/api/auth/reset-password", {
                email: email,
                newPassword: form.newPassword
            });

            await Swal.fire({
                icon: "success",
                title: "Password Changed",
                text: "Password changed successfully.",
                showConfirmButton: false,
                timer: 2000
            });
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            await Swal.fire({
                icon: "error",
                title: "Reset Failed",
                text: error.response?.data || "Unable to reset password. Please try again.",
                confirmButtonText: "OK"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="login-page">
            <div className="login-card shadow-lg">
                <div className="d-flex justify-content-center mb-3">
                    <div className="logo-container logo-auth">
                        <img src={logo} alt="Book My Play" className="app-logo" />
                    </div>
                </div>
                <h2 className="login-title">Reset Password</h2>
                <p className="login-subtitle">
                    Create a new secure password for <strong>{email}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="form-label text-secondary small fw-bold">New Password</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <FaLock />
                        </span>
                        <input
                            type={showPass ? "text" : "password"}
                            className="form-control"
                            name="newPassword"
                            placeholder="Enter new password"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary shadow-none"
                            onClick={() => setShowPass(!showPass)}
                        >
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <label className="form-label text-secondary small fw-bold">Confirm Password</label>
                    <div className="input-group mb-4">
                        <span className="input-group-text">
                            <FaLock />
                        </span>
                        <input
                            type={showPass ? "text" : "password"}
                            className="form-control"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary login-btn w-100 py-2 rounded-3 fw-bold" disabled={loading}>
                        {loading ? "Saving..." : "Save Password"}
                    </button>
                </form>

                <p className="register-text mt-4 mb-0">
                    <Link to="/login" className="fw-bold text-decoration-none">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;
