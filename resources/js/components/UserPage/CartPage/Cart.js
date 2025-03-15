import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Space, Typography, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const { Title } = Typography;

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Load cart items from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const items = JSON.parse(storedCart);
            // Calculate total for each item
            const updatedItems = items.map((item) => ({
                ...item,
                total: item.price * item.quantity,
            }));
            setCartItems(updatedItems);
        }
    }, []);

    // Update localStorage whenever cartItems change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const updateQuantity = (id, newQuantity) => {
        const updated = cartItems.map((item) =>
            item.id === id
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
            (item) => !selectedRowKeys.includes(item.id)
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
            render: (price) => `$${price}`,
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
                                Math.max(1, record.quantity - 1)
                            )
                        }
                    >
                        -
                    </Button>
                    <InputNumber
                        min={1}
                        value={quantity}
                        onChange={(value) => updateQuantity(record.id, value)}
                    />
                    <Button
                        onClick={() =>
                            updateQuantity(record.id, record.quantity + 1)
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
            render: (total) => `$${total.toFixed(2)}`,
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

    return (
        <div>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <Title level={2}>Cart</Title>
                <Table
                    rowKey="id"
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
                    Subtotal: <strong>${subtotal.toFixed(2)}</strong>
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
                    {/* Navigate to the defined checkout route */}
                    <Button
                        type="primary"
                        size="large"
                        onClick={() =>
                            navigate("/user-checkout", {
                                state: { cartItems, subtotal },
                            })
                        }
                    >
                        Proceed to Payment
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
