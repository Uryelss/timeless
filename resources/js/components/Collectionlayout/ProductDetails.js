import React, { useState } from "react";

const ProductDetails = () => {
    const [activeTab, setActiveTab] = useState("details");

    return (
        <div className="product-details">
            {/* Tabs Section */}
            <div className="tabs">
                <button 
                    className={activeTab === "details" ? "active" : ""}
                    onClick={() => setActiveTab("details")}
                >
                    PRODUCT DETAILS
                </button>
                <button 
                    className={activeTab === "reviews" ? "active" : ""}
                    onClick={() => setActiveTab("reviews")}
                >
                    REVIEWS & RATINGS
                </button>
            </div>

            {/* Content Based on Active Tab */}
            <div className="details-content">
                {activeTab === "details" ? (
                    <div>
                        <h3><strong>Elegant Design</strong></h3>
                        <p>A stunning blue dial with classic Roman numeral hour markers, enclosed in a stainless steel case (39.8mm width, 9.08mm thickness).</p>

                        <h3><strong>Superior Craftsmanship</strong></h3>
                        <p>Powered by the Cartier Caliber 1847 MC self-winding automatic movement, ensuring precision and a 42-hour power reserve.</p>

                        <h3><strong>Premium Comfort & Versatility</strong></h3>
                        <p>Comes with both a stainless steel bracelet featuring Cartier’s SmartLink adjustment system and a navy blue calfskin leather strap with QuickSwitch technology for effortless customization.</p>

                        <h3><strong>Luxury Meets Functionality</strong></h3>
                        <p>Includes a date display at 6 o’clock, a scratch-resistant sapphire crystal, and a seven-sided crown set with a synthetic spinel for a distinctive touch.</p>

                        <h3><strong>Water Resistance</strong></h3>
                        <p>Designed for everyday wear, the watch is water-resistant up to 100 meters (330 feet), making it perfect for any occasion.</p>
                    </div>
                ) : (
                    <div>
                        <h3>REVIEWS & RATINGS</h3>
                        <p>⭐⭐⭐⭐☆ 4 Out of 5</p>

                        {/* Example Review */}
                        <div className="review">
                            <img src="/images/user-avatar.png" alt="User Avatar" className="avatar" />
                            <div className="review-content">
                                <strong>DONKEY</strong> <span>⭐⭐⭐⭐⭐</span>
                                <p>THIS WATCH IS VERY GOOD</p>
                            </div>
                        </div>

                        {/* Review Form */}
                        <div className="review-form">
                            <label>COMMENT</label>
                            <textarea placeholder="Write your review..."></textarea>
                            <button className="submit-button">Send Review</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;

