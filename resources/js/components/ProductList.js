import React, { useEffect, useState } from "react";

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch products from the backend API
        fetch("http://http://127.0.0.1:8000/api/products")
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    return (
        <div>
            <h1>Product List</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <h3>{product.product_name}</h3>
                        <p>{product.price}</p>
                        <img
                            src={`storage/${product.product_image}`}
                            alt={product.product_name}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
