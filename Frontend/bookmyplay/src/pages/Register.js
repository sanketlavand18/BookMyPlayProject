import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Register.css";
import { registerUser } from "../services/authService";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaSpinner,
    FaCheckCircle,
    FaExclamationCircle
} from "react-icons/fa";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "USER"
    });
    
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Status states
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Password strength state
    const [passwordStrength, setPasswordStrength] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "password") {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (pass) => {
        if (!pass) {
            setPasswordStrength("");
            return;
        }

        let strength = "weak";
        const hasLetters = /[a-zA-Z]/.test(pass);
        const hasNumbers = /[0-9]/.test(pass);
        const hasSpecial = /[^A-Za-z0-9]/.test(pass);

        if (pass.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
            strength = "strong";
        } else if (pass.length >= 6 && hasLetters && hasNumbers) {
            strength = "medium";
        }

        setPasswordStrength(strength);
    };

    // Client-side validations
    const validateForm = () => {
        if (!formData.fullName.trim()) return "Full Name is required.";
        if (!formData.email.trim()) return "Email is required.";
        
        // 10-digit Phone Validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            return "Phone number must be exactly 10 digits.";
        }

        if (formData.password.length < 6) {
            return "Password must be at least 6 characters long.";
        }

        if (formData.password !== confirmPassword) {
            return "Passwords do not match.";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const validationError = validateForm();
        if (validationError) {
            setErrorMsg(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser(formData);
            
            setSuccessMsg("Registration successful! Redirecting to login...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2500);

        } catch (error) {
            console.error(error);
            setErrorMsg(error.response?.data || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card border-0 shadow-lg">
                <h2 className="register-title">Create Account</h2>
                <p className="register-subtitle">Join BookMyPlay today</p>

                {errorMsg && (
                    <div className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-center gap-2 small">
                        <FaExclamationCircle className="flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="alert alert-success border-0 rounded-3 mb-4 d-flex align-items-center gap-2 small">
                        <FaCheckCircle className="flex-shrink-0 text-success" />
                        <strong>{successMsg}</strong>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* Full Name */}
                    <div className="mb-3">
                        <label>Full Name</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaUser /></span>
                            <input
                                type="text"
                                className="form-control"
                                name="fullName"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label>Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaEnvelope /></span>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                        <label>Phone Number</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaPhone /></span>
                            <input
                                type="tel"
                                className="form-control"
                                name="phone"
                                placeholder="10-digit number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label>Password</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaLock /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                name="password"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* Password strength indicators */}
                        {passwordStrength && (
                            <div className="strength-container">
                                <div className={`strength-bar ${
                                    passwordStrength === "strong" ? "strength-strong" :
                                    passwordStrength === "medium" ? "strength-medium" : "strength-weak"
                                }`} />
                                <span className={`strength-text ${
                                    passwordStrength === "strong" ? "text-success" :
                                    passwordStrength === "medium" ? "text-warning" : "text-danger"
                                }`}>
                                    Password Strength: {passwordStrength.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label>Confirm Password</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaLock /></span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Role Segment Radio selectors */}
                    <div className="mb-4">
                        <label>Register As</label>
                        <div className="role-segment">
                            <div className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="USER"
                                    checked={formData.role === "USER"}
                                    onChange={handleChange}
                                />
                                <label className="role-label">👤 User</label>
                            </div>
                            <div className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="VENDOR"
                                    checked={formData.role === "VENDOR"}
                                    onChange={handleChange}
                                />
                                <label className="role-label">💼 Vendor</label>
                            </div>
                            <div className="role-option">
                                <input
                                    type="radio"
                                    name="role"
                                    value="ADMIN"
                                    checked={formData.role === "ADMIN"}
                                    onChange={handleChange}
                                />
                                <label className="role-label">🔑 Admin</label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary register-btn fw-bold d-flex align-items-center justify-content-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner-border spinner-border-sm me-2" role="status" /> Creating Account...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>

                </form>

                <div className="login-link-container">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;