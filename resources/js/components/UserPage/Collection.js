import React, { useState, useEffect } from "react";
import axios from "axios";

const CollectionPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/store/products",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                padding: "20px",
            }}
        >
            {products.map((product) => (
                <div
                    key={product.id}
                    style={{
                        width: 212,
                        height: 257,
                        background: "white",
                        borderRadius: 12,
                        border: "0.50px black solid",
                        padding: "10px",
                        textAlign: "center",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                    }}
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "contain", // ✅ Fix zoom issue
                            borderRadius: "8px",
                            padding: "5px", // ✅ Add padding to give space
                            backgroundColor: "#f8f8f8", // ✅ Light background for contrast
                        }}
                        onError={(e) => (e.target.src = "/default-product.png")} // ✅ Fallback in case image doesn't load
                    />

                    <h3 style={{ fontSize: "16px", marginTop: "10px" }}>
                        {product.name}
                    </h3>
                    <p style={{ fontWeight: "bold", color: "#333" }}>
                        ₱{product.price}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default CollectionPage;
