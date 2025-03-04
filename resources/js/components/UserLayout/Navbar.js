import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null); // ✅ Store user data

    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

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

            setUser(response.data); // ✅ Store user data (including profile image & username)
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

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

            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login";
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

            <div
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            <ul className={`navbar-links ${isMenuOpen ? "show" : ""}`}>
                <li>
                    <Link to="/">HOME</Link>
                </li>
                <li>
                    <Link to="/aboutus">ABOUT US</Link>
                </li>
                <li>
                    <Link to="/collection">COLLECTION</Link>
                </li>
                <li
                    className={`dropdown ${isDropdownOpen ? "open" : ""}`}
                    ref={dropdownRef}
                >
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="dropdown-toggle"
                    >
                        CATEGORIES <i className="fa-solid fa-caret-down"></i>
                    </button>
                    {isDropdownOpen && (
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
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="profile-toggle"
                        >
                            {/* ✅ Show profile image if available, otherwise default icon */}
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
                                <Link to="/Profile">Profile</Link>
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ✅ Show username beside the profile picture */}
                    {user && <span className="username">{user.username}</span>}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
