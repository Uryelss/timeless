import React, { useState, useEffect } from "react";
import { Card, Table, Spin, message, Rate, Image } from "antd";
import axios from "axios";

const CustomerReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const baseUrl = "http://localhost:8000";

    const fetchReviews = async () => {
        try {
            const response = await axios.get(
                `${baseUrl}/api/admin/reviews`, // Using adminIndex endpoint
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setReviews(response.data.reviews || []); // Only active reviews
            setLoading(false);
        } catch (error) {
            message.error("Error fetching reviews");
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [token]);

    const columns = [
        {
            title: "Customer Image",
            key: "customerImage",
            render: (_, record) => (
                <Image
                    src={record.profile_image || "https://via.placeholder.com/60?text=Customer"}
                    alt="Customer"
                    preview={false}
                    style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: "50%",
                    }}
                    fallback="https://via.placeholder.com/60?text=Customer"
                />
            ),
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
            title: "Product Image",
            key: "productImage",
            render: (_, record) => (
                <Image
                    src={record.product_image || "https://via.placeholder.com/60?text=Product"}
                    alt="Product"
                    preview={false}
                    style={{ width: 60, height: 60, objectFit: "cover" }}
                    fallback="https://via.placeholder.com/60?text=Product"
                />
            ),
        },
        {
            title: "Product Name",
            dataIndex: "product_name",
            key: "productName",
            render: (text) => text || "N/A",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => <Rate disabled value={rating || 0} />,
            sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
        },
        {
            title: "Comments",
            dataIndex: "comment",
            key: "comments",
            render: (text) => text || "N/A",
        },
        {
            title: "Date Added",
            dataIndex: "created_at",
            key: "dateAdded",
            render: (date) => date ? new Date(date).toLocaleString() : "N/A",
        },
    ];

    return (
        <Card title="Customer Reviews" style={{ margin: "24px" }}>
            {loading ? (
                <Spin tip="Loading reviews..." />
            ) : (
                <Table
                    columns={columns}
                    dataSource={reviews}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            )}
        </Card>
    );
};

export default CustomerReview;