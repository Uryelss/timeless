import React from "react";
import Navbar from "../Usercomponent/Navbar";
import Hero from "../Usercomponent/Hero";
import Footer from "../Usercomponent/Footer"; // Import Footer

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
