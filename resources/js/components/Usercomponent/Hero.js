import React from "react";
import { Button } from "antd";

const HeroSection = () => {
    return (
        <div className="hero-section">
            <div className="hero-content">
                <h1>Welcome to Our Store</h1>
                <p>Discover the latest trends in luxury, fashion, and smart watches.</p>
                <Button type="primary" className="shop-now-button">
                    Shop Now
                </Button>
            </div>
        </div>
    );
};

export default HeroSection;