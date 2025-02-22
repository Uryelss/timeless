import React from "react";

const Navbar = () => {
    return (
        <nav className="navbar">
            {/* Left Side: Logo */}
            <div className="navbar-logo">
                <img src="\img\logo (1).png" />
            </div>

            {/* Center: Navigation Links */}
            <ul className="navbar-links">
                <li>
                    <a href="#">HOME</a>
                </li>
                <li>
                    <a href="#">ABOUT</a>
                </li>
                <li>
                    <a href="#">COLLECTION</a>
                </li>
                <li>
                    <a href="#">
                        CATEGORIES <i className="fa-solid fa-caret-down"></i>
                    </a>
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
