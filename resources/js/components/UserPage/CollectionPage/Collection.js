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
    const INVENTORY_API = "http://localhost:8000/api/inventory/public";
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
                            (item) => item.id === value || item === value
                        );
                        displays.push(match && match.name ? match.name : value);
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
            filtered.sort((a, b) => {
                const priceA = parseFloat(
                    a.price.toString().replace("P", "").replace(/,/g, "")
                );
                const priceB = parseFloat(
                    b.price.toString().replace("P", "").replace(/,/g, "")
                );
                return priceA - priceB;
            });
        } else if (sortBy === "priceDesc") {
            filtered.sort((a, b) => {
                const priceA = parseFloat(
                    a.price.toString().replace("P", "").replace(/,/g, "")
                );
                const priceB = parseFloat(
                    b.price.toString().replace("P", "").replace(/,/g, "")
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
        setFilterKey((prev) => prev + 1);
    };

    const handleDirectAddToCart = async (product, size) => {
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

        try {
            const response = await axios.get(
                `${INVENTORY_API}?product_id=${product.id}&size=${size}`
            );
            const inventory = response.data[0];
            if (!inventory || !inventory.id) {
                message.error(
                    `No inventory available for ${product.product_name} in size ${size}`
                );
                return;
            }

            const cartItem = {
                id: product.id,
                inventory_id: inventory.id,
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
        } catch (error) {
            message.error("Error adding item to cart");
            console.error(error);
        }
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
                            flexWrap: "wrap",
                            gap: "8px",
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

    const filteredProducts = getFilteredProducts();
    const displayFilters = getDisplayFilters();

    return (
        <Layout style={{ minHeight: "100vh" }} key={filterKey}>
            <Navbar />
            <div style={{ margin: "24px" }}>
                <BrandSlider />
                <Layout>
                    <Sider
                        width={200}
                        style={{ background: "#fff", padding: "16px" }}
                    >
                        <h3>Filters</h3>
                        <div>
                            <h4>Brand</h4>
                            {filterOptions.brand.map((brand) => (
                                <Checkbox
                                    key={brand}
                                    checked={filters.brand.includes(brand)}
                                    onChange={() =>
                                        handleFilterChange("brand", brand)
                                    }
                                >
                                    {brand}
                                </Checkbox>
                            ))}
                        </div>
                        <div>
                            <h4>Gender</h4>
                            {filterOptions.gender.map((gender) => (
                                <Checkbox
                                    key={gender}
                                    checked={filters.gender.includes(gender)}
                                    onChange={() =>
                                        handleFilterChange("gender", gender)
                                    }
                                >
                                    {gender}
                                </Checkbox>
                            ))}
                        </div>
                        <div>
                            <h4>Movement</h4>
                            {filterOptions.movement.map((movement) => (
                                <Checkbox
                                    key={movement}
                                    checked={filters.movement.includes(
                                        movement
                                    )}
                                    onChange={() =>
                                        handleFilterChange("movement", movement)
                                    }
                                >
                                    {movement}
                                </Checkbox>
                            ))}
                        </div>
                        <div>
                            <h4>Strap Material</h4>
                            {filterOptions.strapMaterial.map((material) => (
                                <Checkbox
                                    key={material.id}
                                    checked={filters.strapMaterial.includes(
                                        material.id
                                    )}
                                    onChange={() =>
                                        handleFilterChange(
                                            "strapMaterial",
                                            material.id
                                        )
                                    }
                                >
                                    {material.name}
                                </Checkbox>
                            ))}
                        </div>
                        <Button
                            onClick={clearFilters}
                            style={{ marginTop: "16px" }}
                        >
                            Clear Filters
                        </Button>
                    </Sider>
                    <Content style={{ padding: "0 24px", minHeight: 280 }}>
                        <Space
                            style={{
                                marginBottom: "16px",
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Search
                                placeholder="Search products"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 200 }}
                            />
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                style={{ width: 200 }}
                            >
                                <Option value="default">Default</Option>
                                <Option value="priceAsc">
                                    Price: Low to High
                                </Option>
                                <Option value="priceDesc">
                                    Price: High to Low
                                </Option>
                            </Select>
                        </Space>
                        <div>
                            {displayFilters.length > 0 && (
                                <div style={{ marginBottom: "16px" }}>
                                    <strong>Applied Filters: </strong>
                                    {displayFilters.join(", ")}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "16px",
                                }}
                            >
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        hoverable
                                        style={{ width: 240 }}
                                        cover={
                                            <img
                                                alt={product.product_name}
                                                src={
                                                    product.main_image
                                                        ? `http://localhost:8000/storage/${product.main_image}`
                                                        : "/placeholder.jpg"
                                                }
                                                style={{
                                                    height: 200,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        }
                                        actions={[
                                            <ShoppingCartOutlined
                                                key="cart"
                                                onClick={() => {
                                                    setModalProduct(product);
                                                    setModalCurrentMainImage(
                                                        product.main_image
                                                    );
                                                    setShowAddToCartModal(true);
                                                }}
                                            />,
                                            <Link to={`/product/${product.id}`}>
                                                View
                                            </Link>,
                                        ]}
                                    >
                                        <Card.Meta
                                            title={product.product_name}
                                            description={
                                                <>
                                                    <p>{product.price}</p>
                                                    <Rate
                                                        disabled
                                                        value={
                                                            product.average_rating ||
                                                            0
                                                        }
                                                        allowHalf
                                                        style={{
                                                            fontSize: "12px",
                                                        }}
                                                    />
                                                </>
                                            }
                                        />
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </Content>
                </Layout>
            </div>
            <Modal
                title="Add to Cart"
                visible={showAddToCartModal}
                onCancel={() => setShowAddToCartModal(false)}
                footer={null}
            >
                {renderModalOverview()}
            </Modal>
        </Layout>
    );
};

export default Collection;
