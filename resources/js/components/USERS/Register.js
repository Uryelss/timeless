import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importing useNavigate

const Register = () => {
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [middle_name, setMiddleName] = useState(""); // Optional middle name
    const [suffix, setSuffix] = useState(""); // Suffix dropdown
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Using useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm_password) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8000/api/register",
                {
                    first_name,
                    last_name,
                    middle_name,
                    suffix,
                    email,
                    username, // Ensure username is included here
                    password,
                    password_confirmation: confirm_password, // This must be sent as 'password_confirmation'
                }
            );

            navigate("/Login"); // Redirect to login after successful registration
        } catch (err) {
            setError("Error occurred during registration");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Middle Name (Optional)"
                    value={middle_name}
                    onChange={(e) => setMiddleName(e.target.value)} // Middle name is optional
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm_password}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <select
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)} // Handle suffix selection
                >
                    <option value="">Select Suffix (Optional)</option>
                    <option value="Jr">Jr</option>
                    <option value="Sr">Sr</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="None">None</option>
                </select>
                <button type="submit">Register</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Register;
