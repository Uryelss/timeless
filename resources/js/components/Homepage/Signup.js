import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../../sass/Signup.scss";

function Signup() {
    const [isModalOpen, setIsModalOpen] = useState(true);

    return (
        <div className="Signup" style={{ border: "5px solid red" }}>
            {" "}
            {/* Debugging border */}
            <main className="main-content">
                <section className="signup-section">
                    {isModalOpen && (
                        <div className="signup-modal">
                            <h1>Sign Up for Pawfect Match</h1>
                            <div className="signup-form">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="signup-input"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="signup-input"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="signup-input"
                                />
                                <button className="signup-button">
                                    Sign Up
                                </button>
                                <Link to="/login" className="login-link">
                                    Already have an account? Log In
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Signup;
