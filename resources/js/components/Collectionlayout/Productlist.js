import React, { useState } from "react";
import { Link } from "react-router-dom";

const products = [
    {
        id: 1,
        title: "Elegant Classic Watch",
        description: "A timeless design with a leather strap and silver dial.",
        rating: 4.5,
        price: "$120",
        image: "/images/elegant-classic-watch.png",
    },
    {
        id: 2,
        title: "Modern Minimalist Watch",
        description:
            "Sleek and modern design with a black dial and stainless steel strap.",
        rating: 4.7,
        price: "$150",
        image: "/images/modern-minimalist-watch.png",
    },
    {
        id: 3,
        title: "Vintage Retro Watch",
        description:
            "A vintage-inspired watch with a brown leather strap and gold accents.",
        rating: 4.3,
        price: "$100",
        image: "/images/vintage-retro-watch.png",
    },
    {
        id: 4,
        title: "Vintage Retro Watch",
        description:
            "A vintage-inspired watch with a brown leather strap and gold accents.",
        rating: 4.3,
        price: "$100",
        image: "/images/vintage-retro-watch.png",
    },
    {
        id: 5,
        title: "Vintage Retro Watch",
        description:
            "A vintage-inspired watch with a brown leather strap and gold accents.",
        rating: 4.3,
        price: "$100",
        image: "/images/vintage-retro-watch.png",
    },
];

const ProductList = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // Filter products based on the search term
    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            {/* Product List */}
            <div className="product-list">
                <div className="product-header">
                    <h2>WATCHES</h2>
                </div>
                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search..."
                        value={searchTerm} // Bind searchTerm to the input value
                        onChange={handleSearch} // Update searchTerm on input change
                    />
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>

                {/* Product Cards */}
                <div className="products">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="product-card">
                                <Link to={`/product/${product.id}`}>
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                    />
                                </Link>
                                <h3>{product.title}</h3>
                                <p>{product.description}</p>
                                <p>
                                    <strong>Rating:</strong> {product.rating}/5
                                </p>
                                <p>
                                    <strong>Price:</strong> {product.price}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No products found</p> // Message if no products match the search
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
