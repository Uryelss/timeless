import React from "react";
import Navbar from "../Userlayout/Navbar";
import Footer from "../Userlayout/Footer";


const AboutUs = () => {
return (
    <div className="about-container">
      <Navbar /> {/* Navbar */}{/* First Section */}
      <div className="about-section">
        <img src="/images/logo.png" alt="Timeless Logo" className="logo" />
        <p className="text">
          Welcome to <strong>TIMELESS</strong>, where passion for timepieces meets the spirit of innovation.
          We are a group of enthusiastic students from <strong>IT32</strong>, united by a common love for watches 
          and a vision to bring quality and style to watch enthusiasts everywhere.
        </p>
      </div>

      {/* Second Section */}
      <div className="about-section">
        <img src="/images/companion-watch.png" alt="Watches Collection" className="about-image" />
        <p className="text">
          As students, we understand the importance of quality at an affordable price, and that's why we've curated 
          a collection that balances both. We are committed to ensuring every watch we offer is crafted with care 
          and precision, so you can find the perfect timepiece that fits your unique style.
        </p>
      </div>
      <Footer /> {/* Footer */}
    </div>
  );
};

export default AboutUs;

