import React from "react";
import Navbar from "../UserLayout/Navbar"; // ✅ Correct
import Hero from "../UserLayout/Hero";
import Footer from "../UserLayout/Footer";

const Homepage = () => {
    return (
        <>
            <Navbar />
            <div>
                <Hero />
            </div>
            <Footer /> {/* Add Footer here */}
        </>
    );
};

export default Homepage;
