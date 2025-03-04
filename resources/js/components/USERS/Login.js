import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // ✅ Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role) {
            if (role === "admin") {
                navigate("/admin-dashboard"); // Redirect admin to dashboard
            } else {
                navigate("/Homepage"); // Redirect users to homepage
            }
        }
    }, [navigate]); // Runs on component mount

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                { email, password }
            );

            const { token, role } = response.data;

            if (!token || !role) {
                throw new Error(
                    "Invalid login response. Missing token or role."
                );
            }

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            console.log("User Role Set:", role);

            if (role === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/Homepage");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="background-image"></div>
            <div className="login-card">
                <h2>Welcome to Timeless</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-box">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-box password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i
                            className={`fas ${
                                showPassword ? "fa-eye-slash" : "fa-eye"
                            } password-icon`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                    <a href="#" className="forgot-password">
                        Forgot Password?
                    </a>
                    <button type="submit">Login</button>
                </form>
                <div className="signup-section">
                    <p>
                        New to Timeless? <a href="/register">Sign Up</a>
                    </p>
                </div>
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
