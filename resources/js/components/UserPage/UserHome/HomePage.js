import React from "react";
import Header from "../Navbar/Navbar";
import Hero from "../UserHome/Hero";
import ItemSlider from "../UserHome/ItemSlider";
import Footer from "../UserHome/Footer";

const UserHome = () => {
    return (
        <div className="user-home">
            <Header />
            <Hero />
            <ItemSlider />
            <Footer />
        </div>
    );
};

export default UserHome;