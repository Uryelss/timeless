import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
    const navigate = useNavigate();

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
        <div className="register-container">
            <div className="background-image"></div>
            <div className="register-card">
                <h2>Create an Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={first_name}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="Middle Name (Optional)"
                                value={middle_name}
                                onChange={(e) => setMiddleName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={last_name}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="suffix-select">
                            <select
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                            >
                                <option value="" disabled hidden>
                                    Select Suffix (Optional)
                                </option>
                                <option value="Jr">Jr</option>
                                <option value="Sr">Sr</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                                <option value="V">V</option>
                                <option value="None">None</option>
                            </select>
                            <i className="fa-solid fa-caret-down suffix-icon"></i>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-box">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
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
                        <div className="input-box password-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirm_password}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                            <i
                                className={`fas ${
                                    showConfirmPassword
                                        ? "fa-eye-slash"
                                        : "fa-eye"
                                } password-icon`}
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            ></i>
                        </div>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <div className="signup-section">
                    <p>
                        Already have an account? <a href="/Login">Login</a>
                    </p>
                </div>
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default Register;
