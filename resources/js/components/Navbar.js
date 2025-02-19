import React from "react";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                {/* Regular Logo */}
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="navbar-logo"
                />
            </div>
            <div className="navbar-right">
                <i className="bx bx-bell"></i> {/* Notification Icon */}
                <i className="bx bx-user"></i> {/* User Profile Icon */}
            </div>
        </nav>
    );
};

export default Navbar;
