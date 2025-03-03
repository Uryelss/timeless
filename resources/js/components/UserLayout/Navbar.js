import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo">
                <img src="Images\logo.png" alt="Logo" />
            </div>

            {/* Mobile Menu Toggle */}
            <div className="menu-toggle" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Navigation Links */}
            <ul className={`navbar-links ${isMenuOpen ? "show" : ""}`}>
                <li>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>
                        HOME
                    </Link>
                </li>
                <li>
                    <Link to="/aboutus" onClick={() => setIsMenuOpen(false)}>
                        ABOUT
                    </Link>
                </li>
                <li>
                    <Link to="/Collection" onClick={() => setIsMenuOpen(false)}>
                        COLLECTION
                    </Link>
                </li>

                {/* Dropdown */}
                <li
                    className={`dropdown ${isDropdownOpen ? "open" : ""}`}
                    ref={dropdownRef}
                >
                    <button
                        onClick={toggleDropdown}
                        className="dropdown-toggle"
                    >
                        CATEGORIES <i className="fa fa-caret-down"></i>
                    </button>
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li>
                                <Link
                                    to="/categories/luxury"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Luxury Watches
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories/smart"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Smart Watches
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories/fashion"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Fashion Watches
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
            </ul>

            {/* Right Side Icons */}
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
                    <Link to="/cart">
                        <i className="fa fa-shopping-cart"></i>
                    </Link>
                    <Link to="/profile">
                        <i className="fa fa-user"></i>
                    </Link>
                    <Link to="/notification">
                        <i className="fa fa-bell"></i>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
