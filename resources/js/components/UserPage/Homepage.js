import React from "react";
import Headercomponent from "../UserLayout/Headercomponent"; // ✅ Correct
import Hero from "../UserLayout/Hero";
import FooterComponent from "../UserLayout/Footercomponent";

const Homepage = () => {
    return (
        <>
            <Headercomponent />
            <div>
                <Hero />
            </div>
            <FooterComponent/> {/* Add Footer here */}
        </>
    );
};

export default Homepage;
