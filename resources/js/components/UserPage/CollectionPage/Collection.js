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
    Modal,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
    const [filterKey, setFilterKey] = useState(0);
    const [showAddToCartModal, setShowAddToCartModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [modalCurrentMainImage, setModalCurrentMainImage] = useState("");
    const [modalSelectedSize, setModalSelectedSize] = useState(null);

    const PRODUCTS_API = "http://localhost:8000/api/products/public";
    const SUBCATEGORIES_API = "http://localhost:8000/api/sub-categories/public";
    const isLoggedIn = Boolean(localStorage.getItem("token"));
    const navigate = useNavigate();

    const fetchProducts = () => {
        axios
            .get(PRODUCTS_API)
            .then((res) => {
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
                if (type === "strap_materials") {
                    setter(res.data);
                } else {
                    setter(res.data.map((item) => item.name));
                }
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
        setFilterKey((prev) => prev + 1);
    };

    const getDisplayFilters = () => {
        const displays = [];
        Object.keys(filters).forEach((key) => {
            if (filters[key].length > 0) {
                filters[key].forEach((value) => {
                    if (key === "strapMaterial") {
                        const match = filterOptions.strapMaterial.find(
                            (item) => item.id === value
                        );
                        displays.push(match ? match.name : value);
                    } else {
                        displays.push(value);
                    }
                });
            }
        });
        return displays;
    };

    const getFilteredProducts = () => {
        let filtered = products.filter((product) => {
            const productBrand = (product.brand?.name || product.brand || "")
                .toLowerCase()
                .trim();
            const productGender = (product.gender?.name || product.gender || "")
                .toLowerCase()
                .trim();
            const productMovement = (
                product.movement?.name ||
                product.movement ||
                ""
            )
                .toLowerCase()
                .trim();
            const matchesBrand =
                filters.brand.length === 0 ||
                filters.brand.some(
                    (b) => b.toLowerCase().trim() === productBrand
                );
            const matchesGender =
                filters.gender.length === 0 ||
                filters.gender.some(
                    (g) => g.toLowerCase().trim() === productGender
                );
            const matchesMovement =
                filters.movement.length === 0 ||
                filters.movement.some(
                    (m) => m.toLowerCase().trim() === productMovement
                );
            const matchesStrapMaterial =
                filters.strapMaterial.length === 0 ||
                filters.strapMaterial.includes(product.strap_material_id);
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
                    parseFloat(
                        a.price.toString().replace("P", "").replace(/,/g, "")
                    ) -
                    parseFloat(
                        b.price.toString().replace("P", "").replace(/,/g, "")
                    )
            );
        } else if (sortBy === "priceDesc") {
            filtered.sort(
                (a, b) =>
                    parseFloat(
                        b.price.toString().replace("P", "").replace(/,/g, "")
                    ) -
                    parseFloat(
                        a.price.toString().replace("P", "").replace(/,/g, "")
                    )
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
        setFilterKey((prev) => prev + 1);
    };

    const filteredProducts = getFilteredProducts();
    const displayFilters = getDisplayFilters();

    const handleDirectAddToCart = (product, size) => {
        if (!isLoggedIn) {
            message.info("Please log in to add to cart");
            return;
        }

        // Validate size
        let sizesArr = [];
        if (typeof product.sizes === "string") {
            try {
                sizesArr = JSON.parse(product.sizes);
            } catch (e) {
                sizesArr = [];
            }
        } else {
            sizesArr = product.sizes || [];
        }
        const validSize = sizesArr.some((s) => (s.size || s) === size);
        if (!validSize) {
            message.error(
                `Size ${size} is not available for ${product.product_name}.`
            );
            return;
        }

        const cartItem = {
            id: product.id,
            productName: product.product_name,
            image: product.main_image
                ? `http://localhost:8000/storage/${product.main_image}`
                : "/placeholder.jpg",
            size: size,
            price: product.price,
            quantity: 1,
            total: product.price,
        };

        const storedCart = localStorage.getItem("cart");
        let cart = storedCart ? JSON.parse(storedCart) : [];
        const existingItemIndex = cart.findIndex(
            (item) => item.id === product.id && item.size === size
        );
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
            cart[existingItemIndex].total =
                cart[existingItemIndex].price *
                cart[existingItemIndex].quantity;
        } else {
            cart.push(cartItem);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        message.success(
            `Successfully added ${product.product_name} (${size}) to your cart!`
        );
    };

    const renderSizeOptions = (product) => {
        let sizesArr = [];
        if (typeof product.sizes === "string") {
            try {
                sizesArr = JSON.parse(product.sizes);
            } catch (e) {
                sizesArr = [];
            }
        } else {
            sizesArr = product.sizes || [];
        }
        let sizesDisplay = [];
        if (Array.isArray(sizesArr) && sizesArr.length > 0) {
            if (typeof sizesArr[0] === "object" && sizesArr[0].size) {
                sizesDisplay = sizesArr.map((item) => item.size);
            } else {
                sizesDisplay = sizesArr;
            }
        }
        return sizesDisplay.map((size, index) => (
            <Button
                key={index}
                size="large"
                onClick={() => setModalSelectedSize(size)}
                type={modalSelectedSize === size ? "primary" : "default"}
                style={{ margin: "4px" }}
            >
                {size}
            </Button>
        ));
    };

    const handleModalAddToCart = () => {
        if (!modalSelectedSize) {
            message.warning("Please select a size.");
            return;
        }
        handleDirectAddToCart(modalProduct, modalSelectedSize);
        setShowAddToCartModal(false);
        setModalProduct(null);
    };

    const renderModalOverview = () => {
        if (!modalProduct) return null;
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}
            >
                <div style={{ display: "flex", gap: "16px" }}>
                    <div>
                        <img
                            src={`http://localhost:8000/storage/${modalCurrentMainImage}`}
                            alt={modalProduct.product_name}
                            style={{
                                width: "300px",
                                height: "300px",
                                objectFit: "cover",
                                borderRadius: "8px",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        {modalProduct.side_image_1 && (
                            <img
                                src={`http://localhost:8000/storage/${modalProduct.side_image_1}`}
                                alt="Side 1"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setModalCurrentMainImage(
                                        modalProduct.side_image_1
                                    )
                                }
                            />
                        )}
                        {modalProduct.side_image_2 && (
                            <img
                                src={`http://localhost:8000/storage/${modalProduct.side_image_2}`}
                                alt="Side 2"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setModalCurrentMainImage(
                                        modalProduct.side_image_2
                                    )
                                }
                            />
                        )}
                        {modalProduct.side_image_3 && (
                            <img
                                src={`http://localhost:8000/storage/${modalProduct.side_image_3}`}
                                alt="Side 3"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setModalCurrentMainImage(
                                        modalProduct.side_image_3
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
                <div>
                    <h3>{modalProduct.product_name}</h3>
                    <p>Price: {modalProduct.price}</p>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Rate
                            disabled
                            value={modalProduct.average_rating || 0}
                            allowHalf
                            style={{ fontSize: "14px", marginRight: "8px" }}
                        />
                        <span>{modalProduct.average_rating || 0}</span>
                    </div>
                </div>
                <div>
                    <h4>Select Size</h4>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: "8px",
                            width: "100px",
                            flexDirection: "row",
                        }}
                    >
                        {renderSizeOptions(modalProduct)}
                    </div>
                </div>
                <Button
                    type="primary"
                    onClick={handleModalAddToCart}
                    style={{ width: "100%" }}
                >
                    Add to Cart
                </Button>
            </div>
        );
    };

    const number_format = (number) =>
        Number(number)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <Layout style={{ minHeight: "100vh" }} key={filterKey}>
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
                    {displayFilters.length > 0 && (
                        <div style={{ marginBottom: "16px", color: "#1890ff" }}>
                            {displayFilters.join(" > ")}
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
                                        key={material.id}
                                        onChange={() =>
                                            handleFilterChange(
                                                "strapMaterial",
                                                material.id
                                            )
                                        }
                                        checked={filters.strapMaterial.includes(
                                            material.id
                                        )}
                                    >
                                        {material.name}
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
                                    style={{ textDecoration: "none" }}
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
                                                            }
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
                                                        </span>
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <Button
                                            type="link"
                                            icon={
                                                <ShoppingCartOutlined
                                                    style={{ fontSize: "28px" }}
                                                />
                                            }
                                            disabled={!isLoggedIn}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setModalProduct(product);
                                                setModalCurrentMainImage(
                                                    product.main_image
                                                );
                                                setModalSelectedSize(null);
                                                setShowAddToCartModal(true);
                                            }}
                                            style={{
                                                padding: 0,
                                                marginTop: "8px",
                                                display: "block",
                                                textAlign: "center",
                                            }}
                                        />
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </Content>
                </Layout>
            </Layout>
            <Modal
                title={
                    modalProduct
                        ? modalProduct.product_name
                        : "Product Overview"
                }
                visible={showAddToCartModal}
                onCancel={() => {
                    setShowAddToCartModal(false);
                    setModalProduct(null);
                }}
                footer={null}
                width={700}
            >
                {modalProduct && renderModalOverview()}
            </Modal>
        </Layout>
    );
};

export default Collection;
