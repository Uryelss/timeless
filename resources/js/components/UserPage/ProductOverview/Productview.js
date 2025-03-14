import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import Navbar from "../Navbar/Navbar";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

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
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        console.log("Stored User from localStorage:", parsedUser);
        return parsedUser;
    });

    // Fetch product details
    useEffect(() => {
        console.log("Product ID from useParams:", id);
        if (!id || id === "undefined" || isNaN(id)) {
            message.error("Invalid product ID.");
            navigate("/");
            return;
        }

        console.log("Token in useEffect:", localStorage.getItem("token"));
        console.log("UserProfile in useEffect:", userProfile);
        axios
            .get(`http://localhost:8000/api/products/${id}`)
            .then((res) => {
                const fetchedProduct = res.data.product || res.data;
                console.log("Fetched Product Data:", fetchedProduct);
                setProduct(fetchedProduct);
                setCurrentMainImage(fetchedProduct.main_image);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching product details:", err);
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
                .get(`http://localhost:8000/api/reviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    console.log("Fetched Reviews:", res.data);
                    setReviews(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching reviews:", err);
                    if (err.response?.status === 401) {
                        message.warning("Please log in to view reviews.");
                    }
                });
        }
    }, [id]);

    // Fetch user profile if needed
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && !userProfile) {
            axios
                .get("http://localhost:8000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    console.log("Fetched User Profile:", res.data);
                    setUserProfile(res.data);
                    localStorage.setItem("user", JSON.stringify(res.data));
                })
                .catch((err) => console.error("Error fetching profile:", err));
        }
    }, [userProfile]);

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
                "http://localhost:8000/api/reviews",
                {
                    product_id: id,
                    comment: reviewText,
                    rating: reviewRating,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => {
                setReviews([res.data.review, ...reviews]);
                setReviewText("");
                setReviewRating(0);
                axios
                    .get(`http://localhost:8000/api/products/${id}`)
                    .then((res) => {
                        const fetchedProduct = res.data.product || res.data;
                        console.log("Refetched Product Data:", fetchedProduct);
                        setProduct(fetchedProduct);
                    });
                message.success("Review posted successfully!");
            })
            .catch((err) => {
                console.error("Error submitting review:", err);
                message.error("Failed to submit review.");
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found.</div>;
    }

    const number_format = (number) => {
        return Number(number)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const sizes =
        typeof product.sizes === "string"
            ? JSON.parse(product.sizes)
            : product.sizes || ["22mm"];

    return (
        <div>
            <Navbar style={{ width: "100%" }} />
            <div style={{ marginTop: "90px" }}>
                <Row gutter={16} justify="center">
                    {/* Left Column: Product Image */}
                    <Col xs={24} md={12}>
                        <Card
                            style={{
                                width: "600px",
                                height: "600px",
                                margin: "0 auto",
                                overflow: "hidden",
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <Image
                                src={`http://localhost:8000/storage/${currentMainImage}`}
                                alt={product.product_name}
                                preview={false}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
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
                                            src={`http://localhost:8000/storage/${product.side_image_1}`}
                                            alt="Side 1"
                                            preview={false}
                                            onMouseEnter={() =>
                                                setCurrentMainImage(
                                                    product.side_image_1
                                                )
                                            }
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
                                            src={`http://localhost:8000/storage/${product.side_image_2}`}
                                            alt="Side 2"
                                            preview={false}
                                            onMouseEnter={() =>
                                                setCurrentMainImage(
                                                    product.side_image_2
                                                )
                                            }
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
                                            src={`http://localhost:8000/storage/${product.side_image_3}`}
                                            alt="Side 3"
                                            preview={false}
                                            onMouseEnter={() =>
                                                setCurrentMainImage(
                                                    product.side_image_3
                                                )
                                            }
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

                    {/* Enhanced Right Column: Product Details */}
                    <Col xs={24} md={12}>
                        <Card
                            bodyStyle={{ padding: "24px" }}
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                maxWidth: "450px",
                                margin: "0 auto",
                            }}
                        >
                            <Space
                                direction="vertical"
                                size="large"
                                style={{ width: "100%", textAlign: "center" }}
                            >
                                {/* Product Name */}
                                <Title
                                    level={3}
                                    style={{ margin: 0, fontWeight: 600 }}
                                >
                                    {product.product_name}
                                </Title>

                                {/* Rating */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <Rate
                                        disabled
                                        value={product.average_rating || 0}
                                        allowHalf
                                        style={{ color: "#fadb14" }}
                                    />
                                    <span
                                        style={{
                                            fontSize: "16px",
                                            color: "#888",
                                        }}
                                    >
                                        ({product.average_rating || 0} / 5)
                                    </span>
                                </div>

                                {/* Price */}
                                <div>
                                    <Paragraph
                                        style={{
                                            margin: 0,
                                            fontSize: "14px",
                                            color: "#888",
                                        }}
                                    >
                                        Price
                                    </Paragraph>
                                    <Paragraph
                                        strong
                                        style={{
                                            fontSize: "24px",
                                            color: "#000000",
                                        }}
                                    >
                                        ₱{number_format(product.price)}
                                    </Paragraph>
                                </div>

                                {/* Stock Availability */}
                                <Paragraph
                                    style={{
                                        margin: 0,
                                        color:
                                            product.stock > 0
                                                ? "#000000"
                                                : "#ff4d4f",
                                    }}
                                >
                                    {product.stock > 0
                                        ? `In Stock (${product.stock} available)`
                                        : "Out of Stock"}
                                </Paragraph>

                                {/* Size Selection */}
                                {sizes && sizes.length > 0 && (
                                    <div>
                                        <div
                                            style={{
                                                marginBottom: "12px",
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                            }}
                                        >
                                            Size (mm)
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "12px",
                                                justifyContent: "center",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {sizes.map((size, index) => (
                                                <Button
                                                    key={index}
                                                    onClick={() =>
                                                        setSelectedSize(size)
                                                    }
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            selectedSize ===
                                                            size
                                                                ? "#000000"
                                                                : "#f5f5f5",
                                                        color:
                                                            selectedSize ===
                                                            size
                                                                ? "white"
                                                                : "black",
                                                        border: "1px solid #d9d9d9",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        cursor: "pointer",
                                                        transition: "all 0.3s",
                                                        fontWeight: "bold",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (
                                                            selectedSize !==
                                                            size
                                                        ) {
                                                            e.target.style.backgroundColor =
                                                                "#e6e6e6";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (
                                                            selectedSize !==
                                                            size
                                                        ) {
                                                            e.target.style.backgroundColor =
                                                                "#f5f5f5";
                                                        }
                                                    }}
                                                >
                                                    {size}
                                                </Button>
                                            ))}
                                        </div>
                                        {selectedSize && (
                                            <div
                                                style={{
                                                    marginTop: "12px",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Selected Size:{" "}
                                                <strong>{selectedSize}</strong>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Space>

                            {/* Action Buttons */}
                            <Space
                                direction="horizontal"
                                size="middle"
                                style={{
                                    width: "100%",
                                    marginTop: "24px",
                                    justifyContent: "center",
                                    gap: "16px",
                                }}
                            >
                                <Button
                                    style={{
                                        backgroundColor: "#000000", // Black background
                                        color: "white", // White text
                                        border: "none",
                                        width: "160px",
                                        height: "48px",
                                        borderRadius: "8px", // Slightly rounded for 3D effect
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        boxShadow:
                                            "0 4px 8px rgba(0, 0, 0, 0.2)", // 3D shadow
                                        transition: "all 0.2s ease",
                                    }}
                                    onClick={() => {
                                        if (!selectedSize) {
                                            message.warning(
                                                "Please select a size."
                                            );
                                            return;
                                        }
                                        alert(
                                            `Added to cart with size ${selectedSize}!`
                                        );
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor =
                                            "#1a1a1a"; // Slightly lighter black
                                        e.target.style.boxShadow =
                                            "0 2px 4px rgba(0, 0, 0, 0.3)"; // Reduced shadow
                                        e.target.style.transform =
                                            "translateY(2px)"; // Pressed effect
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor =
                                            "#000000";
                                        e.target.style.boxShadow =
                                            "0 4px 8px rgba(0, 0, 0, 0.2)";
                                        e.target.style.transform =
                                            "translateY(0)";
                                    }}
                                >
                                    ADD TO CART
                                </Button>
                                <Button
                                    style={{
                                        backgroundColor: "#ffffff", // White background
                                        color: "#000000", // Black text
                                        border: "2px solid #000000", // Black border for contrast
                                        width: "160px",
                                        height: "48px",
                                        borderRadius: "8px", // Slightly rounded for 3D effect
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        boxShadow:
                                            "0 4px 8px rgba(0, 0, 0, 0.2)", // 3D shadow
                                        transition: "all 0.2s ease",
                                    }}
                                    onClick={() => {
                                        if (!selectedSize) {
                                            message.warning(
                                                "Please select a size."
                                            );
                                            return;
                                        }
                                        alert(
                                            `Redirecting to checkout with size ${selectedSize}!`
                                        );
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor =
                                            "#f0f0f0"; // Light gray hover
                                        e.target.style.boxShadow =
                                            "0 2px 4px rgba(0, 0, 0, 0.3)"; // Reduced shadow
                                        e.target.style.transform =
                                            "translateY(2px)"; // Pressed effect
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor =
                                            "#ffffff";
                                        e.target.style.boxShadow =
                                            "0 4px 8px rgba(0, 0, 0, 0.2)";
                                        e.target.style.transform =
                                            "translateY(0)";
                                    }}
                                >
                                    BUY NOW
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                {/* Tabs for Details and Comments */}
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
                                        {/* Review Input */}
                                        {localStorage.getItem("token") ? (
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
                                                <a href="/login">log in</a> to
                                                leave a review.
                                            </Paragraph>
                                        )}

                                        {/* Display Reviews */}
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <Card
                                                    key={review.id}
                                                    style={{
                                                        marginBottom: "10px",
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
                                                            src={
                                                                review.user
                                                                    ?.profile
                                                                    ?.profile_image ||
                                                                null
                                                            }
                                                            icon={
                                                                <UserOutlined />
                                                            }
                                                            onError={(e) => {
                                                                console.log(
                                                                    "Failed to load review avatar for:",
                                                                    review.user
                                                                        ?.username,
                                                                    review.user
                                                                        ?.profile
                                                                        ?.profile_image,
                                                                    "Error:",
                                                                    e.target.src
                                                                );
                                                                return true;
                                                            }}
                                                            fallback="https://via.placeholder.com/40"
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
                                                            marginTop: "5px",
                                                        }}
                                                    >
                                                        {review.comment}
                                                    </Paragraph>
                                                </Card>
                                            ))
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
        </div>
    );
};

export default ProductOverview;
