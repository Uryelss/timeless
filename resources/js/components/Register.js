import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        name: "", // Add the name field
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handles form field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple client-side validation
        if (
            !formData.first_name ||
            !formData.last_name ||
            !formData.email ||
            !formData.password ||
            !formData.password_confirmation
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match.");
            return;
        }

        setError(""); // Reset error message
        setIsSubmitting(true); // Disable submit button while submitting

        try {
            // API request for registration
            const response = await axios.post(
                "http://127.0.0.1:8000/api/register", // Make sure this is the correct endpoint
                formData // The data being sent (first_name, last_name, etc.)
            );

            console.log("Registration success:", response.data);

            // Redirect to login after successful registration
            navigate("/login");

            // Optional: Clear form fields after submission
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                password_confirmation: "",
            });
        } catch (error) {
            console.log("Error during registration:", error.response?.data);

            // Display detailed error from backend response
            setError(
                error.response?.data?.message ||
                    "Registration failed. Please try again."
            );
        } finally {
            setIsSubmitting(false); // Re-enable submit button after submission
        }
    };

    return (
        <div className="register-page">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}{" "}
            {/* Display error message */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    placeholder="First Name"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    placeholder="Last Name"
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default Register;
