import React, { useState, useEffect } from "react";
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

    useEffect(() => {
        fetchProducts();
        fetchFilters(); // ✅ Fetch filter options from Admin Settings
    }, []);

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

    const fetchFilters = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/admin-settings"
            ); // ✅ No need for Authorization header
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

    const handleFilterChange = (category, value) => {
        setFilters((prev) => ({
            ...prev,
            [category]: prev[category].includes(value)
                ? prev[category].filter((item) => item !== value)
                : [...prev[category], value],
        }));
    };

    const filteredProducts = products.filter((product) => {
        return (
            (filters.brand.length === 0 ||
                filters.brand.includes(product.brand)) &&
            (filters.gender.length === 0 ||
                filters.gender.includes(product.gender)) &&
            (filters.movement.length === 0 ||
                filters.movement.includes(product.movement)) &&
            (filters.strapMaterial.length === 0 ||
                filters.strapMaterial.includes(product.strap_material))
        );
    });

    return (
        <div className="collection-page">
            <Navbar />

            <div className="collection-image-box"></div>

            <div className="main-content">
                <div className="filters">
                    <h3>FILTER</h3>

                    {/* ✅ Dynamic Brands Filter */}
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

                    {/* ✅ Dynamic Genders Filter */}
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

                    {/* ✅ Dynamic Movement Filter */}
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

                    {/* ✅ Dynamic Strap Material Filter */}
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
                        APPLY
                    </button>
                </div>

                <div className="products-section">
                    <div className="search-sort">
                        <div className="search-input">
                            <input type="text" placeholder="Q" />
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

                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="product-card">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) =>
                                        (e.target.src = "/default-product.png")
                                    }
                                />
                                <h3>{product.name}</h3>
                                <p>₱{product.price}</p>
                                <div className="product-footer">
                                    <span className="rating">★★★★☆ 4.5</span>
                                    <i className="fa fa-shopping-cart" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pagination"></div>
                </div>
            </div>

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
