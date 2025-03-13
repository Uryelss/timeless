import React, { useState, useEffect } from "react";
import {
    Layout,
    Card,
    Checkbox,
    Button,
    Input,
    Select,
    Space,
    message,
    Rate,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";
import BrandSlider from "../UserHome/BrandSlider";

const { Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

const Collection = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        brand: [],
        gender: [],
        movement: [],
        strapMaterial: [],
    });
    const [filterOptions, setFilterOptions] = useState({
        brand: [],
        gender: [],
        movement: [],
        strapMaterial: [],
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");

    const PRODUCTS_API = "http://localhost:8000/api/products/public";
    const SUBCATEGORIES_API = "http://localhost:8000/api/sub-categories/public";

    const isLoggedIn = Boolean(localStorage.getItem("token"));

    const fetchProducts = () => {
        axios
            .get(PRODUCTS_API)
            .then((res) => {
                console.log("Fetched Products Data:", res.data); // Debug log
                setProducts(res.data);
            })
            .catch((err) => {
                message.error("Error fetching products");
                console.error(err);
            });
    };

    const fetchFilterOptions = (type, setter) => {
        axios
            .get(`${SUBCATEGORIES_API}?type=${type}`)
            .then((res) => {
                setter(res.data.map((item) => item.name));
            })
            .catch((err) => {
                console.error(`Error fetching ${type} options`, err);
            });
    };

    useEffect(() => {
        fetchProducts();
        fetchFilterOptions("brand", (data) =>
            setFilterOptions((prev) => ({ ...prev, brand: data }))
        );
        fetchFilterOptions("gender", (data) =>
            setFilterOptions((prev) => ({ ...prev, gender: data }))
        );
        fetchFilterOptions("movement", (data) =>
            setFilterOptions((prev) => ({ ...prev, movement: data }))
        );
        fetchFilterOptions("strap_materials", (data) =>
            setFilterOptions((prev) => ({ ...prev, strapMaterial: data }))
        );
    }, []);

    const handleFilterChange = (category, value) => {
        setFilters((prev) => {
            const updated = prev[category].includes(value)
                ? prev[category].filter((item) => item !== value)
                : [...prev[category], value];
            return { ...prev, [category]: updated };
        });
    };

    const getFilteredProducts = () => {
        let filtered = products.filter((product) => {
            const productBrand = product.brand?.name || product.brand;
            const productGender = product.gender?.name || product.gender;
            const productMovement = product.movement?.name || product.movement;
            const productStrapMaterial =
                product.strapMaterial?.name || product.strapMaterial;

            const matchesBrand =
                filters.brand.length === 0 ||
                filters.brand.includes(productBrand);
            const matchesGender =
                filters.gender.length === 0 ||
                filters.gender.includes(productGender);
            const matchesMovement =
                filters.movement.length === 0 ||
                filters.movement.includes(productMovement);
            const matchesStrapMaterial =
                filters.strapMaterial.length === 0 ||
                filters.strapMaterial.includes(productStrapMaterial);

            return (
                matchesBrand &&
                matchesGender &&
                matchesMovement &&
                matchesStrapMaterial
            );
        });

        if (searchTerm) {
            filtered = filtered.filter((product) =>
                product.product_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        }

        if (sortBy === "priceAsc") {
            filtered.sort(
                (a, b) =>
                    parseFloat(a.price.replace("P", "").replace(/,/g, "")) -
                    parseFloat(b.price.replace("P", "").replace(/,/g, ""))
            );
        } else if (sortBy === "priceDesc") {
            filtered.sort(
                (a, b) =>
                    parseFloat(b.price.replace("P", "").replace(/,/g, "")) -
                    parseFloat(a.price.replace("P", "").replace(/,/g, ""))
            );
        }
        return filtered;
    };

    const clearFilters = () => {
        setFilters({
            brand: [],
            gender: [],
            movement: [],
            strapMaterial: [],
        });
        setSearchTerm("");
        setSortBy("default");
    };

    const filteredProducts = getFilteredProducts();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Navbar />
            <div style={{ margin: "24px" }}>
                <BrandSlider />
            </div>
            <Layout style={{ marginTop: "24px" }}>
                <Sider
                    width={250}
                    style={{
                        background: "#fff",
                        padding: "16px",
                        marginRight: "32px",
                        marginLeft: "24px",
                    }}
                >
                    <div
                        style={{
                            marginBottom: "16px",
                            fontSize: "18px",
                            fontWeight: "bold",
                        }}
                    >
                        FILTER
                    </div>
                    {Object.values(filters).flat().length > 0 && (
                        <div style={{ marginBottom: "16px", color: "#1890ff" }}>
                            {Object.values(filters).flat().join(" > ")}
                        </div>
                    )}
                    <div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>BRAND</h3>
                            <div className="horizontal-checkboxes">
                                {filterOptions.brand.map((brand) => (
                                    <Checkbox
                                        key={brand}
                                        onChange={() =>
                                            handleFilterChange("brand", brand)
                                        }
                                        checked={filters.brand.includes(brand)}
                                    >
                                        {brand}
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>GENDER</h3>
                            <div className="horizontal-checkboxes">
                                {filterOptions.gender.map((gender) => (
                                    <Checkbox
                                        key={gender}
                                        onChange={() =>
                                            handleFilterChange("gender", gender)
                                        }
                                        checked={filters.gender.includes(
                                            gender
                                        )}
                                    >
                                        {gender}
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>MOVEMENT</h3>
                            <div className="horizontal-checkboxes">
                                {filterOptions.movement.map((movement) => (
                                    <Checkbox
                                        key={movement}
                                        onChange={() =>
                                            handleFilterChange(
                                                "movement",
                                                movement
                                            )
                                        }
                                        checked={filters.movement.includes(
                                            movement
                                        )}
                                    >
                                        {movement}
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>STRAP MATERIAL</h3>
                            <div className="horizontal-checkboxes">
                                {filterOptions.strapMaterial.map((material) => (
                                    <Checkbox
                                        key={material}
                                        onChange={() =>
                                            handleFilterChange(
                                                "strapMaterial",
                                                material
                                            )
                                        }
                                        checked={filters.strapMaterial.includes(
                                            material
                                        )}
                                    >
                                        {material}
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                        <Button
                            type="default"
                            style={{
                                width: "100%",
                                background: "#fff",
                                borderColor: "#d9d9d9",
                            }}
                            onClick={clearFilters}
                        >
                            Clear Filter
                        </Button>
                    </div>
                </Sider>

                <Layout style={{ padding: "0 24px 24px" }}>
                    <Content style={{ padding: 24, background: "#fff" }}>
                        <Space
                            style={{
                                marginBottom: "16px",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Search
                                placeholder="Search collections..."
                                onSearch={(value) => setSearchTerm(value)}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Select
                                defaultValue="default"
                                style={{ width: 150 }}
                                onChange={setSortBy}
                            >
                                <Option value="default">Sort By</Option>
                                <Option value="priceAsc">
                                    Price: Low to High
                                </Option>
                                <Option value="priceDesc">
                                    Price: High to Low
                                </Option>
                            </Select>
                        </Space>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(250px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            {filteredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                >
                                    <Card
                                        hoverable
                                        cover={
                                            <img
                                                alt={product.product_name}
                                                src={
                                                    product.main_image
                                                        ? `http://localhost:8000/storage/${product.main_image}`
                                                        : "/placeholder.jpg"
                                                }
                                                style={{
                                                    width: "250px",
                                                    height: "250px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px 8px 0 0",
                                                }}
                                            />
                                        }
                                        style={{ width: 250 }}
                                    >
                                        <Card.Meta
                                            title={product.product_name}
                                            description={
                                                <div>
                                                    <p>
                                                        Price: {product.price}
                                                    </p>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <Rate
                                                            disabled
                                                            value={
                                                                product.average_rating ||
                                                                0
                                                            } // Fallback to 0 if undefined
                                                            allowHalf
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                                marginRight:
                                                                    "8px",
                                                            }}
                                                        />
                                                        <span>
                                                            {product.average_rating ||
                                                                0}
                                                        </span>{" "}
                                                        {/* Fallback to 0 if undefined */}
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <Button
                                            type="link"
                                            icon={<ShoppingCartOutlined />}
                                            disabled={!isLoggedIn}
                                            onClick={() => {
                                                if (!isLoggedIn) {
                                                    message.info(
                                                        "Please log in to add to cart"
                                                    );
                                                }
                                            }}
                                            style={{
                                                padding: 0,
                                                marginTop: "8px",
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default Collection;
