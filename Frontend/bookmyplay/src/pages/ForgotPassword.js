import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaSync } from "react-icons/fa";
import "../css/Login.css"; // Reuse login card styling
import logo from "../assets/images/logo.png";

const Swal = window.Swal;

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [generatedCaptcha, setGeneratedCaptcha] = useState("");
    const [loading, setLoading] = useState(false);

    const generateCaptchaCode = () => {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        setGeneratedCaptcha(code);
    };

    useEffect(() => {
        generateCaptchaCode();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await Swal.fire({
                icon: "error",
                title: "Invalid Email",
                text: "Please enter a valid email address.",
                confirmButtonText: "OK"
            });
            return;
        }

        if (captcha.toLowerCase() !== generatedCaptcha.toLowerCase()) {
            await Swal.fire({
                icon: "error",
                title: "Invalid Captcha",
                text: "Invalid Captcha. Please try again.",
                confirmButtonText: "OK"
            });
            generateCaptchaCode();
            setCaptcha("");
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:8080/api/auth/verify-forgot-password", {
                email,
                enteredCaptcha: captcha,
                generatedCaptcha
            });
            
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data || "No account found with this email.";
            await Swal.fire({
                icon: "error",
                title: "Verification Failed",
                text: errMsg,
                confirmButtonText: "OK"
            });
            generateCaptchaCode();
            setCaptcha("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card shadow-lg">
                <div className="d-flex justify-content-center mb-3">
                    <div className="logo-container logo-auth">
                        <img src={logo} alt="Book My Play" className="app-logo" />
                    </div>
                </div>
                <h2 className="login-title">Forgot Password?</h2>
                <p className="login-subtitle">
                    Verify your email and solve the captcha to reset your password
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="form-label text-secondary small fw-bold">Email Address</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <FaEnvelope />
                        </span>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Captcha Code</label>
                        <div className="d-flex align-items-center gap-3 mb-2 p-3 bg-light rounded-3 border">
                            <span 
                                className="fs-4 fw-bold text-success text-center user-select-none flex-grow-1" 
                                style={{ letterSpacing: "5px", fontFamily: "Courier New, monospace", textDecoration: "line-through" }}
                            >
                                {generatedCaptcha}
                            </span>
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary p-2 rounded-3 d-flex align-items-center shadow-none"
                                onClick={generateCaptchaCode}
                                title="Refresh Captcha"
                            >
                                <FaSync />
                            </button>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter the 6-character captcha"
                            value={captcha}
                            onChange={(e) => setCaptcha(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary login-btn w-100 py-2 rounded-3 fw-bold mt-2" disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Continue"}
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

export default ForgotPassword;
