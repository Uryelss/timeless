import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Form,
    Input,
    Select,
    Button,
    Checkbox,
    Radio,
    message,
    Row,
    Col,
    Card,
    Image,
} from "antd";
import Navbar from "../Navbar/Navbar";

const { Option } = Select;

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, subtotal } = location.state || {
        cartItems: [],
        subtotal: 0,
    };

    const [paymentMethod, setPaymentMethod] = useState("");
    const [shippingMethod, setShippingMethod] = useState("");
    const [saveInfo, setSaveInfo] = useState(false);

    const shippingCosts = { standard: 75, expedited: 150 };
    const shippingCost = shippingMethod
        ? shippingCosts[shippingMethod] || 0
        : 0;
    const total = subtotal + shippingCost;

    const onFinish = async (values) => {
        if (!paymentMethod) {
            message.warning("Please select a payment method!");
            return;
        }
        if (!shippingMethod) {
            message.warning("Please select a shipping method!");
            return;
        }

        const token = localStorage.getItem("token");
        console.log("Token being sent:", token); // Debug token
        if (!token) {
            message.error("You need to log in to place an order!");
            navigate("/login");
            return;
        }

        const orderData = {
            address: {
                country: values.country,
                streetAddress: values.streetAddress,
                barangay: values.barangay,
                province: values.province,
                city: values.city,
                postalCode: values.postalCode,
                phone: values.phone,
            },
            cartItems,
            subtotal,
            shippingCost,
            total,
            paymentMethod,
            shippingMethod,
            userId: 2, // Replace with Auth.user.id if available
        };

        try {
            const response = await fetch(
                "http://localhost:8000/api/orders/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(orderData),
                }
            );

            const data = await response.json();
            console.log("Response:", data); // Debug response
            if (response.ok) {
                message.success("Order placed successfully!");
                localStorage.removeItem("cart");
                if (
                    paymentMethod === "creditCard" ||
                    paymentMethod === "digitalWallet"
                ) {
                    navigate("/payment", {
                        state: { orderId: data.orderId, total },
                    });
                } else {
                    navigate("/order-confirmation", {
                        state: { orderId: data.orderId },
                    });
                }
            } else {
                message.error(data.message || "Failed to place order.");
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            message.warning("No items in cart. Redirecting to cart...");
            navigate("/user-cart");
        }
    }, [cartItems, navigate]);

    return (
        <div>
            <Navbar />
            <div
                style={{
                    padding: "20px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
                    CHECKOUT
                </h1>
                <Row gutter={16}>
                    <Col xs={24} md={16}>
                        <Card
                            title="ADDRESS DETAILS"
                            style={{ marginBottom: "20px" }}
                        >
                            <Form
                                layout="vertical"
                                onFinish={onFinish}
                                initialValues={{ country: "Philippines" }}
                            >
                                <Form.Item
                                    label="Country/Region"
                                    name="country"
                                    rules={[{ required: true }]}
                                >
                                    <Select>
                                        <Option value="Philippines">
                                            Philippines
                                        </Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Street Address"
                                    name="streetAddress"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Barangay"
                                    name="barangay"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Province"
                                    name="province"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="City"
                                    name="city"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Postal Code"
                                    name="postalCode"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Phone"
                                    name="phone"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item>
                                    <Checkbox
                                        checked={saveInfo}
                                        onChange={(e) =>
                                            setSaveInfo(e.target.checked)
                                        }
                                    >
                                        Save this information for next time
                                    </Checkbox>
                                </Form.Item>
                            </Form>
                        </Card>
                        <Card
                            title="PAYMENT METHOD"
                            style={{ marginBottom: "20px" }}
                        >
                            <Radio.Group
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                                value={paymentMethod}
                            >
                                <Radio value="cod">Cash on Delivery</Radio>
                                <Radio value="creditCard">Credit Card</Radio>
                                <Radio value="digitalWallet">
                                    Digital Wallet
                                </Radio>
                            </Radio.Group>
                        </Card>
                        <Card
                            title="SHIPPING METHOD"
                            style={{ marginBottom: "20px" }}
                        >
                            <Radio.Group
                                onChange={(e) =>
                                    setShippingMethod(e.target.value)
                                }
                                value={shippingMethod}
                            >
                                <Radio value="standard">
                                    Standard Shipping (5-7 days) - ₱75.00
                                </Radio>
                                <Radio value="expedited">
                                    Expedited Shipping (3-5 days) - ₱150.00
                                </Radio>
                            </Radio.Group>
                        </Card>
                        <Button
                            type="primary"
                            style={{
                                backgroundColor: "#00A65A",
                                borderColor: "#00A65A",
                                width: "100%",
                                height: "40px",
                            }}
                            onClick={() =>
                                document
                                    .querySelector("form")
                                    .dispatchEvent(
                                        new Event("submit", {
                                            cancelable: true,
                                            bubbles: true,
                                        })
                                    )
                            }
                        >
                            COMPLETE ORDER
                        </Button>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card title="ORDER SUMMARY">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: "flex",
                                        marginBottom: "20px",
                                        alignItems: "center",
                                    }}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.productName}
                                        style={{
                                            width: "80px",
                                            marginRight: "10px",
                                        }}
                                        preview={false}
                                    />
                                    <div>
                                        <p style={{ margin: 0 }}>
                                            {item.productName}
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "12px",
                                            }}
                                        >
                                            {item.size}
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            Quantity: {item.quantity}
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            Total: ₱
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div
                                style={{
                                    borderTop: "1px solid #e8e8e8",
                                    paddingTop: "10px",
                                    textAlign: "right",
                                }}
                            >
                                <p>Subtotal: ₱{subtotal.toLocaleString()}</p>
                                <p>
                                    Shipping: ₱{shippingCost.toLocaleString()}
                                </p>
                                <h3>Total: ₱{total.toLocaleString()}</h3>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CheckoutPage;
