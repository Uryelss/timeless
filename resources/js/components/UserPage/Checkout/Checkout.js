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
    Spin,
} from "antd";
import axios from "axios";
import Navbar from "../Navbar/Navbar";

const { Option } = Select;

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, subtotal } = location.state || {
        cartItems: [],
        subtotal: 0,
    };

    const [form] = Form.useForm();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [shippingMethods, setShippingMethods] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [shippingMethod, setShippingMethod] = useState(null);
    const [saveInfo, setSaveInfo] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [loading, setLoading] = useState(false);

    const API_URL = "http://localhost:8000/api";
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                message.error("You need to log in to proceed with checkout!");
                navigate("/login");
                return;
            }

            setLoading(true);
            try {
                const [paymentRes, shippingRes, profileRes] = await Promise.all([
                    axios.get(`${API_URL}/payment-methods`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_URL}/shipping-methods`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_URL}/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setPaymentMethods(paymentRes.data);
                setShippingMethods(shippingRes.data);
                setAddresses(profileRes.data.addresses || []);
            } catch (error) {
                message.error("Failed to load checkout data");
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        if (!cartItems.length) {
            message.warning("No items in cart. Redirecting to cart...");
            navigate("/user-cart");
        }
    }, [cartItems, navigate, token]);

    useEffect(() => {
        const selectedMethod = shippingMethods.find(
            (m) => m.id === shippingMethod
        );
        setShippingCost(selectedMethod ? parseFloat(selectedMethod.cost) : 0);
    }, [shippingMethod, shippingMethods]);

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
        if (!token) {
            message.error("Authentication token missing!");
            navigate("/login");
            return;
        }

        setLoading(true);
        const orderData = {
            ...(selectedAddressId
                ? { address_id: selectedAddressId }
                : {
                      address: {
                          street: values.streetAddress,
                          city: values.city,
                          state: values.province,
                          postal_code: values.postalCode,
                          country: values.country,
                          phone: values.phone,
                      },
                  }),
            cart_items: cartItems.map((item) => ({
                id: item.id,
                inventory_id: item.inventory_id,
                quantity: item.quantity,
                price: item.price,
            })),
            subtotal,
            shipping_cost: shippingCost,
            total,
            payment_method_id: paymentMethod,
            shipping_method_id: shippingMethod,
        };

        try {
            const response = await axios.post(
                `${API_URL}/orders/create`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                message.success("Order placed successfully!");
                localStorage.removeItem("cart");
                window.dispatchEvent(new Event("cartUpdated"));
                const { order_id } = response.data;

                // Redirect to OrderTracking page with order details
                navigate("/order-tracking", {
                    state: {
                        orderId: order_id,
                        total,
                        shippingMethod: shippingMethods.find(m => m.id === shippingMethod)?.name,
                        cartItems,
                    },
                });
            }
        } catch (error) {
            console.error(
                "Order submission error:",
                error.response?.data || error
            );
            message.error(
                error.response?.data?.message || "Failed to place order."
            );
        } finally {
            setLoading(false);
        }
    };

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
                {loading && (
                    <Spin
                        tip="Loading..."
                        style={{ display: "block", textAlign: "center" }}
                    />
                )}
                <Row gutter={16}>
                    <Col xs={24} md={16}>
                        <Card
                            title="ADDRESS DETAILS"
                            style={{ marginBottom: "20px" }}
                        >
                            {addresses.length > 0 && (
                                <Select
                                    style={{ width: "100%", marginBottom: 16 }}
                                    placeholder="Select an existing address"
                                    onChange={(value) => {
                                        setSelectedAddressId(value);
                                        form.resetFields();
                                    }}
                                    allowClear
                                >
                                    {addresses.map((addr) => (
                                        <Option key={addr.id} value={addr.id}>
                                            {`${addr.street}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country} - ${addr.phone}`}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                            {!selectedAddressId && (
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    initialValues={{ country: "Philippines" }}
                                >
                                    <Form.Item
                                        label="Country/Region"
                                        name="country"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please select your country!",
                                            },
                                        ]}
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
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your street address!",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Barangay"
                                        name="barangay"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your barangay!",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Province"
                                        name="province"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your province!",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="City"
                                        name="city"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your city!",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Postal Code"
                                        name="postalCode"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your postal code!",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Phone"
                                        name="phone"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please enter your phone number!",
                                            },
                                        ]}
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
                            )}
                        </Card>
                        <Card
                            title="PAYMENT METHOD"
                            style={{ marginBottom: "20px" }}
                        >
                            <Radio.Group
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                value={paymentMethod}
                            >
                                {paymentMethods.map((method) => (
                                    <Radio key={method.id} value={method.id}>
                                        {method.name}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </Card>
                        <Card
                            title="SHIPPING METHOD"
                            style={{ marginBottom: "20px" }}
                        >
                            <Radio.Group
                                onChange={(e) => setShippingMethod(e.target.value)}
                                value={shippingMethod}
                            >
                                {shippingMethods.map((method) => (
                                    <Radio key={method.id} value={method.id}>
                                        {method.name} - ₱
                                        {parseFloat(method.cost).toLocaleString()}
                                    </Radio>
                                ))}
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
                            onClick={() => form.submit()}
                            loading={loading}
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
                                            {(item.price * item.quantity).toLocaleString()}
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
                                <p>Shipping: ₱{shippingCost.toLocaleString()}</p>
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