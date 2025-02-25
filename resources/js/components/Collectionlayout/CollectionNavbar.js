import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="navbar">
            {/* Left Side: Logo */}
            <div className="navbar-logo">
                <img src="Images/logo.png" alt="Logo" />
            </div>

            {/* Center: Navigation Links */}
            <ul className="navbar-links">
                <li>
                    <Link to="/">HOME</Link>
                </li>
                <li>
                    <Link to="/about">ABOUT</Link>
                </li>
                <li>
                    <Link to="/collection">COLLECTION</Link>
                </li>
                <li
                    className="dropdown"
                    onMouseEnter={toggleDropdown} // Show the dropdown on hover
                    onMouseLeave={toggleDropdown} // Hide the dropdown on hover out
                >
                    <Link to="#">
                        CATEGORIES <i className="fa-solid fa-caret-down"></i>
                    </Link>
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li>
                                <Link to="/luxury-watches">LUXURY WATCHES</Link>
                            </li>
                            <li>
                                <Link to="/smart-watches">SMART WATCHES</Link>
                            </li>
                            <li>
                                <Link to="/fashion-watches">
                                    FASHION WATCHES
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>

            {/* Right Side: Icons */}
            <div className="navbar-right">
                <div className="icons">
                    <i className="fa-solid fa-bell"></i>
                    <i className="fa-solid fa-cart-shopping"></i>
                    <i className="fa-solid fa-user"></i>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
