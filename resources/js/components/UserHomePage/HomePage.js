import React from "react";
import Navbar from "../Userlayout/Navbar"; // Import Navbar
import Footer from "../Userlayout/Footer"; // Import Footer

export default function Home() {
    return (
        <div className="home">
            <Navbar /> {/* Navbar */}
            <div className="hero-section">
                  <div className="hero-text">
                    <button className="shop-btn">SHOP NOW</button>
                </div>
            </div>
            <Footer /> {/* Footer */}
        </div>
    );
}
