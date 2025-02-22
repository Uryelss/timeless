import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for routing

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        password: "",
        password_confirmation: "",
    });

    const [message, setMessage] = useState({
        type: "",
        content: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", content: "" }); // Reset message before submitting

        if (form.password !== form.password_confirmation) {
            setMessage({ type: "error", content: "Passwords do not match!" });
            return;
        }

        try {
            await axios.post("http://localhost:8000/api/register", form);
            setMessage({
                type: "success",
                content: "Registration successful!",
            });
        } catch (error) {
            setMessage({
                type: "error",
                content:
                    error.response?.data?.message ||
                    "An error occurred, please try again.",
            });
        }
    };

    return (
        <div className="register-container">
            <div className="register-left">
                <img className="background-image" />
            </div>

            <div className="register-right">
                <div className="register-box">
                    <h2>Create an Account</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                name="first_name"
                                placeholder="First Name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="middle_name"
                                placeholder="Middle Name (Optional)"
                                value={form.middle_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="last_name"
                                placeholder="Last Name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="suffix"
                                value={form.suffix}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Suffix</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="password_confirmation"
                                type="password"
                                placeholder="Confirm Password"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit">Register</button>

                        {message.content && (
                            <div
                                className={
                                    message.type === "error"
                                        ? "error-message"
                                        : "success-message"
                                }
                            >
                                {message.content}
                            </div>
                        )}

                        <div className="login-text">
                            <p>
                                Already have an account?{" "}
                                <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
