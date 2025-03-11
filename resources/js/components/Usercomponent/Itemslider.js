import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import BrandSlider from "../Usercomponent/Brandslider";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const ItemSlider = () => {
  const mensWatchImages = ["Slider1.png", "Slider2.png", "Slider3.png", "Slider4.png", "Slider5.png"];
  const womensWatchImages = ["Womenrolex.png", "Womenomega.png", "Womentaghuer.png", "Womentissot.png", "Womencasio.png"];

  // Watch categories with multiple images for hover effect
  const watchCategories = {
    luxury: ["luxurywatch.png", "luxurywatch2.png", "luxurywatch3.png"],
    fashion: ["fashion1.png", "fashion2.png", "fashion3.png"],
    smart: ["smartwatch1.png", "smartwatch2.png", "smartwatch3.png"]
  };

  // State to track hover for each category
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <div className="item-slider-section">
      {/* Men's Watches Slider */}
      <div className="item-slider">
        <Link to="/collection" className="slider-title-link">
          <h2 className="slider-title">Men's Watches</h2>
        </Link>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={4}
          navigation
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop={true}
          speed={100}
        >
          {mensWatchImages.map((image, index) => (
            <SwiperSlide key={index}>
              <Link to="/collection">
                <img src={`/images/${image}`} alt={`Men's Watch ${index + 1}`} className="slider-image" />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Centered BrandSlider */}
      <div className="brand-slider-container">
        <BrandSlider />
      </div>

      {/* Women's Watches Slider */}
      <div className="item-slider">
        <Link to="/collection" className="slider-title-link">
          <h2 className="slider-title">Women's Watches</h2>
        </Link>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={4}
          navigation
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop={true}
          speed={800}
        >
          {womensWatchImages.map((image, index) => (
            <SwiperSlide key={index}>
              <Link to="/collection">
                <img src={`/images/${image}`} alt={`Women's Watch ${index + 1}`} className="slider-image" />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Large Category Slider with Hover Effect */}
      <div className="large-item-slider">
        <h2 className="slider-title">Explore Our Collections</h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 2500, disableOnInteraction: false }} // Main collection autoplay
          loop={true}
          speed={1000}
        >
          {Object.entries(watchCategories).map(([category, images]) => (
            <SwiperSlide key={category}>
              <div 
                className={`large-slide ${category}-slider`}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Swiper
                  modules={[]} // Removed Autoplay
                  spaceBetween={20}
                  slidesPerView={hoveredCategory === category ? 3 : 1} // Show 3 slides on hover, 1 normally
                  loop={true}
                  speed={800}
                >
                  {images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <Link to="/collection">
                        <img src={`/images/${image}`} alt={`${category} Watch`} className="large-slider-image" />
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <h3 className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)} Watches</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ItemSlider;
