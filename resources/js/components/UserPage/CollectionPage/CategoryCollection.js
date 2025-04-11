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
import { Link, useNavigate, useParams } from "react-router-dom";
import BrandSlider from "../UserHome/BrandSlider";
import Footer from "../UserHome/Footer";

const { Content, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

const normalizeSize = (size) =>
    size ? size.toString().toLowerCase().replace(/\s+/g, "") : "";

const CategoryCollection = () => {
    const { category } = useParams();
    const navigate = useNavigate();

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
    const [strapMaterialMapping, setStrapMaterialMapping] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [showAddToCartModal, setShowAddToCartModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [modalCurrentMainImage, setModalCurrentMainImage] = useState("");
    const [modalSelectedSize, setModalSelectedSize] = useState(null);
    const [inventoryRecords, setInventoryRecords] = useState([]);
    const [modalSelectedStock, setModalSelectedStock] = useState(null);

    const PRODUCTS_API = "http://localhost:8000/api/products/public";
    const SUBCATEGORIES_API = "http://localhost:8000/api/sub-categories/public";
    const baseUrl = "http://localhost:8000";
    const isLoggedIn = Boolean(localStorage.getItem("token"));

    const fetchProducts = async () => {
        try {
            const res = await axios.get(PRODUCTS_API);
            const filtered = res.data.filter(
                (prod) =>
                    prod.category_id &&
                    prod.category_id.toString() === category.toString()
            );
            setProducts(filtered);
        } catch (err) {
            message.error("Error fetching products");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [category]);

    useEffect(() => {
        const brands = Array.from(
            new Set(
                products
                    .map((p) => p.brand?.name || p.brand)
                    .filter(Boolean)
                    .map((b) => b.trim())
            )
        );
        const genders = Array.from(
            new Set(
                products
                    .map((p) => p.gender?.name || p.gender)
                    .filter(Boolean)
                    .map((g) => g.trim())
            )
        );
        const movements = Array.from(
            new Set(
                products
                    .map((p) => p.movement?.name || p.movement)
                    .filter(Boolean)
                    .map((m) => m.trim())
            )
        );
        setFilterOptions((prev) => ({
            ...prev,
            brand: brands,
            gender: genders,
            movement: movements,
        }));
    }, [products]);

    useEffect(() => {
        if (products.length > 0) {
            axios
                .get(`${SUBCATEGORIES_API}?type=strap_materials`)
                .then((res) => {
                    const available = res.data.filter((material) =>
                        products.some(
                            (p) => p.strap_material_id === material.id
                        )
                    );
                    const mapping = {};
                    const names = available.map((mat) => {
                        mapping[mat.id] = mat.name;
                        return mat.name.trim();
                    });
                    setStrapMaterialMapping(mapping);
                    setFilterOptions((prev) => ({
                        ...prev,
                        strapMaterial: names,
                    }));
                })
                .catch((err) => {
                    console.error("Error fetching strap materials:", err);
                });
        }
    }, [products]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios
                .get(`${baseUrl}/api/inventory-public`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setInventoryRecords(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching inventory:", err);
                });
        }
    }, []);

    const handleFilterChange = (filterCategory, value) => {
        setFilters((prev) => {
            const updated = prev[filterCategory].includes(value)
                ? prev[filterCategory].filter((item) => item !== value)
                : [...prev[filterCategory], value];
            return { ...prev, [filterCategory]: updated };
        });
    };

    const getDisplayFilters = () => {
        const displays = [];
        Object.keys(filters).forEach((key) => {
            filters[key].forEach((value) => {
                displays.push(value);
            });
        });
        return displays;
    };

    const getFilteredProducts = () => {
        let filtered = products.filter((product) => {
            const productBrand = (
                product.brand?.name ||
                product.brand ||
                ""
            )
                .toLowerCase()
                .trim();
            const productGender = (
                product.gender?.name ||
                product.gender ||
                ""
            )
                .toLowerCase()
                .trim();
            const productMovement = (
                product.movement?.name ||
                product.movement ||
                ""
            )
                .toLowerCase()
                .trim();
            const productStrapMaterial = (
                strapMaterialMapping[product.strap_material_id] || ""
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
                filters.strapMaterial.some(
                    (mat) => mat.toLowerCase().trim() === productStrapMaterial
                );
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
                    .includes(searchTerm.toLowerCase().trim())
            );
        }

        if (sortBy === "priceAsc") {
            filtered.sort((a, b) => {
                const priceA = parseFloat(
                    a.price.toString().replace("P", "").replace(/,/g, "") || 0
                );
                const priceB = parseFloat(
                    b.price.toString().replace("P", "").replace(/,/g, "") || 0
                );
                return priceA - priceB;
            });
        } else if (sortBy === "priceDesc") {
            filtered.sort((a, b) => {
                const priceA = parseFloat(
                    a.price.toString().replace("P", "").replace(/,/g, "") || 0
                );
                const priceB = parseFloat(
                    b.price.toString().replace("P", "").replace(/,/g, "") || 0
                );
                return priceB - priceA;
            });
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

    const handleDirectAddToCart = (product, size) => {
        if (!isLoggedIn) {
            message.info("Please log in to add to cart");
            return;
        }
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
        const inventory = inventoryRecords.find(
            (inv) =>
                inv.product_id === product.id &&
                normalizeSize(inv.size) === normalizeSize(size)
        );
        if (inventory && inventory.quantity === 0) {
            message.error(
                `Size ${size} is out of stock for ${product.product_name}.`
            );
            return;
        }
        const cartItem = {
            id: product.id,
            inventory_id: inventory ? inventory.id : product.id,
            productName: product.product_name,
            image: product.main_image
                ? `${baseUrl}/storage/${product.main_image}`
                : "/placeholder.jpg",
            size: size,
            price: parseFloat(
                product.price.toString().replace("P", "").replace(/,/g, "")
            ),
            quantity: 1,
            total: parseFloat(
                product.price.toString().replace("P", "").replace(/,/g, "")
            ),
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
        return sizesDisplay.map((size, index) => {
            const inventory = inventoryRecords.find(
                (inv) =>
                    inv.product_id === product.id &&
                    normalizeSize(inv.size) === normalizeSize(size)
            );
            const stock = inventory ? inventory.quantity : null;
            const isOutOfStock = stock === 0;
            return (
                <Button
                    key={index}
                    size="large"
                    onClick={() => {
                        setModalSelectedSize(size);
                        setModalSelectedStock(stock);
                    }}
                    type={modalSelectedSize === size ? "primary" : "default"}
                    disabled={isOutOfStock}
                    style={{ margin: "4px" }}
                >
                    {size}
                    {stock !== null && (
                        <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                            ({stock})
                        </span>
                    )}
                </Button>
            );
        });
    };

    const handleModalAddToCart = () => {
        if (!modalSelectedSize) {
            message.warning("Please select a size.");
            return;
        }
        if (modalSelectedStock === 0) {
            message.warning("Selected size is out of stock.");
            return;
        }
        handleDirectAddToCart(modalProduct, modalSelectedSize);
        setShowAddToCartModal(false);
        setModalProduct(null);
        setModalSelectedSize(null);
        setModalSelectedStock(null);
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
                            src={`${baseUrl}/storage/${modalCurrentMainImage}`}
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
                                src={`${baseUrl}/storage/${modalProduct.side_image_1}`}
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
                                src={`${baseUrl}/storage/${modalProduct.side_image_2}`}
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
                                src={`${baseUrl}/storage/${modalProduct.side_image_3}`}
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
                    <h4>{modalProduct.product_name}</h4>
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
                            flexWrap: "wrap",
                            gap: "8px",
                        }}
                    >
                        {renderSizeOptions(modalProduct)}
                    </div>
                    {modalSelectedSize && modalSelectedStock !== null && (
                        <p style={{ marginTop: "8px" }}>
                            Stock: {modalSelectedStock}
                            {modalSelectedStock === 0 && " (Out of Stock)"}
                        </p>
                    )}
                </div>
                <Button
                    type="primary"
                    onClick={handleModalAddToCart}
                    style={{
                        width: "100%",
                        height: "35px",
                        background: "black",
                    }}
                >
                    Add to Cart
                </Button>
            </div>
        );
    };

    const filteredProducts = getFilteredProducts();
    const displayFilters = getDisplayFilters();

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
                    {displayFilters.length > 0 && (
                        <div style={{ marginBottom: "16px", color: "#1890ff" }}>
                            {displayFilters.join(" > ")}
                        </div>
                    )}
                    <div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>BRAND</h3>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {filterOptions.brand.length > 0 ? (
                                    filterOptions.brand.map((brand) => (
                                        <Checkbox
                                            key={brand}
                                            onChange={() =>
                                                handleFilterChange("brand", brand)
                                            }
                                            checked={filters.brand.includes(brand)}
                                            style={{ marginBottom: "8px" }}
                                        >
                                            {brand}
                                        </Checkbox>
                                    ))
                                ) : (
                                    <span>No brands available</span>
                                )}
                            </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>GENDER</h3>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {filterOptions.gender.length > 0 ? (
                                    filterOptions.gender.map((gender) => (
                                        <Checkbox
                                            key={gender}
                                            onChange={() =>
                                                handleFilterChange("gender", gender)
                                            }
                                            checked={filters.gender.includes(gender)}
                                            style={{ marginBottom: "8px" }}
                                        >
                                            {gender}
                                        </Checkbox>
                                    ))
                                ) : (
                                    <span>No genders available</span>
                                )}
                            </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>MOVEMENT</h3>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {filterOptions.movement.length > 0 ? (
                                    filterOptions.movement.map((movement) => (
                                        <Checkbox
                                            key={movement}
                                            onChange={() =>
                                                handleFilterChange("movement", movement)
                                            }
                                            checked={filters.movement.includes(movement)}
                                            style={{ marginBottom: "8px" }}
                                        >
                                            {movement}
                                        </Checkbox>
                                    ))
                                ) : (
                                    <span>No movements available</span>
                                )}
                            </div>
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <h3>STRAP MATERIAL</h3>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {filterOptions.strapMaterial.length > 0 ? (
                                    filterOptions.strapMaterial.map((material) => (
                                        <Checkbox
                                            key={material}
                                            onChange={() =>
                                                handleFilterChange("strapMaterial", material)
                                            }
                                            checked={filters.strapMaterial.includes(material)}
                                            style={{ marginBottom: "8px" }}
                                        >
                                            {material}
                                        </Checkbox>
                                    ))
                                ) : (
                                    <span>No strap materials available</span>
                                )}
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
                            disabled={
                                !filters.brand.length &&
                                !filters.gender.length &&
                                !filters.movement.length &&
                                !filters.strapMaterial.length &&
                                !searchTerm &&
                                sortBy === "default"
                            }
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
                                value={sortBy}
                                style={{ width: 150 }}
                                onChange={setSortBy}
                            >
                                <Option value="default">Sort By</Option>
                                <Option value="priceAsc">Price: Low to High</Option>
                                <Option value="priceDesc">Price: High to Low</Option>
                            </Select>
                        </Space>
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "50px" }}>
                                <p>No products match the selected filters.</p>
                                <Button onClick={clearFilters}>Clear Filters</Button>
                            </div>
                        ) : (
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
                                                            ? `${baseUrl}/storage/${product.main_image}`
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
                                                        <p>Price: {product.price}</p>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <Rate
                                                                disabled
                                                                value={
                                                                    product.average_rating || 0
                                                                }
                                                                allowHalf
                                                                style={{
                                                                    fontSize: "14px",
                                                                    marginRight: "8px",
                                                                }}
                                                            />
                                                            <span>
                                                                {product.average_rating || 0}
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
                                                    setModalSelectedStock(null);
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
                        )}
                    </Content>
                </Layout>
            </Layout>
            <Modal
                title={
                    modalProduct
                        ? modalProduct.product_name
                        : "Product Overview"
                }
                open={showAddToCartModal}
                onCancel={() => {
                    setShowAddToCartModal(false);
                    setModalProduct(null);
                    setModalSelectedSize(null);
                    setModalSelectedStock(null);
                }}
                footer={null}
                width={700}
            >
                {modalProduct && renderModalOverview()}
            </Modal>
            <Footer />
        </Layout>
    );
};

export default CategoryCollection;