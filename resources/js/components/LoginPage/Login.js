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
                {
                    email: form.email,
                    password: form.password, // Make sure you send password and email
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
