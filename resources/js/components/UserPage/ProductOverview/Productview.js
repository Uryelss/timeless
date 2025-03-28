import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Row,
    Col,
    Card,
    Button,
    Rate,
    Image,
    Typography,
    Space,
    Tabs,
    message,
    Avatar,
    Input,
    Modal,
    InputNumber,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import Navbar from "../Navbar/Navbar";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const normalizeSize = (size) =>
    size.toString().toLowerCase().replace(/\s+/g, "");

const ProductOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [currentMainImage, setCurrentMainImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [userProfile, setUserProfile] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [inventoryRecords, setInventoryRecords] = useState([]);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [buyNowQuantity, setBuyNowQuantity] = useState(1);

    const isLoggedIn = Boolean(localStorage.getItem("token"));
    const baseUrl = "http://localhost:8000"; // Base URL for image paths

    // Fetch product details
    useEffect(() => {
        if (!id || id === "undefined" || isNaN(id)) {
            message.error("Invalid product ID.");
            navigate("/");
            return;
        }
        axios
            .get(`${baseUrl}/api/products/${id}`)
            .then((res) => {
                const fetchedProduct = res.data.product || res.data;
                setProduct(fetchedProduct);
                setCurrentMainImage(fetchedProduct.main_image);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                if (err.response?.status === 404) {
                    message.error("Product not found.");
                    navigate("/");
                } else {
                    message.error("Error fetching product details.");
                }
            });
    }, [id, navigate]);

    // Fetch reviews
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios
                .get(`${baseUrl}/api/reviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    console.log("Fetched Reviews:", res.data); // Debug log
                    setReviews(res.data);
                })
                .catch((err) => {
                    if (err.response?.status === 401) {
                        message.warning("Please log in to view reviews.");
                    }
                    console.error("Error fetching reviews:", err);
                });
        }
    }, [id]);

    // Fetch user profile if not available
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && !userProfile) {
            axios
                .get(`${baseUrl}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    console.log("Fetched User Profile:", res.data); // Debug log
                    setUserProfile(res.data);
                    localStorage.setItem("user", JSON.stringify(res.data));
                })
                .catch((err) => console.error("Error fetching profile:", err));
        }
    }, [userProfile]);

    // Fetch inventory for the product
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios
                .get(`${baseUrl}/api/inventory-public?product_id=${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setInventoryRecords(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching inventory:", err);
                });
        }
    }, [id]);

    // Handle review submission
    const handleSubmitReview = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.warning("Please log in to post a review.");
            return;
        }
        if (!reviewText.trim()) {
            message.warning("Please enter a comment.");
            return;
        }
        if (reviewRating === 0) {
            message.warning("Please select a rating.");
            return;
        }
        axios
            .post(
                `${baseUrl}/api/reviews`,
                { product_id: id, comment: reviewText, rating: reviewRating },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                console.log("Review Submission Response:", res.data); // Debug log
                setReviews([res.data.review, ...reviews]);
                setReviewText("");
                setReviewRating(0);
                axios.get(`${baseUrl}/api/products/${id}`).then((res) => {
                    const fetchedProduct = res.data.product || res.data;
                    setProduct(fetchedProduct);
                });
                message.success("Review posted successfully!");
            })
            .catch((err) => {
                message.error("Failed to submit review.");
                console.error("Error submitting review:", err);
            });
    };

    // Helper to format numbers (price)
    const number_format = (number) =>
        Number(number)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Parse sizes from product.sizes
    let sizesArr = [];
    if (typeof product?.sizes === "string") {
        try {
            sizesArr = JSON.parse(product.sizes);
        } catch (e) {
            sizesArr = [];
        }
    } else {
        sizesArr = product?.sizes || [];
    }
    const sizesDisplay =
        Array.isArray(sizesArr) &&
        sizesArr.length > 0 &&
        typeof sizesArr[0] === "object" &&
        sizesArr[0].size
            ? sizesArr.map((item) => item.size)
            : sizesArr;

    // Find inventory record for the selected size
    const selectedInventoryRecord = inventoryRecords.find(
        (inv) => normalizeSize(inv.size) === normalizeSize(selectedSize || "")
    );

    // Function to add product to cart
    const handleAddToCart = () => {
        if (!selectedSize) {
            message.warning("Please select a size.");
            return;
        }

        const selectedInventory = inventoryRecords.find(
            (inv) => normalizeSize(inv.size) === normalizeSize(selectedSize)
        );
        if (!selectedInventory || selectedInventory.quantity === 0) {
            message.error(
                `Size ${selectedSize} is out of stock for ${product.product_name}.`
            );
            return;
        }

        const cartItem = {
            id: product.id,
            inventory_id: selectedInventory.id,
            productName: product.product_name,
            image: `${baseUrl}/storage/${product.main_image}`,
            size: selectedSize,
            price: product.price,
            quantity: 1,
            total: product.price,
        };

        const storedCart = localStorage.getItem("cart");
        let cart = storedCart ? JSON.parse(storedCart) : [];
        const existingItemIndex = cart.findIndex(
            (item) => item.id === cartItem.id && item.size === cartItem.size
        );
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
            cart[existingItemIndex].total =
                cart[existingItemIndex].price * cart[existingItemIndex].quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        message.success(
            `Successfully added ${product.product_name} (${selectedSize}) to your cart!`
        );
    };

    // BUY NOW handler: open quantity modal
    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedSize) {
            message.warning("Please select a size.");
            return;
        }
        const selectedInventory = inventoryRecords.find(
            (inv) => normalizeSize(inv.size) === normalizeSize(selectedSize)
        );
        if (!selectedInventory || selectedInventory.quantity === 0) {
            message.error(
                `Size ${selectedSize} is out of stock for ${product.product_name}.`
            );
            return;
        }
        setBuyNowQuantity(1);
        setShowQuantityModal(true);
    };

    // Confirm quantity modal: add product and navigate to checkout
    const handleConfirmBuyNow = () => {
        const selectedInventory = inventoryRecords.find(
            (inv) => normalizeSize(inv.size) === normalizeSize(selectedSize)
        );
        if (!selectedInventory || selectedInventory.quantity === 0) {
            message.error(
                `Size ${selectedSize} is out of stock for ${product.product_name}.`
            );
            return;
        }
        if (buyNowQuantity > selectedInventory.quantity) {
            message.error(
                `Only ${selectedInventory.quantity} items are in stock.`
            );
            return;
        }
        const cartItem = {
            id: product.id,
            inventory_id: selectedInventory.id,
            productName: product.product_name,
            image: `${baseUrl}/storage/${product.main_image}`,
            size: selectedSize,
            price: product.price,
            quantity: buyNowQuantity,
            total: product.price * buyNowQuantity,
        };
        navigate("/user-checkout", {
            state: {
                cartItems: [cartItem],
                subtotal: product.price * buyNowQuantity,
            },
        });
        setShowQuantityModal(false);
    };

    // Render modal overview content
    const renderModalOverview = () => {
        if (!product) return null;
        return (
            <div style={{ display: "flex", flexDirection: "row", gap: "24px" }}>
                <div>
                    <img
                        src={`${baseUrl}/storage/${currentMainImage}`}
                        alt={product.product_name}
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
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        textAlign: "right",
                    }}
                >
                    <Title level={2} style={{ margin: 0 }}>
                        {product.product_name}
                    </Title>
                    <Title level={3} style={{ margin: "8px 0" }}>
                        ₱{number_format(product.price)}
                    </Title>
                    <div style={{ marginBottom: "16px" }}>
                        <Rate
                            disabled
                            value={product.average_rating || 0}
                            allowHalf
                            style={{ fontSize: "18px", marginRight: "8px" }}
                        />
                        <span style={{ fontSize: "18px" }}>
                            {product.average_rating || 0}
                        </span>
                    </div>
                    <div style={{ marginBottom: "16px", textAlign: "right" }}>
                        <InputNumber
                            min={1}
                            max={
                                selectedInventoryRecord
                                    ? selectedInventoryRecord.quantity
                                    : 1
                            }
                            value={buyNowQuantity}
                            onChange={(value) => setBuyNowQuantity(value)}
                            size="large"
                        />
                    </div>
                    <Button
                        type="primary"
                        onClick={handleConfirmBuyNow}
                        size="large"
                        style={{ width: "100%" }}
                    >
                        Proceed to Checkout
                    </Button>
                </div>
            </div>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div>
            <Navbar style={{ width: "100%" }} />
            <div style={{ marginTop: "90px" }}>
                <Row gutter={16} align="middle" justify="center">
                    <Col xs={24} md={12}>
                        <Card
                            style={{
                                width: "600px",
                                height: "600px",
                                display: "block",
                                margin: "0px auto",
                                position: "relative",
                                overflow: "hidden",
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <Image
                                src={`${baseUrl}/storage/${currentMainImage}`}
                                alt={product.product_name}
                                preview={false}
                                style={{
                                    width: "600px",
                                    height: "600px",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </Card>
                        <Card
                            style={{
                                width: "600px",
                                margin: "20px auto",
                                textAlign: "center",
                            }}
                            bodyStyle={{ padding: "10px" }}
                        >
                            <Space
                                direction="horizontal"
                                size="large"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                {product.side_image_1 && (
                                    <Card
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            overflow: "hidden",
                                        }}
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <Image
                                            src={`${baseUrl}/storage/${product.side_image_1}`}
                                            alt="Side 1"
                                            preview={false}
                                            onMouseEnter={() =>
                                                setCurrentMainImage(product.side_image_1)
                                            }
                                            onMouseLeave={() =>
                                                setCurrentMainImage(product.main_image)
                                            } // Reset to main image
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Card>
                                )}
                                {product.side_image_2 && (
                                    <Card
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            overflow: "hidden",
                                        }}
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <Image
                                            src={`${baseUrl}/storage/${product.side_image_2}`}
                                            alt="Side 2"
                                            preview={false}
                                            onMouseEnter={() =>
                                                setCurrentMainImage(product.side_image_2)
                                            }
                                            onMouseLeave={() =>
                                                setCurrentMainImage(product.main_image)
                                            } // Reset to main image
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Card>
                                )}
                                {product.side_image_3 && (
                                    <Card
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            overflow: "hidden",
                                        }}
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <Image
                                            src={`${baseUrl}/storage/${product.side_image_3}`}
                                            alt="Side 3"
                                            preview={false}
                                            onMouseEnter={() =>
                                                setCurrentMainImage(product.side_image_3)
                                            }
                                            onMouseLeave={() =>
                                                setCurrentMainImage(product.main_image)
                                            } // Reset to main image
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Card>
                                )}
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card bodyStyle={{ padding: "24px" }}>
                            <Space
                                direction="vertical"
                                size="large"
                                style={{ width: "100%", textAlign: "center" }}
                            >
                                <Title level={3}>{product.product_name}</Title>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Rate
                                        disabled
                                        value={product.average_rating || 0}
                                        allowHalf
                                        style={{ marginRight: "8px" }}
                                    />
                                    <span>{product.average_rating || 0}</span>
                                </div>
                                <Paragraph strong>Price</Paragraph>
                                <Paragraph strong>
                                    ₱{number_format(product.price)}
                                </Paragraph>
                                {sizesDisplay && sizesDisplay.length > 0 && (
                                    <div>
                                        <div
                                            style={{
                                                marginBottom: "8px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Size (mm)
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "10px",
                                                justifyContent: "center",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {sizesDisplay.map((size, index) => {
                                                const inventory =
                                                    inventoryRecords.find(
                                                        (inv) =>
                                                            normalizeSize(
                                                                inv.size
                                                            ) ===
                                                            normalizeSize(size)
                                                    );
                                                const isOutOfStock =
                                                    inventory &&
                                                    inventory.quantity === 0;
                                                return (
                                                    <Button
                                                        key={index}
                                                        onClick={() =>
                                                            !isOutOfStock &&
                                                            setSelectedSize(
                                                                size
                                                            )
                                                        }
                                                        disabled={isOutOfStock}
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "4px",
                                                            backgroundColor:
                                                                selectedSize ===
                                                                    size &&
                                                                !isOutOfStock
                                                                    ? "black"
                                                                    : "white",
                                                            color:
                                                                selectedSize ===
                                                                    size &&
                                                                !isOutOfStock
                                                                    ? "white"
                                                                    : isOutOfStock
                                                                    ? "red"
                                                                    : "black",
                                                            border: `1px solid ${
                                                                isOutOfStock
                                                                    ? "red"
                                                                    : "gray"
                                                            }`,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            cursor: isOutOfStock
                                                                ? "not-allowed"
                                                                : "pointer",
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        {size}
                                                        {isOutOfStock && (
                                                            <span
                                                                style={{
                                                                    position:
                                                                        "absolute",
                                                                    top: "100%",
                                                                    left: "50%",
                                                                    transform:
                                                                        "translateX(-50%)",
                                                                    color: "red",
                                                                    fontSize:
                                                                        "10px",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                Out of Stock
                                                            </span>
                                                        )}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        {selectedSize && (
                                            <div style={{ marginTop: "8px" }}>
                                                Selected Size:{" "}
                                                <strong>{selectedSize}</strong>
                                                <br />
                                                {selectedInventoryRecord ? (
                                                    <span>
                                                        Stock Quantity:{" "}
                                                        {
                                                            selectedInventoryRecord.quantity
                                                        }
                                                    </span>
                                                ) : (
                                                    <span>
                                                        No stock info available
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Space>
                        </Card>
                        <Space
                            direction="horizontal"
                            size="middle"
                            style={{
                                width: "100%",
                                marginTop: "16px",
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                style={{
                                    backgroundColor: "#28A745",
                                    color: "white",
                                    border: "none",
                                    width: "150px",
                                    height: "40px",
                                }}
                                onClick={handleAddToCart}
                            >
                                ADD TO CART
                            </Button>
                            <Button
                                style={{
                                    backgroundColor: "black",
                                    color: "white",
                                    border: "none",
                                    width: "150px",
                                    height: "40px",
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBuyNow(e);
                                }}
                            >
                                BUY NOW
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Details and Comments Tabs */}
                <Row justify="center" style={{ marginTop: "20px" }}>
                    <Col xs={24} md={24}>
                        <Card>
                            <Tabs defaultActiveKey="1" type="card" size="large">
                                <TabPane tab="Details" key="1">
                                    <Card>
                                        <Paragraph>
                                            {product.description}
                                        </Paragraph>
                                    </Card>
                                </TabPane>
                                <TabPane tab="Comments" key="2">
                                    <Card>
                                        {isLoggedIn ? (
                                            <div
                                                style={{ marginBottom: "15px" }}
                                            >
                                                <div
                                                    style={{
                                                        marginBottom: "10px",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            marginRight: "10px",
                                                        }}
                                                    >
                                                        Rate this product:
                                                    </label>
                                                    <Rate
                                                        value={reviewRating}
                                                        onChange={(value) =>
                                                            setReviewRating(
                                                                value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <TextArea
                                                    placeholder="Write a comment..."
                                                    value={reviewText}
                                                    onChange={(e) =>
                                                        setReviewText(
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    style={{ marginTop: "5px" }}
                                                />
                                                <Button
                                                    type="primary"
                                                    onClick={handleSubmitReview}
                                                    style={{
                                                        marginTop: "10px",
                                                    }}
                                                >
                                                    Post Review
                                                </Button>
                                            </div>
                                        ) : (
                                            <Paragraph
                                                style={{ textAlign: "center" }}
                                            >
                                                Please{" "}
                                                <Link to="/login">log in</Link>{" "}
                                                to leave a review.
                                            </Paragraph>
                                        )}
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => {
                                                const avatarSrc = review.user
                                                    ?.profile?.profile_image
                                                    ? review.user.profile.profile_image.startsWith(
                                                          "http"
                                                      )
                                                        ? review.user.profile
                                                              .profile_image
                                                        : `${baseUrl}${review.user.profile.profile_image}`
                                                    : null;
                                                console.log(
                                                    `Review ${review.id} Avatar Src:`,
                                                    avatarSrc
                                                ); // Debug log
                                                return (
                                                    <Card
                                                        key={review.id}
                                                        style={{
                                                            marginBottom:
                                                                "10px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <Avatar
                                                                src={avatarSrc}
                                                                icon={
                                                                    <UserOutlined />
                                                                }
                                                                onError={() => {
                                                                    console.log(
                                                                        `Failed to load image for review ${review.id}: ${avatarSrc}`
                                                                    );
                                                                    return true; // Fallback to icon
                                                                }}
                                                            />
                                                            <div>
                                                                <strong>
                                                                    {review.user
                                                                        ?.username ||
                                                                        "Unknown User"}
                                                                </strong>
                                                                <div>
                                                                    <Rate
                                                                        disabled
                                                                        value={
                                                                            review.rating
                                                                        }
                                                                        style={{
                                                                            fontSize:
                                                                                "14px",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Paragraph
                                                            style={{
                                                                marginTop:
                                                                    "5px",
                                                            }}
                                                        >
                                                            {review.comment}
                                                        </Paragraph>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            <Paragraph>
                                                No comments yet.
                                            </Paragraph>
                                        )}
                                    </Card>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title={product ? product.product_name : "Product Overview"}
                visible={showQuantityModal}
                onCancel={() => setShowQuantityModal(false)}
                onOk={handleConfirmBuyNow}
                okText="Proceed to Checkout"
                width={700}
            >
                {renderModalOverview()}
            </Modal>
        </div>
    );
};

export default ProductOverview;