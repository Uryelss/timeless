import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Allows navigation to Product Overview
import axios from "axios";
import Navbar from "../UserLayout/Navbar";

const CollectionPage = () => {
    const [products, setProducts] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        genders: [],
        movements: [],
        strapMaterials: [],
    });
    const [filters, setFilters] = useState({
        brand: [],
        gender: [],
        movement: [],
        strapMaterial: [],
    });
    const [searchTerm, setSearchTerm] = useState(""); // ✅ Search functionality

    useEffect(() => {
        fetchProducts();
        fetchFilters();
    }, []);

    // ✅ Fetch Active Products (make sure API returns `average_rating`)
    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/store/products"
            );
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // ✅ Fetch Filter Options from Admin Settings
    const fetchFilters = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/admin-settings"
            );
            setFilterOptions({
                brands: response.data.brands.map((brand) => brand.name),
                genders: response.data.genders.map((gender) => gender.name),
                movements: response.data.movements.map(
                    (movement) => movement.name
                ),
                strapMaterials: response.data.strapMaterials.map(
                    (material) => material.name
                ),
            });
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    // ✅ Handle Filter Selection
    const handleFilterChange = (category, value) => {
        setFilters((prev) => ({
            ...prev,
            [category]: prev[category].includes(value)
                ? prev[category].filter((item) => item !== value)
                : [...prev[category], value],
        }));
    };

    // ✅ Filter Products Based on Selected Filters
    const filteredProducts = products.filter((product) => {
        return (
            (filters.brand.length === 0 ||
                filters.brand.includes(product.brand)) &&
            (filters.gender.length === 0 ||
                filters.gender.includes(product.gender)) &&
            (filters.movement.length === 0 ||
                filters.movement.includes(product.movement)) &&
            (filters.strapMaterial.length === 0 ||
                filters.strapMaterial.includes(product.strap_material)) &&
            (searchTerm === "" ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <div className="collection-page">
            <Navbar />

            {/* ✅ Hero Image */}
            <div className="collection-image-box"></div>

            <div className="main-content">
                {/* ✅ Filter Section */}
                <div className="filters">
                    <h3>FILTER</h3>

                    {/* ✅ Brand Filter */}
                    <div>
                        <h4>BRAND</h4>
                        {filterOptions.brands.map((brand) => (
                            <label key={brand}>
                                <input
                                    type="checkbox"
                                    value={brand}
                                    checked={filters.brand.includes(brand)}
                                    onChange={() =>
                                        handleFilterChange("brand", brand)
                                    }
                                />
                                {brand}
                            </label>
                        ))}
                    </div>

                    {/* ✅ Gender Filter */}
                    <div>
                        <h4>GENDER</h4>
                        {filterOptions.genders.map((gender) => (
                            <label key={gender}>
                                <input
                                    type="checkbox"
                                    value={gender}
                                    checked={filters.gender.includes(gender)}
                                    onChange={() =>
                                        handleFilterChange("gender", gender)
                                    }
                                />
                                {gender}
                            </label>
                        ))}
                    </div>

                    {/* ✅ Movement Filter */}
                    <div>
                        <h4>MOVEMENT</h4>
                        {filterOptions.movements.map((movement) => (
                            <label key={movement}>
                                <input
                                    type="checkbox"
                                    value={movement}
                                    checked={filters.movement.includes(
                                        movement
                                    )}
                                    onChange={() =>
                                        handleFilterChange("movement", movement)
                                    }
                                />
                                {movement}
                            </label>
                        ))}
                    </div>

                    {/* ✅ Strap Material Filter */}
                    <div>
                        <h4>STRAP MATERIAL</h4>
                        {filterOptions.strapMaterials.map((material) => (
                            <label key={material}>
                                <input
                                    type="checkbox"
                                    value={material}
                                    checked={filters.strapMaterial.includes(
                                        material
                                    )}
                                    onChange={() =>
                                        handleFilterChange(
                                            "strapMaterial",
                                            material
                                        )
                                    }
                                />
                                {material}
                            </label>
                        ))}
                    </div>

                    {/* ✅ Clear Filters Button */}
                    <button
                        onClick={() =>
                            setFilters({
                                brand: [],
                                gender: [],
                                movement: [],
                                strapMaterial: [],
                            })
                        }
                    >
                        CLEAR FILTERS
                    </button>
                </div>

                {/* ✅ Product Listing Section */}
                <div className="products-section">
                    {/* ✅ Search & Sort */}
                    <div className="search-sort">
                        <div className="search-input">
                            <input
                                type="text"
                                placeholder="Search Product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="sort-dropdown">
                            <select>
                                <option>SORT BY</option>
                                <option>Low to High</option>
                                <option>High to Low</option>
                                <option>Best Seller</option>
                                <option>New Arrivals</option>
                                <option>Highest Rated</option>
                            </select>
                            <i className="fa-solid fa-caret-down" />
                        </div>
                    </div>

                    {/* ✅ Display Products */}
                    <div className="products-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="product-card">
                                    {/* ✅ Clicking a product redirects to its overview */}
                                    <Link
                                        to={`/product/${product.id}`}
                                        style={{
                                            textDecoration: "none",
                                            color: "#000",
                                        }}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            onError={(e) =>
                                                (e.target.src =
                                                    "/default-product.png")
                                            }
                                        />
                                        <h3>{product.name}</h3>
                                        <p>₱{product.price}</p>
                                    </Link>

                                    <div className="product-footer">
                                        <span className="rating">
                                            {Array.from(
                                                { length: 5 },
                                                (_, i) => (
                                                    <i
                                                        key={i}
                                                        className={
                                                            i <
                                                            Math.round(
                                                                product.average_rating
                                                            )
                                                                ? "fas fa-star"
                                                                : "far fa-star"
                                                        }
                                                        style={{
                                                            color: "#ffd700",
                                                            marginRight: "2px",
                                                        }}
                                                    />
                                                )
                                            )}
                                            <span
                                                style={{
                                                    marginLeft: "8px",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {product.average_rating}
                                            </span>
                                        </span>
                                        <i className="fa fa-shopping-cart" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No products found.</p>
                        )}
                    </div>

                    {/* ✅ Pagination Placeholder */}
                    <div className="pagination"></div>
                </div>
            </div>

            {/* ✅ Footer */}
            <div className="footer">
                <h1>TIMELESS</h1>
                <div>
                    <h3>SUPPORT</h3>
                    <p>How to Order</p>
                    <p>Modes of Payment</p>
                </div>
            </div>
        </div>
    );
};

export default CollectionPage;
