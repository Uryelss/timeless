import React from "react";
import Marquee from "react-fast-marquee";

const brands = [
    { name: "Rolex", logo: "/images/Rolex.png" },
    { name: "Omega", logo: "/images/Omega.png" },
    { name: "Tag Heuer", logo: "/images/Taghuer.png" },
    { name: "Seiko", logo: "/images/Seiko.png" },
    { name: "Casio", logo: "/images/Casio.png" },
    { name: "Tissot", logo: "/images/Tissot.png" },
];

const BrandSlider = () => {
    return (
        <div className="brand-slider">
            <Marquee speed={10} gradient={false} pauseOnHover={true} loop={0}>
                {brands.map((brand, index) => (
                    <div key={index} className="brand-logo">
                        <img src={brand.logo} alt={brand.name} />
                    </div>
                ))}
                {/* Duplicate items to ensure smooth looping */}
                {brands.map((brand, index) => (
                    <div key={`dup-${index}`} className="brand-logo">
                        <img src={brand.logo} alt={brand.name} />
                    </div>
                ))}
            </Marquee>
        </div>
    );
};

export default BrandSlider;
