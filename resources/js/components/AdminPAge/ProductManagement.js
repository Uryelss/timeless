import React, { useState, useEffect } from "react";
import axios from "axios";

const AddProduct = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const openEditModal = (product) => {
        setEditProduct({
            ...product,
            brand_id: product.brand?.id || "",
            category_id: product.category?.id || "",
            movement_id: product.movement?.id || "",
            strap_material_id: product.strap_material?.id || "",
            gender_id: product.gender?.id || "",
            size_id: product.size?.id || "",
        });
        setIsEditing(true);
    };

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
        quantity: "",
    });

    const [dropdownData, setDropdownData] = useState({
        brands: [],
        categories: [],
        movements: [],
        strapMaterials: [],
        genders: [],
        sizes: [],
    });

    const [products, setProducts] = useState([]); // ✅ Active products state

    const [archivedProducts, setArchivedProducts] = useState([]); // ✅ Add this for archived products

    useEffect(() => {
        fetchProducts(); // ✅ Fetch both active and archived products
    }, []);

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

    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                console.log("Fetched Products:", response.data);
                setProducts(response.data); // ✅ Active products
            })
            .catch((error) => console.error("Error fetching products:", error));

        axios
            .get("http://localhost:8000/api/products/archived", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                console.log("Fetched Archived Products:", response.data);
                setArchivedProducts(response.data); // ✅ Store archived products
            })
            .catch((error) =>
                console.error("Error fetching archived products:", error)
            );
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
            .then(() => {
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
                    quantity: "",
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

    // ✅ Move handleEdit function outside handleSubmit
    const handleUpdate = () => {
        if (!editProduct) return;

        const updatedProduct = {
            product_name: editProduct.product_name,
            brand_id: editProduct.brand?.id,
            category_id: editProduct.category?.id,
            movement_id: editProduct.movement?.id,
            strap_material_id: editProduct.strap_material?.id,
            gender_id: editProduct.gender?.id,
            size_id: editProduct.size?.id,
            price: parseFloat(editProduct.price),
            quantity: parseInt(editProduct.quantity),
        };

        axios
            .put(
                `http://localhost:8000/api/products/${editProduct.id}`,
                updatedProduct,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                alert("Product updated successfully!");
                setIsEditing(false);
                fetchProducts(); // Refresh the product list
            })
            .catch((error) => {
                console.error("Error updating product:", error);
                alert(
                    "Update failed: " +
                        (error.response?.data?.errors
                            ? JSON.stringify(error.response.data.errors)
                            : "Unknown error")
                );
            });
    };

    // ✅ Move handleArchive function outside handleSubmit
    const handleArchive = (id) => {
        axios
            .delete(`http://localhost:8000/api/products/${id}/archive`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then(() => {
                alert("Product archived successfully!");
                fetchProducts();
            })
            .catch((error) => console.error("Error archiving product:", error));
    };

    // ✅ Move handleRestore function outside handleSubmit
    const handleRestore = (id) => {
        axios
            .put(
                `http://localhost:8000/api/products/${id}/restore`,
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
                fetchProducts(); // ✅ Refresh product list after restoring
            })
            .catch((error) => console.error("Error restoring product:", error));
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
                            <td>{product.quantity}</td>
                            <td>{product.brand?.name}</td>
                            <td>{product.category?.name}</td>
                            <td>{product.movement?.name}</td>
                            <td>{product.strap_material?.name || "N/A"}</td>
                            <td>{product.gender?.name}</td>
                            <td>{product.size?.name}</td>
                            <td>
                                <button onClick={() => openEditModal(product)}>
                                    {" "}
                                    Update{" "}
                                </button>
                                <button
                                    onClick={() => handleArchive(product.id)}
                                >
                                    {" "}
                                    Archive{" "}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Archived Products</h2>
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
                    {archivedProducts.length > 0 ? (
                        archivedProducts.map((product) => (
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
                                <td>{product.strap_material?.name || "N/A"}</td>
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No archived products</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {isEditing && (
                <div className="modal">
                    <h2>Edit Product</h2>

                    {/* Product Name */}
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={editProduct.product_name}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                product_name: e.target.value,
                            })
                        }
                    />

                    {/* Price */}
                    <input
                        type="number"
                        placeholder="Price"
                        value={editProduct.price}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                price: e.target.value,
                            })
                        }
                    />

                    {/* Quantity */}
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={editProduct.quantity}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                quantity: e.target.value,
                            })
                        }
                    />

                    {/* Brand Dropdown */}
                    <select
                        value={editProduct.brand_id}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                brand_id: e.target.value,
                            })
                        }
                    >
                        <option value="">Select Brand</option>
                        {dropdownData.brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>

                    {/* Category Dropdown */}
                    <select
                        value={editProduct.category_id}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                category_id: e.target.value,
                            })
                        }
                    >
                        <option value="">Select Category</option>
                        {dropdownData.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    {/* Movement Dropdown */}
                    <select
                        value={editProduct.movement_id}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                movement_id: e.target.value,
                            })
                        }
                    >
                        <option value="">Select Movement</option>
                        {dropdownData.movements.map((movement) => (
                            <option key={movement.id} value={movement.id}>
                                {movement.name}
                            </option>
                        ))}
                    </select>

                    {/* Strap Material Dropdown */}
                    <select
                        value={editProduct.strap_material_id}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                strap_material_id: e.target.value,
                            })
                        }
                    >
                        <option value="">Select Strap Material</option>
                        {dropdownData.strapMaterials.map((strap) => (
                            <option key={strap.id} value={strap.id}>
                                {strap.name}
                            </option>
                        ))}
                    </select>

                    {/* Gender Dropdown */}
                    <select
                        value={editProduct.gender_id}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                gender_id: e.target.value,
                            })
                        }
                    >
                        <option value="">Select Gender</option>
                        {dropdownData.genders.map((gender) => (
                            <option key={gender.id} value={gender.id}>
                                {gender.name}
                            </option>
                        ))}
                    </select>

                    {/* Size Dropdown */}
                    <select
                        value={editProduct.size_id}
                        onChange={(e) =>
                            setEditProduct({
                                ...editProduct,
                                size_id: e.target.value,
                            })
                        }
                    >
                        <option value="">Select Size</option>
                        {dropdownData.sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                                {size.name}
                            </option>
                        ))}
                    </select>

                    {/* Save & Cancel Buttons */}
                    <button onClick={handleUpdate}>Save Changes</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default AddProduct;
