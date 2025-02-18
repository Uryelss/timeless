import React, { useState } from "react";
import axios from "axios";

const Register = () => {
    const [username, setUsername] = useState(""); // State for username
    const [firstName, setFirstName] = useState(""); // State for first name
    const [middleName, setMiddleName] = useState(""); // State for middle name (optional)
    const [lastName, setLastName] = useState(""); // State for last name
    const [email, setEmail] = useState(""); // State for email
    const [password, setPassword] = useState(""); // State for password
    const [passwordConfirmation, setPasswordConfirmation] = useState(""); // State for password confirmation
    const [errorMessage, setErrorMessage] = useState(""); // State for error message
    const [successMessage, setSuccessMessage] = useState(""); // State for success message
    const [loading, setLoading] = useState(false); // Loading state

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setErrorMessage("");
        setSuccessMessage("");

        // Validate passwords match
        if (password !== passwordConfirmation) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        // Prepare the data to send to the backend
        const data = {
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName || null,
            username: username || null,
            email,
            password,
            password_confirmation: passwordConfirmation,
        };

        setLoading(true); // Set loading state

        try {
            // Make POST request to backend API
            const response = await axios.post(
                "http://127.0.0.1:8000/api/register",
                data
            );
            console.log(response.data);

            // Set success message
            setSuccessMessage(
                response.data.message || "Registration successful!"
            );
            setLoading(false); // Reset loading state
        } catch (error) {
            setLoading(false); // Reset loading state
            // Handle error response from the server
            if (error.response && error.response.data) {
                setErrorMessage(
                    error.response.data.message ||
                        "An error occurred during registration."
                );
            } else {
                setErrorMessage(
                    "Server not responding. Please try again later."
                );
            }
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2>Register</h2>

                {/* Show success or error message */}
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                {/* Username Input */}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                {/* First Name Input */}
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                {/* Middle Name Input (Optional) */}
                <input
                    type="text"
                    placeholder="Middle Name (Optional)"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                />
                {/* Last Name Input */}
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                {/* Email Input */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {/* Password Input */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {/* Confirm Password Input */}
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                />

                {/* Submit Button */}
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default Register;
