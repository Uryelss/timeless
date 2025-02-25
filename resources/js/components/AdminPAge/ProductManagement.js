import React, { useState, useEffect } from "react";
import axios from "axios";

const AddProduct = () => {
    const [productData, setProductData] = useState({
        product_name: "",
        product_image: null,
        brand_id: "",
        category_id: "",
        movement_id: "",
        strap_material_id: "",
        gender_id: "",
        size_id: "",
        price: "",
    });

    const [dropdownData, setDropdownData] = useState({
        brands: [],
        categories: [],
        movements: [],
        strapMaterials: [],
        genders: [],
        sizes: [],
    });

    const [products, setProducts] = useState([]); // Store added products for the table

    useEffect(() => {
        fetchProducts(); // ✅ Fetch products when page loads
        axios
            .get("http://localhost:8000/api/products/create", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                console.log("Dropdown Data:", response.data); // ✅ Debugging
                setDropdownData(response.data);
            })
            .catch((error) =>
                console.error("Error fetching dropdown data:", error)
            );
    }, []);

    const fetchDropdownData = () => {
        axios
            .get("http://localhost:8000/api/products/create")
            .then((response) => {
                setDropdownData(response.data);
            })
            .catch((error) =>
                console.error("Error fetching dropdown data:", error)
            );
    };

    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }, // ✅ Ensure token is sent
            })
            .then((response) => {
                console.log("Fetched Products:", response.data); // ✅ Debugging
                setProducts(response.data); // ✅ Update table state
            })
            .catch((error) => console.error("Error fetching products:", error));
    };

    const handleFileChange = (e) => {
        setProductData({ ...productData, product_image: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (const key in productData) {
            formData.append(key, productData[key]);
        }

        axios
            .post("http://localhost:8000/api/products/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Add Token
                },
            })
            .then((response) => {
                alert("Product added successfully!");
                fetchProducts(); // Refresh product table
                setProductData({
                    product_name: "",
                    product_image: null,
                    brand_id: "",
                    category_id: "",
                    movement_id: "",
                    strap_material_id: "",
                    gender_id: "",
                    size_id: "",
                    price: "",
                });
            })
            .catch((error) => {
                console.error("Error adding product:", error);
                alert(
                    "Error: " +
                        (error.response?.data?.message ||
                            "Failed to add product")
                );
            });
    };

    return (
        <div>
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Product Name"
                    value={productData.product_name}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            product_name: e.target.value,
                        })
                    }
                    required
                />

                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                />

                <input
                    type="number"
                    placeholder="Price"
                    value={productData.price}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            price: e.target.value,
                        })
                    }
                    required
                />

                <select
                    value={productData.brand_id}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            brand_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">Select Brand</option>
                    {dropdownData.brands?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    )) || <option disabled>No brands available</option>}
                </select>

                <select
                    value={productData.category_id}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            category_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">Select Category</option>
                    {dropdownData.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select
                    value={productData.movement_id}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            movement_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">Select Movement</option>
                    {dropdownData.movements.map((movement) => (
                        <option key={movement.id} value={movement.id}>
                            {movement.name}
                        </option>
                    ))}
                </select>

                <select
                    value={productData.strap_material_id}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            strap_material_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">Select Strap Material</option>
                    {dropdownData.strapMaterials.map((strap) => (
                        <option key={strap.id} value={strap.id}>
                            {strap.name}
                        </option>
                    ))}
                </select>

                <select
                    value={productData.gender_id}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            gender_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">Select Gender</option>
                    {dropdownData.genders.map((gender) => (
                        <option key={gender.id} value={gender.id}>
                            {gender.name}
                        </option>
                    ))}
                </select>

                <select
                    value={productData.size_id}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            size_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">Select Size</option>
                    {dropdownData.sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                            {size.name}
                        </option>
                    ))}
                </select>

                <button type="submit">Add Product</button>
            </form>

            <h2>Product List</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Movement</th>
                        <th>Strap Material</th>
                        <th>Gender</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                                <img
                                    src={`http://localhost:8000/storage/${product.product_image}`}
                                    alt={product.product_name}
                                    width="50"
                                />
                            </td>
                            <td>{product.product_name}</td>
                            <td>${product.price}</td>
                            <td>{product.brand?.name}</td>
                            <td>{product.category?.name}</td>
                            <td>{product.movement?.name}</td>
                            <td>{product.strap_material?.name || "N/A"}</td>
                            <td>{product.gender?.name}</td>
                            <td>{product.size?.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AddProduct;
