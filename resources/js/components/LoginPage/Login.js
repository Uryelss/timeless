import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    email: form.email,
                    password: form.password,
                }
            );
            const { user, token } = response.data;

            // Store token in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role); // Store the role

            // Redirect based on role
            if (user.role === "admin") {
                navigate("/admin-dashboard"); // Redirect to admin dashboard
            } else {
                navigate("/user-dashboard"); // Redirect to user dashboard
            }
        } catch (error) {
            alert("Login failed! Check your credentials.");
        }
    };

    return (
        <div className="login-container">
            {/* Left section with image */}
            <div className="login-left"></div>

            {/* Right section with form */}
            <div className="login-right">
                <div className="login-box">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                onChange={handleChange}
                                value={form.email}
                                required
                            />
                        </div>

                        <div className="input-group password-group">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                onChange={handleChange}
                                value={form.password}
                                required
                            />
                            <i
                                className={`fa-solid ${
                                    passwordVisible ? "fa-eye-slash" : "fa-eye"
                                }`}
                                onClick={() =>
                                    setPasswordVisible(!passwordVisible)
                                }
                            ></i>
                        </div>

                        <button type="submit">Login</button>
                    </form>

                    <div className="register-link">
                        <p>
                            New To Timeless?{" "}
                            <a href="http://localhost:8000/register">
                                Register Now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
