import React, { useState, useEffect } from "react";
import { Card, Table, Spin, message, Rate } from "antd";
import axios from "axios";

const CustomerReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Fetch reviews from API and extract reviews array
    const fetchReviews = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/admin/reviews",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Response is expected to be an object with a "reviews" key
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
                // Since your API doesn't return a nested profile with an image, we use a placeholder.
                return (
                    <img
                        src="https://via.placeholder.com/60?text=Customer"
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
            // Use the "username" field from your API response
            render: (text, record) => record.username || "N/A",
        },
        {
            title: "Product Image",
            key: "productImage",
            render: (text, record) => {
                // Ensure the product_image URL is correctly built.
                // If the URL already starts with "http", use it; otherwise, prepend your API host.
                const productImage = record.product_image;
                const imageUrl = productImage.startsWith("http")
                    ? productImage
                    : `http://localhost:8000${productImage}`;
                return (
                    <img
                        src={imageUrl}
                        alt="Product"
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                    />
                );
            },
        },
        {
            title: "Product Name",
            key: "productName",
            render: (text, record) => record.product_name || "N/A",
        },
        {
            title: "Rating",
            key: "rating",
            render: (text, record) => (
                <Rate disabled defaultValue={record.rating || 0} />
            ),
            sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
        },
        {
            title: "Comments",
            key: "comments",
            render: (text, record) => record.review || "N/A",
        },
        {
            title: "Date Added",
            key: "dateAdded",
            render: (text, record) =>
                record.date_added
                    ? new Date(record.date_added).toLocaleString()
                    : "N/A",
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
