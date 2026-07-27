import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { loginAdmin } from "../services/adminService";
import "../css/Login.css";

import { Link } from "react-router-dom";

import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

function Login() {

    const navigate = useNavigate();

    const [login, setLogin] = useState({
        email: "",
        password: ""
    });
    const [selectedRole, setSelectedRole] = useState("USER");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let user;

            if (selectedRole === "ADMIN") {
                const response = await loginAdmin(login);
                user = response.data;
            } else {
                const response = await loginUser(login);
                user = response.data;

                if (user.role !== selectedRole) {
                    alert(`Access denied. Your account is not registered as a ${selectedRole.toLowerCase()}.`);
                    return;
                }
            }

            // Save user details
            localStorage.setItem("user", JSON.stringify(user));

            alert("Login Successful");

            // Redirect based on role
            if (user.role === "USER") {
                navigate("/");
            } else if (user.role === "VENDOR") {
                navigate("/vendor");
            } else if (user.role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }
        catch (error) {
            console.error(error);
            alert(error.response?.data || "Login Failed");
        }
    };
return (

<div className="login-page">

    <div className="login-card">

        <h2 className="login-title">
            Welcome Back 👋
        </h2>

        <p className="login-subtitle">
            Login to BookMyPlay
        </p>

        <form onSubmit={handleSubmit}>

            <div className="mb-4">
                <label className="form-label fw-bold d-block text-muted text-uppercase mb-2" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Login As</label>
                <div className="d-flex justify-content-between p-1 bg-light rounded-3" style={{ border: '1px solid #dee2e6' }}>
                    <button
                        type="button"
                        className={`btn flex-grow-1 border-0 py-2 rounded-2 ${selectedRole === "USER" ? "btn-primary shadow-sm text-white" : "btn-light text-dark bg-transparent"}`}
                        onClick={() => setSelectedRole("USER")}
                        style={{ transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                        👤 User
                    </button>
                    <button
                        type="button"
                        className={`btn flex-grow-1 border-0 py-2 rounded-2 ${selectedRole === "VENDOR" ? "btn-success shadow-sm text-white" : "btn-light text-dark bg-transparent"}`}
                        onClick={() => setSelectedRole("VENDOR")}
                        style={{ transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                        💼 Vendor
                    </button>
                    <button
                        type="button"
                        className={`btn flex-grow-1 border-0 py-2 rounded-2 ${selectedRole === "ADMIN" ? "btn-dark shadow-sm text-white" : "btn-light text-dark bg-transparent"}`}
                        onClick={() => setSelectedRole("ADMIN")}
                        style={{ transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                        🔑 Admin
                    </button>
                </div>
            </div>

            <label>Email Address</label>

            <div className="input-group mb-3">

                <span className="input-group-text">
                    <FaEnvelope/>
                </span>

                <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter email"
                    value={login.email}
                    onChange={handleChange}
                    required
                />

            </div>

            <label>Password</label>

            <div className="input-group mb-3">

                <span className="input-group-text">
                    <FaLock/>
                </span>

                <input
                    type={showPassword ? "text":"password"}
                    className="form-control"
                    name="password"
                    placeholder="Enter password"
                    value={login.password}
                    onChange={handleChange}
                    required
                />

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={()=>setShowPassword(!showPassword)}
                >

                    {showPassword ? <FaEyeSlash/> : <FaEye/>}

                </button>

            </div>

            <div className="d-flex justify-content-between mb-4">

                <div>

                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={()=>setRememberMe(!rememberMe)}
                    />

                    <span className="ms-2">
                        Remember Me
                    </span>

                </div>

                <Link to="#">
                    Forgot Password?
                </Link>

            </div>

            <button className="btn btn-primary login-btn">

                Login

            </button>

        </form>

        <p className="register-text">

            Don't have an account?

            <Link
                to="/register"
                className="ms-2 fw-bold text-decoration-none"
            >

                Register

            </Link>

        </p>

    </div>

</div>

);

}

export default Login;