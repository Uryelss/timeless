// src/components/AdminProduct.js (or the correct file)

import React, { useState } from "react";
import axios from "axios";

const AdminProduct = () => {
    const [product, setProduct] = useState({
        product_name: "",
        price: "",
        category: "",
        brand: "",
        movement: "",
        strap_material: "",
        gender: "Male",
        size: "",
        image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        setProduct({
            ...product,
            image: e.target.files[0],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage

        if (!token) {
            alert("You are not authenticated. Please log in.");
            return;
        }

        const formData = new FormData();
        formData.append("product_name", product.product_name);
        formData.append("price", product.price);
        formData.append("category", product.category);
        formData.append("brand", product.brand);
        formData.append("movement", product.movement);
        formData.append("strap_material", product.strap_material);
        formData.append("gender", product.gender);
        formData.append("size", product.size);
        formData.append("image", product.image);

        // Send the POST request with the token
        axios
            .post("http://127.0.0.1:8000/api/products", formData, {
                headers: {
                    Authorization: `Bearer ${token}`, // Add token in Authorization header
                    "Content-Type": "multipart/form-data", // Correct content type for file uploads
                },
            })
            .then((response) => {
                alert("Product created successfully!");
                setProduct({
                    product_name: "",
                    price: "",
                    category: "",
                    brand: "",
                    movement: "",
                    strap_material: "",
                    gender: "Male",
                    size: "",
                    image: null,
                });
            })
            .catch((error) => {
                console.error("Error creating product:", error);
                if (error.response && error.response.data.message) {
                    alert(error.response.data.message); // Show backend error message
                }
            });
    };

    return (
        <div className="admin-product">
            <h2>Create Product</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="product_name"
                    placeholder="Product Name"
                    value={product.product_name}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={product.price}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={product.category}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={product.brand}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="movement"
                    placeholder="Movement"
                    value={product.movement}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="strap_material"
                    placeholder="Strap Material"
                    value={product.strap_material}
                    onChange={handleChange}
                />
                <select
                    name="gender"
                    value={product.gender}
                    onChange={handleChange}
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <input
                    type="text"
                    name="size"
                    placeholder="Size"
                    value={product.size}
                    onChange={handleChange}
                />
                <input type="file" name="image" onChange={handleFileChange} />
                <button type="submit">Create Product</button>
            </form>
        </div>
    );
};

export default AdminProduct;
