import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Tag, message } from "antd";
import axios from "axios";

const OrdersAdmin = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token =
                localStorage.getItem("adminToken") || "YOUR_VALID_ADMIN_TOKEN";
            const res = await axios.get("/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (error) {
            message.error("Failed to fetch orders");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleView = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleEdit = (order) => {
        message.info("Edit functionality not implemented yet");
    };

    const handleArchive = async (orderId) => {
        try {
            await axios.post(`/api/orders/${orderId}/archive`);
            message.success("Order archived successfully");
            fetchOrders();
        } catch (error) {
            message.error("Failed to archive order");
        }
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (text, record) => (
                <Space>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button onClick={() => handleArchive(record.id)}>
                        Archive
                    </Button>
                    <Button onClick={() => handleView(record)}>View</Button>
                </Space>
            ),
        },
        {
            title: "Profile Name",
            dataIndex: "profile_name",
            key: "profile_name",
        },
        {
            title: "Items",
            dataIndex: "items",
            key: "items",
            render: (items) =>
                items.map((item, idx) => (
                    <div key={idx}>
                        {item.productName} (Qty: {item.quantity})
                    </div>
                )),
        },
        {
            title: "Priority",
            dataIndex: "shipping_priority",
            key: "shipping_priority",
            render: (priority) => (
                <Tag color={priority === "expedited" ? "red" : "blue"}>
                    {priority.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "gray";
                if (status === "completed") color = "green";
                else if (status === "pending") color = "orange";
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (amount) => <>₱{Number(amount).toLocaleString()}</>,
        },
        {
            title: "Order Date",
            dataIndex: "order_date",
            key: "order_date",
            render: (date) => new Date(date).toLocaleString(),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Admin Orders</h2>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title="Order Details"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                {selectedOrder && (
                    <div>
                        <p>
                            <strong>Order ID:</strong> {selectedOrder.id}
                        </p>
                        <p>
                            <strong>Profile Name:</strong>{" "}
                            {selectedOrder.profile_name}
                        </p>
                        <p>
                            <strong>Total Amount:</strong> ₱
                            {Number(
                                selectedOrder.total_amount
                            ).toLocaleString()}
                        </p>
                        <p>
                            <strong>Status:</strong> {selectedOrder.status}
                        </p>
                        <p>
                            <strong>Shipping Priority:</strong>{" "}
                            {selectedOrder.shipping_priority}
                        </p>
                        <p>
                            <strong>Order Date:</strong>{" "}
                            {new Date(
                                selectedOrder.order_date
                            ).toLocaleString()}
                        </p>
                        <div>
                            <strong>Items:</strong>
                            {selectedOrder.items.map((item, index) => (
                                <div key={index}>
                                    {item.productName} - Qty: {item.quantity}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrdersAdmin;
