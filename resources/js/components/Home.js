import React from "react";
import NavList from "./NavList"; // Import Navbar
import Footer from "./Footer"; // Import Footer

export default function Home() {
    return (
        <div className="home">
            <NavList /> {/* Navbar */}
            <div className="hero-section">
                <div className="content">
                    <button className="shop-btn">SHOP NOW</button>
                </div>
            </div>
            <Footer /> {/* Footer */}
        </div>
    );
}
