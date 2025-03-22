import React from "react";

const Hero = () => {
    return (
        <div className="hero-container">
            <img
                src="/images/lapse3.png"
                alt="Timeless Watches"
                className="hero-image"
            />
            <div className="hero-overlay">
                <h1 className="hero-text">TIMELESS</h1>
                <a href="/collection" className="hero-button">
                    Shop Now
                </a>
            </div>
        </div>
    );
};

export default Hero;
