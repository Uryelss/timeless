import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Space, Typography, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

const { Title } = Typography;

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const API_URL = "http://localhost:8000/api";

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const items = JSON.parse(storedCart);
            fetchProductData(items);
        }
    }, []);

    const fetchProductData = async (storedItems) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Please log in to view your cart.");
                navigate("/login");
                return;
            }

            const response = await axios.get(`${API_URL}/products/public`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const products = response.data;

            const updatedItems = storedItems
                .map((item) => {
                    const product = products.find((p) => p.id === item.id);
                    if (!product) {
                        message.warning(
                            `Product ${item.productName} is no longer available.`
                        );
                        return null;
                    }
                    return {
                        ...item,
                        id: product.id,
                        inventory_id: item.inventory_id, // Preserve from cart
                        price: product.price,
                        total: product.price * item.quantity,
                        image: `http://localhost:8000/storage/${product.main_image}`,
                    };
                })
                .filter(Boolean);

            setCartItems(updatedItems);
            localStorage.setItem("cart", JSON.stringify(updatedItems));
        } catch (error) {
            console.error("Error fetching product data:", error);
            message.error("Failed to validate cart items. Using stored data.");
            const updatedItems = storedItems.map((item) => ({
                ...item,
                total: item.price * item.quantity,
            }));
            setCartItems(updatedItems);
        }
    };

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const updateQuantity = (id, size, newQuantity) => {
        const updated = cartItems.map((item) =>
            item.id === id && item.size === size
                ? {
                      ...item,
                      quantity: newQuantity,
                      total: newQuantity * item.price,
                  }
                : item
        );
        setCartItems(updated);
    };

    const handleDeleteSelected = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("No items selected");
            return;
        }
        const remaining = cartItems.filter(
            (item) => !selectedRowKeys.includes(`${item.id}-${item.size}`)
        );
        setCartItems(remaining);
        setSelectedRowKeys([]);
        message.success("Selected items removed");
    };

    const columns = [
        {
            title: "Product",
            dataIndex: "image",
            key: "image",
            render: (image) => (
                <img src={image} alt="product" style={{ width: 80 }} />
            ),
        },
        {
            title: "Name",
            dataIndex: "productName",
            key: "productName",
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `₱${price.toLocaleString()}`,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity, record) => (
                <Space>
                    <Button
                        onClick={() =>
                            updateQuantity(
                                record.id,
                                record.size,
                                Math.max(1, record.quantity - 1)
                            )
                        }
                    >
                        -
                    </Button>
                    <InputNumber
                        min={1}
                        value={quantity}
                        onChange={(value) =>
                            updateQuantity(record.id, record.size, value)
                        }
                    />
                    <Button
                        onClick={() =>
                            updateQuantity(
                                record.id,
                                record.size,
                                record.quantity + 1
                            )
                        }
                    >
                        +
                    </Button>
                </Space>
            ),
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => `₱${total.toLocaleString()}`,
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        getCheckboxProps: (record) => ({
            name: `${record.id}-${record.size}`, // Unique key per product and size
        }),
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

    const handleProceedToCheckout = () => {
        if (!cartItems.length) {
            message.warning("Your cart is empty!");
            return;
        }
        const invalidItems = cartItems.some(
            (item) => !item.id || !item.inventory_id
        );
        if (invalidItems) {
            message.error(
                "Some cart items are invalid. Please refresh or re-add items."
            );
            return;
        }
        navigate("/user-checkout", { state: { cartItems, subtotal } });
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <Title level={2}>Cart</Title>
                <Table
                    rowKey={(record) => `${record.id}-${record.size}`} // Unique key per product and size
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={cartItems}
                    pagination={false}
                />
                <div
                    style={{
                        marginTop: "20px",
                        textAlign: "right",
                        fontSize: "18px",
                    }}
                >
                    Subtotal: <strong>₱{subtotal.toLocaleString()}</strong>
                </div>
                {selectedRowKeys.length > 0 && (
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteSelected}
                        style={{ marginTop: "10px" }}
                    >
                        Remove Selected
                    </Button>
                )}
                <div style={{ marginTop: "20px", textAlign: "right" }}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleProceedToCheckout}
                    >
                        Proceed to Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
