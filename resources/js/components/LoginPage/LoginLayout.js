import { useState } from "react";

export default function LoginForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <div className="login-container">
            {/* Left side with image */}
            <div className="login-image">
                <img
                    src="/Images/login.png" // Use relative path here
                    alt="Login"
                    className="login-image-img"
                />
            </div>

            {/* Right side with login form */}
            <div className="login-form-container">
                <div className="login-form">
                    <h2 className="login-title">Login</h2>

                    <form>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group password-group">
                            <label className="form-label">Password</label>
                            <input
                                type={passwordVisible ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter your password"
                                required
                            />
                            <i
                                className={`fa-solid ${
                                    passwordVisible ? "fa-eye-slash" : "fa-eye"
                                }`}
                                onClick={() =>
                                    setPasswordVisible(!passwordVisible)
                                }
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                            ></i>
                        </div>

                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
