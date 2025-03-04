import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ User Logout Function
    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:8000/api/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            // ✅ Keep user data (e.g., cart) but remove authentication tokens
            localStorage.removeItem("token"); // Remove authentication token
            localStorage.removeItem("role"); // Remove role

            // ✅ Redirect to login page
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to logout.");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src="Images/logo.png" alt="Logo" />
            </div>

            <div className="menu-toggle" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <ul className={`navbar-links ${isMenuOpen ? "show" : ""}`}>
                <li>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>
                        HOME
                    </Link>
                </li>
                <li>
                    <Link to="/aboutus" onClick={() => setIsMenuOpen(false)}>
                        ABOUT US
                    </Link>
                </li>
                <li>
                    <Link to="/collection" onClick={() => setIsMenuOpen(false)}>
                        COLLECTION
                    </Link>
                </li>
                <li
                    className={`dropdown ${isDropdownOpen ? "open" : ""}`}
                    ref={dropdownRef}
                >
                    <button
                        onClick={toggleDropdown}
                        className="dropdown-toggle"
                    >
                        CATEGORIES <i className="fa-solid fa-caret-down"></i>
                    </button>
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li>
                                <Link
                                    to="/categories/luxury"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Luxury Watches
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories/smart"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Smart Watches
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories/fashion"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Fashion Watches
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>

            <div className="navbar-right">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search Collection..."
                    />
                    <i className="fa fa-search"></i>
                </div>
                <div className="menu-icons">
                    <Link to="/notification">
                        <i className="fa fa-bell"></i>
                    </Link>
                    <Link to="/cart">
                        <i className="fa fa-shopping-cart"></i>
                    </Link>
                    <div
                        className={`profile-dropdown ${
                            isProfileOpen ? "open" : ""
                        }`}
                        ref={profileRef}
                    >
                        <button
                            onClick={toggleProfile}
                            className="profile-toggle"
                        >
                            <i className="fa-solid fa-circle-user"></i>
                        </button>
                        {isProfileOpen && (
                            <div className="profile-menu">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
