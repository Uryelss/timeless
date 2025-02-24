import React from "react";

const products = [
    {
        id: 1,
        title: "Elegant Classic Watch",
        description: "A timeless design with a leather strap and silver dial.",
        rating: 4.5,
        price: "$120",
        image: "/images/elegant-classic-watch.png", // Path to image in public folder
    },
    {
        id: 2,
        title: "Modern Minimalist Watch",
        description: "Sleek and modern design with a black dial and stainless steel strap.",
        rating: 4.7,
        price: "$150",
        image: "/images/modern-minimalist-watch.png", // Path to image in public folder
    },
    {
        id: 3,
        title: "Vintage Retro Watch",
        description: "A vintage-inspired watch with a brown leather strap and gold accents.",
        rating: 4.3,
        price: "$100",
        image: "/images/vintage-retro-watch.png", // Path to image in public folder
    },
    // Add more products as needed
];

const ProductList = () => {
    return (
        <div className="product-list">
            <h2>Table Watches</h2>
            <div className="products">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <img src={product.image} alt={product.title} />
                        <h3>{product.title}</h3>
                        <p>{product.description}</p>
                        <p><strong>Rating:</strong> {product.rating}/5</p>
                        <p><strong>Price:</strong> {product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;