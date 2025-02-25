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
        fetchProducts(); // Fetch products on page load
        fetchDropdownData(); // Fetch dropdown data on page load
    }, []);

    // Fetch dropdown filter options (brands, categories, etc.)
    const fetchDropdownData = () => {
        axios
            .get("http://localhost:8000/api/products/create", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                setDropdownData(response.data);
            })
            .catch((error) =>
                console.error("Error fetching dropdown data:", error)
            );
    };

    // Fetch all products
    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => console.error("Error fetching products:", error));
    };

    // Handle image file selection
    const handleFileChange = (e) => {
        setProductData({ ...productData, product_image: e.target.files[0] });
    };

    // Handle adding a new product
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();

        for (const key in productData) {
            if (
                key === "product_image" &&
                productData[key] === null &&
                !editMode
            ) {
                alert("Please select an image.");
                return; // ✅ Prevent adding a product without an image
            }

            if (!(key === "product_image" && productData[key] === null)) {
                formData.append(key, productData[key]);
            }
        }

        if (!productData.quantity) {
            alert("Quantity is required."); // ✅ Prevent empty quantity
            return;
        }

        if (editMode) {
            axios
                .post(
                    `http://localhost:8000/api/products/${currentProductId}?_method=PUT`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                .then(() => {
                    alert("Product updated successfully!");
                    fetchProducts();
                    resetForm();
                })
                .catch((error) => {
                    console.error("Error updating product:", error);
                    alert("Failed to update product.");
                });
        } else {
            axios
                .post("http://localhost:8000/api/products/store", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                })
                .then(() => {
                    alert("Product added successfully!");
                    fetchProducts();
                    resetForm();
                })
                .catch((error) => {
                    console.error("Error adding product:", error);
                    alert("Failed to add product.");
                });
        }
    };

    // ✅ Reset form after adding/updating
    const resetForm = () => {
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
            quantity: "",
        });
        setEditMode(false);
        setCurrentProductId(null);
    };

    const [editMode, setEditMode] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);

    // Handle updating a product quantity
    const handleEdit = (product) => {
        setProductData({
            product_name: product.product_name,
            product_image: null, // Image is not updated immediately
            brand_id: product.brand?.id,
            category_id: product.category?.id,
            movement_id: product.movement?.id,
            strap_material_id: product.strap_material?.id,
            gender_id: product.gender?.id,
            size_id: product.size?.id,
            price: product.price,
            quantity: product.quantity,
        });
        setCurrentProductId(product.id);
        setEditMode(true);
    };
    const [archivedProducts, setArchivedProducts] = useState([]); // ✅ Store archived products

    // Handle archiving a product
    const handleArchive = (productId) => {
        axios
            .put(
                `http://localhost:8000/api/products/${productId}/archive`, // ✅ Use PUT
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Product archived successfully!");
                fetchProducts(); // ✅ Refresh product list
                fetchArchivedProducts(); // ✅ Refresh archived list
            })
            .catch((error) => {
                console.error("Error archiving product:", error);
                alert("Failed to archive product.");
            });
    };

    // ✅ Move handleRestore function outside handleSubmit
    const handleRestore = (productId) => {
        axios
            .put(
                `http://localhost:8000/api/products/${productId}/restore`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Product restored successfully!");
                fetchProducts(); // ✅ Refresh active products
                fetchArchivedProducts(); // ✅ Refresh archived list
            })
            .catch((error) => {
                console.error("Error restoring product:", error);
                alert("Failed to restore product.");
            });
    };

    const fetchArchivedProducts = () => {
        axios
            .get("http://localhost:8000/api/products/archived", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                setArchivedProducts(response.data); // ✅ Store archived products
            })
            .catch((error) =>
                console.error("Error fetching archived products:", error)
            );
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
                    required={!editMode} // ✅ Required only when adding, not when updating
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
                <input
                    type="number"
                    placeholder="Quantity"
                    value={productData.quantity}
                    onChange={(e) =>
                        setProductData({
                            ...productData,
                            quantity: e.target.value,
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

                <button type="submit">
                    {editMode ? "Update Product" : "Add Product"}
                </button>
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
                        <th>Quantity</th>
                        <th>Actions</th>
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
                            <td>{product.quantity}</td>
                            <td>
                                <button onClick={() => handleEdit(product)}>
                                    Edit
                                </button>
                                {!product.is_archived ? (
                                    <button
                                        onClick={() =>
                                            handleArchive(product.id)
                                        }
                                    >
                                        Archive
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleRestore(product.id)
                                        }
                                    >
                                        Restore
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={fetchArchivedProducts}>
                View Archived Products
            </button>

            <h2>Archived Products</h2>
            {archivedProducts.length === 0 ? (
                <p>No archived products found.</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Movement</th>
                            <th>Strap Material</th>
                            <th>Gender</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {archivedProducts.map((product) => (
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
                                <td>{product.quantity}</td>
                                <td>{product.brand?.name}</td>
                                <td>{product.category?.name}</td>
                                <td>{product.movement?.name}</td>
                                <td>{product.strapMaterial?.name}</td>
                                <td>{product.gender?.name}</td>
                                <td>{product.size?.name}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleRestore(product.id)
                                        }
                                    >
                                        Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AddProduct;
