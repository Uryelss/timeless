import React from "react";
import { Link } from "react-router-dom";


const Navbar = () => {
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
                <li>
                    <Link to="/categories">
                        CATEGORIES <i className="fa-solid fa-caret-down"></i>
                    </Link>
                </li>
            </ul>

            {/* Right Side: Search Bar & Icons */}
            <div className="navbar-right">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                    />
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
