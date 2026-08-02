import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Register.css";
import { registerUser } from "../services/authService";
import logo from "../assets/images/logo.png";
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

const Swal = window.Swal;

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

    const [touchedFields, setTouchedFields] = useState({
        fullName: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    });

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const validateField = (name, value) => {
        let error = "";
        if (name === "fullName") {
            const val = (value || "").trim();
            if (!val || val.length < 3 || !/^[a-zA-Z\s]+$/.test(val)) {
                error = "Please enter a valid full name.";
            }
        } else if (name === "email") {
            const val = (value || "").trim();
            const emailRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
            if (!val || !emailRegex.test(val)) {
                error = "Please enter a valid email address.";
            }
        } else if (name === "phone") {
            const val = (value || "").trim();
            if (!val || val.length !== 10 || !/^[6-9]\d{9}$/.test(val)) {
                error = "Please enter a valid 10-digit mobile number.";
            } else if (/^(\d)\1{9}$/.test(val)) {
                error = "Mobile number cannot contain all identical digits.";
            }
        } else if (name === "password") {
            const val = value || "";
            if (!val || val.length < 6) {
                error = "Password must be at least 6 characters long.";
            }
        } else if (name === "confirmPassword") {
            if (value !== formData.password) {
                error = "Passwords do not match.";
            }
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));
        if (name === "confirmPassword") {
            validateField(name, confirmPassword);
        } else {
            validateField(name, value);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let sanitizedValue = value;
        if (name === "phone") {
            sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
        }

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        if (name === "password") {
            checkPasswordStrength(sanitizedValue);
            if (touchedFields.confirmPassword) {
                validateField("confirmPassword", confirmPassword);
            }
        }

        if (touchedFields[name]) {
            validateField(name, sanitizedValue);
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
        setTouchedFields({
            fullName: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true
        });

        const nameErr = validateField("fullName", formData.fullName);
        const emailErr = validateField("email", formData.email);
        const phoneErr = validateField("phone", formData.phone);
        const passwordErr = validateField("password", formData.password);
        const confirmErr = validateField("confirmPassword", confirmPassword);

        if (nameErr) return nameErr;
        if (emailErr) return emailErr;
        if (phoneErr) return phoneErr;
        if (passwordErr) return passwordErr;
        if (confirmErr) return confirmErr;

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
            await registerUser(formData);
            
            const roleName = formData.role === "USER" ? "User" : formData.role === "VENDOR" ? "Vendor" : "Admin";
            await Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: `${roleName} Registration Successful.`,
                showConfirmButton: false,
                timer: 2000
            });
            
            navigate("/login");

        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data || "Registration failed. Try again.";
            setErrorMsg(errMsg);
            await Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: errMsg,
                confirmButtonText: "OK"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card border-0 shadow-lg">
                <div className="d-flex justify-content-center mb-3">
                    <div className="logo-container logo-auth">
                        <img src={logo} alt="Book My Play" className="app-logo" />
                    </div>
                </div>
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
                                className={`form-control ${touchedFields.fullName && errors.fullName ? "is-invalid" : ""}`}
                                name="fullName"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            {touchedFields.fullName && errors.fullName && (
                                <div className="invalid-feedback">{errors.fullName}</div>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label>Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaEnvelope /></span>
                            <input
                                type="email"
                                className={`form-control ${touchedFields.email && errors.email ? "is-invalid" : ""}`}
                                name="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            {touchedFields.email && errors.email && (
                                <div className="invalid-feedback">{errors.email}</div>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="mb-3">
                        <label>Phone Number</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaPhone /></span>
                            <input
                                type="tel"
                                className={`form-control ${touchedFields.phone && errors.phone ? "is-invalid" : ""}`}
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={10}
                                pattern="[0-9]{10}"
                                inputMode="numeric"
                                placeholder="Enter 10-digit mobile number"
                                required
                            />
                            {touchedFields.phone && errors.phone && (
                                <div className="invalid-feedback">{errors.phone}</div>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label>Password</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaLock /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`form-control ${touchedFields.password && errors.password ? "is-invalid" : ""}`}
                                name="password"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {touchedFields.password && errors.password && (
                                <div className="invalid-feedback">{errors.password}</div>
                            )}
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
                                className={`form-control ${touchedFields.confirmPassword && errors.confirmPassword ? "is-invalid" : ""}`}
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setConfirmPassword(val);
                                    if (touchedFields.confirmPassword) {
                                        validateField("confirmPassword", val);
                                    }
                                }}
                                name="confirmPassword"
                                onBlur={handleBlur}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {touchedFields.confirmPassword && errors.confirmPassword && (
                                <div className="invalid-feedback">{errors.confirmPassword}</div>
                            )}
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