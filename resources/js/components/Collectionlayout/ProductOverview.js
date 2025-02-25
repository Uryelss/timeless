import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductDetails from "../Collectionlayout/ProductDetails";
import CollectionFooter from "../Collectionlayout/CollectionFooter";
import CollectionNavbar from "../Collectionlayout/CollectionNavbar";

// Sample product data
const products = [
    {
        id: 1,
        title: "MICHAEL KORS EVEREST CHRONOGRAPH TWO",
        rating: 5,
        price: "₱20,000",
        sizes: [38, 39, 40, 41],
        images: [
            "/images/mk-watch1.png",
            "/images/mk-watch2.png",
            "/images/mk-watch3.png",
            "/images/mk-watch4.png"
        ],
        description: "A luxury watch with a stunning design and premium features."
    },
    {
        id: 2,
        title: "Modern Minimalist Watch",
        rating: 5,
        price: "₱20,000",
        sizes: [38, 39, 40, 41],
        images: [
            "/images/mk-watch1.png",
            "/images/mk-watch2.png",
            "/images/mk-watch3.png",
            "/images/mk-watch4.png"
        ],
        description: "A sleek and modern timepiece perfect for any occasion."
    },
    {
        id: 3,
        title: "Classic Silver Watch",
        rating: 4,
        price: "₱18,500",
        sizes: [38, 39, 40, 41],
        images: [
            "/images/mk-watch1.png",
            "/images/mk-watch2.png",
            "/images/mk-watch3.png",
            "/images/mk-watch4.png"
        ],
        description: "A timeless silver watch with a durable build."
    }
];

const ProductOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find product by ID
    const product = products.find((p) => p.id === parseInt(id));

    // Handle case where product is not found
    if (!product) {
        return <h2 className="error-message">Product not found</h2>;
    }

    // State for selected image and size
    const [selectedImage, setSelectedImage] = useState(product.images[0]);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

    return (
        <div className="product-overview">
            {/* Navbar */}
            <CollectionNavbar />

            {/* Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

            {/* Product Display Section */}
            <div className="product-container">
                {/* Image Section */}
                <div className="image-section">
                    <img className="main-image" src={selectedImage} alt={product.title} />
                    <div className="thumbnails">
                        {product.images.map((img, index) => (
                            <img 
                                key={index} 
                                src={img} 
                                alt="Thumbnail" 
                                onClick={() => setSelectedImage(img)} 
                                className={selectedImage === img ? "active" : ""}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="details-section">
                    <h2>{product.title}</h2>
                    <p className="rating">★★★★★</p>
                    <p className="price"><strong>{product.price}</strong></p>

                    {/* Size Options */}
                    <div className="size-options">
                        <p>Size (mm)</p>
                        {product.sizes.map((size) => (
                            <button 
                                key={size} 
                                className={selectedSize === size ? "selected" : ""} 
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button className="add-to-cart">ADD TO CART</button>
                        <button className="buy-now">BUY NOW</button>
                    </div>
                </div>
            </div>

            {/* Product Description */}
            <div className="product-details">
                <p>{product.description || "No description available"}</p>
            </div>

            {/* Additional Product Details */}
            <ProductDetails />

            {/* Footer */}
            <CollectionFooter />
        </div>
    );
};

export default ProductOverview;


