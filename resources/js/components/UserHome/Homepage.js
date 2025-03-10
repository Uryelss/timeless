import React from "react";
import Header from "../Usercomponent/Header";
import Hero from "../Usercomponent/Hero"; // Import the HeroSection component
import Footer from "../Usercomponent/Footer";

const UserHome = () => {
    return (
        <div className="user-home">
            
            <Header />
            <Hero />
            <Footer />
        </div>
      
    );
};  

export default UserHome;