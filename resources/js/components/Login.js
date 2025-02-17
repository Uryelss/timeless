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
    });

    const [error, setError] = useState(""); // To store error message
    const [isSuccess, setIsSuccess] = useState(false); // To track successful registration

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Make the API request to register the user
            const response = await axios.post(
                "http://127.0.0.1:8000/api/register",
                formData
            );

            // Success response
            console.log("Registration successful", response.data);
            setIsSuccess(true); // Set success flag
            setError(""); // Clear any previous errors
            navigate("/login"); // Redirect to login page
        } catch (error) {
            // Handle error
            setError(error.response?.data?.error || "Something went wrong");
            console.log("Error", error); // Log error for debugging
        }
    };

    return (
        <div className="register-page">
            <h2>Register</h2>
            {isSuccess && (
                <p className="success">Registration Successful!</p>
            )}{" "}
            {/* Show success message */}
            {error && <p className="error">{error}</p>}{" "}
            {/* Display error message */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    onChange={handleChange}
                    required
                />
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
                <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
