import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminSettings = () => {
    const [filters, setFilters] = useState({
        brands: [],
        categories: [],
        movements: [],
        strapMaterials: [],
        genders: [],
        sizes: [],
    });

    const [newBrand, setNewBrand] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newMovement, setNewMovement] = useState("");
    const [newStrapMaterial, setNewStrapMaterial] = useState("");
    const [newGender, setNewGender] = useState("");
    const [newSize, setNewSize] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch data on component mount
    const fetchFilters = () => {
        axios
            .get("http://localhost:8000/api/admin-settings", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((response) => {
                if (response.data) {
                    setFilters(response.data);
                } else {
                    setFilters({
                        brands: [],
                        categories: [],
                        movements: [],
                        strapMaterials: [],
                        genders: [],
                        sizes: [],
                    });
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data.");
            });
    };

    useEffect(() => {
        let isMounted = true;
        fetchFilters();

        return () => {
            isMounted = false; // Prevent state update on unmounted component
        };
    }, []);

    // General handler for adding any filter (brands, categories, movements, etc.)
    const handleAddFilter = (type, name, setName) => {
        if (!name) {
            setError(`${type} name cannot be empty.`);
            return;
        }

        setLoading(true);

        axios
            .post(
                `http://localhost:8000/api/add-filter/${type}`,
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            )
            .then(() => {
                setName(""); // Reset input field after successful add
                fetchFilters(); // Refetch data after adding
            })
            .catch((error) => {
                console.error(`Error adding ${type}:`, error);
                setError(`Failed to add ${type}.`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <h1>Admin Settings</h1>

            {/* Brands */}
            <h2>Brands</h2>
            <ul>
                {filters?.brands?.length > 0 ? (
                    filters.brands.map((brand, index) => (
                        <li key={index}>{brand.name}</li>
                    ))
                ) : (
                    <p>No brands available</p>
                )}
            </ul>
            <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Add new brand"
            />
            <button
                onClick={() => handleAddFilter("brand", newBrand, setNewBrand)}
            >
                Add Brand
            </button>

            {/* Categories */}
            <h2>Categories</h2>
            <ul>
                {filters?.categories?.length > 0 ? (
                    filters.categories.map((category, index) => (
                        <li key={index}>{category.name}</li>
                    ))
                ) : (
                    <p>No categories available</p>
                )}
            </ul>
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category"
            />
            <button
                onClick={() =>
                    handleAddFilter("category", newCategory, setNewCategory)
                }
            >
                Add Category
            </button>

            {/* Movements */}
            <h2>Movements</h2>
            <ul>
                {filters?.movements?.length > 0 ? (
                    filters.movements.map((movement, index) => (
                        <li key={index}>{movement.name}</li>
                    ))
                ) : (
                    <p>No movements available</p>
                )}
            </ul>
            <input
                type="text"
                value={newMovement}
                onChange={(e) => setNewMovement(e.target.value)}
                placeholder="Add new movement"
            />
            <button
                onClick={() =>
                    handleAddFilter("movement", newMovement, setNewMovement)
                }
            >
                Add Movement
            </button>

            {/* Strap Materials */}
            <h2>Strap Materials</h2>
            <ul>
                {filters?.strapMaterials?.length > 0 ? (
                    filters.strapMaterials.map((material, index) => (
                        <li key={index}>{material.name}</li>
                    ))
                ) : (
                    <p>No strap materials available</p>
                )}
            </ul>
            <input
                type="text"
                value={newStrapMaterial}
                onChange={(e) => setNewStrapMaterial(e.target.value)}
                placeholder="Add new strap material"
            />
            <button
                onClick={() =>
                    handleAddFilter(
                        "strap-material",
                        newStrapMaterial,
                        setNewStrapMaterial
                    )
                }
            >
                Add Strap Material
            </button>

            {/* Genders */}
            <h2>Genders</h2>
            <ul>
                {filters?.genders?.length > 0 ? (
                    filters.genders.map((gender, index) => (
                        <li key={index}>{gender.name}</li>
                    ))
                ) : (
                    <p>No genders available</p>
                )}
            </ul>
            <input
                type="text"
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
                placeholder="Add new gender"
            />
            <button
                onClick={() =>
                    handleAddFilter("gender", newGender, setNewGender)
                }
            >
                Add Gender
            </button>

            {/* Sizes */}
            <h2>Sizes</h2>
            <ul>
                {filters?.sizes?.length > 0 ? (
                    filters.sizes.map((size, index) => (
                        <li key={index}>{size.name}</li>
                    ))
                ) : (
                    <p>No sizes available</p>
                )}
            </ul>
            <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Add new size"
            />
            <button
                onClick={() => handleAddFilter("size", newSize, setNewSize)}
            >
                Add Size
            </button>

            {error && <p>{error}</p>}
        </div>
    );
};

export default AdminSettings;
