import React, { useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../UserHome/Footer";
import Flipcard from "../AboutUsPage/Flipcard";

const developers = [
    {
        image: "/images/uriel.png",
        brand: "Uriel Jay Yape",
        description: "Backend & UI Developer",
        Yearlevel: "3rd Year",
    },
    {
        image: "/images/marco.png",
        brand: "Marco Morano",
        description: "UI Developer",
        Yearlevel: "3rd Year",
    },
    {
        image: "/images/mariane.png",
        brand: "Mariane Badong",
        description: "UI Developer",
        Yearlevel: "3rd Year",
    },
    {
        image: "/images/clark.jpg",
        brand: "Clark Magat",
        description: "Full Stack Developer",
        Yearlevel: "3rd Year",
    },
];

const AboutUs = () => {
    useEffect(() => {
        const parallax = document.querySelector(".hero-section");
        const handleScroll = () => {
            let offset = window.scrollY;
            parallax.style.backgroundPositionY = offset * 0.5 + "px";
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="about-us">
            <Navbar />

            {/* Vision & Mission Section */}
            <section className="vision-mission-container fade-in">
                <div className="vision">
                    <h2>
                        Our <span>Vision</span>
                    </h2>
                    <p>
                        At <strong>TIMELESS</strong>, we envision a world where
                        luxury and precision merge seamlessly, providing
                        individuals with timepieces that reflect their style,
                        success, and sophistication.
                    </p>
                </div>
                <div className="mission">
                    <h2>
                        Our <span>Mission</span>
                    </h2>
                    <p>
                        Our mission is to curate and deliver an exclusive
                        selection of premium and luxury watches, ensuring
                        authenticity, craftsmanship, and timeless elegance in
                        every piece we offer.
                    </p>
                </div>
            </section>

            {/* Meet the Developers Section */}
            <section className="meet-developers fade-in delay-5">
                <h2>
                    Meet <span>Our Developers</span>
                </h2>
                <p>
                    We are a team of passionate developers dedicated to creating
                    a seamless and elegant shopping experience.
                </p>
            </section>

            {/* Flip Cards Section - Developers */}
            <div className="flip-card-container fade-in delay-6">
                {developers.map((developer, index) => (
                    <Flipcard key={index} {...developer} />
                ))}
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;
