import React from "react";
import Navbar from "../UserHomePage/Navbar";
import Footer from "../UserHomePage/Footer";

const Home = () => {
    return (
        <div className="home">
            <Navbar />
            <div className="hero-section">
                <h1>Welcome to My Store</h1>
                <p>Discover the best deals on watches.</p>
                <button>Shop Now</button>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
