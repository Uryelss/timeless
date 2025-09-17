import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../../sass/Login.scss";
function Login() {
    const [isModalOpen, setIsModalOpen] = useState(true);

    return (
        <div className="login" style={{ border: "5px solid red" }}>
            {" "}
            {/* Debugging border */}
            <main className="main-content">
                <section className="login-section">
                    {isModalOpen && (
                        <div className="login-modal">
                            <h1>Log In to Pawfect Match</h1>
                            <div className="login-form">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="login-input"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="login-input"
                                />
                                <button className="login-button">Log In</button>
                                <Link to="/signup" className="signup-link">
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Login;
