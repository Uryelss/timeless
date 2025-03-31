import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Table,
    Button,
    InputNumber,
    Space,
    Typography,
    message,
    Spin,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

const { Title, Text } = Typography;

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Text type="danger">
                    Something went wrong with the cart display.
                </Text>
            );
        }
        return this.props.children;
    }
}

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = "http://localhost:8000/api";

    const fetchProductData = useCallback(
        async (storedItems) => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    message.error("Please log in to view your cart.");
                    navigate("/login");
                    return;
                }

                const response = await axios.get(`${API_URL}/products/public`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000,
                });

                const products = response.data;
                const updatedItems = storedItems
                    .map((item) => {
                        const product = products.find((p) => p.id === item.id);
                        if (!product) return null;

                        const sizesArr = Array.isArray(product.sizes)
                            ? product.sizes
                            : typeof product.sizes === "string"
                            ? JSON.parse(product.sizes || "[]")
                            : [];

                        const validSize = sizesArr.some(
                            (s) => (s.size || s) === item.size
                        );
                        if (!validSize) return null;

                        return {
                            ...item,
                            id: product.id,
                            price: Number(product.price),
                            total: Number(product.price) * item.quantity,
                            image: `http://localhost:8000/storage/${product.main_image}`,
                            stock: product.stock || 0,
                        };
                    })
                    .filter(Boolean);

                setCartItems(updatedItems);
                localStorage.setItem("cart", JSON.stringify(updatedItems));
            } catch (error) {
                console.error("Error fetching product data:", error);
                message.error("Failed to validate cart items.");
                setCartItems(
                    storedItems.map((item) => ({
                        ...item,
                        total: item.price * item.quantity,
                    }))
                );
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const items = JSON.parse(storedCart);
            fetchProductData(items);
        }
    }, [fetchProductData]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const updateQuantity = useCallback((id, size, newQuantity) => {
        setCartItems((prevItems) => {
            const updatedItems = prevItems
                .map((item) => {
                    if (item.id === id && item.size === size) {
                        const quantity = Math.min(
                            Math.max(0, newQuantity),
                            item.stock || Infinity
                        ); // Allow 0
                        if (quantity === 0) {
                            message.info(
                                `${item.productName} (Size: ${item.size}) removed from cart`
                            );
                            return null; // Mark for removal
                        }
                        return {
                            ...item,
                            quantity,
                            total: quantity * item.price,
                        };
                    }
                    return item;
                })
                .filter(Boolean); // Remove null items

            return updatedItems;
        });
    }, []);

    const handleDeleteSelected = useCallback(() => {
        if (!selectedRowKeys.length) {
            message.warning("No items selected");
            return;
        }
        setCartItems((prev) =>
            prev.filter(
                (item) => !selectedRowKeys.includes(`${item.id}-${item.size}`)
            )
        );
        setSelectedRowKeys([]);
        message.success("Selected items removed");
    }, [selectedRowKeys]);

    const columns = useMemo(
        () => [
            {
                title: "Product",
                dataIndex: "image",
                key: "image",
                render: (image) => (
                    <img
                        src={image}
                        alt="product"
                        style={{ width: 80, objectFit: "cover" }}
                        onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                        }}
                    />
                ),
            },
            { title: "Name", dataIndex: "productName", key: "productName" },
            { title: "Size", dataIndex: "size", key: "size" },
            {
                title: "Price",
                dataIndex: "price",
                key: "price",
                render: (price) =>
                    `₱${price.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                    })}`,
            },
            {
                title: "Quantity",
                dataIndex: "quantity",
                key: "quantity",
                render: (quantity, record) => (
                    <Space>
                        <InputNumber
                            min={0} // Changed from 1 to 0
                            max={record.stock || undefined}
                            value={quantity}
                            onChange={(value) =>
                                updateQuantity(
                                    record.id,
                                    record.size,
                                    value || 0
                                )
                            }
                        />
                    </Space>
                ),
            },
            {
                title: "Total",
                dataIndex: "total",
                key: "total",
                render: (total) =>
                    `₱${total.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                    })}`,
            },
        ],
        [updateQuantity]
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        getCheckboxProps: (record) => ({
            name: `${record.id}-${record.size}`,
            disabled: !record.id,
        }),
    };

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.total, 0),
        [cartItems]
    );

    const handleProceedToCheckout = useCallback(() => {
        if (!selectedRowKeys.length) {
            message.warning("Please select at least one item to checkout!");
            return;
        }

        const selectedItems = cartItems.filter((item) =>
            selectedRowKeys.includes(`${item.id}-${item.size}`)
        );

        if (
            selectedItems.some(
                (item) =>
                    !item.id ||
                    item.quantity > item.stock ||
                    item.quantity === 0
            )
        ) {
            message.error(
                "Some selected items are invalid, out of stock, or have zero quantity."
            );
            return;
        }

        navigate("/user-checkout", {
            state: {
                cartItems: selectedItems,
                subtotal: selectedItems.reduce(
                    (sum, item) => sum + item.total,
                    0
                ),
            },
        });
    }, [cartItems, selectedRowKeys, navigate]);

    return (
        <ErrorBoundary>
            <Navbar />
            <div
                style={{
                    padding: "20px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <Title level={2}>Shopping Cart</Title>
                <Spin spinning={loading}>
                    <Table
                        rowKey={(record) => `${record.id}-${record.size}`}
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={cartItems}
                        styl={{ width: "100%" }}
                        pagination={false}
                        scroll={{ x: true }}
                        locale={{
                            emptyText:
                                "Your cart is empty. Start shopping now!",
                        }}
                    />
                    <Space
                        direction="vertical"
                        style={{
                            width: "100%",
                            marginTop: "20px",
                            alignItems: "inherit",
                        }}
                    >
                        <div style={{ textAlign: "right" }}>
                            <Text strong style={{ fontSize: "18px" }}>
                                Subtotal: ₱
                                {subtotal.toLocaleString("en-PH", {
                                    minimumFractionDigits: 2,
                                })}
                            </Text>
                        </div>
                        <Space
                            style={{
                                justifyContent: "flex-end",
                                width: "100%",
                            }}
                        >
                            {selectedRowKeys.length > 0 && (
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDeleteSelected}
                                    style={{ width: "179px", height: "40px" }}
                                >
                                    Remove Selected
                                </Button>
                            )}
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleProceedToCheckout}
                                disabled={!cartItems.length}
                            >
                                Proceed to Checkout
                            </Button>
                        </Space>
                    </Space>
                </Spin>
            </div>
        </ErrorBoundary>
    );
};

export default CartPage;
