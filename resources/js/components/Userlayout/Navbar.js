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
                    <Link to="/aboutus">ABOUT</Link>
                </li>
                <li>
                    <Link to="/collection">COLLECTION</Link>
                </li>
                <li 
                    className="dropdown"
                    onClick={toggleDropdown} // Now toggles on click
                >
                    <Link to="#">
                        CATEGORIES <i className="fa-solid fa-caret-down"></i>
                    </Link>
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li><Link to="/categories/luxury">Luxury Watches</Link></li>
                            <li><Link to="/categories/smart">Smart Watches</Link></li>
                            <li><Link to="/categories/fashion">Fashion Watches</Link></li>
                        </ul>
                    )}
                </li>
            </ul>

            {/* Right Side: Search Bar & Icons */}
            <div className="navbar-right">
                <div className="search-container">
                    <input type="text" className="search-bar" placeholder="Search..." />
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>
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


