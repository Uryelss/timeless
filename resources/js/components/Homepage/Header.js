import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import "../../../sass/Header.scss";

// Add the search icon to the library
library.add(fas);

function Header() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Search query:", searchQuery);
        // Add search logic here (e.g., API call or navigation)
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    <span className="logo-text-prefix">P</span>
                    <img src="/logo.svg" alt="Logo" className="logo-image" />
                    <span className="logo-text-suffix">WFECT MATCH</span>
                </div>
                <nav className="nav-menu">
                    <Link to="/" className="nav-item">
                        Home
                    </Link>
                    <Link to="/about" className="nav-item">
                        About
                    </Link>
                    <Link to="/contact" className="nav-item">
                        Contact
                    </Link>
                </nav>
                <div className="search-login">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <FontAwesomeIcon
                            icon={["fas", "search"]}
                            className="search-icon"
                        />
                        <input
                            type="text"
                            placeholder="Search here..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>
                    <Link to="/Login" className="nav-item">
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
