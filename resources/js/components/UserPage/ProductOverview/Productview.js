import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "antd";
import Navbar from "../Navbar/Navbar";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductOverview = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [currentMainImage, setCurrentMainImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null); // state for selected size

    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/products/${id}`)
            .then((res) => {
                const fetchedProduct = res.data.product
                    ? res.data.product
                    : res.data;
                setProduct(fetchedProduct);
                setCurrentMainImage(fetchedProduct.main_image);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching product details", err);
                setLoading(false);
                message.error("Error fetching product details.");
            });
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const number_format = (number) => {
        return Number(number)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Parse sizes dynamically from product data, fallback to ["22mm"]
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

                    {/* Right Column: Product Details */}
                    <Col xs={24} md={12}>
                        <Card bodyStyle={{ padding: "16px" }}>
                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ textAlign: "center" }}
                            >
                                <Title level={3}>{product.product_name}</Title>
                                <div>
                                    <Rate disabled value={4} />
                                </div>
                                <Paragraph strong>Price</Paragraph>
                                <Paragraph strong>
                                    ₱{number_format(product.price)}
                                </Paragraph>
                                {sizes && sizes.length > 0 && (
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
                                            }}
                                        >
                                            {sizes.map((size, index) => (
                                                <Button
                                                    key={index}
                                                    onClick={() =>
                                                        setSelectedSize(size)
                                                    }
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "4px", // Rectangular buttons
                                                        backgroundColor:
                                                            selectedSize ===
                                                            size
                                                                ? "black"
                                                                : "white",
                                                        color:
                                                            selectedSize ===
                                                            size
                                                                ? "white"
                                                                : "black",
                                                        border: "1px solid gray",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {size}
                                                </Button>
                                            ))}
                                        </div>
                                        {selectedSize && (
                                            <div style={{ marginTop: "8px" }}>
                                                Selected Size:{" "}
                                                <strong>{selectedSize}</strong>
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
                                    backgroundColor: "#28A745", // Green color for Add to Cart
                                    color: "white",
                                    border: "none",
                                    width: "150px",
                                    height: "40px",
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
                            >
                                BUY NOW
                            </Button>
                        </Space>
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
                                        <Paragraph>No comments yet.</Paragraph>
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
