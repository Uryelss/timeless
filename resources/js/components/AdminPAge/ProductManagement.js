import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../AdminLayout/Sidebar";
import ProductTable from "../AdminLayout/ProductTable";

const AdminProduct = () => {
    const [productData, setProductData] = useState({
        product_name: "",
        product_image: null,
        brand_id: "",
        category_id: "",
        movement_id: "",
        strap_material_id: "",
        gender_id: "",
        // Changed from a single size to multiple sizes (array)
        size_ids: [],
        price: "",
        quantity: "",
        description: "",
    });

    const [dropdownData, setDropdownData] = useState({
        brands: [],
        categories: [],
        movements: [],
        strapMaterials: [],
        genders: [],
        sizes: [],
    });

    const [products, setProducts] = useState([]);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [viewArchived, setViewArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchDropdownData();
        fetchArchivedProducts();
    }, []);

    useEffect(() => {
        const filtered = (viewArchived ? archivedProducts : products).filter(
            (product) =>
                product.product_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [products, archivedProducts, viewArchived, searchQuery]);

    const fetchDropdownData = () => {
        axios
            .get("http://localhost:8000/api/products/create", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setDropdownData(response.data))
            .catch((error) =>
                console.error("Error fetching dropdown data:", error)
            );
    };

    const fetchProducts = () => {
        axios
            .get("http://localhost:8000/api/products", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setProducts(response.data))
            .catch((error) => console.error("Error fetching products:", error));
    };

    const fetchArchivedProducts = () => {
        axios
            .get("http://localhost:8000/api/products/archived", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => setArchivedProducts(response.data))
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
            if (key === "product_image") {
                if (
                    productData.product_image &&
                    productData.product_image instanceof File
                ) {
                    formData.append("product_image", productData.product_image);
                }
            } else if (key === "size_ids") {
                productData.size_ids.forEach((sizeId) => {
                    formData.append("size_ids[]", sizeId);
                });
            } else {
                formData.append(key, productData[key]);
            }
        }

        if (!productData.quantity) {
            alert("Quantity is required.");
            return;
        }

        const url = editMode
            ? `http://localhost:8000/api/products/${currentProductId}?_method=PUT`
            : "http://localhost:8000/api/products/store";

        axios
            .post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then(() => {
                alert(
                    editMode
                        ? "Product updated successfully!"
                        : "Product added successfully!"
                );
                fetchProducts();
                fetchArchivedProducts();
                resetForm();
                setShowModal(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                alert(`Failed to ${editMode ? "update" : "add"} product.`);
            });
    };

    const resetForm = () => {
        setProductData({
            product_name: "",
            product_image: null,
            brand_id: "",
            category_id: "",
            movement_id: "",
            strap_material_id: "",
            gender_id: "",
            size_ids: [],
            price: "",
            quantity: "",
            description: "",
        });
        setEditMode(false);
        setCurrentProductId(null);
    };

    const handleEdit = (product) => {
        setProductData({
            product_name: product.product_name,
            product_image: product.product_image,
            brand_id: product.brand?.id,
            category_id: product.category?.id,
            movement_id: product.movement?.id,
            strap_material_id: product.strap_material?.id,
            gender_id: product.gender?.id,
            size_ids: product.sizes
                ? product.sizes.map((s) => s.id.toString())
                : [],
            price: product.price,
            quantity: product.quantity,
            description: product.description,
        });
        setCurrentProductId(product.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleArchive = (productId) => {
        if (window.confirm("Are you sure you want to archive this product?")) {
            axios
                .put(
                    `http://localhost:8000/api/products/${productId}/archive`,
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
                    fetchProducts();
                    fetchArchivedProducts();
                })
                .catch((error) => {
                    console.error("Error archiving product:", error);
                    alert("Failed to archive product.");
                });
        }
    };

    const handleArchiveAll = () => {
        if (selectedProducts.length === 0) {
            alert("Please select products to archive");
            return;
        }
        if (
            window.confirm(
                "Are you sure you want to archive all selected products?"
            )
        ) {
            Promise.all(
                selectedProducts.map((productId) =>
                    axios.put(
                        `http://localhost:8000/api/products/${productId}/archive`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    )
                )
            )
                .then(() => {
                    alert("Products archived successfully!");
                    setSelectedProducts([]);
                    fetchProducts();
                    fetchArchivedProducts();
                })
                .catch((error) => {
                    console.error("Error archiving products:", error);
                    alert("Failed to archive some products.");
                });
        }
    };

    const handleRestore = (productId, fetchProducts, fetchArchivedProducts) => {
        if (window.confirm("Are you sure you want to restore this product?")) {
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
                    fetchProducts();
                    fetchArchivedProducts();
                })
                .catch((error) => {
                    console.error("Error restoring product:", error);
                    alert("Failed to restore product.");
                });
        }
    };

    return (
        <div className="admin-product-container">
            <Sidebar />
            <div className="product-content">
                <h1>Product</h1>
                <div className="product-actions">
                    <div className="search-and-select">
                        <div className="search-container">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search Products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-bar"
                            />
                        </div>
                        <div className="checkbox-actions">
                            <label className="select-all-container">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedProducts(
                                                filteredProducts.map(
                                                    (p) => p.id
                                                )
                                            );
                                        } else {
                                            setSelectedProducts([]);
                                        }
                                    }}
                                    checked={
                                        selectedProducts.length ===
                                            filteredProducts.length &&
                                        filteredProducts.length > 0
                                    }
                                    className="action-checkbox"
                                />
                                Select All
                            </label>
                            {selectedProducts.length ===
                                filteredProducts.length &&
                                !viewArchived && (
                                    <button
                                        className="archive-all-btn"
                                        onClick={handleArchiveAll}
                                    >
                                        <i className="fa-solid fa-box-archive action-icon"></i>
                                    </button>
                                )}
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button onClick={() => setViewArchived(!viewArchived)}>
                            {viewArchived
                                ? "View Active Products"
                                : "View Archived Products"}
                        </button>
                        <button onClick={() => setShowModal(true)}>
                            Add New Product
                        </button>
                    </div>
                </div>
                <ProductTable
                    products={filteredProducts}
                    handleEdit={handleEdit}
                    handleArchive={handleArchive}
                    handleArchiveAll={handleArchiveAll}
                    handleRestore={handleRestore}
                    fetchProducts={fetchProducts}
                    fetchArchivedProducts={fetchArchivedProducts}
                    isArchived={viewArchived}
                    selectedProducts={selectedProducts}
                    setSelectedProducts={setSelectedProducts}
                />
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>
                                {editMode ? "Edit Product" : "Add New Product"}
                            </h2>
                            <form
                                onSubmit={handleSubmit}
                                className="modal-form"
                            >
                                <div className="form-left">
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
                                        className="product-name-input"
                                    />
                                    <div className="price-quantity-row">
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
                                    </div>
                                    <div className="dropdown-row">
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
                                            <option value="">
                                                Select Gender
                                            </option>
                                            {dropdownData.genders.map(
                                                (gender) => (
                                                    <option
                                                        key={gender.id}
                                                        value={gender.id}
                                                    >
                                                        {gender.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        <select
                                            value={
                                                productData.strap_material_id
                                            }
                                            onChange={(e) =>
                                                setProductData({
                                                    ...productData,
                                                    strap_material_id:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select Strap Material
                                            </option>
                                            {dropdownData.strapMaterials.map(
                                                (strap) => (
                                                    <option
                                                        key={strap.id}
                                                        value={strap.id}
                                                    >
                                                        {strap.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="dropdown-row">
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
                                            <option value="">
                                                Select Brand
                                            </option>
                                            {dropdownData.brands.map(
                                                (brand) => (
                                                    <option
                                                        key={brand.id}
                                                        value={brand.id}
                                                    >
                                                        {brand.name}
                                                    </option>
                                                )
                                            )}
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
                                            <option value="">
                                                Select Movement
                                            </option>
                                            {dropdownData.movements.map(
                                                (movement) => (
                                                    <option
                                                        key={movement.id}
                                                        value={movement.id}
                                                    >
                                                        {movement.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div className="dropdown-select">
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
                                            <option value="">
                                                Select Category
                                            </option>
                                            {dropdownData.categories.map(
                                                (category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        {/* Checkboxes for multiple sizes */}
                                        <div className="size-checkbox-group">
                                            <p>Select Sizes:</p>
                                            {dropdownData.sizes.map((size) => (
                                                <label
                                                    key={size.id}
                                                    className="size-checkbox"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={size.id}
                                                        checked={productData.size_ids.includes(
                                                            size.id.toString()
                                                        )}
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                setProductData({
                                                                    ...productData,
                                                                    size_ids: [
                                                                        ...productData.size_ids,
                                                                        e.target
                                                                            .value,
                                                                    ],
                                                                });
                                                            } else {
                                                                setProductData({
                                                                    ...productData,
                                                                    size_ids:
                                                                        productData.size_ids.filter(
                                                                            (
                                                                                id
                                                                            ) =>
                                                                                id !==
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                        ),
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    {size.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        placeholder="Product Description"
                                        value={productData.description}
                                        onChange={(e) =>
                                            setProductData({
                                                ...productData,
                                                description: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-right">
                                    <div className="image-upload-container">
                                        {productData.product_image ? (
                                            <img
                                                src={
                                                    typeof productData.product_image ===
                                                    "string"
                                                        ? `http://localhost:8000/storage/${productData.product_image}`
                                                        : URL.createObjectURL(
                                                              productData.product_image
                                                          )
                                                }
                                                alt="Preview"
                                                className="image-preview"
                                            />
                                        ) : (
                                            <div className="image-placeholder" />
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            id="image-upload"
                                            className="hidden-file-input"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="upload-button"
                                        >
                                            Upload New Image
                                        </label>
                                    </div>
                                    <div className="modal-save">
                                        <button type="submit">
                                            Save Product
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProduct;
