import React from "react";
import Header from "../Usercomponent/Header";
import Hero from "../Usercomponent/Hero"
import ItemSlider from "../Usercomponent/Itemslider";
import Footer from "../Usercomponent/Footer";

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