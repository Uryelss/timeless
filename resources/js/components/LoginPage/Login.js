import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                form
            );
            console.log("API Response:", response.data);

            const { user, token } = response.data;

            // Store token, email, and role in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("email", user.email);
            localStorage.setItem("role", user.role); // Store role

            console.log("Stored Role:", localStorage.getItem("role"));

            // Redirect based on role
            if (user.role === "admin") {
                console.log("Redirecting to Admin Dashboard");
                navigate("/admin-dashboard");
            } else if (user.role === "user") {
                console.log("Redirecting to User Dashboard");
                navigate("/user-dashboard");
            } else {
                alert("Unauthorized access!");
            }
        } catch (error) {
            console.error(
                "Login Error:",
                error.response?.data || error.message
            );
            alert("Login failed! Check your credentials.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
