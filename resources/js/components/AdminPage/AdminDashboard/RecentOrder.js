import React, { useState, useEffect } from "react";
import { Card, Table, Spin, message, Image } from "antd";
import axios from "axios";

const formatPeso = (amount) =>
    "₱" +
    Number(amount || 0).toLocaleString("en-PH", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

const RecentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const baseUrl = "http://localhost:8000";

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("API Response:", response.data); // Debug the response
            const activeOrders = Array.isArray(response.data)
                ? response.data.filter((order) => !order.deleted_at)
                : [];
            activeOrders.sort(
                (a, b) => new Date(b.order_date) - new Date(a.order_date)
            );
            setOrders(activeOrders);
            setLoading(false);
        } catch (error) {
            message.error("Error fetching recent orders");
            console.error("Error:", error.response?.data || error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const getImageUrl = (profileImage) => {
        if (!profileImage)
            return "https://via.placeholder.com/60?text=Customer";
        return profileImage.startsWith("http")
            ? profileImage
            : profileImage.startsWith("/storage")
            ? `${baseUrl}${profileImage}`
            : `${baseUrl}/storage/${profileImage}`;
    };

    const columns = [
        {
            title: "Customer Image",
            key: "customerImage",
            render: (_, record) => (
                <Image
                    src={getImageUrl(record.profile?.profile_image)}
                    alt="Customer"
                    preview={false}
                    style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: "50%",
                    }}
                    fallback="https://via.placeholder.com/60?text=Customer"
                    onError={() =>
                        console.log("Image load failed for:", record)
                    }
                />
            ),
        },
        {
            title: "Customer Name",
            key: "customerName",
            render: (_, record) =>
                record.profile?.first_name
                    ? `${record.profile.first_name} ${
                          record.profile.last_name || ""
                      }`.trim()
                    : "N/A",
        },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (amount) => formatPeso(amount),
        },
        {
            title: "Payment Method",
            key: "paymentMethod",
            render: (_, record) =>
                record.shipping?.payment_method?.name || "N/A",
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
