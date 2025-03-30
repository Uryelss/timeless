import React, { useState, useEffect } from "react";
import { Card, Table, Spin, message, Rate } from "antd";
import axios from "axios";

const CustomerReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Fetch reviews from the API
    const fetchReviews = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/admin/reviews",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Extract the reviews array from the returned object
            setReviews(response.data.reviews || []);
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
            render: (text, record) => {
                const profileImage = record.profile
                    ? record.profile.profile_image
                    : null;
                return (
                    <img
                        src={
                            profileImage
                                ? `http://localhost:8000/storage/${profileImage}`
                                : "https://via.placeholder.com/60?text=Customer"
                        }
                        alt="Customer"
                        style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: "50%",
                        }}
                    />
                );
            },
        },
        {
            title: "Customer Name",
            key: "customerName",
            render: (text, record) =>
                record.profile
                    ? `${record.profile.first_name} ${record.profile.last_name}`
                    : "N/A",
        },
        {
            title: "Product Image",
            key: "productImage",
            render: (text, record) => {
                const productImage = record.product
                    ? record.product.main_image
                    : null;
                return (
                    <img
                        src={
                            productImage
                                ? `http://localhost:8000/storage/${productImage}`
                                : "https://via.placeholder.com/60?text=Product"
                        }
                        alt="Product"
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                    />
                );
            },
        },
        {
            title: "Product Name",
            key: "productName",
            render: (text, record) =>
                record.product ? record.product.product_name : "N/A",
        },
        {
            title: "Rating",
            key: "rating",
            render: (text, record) => (
                <Rate disabled defaultValue={record.rating} />
            ),
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: "Comments",
            dataIndex: "comments",
            key: "comments",
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
                    pagination={false}
                />
            )}
        </Card>
    );
};

export default CustomerReview;
