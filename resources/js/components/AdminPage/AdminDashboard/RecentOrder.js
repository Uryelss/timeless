import React, { useState, useEffect } from "react";
import { Card, Table, Spin, message } from "antd";
import axios from "axios";

// Helper function to format amounts as Philippine Peso (no decimals)
const formatPeso = (amount) =>
    "₱" +
    Number(amount).toLocaleString("en-PH", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

const RecentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/orders",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Filter out archived orders (assuming orders with non-null deleted_at are archived)
            const activeOrders = response.data.filter(
                (order) => !order.deleted_at
            );
            // Sort orders by order_date descending (most recent first)
            activeOrders.sort(
                (a, b) => new Date(b.order_date) - new Date(a.order_date)
            );
            setOrders(activeOrders);
            setLoading(false);
        } catch (error) {
            message.error("Error fetching recent orders");
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const columns = [
        {
            title: "Customer Image",
            key: "customerImage",
            render: (text, record) => {
                // Use profile_image as a full URL or fallback to placeholder
                const imageUrl =
                    record.profile && record.profile.profile_image
                        ? record.profile.profile_image
                        : "https://via.placeholder.com/60?text=Customer";
                return (
                    <img
                        src={imageUrl}
                        alt="Customer"
                        style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: "50%",
                        }}
                        onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.target.src = "https://via.placeholder.com/60?text=Customer";
                        }}
                    />
                );
            },
        },
        {
            title: "Customer Name",
            key: "customerName",
            render: (_, record) =>
                record.profile
                    ? `${record.profile.first_name} ${record.profile.last_name}`
                    : "N/A",
        },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (amount) => (amount ? formatPeso(amount) : "N/A"),
        },
        {
            title: "Payment Method",
            key: "paymentMethod",
            render: (_, record) =>
                record.shipping && record.shipping.payment_method
                    ? record.shipping.payment_method.name
                    : "N/A",
        },
        {
            title: "Order Status",
            dataIndex: "order_status",
            key: "order_status",
            render: (status) => status || "N/A",
        },
        {
            title: "Date Ordered",
            dataIndex: "order_date",
            key: "order_date",
            render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
        },
    ];

    return (
        <Card title="Recent Orders" style={{ margin: "24px" }}>
            {loading ? (
                <Spin tip="Loading recent orders..." />
            ) : (
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    pagination={false}
                />
            )}
        </Card>
    );
};

export default RecentOrders;