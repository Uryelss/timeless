import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const profileRef = useRef(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };
    const handleLogout = async () => {
        // Save the token before removing it
        const token = localStorage.getItem("token");

        // Immediately remove token and clear any related state
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null); // Clear user state if necessary

        // Navigate immediately to login page
        navigate("/login");

        // Optionally, make the logout API call in the background
        try {
            await axios.post(
                "http://localhost:8000/api/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally, handle the error (e.g., show a notification)
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleCategories = () => {
        setIsCategoriesOpen(!isCategoriesOpen);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo (no wrapping <Link> to ensure it's the only logo) */}
                <div className="navbar-logo">
                    <img
                        src="Images/logo.png"
                        alt="Logo"
                        className="logo-image"
                    />
                </div>

                {/* Navigation Links */}
                <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
                    <ul>
                        <li>
                            <Link to="/homepage">HOME</Link>
                        </li>
                        <li>
                            <Link to="/aboutus">ABOUT US</Link>
                        </li>
                        <li>
                            <Link to="/collection">COLLECTION</Link>
                        </li>
                        <li className="dropdown" onClick={toggleCategories}>
                            <Link to="#">
                                CATEGORIES{" "}
                                <i className="fa-solid fa-caret-down"></i>
                            </Link>
                            {isCategoriesOpen && (
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link to="/categories/luxury">
                                            Luxury Watches
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/categories/smart">
                                            Smart Watches
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/categories/fashion">
                                            Fashion Watches
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>

                {/* Search Bar */}
                <div className="navbar-search">
                    <input
                        type="text"
                        placeholder="Search Collection..."
                        className="search-input"
                    />
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>

                {/* User Icons and Profile */}
                <div className="navbar-user">
                    <i className="fa-solid fa-bell"></i>
                    <i className="fa-solid fa-cart-shopping"></i>
                    <div
                        className={`navbar-profile ${
                            isProfileOpen ? "open" : ""
                        }`}
                        ref={profileRef}
                    >
                        <button
                            onClick={toggleProfile}
                            className="profile-toggle"
                        >
                            {user?.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt="Profile"
                                    className="profile-img"
                                />
                            ) : (
                                <i className="fa-solid fa-circle-user default-icon"></i>
                            )}
                        </button>
                        {isProfileOpen && (
                            <div className="profile-menu">
                                <Link to="/profile">Profile</Link>
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                        {user && (
                            <span className="username">{user.username}</span>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle Button */}
                <div className="navbar-toggle" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
